# Spec 002 — Página inicial e validação da infraestrutura

Registro histórico: a spec 003, autorizada em 11/nov/2026, substitui o comportamento demonstrativo do login por autenticação real. A prova da Aula 11 foi realizada antes dessa mudança e permanece documentada com seus commits. Não exigir ausência de envio de credenciais do fluxo autenticado novo.

Escopo confirmado pelo usuário em 23/out/2026: somente página inicial, modelagem Supabase, repositório GitHub e publicação Vercel. Não executar o plano das seis telas ou construir MVP.

- **CA-01** `/` e `/login` exibem o login conforme layout.md: split 560px, Open Sans, tema escuro e ações contornadas. Pequenos refinamentos de espaçamento, alinhamento e régua de suporte. Formulário demonstrativo sem autenticação ou envio de credenciais.
- **CA-02** Modelagem aprovada: tenants, profiles, memberships, categories, equipment, loans, audit_events e rate_limit_buckets, com tenant isolation, RLS e constraints. Prisma Migrate mantém o histórico. Validar localmente antes de aplicar ao novo Supabase.
- **CA-03** Código e documentação versionados em GitHub privado, main, sem segredos.
- **CA-04** Página publicada em URL pública Vercel e verificada. Se integração GitHub não estiver disponível, publicar arquivos diretamente e registrar a ausência de deploy automático.

Autorização atual substitui as pausas por tarefa e a necessidade de nova aprovação conceitual. O usuário aprovou organização e modelo e pediu concluir as quatro entregas em sequência. Os ADRs técnicos e tokens visuais continuam valendo. Não implementar catálogo, operações, reservas, e-mails ou fluxo de empréstimo nesta entrega.
