# EmpresTI

## Atividade autorizada em 11/nov/2026

Atualização de publicação: após falha de acesso à equipe antiga, usuário autorizou explicitamente criar novo projeto Vercel na conta pessoal e trocar o MCP para essa conta. Novo domínio confirmado emprestai-five.vercel.app, projeto emprestai na equipe pedroeduardonascimento17-4822 (team_74NgBU6KrPcleHTIlKbdlSue), conectado ao mesmo GitHub. Não voltar a exigir domínio antigo: essa restrição foi substituída pelo usuário. Supabase existente permanece o alvo; não criar banco novo por falta de acesso. Usuário confirmou manter exigência de fotos sem marca/texto; 8 aprovadas, 4 bloqueadas.

Executar Aula 11 e depois prática SDD, em tarefas sequenciais com testes e commits. Esta atividade amplia o escopo histórico da entrega 002: autenticação real, imagens, dados iniciais, catálogo e solicitação. Pixabay substitui Pexels por decisão explícita do usuário. Não colocar dados de acesso do professor no README. Preservar GitHub e projeto/domínio Vercel existentes. Decisões ambíguas de negócio continuam sendo do usuário; não fabricar histórico ou evidência de aprovação.

## Subagentes

- Fonte do papel: agents/verificador-spec.md; adaptação Codex derivada em .codex/agents/verificador-spec.toml na raiz da aplicação.
- Limitação: o arquivo de papel não impõe isolamento técnico de ferramentas no harness desta conversa. Proibições são instruções, não garantia de sandbox por agente. Não alegar impossibilidade técnica de escrita sem sessão isolada comprovada.
- Antes de concluir spec, delegar com contexto limpo, caminho da spec e commits/diff. O verificador lê as regras explicitamente e não corrige.
- Sem suporte nativo, usar sessão limpa com a instrução do papel e as entradas obrigatórias.

## Escopo confirmado em 23/out/2026

O usuário restringiu esta entrega à página inicial, modelagem Supabase, GitHub/main e Vercel, sem MVP, e autorizou concluir tudo em sequência sem pausas por tarefa. Spec ativa: docs/specs/002-infraestrutura. Não executar T3–T10 da spec 001. Organização, custo zero e DDL completo foram aprovados. Ver docs/infraestrutura.md e handoff.md para os links e o estado atual, que substituem as notas históricas abaixo.

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

