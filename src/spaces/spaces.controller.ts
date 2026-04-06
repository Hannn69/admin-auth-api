import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { SpacesService } from './spaces.service';

@Controller()
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('space/create')
  @HttpCode(201)
  async create(@Body() body: Record<string, any>, @Req() req: Request) {
    const user = req.user as { id: number } | undefined;
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

  @UseGuards(AuthGuard('jwt'))
  @Patch('space/:id')
  @HttpCode(200)
  async update(
    @Param('id') idParam: string,
    @Body() body: Record<string, any>,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number } | undefined;
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
    } else {
      await this.spacesService.updateBySlug(idParam, payload);
    }

    return { message: 'space has been updated succesfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('space/delete')
  @HttpCode(200)
  async remove(@Body() body: Record<string, any>) {
    const idParam = body.id ?? body.slug ?? body.key;
    const id = Number(idParam);
    if (Number.isFinite(id) && id > 0) {
      await this.spacesService.deleteById(id);
    } else if (typeof idParam === 'string') {
      await this.spacesService.deleteBySlug(idParam);
    } else {
      await this.spacesService.deleteById(id);
    }
    return { message: 'space has been deleted succesfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('spaces')
  async list(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('sort') sortParam?: string,
    @Query('order') orderParam?: string,
    @Query('search') searchParam?: string,
    @Query('app') appParam?: string,
    @Query('managed') managedParam?: string,
  ) {
    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(50, Math.max(5, Number(limitParam) || 5));
    const sort =
      sortParam === 'name' || sortParam === 'key'
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
      managed:
        managedParam && managedParam !== 'All' ? managedParam : undefined,
    });
    return { spaces, total, page, limit };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('space/detail/:id')
  async detail(@Param('id') idParam: string) {
    const space = await this.spacesService.findByIdOrSlug(idParam);
    return { space };
  }
}
