import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(req: Request): Promise<{
        notifications: {
            id: number;
            createdAt: Date;
            userId: number;
            type: string;
            message: string;
            read: boolean;
        }[];
    }>;
    markAllRead(req: Request): Promise<{
        message: string;
    }>;
}
