# Plano 002

Restrições: ADR-001 (Next, TypeScript, Tailwind, shadcn e Prisma Migrate), ADR-002 e layout.md.

1. Portar apenas o login para React, sem navegação fictícia para páginas inexistentes. Testar acessibilidade e validação do formulário.
2. Gerar schema/migration Prisma em Postgres local; acrescentar RLS, constraints e triggers na mesma migration. Testar isolamento e regras do banco. Aplicar a migration versionada no novo projeto Supabase e semear suporte_ti/categorias.
3. Enviar os arquivos para main no GitHub e publicar o build Next no Vercel. Verificar os resultados e salvar identificadores e instruções em docs/infraestrutura.md.

Sem expansão para as tarefas T3–T10 da spec 001. Nenhuma credencial real será commitada.
