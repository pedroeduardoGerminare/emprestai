# Estado da entrega — 11/nov/2026

- Branch: `codex/aula11-pratica-subagentes`; PR #1 integrado à `main`; produção no mesmo domínio `https://emprestai-five.vercel.app`.
- Aula 11: evidências da falha plantada/restaurada e verificador independente em `docs/aula11-verificacao.md`.
- Implementação: autenticação Supabase SSR/tRPC, catálogo, solicitação e meus empréstimos; migration `image_url`; seed idempotente.
- Validação local registrada: 60 testes em 10 arquivos; build Webpack/TypeScript aprovado.
- Supabase `zvemdkmoagksupyyosuk`: migration remota `20261111074737 equipment_image` aplicada; 12 equipamentos, 5 categorias, 12 imagens distintas, 12 objetos no bucket público `equipamentos`, conta do professor e uma membership de colaborador; zero empréstimos. Totais confirmados por SQL de leitura após provisionar.
- Conta de correção: `marcelo.grilo@institutojef.org.br`. A senha usada está em `.env.production.local` na variável `PROFESSOR_PASSWORD`; não copiar para README, Git ou chat. Conta existente não teve a senha alterada.
- Vercel: projeto `emprestai`, equipe pessoal `pedroeduardonascimento17-4822`, domínio `https://emprestai-five.vercel.app`. `DATABASE_URL` de Production foi corrigida para a conexão direta validada; variáveis públicas Supabase já existiam. A API MCP da Vercel ainda retorna 404; painel web confirma o projeto.
- Quatro fallbacks de imagem (TI-0003, TI-0007, TI-0011, TI-0012) mantêm desvios do CA-03 autorizados pelo usuário e explicados em `../ENTREGA.md` e `docs/evidencias/revisao-imagens.md`.
- Pendência: validar login e fluxo autenticado com sessão real do professor; registrar revisão independente final. Não declarar conformidade plena do CA-03 nem criar tag final enquanto houver esses desvios.
- Não há workflow GitHub Actions neste repositório; os segredos de runtime ficam na Vercel, e os valores de provisionamento permanecem apenas em arquivo local ignorado.

