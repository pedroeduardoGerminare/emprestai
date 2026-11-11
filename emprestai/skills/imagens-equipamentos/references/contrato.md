# Contrato Pixabay

Fonte consultada em 11/nov/2026: https://pixabay.com/api/docs/ . Consultar também a licença aplicável na página de cada foto antes da incorporação.

- Endpoint https://pixabay.com/api/ ; chave PIXABAY_API_KEY em ambiente privado.
- Buscar image_type=photo, safesearch=true, min_width=800, min_height=600; filtros não substituem inspeção visual.
- Cachear respostas por 24 horas. Não fazer downloads em massa.
- Baixar arquivos aprovados; hotlink permanente das URLs Pixabay é proibido. Publicação final será no Supabase Storage pelo usuário.
- Não imprimir URL de requisição com key nem corpo de erro que a contenha.
- Créditos e licença acompanham manifesto. A troca do fornecedor não autoriza presumir regras Pexels válidas para Pixabay.
- sharp foi aprovado explicitamente pelo usuário em 11/nov/2026 para esta transformação e instalado como dependência direta.
- Garantias no script pipeline.mjs: URLs permitidas e redirects conferidos, timeout/limite de tamanho, cache 24h, revisão explícita, ID distinto, nomes determinísticos, hashes finais distintos e JPEG 800×600. A execução real do preparo ainda depende de sharp aprovado e revisão dos candidatos.
- Revisão humana/visual: ausência de pessoas, marcas, texto e conteúdo de tela. Não apresentar filtro de API como garantia disso.
