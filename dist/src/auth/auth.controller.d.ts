import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
type AuthPayload = {
    email: string;
    password: string;
};
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: AuthPayload, res: Response): Promise<{
        user: {
            id: number;
            email: string;
        };
    }>;
    signIn(body: AuthPayload, res: Response): Promise<{
        user: {
            id: number;
            email: string;
        };
    }>;
    refresh(req: Request, res: Response): Promise<{
        user: {
            id: number;
            email: string;
        };
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
    }>;
    me(req: Request): {
        user: Express.User | undefined;
    };
    private setAuthCookies;
}
export {};
