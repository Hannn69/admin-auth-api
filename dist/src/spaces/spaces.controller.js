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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const spaces_service_1 = require("./spaces.service");
let SpacesController = class SpacesController {
    spacesService;
    constructor(spacesService) {
        this.spacesService = spacesService;
    }
    async create(body, req) {
        const user = req.user;
        if (!user?.id) {
            return { message: 'Unauthorized' };
        }
        await this.spacesService.create({
            name: body.name,
            key: body.key,
            type: body.type,
            app: body.app,
            managed: body.managed,
            access: body.access,
            lead: body.lead,
            category: body.category,
            owner: body.owner,
            defaultAssignee: body.defaultAssignee,
            userId: user.id,
            createdBy: user.id,
            updatedBy: user.id,
        });
        return { message: 'space has been created succesfully' };
    }
    async update(idParam, body, req) {
        const user = req.user;
        const payload = {
            name: body.name,
            key: body.key,
            type: body.type,
            app: body.app,
            managed: body.managed,
            access: body.access,
            lead: body.lead,
            category: body.category,
            owner: body.owner,
            defaultAssignee: body.defaultAssignee,
            updatedBy: user?.id,
        };
        const id = Number(idParam);
        if (Number.isFinite(id) && id > 0) {
            await this.spacesService.updateById(id, payload);
        }
        else {
            await this.spacesService.updateBySlug(idParam, payload);
        }
        return { message: 'space has been updated succesfully' };
    }
    async remove(body) {
        const idParam = body.id ?? body.slug ?? body.key;
        const id = Number(idParam);
        if (Number.isFinite(id) && id > 0) {
            await this.spacesService.deleteById(id);
        }
        else if (typeof idParam === 'string') {
            await this.spacesService.deleteBySlug(idParam);
        }
        else {
            await this.spacesService.deleteById(id);
        }
        return { message: 'space has been deleted succesfully' };
    }
    async list(pageParam, limitParam, sortParam, orderParam, searchParam, appParam, managedParam) {
        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.min(50, Math.max(5, Number(limitParam) || 5));
        const sort = sortParam === 'name' || sortParam === 'key'
            ? sortParam
            : sortParam === 'createdAt'
                ? 'createdAt'
                : 'updatedAt';
        const order = orderParam === 'asc' ? 'asc' : 'desc';
        const { spaces, total } = await this.spacesService.findPaged({
            page,
            limit,
            sort,
            order,
            search: searchParam,
            app: appParam && appParam !== 'All apps' ? appParam : undefined,
            managed: managedParam && managedParam !== 'All' ? managedParam : undefined,
        });
        return { spaces, total, page, limit };
    }
    async detail(idParam) {
        const space = await this.spacesService.findByIdOrSlug(idParam);
        return { space };
    }
};
exports.SpacesController = SpacesController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('space/create'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('space/:id'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('space/delete'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('spaces'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('sort')),
    __param(3, (0, common_1.Query)('order')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('app')),
    __param(6, (0, common_1.Query)('managed')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('space/detail/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "detail", null);
exports.SpacesController = SpacesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [spaces_service_1.SpacesService])
], SpacesController);
//# sourceMappingURL=spaces.controller.js.map