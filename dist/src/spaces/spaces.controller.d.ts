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
    list(pageParam?: string, limitParam?: string, sortParam?: string, orderParam?: string, searchParam?: string, appParam?: string, managedParam?: string): Promise<{
        spaces: {
            id: number;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            key: string;
            category: string | null;
            userId: number;
            createdBy: number;
            updatedBy: number;
            type: string | null;
            app: string | null;
            managed: string | null;
            access: string | null;
            lead: string | null;
            owner: string | null;
            defaultAssignee: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    detail(idParam: string): Promise<{
        space: {
            id: number;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            key: string;
            category: string | null;
            userId: number;
            createdBy: number;
            updatedBy: number;
            type: string | null;
            app: string | null;
            managed: string | null;
            access: string | null;
            lead: string | null;
            owner: string | null;
            defaultAssignee: string | null;
        } | null;
    }>;
}
