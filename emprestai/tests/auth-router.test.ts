import { expect, it, vi } from "vitest";
import { appRouter } from "@/server/api/root";
import { resolveOptionalTenant, type Context, type MembershipLookup } from "@/server/api/context";
import { validMutationRequest } from "@/server/auth-request";

function fixture() {
  const auth = {
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: "a", email: "a@example.com" } }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  const findMany = vi.fn().mockResolvedValue([{ tenantId: "tenant-a", role: "collaborator", tenant: { slug: "suporte_ti" } }]);
  const ctx = { auth: { auth }, db: { membership: { findMany } }, session: null, tenantId: null, role: null } as unknown as Context;
  return { auth, findMany, ctx, caller: appRouter.createCaller(ctx) };
}

it("test_ca_06_login_valida_identidade_e_membership_e_retorna_sem_tokens", async () => {
  const { caller, auth } = fixture();
  expect(await caller.auth.login({ email: "a@example.com", password: "test-only" })).toEqual({ authenticated: true });
  expect(auth.getUser).toHaveBeenCalledOnce();
  expect(auth.signOut).not.toHaveBeenCalled();
});

it("test_ca_06_login_invalido_ou_sem_membership_limpa_sessao_e_erro_generico", async () => {
  const f = fixture();
  f.auth.signInWithPassword.mockResolvedValueOnce({ error: { message: "private" } });
  await expect(f.caller.auth.login({ email: "a@example.com", password: "test-only" })).rejects.toMatchObject({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos, ou conta sem acesso." });
  expect(f.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  f.findMany.mockResolvedValue([]);
  await expect(f.caller.auth.login({ email: "a@example.com", password: "test-only" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
});

it("test_ca_06_sessao_anonima_e_logout_nao_expoem_tokens", async () => {
  const { caller, auth } = fixture();
  expect(await caller.auth.session()).toEqual({ authenticated: false, user: null });
  expect(await caller.auth.logout()).toEqual({ authenticated: false });
  expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
});

it("test_ca_06_mutacao_rejeita_csrf_e_content_type_incorreto", () => {
  const request = (origin?: string, type = "application/json") => new Request("https://app.example.com/api/trpc/auth.login", { method: "POST", headers: { ...(origin ? { origin } : {}), "content-type": type } });
  expect(validMutationRequest(request())).toBe(false);
  expect(validMutationRequest(request("https://attacker.example.com"))).toBe(false);
  expect(validMutationRequest(request("https://app.example.com", "text/plain"))).toBe(false);
  expect(validMutationRequest(request("https://app.example.com"))).toBe(true);
});

it.each([{ rows: [] }, { rows: [{ tenant: { slug: "suporte_ti" } }, { tenant: { slug: "other" } }] }])("test_ca_06_sem_tenant_valido_permite_logout_e_novo_login_mas_bloqueia_catalogo $rows", async ({ rows }) => {
  const f = fixture();
  f.findMany.mockResolvedValue(rows);
  const session = { userId: "a", email: "a@example.com" };
  const membership = await resolveOptionalTenant(session, { findMany: f.findMany } as unknown as MembershipLookup);
  expect(membership).toBeNull();
  const caller = appRouter.createCaller({ ...f.ctx, session, tenantId: membership?.tenantId ?? null, role: membership?.role ?? null });
  expect(await caller.auth.session()).toEqual({ authenticated: false, user: null });
  await expect(caller.equipment.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  expect(await caller.auth.logout()).toEqual({ authenticated: false });
  f.findMany.mockResolvedValue([{ tenantId: "tenant-a", role: "collaborator", tenant: { slug: "suporte_ti" } }]);
  expect(await caller.auth.login({ email: "a@example.com", password: "test-only" })).toEqual({ authenticated: true });
});

it("test_ca_06_contexto_opcional_nao_engole_erro_de_banco", async () => {
  const failure = new Error("database offline");
  const findMany = vi.fn().mockRejectedValue(failure);
  await expect(resolveOptionalTenant({ userId: "a", email: null }, { findMany } as unknown as MembershipLookup)).rejects.toBe(failure);
});
