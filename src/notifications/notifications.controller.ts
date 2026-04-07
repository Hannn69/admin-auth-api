import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('notifications')
  async list(@Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { notifications: [] };
    }
    const notifications = await this.notificationsService.listForUser(user.id);
    return { notifications };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('notifications/read-all')
  async markAllRead(@Req() req: Request) {
    const user = req.user as { id: number } | undefined;
    if (!user?.id) {
      return { message: 'Unauthorized' };
    }
    await this.notificationsService.markAllRead(user.id);
    return { message: 'ok' };
  }
}
