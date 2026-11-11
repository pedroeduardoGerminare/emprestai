# Plano 003

## Restrições

ADR-001: Next monolito, tRPC → service → Prisma, Supabase Auth via @supabase/ssr, sessão httpOnly, Prisma Migrate como único dono do schema. ADR-002: preservar login Nocturne/Open Sans e componentes existentes. rules/secrets.md impede senha/chave no Git; rules/migration.md exige DDL aprovado; contrato da prática reserva escrita remota ao usuário.

## Sequência

1. Registrar decisões pendentes antes de qualquer parte dependente: TI-0010, pickup_location, sharp e DDL. Avançar nos artefatos independentes.
2. Finalizar skill com busca Pixabay cacheada por 24h, armazenamento local ignorado e manifesto sem chave. Separar busca, transformação determinística e inspeção visual. Biblioteca de transformação só após decisão.
3. Acrescentar image_url opcional em equipment para preservar linhas existentes; no seed da prática exigir imagem aprovada para cada um dos 12. Não criar tabela nem alterar políticas existentes. Migration nova, nunca editar a inicial.
4. Adaptar seed a configuração explícita: dados de equipamentos/manifesto e senha da conta via ambiente privado. Preparar execução humana remota distinta da execução local, com checagem de projeto e idempotência; não criar empréstimos.
5. Integrar autenticação real no endpoint tRPC, SSR e proxy de renovação, usando as dependências já decididas no ADR. Ler e validar sessão no servidor; nunca confiar em user_id/tenant_id do cliente. Login mantém layout e validação existentes, substituindo mensagem demonstrativa pelo fluxo real. Fechar cadastro público e criar conta por administração executada pelo usuário.
6. Provar seed em banco local, fluxo de sessão e cookie e validações de imagens. Registrar comandos/resultados reais.
7. Usuário executa preparação remota de dados/Storage/conta e configuração privada; conferir URLs anonimamente e login sem realizar empréstimo pela conta do professor.
8. Delegar ao verificador com esta spec e intervalo de commits; corrigir pelo principal e repetir até PRONTA.

## DDL proposto, ainda não aprovado

```sql
ALTER TABLE public.equipment ADD COLUMN image_url TEXT;
```

Prisma proposto: `imageUrl String? @map("image_url")`. Linhas existentes ficam NULL. A obrigatoriedade para os 12 itens da prática é validada pelo seed/manifesto; não impor NOT NULL global sem backfill aprovado. Não guardar a chave da API nem URL temporária com segredo nesta coluna. A coluna é protegida pelas políticas existentes de equipment; validar isolamento novamente.

## Validação

`npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`; migration/reset somente pelo principal com URL explicitamente local e após aprovação. Testes de banco em Testcontainers. Evidências humanas de publicação são separadas do resultado automatizado, sem fingir que documentação substitui teste.
