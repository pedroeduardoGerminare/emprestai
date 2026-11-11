import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({ transformer: superjson });
export const router = t.router;
export const publicProcedure = t.procedure;
export const tenantProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Entre para continuar." });
  if (!ctx.tenantId || !ctx.role) throw new TRPCError({ code: "FORBIDDEN", message: "Conta sem acesso a esta área." });
  return next({ ctx: { ...ctx, session: ctx.session, tenantId: ctx.tenantId, role: ctx.role } });
});
