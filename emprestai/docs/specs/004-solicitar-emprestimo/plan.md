# Plano 004

## Arquitetura vigente

ADR-001: monolito Next/tRPC → service → Prisma, cliente TanStack Query com tipos inferidos de AppRouter, superjson, Zod e context de sessão/tenant/role. Não usar Server Actions nem acesso Prisma direto em Server Components. ADR-002: sidebar/header/tokens/componentes Nocturne, Open Sans, Phosphor e acessibilidade existentes.

## Implementação sequencial

1. Exigir spec 003 com autenticação, tenant e equipamentos. Ler DDL existente antes de gerar mudanças: banco já possui prazo de 14 dias, enum state sem emprestado e proteções para empréstimos. Reutilizar regras que atendam aos CAs; registrar lacuna antes de propor nova migration.
2. Criar routers catalogo e emprestimos com schemas Zod, protectedProcedure/tenantProcedure e contexto construído a partir da sessão validada. Resolver suporte_ti por membership e não aceitar IDs de usuário/tenant em input.
3. Implementar consulta de catálogo por cursor, combinando state com empréstimo aberto para situação. Retorno mínimo para a tela com imagem pública aprovada, sem notas internas ou dados de outros usuários.
4. Implementar serviço transacional de solicitação. Serializar a elegibilidade por mutuário e disputar disponibilidade por equipamento para que tanto limite simultâneo quanto duplicação de empréstimo sejam impossíveis. Constraints/triggers existentes permanecem defesa; mapear violações conhecidas para TRPCError tratável. Determinar prazo no servidor, não no navegador.
5. Implementar meus empréstimos com filtro obrigatório de tenant + mutuário + returned_at NULL. Sem consulta genérica de empréstimo alheio.
6. Construir catálogo e meus empréstimos como Client Components com hooks tRPC. Reusar componentes, mostrar estados e motivos, invalidar queries após sucesso. Não gravar estado de empréstimo em localStorage.
7. Testar service e procedures em Postgres descartável, incluindo concorrência no mesmo equipamento e no limite do usuário. Testar isolamento de cada procedure e interface com Testing Library; conferir fluxo real no navegador com conta própria.
8. Delegar verificador com spec/commits. Corrigir pelo principal, repetir e registrar tabela real em ENTREGA.md. Só então preparar publicação no mesmo projeto Vercel e verificação humana de dados sem usar a conta professor para solicitações.

## Checks

`npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`. Qualquer migration requer DDL aprovado e reset explicitamente local pelo principal; não executar reset remoto nem permitir que o verificador corrija testes. A disponibilidade de produção e configuração privada é registrada separadamente, sem aprovar por documento.
