"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(email, password) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('Email already registered.');
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: { email, passwordHash },
        });
        const tokens = await this.issueTokens(user.id, user.email);
        await this.storeRefreshToken(user.id, tokens.refreshToken, tokens.refreshTtlMs);
        return { user: { id: user.id, email: user.email }, tokens };
    }
    async signIn(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Email is incorrect.');
        }
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Password is incorrect.');
        }
        const tokens = await this.issueTokens(user.id, user.email);
        await this.storeRefreshToken(user.id, tokens.refreshToken, tokens.refreshTtlMs);
        return { user: { id: user.id, email: user.email }, tokens };
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Missing refresh token.');
        }
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token.');
        }
        const userId = typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
            throw new common_1.UnauthorizedException('Refresh token expired.');
        }
        if (user.refreshTokenExpiresAt.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException('Refresh token expired.');
        }
        const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Refresh token expired.');
        }
        const tokens = await this.issueTokens(user.id, user.email);
        await this.storeRefreshToken(user.id, tokens.refreshToken, tokens.refreshTtlMs);
        return { user: { id: user.id, email: user.email }, tokens };
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null, refreshTokenExpiresAt: null },
        });
    }
    async getUserIdFromRefreshToken(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const sub = payload.sub;
            return typeof sub === 'string' ? Number(sub) : sub;
        }
        catch {
            return null;
        }
    }
    async issueTokens(userId, email) {
        const accessTtl = this.configService.get('JWT_ACCESS_TTL', '15m');
        const refreshTtl = this.configService.get('JWT_REFRESH_TTL', '7d');
        const accessTtlMs = this.parseDurationToMs(accessTtl);
        const refreshTtlMs = this.parseDurationToMs(refreshTtl);
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email }, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: Math.floor(accessTtlMs / 1000),
            }),
            this.jwtService.signAsync({ sub: userId, email }, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: Math.floor(refreshTtlMs / 1000),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            accessTtlMs,
            refreshTtlMs,
        };
    }
    async storeRefreshToken(userId, refreshToken, ttlMs) {
        const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        const refreshTokenExpiresAt = new Date(Date.now() + ttlMs);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash, refreshTokenExpiresAt },
        });
    }
    parseDurationToMs(value) {
        const match = /^(\d+)([smhd])$/.exec(value.trim());
        if (!match) {
            return 15 * 60 * 1000;
        }
        const amount = Number(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's':
                return amount * 1000;
            case 'm':
                return amount * 60 * 1000;
            case 'h':
                return amount * 60 * 60 * 1000;
            case 'd':
                return amount * 24 * 60 * 60 * 1000;
            default:
                return amount;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map