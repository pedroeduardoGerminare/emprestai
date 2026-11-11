import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createAuthClient, resolveSession, type AuthCookieStore } from "../auth";
import { getDatabase } from "../db";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof resolveSession>>>;
export type MembershipLookup = Pick<PrismaClient["membership"], "findMany">;

export async function resolveTenant(session: AuthSession | null, memberships: MembershipLookup) {
  if (!session) return null;
  const rows = await memberships.findMany({
    where: { userId: session.userId },
    include: { tenant: true },
  });
  if (rows.length !== 1 || rows[0].tenant.slug !== "suporte_ti") {
    throw new TRPCError({ code: "FORBIDDEN", message: "A conta não tem um contexto de acesso válido." });
  }
  return { tenantId: rows[0].tenantId, role: rows[0].role };
}

// Public Auth endpoints must remain reachable when a valid identity loses access.
// Only authorization denial becomes an absent tenant; database failures still fail closed.
export async function resolveOptionalTenant(session: AuthSession | null, memberships: MembershipLookup) {
  try {
    return await resolveTenant(session, memberships);
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") return null;
    throw error;
  }
}

export async function createContext(store: AuthCookieStore) {
  const auth = createAuthClient(store);
  const session = await resolveSession(auth.auth);
  const db = getDatabase();
  const membership = await resolveOptionalTenant(session, db.membership);
  return { auth, db, session, tenantId: membership?.tenantId ?? null, role: membership?.role ?? null };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
