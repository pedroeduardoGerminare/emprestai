// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/components/login-page";

const { mutate, push, refresh } = vi.hoisted(() => ({ mutate: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("@/lib/trpc", () => ({ api: { auth: { login: { useMutation: () => ({ mutate, isPending: false }) } } } }));

afterEach(cleanup);

it("test_ca_01_login_informa_erros_associados_aos_campos", async () => {
  render(<LoginPage />);
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
  expect(await screen.findByText("Informe um e-mail válido.")).toBeTruthy();
  expect(screen.getByLabelText("E-mail").getAttribute("aria-describedby")).toBe("email-error");
  expect(screen.getByLabelText("Senha").getAttribute("aria-invalid")).toBe("true");
});

it("test_ca_06_login_valido_solicita_autenticacao_sem_navegar_antes_da_resposta", async () => {
  mutate.mockClear(); push.mockClear();
  const user = userEvent.setup();
  render(<LoginPage />);
  await user.type(screen.getByLabelText("E-mail"), "demo@example.com");
  await user.type(screen.getByLabelText("Senha"), "senha-de-demonstracao");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
  expect(mutate).toHaveBeenCalledWith({ email: "demo@example.com", password: "senha-de-demonstracao" });
  expect(push).not.toHaveBeenCalled();
});
