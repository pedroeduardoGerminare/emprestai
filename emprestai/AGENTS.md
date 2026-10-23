# EmpresTI

Sistema interno de empréstimo de equipamentos (notebooks, monitores, cabos, câmeras).
Serve a colaboradores (catálogo, pedido, devolução) e a Operações (cadastro e balcão).
Negócio em docs/PRD.md. Stack decidida em docs/adr/001-stack.md.

## Onde olhar

- docs/PRD.md — o que o negócio precisa. Não é spec.
- docs/adr/ — decisões técnicas já tomadas e o motivo delas.
- docs/specs/<NNN-funcionalidade>/ — spec, plano e tarefas de cada feature.
- rules/ — como se trabalha aqui. Leia rules/restrictions.md sempre.

## Comandos

- subir o banco local: ainda não há — nenhum comando de app foi rodado nesta máquina
- rodar o projeto: ainda não há — nenhum comando de app foi rodado nesta máquina
- rodar os testes: `npm.cmd test`, dentro de `emprestai/` — validado em 23/out/2026
- buildar: `npm.cmd run build`, dentro de `emprestai/` — validado em 23/out/2026

Só entram comandos que eu já rodei nesta máquina.

## Ambiente

- Banco: Supabase. O desenvolvimento acontece no banco LOCAL.
- Deploy: Vercel, ligada ao repositório remoto. Push publica.
- Configuração vem de variável de ambiente. Ver .env.example.

## Precedência

Se dois artefatos discordarem sobre comportamento, a spec vence o código.
Se algo não estiver escrito em lugar nenhum, pergunte — não decida.

## Estado atual do projeto

T1 da spec 001 concluída em 23/out/2026: package.json, Next App Router, TypeScript strict, Tailwind, Open Sans, tokens Nocturne e 9 testes de contraste. Build e typecheck aprovados. A rota `/` é base visual; login ainda não foi portado. Existem docs/specs e rules. Não existem Prisma, tRPC, migrations, banco local configurado ou publicação. `.env` antigo permanece incompleto e ignorado pelo Git.

O que há hoje:

- `docs/PRD.md` — v1 do negócio
- `docs/adr/001-stack.md` — stack
- `layout.md` — telas e tokens
- `stacks.md` — rascunho que alimentou o ADR; se divergir, vence o ADR
- `.env` — URL do projeto Supabase `vmlnbyldrcfzvxgcrdrc`, chave publishable, e host/porta/user/database da conexão **direta** (5432). Sem senha, sem URL do pooler (6543), sem `DATABASE_URL` local, sem `service_role`

Falta: tarefas T2 em diante da spec 001, Prisma, seed `suporte_ti`, GitHub Actions, Sentry, spec de banco e publicação. Ver docs/plano-publicacao.md.

## Procedimentos

