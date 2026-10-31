// VF STORE — catálogo de produtos conectado à API pública DummyJSON.

// Endereços da API utilizados nas consultas GET.
const API_URL = "https://dummyjson.com/products";
const CATEGORIES_URL = "https://dummyjson.com/products/category-list";
const STORAGE_KEY = "vfstore-favoritos";

// Elementos da página que serão atualizados pelo JavaScript.
const productGrid = document.querySelector("#productGrid");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const categoryList = document.querySelector("#categoryList");
const sortSelect = document.querySelector("#sortSelect");
const statusMessage = document.querySelector("#statusMessage");
const resultsLabel = document.querySelector("#resultsLabel");
const emptyState = document.querySelector("#emptyState");
const errorState = document.querySelector("#errorState");
const errorText = document.querySelector("#errorText");
const productModal = document.querySelector("#productModal");
const modalContent = document.querySelector("#modalContent");
const favoriteCount = document.querySelector("#favoriteCount");
const favoritesButtonCount = document.querySelector("#favoritesButtonCount");
const allProductsButton = document.querySelector("#allProductsButton");
const favoritesButton = document.querySelector("#favoritesButton");

// Os dados ficam em memória enquanto a página estiver aberta.
let products = [];
let searchResults = null;
let categories = [];
let selectedCategory = "all";
let showingFavorites = false;
let searchRequestId = 0;

// Tradução dos nomes de categorias que a API fornece em inglês.
const categoryNames = {
  "beauty": "Beleza",
  "fragrances": "Fragrâncias",
  "furniture": "Móveis",
  "groceries": "Alimentos e mercado",
  "home-decoration": "Decoração para casa",
  "kitchen-accessories": "Acessórios de cozinha",
  "laptops": "Notebooks",
  "mens-shirts": "Camisas masculinas",
  "mens-shoes": "Calçados masculinos",
  "mens-watches": "Relógios masculinos",
  "mobile-accessories": "Acessórios para celular",
  "motorcycle": "Motocicletas",
  "skin-care": "Cuidados com a pele",
  "smartphones": "Celulares",
  "sports-accessories": "Acessórios esportivos",
  "sunglasses": "Óculos de sol",
  "tablets": "Tablets",
  "tops": "Blusas",
  "vehicle": "Veículos",
  "womens-bags": "Bolsas femininas",
  "womens-dresses": "Vestidos femininos",
  "womens-jewellery": "Joias femininas",
  "womens-shoes": "Calçados femininos",
  "womens-watches": "Relógios femininos"
};

// Recupera os favoritos salvos no navegador.
function loadFavorites() {
  try {
    const savedFavorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (!Array.isArray(savedFavorites)) return [];

    // Ignora registros incompletos ou inválidos para evitar falhas na tela.
    return savedFavorites.filter((product) =>
      product &&
      Number.isInteger(Number(product.id)) &&
      typeof product.title === "string" &&
      Number.isFinite(Number(product.price)) &&
      typeof product.thumbnail === "string"
    );
  } catch (error) {
    console.warn("Não foi possível ler os favoritos salvos:", error);
    return [];
  }
}

let favorites = loadFavorites();

// Os preços da DummyJSON são fornecidos em dólares americanos.
function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

// Apresenta o nome da categoria em português sempre que houver tradução.
function translateCategory(category) {
  return categoryNames[category] || category.replaceAll("-", " ");
}

// Mostra ou esconde o aviso de carregamento.
function setLoading(isLoading, message = "Buscando produtos para você...") {
  statusMessage.classList.toggle("hidden", !isLoading);
  statusMessage.querySelector("span:last-child").textContent = message;
  if (isLoading) {
    emptyState.classList.add("hidden");
    errorState.classList.add("hidden");
  }
}

// Faz uma requisição GET, verifica o status HTTP e interpreta a resposta JSON.
async function requestData(url) {
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`A solicitação falhou. Código HTTP: ${response.status}`);
  }

  return response.json();
}

// Carrega todos os produtos disponíveis e as categorias da API.
async function loadCatalog() {
  // Invalida uma pesquisa anterior para impedir que uma resposta atrasada
  // substitua os dados mais recentes exibidos na página.
  searchRequestId++;
  setLoading(true, "Carregando o catálogo completo...");

  try {
    const [productData, categoryData] = await Promise.all([
      requestData(`${API_URL}?limit=0&sortBy=title&order=asc`),
      requestData(CATEGORIES_URL)
    ]);

    products = Array.isArray(productData.products) ? productData.products : [];
    categories = Array.isArray(categoryData) ? categoryData : [];
    searchResults = null;

    renderCategories();
    applyFilters();
  } catch (error) {
    console.error("Erro ao carregar o catálogo:", error);
    showError("Não foi possível acessar a loja agora. Confira sua conexão e tente novamente.");
  } finally {
    setLoading(false);
  }
}

// Cria os filtros de categoria usando os dados recebidos da API.
function renderCategories() {
  categoryList.innerHTML = "";
  categoryList.appendChild(createCategoryButton("all", "Todas"));

  categories.forEach((category) => {
    categoryList.appendChild(
      createCategoryButton(category, translateCategory(category))
    );
  });
}

function createCategoryButton(value, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `category-chip${selectedCategory === value ? " active" : ""}`;
  button.dataset.category = value;
  button.textContent = label;
  return button;
}

// Pesquisa produtos pelo nome usando o endpoint de pesquisa da API.
async function searchProducts(term) {
  const cleanTerm = term.trim();
  const requestId = ++searchRequestId;

  if (!cleanTerm) {
    searchResults = null;
    applyFilters();
    return;
  }

  setLoading(true, "Procurando produtos...");

  try {
    const data = await requestData(
      `${API_URL}/search?q=${encodeURIComponent(cleanTerm)}`
    );

    if (requestId !== searchRequestId) return;

    // A API pode localizar termos em outros campos; o filtro abaixo garante
    // que a pesquisa da atividade seja feita especificamente pelo nome.
    searchResults = Array.isArray(data.products)
      ? data.products.filter((product) =>
          product.title.toLocaleLowerCase("pt-BR").includes(cleanTerm.toLocaleLowerCase("pt-BR"))
        )
      : [];

    selectedCategory = "all";
    updateCategoryButtons();
    applyFilters();
  } catch (error) {
    if (requestId !== searchRequestId) return;
    console.error("Erro durante a pesquisa:", error);
    showError("Não foi possível realizar a pesquisa. Tente novamente.");
  } finally {
    if (requestId === searchRequestId) setLoading(false);
  }
}

// Define a coleção de origem e aplica favoritos, categoria e ordenação.
function applyFilters() {
  let result;

  if (showingFavorites) {
    result = [...favorites];
  } else {
    result = [...(searchResults === null ? products : searchResults)];
  }

  if (selectedCategory !== "all") {
    result = result.filter((product) => product.category === selectedCategory);
  }

  renderProducts(sortProducts(result));
  updateCategoryButtons();
  updateFavoriteCounters();
}

// Ordena os produtos conforme a opção escolhida.
function sortProducts(items) {
  const sorted = [...items];

  switch (sortSelect.value) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    default:
      return sorted;
  }
}

// Atualiza o destaque visual da categoria selecionada.
function updateCategoryButtons() {
  categoryList.querySelectorAll(".category-chip").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.category === selectedCategory
    );
  });
}

// Cria os cartões de produto dinamicamente por meio do DOM.
function renderProducts(items) {
  productGrid.innerHTML = "";
  statusMessage.classList.add("hidden");
  errorState.classList.add("hidden");

  resultsLabel.textContent = `${items.length} ${items.length === 1 ? "PRODUTO ENCONTRADO" : "PRODUTOS ENCONTRADOS"}`;

  items.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";

    const number = document.createElement("span");
    number.className = "product-number";
    number.textContent = `VF / ${String(index + 1).padStart(2, "0")}`;

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.thumbnail;
    image.alt = product.title;
    image.loading = "lazy";

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "favorite-button";
    favoriteButton.classList.toggle("is-favorite", isFavorite(product.id));
    favoriteButton.setAttribute(
      "aria-label",
      isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"
    );
    favoriteButton.setAttribute("aria-pressed", String(isFavorite(product.id)));
    favoriteButton.textContent = isFavorite(product.id) ? "♥" : "♡";
    favoriteButton.addEventListener("click", () => toggleFavorite(product));

    imageWrap.append(number, image, favoriteButton);

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = translateCategory(product.category);

    const titleButton = document.createElement("button");
    titleButton.type = "button";
    titleButton.className = "product-open";
    titleButton.setAttribute("aria-label", `Ver detalhes de ${product.title}`);
    titleButton.addEventListener("click", () => openProductDetails(product));

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const rating = document.createElement("span");
    rating.className = "product-rating";
    rating.textContent = `★ ${Number(product.rating).toFixed(1)}`;

    bottom.append(price, rating);
    titleButton.appendChild(title);
    info.append(category, titleButton, bottom);
    card.append(imageWrap, info);
    productGrid.appendChild(card);
  });

  emptyState.classList.toggle("hidden", items.length > 0);
}

// Confere se o produto já está salvo nos favoritos.
function isFavorite(productId) {
  return favorites.some((favorite) => favorite.id === productId);
}

// Adiciona ou remove um produto e grava a lista no armazenamento do navegador.
function toggleFavorite(product) {
  if (isFavorite(product.id)) {
    favorites = favorites.filter((favorite) => favorite.id !== product.id);
  } else {
    // Salva um objeto com os dados necessários para exibir o favorito depois.
    favorites.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      category: product.category,
      description: product.description,
      rating: product.rating,
      brand: product.brand || "Não informado"
    });
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Não foi possível salvar os favoritos:", error);
  }

  updateFavoriteCounters();
  applyFilters();

  const openedProductId = Number(productModal.dataset.productId);
  if (!productModal.classList.contains("hidden") && openedProductId === product.id) {
    openProductDetails(product);
  }
}

// Mantém os contadores de favoritos sincronizados.
function updateFavoriteCounters() {
  favoriteCount.textContent = favorites.length;
  favoritesButtonCount.textContent = favorites.length;
}

// Abre a janela com informações adicionais do produto selecionado.
function openProductDetails(product) {
  productModal.dataset.productId = product.id;
  modalContent.innerHTML = "";

  const imagePanel = document.createElement("div");
  imagePanel.className = "modal-image-panel";

  const image = document.createElement("img");
  image.src = product.thumbnail;
  image.alt = product.title;
  imagePanel.appendChild(image);

  const details = document.createElement("div");
  details.className = "modal-details";

  const kicker = document.createElement("p");
  kicker.className = "modal-kicker";
  kicker.textContent = `VF STORE / PRODUTO ${product.id}`;

  const title = document.createElement("h2");
  title.id = "modalTitle";
  title.textContent = product.title;

  const price = document.createElement("p");
  price.className = "modal-price";
  price.textContent = formatPrice(product.price);

  const description = document.createElement("p");
  description.className = "modal-description";
  description.textContent = product.description;

  const meta = document.createElement("div");
  meta.className = "modal-meta";
  meta.append(
    createMetaItem("CATEGORIA", translateCategory(product.category)),
    createMetaItem("AVALIAÇÃO", `★ ${Number(product.rating).toFixed(1)}`),
    createMetaItem("MARCA", product.brand || "Não informada")
  );

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = "modal-favorite";
  favoriteButton.textContent = isFavorite(product.id)
    ? "♥ REMOVER DOS FAVORITOS"
    : "♡ ADICIONAR AOS FAVORITOS";
  favoriteButton.addEventListener("click", () => toggleFavorite(product));

  details.append(kicker, title, price, description, meta, favoriteButton);
  modalContent.append(imagePanel, details);
  productModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  document.querySelector("#modalClose").focus();
}

function createMetaItem(label, value) {
  const wrapper = document.createElement("div");
  const small = document.createElement("span");
  small.className = "modal-meta-label";
  small.textContent = label;

  const strong = document.createElement("strong");
  strong.textContent = value;
  wrapper.append(small, strong);
  return wrapper;
}

// Fecha a janela de detalhes e libera a rolagem da página.
function closeProductDetails() {
  productModal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Informa quando a API ou a conexão não está disponível.
function showError(message) {
  statusMessage.classList.add("hidden");
  productGrid.innerHTML = "";
  emptyState.classList.add("hidden");
  errorText.textContent = message;
  errorState.classList.remove("hidden");
  resultsLabel.textContent = "CATÁLOGO INDISPONÍVEL";
}

// Pesquisa enviada pelo formulário.
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showingFavorites = false;
  updateViewButtons();
  searchProducts(searchInput.value);
});

// Filtro de categorias.
categoryList.addEventListener("click", (event) => {
  const button = event.target.closest(".category-chip");
  if (!button) return;

  selectedCategory = button.dataset.category;
  applyFilters();
});

// Ordenação dos produtos exibidos.
sortSelect.addEventListener("change", applyFilters);

// Volta à coleção completa.
allProductsButton.addEventListener("click", () => {
  showingFavorites = false;
  selectedCategory = "all";
  searchResults = null;
  searchInput.value = "";
  updateViewButtons();
  applyFilters();
});

// Abre a lista de produtos favoritos.
favoritesButton.addEventListener("click", showFavorites);
document.querySelector("#favoritesShortcut").addEventListener("click", showFavorites);

function showFavorites() {
  showingFavorites = true;
  selectedCategory = "all";
  searchResults = null;
  searchInput.value = "";
  updateViewButtons();
  applyFilters();
}

function updateViewButtons() {
  allProductsButton.classList.toggle("active", !showingFavorites);
  favoritesButton.classList.toggle("active", showingFavorites);
}

// Eventos para fechar a janela de detalhes.
document.querySelector("#modalClose").addEventListener("click", closeProductDetails);
productModal.addEventListener("click", (event) => {
  if (event.target === productModal) closeProductDetails();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !productModal.classList.contains("hidden")) {
    closeProductDetails();
  }
});

// Permite tentar carregar a coleção novamente após uma falha.
document.querySelector("#retryButton").addEventListener("click", loadCatalog);

// Remove pesquisa e filtros para voltar a ver todos os produtos.
document.querySelector("#clearFiltersButton").addEventListener("click", () => {
  showingFavorites = false;
  selectedCategory = "all";
  searchResults = null;
  searchInput.value = "";
  updateViewButtons();
  applyFilters();
});

// Inicialização da aplicação.
updateFavoriteCounters();
loadCatalog();
