# Página inicial, banco e publicação

Escopo corrigido pelo usuário em 23/out/2026: somente página inicial, modelagem Supabase, GitHub/main e Vercel. Não construir seis telas nem MVP. Spec ativa: docs/specs/002-infraestrutura/.

O usuário autorizou as quatro entregas em sequência, substituindo a pausa entre tarefas do plano anterior. Autorizou Supabase remoto, publicação e push na main. Organização ProjetosVibeCoding, custo US$ 0/mês e DDL completo de docs/schema-proposto.sql foram aprovados explicitamente.

Implementação: Next.js/React em TypeScript, Tailwind, shadcn restilizado, Open Sans e Phosphor conforme ADR-001 e ADR-002. Login demonstrativo sem autenticação. Sem catálogo ou operações nesta entrega.

Oito tabelas com isolamento por tenant, RLS, constraints, triggers e seed idempotente. Histórico em prisma/migrations/; metadados em supabase/project.json e configuração local em supabase/config.toml. Estado e links em docs/infraestrutura.md. Não repetir confirmações já obtidas.
