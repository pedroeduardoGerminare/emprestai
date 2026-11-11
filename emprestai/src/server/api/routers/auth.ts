import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { resolveSession } from "../../auth";
import { resolveTenant } from "../context";
import { publicProcedure, router } from "../trpc";

const invalidLogin = () => new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos, ou conta sem acesso." });

export const authRouter = router({
  login: publicProcedure.input(z.object({ email: z.email().max(254), password: z.string().min(1).max(1024) })).mutation(async ({ ctx, input }) => {
    try {
      const result = await ctx.auth.auth.signInWithPassword(input);
      if (result.error) throw invalidLogin();
      const session = await resolveSession(ctx.auth.auth);
      if (!session) throw invalidLogin();
      const membership = await resolveTenant(session, ctx.db.membership);
      if (!membership) throw invalidLogin();
      return { authenticated: true as const };
    } catch {
      await ctx.auth.auth.signOut({ scope: "local" }).catch(() => undefined);
      throw invalidLogin();
    }
  }),
  logout: publicProcedure.input(z.void()).mutation(async ({ ctx }) => {
    const { error } = await ctx.auth.auth.signOut({ scope: "local" });
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível encerrar a sessão." });
    return { authenticated: false as const };
  }),
  session: publicProcedure.input(z.void()).query(({ ctx }) => ({
    authenticated: Boolean(ctx.session && ctx.tenantId),
    user: ctx.session && ctx.tenantId ? { id: ctx.session.userId, email: ctx.session.email } : null,
  })),
});
