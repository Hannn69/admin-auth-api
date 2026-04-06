import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateSpaceInput = {
  name: string;
  key: string;
  type?: string;
  app?: string;
  managed?: string;
  access?: string;
  lead?: string;
  category?: string;
  owner?: string;
  defaultAssignee?: string;
  userId: number;
  createdBy: number;
  updatedBy: number;
};

type UpdateSpaceInput = {
  name?: string;
  key?: string;
  type?: string;
  app?: string;
  managed?: string;
  access?: string;
  lead?: string;
  category?: string;
  owner?: string;
  defaultAssignee?: string;
  updatedBy?: number;
};

const normalizeKey = (value: string) => value.trim().toUpperCase();

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSpaceInput) {
    if (!input.name?.trim()) {
      throw new BadRequestException('Name is required.');
    }
    if (!input.key?.trim()) {
      throw new BadRequestException('Key is required.');
    }

    const key = normalizeKey(input.key);
    const slug = slugify(input.name) || key.toLowerCase();

    return this.prisma.space.create({
      data: {
        name: input.name.trim(),
        key,
        slug,
        type: input.type?.trim() || null,
        app: input.app?.trim() || null,
        managed: input.managed?.trim() || null,
        access: input.access?.trim() || null,
        lead: input.lead?.trim() || null,
        category: input.category?.trim() || null,
        owner: input.owner?.trim() || null,
        defaultAssignee: input.defaultAssignee?.trim() || null,
        userId: input.userId,
        createdBy: input.createdBy,
        updatedBy: input.updatedBy,
      },
    });
  }

  async updateById(id: number, input: UpdateSpaceInput) {
    if (!id) {
      throw new BadRequestException('Space id is required.');
    }

    const data: Record<string, unknown> = {};
    const setOptionalString = (key: string, value?: string) => {
      if (value === undefined) {
        return;
      }
      const trimmed = value.trim();
      data[key] = trimmed ? trimmed : null;
    };

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new BadRequestException('Name is required.');
      }
      data.name = input.name.trim();
      const nextSlug = slugify(input.name);
      if (nextSlug) {
        data.slug = nextSlug;
      }
    }

    if (input.key !== undefined) {
      const trimmed = input.key.trim();
      if (!trimmed) {
        throw new BadRequestException('Key is required.');
      }
      data.key = normalizeKey(trimmed);
    }

    setOptionalString('type', input.type);
    setOptionalString('app', input.app);
    setOptionalString('managed', input.managed);
    setOptionalString('access', input.access);
    setOptionalString('lead', input.lead);
    setOptionalString('category', input.category);
    setOptionalString('owner', input.owner);
    setOptionalString('defaultAssignee', input.defaultAssignee);

    if (input.updatedBy !== undefined) {
      data.updatedBy = input.updatedBy;
    }

    return this.prisma.space.update({
      where: { id },
      data,
    });
  }

  async updateBySlug(slug: string, input: UpdateSpaceInput) {
    if (!slug) {
      throw new BadRequestException('Space slug is required.');
    }

    const data: Record<string, unknown> = {};
    const setOptionalString = (key: string, value?: string) => {
      if (value === undefined) {
        return;
      }
      const trimmed = value.trim();
      data[key] = trimmed ? trimmed : null;
    };

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new BadRequestException('Name is required.');
      }
      data.name = input.name.trim();
      const nextSlug = slugify(input.name);
      if (nextSlug) {
        data.slug = nextSlug;
      }
    }

    if (input.key !== undefined) {
      const trimmed = input.key.trim();
      if (!trimmed) {
        throw new BadRequestException('Key is required.');
      }
      data.key = normalizeKey(trimmed);
    }

    setOptionalString('type', input.type);
    setOptionalString('app', input.app);
    setOptionalString('managed', input.managed);
    setOptionalString('access', input.access);
    setOptionalString('lead', input.lead);
    setOptionalString('category', input.category);
    setOptionalString('owner', input.owner);
    setOptionalString('defaultAssignee', input.defaultAssignee);

    if (input.updatedBy !== undefined) {
      data.updatedBy = input.updatedBy;
    }

    return this.prisma.space.update({
      where: { slug },
      data,
    });
  }

  async deleteById(id: number) {
    if (!id) {
      throw new BadRequestException('Space id is required.');
    }
    await this.prisma.space.delete({ where: { id } });
  }

  async deleteBySlug(slug: string) {
    if (!slug) {
      throw new BadRequestException('Space slug is required.');
    }
    await this.prisma.space.delete({ where: { slug } });
  }

  async findPaged(params: {
    page: number;
    limit: number;
    sort: 'createdAt' | 'updatedAt' | 'name' | 'key';
    order: 'asc' | 'desc';
    search?: string;
    app?: string;
    managed?: string;
  }) {
    const search = params.search?.trim();
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { key: { contains: search } },
        { lead: { contains: search } },
        { type: { contains: search } },
      ];
    }

    if (params.app) {
      where.app = params.app;
    }
    if (params.managed) {
      where.managed = params.managed;
    }

    const skip = (params.page - 1) * params.limit;
    const [spaces, total] = await Promise.all([
      this.prisma.space.findMany({
        orderBy: { [params.sort]: params.order },
        where: Object.keys(where).length ? where : undefined,
        skip,
        take: params.limit,
      }),
      this.prisma.space.count({
        where: Object.keys(where).length ? where : undefined,
      }),
    ]);

    return { spaces, total };
  }

  async findByIdOrSlug(value: string) {
    if (!value) {
      return null;
    }
    const id = Number(value);
    if (Number.isFinite(id) && id > 0) {
      return this.prisma.space.findUnique({ where: { id } });
    }
    const bySlug = await this.prisma.space.findUnique({
      where: { slug: value },
    });
    if (bySlug) {
      return bySlug;
    }
    return this.prisma.space.findUnique({ where: { key: value } });
  }
}
