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
    userId: number;
  }) {
    const search = params.search?.trim();
    const where: Record<string, unknown> = {};
    const andFilters: Record<string, unknown>[] = [];

    if (search) {
      andFilters.push({
        OR: [
        { name: { contains: search } },
        { key: { contains: search } },
        { lead: { contains: search } },
        { type: { contains: search } },
        ],
      });
    }

    if (params.app) {
      andFilters.push({ app: params.app });
    }
    if (params.managed) {
      andFilters.push({ managed: params.managed });
    }
    andFilters.push({
      OR: [
        { userId: params.userId },
        { members: { some: { userId: params.userId } } },
      ],
    });
    if (andFilters.length) {
      where.AND = andFilters;
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

  async findByIdOrSlugForUser(value: string, userId: number) {
    if (!value) {
      return null;
    }
    const id = Number(value);
    const access = {
      OR: [{ userId }, { members: { some: { userId } } }],
    };
    if (Number.isFinite(id) && id > 0) {
      return this.prisma.space.findFirst({
        where: { id, ...access },
      });
    }
    const bySlug = await this.prisma.space.findFirst({
      where: { slug: value, ...access },
    });
    if (bySlug) {
      return bySlug;
    }
    return this.prisma.space.findFirst({
      where: { key: value, ...access },
    });
  }

  async createInvite(params: {
    spaceId: number;
    email: string;
    createdBy: number;
    role?: string;
  }) {
    if (!params.email?.trim()) {
      throw new BadRequestException('Email is required.');
    }
    const token = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    return this.prisma.spaceInvite.upsert({
      where: {
        spaceId_email: {
          spaceId: params.spaceId,
          email: params.email.trim().toLowerCase(),
        },
      },
      update: {
        token,
        status: 'pending',
        role:
          params.role === 'admin'
            ? 'admin'
            : params.role === 'viewer'
              ? 'viewer'
              : 'member',
        createdBy: params.createdBy,
        acceptedBy: null,
        acceptedAt: null,
      },
      create: {
        spaceId: params.spaceId,
        email: params.email.trim().toLowerCase(),
        token,
        status: 'pending',
        role:
          params.role === 'admin'
            ? 'admin'
            : params.role === 'viewer'
              ? 'viewer'
              : 'member',
        createdBy: params.createdBy,
      },
    });
  }

  async acceptInvite(token: string, userId: number) {
    if (!token) {
      throw new BadRequestException('Invite token is required.');
    }
    const invite = await this.prisma.spaceInvite.findUnique({
      where: { token },
    });
    if (!invite || invite.status !== 'pending') {
      throw new BadRequestException('Invite is invalid or expired.');
    }
    await this.prisma.spaceMember.upsert({
      where: { spaceId_userId: { spaceId: invite.spaceId, userId } },
      update: {},
      create: {
        spaceId: invite.spaceId,
        userId,
        role:
          invite.role === 'admin'
            ? 'admin'
            : invite.role === 'viewer'
              ? 'viewer'
              : 'member',
      },
    });
    const updated = await this.prisma.spaceInvite.update({
      where: { id: invite.id },
      data: { status: 'accepted', acceptedBy: userId, acceptedAt: new Date() },
    });
    const space = await this.prisma.space.findUnique({
      where: { id: invite.spaceId },
      select: { userId: true, name: true, key: true },
    });
    if (space) {
      await this.prisma.notification.create({
        data: {
          userId: space.userId,
          type: 'invite.accepted',
          message: `${invite.email} accepted the invite to ${space.name} (${space.key}).`,
        },
      });
    }
    return updated;
  }

  async listInvitesForEmail(email: string) {
    if (!email?.trim()) {
      return [];
    }
    return this.prisma.spaceInvite.findMany({
      where: { email: email.trim().toLowerCase(), status: 'pending' },
      include: { space: { select: { id: true, name: true, key: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async declineInvite(token: string, email: string) {
    if (!token) {
      throw new BadRequestException('Invite token is required.');
    }
    const invite = await this.prisma.spaceInvite.findUnique({
      where: { token },
    });
    if (!invite || invite.status !== 'pending') {
      throw new BadRequestException('Invite is invalid or expired.');
    }
    if (invite.email !== email.trim().toLowerCase()) {
      throw new BadRequestException('Forbidden');
    }
    const updated = await this.prisma.spaceInvite.update({
      where: { id: invite.id },
      data: { status: 'declined' },
    });
    const space = await this.prisma.space.findUnique({
      where: { id: invite.spaceId },
      select: { userId: true, name: true, key: true },
    });
    if (space) {
      await this.prisma.notification.create({
        data: {
          userId: space.userId,
          type: 'invite.declined',
          message: `${invite.email} declined the invite to ${space.name} (${space.key}).`,
        },
      });
    }
    return updated;
  }

  async cancelInvite(inviteId: number, userId: number) {
    if (!inviteId) {
      throw new BadRequestException('Invite id is required.');
    }
    const invite = await this.prisma.spaceInvite.findUnique({
      where: { id: inviteId },
      include: { space: true },
    });
    if (!invite) {
      throw new BadRequestException('Invite not found.');
    }
    if (invite.space.userId !== userId) {
      throw new BadRequestException('Forbidden');
    }
    return this.prisma.spaceInvite.update({
      where: { id: inviteId },
      data: { status: 'cancelled' },
    });
  }

  async updateMemberRole(params: {
    spaceId: number;
    memberId: number;
    role: string;
    userId: number;
  }) {
    const { spaceId, memberId, role, userId } = params;
    if (!spaceId || !memberId) {
      throw new BadRequestException('Space id and member id are required.');
    }
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new BadRequestException('Space not found.');
    }
    if (space.userId !== userId) {
      throw new BadRequestException('Forbidden');
    }
    if (memberId === space.userId) {
      throw new BadRequestException('Cannot change owner role.');
    }
    const normalizedRole =
      role === 'admin' ? 'admin' : role === 'viewer' ? 'viewer' : 'member';
    return this.prisma.spaceMember.update({
      where: { spaceId_userId: { spaceId, userId: memberId } },
      data: { role: normalizedRole },
    });
  }

  async removeMember(params: {
    spaceId: number;
    memberId: number;
    userId: number;
  }) {
    const { spaceId, memberId, userId } = params;
    if (!spaceId || !memberId) {
      throw new BadRequestException('Space id and member id are required.');
    }
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new BadRequestException('Space not found.');
    }
    if (space.userId !== userId) {
      throw new BadRequestException('Forbidden');
    }
    if (memberId === space.userId) {
      throw new BadRequestException('Cannot remove owner.');
    }
    await this.prisma.spaceMember.delete({
      where: { spaceId_userId: { spaceId, userId: memberId } },
    });
    return { removed: true };
  }

  async getAccessForUser(spaceId: number, userId: number) {
    if (!spaceId || !userId) {
      throw new BadRequestException('Space id and user id are required.');
    }

    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        user: { select: { id: true, email: true } },
      },
    });
    if (!space) {
      throw new BadRequestException('Space not found.');
    }

    const isMember =
      space.userId === userId ||
      (await this.prisma.spaceMember.findFirst({
        where: { spaceId, userId },
      }));
    if (!isMember) {
      throw new BadRequestException('Forbidden');
    }

    const members = await this.prisma.spaceMember.findMany({
      where: { spaceId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const invites = await this.prisma.spaceInvite.findMany({
      where: { spaceId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    const owner = {
      id: space.userId,
      email: space.user?.email ?? space.owner ?? 'owner',
      role: 'Administrator',
    };

    return {
      space: {
        id: space.id,
        name: space.name,
        key: space.key,
        access: space.access ?? 'Open',
      },
      ownerId: space.userId,
      isOwner: space.userId === userId,
      owner,
      members: members.map((member) => ({
        id: member.userId,
        email: member.user?.email ?? 'member',
        role:
          member.role === 'admin'
            ? 'Administrator'
            : member.role === 'viewer'
              ? 'Viewer'
              : 'Member',
      })),
      invites: invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        status: invite.status,
      })),
    };
  }
}
