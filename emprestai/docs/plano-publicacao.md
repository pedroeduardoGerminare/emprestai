# Proposta — ajustes, banco e publicação

Status: organização e modelagem conceitual aprovadas em 23/out/2026. Usuário determinou seguir a stack, sem HTML avulso. Em execução: tarefa T1 da spec 001, base Next.js. DDL ainda depende da revisão exigida em rules/migration.md.

## Contexto verificado

- O projeto está em `emprestai/`, dentro da pasta aberta no Codex.
- Existem um protótipo `index.html` com seis telas em hash e documentação. Não existem aplicação Next, Prisma, migrations, testes ou repositório Git.
- ADR-001 define Next, TypeScript, Tailwind, shadcn, Prisma Migrate e isolamento por tenant. ADR-002 define Nocturne escuro.
- O pedido atual autoriza criação do Supabase remoto, deploy e push direto na main, como exceções às restrições de produção.
- `rules/restrictions.md` ainda exige aprovação do plano; `rules/migration.md` exige aprovação do DDL antes de gerar migrations.
- A spec 001 exclui HTML avulso. Após esclarecimento, o usuário determinou seguir essa regra: migrar a página inicial para Next.js/React em TypeScript. O index existente é referência, não será a aplicação publicada.

## Execução proposta

1. Criar manualmente a base da tarefa T1 da spec 001: package.json e lockfile, TypeScript strict, Next App Router, Tailwind, Open Sans e tokens Nocturne. Verificar testes e build antes de parar conforme restrictions.md. Na tarefa de login, portar a primeira tela, corrigir a régua de suporte, alinhar texto e seta do botão e associar labels aos campos; preservar split 560px e botão contornado.
2. Criar spec 002 para banco e publicação com critérios e tarefas. Criar Prisma schema, migration SQL com RLS e seed idempotente do tenant suporte_ti. Não implementar autenticação ou integração de dados na página nesta entrega.
3. Validar schema e migration em Postgres local antes de aplicar ao projeto novo em São Paulo. Prisma Migrate permanece o único dono do histórico. Não alterar o projeto Supabase antigo citado na documentação.
4. Registrar configuração Supabase em `supabase/config.toml`, modelos em `prisma/schema.prisma`, histórico em `prisma/migrations/<timestamp>_initial_schema/migration.sql` e documentação em `docs/infraestrutura.md`. Valores secretos ficam fora do Git. Arquivos locais de vínculo e .env são ignorados.
5. Inicializar Git na pasta aberta pelo usuário; manter o conteúdo existente em `emprestai/`. Adicionar .gitignore antes do primeiro commit. Criar repositório GitHub `emprestai`, privado por padrão, e enviar direto à main.
6. Criar Vercel com diretório raiz `emprestai` e framework Next.js. Conectar GitHub se disponível; caso contrário publicar pelo conector com build Next. Verificar URL pública e registrar se há deploy automático por push.

## Modelagem proposta para aprovação

Os nomes abaixo representam a proposta; DDL completo será apresentado para aprovação antes da geração da migration, conforme rules/migration.md.

| Tabela | Campos principais e relações |
|---|---|
| tenants | id UUID PK, slug único, name, created_at |
| profiles | user_id UUID PK/FK auth.users, display_name, department, created_at |
| memberships | tenant_id FK tenants, user_id FK profiles, role; PK composta tenant_id/user_id |
| categories | id UUID PK, tenant_id FK tenants, name; nome único por tenant |
| equipment | id UUID PK, tenant_id FK tenants, category_id, asset_tag, name, serial_number opcional, pickup_location, description opcional, notes opcional, state, created_at, updated_at; patrimônio único por tenant |
| loans | id UUID PK, tenant_id, equipment_id, borrower_id, borrowed_at, due_at, returned_at opcional, returned_by opcional; FKs compostas para impedir vínculo entre tenants |
| audit_events | id UUID PK, tenant_id, actor_id opcional, action, resource_type, resource_id UUID opcional, metadata JSONB, created_at; append-only |
| rate_limit_buckets | tenant_id, subject_hash, window_start, request_count; PK composta; acesso exclusivo do servidor |

- Papéis aprovados pelo usuário: collaborator e admin; admin representa Operações. Sem autoatribuição de papéis pelo navegador.
- Estados físicos: available, maintenance, retired; emprestado é derivado de empréstimo aberto. Atraso é derivado do prazo e da ausência de devolução.
- Empréstimo aberto único por equipamento via índice parcial; vencimento posterior à retirada; devolução não anterior à retirada.
- Limite de três e bloqueio por atraso exigem transação e bloqueio por membro para evitar concorrência. Equipamento é bloqueado na mesma transação e precisa estar disponível.
- RLS habilitada em todas as tabelas. Policies explícitas: leitura do tenant pelos membros, perfil próprio, catálogo do tenant, empréstimos próprios ou leitura por admin. Mutações via servidor autorizado. Auditoria sem UPDATE/DELETE para papéis de aplicação. Rate limit fechado para clientes.
- Seed cria apenas suporte_ti e categorias, sem usuários, senhas ou empréstimos fictícios no remoto.
- Retenção e exclusão de histórico não estão decididas; proposta conservadora impede exclusão em cascata de equipamentos e membros referenciados por empréstimos.

## Verificações e dependências

- Inspecionar o index no navegador em 1440×820 e verificar foco/labels e submissão simulada.
- Validar Prisma, aplicar migrations do zero localmente e verificar RLS/isolamento e concorrência.
- Base Next e Vitest em implementação na T1. Checks só serão registrados como aprovados após execução real. Não haverá exceção para HTML avulso.
- Supabase: organização ProjetosVibeCoding (embunmynjqkwxzpxrsqm) confirmada pelo usuário. Custo não foi consultado nem aceito.
- GitHub: CLI gh não encontrada no PATH nem nos caminhos padrão verificados; autenticação e criação ainda precisam ser resolvidas, sem solicitar tokens em chat.
- Vercel: conector acessível, listagem de equipes retornou vazia; verificar escopo pessoal antes da criação.

## Decisões registradas e próxima revisão

1. Seguir ADR-001 e spec 001, criando Next.js; não usar HTML avulso como aplicação.
2. Criar Supabase na organização ProjetosVibeCoding, após checar eventual custo.
3. Modelagem conceitual e papéis collaborator/admin aprovados. Apresentar DDL completo para aprovação antes de gerar schema/migration, conforme rules/migration.md.
