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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const tasks_service_1 = require("./tasks.service");
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async create(body, req) {
        const user = req.user;
        if (!user?.id) {
            return { message: 'Unauthorized' };
        }
        await this.tasksService.create({
            space: body.space,
            workType: body.workType,
            status: body.status,
            summary: body.summary,
            description: body.description,
            assignee: body.assignee,
            reporter: body.reporter,
            priority: body.priority,
            labels: body.labels,
            dueDate: body.dueDate,
            startDate: body.startDate,
            category: body.category,
            team: body.team,
            subtasks: body.subtasks,
            userId: user.id,
            createdBy: user.id,
            updatedBy: user.id,
        });
        return {
            message: 'task has been created succesfully',
        };
    }
    async update(key, body, req) {
        const user = req.user;
        await this.tasksService.updateByKey(key, {
            space: body.space,
            workType: body.workType,
            status: body.status,
            summary: body.summary,
            description: body.description,
            assignee: body.assignee,
            reporter: body.reporter,
            priority: body.priority,
            labels: body.labels,
            dueDate: body.dueDate,
            startDate: body.startDate,
            category: body.category,
            team: body.team,
            subtasks: body.subtasks,
            updatedBy: user?.id,
        });
        return {
            message: 'task has been updated succesfully',
        };
    }
    async remove(key) {
        await this.tasksService.deleteByKey(key);
        return { message: 'task has been deleted succesfully' };
    }
    async list(pageParam, limitParam, sortParam, orderParam, searchParam, statusParam) {
        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.min(50, Math.max(5, Number(limitParam) || 5));
        const sort = sortParam === 'priority' || sortParam === 'status'
            ? sortParam
            : sortParam === 'createdAt'
                ? 'createdAt'
                : 'updatedAt';
        const order = orderParam === 'asc' ? 'asc' : 'desc';
        const { tasks, total } = await this.tasksService.findPaged({
            page,
            limit,
            sort,
            order,
            search: searchParam,
            status: statusParam && statusParam !== 'All' ? statusParam : undefined,
        });
        return { tasks, total, page, limit };
    }
    async detail(slug) {
        const task = await this.tasksService.findByKeyOrSlug(slug);
        return { task };
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('task/create'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('task/:key'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('task/delete'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('sort')),
    __param(3, (0, common_1.Query)('order')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('task/detail/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "detail", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map