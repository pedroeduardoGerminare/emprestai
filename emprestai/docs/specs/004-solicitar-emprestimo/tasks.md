# Tarefas 004

Dependência: spec 003 fornece autenticação e dados aprovados. Uma tarefa por commit, checks ao término.

- [x] T1 — Auditar DDL existente contra concorrência/limite/prazo e registrar mudanças necessárias antes de gerar migration (CA-02 a CA-05). Evidência: auditoria da migration/schema e testes de concorrência em Postgres local.
- [x] T2 — Implementar consulta catálogo por cursor com teste de sessão e isolamento createCaller (CA-01, CA-08). Evidência: testes de sessão, tenant e cursor.
- [x] T3 — Implementar transação de solicitação e disponibilidade com teste de concorrência no mesmo item (CA-02, CA-05, CA-08). Evidência: integração local em Postgres descartável.
- [x] T4 — Provar limite de três, corrida do usuário no limite e atraso, com erros tratáveis (CA-03, CA-04, CA-08). Evidência: testes transacionais locais.
- [x] T5 — Implementar meus empréstimos com testes de posse, devolvidos e tenant (CA-06, CA-08). Evidência: testes de posse, estado e isolamento.
- [x] T6 — Construir catálogo e solicitação com estados e motivos visíveis, usando tipos tRPC inferidos (CA-01, CA-07). Evidência: build e testes de componentes/estados.
- [x] T7 — Construir meus empréstimos e invalidar queries após solicitação; verificar interface e teclado (CA-06, CA-07). Evidência: testes de callbacks de invalidação e interação local.
- [ ] T8 — Rodar fluxo real com conta própria; conferir integridade de dados e conta professor sem empréstimos (CA-01 a CA-08).
- [ ] T9 — Corrigir achados do verificador independente e registrar tabela final; atualizar ENTREGA.md sem inventar evidência (CA-08).

T8 depende da configuração/autenticação de produção e da execução humana do provisionamento. T9 está parcialmente documentada em `docs/verificacao-pratica.md`; permanece aberta até que T8 e a revisão final tenham evidência operacional.
