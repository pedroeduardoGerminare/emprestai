# EmpresTI

Sistema interno de empréstimos com autenticação Supabase, catálogo, solicitação e meus empréstimos. Implementação local testada; publicação operacional depende da configuração privada e da preparação dos dados e imagens. Não há devolução ou tela de Operações nesta prática.

Aplicação Next.js em / e /login, TypeScript strict, Tailwind, shadcn restilizado com Nocturne, Open Sans e Phosphor. O index.html antigo é referência e não é servido pelo Next.

Specs atuais: docs/specs/003-dados-iniciais e 004-solicitar-emprestimo. Estado e pendências em handoff.md e ../ENTREGA.md. Conta de acesso não é documentada neste README.

## Executar

Na pasta emprestai/, com Node 24: npm.cmd install, npm.cmd run build, npm.cmd run start. Para desenvolver: npm.cmd run dev. Scripts usam Node diretamente para funcionar neste caminho Windows.

## Verificar

npm.cmd test, npm.cmd run typecheck, npm.cmd run build. Testes de banco precisam do Docker e usam Testcontainers sem acessar o Supabase remoto.

## Banco e publicação

Modelo: prisma/schema.prisma. Histórico: prisma/migrations/. Seed: prisma/seed.ts. Identificação do Supabase: supabase/project.json; configuração local: supabase/config.toml.

Configuração completa e links em [docs/infraestrutura.md](docs/infraestrutura.md). Segredos são ignorados pelo Git. Login real exige SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY e DATABASE_URL no servidor; nomes sem valores em .env.example. PIXABAY_API_KEY é usada apenas na preparação local de imagens.
