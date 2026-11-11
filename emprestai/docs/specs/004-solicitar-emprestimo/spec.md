# Spec 004 — Catálogo e solicitar empréstimo

Estado: preparada, depende de dados/autenticação da spec 003. Execução global autorizada pelo usuário em 11/nov/2026; decisões explícitas do usuário mantêm o PRD vigente: máximo de **3 itens** e prazo de **14 dias corridos**, em vez de 5 itens/14 dias úteis do briefing. Não escrever outro PRD para justificar divergência.

## Decisões e conflitos

- Solicitar cria empréstimo imediatamente; não há aprovação ou fila nesta versão, conforme decisão explícita do briefing.
- Limite e prazo seguem PRD e ADR-002, conforme confirmação do usuário. Manter as constraints existentes de banco coerentes.
- Pixabay substitui Pexels. Manifesto e origem não podem desaparecer; conferir exigência vigente de crédito Pixabay e manter identificação de origem na tela de fotos. O pedido de catálogo sem crédito conflita com o contrato da skill; não suprimir silenciosamente.
- Situação TI-0010 aguarda decisão na spec 003; o PRD não estabelece a situação desse patrimônio.

## Critérios de aceite

- **CA-01** Colaborador autenticado vê os 12 equipamentos do próprio tenant com imagem, nome, categoria e situação; manutenção e emprestado são identificados por texto e não oferecem ação válida de solicitação. Anônimo não consulta; tenant A não vê tenant B. Listagem paginada por cursor conforme ADR-001.
- **CA-02** Solicitar equipamento disponível cria imediatamente um único empréstimo para usuário/tenant da sessão, com borrowed_at do servidor e due_at 14 dias corridos depois. A operação não aceita mutuário ou tenant fornecido pelo cliente. Equipamento passa a constar emprestado no catálogo pela existência do empréstimo aberto; não converter o enum state para um valor inexistente.
- **CA-03** Usuário com três empréstimos abertos não cria o quarto e recebe motivo legível. Até dois itens, estando elegível, pode solicitar outro. Verificar também duas solicitações simultâneas do mesmo usuário com dois itens: somente uma pode elevar o total a três.
- **CA-04** Usuário com empréstimo aberto cujo due_at seja anterior ao instante atual não cria novo empréstimo e recebe motivo de atraso. Empréstimos devolvidos não contam como abertos nem bloqueiam por atraso.
- **CA-05** Equipamento em maintenance, retired ou com empréstimo aberto não aceita novo empréstimo, inclusive requisição direta sem interface. Duas solicitações concorrentes ao mesmo equipamento geram exatamente um empréstimo; a perdedora recebe erro tratável, sem 500 genérico nem efeito parcial.
- **CA-06** “Meus empréstimos” mostra somente os empréstimos abertos do usuário e tenant da sessão, com equipamento e devolução prevista em formato do ADR-002. Outro colaborador não vê dados do colega, inclusive tentando IDs diretos.
- **CA-07** Interface informa carregamento, lista vazia, sucesso e recusa sem depender apenas de cor. Após solicitar, catálogo e meus empréstimos são atualizados por invalidação TanStack Query. Segue ADR-002, layout.md e componentes existentes; datas apresentadas em pt-BR sem alterar prazo gravado.
- **CA-08** Testes citam CA e executam regras contra Postgres local real; procedimentos usam createCaller e verificam código/corpo; cada procedimento tem caso de isolamento entre tenants. Interface tem testes de ações, mensagens e invalidação; concorrência tem prova real de criação única. Verificador independente retorna PRONTA após checks passarem.

## Lacunas e limites

A expressão “14 dias” foi esclarecida pelo usuário como dias corridos. Fuso de apresentação e limite exato de atraso precisam ser coerentes com timestamptz existente: proposta operacional é comparar instantes do servidor, atraso quando due_at < agora, e exibir em America/Sao_Paulo; confirmar se surgir decisão de calendário diferente. Não inventar feriados.

Tenant vem da sessão/membership, nunca do input. Se uma conta tiver múltiplos tenants, não escolher arbitrariamente o primeiro: devolver ausência de contexto e solicitar seleção/decisão antes de suportar esse cenário; prática usa suporte_ti.

## Fora de escopo

Devolução, tela Operações, cadastro visual, reserva futura, aprovação, fila, e-mail, renovação e importação. Não criar empréstimos de teste na conta do professor; deixar a correção com zero empréstimos.
