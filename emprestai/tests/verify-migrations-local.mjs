// Explicit disposable database only. Never loads project environment files.
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { readFileSync, mkdtempSync, copyFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const database = await new PostgreSqlContainer("postgres:16-alpine").start();
try {
  // Run Prisma in an isolated directory without the project's .env files.
  const isolated = mkdtempSync(join(tmpdir(), "emprestai-migrations-"));
  copyFileSync("prisma/schema.prisma", join(isolated, "schema.prisma"));
  cpSync("prisma/migrations", join(isolated, "migrations"), { recursive: true });
  const prismaCli = resolve("node_modules/prisma/build/index.js");
  const bootstrap = readFileSync(new URL("./auth-bootstrap.sql", import.meta.url), "utf8");
  await database.copyContentToContainer([{ content: bootstrap, target: "/tmp/bootstrap.sql" }]);
  const result = await database.exec(["psql", "-U", database.getUsername(), "-d", database.getDatabase(), "-v", "ON_ERROR_STOP=1", "-f", "/tmp/bootstrap.sql"]);
  if (result.exitCode) throw new Error(result.stderr);
  const url = database.getConnectionUri();
  if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(url).hostname)) throw new Error("Refusing non-loopback database");
  const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url };
  for (const args of [["migrate", "deploy"], ["migrate", "status"], ["migrate", "reset", "--force", "--skip-seed", "--skip-generate"]]) {
    const command = spawnSync(process.execPath, [prismaCli, ...args, "--schema", join(isolated, "schema.prisma")], { env, cwd: isolated, encoding: "utf8" });
    const safeOutput = (command.stdout + command.stderr).replaceAll(url, "[disposable-local-url]");
    console.log(safeOutput);
    if (command.status !== 0) throw new Error(`Prisma ${args.join(" ")} failed`);
  }
  const check = await database.exec(["psql", "-U", database.getUsername(), "-d", database.getDatabase(), "-Atc", "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='equipment' AND column_name='image_url';"]);
  if (check.stdout.trim() !== "1") throw new Error("image_url absent after reset");
  console.log("Migration deploy/status/reset passed against disposable Postgres; image_url exists.");
} finally {
  await database.stop();
}
