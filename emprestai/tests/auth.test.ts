import { describe, expect, it, vi } from "vitest";
import { authCookieOptions, resolveSession, type SessionClient } from "@/server/auth";
import { getAuthEnv, getServerEnv } from "@/server/env";
import { resolveTenant, type MembershipLookup } from "@/server/api/context";

function sessionClient(value: unknown): SessionClient {
  return { getUser: vi.fn().mockResolvedValue(value) } as unknown as SessionClient;
}

describe("Spec 003 — autenticação no servidor", () => {
  it("test_ca_06_sessao_e_validada_por_getUser_e_nao_por_cookie_declarado", async () => {
    const client = sessionClient({ data: { user: { id: "user-a", email: "a@example.com" } }, error: null });
    expect(await resolveSession(client)).toEqual({ userId: "user-a", email: "a@example.com" });
    expect(client.getUser).toHaveBeenCalledOnce();
  });
  it("test_ca_06_sessao_ausente_expirada_ou_falha_nao_autentica", async () => {
    expect(await resolveSession(sessionClient({ data: { user: null }, error: null }))).toBeNull();
    expect(await resolveSession(sessionClient({ data: { user: { id: "forged" } }, error: { message: "expired" } }))).toBeNull();
    expect(await resolveSession({ getUser: vi.fn().mockRejectedValue(new Error("offline")) } as unknown as SessionClient)).toBeNull();
  });
  it("test_ca_06_cookie_httpOnly_sameSite_path_e_secure_nao_podem_ser_rebaixados", () => {
    expect(authCookieOptions({ httpOnly: false, secure: false, sameSite: "none", path: "/wrong", maxAge: 42 }, true)).toEqual({ httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 42 });
    expect(authCookieOptions({}, false).secure).toBe(false);
  });
  it("test_ca_06_configuracao_invalida_nao_expoe_valores_em_erro", () => {
    expect(() => getAuthEnv({ SUPABASE_URL: "private-invalid-value" })).toThrow("Configuração de autenticação ausente ou inválida.");
    expect(() => getServerEnv({ SUPABASE_URL: "https://example.com", SUPABASE_PUBLISHABLE_KEY: "public", DATABASE_URL: "private-invalid-value" })).toThrow("Configuração de banco ausente ou inválida.");
  });
  it("test_ca_06_tenant_vem_do_usuario_validado_e_rejeita_multiplas_associacoes", async () => {
    const findMany = vi.fn().mockResolvedValue([{ tenantId: "tenant-a", role: "collaborator", tenant: { slug: "suporte_ti" } }]);
    const memberships = { findMany } as unknown as MembershipLookup;
    expect(await resolveTenant({ userId: "user-a", email: null }, memberships)).toEqual({ tenantId: "tenant-a", role: "collaborator" });
    expect(findMany).toHaveBeenCalledWith({ where: { userId: "user-a" }, include: { tenant: true } });
    findMany.mockResolvedValue([]);
    await expect(resolveTenant({ userId: "user-a", email: null }, memberships)).rejects.toMatchObject({ code: "FORBIDDEN" });
    findMany.mockResolvedValue([{ tenant: { slug: "suporte_ti" } }, { tenant: { slug: "other" } }]);
    await expect(resolveTenant({ userId: "user-a", email: null }, memberships)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(await resolveTenant(null, memberships)).toBeNull();
  });
});
