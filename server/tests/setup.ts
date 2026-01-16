import { PrismaClient } from "@prisma/client";
import { beforeEach, afterAll } from "vitest";

const prisma = new PrismaClient();

// Reset database before each test
beforeEach(async () => {
  // Truncate all tables (order matters due to foreign keys)
  await prisma.item.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
