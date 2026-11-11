"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

const availability = { available: "Disponível", borrowed: "Emprestado", maintenance: "Em manutenção", retired: "Fora de uso" };
const date = (value: Date) => {
  const parts = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }).formatToParts(new Date(value));
  return `${parts.find(part => part.type === "day")?.value}/${parts.find(part => part.type === "month")?.value.replace(".", "")}`;
};

export function EquipmentApp({ screen }: { screen: "catalog" | "loans" }) {
  const router = useRouter();
  const utils = api.useUtils();
  const session = api.auth.session.useQuery();
  const catalog = api.equipment.list.useQuery({ limit: 20 }, { enabled: session.data?.authenticated === true });
  const loans = api.equipment.mine.useQuery(undefined, { enabled: session.data?.authenticated === true });
  const logout = api.auth.logout.useMutation({ onSuccess: () => { utils.invalidate(); router.push("/login"); router.refresh(); } });
  const borrow = api.equipment.borrow.useMutation({ onSuccess: async () => { await Promise.all([utils.equipment.list.invalidate(), utils.equipment.mine.invalidate()]); } });

  if (session.isPending) return <main className="grid min-h-screen place-items-center"><p role="status">Conferindo acesso…</p></main>;
  if (!session.data?.authenticated) return <main className="grid min-h-screen place-items-center p-8"><div className="flex flex-col gap-5"><h1 className="text-xl">Entre para continuar</h1><p role="status">{session.error ? "Não foi possível conferir o acesso. Tente novamente." : "Sua sessão não está ativa."}</p><Link href="/login" className="text-accent-400 underline">Ir para login</Link></div></main>;

  return <main className="min-h-screen bg-bg text-text lg:pl-[236px]" data-screen-label={screen === "catalog" ? "02 Catálogo" : "04 Meus empréstimos"}>
    <aside className="flex flex-col gap-8 border-b border-neutral-800 bg-surface p-6 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[236px] lg:border-r lg:border-b-0">
      <Link href="/catalogo" className="text-lg font-semibold">EmpresTI</Link>
      <nav aria-label="Navegação principal" className="flex flex-col gap-5"><Link aria-current={screen === "catalog" ? "page" : undefined} href="/catalogo" className="text-sm text-text-muted">Catálogo</Link><Link aria-current={screen === "loans" ? "page" : undefined} href="/meus-emprestimos" className="text-sm text-text-muted">Meus empréstimos</Link></nav>
      <Button onClick={() => logout.mutate()} disabled={logout.isPending}>Sair</Button>
    </aside>
    <header className="flex h-16 items-center border-b border-neutral-800 px-7 text-sm text-text-muted">
      {screen === "catalog" ? "Catálogo" : "Meus empréstimos"}
    </header>
    <section className="flex max-w-6xl flex-col gap-7 px-7 py-8">
      <div className="flex flex-col gap-2"><p className="text-xs text-text-dim">Suporte de TI</p><h1 className="text-3xl font-semibold">{screen === "catalog" ? "Equipamentos" : "Meus empréstimos"}</h1><p className="text-sm text-text-muted">Até 3 itens por pessoa · prazo de 14 dias corridos.</p></div>
      {(borrow.error || logout.error) && <p role="alert" className="text-sm text-overdue">{borrow.error?.message || logout.error?.message}</p>}
      {borrow.isSuccess && <p role="status" className="text-sm text-text-muted">Empréstimo confirmado. Confira a devolução em Meus empréstimos.</p>}
      {screen === "catalog" ? <>
        {catalog.isPending && <p role="status">Carregando equipamentos…</p>}
        {catalog.error && <p role="alert">Não foi possível carregar os equipamentos.</p>}
        {catalog.data?.items.length === 0 && <p>Nenhum equipamento cadastrado.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{catalog.data?.items.map(item => <article key={item.id} className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-800 bg-surface p-5">
          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} width={800} height={600} className="aspect-[4/3] w-full rounded-md object-cover" /> : <div className="grid aspect-[4/3] place-items-center rounded-md bg-bg text-xs text-text-dim">Foto ainda indisponível</div>}
          <div className="flex flex-col gap-2"><p className="text-xs text-text-dim">{item.assetTag} · {item.category.name}</p><h2 className="text-base font-semibold">{item.name}</h2><p className="text-sm text-text-muted">{availability[item.availability]}</p></div>
          <Button variant="primary" disabled={item.availability !== "available" || borrow.isPending} onClick={() => borrow.mutate({ equipmentId: item.id })}>{borrow.isPending && borrow.variables?.equipmentId === item.id ? "Solicitando…" : "Solicitar empréstimo"}</Button>
        </article>)}</div>
        <p className="text-xs text-text-dim">Fotos: <a href="https://pixabay.com/" target="_blank" rel="noreferrer" className="underline">Pixabay</a></p>
      </> : <>
        {loans.isPending && <p role="status">Carregando seus empréstimos…</p>}
        {loans.error && <p role="alert">Não foi possível carregar seus empréstimos.</p>}
        {loans.data?.length === 0 && <p>Você não tem empréstimos em aberto.</p>}
        <div className="flex flex-col gap-4">{loans.data?.map(loan => <article key={loan.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-surface p-5"><div className="flex flex-col gap-2"><p className="text-xs text-text-dim">{loan.equipment.assetTag}</p><h2 className="font-semibold">{loan.equipment.name}</h2></div><p className="text-sm">Devolver até {date(loan.dueAt)}</p></article>)}</div>
      </>}
    </section>
  </main>;
}
