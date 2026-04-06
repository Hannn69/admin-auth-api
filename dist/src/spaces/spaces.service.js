"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const normalizeKey = (value) => value.trim().toUpperCase();
const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
let SpacesService = class SpacesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        if (!input.name?.trim()) {
            throw new common_1.BadRequestException('Name is required.');
        }
        if (!input.key?.trim()) {
            throw new common_1.BadRequestException('Key is required.');
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
    async updateById(id, input) {
        if (!id) {
            throw new common_1.BadRequestException('Space id is required.');
        }
        const data = {};
        const setOptionalString = (key, value) => {
            if (value === undefined) {
                return;
            }
            const trimmed = value.trim();
            data[key] = trimmed ? trimmed : null;
        };
        if (input.name !== undefined) {
            if (!input.name.trim()) {
                throw new common_1.BadRequestException('Name is required.');
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
                throw new common_1.BadRequestException('Key is required.');
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
    async updateBySlug(slug, input) {
        if (!slug) {
            throw new common_1.BadRequestException('Space slug is required.');
        }
        const data = {};
        const setOptionalString = (key, value) => {
            if (value === undefined) {
                return;
            }
            const trimmed = value.trim();
            data[key] = trimmed ? trimmed : null;
        };
        if (input.name !== undefined) {
            if (!input.name.trim()) {
                throw new common_1.BadRequestException('Name is required.');
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
                throw new common_1.BadRequestException('Key is required.');
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
    async deleteById(id) {
        if (!id) {
            throw new common_1.BadRequestException('Space id is required.');
        }
        await this.prisma.space.delete({ where: { id } });
    }
    async deleteBySlug(slug) {
        if (!slug) {
            throw new common_1.BadRequestException('Space slug is required.');
        }
        await this.prisma.space.delete({ where: { slug } });
    }
    async findPaged(params) {
        const search = params.search?.trim();
        const where = {};
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
    async findByIdOrSlug(value) {
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
};
exports.SpacesService = SpacesService;
exports.SpacesService = SpacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpacesService);
//# sourceMappingURL=spaces.service.js.map