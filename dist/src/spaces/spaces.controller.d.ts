import type { Request } from 'express';
import { SpacesService } from './spaces.service';
export declare class SpacesController {
    private readonly spacesService;
    constructor(spacesService: SpacesService);
    create(body: Record<string, any>, req: Request): Promise<{
        message: string;
    }>;
    update(idParam: string, body: Record<string, any>, req: Request): Promise<{
        message: string;
    }>;
    remove(body: Record<string, any>): Promise<{
        message: string;
    }>;
    list(req: Request, pageParam?: string, limitParam?: string, sortParam?: string, orderParam?: string, searchParam?: string, appParam?: string, managedParam?: string): Promise<{
        spaces: {
            id: number;
            slug: string;
            name: string;
            key: string;
            type: string | null;
            app: string | null;
            managed: string | null;
            access: string | null;
            lead: string | null;
            category: string | null;
            owner: string | null;
            defaultAssignee: string | null;
            userId: number;
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    detail(idParam: string, req: Request): Promise<{
        space: {
            id: number;
            slug: string;
            name: string;
            key: string;
            type: string | null;
            app: string | null;
            managed: string | null;
            access: string | null;
            lead: string | null;
            category: string | null;
            owner: string | null;
            defaultAssignee: string | null;
            userId: number;
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        isOwner: boolean;
    }>;
    invite(idParam: string, email: string, role: string, req: Request): Promise<{
        message: string;
        invite?: undefined;
    } | {
        invite: {
            id: number;
            createdBy: number;
            createdAt: Date;
            token: string;
            spaceId: number;
            email: string;
            status: string;
            role: string;
            acceptedBy: number | null;
            acceptedAt: Date | null;
            expiresAt: Date | null;
        };
        message?: undefined;
    }>;
    acceptInvite(token: string, req: Request): Promise<{
        message: string;
        invite?: undefined;
    } | {
        invite: {
            id: number;
            createdBy: number;
            createdAt: Date;
            token: string;
            spaceId: number;
            email: string;
            status: string;
            role: string;
            acceptedBy: number | null;
            acceptedAt: Date | null;
            expiresAt: Date | null;
        };
        message?: undefined;
    }>;
    declineInvite(token: string, req: Request): Promise<{
        message: string;
        invite?: undefined;
    } | {
        invite: {
            id: number;
            createdBy: number;
            createdAt: Date;
            token: string;
            spaceId: number;
            email: string;
            status: string;
            role: string;
            acceptedBy: number | null;
            acceptedAt: Date | null;
            expiresAt: Date | null;
        };
        message?: undefined;
    }>;
    cancelInvite(inviteId: number, req: Request): Promise<{
        message: string;
        invite?: undefined;
    } | {
        invite: {
            id: number;
            createdBy: number;
            createdAt: Date;
            token: string;
            spaceId: number;
            email: string;
            status: string;
            role: string;
            acceptedBy: number | null;
            acceptedAt: Date | null;
            expiresAt: Date | null;
        };
        message?: undefined;
    }>;
    listInvites(req: Request): Promise<{
        invites: ({
            space: {
                id: number;
                name: string;
                key: string;
            };
        } & {
            id: number;
            createdBy: number;
            createdAt: Date;
            token: string;
            spaceId: number;
            email: string;
            status: string;
            role: string;
            acceptedBy: number | null;
            acceptedAt: Date | null;
            expiresAt: Date | null;
        })[];
    }>;
    access(idParam: string, req: Request): Promise<{
        space: {
            id: number;
            name: string;
            key: string;
            access: string;
        };
        ownerId: number;
        isOwner: boolean;
        owner: {
            id: number;
            email: string;
            role: string;
        };
        members: {
            id: number;
            email: string;
            role: string;
        }[];
        invites: {
            id: number;
            email: string;
            status: string;
        }[];
    } | {
        message: string;
    }>;
    updateMemberRole(spaceIdParam: string, memberIdParam: number, role: string, req: Request): Promise<{
        message: string;
        member?: undefined;
    } | {
        member: {
            id: number;
            userId: number;
            createdAt: Date;
            spaceId: number;
            role: string;
        };
        message?: undefined;
    }>;
    removeMember(spaceIdParam: string, memberIdParam: number, req: Request): Promise<{
        message: string;
        removed?: undefined;
    } | {
        removed: boolean;
        message?: undefined;
    }>;
}
