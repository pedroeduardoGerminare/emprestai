import { PrismaClient } from "@prisma/client";
import { getServerEnv } from "./env";

const globalDatabase = globalThis as unknown as { empresTiPrisma?: PrismaClient };

// Instantiated lazily: build and public pages do not require a database connection.
export function getDatabase() {
  if (!globalDatabase.empresTiPrisma) {
    const env = getServerEnv();
    globalDatabase.empresTiPrisma = new PrismaClient({ datasourceUrl: env.DATABASE_URL });
  }
  return globalDatabase.empresTiPrisma;
}
