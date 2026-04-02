import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
