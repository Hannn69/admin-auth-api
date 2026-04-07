import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForUser(userId: number): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        type: string;
        message: string;
        read: boolean;
    }[]>;
    markAllRead(userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
