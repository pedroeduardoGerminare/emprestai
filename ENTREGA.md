# Entrega da prática — em andamento

## Estado atualizado — 11/nov/2026

Nova publicação autorizada: https://emprestai-five.vercel.app, equipe pessoal pedroeduardonascimento17-4822, GitHub conectado. Produção ainda é login inicial da main; funcionalidades reais estão na branch codex/aula11-pratica-subagentes. O preview da branch foi bloqueado porque o email autor dos commits anteriores não está associado ao GitHub conectado. Vercel MCP confirma a conta correta, mas ainda não lista o projeto pela API. Supabase zvemdkmoagksupyyosuk está ativo novamente. Nenhuma migration, seed, upload ou usuário remoto foi escrito.

Implementação local: Auth SSR/tRPC, catálogo, solicitar e meus empréstimos, migration imagem e seed idempotente. Última suíte60 testes/10 arquivos passou; build Webpack completo com TypeScript passou após correções da revisão. Detalhes docs/verificacao-pratica.md. Sharp e DDL aprovados; TI0010 manutenção; retirada Balcão de Operações conforme spec001.

Fotos8 aprovadas/4 bloqueadas; usuário manteve restrições. Conta professor,12 fotos, provisionamento humano, ambiente runtime Vercel, validação ponta a ponta e tag final pendentes. O restante deste documento preserva o histórico, subordinado a este estado atualizado.

## Links
- Repositório: https://github.com/pedroeduardoGerminare/emprestai
- Produção criada nesta atividade: https://emprestai-five.vercel.app
- Produção histórica: https://emprestai-eta.vercel.app

Não há tag final desta prática. A produção histórica não representa ainda as specs 003/004.

## 1. Conflitos

| pedido | contrariava o quê | decisão/evidência |
|---|---|---|
| 5 itens e 14 dias úteis | PRD: 3 itens e 14 dias | Usuário confirmou manter PRD em 11/nov/2026; specs 003/004, b90501b. |
| Pexels | Acesso à API indisponível ao usuário | Usuário substituiu por Pixabay; skill e specs, b90501b. |
| Verificador corrigir teste | Independência da verificação | Principal corrige e pede nova rodada; agents/verificador-spec.md, 650f1f3. |
| Senha no seed | Proibição de segredos no código/Git | Usar variável privada; conta não documentada no README por pedido explícito. |
| Supabase CLI reset nos checks | ADR: Prisma único dono de migrations | Checks corrigidos no commit 650f1f3. |

## 1b. Decisões resolvidas e lacunas

TI-0010 segue a lista de equipamentos e fica em manutenção; retirada no Balcão de Operações, conforme spec 001. O usuário aprovou Sharp e DDL nullable `image_url`. Permanecem pendentes quatro fotos compatíveis e a execução humana remota. Ver `emprestai/docs/specs/003-dados-iniciais/tasks.md`.

## 2. Onde o agente tentou decidir

O usuário definiu que o PRD prevalece para limite de três itens e prazo de 14 dias corridos. Para TI-0010, pediu seguir a lista de equipamentos; ele fica em manutenção.

## 3. Decisão técnica e ADR

Troca Pexels → Pixabay foi exigência explícita do usuário e registrada na skill/spec. Não foi escrito ADR pelo agente, respeitando a autoridade do time. Sharp e coluna de imagem foram aprovadas; migration aplicada apenas em Postgres local descartável.

## 4. Skill imagens-equipamentos

`SKILL.md` contém fluxo e limites; `references/contrato.md` registra condições do fornecedor; `scripts/pipeline.mjs` implementa cache, origem permitida, revisão obrigatória, unicidade e preparo. Testes negativos passaram. O preparo final não foi executado porque só 8 fotos foram aprovadas; não existe upload nessa skill.

Chave obtida da sessão autenticada e configurada somente no ambiente local ignorado. Busca real autenticada realizada com cache local. Foram aprovadas 8 de 12 fotos após 21 buscas refinadas. Uma tentativa adicional não alcançou Pixabay por falha DNS da rede local. O usuário manteve a restrição de não usar marca ou texto legível.

## 5. Subagente verificador

Fonte em emprestai/agents/verificador-spec.md e adaptação Codex em emprestai/.codex/agents/verificador-spec.toml. spec-flow exige delegação antes de concluir. Contexto limpo com spec/diff e releitura explícita de regras. Monolito permite uma tabela por spec. Limitações técnicas de isolamento estão declaradas em docs/aula11-verificacao.md; instrução de não editar não é apresentada como garantia de permissões.

## 6. Verificador em ação

Prova inicial encontrou lacunas nos quatro CAs da spec002. Erro plantado cdd5dea comentou o teste de ausência de envio de credenciais: nova sessão retornou CA-01 SEM TESTE e NÃO PRONTA. Restauração pelo principal: 43837f1. Após restauração: 28 testes passaram, typecheck/build passaram. Evidência detalhada em emprestai/docs/aula11-verificacao.md.

Tabelas de evidência parcial das specs003/004 estão em `emprestai/docs/verificacao-pratica.md`. Não são vereditos PRONTA; faltam fotos e validação operacional.

## 7. Regra posta à prova

checks.md mandava supabase db reset, embora o ADR atribua schema ao Prisma. Foi corrigida para reset local explícito pelo principal e Testcontainers pelo verificador. .env histórico remoto torna perigoso depender de carregamento implícito de configuração.

## 8. Pendências

Implementação local, testes Postgres descartáveis e build concluídos. Não está PRONTA: faltam quatro fotos compatíveis, provisionamento humano de Auth/Storage/dados, conta professor, variáveis da Vercel, fluxo autenticado publicado e revisão final. Supabase foi encontrado pausado; restauração em andamento. Não criar tag final até validar essas evidências. Detalhes em `emprestai/docs/verificacao-pratica.md` e `emprestai/handoff.md`.
