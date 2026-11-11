# Spec 003 — Dados iniciais, imagens e acesso

Estado: preparada para implementação parcial; decisões pendentes abaixo impedem concluir a entrega. Plano global autorizado pelo usuário em 11/nov/2026. Esta spec amplia a entrega histórica 002, cujo login era demonstrativo.

## Fontes e decisões

PRD e ADR-001/002 continuam vigentes. O usuário substituiu Pexels por Pixabay, autorizou prosseguir com o projeto e determinou que dados de acesso do professor não entrem no README. Senhas e chave Pixabay não entram em código nem no Git. O pedido do enunciado para escrever a senha no seed é rejeitado por conflito com rules/secrets.md.

Não há um PRD novo: esta spec descreve o incremento e não muda as regras do negócio.

## Perguntas ainda sem resposta

1. Resolvido pelo usuário: seguir lista, TI-0010 em manutenção (11/nov/2026).
2. Resolvido pelo usuário: sharp aprovado para transformação das imagens (11/nov/2026).
3. equipment exige pickup_location: usar a retirada no balcão de Operações já definida na spec001, sem acrescentar endereço ou andar.
4. Resolvido pelo usuário: DDL image_url opcional e teste local aprovados (11/nov/2026).
5. Publicação dos dados e imagens no Supabase deve ser executada pelo usuário, conforme o contrato da prática; preparar artefatos idempotentes sem efetuar escrita remota pelo agente.

## Critérios de aceite

- **CA-01** O conjunto contém exatamente TI-0001 a TI-0012: quatro notebooks, três monitores, três cabos e duas câmeras; patrimônios únicos no tenant suporte_ti, nomes/categorias da lista. TI-0004, TI-0007 e TI-0010 em manutenção; demais disponíveis. Nenhum empréstimo criado pelo seed.
- **CA-02** Reexecutar preparação/seed não duplica equipamentos, categorias, perfil, associação ou imagens; não altera empréstimos existentes nem redefine senha de conta já provisionada silenciosamente.
- **CA-03** Cada equipamento tem uma foto distinta obtida exclusivamente pela API Pixabay através da skill imagens-equipamentos. Arquivos finais têm exatamente 800×600, IDs e hashes únicos; manifesto registra página, autor, licença, dimensões e revisão visual sem pessoas, marca/logo legível, texto ou tela com conteúdo. Não usar placeholder como foto aprovada.
- **CA-04** Imagens finais abrem anonimamente em URLs HTTPS do bucket público do mesmo Supabase do projeto. Caminhos determinísticos por patrimônio; reenvio idempotente é preparado para execução humana. Não usar hotlink permanente Pixabay nem incorporar chave à URL pública.
- **CA-05** A conta marcelo.grilo@institutojef.org.br é provisionada no Supabase Auth, com perfil e membership collaborator em suporte_ti, sem empréstimos. Senha de correção fornecida por ambiente privado na execução humana, sem constar em código, README, log ou Git. Testes operacionais usam outra conta.
- **CA-06** Login real aceita credenciais da conta provisionada pelo Supabase Auth, com sessão validada no servidor, cookie httpOnly, renovação e logout. Credencial inválida não abre sessão; anônimo não acessa dados internos. Cadastro público permanece fechado. Nenhum service_role ou segredo é enviado ao navegador.
- **CA-07** Testes locais citam os CAs: integração em Postgres descartável comprova seed repetido e isolamento; testes de autenticação cobrem sucesso, erro, sessão ausente e expirada; validação do manifesto rejeita dimensão errada e duplicata. Publicação tem evidência de execução humana e verificação pública sem divulgar segredos.
- **CA-08** O verificador independente lê esta spec, diff e evidências e retorna PRONTA; checks obrigatórios passam. Evidência pendente, imagem não revisada ou publicação não executada impede conclusão.

## Fora de escopo

Catálogo e empréstimos pertencem à spec 004. Não inclui cadastro visual de equipamento, importação de planilha, landing nova, alteração de logo, cadastro público ou reset da conta do professor para testes.
