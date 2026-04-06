import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('task/create')
  @HttpCode(201)
  async create(
    @Body() body: Record<string, any>,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number } | undefined;
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

  @UseGuards(AuthGuard('jwt'))
  @Patch('task/:key')
  @HttpCode(200)
  async update(
    @Param('key') key: string,
    @Body() body: Record<string, any>,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number } | undefined;
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

  @UseGuards(AuthGuard('jwt'))
  @Post('task/delete')
  @HttpCode(200)
  async remove(@Body('key') key: string) {
    await this.tasksService.deleteByKey(key);
    return { message: 'task has been deleted succesfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('tasks')
  async list(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('sort') sortParam?: string,
    @Query('order') orderParam?: string,
    @Query('search') searchParam?: string,
    @Query('status') statusParam?: string,
    @Query('space') spaceParam?: string,
  ) {
    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(50, Math.max(5, Number(limitParam) || 5));
    const sort =
      sortParam === 'priority' || sortParam === 'status'
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
      space: spaceParam?.trim() || undefined,
    });
    return { tasks, total, page, limit };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('task/detail/:slug')
  async detail(@Param('slug') slug: string) {
    const task = await this.tasksService.findByKeyOrSlug(slug);
    return { task };
  }
}
