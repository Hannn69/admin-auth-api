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
    @Req() req: Request,
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

    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { spaces: [], total: 0, page, limit };
    }
    const { spaces, total } = await this.spacesService.findPaged({
      page,
      limit,
      sort,
      order,
      search: searchParam,
      app: appParam && appParam !== 'All apps' ? appParam : undefined,
      managed:
        managedParam && managedParam !== 'All' ? managedParam : undefined,
      userId: user.id,
    });
    return { spaces, total, page, limit };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('space/detail/:id')
  async detail(@Param('id') idParam: string, @Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { space: null, isOwner: false };
    }
    const space = await this.spacesService.findByIdOrSlugForUser(
      idParam,
      user.id,
    );
    return { space, isOwner: space?.userId === user.id };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('space/:id/invite')
  @HttpCode(201)
  async invite(
    @Param('id') idParam: string,
    @Body('email') email: string,
    @Body('role') role: string,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { message: 'Unauthorized' };
    }
    const space = await this.spacesService.findByIdOrSlug(idParam);
    if (!space || space.userId !== user.id) {
      return { message: 'Forbidden' };
    }
    const invite = await this.spacesService.createInvite({
      spaceId: space.id,
      email,
      role,
      createdBy: user.id,
    });
    return { invite };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('space/invite/accept')
  @HttpCode(200)
  async acceptInvite(@Body('token') token: string, @Req() req: Request) {
    const user = req.user as { id: number; email?: string } | undefined;
    if (!user?.id) {
      return { message: 'Unauthorized' };
    }
    const invite = await this.spacesService.acceptInvite(token, user.id);
    return { invite };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('space/invite/decline')
  @HttpCode(200)
  async declineInvite(@Body('token') token: string, @Req() req: Request) {
    const user = req.user as { id: number; email?: string } | undefined;
    if (!user?.email) {
      return { message: 'Unauthorized' };
    }
    const invite = await this.spacesService.declineInvite(token, user.email);
    return { invite };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('space/invite/cancel')
  @HttpCode(200)
  async cancelInvite(@Body('inviteId') inviteId: number, @Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { message: 'Unauthorized' };
    }
    const invite = await this.spacesService.cancelInvite(inviteId, user.id);
    return { invite };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('space/invites')
  async listInvites(@Req() req: Request) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      return { invites: [] };
    }
    const invites = await this.spacesService.listInvitesForEmail(user.email);
    return { invites };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('space/:id/access')
  async access(@Param('id') idParam: string, @Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { message: 'Unauthorized' };
    }
    const space = await this.spacesService.findByIdOrSlugForUser(
      idParam,
      user.id,
    );
    if (!space) {
      return { message: 'Forbidden' };
    }
    const access = await this.spacesService.getAccessForUser(space.id, user.id);
    return access;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('space/member/role')
  @HttpCode(200)
  async updateMemberRole(
    @Body('spaceId') spaceIdParam: string,
    @Body('memberId') memberIdParam: number,
    @Body('role') role: string,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { message: 'Unauthorized' };
    }
    const space = await this.spacesService.findByIdOrSlug(spaceIdParam);
    if (!space) {
      return { message: 'Space not found' };
    }
    const memberId = Number(memberIdParam);
    const updated = await this.spacesService.updateMemberRole({
      spaceId: space.id,
      memberId,
      role,
      userId: user.id,
    });
    return { member: updated };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('space/member/remove')
  @HttpCode(200)
  async removeMember(
    @Body('spaceId') spaceIdParam: string,
    @Body('memberId') memberIdParam: number,
    @Req() req: Request,
  ) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { message: 'Unauthorized' };
    }
    const space = await this.spacesService.findByIdOrSlug(spaceIdParam);
    if (!space) {
      return { message: 'Space not found' };
    }
    const memberId = Number(memberIdParam);
    await this.spacesService.removeMember({
      spaceId: space.id,
      memberId,
      userId: user.id,
    });
    return { removed: true };
  }
}
