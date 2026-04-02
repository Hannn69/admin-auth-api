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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.6.0",
    "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
    "activeProvider": "mysql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"mysql\"\n}\n\nmodel User {\n  id                    String    @id @default(cuid())\n  email                 String    @unique\n  passwordHash          String\n  refreshTokenHash      String?\n  refreshTokenExpiresAt DateTime?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"passwordHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refreshTokenHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refreshTokenExpiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"orderBy\",\"cursor\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.updateOne\",\"User.updateMany\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_count\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"email\",\"passwordHash\",\"refreshTokenHash\",\"refreshTokenExpiresAt\",\"createdAt\",\"updatedAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"search\",\"_relevance\",\"set\"]"),
    graph: "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"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await Promise.resolve().then(() => __importStar(require('node:buffer')));
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await Promise.resolve().then(() => __importStar(require("@prisma/client/runtime/query_compiler_fast_bg.mysql.mjs"))),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await Promise.resolve().then(() => __importStar(require("@prisma/client/runtime/query_compiler_fast_bg.mysql.wasm-base64.mjs")));
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map