import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateTaskInput = {
  space?: string;
  workType?: string;
  status?: string;
  summary: string;
  description?: string;
  assignee?: string;
  reporter?: string;
  priority?: string;
  labels?: string;
  dueDate?: string;
  startDate?: string;
  category?: string;
  team?: string;
  subtasks?: unknown;
  userId: number;
  createdBy: number;
  updatedBy: number;
};

type UpdateTaskInput = {
  space?: string;
  workType?: string;
  status?: string;
  summary?: string;
  description?: string;
  assignee?: string;
  reporter?: string;
  priority?: string;
  labels?: string;
  dueDate?: string;
  startDate?: string;
  category?: string;
  team?: string;
  subtasks?: unknown;
  updatedBy?: number;
};

type SubtaskPayload = {
  id: number;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  status: 'To do' | 'In progress' | 'Done';
};

const toDateOrNull = (value?: string) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnly.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    if (!year || !month || !day) {
      return null;
    }
    const utc = Date.UTC(year, month - 1, day);
    return new Date(utc);
  }
  const parsed = Date.parse(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  const date = new Date(parsed);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }
  if (date.getUTCFullYear() < 1970 || date.getUTCFullYear() > 2100) {
    return null;
  }
  return date;
};

const normalizeSubtasks = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const normalized: SubtaskPayload[] = [];
  value.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const record = item as Record<string, unknown>;
    const title =
      typeof record.title === 'string' ? record.title.trim() : '';
    if (!title) {
      return;
    }
    let id = index + 1;
    if (typeof record.id === 'number' && Number.isFinite(record.id)) {
      id = record.id;
    } else if (typeof record.id === 'string') {
      const parsed = Number(record.id);
      if (Number.isFinite(parsed)) {
        id = parsed;
      }
    }
    const priority =
      record.priority === 'High' ||
      record.priority === 'Low' ||
      record.priority === 'Medium'
        ? record.priority
        : 'Medium';
    const status =
      record.status === 'In progress' ||
      record.status === 'Done' ||
      record.status === 'To do'
        ? record.status
        : 'To do';
    const assignee =
      typeof record.assignee === 'string' && record.assignee.trim()
        ? record.assignee.trim()
        : 'Unassigned';
    normalized.push({
      id,
      title,
      priority,
      assignee,
      status,
    });
  });
  return normalized;
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateTaskInput) {
    if (!input.summary?.trim()) {
      throw new BadRequestException('Summary is required.');
    }

    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    const key = `TASK-${stamp}-${rand}`.toUpperCase();
    const slug = key;
    const subtasks = normalizeSubtasks(input.subtasks);

    const task = await this.prisma.task.create({
      data: {
        key,
        slug,
        space: input.space?.trim() || null,
        workType: input.workType?.trim() || null,
        status: input.status?.trim() || 'To do',
        summary: input.summary.trim(),
        description: input.description?.trim() || null,
        assignee: input.assignee?.trim() || null,
        reporter: input.reporter?.trim() || null,
        priority: input.priority?.trim() || null,
        labels: input.labels?.trim() || null,
        dueDate: toDateOrNull(input.dueDate),
        startDate: toDateOrNull(input.startDate),
        category: input.category?.trim() || null,
        team: input.team?.trim() || null,
        subtasks:
          subtasks === undefined
            ? undefined
            : subtasks === null
              ? Prisma.DbNull
              : subtasks,
        userId: input.userId,
        createdBy: input.createdBy,
        updatedBy: input.updatedBy,
      },
    });

    return task;
  }

  async updateByKey(key: string, input: UpdateTaskInput) {
    if (!key) {
      throw new BadRequestException('Key is required.');
    }

    if (input.summary !== undefined && !input.summary.trim()) {
      throw new BadRequestException('Summary is required.');
    }

    const data: Record<string, unknown> = {};

    const setOptionalString = (key: string, value?: string) => {
      if (value === undefined) {
        return;
      }
      const trimmed = value.trim();
      data[key] = trimmed ? trimmed : null;
    };

    if (input.summary !== undefined) {
      data.summary = input.summary.trim();
    }

    if (input.status !== undefined) {
      const trimmed = input.status.trim();
      data.status = trimmed || 'To do';
    }

    setOptionalString('space', input.space);
    setOptionalString('workType', input.workType);
    setOptionalString('description', input.description);
    setOptionalString('assignee', input.assignee);
    setOptionalString('reporter', input.reporter);
    setOptionalString('priority', input.priority);
    setOptionalString('labels', input.labels);
    setOptionalString('category', input.category);
    setOptionalString('team', input.team);

    if (input.dueDate !== undefined) {
      data.dueDate = toDateOrNull(input.dueDate);
    }
    if (input.startDate !== undefined) {
      data.startDate = toDateOrNull(input.startDate);
    }
    if (input.updatedBy !== undefined) {
      data.updatedBy = input.updatedBy;
    }

    const subtasks = normalizeSubtasks(input.subtasks);
    if (subtasks !== undefined) {
      data.subtasks = subtasks === null ? Prisma.DbNull : subtasks;
    }

    return this.prisma.task.update({
      where: { key },
      data,
    });
  }

  async deleteByKey(key: string) {
    if (!key) {
      throw new BadRequestException('Key is required.');
    }

    await this.prisma.task.delete({ where: { key } });
  }

  async findAll() {
    return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findPaged(params: {
    page: number;
    limit: number;
    sort: 'createdAt' | 'updatedAt' | 'priority' | 'status';
    order: 'asc' | 'desc';
    search?: string;
    status?: string;
    space?: string;
    userId?: number;
  }) {
    const search = params.search?.trim();
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { key: { contains: search } },
        { summary: { contains: search } },
        { assignee: { contains: search } },
        { reporter: { contains: search } },
        { labels: { contains: search } },
      ];
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.space) {
      where.space = { contains: params.space };
    }
    if (params.userId) {
      const spaces = await this.prisma.space.findMany({
        where: {
          OR: [
            { userId: params.userId },
            { members: { some: { userId: params.userId } } },
          ],
        },
        select: { key: true },
      });
      const spaceKeys = spaces.map((space) => space.key);
      if (!spaceKeys.length) {
        return { tasks: [], total: 0 };
      }
      const accessOr = spaceKeys.map((key) => ({ space: { contains: key } }));
      const existingAnd = Array.isArray(where.AND)
        ? (where.AND as Record<string, unknown>[])
        : [];
      where.AND = [...existingAnd, { OR: accessOr }];
    }
    const skip = (params.page - 1) * params.limit;
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        orderBy: { [params.sort]: params.order },
        where: Object.keys(where).length ? where : undefined,
        skip,
        take: params.limit,
      }),
      this.prisma.task.count({
        where: Object.keys(where).length ? where : undefined,
      }),
    ]);
    return { tasks, total };
  }

  async findByKeyOrSlug(value: string) {
    if (!value) {
      return null;
    }
    const byKey = await this.prisma.task.findUnique({ where: { key: value } });
    if (byKey) {
      return byKey;
    }
    return this.prisma.task.findUnique({ where: { slug: value } });
  }
}
