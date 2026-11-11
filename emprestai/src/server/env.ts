import { z } from "zod";

const authEnv = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export function getAuthEnv(source: Record<string, string | undefined> = process.env) {
  const parsed = authEnv.safeParse(source);
  if (!parsed.success) throw new Error("Configuração de autenticação ausente ou inválida.");
  return parsed.data;
}

export function getServerEnv(source: Record<string, string | undefined> = process.env) {
  const auth = getAuthEnv(source);
  const database = z.url().safeParse(source.DATABASE_URL);
  if (!database.success) throw new Error("Configuração de banco ausente ou inválida.");
  return { ...auth, DATABASE_URL: database.data };
}
