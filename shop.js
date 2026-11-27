const looks = [
  {
    id: "lassie", type: "outerwear", name: "Зимний комбинезон Lassie",
    description: "Комплект с капюшоном. В публикации указана защита от ветра и влаги.",
    price: 29900, sizes: [74, 98], post: "DgNrIq5jOeK",
    colors: [
      { name: "Розовый", swatch: "#c16e92", image: "lassie-pink" },
      { name: "Сиреневый", swatch: "#a89bb8", image: "lassie-lilac" },
      { name: "Молочный", swatch: "#e0ded0", image: "lassie-cream" }
    ]
  },
  {
    id: "snowsuit", type: "outerwear", name: "Зимний комплект с капюшоном",
    description: "Бежевая куртка с капюшоном и тёмные утеплённые брюки.",
    price: 29900, sizes: [86, 110], post: "DgNrSfSDEpE",
    colors: [{ name: "Бежевый / графит", swatch: "#a48c71", image: "snowsuit" }]
  },
  {
    id: "puffer", type: "outerwear", name: "Стёганая куртка",
    description: "Светло-серая куртка с молнией и капюшоном с меховой опушкой.",
    price: 28900, sizes: [110, 150], post: "DgHBqQFDD9T",
    colors: [{ name: "Светло-серый", swatch: "#cbc9c0", image: "puffer" }]
  },
  {
    id: "fleece-hoodie", type: "top", name: "Худи с начёсом",
    description: "Худи с капюшоном и надписью спереди.",
    price: 8990, sizes: [90, 130], post: "DgKgR13jDX1",
    colors: [
      { name: "Графитовый", swatch: "#494b4f", image: "hoodie-charcoal" },
      { name: "Светло-серый", swatch: "#c9c7c1", image: "hoodie-light" },
      { name: "Фиолетовый", swatch: "#3e2d50", image: "hoodie-purple" }
    ]
  },
  {
    id: "kids-sweatshirt", type: "top", name: "Детский свитшот",
    description: "Свитшот с круглым вырезом и небольшим рисунком спереди.",
    price: 7900, sizes: [110, 150], post: "DgG_trbDIzs",
    colors: [
      { name: "Чёрный", swatch: "#222226", image: "sweatshirt" },
      { name: "Бордовый", swatch: "#71364b", image: "sweatshirt" },
      { name: "Хаки", swatch: "#827754", image: "sweatshirt" },
      { name: "Светло-серый", swatch: "#c9c8c1", image: "sweatshirt" }
    ]
  },
  {
    id: "corduroy", type: "bottom", name: "Утеплённые вельветовые брюки",
    description: "Брюки из вельвета со светлой утеплённой подкладкой.",
    price: 11900, sizes: [110, 150], post: "DgE8aQ9DEZN",
    colors: [
      { name: "Бордовый", swatch: "#522734", image: "corduroy-burgundy" },
      { name: "Светло-серый", swatch: "#c5c4bf", image: "corduroy-light" }
    ]
  },
  {
    id: "kids-denim", type: "bottom", name: "Детские джинсы",
    description: "Джинсы свободного кроя с карманами.",
    price: 9500, sizes: [90, 140], post: "DgHBqQFDD9T",
    colors: [
      { name: "Голубой", swatch: "#768d99", image: "kids-denim" },
      { name: "Чёрный", swatch: "#23242a", image: "kids-denim" }
    ]
  },
  {
    id: "winter-boots", type: "shoes", name: "Зимние ботинки",
    description: "Серые зимние ботинки на шнуровке со светлой подкладкой.",
    price: 14990, sizes: [27, 32], post: "DgHBqQFDD9T",
    colors: [{ name: "Серый", swatch: "#65676b", image: "winter-boots" }]
  }
];

const grid = document.querySelector("#product-grid");
const resultCount = document.querySelector("#result-count");
const heading = document.querySelector("#catalog-title");
const catalog = document.querySelector("#catalog");
const filters = document.querySelector(".filters");
const filterButtons = [...filters.querySelectorAll("button")];
const savedToggle = document.querySelector(".saved-toggle");
const savedCount = document.querySelector("#saved-count");
const dialog = document.querySelector("#look-dialog");
const dialogImage = document.querySelector("#look-image");
const dialogSave = document.querySelector("#look-save");
const sizeInput = document.querySelector("#look-size-input");
const sizeLabel = document.querySelector("#look-size-label");
const sizeRange = document.querySelector("#look-size-range");
const colorOptions = document.querySelector("#look-colors");
const sourceLink = document.querySelector("#look-source");
const orderForm = document.querySelector("#order-form");
const whatsappUrl = document.querySelector("#contact-whatsapp").href;
const heart = document.querySelector(".saved-toggle svg");
const storageKey = "amia-demo-favorites";
const tenge = new Intl.NumberFormat("ru-KZ", { style: "currency", currency: "KZT", maximumFractionDigits: 0 });
const catalogTitle = heading.textContent;

let saved = new Set();
let activeFilter = "all";
let activeLook = null;
let dialogTrigger = null;

try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(stored)) saved = new Set(stored.filter(id => looks.some(look => look.id === id)));
} catch {
  // The current page still works if storage is blocked or unavailable.
}

function updateSavedControl() {
  savedCount.textContent = saved.size;
  savedToggle.setAttribute("aria-label", "Избранное, " + saved.size);
  savedToggle.setAttribute("aria-pressed", String(activeFilter === "saved"));
}

function photoUrl(color) {
  return "assets/" + color.image + ".webp";
}

function createSwatch(color) {
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.setAttribute("aria-hidden", "true");
  swatch.style.setProperty("--swatch", color.swatch);
  return swatch;
}

function showProductPhoto(look, color) {
  dialogImage.src = photoUrl(color);
  dialogImage.alt = look.name + ", " + color.name.toLowerCase();
}

function changeSaved(look) {
  if (saved.has(look.id)) saved.delete(look.id);
  else saved.add(look.id);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...saved]));
  } catch {
    // Favorites are still available until the page is closed.
  }
  updateSavedControl();
}

function updateFavorite(button, look) {
  const selected = saved.has(look.id);
  button.setAttribute("aria-pressed", String(selected));
  button.setAttribute("aria-label", (selected ? "Убрать из избранного: " : "Сохранить: ") + look.name);
}

function updateDialogSave() {
  const selected = saved.has(activeLook.id);
  dialogSave.setAttribute("aria-pressed", String(selected));
  dialogSave.textContent = selected ? "Убрать из избранного" : "В избранное";
}

function openLook(look, trigger) {
  activeLook = look;
  dialogTrigger = trigger;
  showProductPhoto(look, look.colors[0]);
  document.querySelector("#look-title").textContent = look.name;
  document.querySelector("#look-price").textContent = tenge.format(look.price);
  document.querySelector("#look-description").textContent = look.description;
  sourceLink.href = "https://www.instagram.com/amishop_krg/p/" + look.post + "/";

  const [min, max] = look.sizes;
  sizeInput.min = min;
  sizeInput.max = max;
  sizeInput.value = "";
  sizeLabel.textContent = look.type === "shoes" ? "Размер обуви" : "Рост, см";
  sizeRange.textContent = "В публикации: " + min + "–" + max;

  colorOptions.replaceChildren(...look.colors.map((color, index) => {
    const label = document.createElement("label");
    const choice = document.createElement("input");
    choice.type = "radio";
    choice.name = "color";
    choice.value = color.name;
    choice.checked = index === 0;
    choice.addEventListener("change", () => showProductPhoto(look, color));
    const text = document.createElement("span");
    text.className = "color-chip";
    text.append(createSwatch(color), color.name);
    label.append(choice, text);
    return label;
  }));
  updateDialogSave();
  dialog.showModal();
}

function createCard(look) {
  const card = document.createElement("article");
  card.className = "product";

  const open = document.createElement("button");
  open.type = "button";
  open.className = "product-open";
  open.setAttribute("aria-label", look.name);
  open.setAttribute("aria-haspopup", "dialog");
  const frame = document.createElement("span");
  frame.className = "product-frame";
  const photo = document.createElement("img");
  photo.className = "product-photo";
  photo.src = photoUrl(look.colors[0]);
  photo.alt = "";
  photo.loading = "lazy";
  photo.width = 510;
  photo.height = 566;
  frame.append(photo);
  const details = document.createElement("span");
  details.className = "product-details";
  const title = document.createElement("span");
  title.className = "product-title";
  title.textContent = look.name;
  const price = document.createElement("span");
  price.className = "product-price";
  price.textContent = tenge.format(look.price);
  const color = document.createElement("span");
  color.className = "product-color";
  color.append(...look.colors.map(createSwatch));
  if (look.colors.length === 1) color.append(look.colors[0].name);
  const more = document.createElement("span");
  more.className = "product-more";
  more.setAttribute("aria-hidden", "true");
  more.textContent = "+";
  details.append(title, price, color, more);
  open.append(frame, details);
  open.addEventListener("click", () => openLook(look, open));

  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.className = "favorite";
  favorite.dataset.favorite = look.id;
  favorite.append(heart.cloneNode(true));
  updateFavorite(favorite, look);
  favorite.addEventListener("click", () => {
    changeSaved(look);
    if (activeFilter === "saved") {
      render();
      heading.focus({ preventScroll: true });
    } else updateFavorite(favorite, look);
  });

  card.append(open, favorite);
  return card;
}

function render() {
  const filtered = looks.filter(look => {
    if (activeFilter === "saved") return saved.has(look.id);
    return activeFilter === "all" || look.type === activeFilter;
  });
  heading.textContent = activeFilter === "saved" ? "Избранное" : catalogTitle;
  resultCount.textContent = "Показано " + filtered.length;
  filterButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter)));
  updateSavedControl();
  grid.replaceChildren(...filtered.map(createCard));
  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Здесь появятся товары, которые вы сохраните.";
    grid.append(empty);
  }
}

filterButtons.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  render();
}));

savedToggle.addEventListener("click", () => {
  activeFilter = activeFilter === "saved" ? "all" : "saved";
  render();
  catalog.scrollIntoView();
  heading.focus({ preventScroll: true });
});

dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const area = dialog.getBoundingClientRect();
  if (event.clientX < area.left || event.clientX > area.right || event.clientY < area.top || event.clientY > area.bottom) dialog.close();
});
dialog.addEventListener("close", () => {
  if (dialogTrigger?.isConnected) dialogTrigger.focus();
  else heading.focus({ preventScroll: true });
});
orderForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(orderForm);
  const size = data.get("size");
  const sizing = activeLook.type === "shoes" ? "Размер: " + size : "Рост: " + size + " см";
  const message = [
    "Здравствуйте! Хочу заказать «" + activeLook.name + "».",
    sizing + ". Цвет: " + data.get("color") + ".",
    "Подскажите, пожалуйста, есть ли товар в наличии и сколько он стоит?"
  ].join(" ");
  const orderUrl = new URL(whatsappUrl);
  orderUrl.searchParams.set("text", message);
  window.open(orderUrl.href, "_blank", "noopener");
});
dialogSave.addEventListener("click", () => {
  changeSaved(activeLook);
  updateDialogSave();
  if (activeFilter === "saved") render();
  else {
    const favorite = grid.querySelector('[data-favorite="' + activeLook.id + '"]');
    if (favorite) updateFavorite(favorite, activeLook);
  }
});

render();
