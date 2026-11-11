---
name: imagens-equipamentos
description: Preparar e revisar fotos dos equipamentos EmpresTI pela API Pixabay, com tamanho e origem verificáveis; não publicar em Storage remoto.
---

Use somente a API Pixabay: substituição do Pexels autorizada pelo usuário em 11/nov/2026. Leia references/contrato.md antes de buscar fotos.

Chave somente em variável PIXABAY_API_KEY, nunca em código, URL registrada, log ou git. Não buscar se ausente; não substituir por scraping, imagens geradas ou outra origem.

Prepare candidatos em diretório local ignorado. Cada equipamento precisa de uma foto distinta, aprovada visualmente, 800×600 reais. Sem pessoa, marca/logo legível, texto ou tela com conteúdo. Registre imagem reprovada e motivo, sem inventar revisão.

Manifesto versionável sem segredos: patrimônio, ID Pixabay, página da foto, autor, URL do perfil, licença e URL da licença, hash do arquivo final, largura/altura e parecer visual. ID e hash não se repetem. Caminho final determinístico por patrimônio.

Não implemente upload para produção nesta skill. Entregue arquivos/manifesto e instruções para execução humana idempotente no bucket público. Não declare concluído sem fotos reais, validação das dimensões e revisão.

## Executar localmente

Da raiz da aplicação, com a chave em ambiente privado (Node 24 aceita `--env-file=.env.local`):

```powershell
node --env-file=.env.local skills/imagens-equipamentos/scripts/pipeline.mjs candidates .local/imagens-equipamentos
```

O diretório `.local/` precisa estar ignorado no Git antes de executar. `candidates.json` não contém a chave. Inspecione as fotos, selecione uma candidata distinta por patrimônio e escreva `review.json` como array de 12 objetos candidatos acrescidos de `patrimonio`, `approved: true` e `reason` detalhando a inspeção. Não escreva aprovação sem abrir a foto. Registre rejeições separadamente com ID e motivo. Não modifique autoria/URLs dos candidatos.

```powershell
node skills/imagens-equipamentos/scripts/pipeline.mjs validate .local/imagens-equipamentos
node skills/imagens-equipamentos/scripts/pipeline.mjs prepare .local/imagens-equipamentos
node --test skills/imagens-equipamentos/scripts/pipeline.test.mjs
```

`prepare` exige sharp já aprovado e instalado pelo projeto. Ele verifica a origem contra os candidatos, baixa apenas as 12 selecionadas, gera JPEG 800×600, rejeita hashes repetidos e grava nomes determinísticos em `prepared/`. Não contém operação de upload. Inspecione também os recortes finais antes de entregar o manifesto.
