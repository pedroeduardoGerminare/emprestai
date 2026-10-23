export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center gap-5 bg-bg p-14 text-text">
      <p className="text-sm font-semibold tracking-[.02em] text-accent-400">EmpresTI</p>
      <h1 className="max-w-[20ch] text-[34px] leading-[1.15] font-semibold tracking-[-.01em]">
        Quem está com o quê
      </h1>
      <p className="max-w-[38ch] text-sm leading-relaxed text-text-muted">
        Pedido e devolução sem planilha.
      </p>
    </main>
  );
}
