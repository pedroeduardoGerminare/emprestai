import { PrismaClient, Prisma } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const definitions = [
  ["TI-0001", "Notebook 14 polegadas", "Notebooks"],
  ["TI-0002", "Notebook 15 polegadas", "Notebooks"],
  ["TI-0003", "Notebook 13 polegadas", "Notebooks"],
  ["TI-0004", "Notebook 15 polegadas", "Notebooks"],
  ["TI-0005", "Monitor 24 polegadas", "Monitores"],
  ["TI-0006", "Monitor 27 polegadas", "Monitores"],
  ["TI-0007", "Monitor 22 polegadas", "Monitores"],
  ["TI-0008", "Cabo HDMI 2 m", "Cabos"],
  ["TI-0009", "Cabo USB-C 1 m", "Cabos"],
  ["TI-0010", "Cabo de rede 3 m", "Cabos"],
  ["TI-0011", "Webcam Full HD", "Câmeras"],
  ["TI-0012", "Câmera compacta", "Câmeras"],
] as const;

export type PracticeImage = {
  patrimonio: string; id: number; approved: boolean; reason: string;
  pageURL: string; author: string; authorURL: string; license: string; licenseURL: string;
  width: number; height: number; sha256: string; file: string;
};

export function validatePracticeManifest(value: unknown): PracticeImage[] {
  if (!Array.isArray(value) || value.length !== 12) throw new Error("Manifesto deve conter 12 fotos aprovadas");
  const assets = new Set<string>(), ids = new Set<number>(), hashes = new Set<string>();
  for (const row of value) {
    if (!row || !definitions.some(([asset]) => asset === row.patrimonio) || assets.has(row.patrimonio)) throw new Error("Patrimônio inválido ou duplicado");
    if (row.approved !== true || typeof row.reason !== "string" || !row.reason.trim() || row.width !== 800 || row.height !== 600) throw new Error("Foto não aprovada ou dimensão inválida");
    if (!Number.isSafeInteger(row.id) || row.id < 1 || ids.has(row.id) || typeof row.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(row.sha256) || hashes.has(row.sha256)) throw new Error("Foto repetida ou hash inválido");
    if (row.file !== `${row.patrimonio}.jpg` || typeof row.author !== "string" || !row.author.trim() || typeof row.license !== "string" || !row.license.trim()) throw new Error("Crédito ou arquivo inválido");
    for (const field of ["pageURL", "authorURL", "licenseURL"] as const) {
      const url = new URL(row[field]);
      if (url.protocol !== "https:" || url.hostname !== "pixabay.com" || url.search || url.username || url.password) throw new Error("Origem deve ser Pixabay sem segredo");
    }
    assets.add(row.patrimonio); ids.add(row.id); hashes.add(row.sha256);
  }
  return value as PracticeImage[];
}

export function publicStorageBase(value: string): URL {
  const url = new URL(value.endsWith("/") ? value : `${value}/`);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co") || !url.pathname.startsWith("/storage/v1/object/public/") || url.search || url.username || url.password) throw new Error("Base deve ser bucket público HTTPS Supabase sem segredo");
  return url;
}

// Does not create Auth users, change credentials, upload files or create loans.
export async function seedPractice(prisma: PrismaClient, manifest: unknown, storageBase: string) {
  const images = validatePracticeManifest(manifest);
  const base = publicStorageBase(storageBase);
  return prisma.$transaction(async transaction => {
    const tenant = await transaction.tenant.upsert({ where: { slug: "suporte_ti" }, create: { slug: "suporte_ti", name: "Suporte de TI" }, update: {} });
    for (const [assetTag, name, categoryName] of definitions) {
      const category = await transaction.category.upsert({ where: { tenantId_name: { tenantId: tenant.id, name: categoryName } }, create: { tenantId: tenant.id, name: categoryName }, update: {} });
      const existing = await transaction.equipment.findUnique({ where: { tenantId_assetTag: { tenantId: tenant.id, assetTag } } });
      if (existing) {
        await transaction.$queryRaw`SELECT id FROM equipment WHERE id = ${existing.id}::uuid FOR UPDATE`;
        const openLoan = await transaction.loan.findFirst({ where: { tenantId: tenant.id, equipmentId: existing.id, returnedAt: null } });
        if (openLoan) continue;
      }
      const image = images.find(row => row.patrimonio === assetTag)!;
      const data = { name, categoryId: category.id, pickupLocation: "Balcão de Operações", imageUrl: new URL(image.file, base).href, state: (["TI-0004", "TI-0007", "TI-0010"].includes(assetTag) ? "maintenance" : "available") as "maintenance" | "available" };
      await transaction.equipment.upsert({ where: { tenantId_assetTag: { tenantId: tenant.id, assetTag } }, create: { tenantId: tenant.id, assetTag, ...data }, update: data });
    }
    return { tenantId: tenant.id, equipment: definitions.length };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !["127.0.0.1", "localhost", "[::1]"].includes(new URL(databaseUrl).hostname)) throw new Error("CLI do seed aceita somente banco local explícito");
  if (!process.argv[2] || !process.env.EQUIPMENT_STORAGE_PUBLIC_BASE) throw new Error("Informe manifesto e EQUIPMENT_STORAGE_PUBLIC_BASE");
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    await seedPractice(prisma, JSON.parse(readFileSync(process.argv[2], "utf8")), process.env.EQUIPMENT_STORAGE_PUBLIC_BASE);
    console.log("Seed local concluído, sem usuários Auth, upload ou empréstimos.");
  } finally { await prisma.$disconnect(); }
}
