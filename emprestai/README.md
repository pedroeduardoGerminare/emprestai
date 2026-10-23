# EmpresTI

Página inicial e infraestrutura para o futuro sistema de empréstimo de equipamentos. Esta entrega não é um MVP: o formulário é demonstrativo e não envia credenciais. Não existem catálogo ou operações publicados.

Aplicação Next.js em / e /login, TypeScript strict, Tailwind, shadcn restilizado com Nocturne, Open Sans e Phosphor. O index.html antigo é referência e não é servido pelo Next.

## Executar

Na pasta emprestai/, com Node 24: npm.cmd install, npm.cmd run build, npm.cmd run start. Para desenvolver: npm.cmd run dev. Scripts usam Node diretamente para funcionar neste caminho Windows.

## Verificar

npm.cmd test, npm.cmd run typecheck, npm.cmd run build. Testes de banco precisam do Docker e usam Testcontainers sem acessar o Supabase remoto.

## Banco e publicação

Modelo: prisma/schema.prisma. Histórico: prisma/migrations/. Seed: prisma/seed.ts. Identificação do Supabase: supabase/project.json; configuração local: supabase/config.toml.

Configuração completa e links em [docs/infraestrutura.md](docs/infraestrutura.md). Segredos são ignorados pelo Git. A página não precisa de variáveis de banco na Vercel.
