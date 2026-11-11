// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EquipmentApp } from "@/components/equipment-app";

const mocks = vi.hoisted(() => ({
  borrow: vi.fn(), invalidateList: vi.fn(), invalidateMine: vi.fn(),
  callbacks: {} as { onSuccess?: () => Promise<void> },
  state: { authenticated: true, sessionPending: false, catalogPending: false, loansPending: false,
    emptyCatalog: false, emptyLoans: false, mutationPending: false, mutationSuccess: false,
    mutationError: undefined as undefined | { message: string }, catalogError: false, loansError: false },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/trpc", () => ({ api: {
  useUtils: () => ({ invalidate: vi.fn(), equipment: { list: { invalidate: mocks.invalidateList }, mine: { invalidate: mocks.invalidateMine } } }),
  auth: { session: { useQuery: () => ({ data: { authenticated: mocks.state.authenticated }, isPending: mocks.state.sessionPending }) }, logout: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } },
  equipment: {
    list: { useQuery: () => ({ isPending: mocks.state.catalogPending, error: mocks.state.catalogError, data: mocks.state.catalogPending ? undefined : { items: mocks.state.emptyCatalog ? [] : [
      { id: "available", assetTag: "TI-0001", name: "Notebook", category: { name: "Notebooks" }, imageUrl: null, availability: "available" },
      { id: "maintenance", assetTag: "TI-0004", name: "Notebook manutenção", category: { name: "Notebooks" }, imageUrl: null, availability: "maintenance" },
      { id: "borrowed", assetTag: "TI-0002", name: "Notebook emprestado", category: { name: "Notebooks" }, imageUrl: null, availability: "borrowed" },
    ] } }) },
    mine: { useQuery: () => ({ isPending: mocks.state.loansPending, error: mocks.state.loansError, data: mocks.state.loansPending ? undefined : mocks.state.emptyLoans ? [] : [{ id: "loan", dueAt: new Date("2026-11-25T12:00:00Z"), equipment: { assetTag: "TI-0001", name: "Notebook" } }] }) },
    borrow: { useMutation: (callbacks: typeof mocks.callbacks) => { mocks.callbacks = callbacks; return { mutate: mocks.borrow, isPending: mocks.state.mutationPending, isSuccess: mocks.state.mutationSuccess, error: mocks.state.mutationError, variables: { equipmentId: "available" } }; } },
  },
} }));

afterEach(() => {
  cleanup(); vi.clearAllMocks(); mocks.callbacks = {};
  Object.assign(mocks.state, { authenticated: true, sessionPending: false, catalogPending: false, loansPending: false, emptyCatalog: false, emptyLoans: false, mutationPending: false, mutationSuccess: false, mutationError: undefined, catalogError: false, loansError: false });
});

it("test_ca_01_ca_07_catalogo_permite_disponivel_e_bloqueia_manutencao_e_emprestado", async () => {
  render(<EquipmentApp screen="catalog" />);
  const actions = screen.getAllByRole("button", { name: "Solicitar empréstimo" });
  for (const action of actions.slice(1)) { expect(action.hasAttribute("disabled")).toBe(true); await userEvent.click(action); }
  expect(mocks.borrow).not.toHaveBeenCalled();
  await userEvent.click(actions[0]);
  expect(mocks.borrow).toHaveBeenCalledWith({ equipmentId: "available" });
  expect(screen.getByText("Em manutenção")).toBeTruthy(); expect(screen.getByText("Emprestado")).toBeTruthy();
});
it("test_ca_06_meus_emprestimos_mostra_item_e_prazo_dd_mmm_pt_br", () => {
  render(<EquipmentApp screen="loans" />);
  expect(screen.getByText("TI-0001")).toBeTruthy();
  expect(screen.getByText(/Devolver até/).textContent).toBe("Devolver até 25/nov");
});
it("test_ca_01_anonimo_recebe_acesso_ao_login_sem_catalogo", () => {
  mocks.state.authenticated = false;
  render(<EquipmentApp screen="catalog" />);
  expect(screen.getByRole("link", { name: "Ir para login" }).getAttribute("href")).toBe("/login");
  expect(screen.queryByText("TI-0001")).toBeNull();
});
it("test_ca_07_sucesso_invalida_catalogo_e_meus_emprestimos_e_informa_confirmacao", async () => {
  const view = render(<EquipmentApp screen="catalog" />);
  await userEvent.click(screen.getAllByRole("button", { name: "Solicitar empréstimo" })[0]);
  expect(mocks.borrow).toHaveBeenCalledWith({ equipmentId: "available" });
  expect(mocks.callbacks.onSuccess).toBeTypeOf("function");
  await act(async () => { await mocks.callbacks.onSuccess!(); });
  expect(mocks.invalidateList).toHaveBeenCalledTimes(1); expect(mocks.invalidateMine).toHaveBeenCalledTimes(1);
  mocks.state.mutationSuccess = true; view.rerender(<EquipmentApp screen="catalog" />);
  expect(screen.getByRole("status").textContent).toContain("Empréstimo confirmado");
});
it("test_ca_07_recusa_mostra_motivo_em_alerta_sem_invalidar_listas", () => {
  mocks.state.mutationError = { message: "Você já tem três empréstimos em aberto." };
  render(<EquipmentApp screen="catalog" />);
  expect(screen.getByRole("alert").textContent).toBe("Você já tem três empréstimos em aberto.");
  expect(mocks.invalidateList).not.toHaveBeenCalled(); expect(mocks.invalidateMine).not.toHaveBeenCalled();
});
it("test_ca_07_carregamento_de_sessao_catalogo_e_emprestimos", () => {
  mocks.state.sessionPending = true;
  const view = render(<EquipmentApp screen="catalog" />);
  expect(screen.getByRole("status").textContent).toBe("Conferindo acesso…");
  mocks.state.sessionPending = false; mocks.state.catalogPending = true; view.rerender(<EquipmentApp screen="catalog" />);
  expect(screen.getByRole("status").textContent).toBe("Carregando equipamentos…");
  mocks.state.loansPending = true; view.rerender(<EquipmentApp screen="loans" />);
  expect(screen.getByRole("status").textContent).toBe("Carregando seus empréstimos…");
});
it("test_ca_07_listas_vazias_informam_ausencia_de_dados", () => {
  mocks.state.emptyCatalog = true; mocks.state.emptyLoans = true;
  const view = render(<EquipmentApp screen="catalog" />);
  expect(screen.getByText("Nenhum equipamento cadastrado.")).toBeTruthy();
  view.rerender(<EquipmentApp screen="loans" />);
  expect(screen.getByText("Você não tem empréstimos em aberto.")).toBeTruthy();
});
it("test_ca_07_pedido_pendente_desabilita_acoes_e_informa_solicitando", () => {
  mocks.state.mutationPending = true;
  render(<EquipmentApp screen="catalog" />);
  expect(screen.getByRole("button", { name: "Solicitando…" }).hasAttribute("disabled")).toBe(true);
  for (const button of screen.getAllByRole("button", {name:"Solicitar empréstimo"})) expect(button.hasAttribute("disabled")).toBe(true);
});
it("test_ca_07_falhas_de_carregamento_tem_mensagem_textual", () => {
  mocks.state.catalogError = true; mocks.state.loansError = true;
  const view = render(<EquipmentApp screen="catalog" />);
  expect(screen.getByRole("alert").textContent).toBe("Não foi possível carregar os equipamentos.");
  view.rerender(<EquipmentApp screen="loans" />);
  expect(screen.getByRole("alert").textContent).toBe("Não foi possível carregar seus empréstimos.");
});

