# Verificação independente da prática

Estado: provisionamento remoto concluído; falta validação E2E no endereço público e revisão independente final. CA-03 permanece parcial devido a quatro fallbacks autorizados.

Revisão independente leu specs003/004, código e testes, sem acessar .env nem corrigir. Achados: alvo Prisma não validado antes do provisionamento; validação forte tardia; papel de conta preexistente não conferido; logout bloqueado em ausência de membership; cobertura UI incompleta.

Correções pelo principal/implementador: validação do alvo antes de mutações e manifesto forte; falha genérica sem divulgar conexão; conflito de papel não alterado silenciosamente; contexto público permite logout e login com tenant nulo, procedimentos tenant continuam bloqueados; provas de estados UI e callbacks reais de invalidação, datas dd/mmm.

Resultado após correções: 60 testes passaram em 10 arquivos, execução serial com Postgres descartável e TESTCONTAINERS_RYUK_DISABLED=true. Build Webpack final passou, incluindo TypeScript e novas rotas; nenhum teste usou produção.

| Spec | Situação de evidência |
|---|---|
| 003 CA01/02 | Migration remota aplicada; seed verificado com 12 equipamentos, 5 categorias e zero empréstimos. |
| 003 CA03/04 | 12 imagens 800×600, URLs únicas e 12 objetos públicos verificados; quatro fallbacks autorizados mantêm CA-03 parcial. |
| 003 CA05/06 | Conta do professor e membership verificadas; falta login E2E publicado. |
| 003 CA07/08 | Checks locais passaram; falta revisão independente final. |
| 004 CA01 | Catálogo/isolamento/cursor testados; 12 equipamentos e imagens remotos verificados. |
| 004 CA02/03/04/05 | Transações, prazo14corridos, limite3, atraso e corridas reais comprovados em createCaller/Postgres. |
| 004 CA06/07 | Posse, estados, recusa, formato de data e invalidação testados. Falta fluxo autenticado publicado. |
| 004 CA08 | Sem veredito final PRONTA; falta fluxo publicado e revisão independente. |

Migration `20261111074737`, Storage e Auth foram provisionados em produção e conferidos por consultas. Não criar tag entrega-pratica antes do E2E publicado e revisão independente. Nenhuma evidência sintética é apresentada como foto plenamente aprovada.

