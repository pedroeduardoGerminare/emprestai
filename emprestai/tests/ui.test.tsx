// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { LimitSegments, Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

afterEach(cleanup);

describe("Componentes Nocturne", () => {
  it("test_ca_01_botao_secundario_nao_envia_formulario_e_acao_desabilitada_nao_dispara", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event) => event.preventDefault());
    const action = vi.fn();
    render(<form onSubmit={submit}><Button>Cancelar</Button><Button variant="primary" disabled onClick={action}>Confirmar</Button></form>);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(submit).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });

  it("test_ca_01_botao_as_child_preserva_navegacao_sem_aninhar_interativos", () => {
    render(<Button asChild variant="primary"><a href="/catalogo">Catálogo</a></Button>);
    expect(screen.getByRole("link", { name: "Catálogo" }).getAttribute("href")).toBe("/catalogo");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("test_ca_12_input_tem_rotulo_e_participa_da_ordem_de_foco", async () => {
    const user = userEvent.setup();
    render(<><label htmlFor="email">E-mail</label><Input id="email" type="email" autoComplete="email" /><Button>Entrar</Button></>);
    await user.tab();
    const input = screen.getByRole("textbox", { name: "E-mail" });
    expect(document.activeElement).toBe(input);
    await user.type(input, "pessoa@empresa.com");
    expect((input as HTMLInputElement).value).toBe("pessoa@empresa.com");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Entrar" }));
  });

  it("test_ca_12_chip_controlado_pode_ser_acionado_com_teclado", async () => {
    function Filter() {
      const [active, setActive] = useState(false);
      return <Chip active={active} onClick={() => setActive(!active)}>Só disponíveis</Chip>;
    }
    const user = userEvent.setup();
    render(<Filter />);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Só disponíveis" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("test_ca_12_segmentado_seleciona_por_setas_e_ignora_opcao_desabilitada", async () => {
    function StatePicker() {
      const [value, setValue] = useState("available");
      return <SegmentedControl label="Situação inicial" value={value} onValueChange={setValue} options={[
        { value: "available", label: "Disponível" },
        { value: "maintenance", label: "Em manutenção", disabled: true },
        { value: "retired", label: "Fora de uso" },
      ]} />;
    }
    const user = userEvent.setup();
    render(<StatePicker />);
    const group = screen.getByRole("group", { name: "Situação inicial" });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect((within(group).getByRole("radio", { name: "Fora de uso" }) as HTMLInputElement).checked).toBe(true);
    expect((within(group).getByRole("radio", { name: "Em manutenção" }) as HTMLInputElement).checked).toBe(false);
  });

  it("test_ca_12_dialogo_trava_foco_fecha_com_escape_e_restaura_acionador", async () => {
    const user = userEvent.setup();
    render(<><Button>Fora do diálogo</Button><Dialog>
      <DialogTrigger asChild><Button>Solicitar</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirmar empréstimo</DialogTitle>
        <DialogDescription>O prazo começa na confirmação.</DialogDescription>
        <DialogFooter><DialogClose asChild><Button>Cancelar</Button></DialogClose><Button variant="confirm">Confirmar</Button></DialogFooter>
      </DialogContent>
    </Dialog></>);
    const trigger = screen.getByRole("button", { name: "Solicitar" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Confirmar empréstimo" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Cancelar" })));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Confirmar" }));
    await user.tab();
    expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Cancelar" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("test_ca_01_indicadores_expoem_valores_limitados_sem_estilo_inline", () => {
    const { container, rerender } = render(<><Progress label="Prazo decorrido" value={19} /><LimitSegments value={8} /></>);
    const progress = screen.getByRole("progressbar", { name: "Prazo decorrido" }) as HTMLProgressElement;
    expect(progress.value).toBe(14);
    expect(progress.max).toBe(14);
    expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("3");
    expect(container.querySelector("[style]")).toBeNull();
    rerender(<><Progress label="Prazo decorrido" value={Number.NaN} max={0} /><LimitSegments value={-1} /></>);
    expect((screen.getByRole("progressbar") as HTMLProgressElement).value).toBe(0);
    expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("0");
  });

  it("test_ca_01_tabela_preserva_semantica_para_leitor_de_tela", () => {
    render(<Table><TableCaption>Empréstimos em aberto</TableCaption><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Prazo</TableHead></TableRow></TableHeader>
      <TableBody><TableRow overdue><TableCell>ThinkPad T14</TableCell><TableCell>14/set · Em atraso</TableCell></TableRow></TableBody></Table>);
    const table = screen.getByRole("table", { name: "Empréstimos em aberto" });
    expect(within(table).getByRole("columnheader", { name: "Item" }).getAttribute("scope")).toBe("col");
    expect(within(table).getByRole("cell", { name: "14/set · Em atraso" })).toBeTruthy();
  });
});
