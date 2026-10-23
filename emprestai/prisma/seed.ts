import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const sql = readFileSync(new URL("./seed.sql", import.meta.url), "utf8");
  // Static, versioned SQL only; no user input is interpolated.
  await prisma.$transaction(async (transaction) => {
    for (const statement of sql.split(";").map((value) => value.trim()).filter(Boolean)) {
      await transaction.$executeRawUnsafe(statement);
    }
  });
} finally {
  await prisma.$disconnect();
}
