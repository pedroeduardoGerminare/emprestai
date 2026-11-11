import { readFileSync, readdirSync } from "node:fs";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, expect, it } from "vitest";
import { seedPractice, validatePracticeManifest } from "../prisma/seed-pratica";

let database: StartedPostgreSqlContainer;
let prisma: PrismaClient;
// Synthetic manifest is a fixture, not evidence of reviewed production photos.
const manifest = Array.from({ length: 12 }, (_, index) => ({
  patrimonio: `TI-${String(index + 1).padStart(4, "0")}`, id: index + 1, approved: true, reason: "synthetic test fixture",
  pageURL: `https://pixabay.com/photos/test-${index + 1}/`, author: "fixture", authorURL: "https://pixabay.com/users/fixture-1/",
  license: "Pixabay Content License", licenseURL: "https://pixabay.com/service/license-summary/",
  width: 800, height: 600, sha256: String(index + 1).padStart(64, "0"), file: `TI-${String(index + 1).padStart(4, "0")}.jpg`,
}));
const storageBase = "https://fixture.supabase.co/storage/v1/object/public/equipamentos/";

beforeAll(async () => {
  database = await new PostgreSqlContainer("postgres:16-alpine").start();
  const root = new URL("../prisma/migrations/", import.meta.url);
  const ddl = readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort().map(name => readFileSync(new URL(`${name}/migration.sql`, root), "utf8")).join("\n");
  await database.copyContentToContainer([{ content: readFileSync(new URL("./auth-bootstrap.sql", import.meta.url), "utf8") + "\n" + ddl, target: "/tmp/setup.sql" }]);
  const result = await database.exec(["psql", "-U", database.getUsername(), "-d", database.getDatabase(), "-v", "ON_ERROR_STOP=1", "-f", "/tmp/setup.sql"]);
  expect(result.exitCode, result.stderr).toBe(0);
  prisma = new PrismaClient({ datasources: { db: { url: database.getConnectionUri() } } });
}, 120_000);
afterAll(async () => { if (prisma) await prisma.$disconnect(); if (database) await database.stop(); }, 60_000);

it("spec003_test_ca_01_ca_02_ca_07_seed_duplo_tem_12_itens_sem_emprestimos_e_sem_duplicar", async () => {
  await seedPractice(prisma, manifest, storageBase);
  await seedPractice(prisma, manifest, storageBase);
  expect(await prisma.tenant.count()).toBe(1);
  expect(await prisma.category.count()).toBe(4);
  expect(await prisma.equipment.count()).toBe(12);
  expect(await prisma.loan.count()).toBe(0);
  const maintenance = await prisma.equipment.findMany({ where: { state: "maintenance" }, orderBy: { assetTag: "asc" } });
  expect(maintenance.map(row => row.assetTag)).toEqual(["TI-0004", "TI-0007", "TI-0010"]);
  expect(await prisma.equipment.count({ where: { imageUrl: { startsWith: storageBase } } })).toBe(12);
});

it("spec003_test_ca_02_seed_preserva_item_com_emprestimo_aberto", async () => {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { slug: "suporte_ti" } });
  const userId = "20000000-0000-0000-0000-000000000001";
  await prisma.$executeRaw`INSERT INTO auth.users(id) VALUES (${userId}::uuid)`;
  await prisma.profile.create({ data: { userId, displayName: "Conta de teste" } });
  await prisma.membership.create({ data: { userId, tenantId: tenant.id } });
  const equipment = await prisma.equipment.findUniqueOrThrow({ where: { tenantId_assetTag: { tenantId: tenant.id, assetTag: "TI-0001" } } });
  await prisma.loan.create({ data: { tenantId: tenant.id, equipmentId: equipment.id, borrowerId: userId } });
  await prisma.equipment.update({ where: { id: equipment.id }, data: { name: "Nome preservado", imageUrl: "https://fixture.supabase.co/storage/v1/object/public/equipamentos/preservada.jpg" } });
  await seedPractice(prisma, manifest, storageBase);
  const unchanged = await prisma.equipment.findUniqueOrThrow({ where: { id: equipment.id } });
  expect(unchanged.name).toBe("Nome preservado");
  expect(unchanged.imageUrl).toContain("preservada.jpg");
  expect(await prisma.loan.count()).toBe(1);
});

it("spec003_test_ca_03_ca_07_manifesto_invalido_nao_e_aceito", () => {
  expect(() => validatePracticeManifest(manifest.map((row, index) => index ? row : { ...row, width: 799 }))).toThrow("dimensão");
  expect(() => validatePracticeManifest(manifest.map((row, index) => index === 1 ? { ...row, id: 1 } : row))).toThrow("repetida");
  expect(() => validatePracticeManifest(manifest.map((row, index) => index ? row : { ...row, approved: false }))).toThrow("aprovada");
});
