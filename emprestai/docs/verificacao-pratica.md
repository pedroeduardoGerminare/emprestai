# Verificação independente da prática

Estado: NÃO PRONTA para entrega operacional.

Revisão independente leu specs003/004, código e testes, sem acessar .env nem corrigir. Achados: alvo Prisma não validado antes do provisionamento; validação forte tardia; papel de conta preexistente não conferido; logout bloqueado em ausência de membership; cobertura UI incompleta.

Correções pelo principal/implementador: validação do alvo antes de mutações e manifesto forte; falha genérica sem divulgar conexão; conflito de papel não alterado silenciosamente; contexto público permite logout e login com tenant nulo, procedimentos tenant continuam bloqueados; provas de estados UI e callbacks reais de invalidação, datas dd/mmm.

Resultado após correções: 60 testes passaram em 10 arquivos, execução serial com Postgres descartável e TESTCONTAINERS_RYUK_DISABLED=true. Build Webpack final passou, incluindo TypeScript e novas rotas; nenhum teste usou produção.

| Spec | Situação de evidência |
|---|---|
| 003 CA01/02 | Seed12 e idempotência local comprovados; provisionamento Auth/Storage real pendente. |
| 003 CA03/04 | 8 fotos aprovadas, 4 bloqueadas; falta conjunto final800x600 e URLs de Storage públicas. |
| 003 CA05/06 | Código Auth/cookies/contexto testado; conta de correção e login operacional pendentes. |
| 003 CA07/08 | Checks locais passaram; sem aprovação operacional final. |
| 004 CA01 | Catálogo/isolamento/cursor testados; 12 fotos/dados reais pendentes. |
| 004 CA02/03/04/05 | Transações, prazo14corridos, limite3, atraso e corridas reais comprovados em createCaller/Postgres. |
| 004 CA06/07 | Posse, estados, recusa, formato de data e invalidação testados. Falta fluxo autenticado publicado. |
| 004 CA08 | Sem veredito final PRONTA; dependências operacionais ainda abertas. |

Não criar tag entrega-pratica enquanto faltarem fotos e produção. Nenhuma evidência sintética é apresentada como foto aprovada ou como execução humana remota.
