import { validatePracticeManifest } from "../prisma/seed-pratica.ts";

export function validateProductionTarget(databaseUrl, project) {
  let url;
  try { url = new URL(databaseUrl); } catch { throw new Error("Conexão Prisma inválida."); }
  const direct = url.hostname === `db.${project}.supabase.co` && decodeURIComponent(url.username) === "postgres";
  const pooler = url.hostname.endsWith(".pooler.supabase.com") && decodeURIComponent(url.username) === `postgres.${project}`;
  if (!["postgres:", "postgresql:"].includes(url.protocol) || (!direct && !pooler) || !["5432", "6543"].includes(url.port || "5432") || url.pathname !== "/postgres" || !url.password) throw new Error("Conexão Prisma não pertence ao projeto Supabase aprovado.");
}
export { validatePracticeManifest };
