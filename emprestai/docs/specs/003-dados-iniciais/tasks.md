# Tarefas 003

Cada tarefa cabe em um commit, cita CA e segue rules/checks.md. Não marcar concluída antes de existir evidência.

- [x] T1 — Registrar decisões TI-0010, local de retirada, transformação e DDL; delimitar pendências (CA-01, CA-03). Evidência: `spec.md`, `docs/PRD.md` e `docs/verificacao-pratica.md`.
- [x] T2 — Implementar busca/cache Pixabay e manifesto, com falha segura sem chave (CA-03). Evidência: `skills/imagens-equipamentos/scripts/pipeline.mjs` e `pipeline.test.mjs`; busca autenticada inicial registrada em `docs/evidencias/revisao-imagens.md`.
- [x] T3 — Implementar dimensões exatas, unicidade e validação do manifesto com testes negativos (CA-03, CA-07; depende de transformação aprovada). Evidência: validação/preparo com Sharp e testes locais; fotos finais ainda dependem de revisão completa.
- [x] T4 — Selecionar/revisar 12 fotos, registrar rejeições reais e manifesto final (CA-03). Evidência: `docs/evidencias/revisao-imagens.md` e `docs/evidencias/manifest-imagens-2026-11.json`; quatro fallbacks autorizados pelo usuário, com os desvios descritos. CA-03 não é considerado plenamente satisfeito.
- [x] T5 — Criar migration image_url aprovada e validar histórico do zero localmente (CA-01, CA-04, CA-07). Evidência: migration Prisma aplicada/testada em Postgres local descartável; nenhuma migration remota executada.
- [x] T6 — Implementar seed idempotente dos equipamentos com testes de repetição e zero empréstimos (CA-01, CA-02, CA-07). Evidência: seed transacional/idempotente e testes locais; execução remota pendente.
- [x] T7 — Preparar provisionamento humano Auth/perfil/membership e upload determinístico sem segredo versionado (CA-02, CA-04, CA-05). Evidência: `scripts/provision-pratica.mjs`; não executado contra produção.
- [x] T8 — Integrar contexto tRPC e autenticação SSR real, cookie httpOnly, renovação/logout e testes (CA-06, CA-07). Evidência: testes locais da autenticação e sessão SSR.
- [ ] T9 — Validar execução humana remota, URLs públicas, acesso da conta professor e zero empréstimos (CA-04, CA-05, CA-06).
- [ ] T10 — Registrar revisão independente final e evidências em ENTREGA.md (CA-08).

T9 e T10 permanecem abertas: a validação remota/conta do professor não foi executada. T4 registra que há 12 arquivos preparados, incluindo quatro fallbacks autorizados que mantêm desvios do critério CA-03; isso não transforma a spec em PRONTA. A revisão independente atual é parcial, não um aceite final.
