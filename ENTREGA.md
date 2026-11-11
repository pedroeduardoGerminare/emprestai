# Entrega da prática — em andamento

## Estado atualizado — 11/nov/2026

Nova publicação autorizada: https://emprestai-five.vercel.app, equipe pessoal pedroeduardonascimento17-4822, GitHub conectado. Produção continua no código da main/login inicial; funcionalidades reais estão na branch codex/aula11-pratica-subagentes e PR rascunho #1. Preview branch ficou READY após corrigir o email do autor para o noreply GitHub. O domínio principal permanece o mesmo. Vercel MCP confirma a conta correta, mas ainda não lista o projeto pela API. Supabase zvemdkmoagksupyyosuk está Healthy. Vercel recebeu SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY nos ambientes Preview e Production; DATABASE_URL privada ainda falta. Nenhuma migration, seed, upload ou usuário remoto foi escrito.

Implementação local: Auth SSR/tRPC, catálogo, solicitar e meus empréstimos, migration imagem e seed idempotente. Última suíte60 testes/10 arquivos passou; build Webpack completo com TypeScript passou após correções da revisão. Detalhes docs/verificacao-pratica.md. Sharp e DDL aprovados; TI0010 manutenção; retirada Balcão de Operações conforme spec001.

12 imagens preparadas localmente em 800×600. A pedido do usuário, quatro fallbacks foram escolhidos apesar de desvios visuais/categoria, todos descritos em `emprestai/docs/evidencias/revisao-imagens.md`; CA-03 permanece parcialmente não atendido. Conta professor, provisionamento humano, DATABASE_URL no Vercel, validação ponta a ponta e tag final pendentes. O restante deste documento preserva o histórico, subordinado a este estado atualizado.

### Explicação dos fallbacks de imagem

As buscas Pixabay foram feitas e as opções foram inspecionadas. Não foi encontrada uma alternativa que atendesse todos os critérios visuais para os quatro equipamentos abaixo. Conforme autorização posterior do usuário, foram incluídas as melhores imagens restantes; o motivo da exceção fica visível no catálogo e no manifesto:

| Patrimônio | Imagem utilizada | Motivo do desvio |
|---|---|---|
| TI-0003 — Notebook 13 polegadas | Pixabay 5332720 | A imagem mostra o notebook correto e tela vazia, mas as letras do teclado são visíveis. |
| TI-0007 — Monitor 22 polegadas | Pixabay 8275673 | A tela está vazia, mas a foto de origem representa uma televisão, não um monitor de computador. |
| TI-0011 — Webcam Full HD | Pixabay 796227 | A webcam está correta, mas “WEB CAMERA” e dados técnicos estão escritos no equipamento. |
| TI-0012 — Câmera compacta | Pixabay 4907226 | A câmera está correta, mas há inscrições legíveis nos controles traseiros. |

Essas imagens são ilustrativas; os desvios não foram removidos por edição. A seleção completa não significa conformidade total com CA-03. Os 12 arquivos 800×600 e seus hashes constam em `emprestai/docs/evidencias/manifest-imagens-2026-11.json`; os binários prontos permanecem locais para o provisionamento humano.

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

TI-0010 segue a lista de equipamentos e fica em manutenção; retirada no Balcão de Operações, conforme spec 001. O usuário aprovou Sharp e DDL nullable `image_url`. Os quatro equipamentos sem foto plenamente compatível receberam imagem alternativa por decisão posterior explícita do usuário, com desvio registrado. Ver `emprestai/docs/specs/003-dados-iniciais/tasks.md`.

## 2. Onde o agente tentou decidir

O usuário definiu que o PRD prevalece para limite de três itens e prazo de 14 dias corridos. Para TI-0010, pediu seguir a lista de equipamentos; ele fica em manutenção.

## 3. Decisão técnica e ADR

Troca Pexels → Pixabay foi exigência explícita do usuário e registrada na skill/spec. Não foi escrito ADR pelo agente, respeitando a autoridade do time. Sharp e coluna de imagem foram aprovadas; migration aplicada apenas em Postgres local descartável.

## 4. Skill imagens-equipamentos

`SKILL.md` contém fluxo e limites; `references/contrato.md` registra condições do fornecedor; `scripts/pipeline.mjs` implementa cache, origem permitida, revisão obrigatória, unicidade e preparo. Testes negativos passaram. O preparo de 12 imagens ocorreu localmente; nenhum upload foi executado por esta skill.

Chave obtida da sessão autenticada e configurada somente no ambiente local ignorado. Busca real autenticada realizada com cache local, incluindo 21 buscas refinadas e novas consultas. A primeira revisão aprovou 8 de 12 dentro dos critérios; em 11/nov/2026, o usuário autorizou explicitamente completar os quatro itens com fallbacks, mantendo os desvios descritos acima.

## 5. Subagente verificador

Fonte em emprestai/agents/verificador-spec.md e adaptação Codex em emprestai/.codex/agents/verificador-spec.toml. spec-flow exige delegação antes de concluir. Contexto limpo com spec/diff e releitura explícita de regras. Monolito permite uma tabela por spec. Limitações técnicas de isolamento estão declaradas em docs/aula11-verificacao.md; instrução de não editar não é apresentada como garantia de permissões.

## 6. Verificador em ação

Prova inicial encontrou lacunas nos quatro CAs da spec002. Erro plantado cdd5dea comentou o teste de ausência de envio de credenciais: nova sessão retornou CA-01 SEM TESTE e NÃO PRONTA. Restauração pelo principal: 43837f1. Após restauração: 28 testes passaram, typecheck/build passaram. Evidência detalhada em emprestai/docs/aula11-verificacao.md.

Tabelas de evidência parcial das specs003/004 estão em `emprestai/docs/verificacao-pratica.md`. Não são vereditos PRONTA; faltam fotos e validação operacional.

## 7. Regra posta à prova

checks.md mandava supabase db reset, embora o ADR atribua schema ao Prisma. Foi corrigida para reset local explícito pelo principal e Testcontainers pelo verificador. .env histórico remoto torna perigoso depender de carregamento implícito de configuração.

## 8. Pendências

Implementação local, testes Postgres descartáveis, build e preparo local das 12 imagens concluídos. Não está PRONTA: quatro imagens mantêm desvios do CA-03, além de faltarem provisionamento humano de Auth/Storage/dados, conta professor, DATABASE_URL privada no Vercel, fluxo autenticado publicado e revisão final. Supabase está Healthy. As variáveis públicas SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY estão definidas nos ambientes Preview e Production. Não criar tag final até validar essas evidências. Detalhes em `emprestai/docs/verificacao-pratica.md` e `emprestai/handoff.md`.
