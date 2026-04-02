import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
type TokenBundle = {
    accessToken: string;
    refreshToken: string;
    accessTtlMs: number;
    refreshTtlMs: number;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(email: string, password: string): Promise<{
        user: {
            id: number;
            email: string;
        };
        tokens: TokenBundle;
    }>;
    signIn(email: string, password: string): Promise<{
        user: {
            id: number;
            email: string;
        };
        tokens: TokenBundle;
    }>;
    refresh(refreshToken: string): Promise<{
        user: {
            id: number;
            email: string;
        };
        tokens: TokenBundle;
    }>;
    logout(userId: number): Promise<void>;
    getUserIdFromRefreshToken(refreshToken: string): Promise<number | null>;
    private issueTokens;
    private storeRefreshToken;
    private parseDurationToMs;
}
export {};
