"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
            .split(',')
            .map((origin) => origin.trim()),
        credentials: true,
    });
    const port = Number(process.env.PORT ?? 8080);
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map