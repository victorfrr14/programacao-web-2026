# VF STORE

Catálogo digital de produtos desenvolvido como atividade prática da disciplina de Programação Web.

## Discente
- VICTOR DOS SANTOS FERREIRA 

## Sobre o projeto
A VF STORE é uma aplicação frontend que consulta uma API pública de produtos e apresenta os resultados em um catálogo interativo.

## Funcionalidades
- Listagem dinâmica de produtos com nome, imagem e preço.
- Pesquisa de produtos pelo nome, utilizando o endpoint de pesquisa da API.
- Filtro por categoria, com os nomes das categorias apresentados em português.
- Ordenação por destaques, menor preço, maior preço e nome.
- Visualização de informações adicionais do produto selecionado.
- Adição e remoção de produtos da lista de favoritos.
- Persistência dos favoritos no `localStorage`, inclusive após recarregar a página.
- Indicador visual durante o carregamento dos dados.
- Mensagens para resultados vazios e falhas de conexão ou respostas HTTP.

## Tecnologias utilizadas
- HTML5 semântico
- CSS3
- JavaScript puro (sem frameworks ou bibliotecas)
- Fetch API e requisições HTTP GET
- JSON (`JSON.parse()` e `JSON.stringify()`)
- DOM e eventos
- `localStorage`
- DummyJSON Products API


## API utilizada
A aplicação utiliza a DummyJSON, uma API pública de dados fictícios, sem necessidade de chave de autenticação. As imagens dos produtos são carregadas pelos endereços fornecidos pela própria API, por isso não há arquivos de imagens locais no projeto.

- Listagem: https://dummyjson.com/products?limit=0
- Pesquisa: https://dummyjson.com/products/search?q=termo
- Categorias: https://dummyjson.com/products/category-list
- Documentação: https://dummyjson.com/docs/products


