# EmpresTI

Sistema interno de empréstimo de equipamentos. A aplicação fica nesta pasta; o repositório Git começa na pasta superior.

## Estado atual

Tarefa T1 da spec 001 concluída: Next.js App Router, TypeScript strict, Tailwind, Open Sans e tema Nocturne escuro. A rota `/` mostra a base visual, sem login ou persistência. `index.html` é somente a referência histórica do protótipo e não é servido pelo Next.

## Comandos verificados

Na pasta `emprestai/`:

```powershell
npm.cmd install --no-fund --no-audit
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Os scripts chamam os executáveis JavaScript diretamente para evitar falha dos atalhos de pacote no caminho Windows desta máquina. Build validado com Node 24.19.0. As dependências estão fixadas em package-lock.json. O build baixa a Open Sans e a hospeda junto da aplicação.

## Próximas etapas

Seguir `docs/specs/001-telas/tasks.md`. Banco e publicação estão descritos em `docs/plano-publicacao.md`; a modelagem conceitual foi aprovada, mas o DDL ainda precisa de revisão antes de gerar migrations. GitHub, Supabase novo e Vercel ainda não foram criados.

Segredos de `.env` são ignorados pelo Git. A base visual não lê variáveis de ambiente nem acessa o projeto Supabase antigo.
