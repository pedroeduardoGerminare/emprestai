# Aula 11 — evidências reais

## Ambiente

Testes de banco usam PostgreSqlContainer postgres:16-alpine, sem DATABASE_URL. .env.local aponta para loopback; .env histórico contém destino remoto, portanto nenhum reset pode depender do carregamento implícito. Não há .mcp.json no workspace. Checks corrigidos para manter Prisma como dono do schema e proibir reset pelo verificador.

## Prova 1 — descoberta

Sessão independente identificou emprestai/agents/verificador-spec.md e sua description: confere critérios antes de concluir spec; não implementa nem corrige.

## Prova 2 — delegação

Delegação com contexto limpo, spec 002 e commits 63b740d..ce7fb5c. Resultado real:

| CA | status | motivo |
|---|---|---|
| CA-01 | SEM TESTE | Formulário tem provas; rotas e requisitos visuais não têm prova integral. |
| CA-02 | SEM TESTE | Testcontainers prova várias constraints; histórico Prisma e rate_limit_buckets não estão integralmente cobertos. |
| CA-03 | SEM TESTE | GitHub/main/segredos apenas documentados. |
| CA-04 | SEM TESTE | Publicação apenas documentada, sem teste ativo do CA. |

Veredito: NÃO PRONTA. Não se inventou teste para validar afirmação histórica.

## Prova 4 — independência

O pedido do tech lead para o verificador corrigir teste é incompatível com a independência. O principal mantém a correção; verificador apenas devolve evidência. Nenhum arquivo foi editado pelos dois subagentes usados na auditoria e primeira verificação.

## Limites do harness

A definição TOML não garante redução de permissões por agente nesta conversa. Conforme documentação oficial consultada em 11/nov/2026, configurações de sandbox no papel não substituem a configuração herdada: https://learn.chatgpt.com/docs/agent-configuration/subagents . A instrução de somente leitura é contratual. Segurança técnica de produção não deve ser declarada comprovada sem sessão isolada sem credenciais/conectores de escrita.

## Prova 3 — erro plantado e restauração

Commit cdd5dea comentou integralmente o teste de ausência de envio de credenciais. Em contexto limpo, o verificador marcou CA-01 SEM TESTE e NÃO PRONTA: a asserção comentada não executava. O principal restaurou o teste no commit 43837f1. A implementação não foi corrigida pelo verificador.

Build e typecheck locais passaram. Primeiras tentativas tiveram EPERM nos caches existentes; build passou após execução autorizada com acesso aos arquivos. Primeira suíte: 19 passed, 9 skipped por timeout do auxiliar Docker. Diagnóstico com TESTCONTAINERS_RYUK_DISABLED=true permitiu executar o Postgres descartável. Após restaurar o teste: Test Files 4 passed (4), Tests 28 passed (28), 19.62s. Nenhum banco remoto foi usado. Essa variável é contorno local da execução; não é alteração de regra de negócio nem prova de produção.

Adaptação TOML desabilita apps/plugins e pedidos de elevação com chaves features suportadas. Isso reduz conectores no papel persistido, mas os agentes desta conversa foram chamados com instrução explícita de somente leitura; não se presume que o spawn aplicou automaticamente o TOML.
