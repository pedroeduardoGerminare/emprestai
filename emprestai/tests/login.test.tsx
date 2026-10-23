// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/components/login-page";

afterEach(cleanup);

it("test_ca_01_login_informa_erros_associados_aos_campos", async () => {
  render(<LoginPage />);
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
  expect(await screen.findByText("Informe um e-mail válido.")).toBeTruthy();
  expect(screen.getByLabelText("E-mail").getAttribute("aria-describedby")).toBe("email-error");
  expect(screen.getByLabelText("Senha").getAttribute("aria-invalid")).toBe("true");
});

it("test_ca_01_login_demonstrativo_nao_envia_credenciais_nem_navega_para_catalogo", async () => {
  const request = vi.spyOn(globalThis, "fetch");
  const user = userEvent.setup();
  render(<LoginPage />);
  await user.type(screen.getByLabelText("E-mail"), "demo@example.com");
  await user.type(screen.getByLabelText("Senha"), "senha-de-demonstracao");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
  expect(await screen.findByText("O acesso será liberado após a configuração dos convites.")).toBeTruthy();
  expect(request).not.toHaveBeenCalled();
  request.mockRestore();
});
