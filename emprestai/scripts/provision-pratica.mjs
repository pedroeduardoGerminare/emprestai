// Human-operated production preparation. Never executed by the image skill/verifier.
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { validateReview } from "../skills/imagens-equipamentos/scripts/pipeline.mjs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { seedPractice } from "../prisma/seed-pratica.ts";
import { validateProductionTarget, validatePracticeManifest } from "./provision-validation.mjs";

const project = "zvemdkmoagksupyyosuk";
const args = process.argv.slice(2);
if (args[0] !== "--execute-human" || args[1] !== project || !args[2]) {
  console.error("Execução humana: node --env-file=.env.production.local scripts/provision-pratica.mjs --execute-human zvemdkmoagksupyyosuk <pasta-prepared>");
  process.exit(1);
}
try {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PROFESSOR_PASSWORD, DATABASE_URL } = process.env;
  if (SUPABASE_URL !== `https://${project}.supabase.co` || !SUPABASE_SERVICE_ROLE_KEY || !PROFESSOR_PASSWORD) throw new Error("Configuração privada ausente ou projeto diferente do aprovado.");
  if (!DATABASE_URL) throw new Error("Conexão Prisma de produção não configurada.");
  validateProductionTarget(DATABASE_URL, project);
  const dir = resolve(args[2]);
  const manifest = JSON.parse(await readFile(join(dir, "manifest.json"), "utf8"));
  validateReview(manifest);
  validatePracticeManifest(manifest);
  const sharp = (await import("sharp")).default;
  const files = [];
  for (const row of manifest) {
    if (row.file !== `${row.patrimonio}.jpg`) throw new Error("Caminho inesperado no manifesto.");
    const bytes = await readFile(join(dir, row.file));
    const metadata = await sharp(bytes).metadata();
    if (metadata.width !== 800 || metadata.height !== 600 || createHash("sha256").update(bytes).digest("hex") !== row.sha256) throw new Error("Imagem não corresponde ao manifesto revisado.");
    files.push({ row, bytes });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const preflight = new PrismaClient({ datasourceUrl: DATABASE_URL });
  try { await preflight.$queryRaw`SELECT image_url FROM public.equipment LIMIT 0`; } finally { await preflight.$disconnect(); }
  const bucket = "equipamentos";
  const buckets = await supabase.storage.listBuckets();
  if (buckets.error) throw new Error("Não foi possível consultar Storage.");
  const existingBucket = buckets.data.find(b => b.name === bucket);
  if (existingBucket && !existingBucket.public) throw new Error("Bucket existente é privado; revisar manualmente antes de torná-lo público.");
  if (!existingBucket) {
    const created = await supabase.storage.createBucket(bucket, { public: true, allowedMimeTypes: ["image/jpeg"], fileSizeLimit: 2000000 });
    if (created.error) throw new Error("Não foi possível criar o bucket aprovado.");
  }
  for (const { row, bytes } of files) {
    const result = await supabase.storage.from(bucket).upload(row.file, bytes, { upsert: true, contentType: "image/jpeg" });
    if (result.error) throw new Error(`Upload não concluído: ${row.patrimonio}.`);
  }
  let professor;
  for (let page = 1; ; page++) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (result.error) throw new Error("Não foi possível consultar conta de correção.");
    professor = result.data.users.find(u => u.email?.toLowerCase() === "marcelo.grilo@institutojef.org.br");
    if (professor || result.data.users.length < 100) break;
  }
  if (!professor) {
    const created = await supabase.auth.admin.createUser({ email: "marcelo.grilo@institutojef.org.br", password: PROFESSOR_PASSWORD, email_confirm: true });
    if (created.error || !created.data.user) throw new Error("Não foi possível provisionar conta de correção.");
    professor = created.data.user;
  }
  const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL });
  try {
    const seeded = await seedPractice(prisma, manifest, `${SUPABASE_URL}/storage/v1/object/public/${bucket}/`);
    await prisma.profile.upsert({ where: { userId: professor.id }, create: { userId: professor.id, displayName: "Professor" }, update: {} });
    const memberships = await prisma.membership.findMany({ where: { userId: professor.id } });
    if (memberships.some(m => m.tenantId !== seeded.tenantId || m.role !== "collaborator")) throw new Error("Conta de correção já possui associações incompatíveis; revisar manualmente.");
    await prisma.membership.upsert({ where: { tenantId_userId: { tenantId: seeded.tenantId, userId: professor.id } }, create: { tenantId: seeded.tenantId, userId: professor.id, role: "collaborator" }, update: {} });
    const loans = await prisma.loan.count({ where: { tenantId: seeded.tenantId, borrowerId: professor.id } });
    if (loans !== 0) throw new Error("Conta de correção já possui empréstimos; não foram removidos. Revisar manualmente.");
    console.log("12 equipamentos preparados, fotos enviadas e conta de correção com zero empréstimos. Senha de conta existente não foi alterada.");
  } finally { await prisma.$disconnect(); }
} catch {
  console.error("Provisionamento não concluído; revise configuração privada, manifesto e painel sem divulgar segredos. Nenhuma tentativa de apagar dados foi feita.");
  process.exitCode = 1;
}
