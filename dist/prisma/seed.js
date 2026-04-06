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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash("password123", 12);
    const users = [
        { email: "admin@example.com", passwordHash },
        { email: "manager@example.com", passwordHash },
        { email: "analyst@example.com", passwordHash },
    ];
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }
    const dbUsers = await prisma.user.findMany();
    if (dbUsers.length === 0) {
        throw new Error("No users found to associate tasks with.");
    }
    const owner = dbUsers[0];
    const statuses = ["To do", "In progress", "Review", "Done"];
    const priorities = ["Low", "Medium", "High"];
    const categories = ["Admin", "Security", "Onboarding", "Compliance", "Infrastructure"];
    const teams = ["Platform", "Identity", "Ops", "Core", "QA"];
    const summaries = [
        "Finalize admin role permissions matrix",
        "Add MFA enrollment flow",
        "Audit login attempts export",
        "Update dashboard onboarding tips",
        "Improve refresh token rotation logs",
        "Harden session invalidation",
        "Add rate limit for login",
        "Implement user status badges",
        "Clean up audit log schema",
        "Add data retention policy",
    ];
    const tasks = Array.from({ length: 50 }, (_, index) => {
        const stamp = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
        const key = `TASK-${stamp}-${index + 1}-${rand}`;
        const summary = summaries[index % summaries.length];
        const status = statuses[index % statuses.length];
        const priority = priorities[index % priorities.length];
        const category = categories[index % categories.length];
        const team = teams[index % teams.length];
        const startDate = new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000);
        const dueDate = new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000);
        return {
            key,
            slug: key,
            space: "task (TASK)",
            workType: "Task",
            status,
            summary,
            description: `Seeded task description for ${summary.toLowerCase()}.`,
            assignee: owner.email,
            reporter: owner.email,
            priority,
            labels: "seeded",
            dueDate,
            startDate,
            category,
            team,
            userId: owner.id,
            createdBy: owner.id,
            updatedBy: owner.id,
        };
    });
    await prisma.task.createMany({
        data: tasks,
        skipDuplicates: true,
    });
    const spaces = [
        {
            name: "My Team",
            key: "KAN",
            slug: "my-team",
            type: "Team-managed software",
            app: "Software",
            managed: "Team-managed",
            access: "Open",
            lead: owner.email,
            category: "Engineering",
            owner: owner.email,
            defaultAssignee: "Unassigned",
        },
        {
            name: "task",
            key: "TASK",
            slug: "task",
            type: "Team-managed business",
            app: "Business",
            managed: "Team-managed",
            access: "Open",
            lead: owner.email,
            category: "Operations",
            owner: owner.email,
            defaultAssignee: "Unassigned",
        },
        {
            name: "Security Ops",
            key: "SEC",
            slug: "security-ops",
            type: "Company-managed software",
            app: "Software",
            managed: "Company-managed",
            access: "Restricted",
            lead: owner.email,
            category: "Security",
            owner: owner.email,
            defaultAssignee: "Unassigned",
        },
    ];
    const extraSpaces = Array.from({ length: 50 }, (_, index) => {
        const number = String(index + 1).padStart(2, "0");
        const name = `Space ${number}`;
        const key = `SP${number}`;
        return {
            name,
            key,
            slug: `space-${number}`,
            type: index % 2 === 0 ? "Team-managed software" : "Team-managed business",
            app: index % 2 === 0 ? "Software" : "Business",
            managed: "Team-managed",
            access: index % 3 === 0 ? "Restricted" : "Open",
            lead: owner.email,
            category: index % 2 === 0 ? "Engineering" : "Operations",
            owner: owner.email,
            defaultAssignee: "Unassigned",
        };
    });
    await prisma.space.createMany({
        data: [...spaces, ...extraSpaces].map((space) => ({
            ...space,
            userId: owner.id,
            createdBy: owner.id,
            updatedBy: owner.id,
        })),
        skipDuplicates: true,
    });
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map