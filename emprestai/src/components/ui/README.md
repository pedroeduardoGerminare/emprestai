# Componentes Nocturne — T2

Componentes locais no padrão shadcn/ui (código no projeto, variantes CVA, classes combinadas por `cn`, primitivas Radix para composição e diálogo). Cores e medidas vêm de `layout.md` §5. Não usar os estilos padrão de outro tema.

| Componente | Uso |
|---|---|
| Button | `variant`: primary, confirm, secondary, row, overdue. `size`: default (diálogo), form, list, header, table. Tipo padrão button; declarar submit nos formulários. `asChild` para links. |
| Badge | `variant`: available, borrowed, maintenance, overdue. Sempre passar texto para informar o estado sem depender de cor. |
| Chip | Controlado por active/onClick; expõe aria-pressed e suporta teclado nativo. |
| Input / Textarea | Associar label ao id. Aceitam ref e atributos nativos, incluindo required, disabled e aria-invalid. |
| Table e partes | Tabela HTML semântica com rolagem horizontal; usar caption, cabeçalhos e células. TableRow aceita overdue. |
| Dialog e partes | Usar Trigger, Content, Title, Description, Footer e Close. O Radix controla foco, Tab, Escape e retorno ao acionador. Consequence estiliza o aviso interno. |
| SegmentedControl | Radios nativos agrupados por fieldset; label, options, value e onValueChange obrigatórios. name opcional; gerado com useId quando ausente. |
| Progress | Barra de prazo nativa, com label; max padrão 14. Valores fora do intervalo são limitados; valores não finitos viram zero. |
| LimitSegments | Três segmentos com semântica meter e texto acessível; valor limitado ao intervalo de 0 a 3. |

O foco usa o anel global do tema. As animações do diálogo respeitam abertura de 180ms e fechamento de 120ms; barras usam 240ms. Movimento reduzido desliga animações e transições, inclusive a barra nativa WebKit. Não foram escritos atributos style para dimensionar barras.

Dependências Radix, CVA, clsx e tailwind-merge são suporte interno aos componentes shadcn previstos na stack. Testing Library, user-event e jsdom dão suporte aos testes de interação. Não foi criado um novo sistema visual nem adicionada uma tela de demonstração ao produto.

Referências: https://v3.shadcn.com/docs/installation/manual e https://www.radix-ui.com/primitives/docs/components/dialog.

Verificação: tests/ui.test.tsx cobre botões desabilitados, submissão acidental, link composto, foco de campos, chip por teclado, seleção por setas, diálogo modal, limites dos indicadores e semântica da tabela. Testes DOM não substituem a comparação visual das telas quando forem implementadas.
