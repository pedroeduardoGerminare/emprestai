# Infraestrutura — EmpresTI

Escopo: página inicial de demonstração e validação da infraestrutura, sem MVP ou autenticação real. Entrega guiada pela spec 002; as demais telas da spec 001 não fazem parte desta publicação.

## GitHub

- Repositório privado: https://github.com/pedroeduardoGerminare/emprestai
- Branch de publicação: main, autorizada diretamente pelo usuário.
- Raiz Git: pasta aberta no Codex; aplicação dentro de emprestai/.
- .env, .env.local, node_modules, .next e dados locais não são versionados.

## Supabase

- Organização: ProjetosVibeCoding, embunmynjqkwxzpxrsqm.
- Projeto: emprestai, referência zvemdkmoagksupyyosuk.
- Região: sa-east-1 (São Paulo). Custo informado e aprovado: US$ 0/mês.
- Painel: https://supabase.com/dashboard/project/zvemdkmoagksupyyosuk
- Metadados sem segredos: supabase/project.json. Configuração local: supabase/config.toml.
- Modelo: prisma/schema.prisma.
- Migration: prisma/migrations/20261023122556_initial_schema/migration.sql.
- Seed: prisma/seed.ts, executando o SQL idempotente de prisma/seed.sql.
- Aplicadas oito tabelas de domínio com RLS, constraints, políticas e triggers; criado suporte_ti e cinco categorias. Nenhum usuário ou empréstimo de demonstração no remoto.
- Histórico Prisma remoto registrado por prisma/remote-baseline.sql. O conector Supabase aplicou o SQL versionado porque não expõe uma senha de conexão para executar o CLI Prisma no remoto. O histórico do conector é um registro adicional; não manter migrations em supabase/migrations.
- Os auxiliares privados usam CREATE OR REPLACE para permitir reset local repetido; isso não altera o comportamento do DDL aprovado.
- Supabase Auth não foi integrado ao formulário. Cadastro público desabilitado na configuração local; antes de ativar Auth real, confirmar a configuração equivalente no painel remoto e configurar convites.

## Banco local e verificação

Postgres 16 em Docker, container emprestai-schema-local, porta 127.0.0.1:54329. tests/auth-bootstrap.sql simula apenas as dependências Auth necessárias às políticas. Não representa uma instalação completa do Supabase.

Os testes de integração usam Testcontainers e criam outro Postgres descartável, aplicam bootstrap e migration do zero, e comprovam isolamento, permissões, integridade entre tenants, limite, atraso, manutenção e auditoria.

Comandos verificados na pasta emprestai/:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node ./node_modules/prisma/build/index.js validate
node ./node_modules/prisma/build/index.js migrate reset --force --skip-generate
node ./node_modules/prisma/build/index.js migrate status
node ./node_modules/prisma/build/index.js generate
node ./node_modules/prisma/build/index.js db seed
```

Para comandos Prisma nesta máquina, exportar DATABASE_URL e DIRECT_URL do .env.local para o processo. Prisma 6 lê .env automaticamente, mas não .env.local. Não usar o .env antigo para migrations: ele aponta para outro projeto e está incompleto.

## Variáveis e segredos

- .env.local: URLs somente do Postgres local descartável.
- .env.example: nomes das duas variáveis de conexão, sem valores reais.
- Vercel: nenhuma variável de banco necessária ou enviada. A página não conecta ao banco nem autentica; não há segredo de servidor no navegador.
- Para futura integração, guardar no painel Vercel a URL do pooler :6543 para runtime e URL direta :5432 para migrations. Usar SSL no remoto e nunca copiar a senha local para a Vercel.

## Vercel

- Projeto criado: emprestai (prj_gnzfZaoGZf2C9QDrlsuQN4TotM0N).
- Framework: Next.js. Diretório raiz: emprestai. Node: 24.x. Build: npm run build.
- Site público: https://emprestai-eta.vercel.app (abriu sem autenticação; formulário validado no navegador).
- Deployment de produção READY: dpl_4rnAuQVWxBLMwTN4TVyLjuH8sf9t, código do commit 47edf1a.
- Publicação feita pelo conector com os arquivos da aplicação e lockfile. Nenhum arquivo .env foi enviado.
- Vínculo automático GitHub ainda pendente: o conector não encontrou o repositório privado e não conseguiu solicitar acesso ao escopo da equipe. O usuário informou que conectou a conta GitHub, mas a vinculação do projeto não foi confirmada.
- Para concluir: https://vercel.com/aaaa1-5bce/emprestai/settings/git → Connect Git Repository → pedroeduardoGerminare/emprestai. Se ausente, configurar o GitHub App da Vercel para permitir somente esse repositório. Confirmar Production Branch main e Root Directory emprestai.
- Conectar a conta GitHub não equivale a vincular o projeto ao repositório. Até esse vínculo ser confirmado, push na main não implica deploy automático.
- A política CSP usa nonce por requisição, sem unsafe-inline; a fonte e os ícones são servidos pelo próprio app.

## Resultado da validação local

28 testes passaram; TypeScript e build aprovados. Migration aplicada do zero e seed executado duas vezes sem duplicar dados. Conferência remota confirmou RLS nas oito tabelas e o seed suporte_ti com cinco categorias. Página pública e validação do formulário confirmadas no navegador. HTTP local 200; todos os dez scripts emitidos pelo Next receberam nonce CSP.
