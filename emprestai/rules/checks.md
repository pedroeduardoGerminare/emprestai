---
description: O que precisa passar antes de declarar uma tarefa pronta
globs: []
alwaysApply: true
---

# Verificação de fim de tarefa
> leitor: agente

## Quando
Sempre que você for dizer "pronto", "implementado" ou "funcionando".

## Procedimento
1. Rode `npm.cmd test` dentro da aplicação. Registre o resumo real.
2. Se a tarefa tocou em migration, o principal valida reset pelo Prisma
   somente com URLs explicitamente locais. Supabase CLI não gerencia migrations.
   O verificador nunca executa reset/migration; usa os testes Testcontainers,
   que criam Postgres descartável sem ler DATABASE_URL.
3. Rode `npm.cmd run typecheck` e `npm.cmd run build` antes de qualquer push. Build que quebra na
   Vercel é o feedback mais lento e mais caro deste projeto.
4. Rode `git status --short`. Só podem aparecer arquivos do escopo
   da tarefa.
5. Diga qual critério de aceitação (CA-xx) esta tarefa atende.

## Verificação
Pronto = os quatro comandos terminaram sem falha E o git status não
trouxe surpresa. As duas coisas, não uma.

## Não faça
- Não relate sucesso parcial. Teste vermelho é tarefa não terminada,
  mesmo que o código "esteja certo".
- Não tente consertar a mesma falha duas vezes seguidas sem me mostrar
  a saída do erro.
- Não rode teste contra o banco remoto.
