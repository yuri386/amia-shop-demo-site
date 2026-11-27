const looks = [
  {
    id: "blazer", type: "top", name: "Жакет свободного кроя",
    description: "Прямой силуэт и выраженная линия плеч.",
    sizes: ["XS", "S", "M", "L"], color: "Тёмный графит", swatch: "#343333"
  },
  {
    id: "cardigan", type: "top", name: "Молочный кардиган",
    description: "Фактурный трикотаж и V-образный вырез.",
    sizes: ["S", "M", "L"], color: "Молочный", swatch: "#daccb4"
  },
  {
    id: "trousers", type: "bottom", name: "Широкие брюки",
    description: "Широкие брючины, стрелки и свободная посадка.",
    sizes: ["XS", "S", "M", "L"], color: "Угольный", swatch: "#2a2928"
  },
  {
    id: "dress", type: "dress", name: "Чёрное платье макси",
    description: "Приталенный силуэт и длинный рукав.",
    sizes: ["XS", "S", "M"], color: "Чёрный", swatch: "#151515"
  },
  {
    id: "jeans", type: "bottom", name: "Графитовые джинсы",
    description: "Свободный крой и выцветший графитовый деним.",
    sizes: ["25", "26", "27", "28", "29", "30"], color: "Выцветший графит", swatch: "#565453"
  },
  {
    id: "bomber", type: "top", name: "Шоколадный бомбер",
    description: "Объёмный крой, молния и эластичные манжеты.",
    sizes: ["S", "M", "L", "XL"], color: "Шоколадный", swatch: "#614535"
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
const sizeOptions = document.querySelector("#look-sizes");
const orderForm = document.querySelector("#order-form");
const whatsappUrl = document.querySelector("#contact-whatsapp").href;
const heart = document.querySelector(".saved-toggle svg");
const storageKey = "amia-demo-favorites";

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

function photoUrl(look) {
  return "assets/" + look.id + ".webp";
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
  dialogImage.src = photoUrl(look);
  dialogImage.alt = look.name;
  document.querySelector("#look-title").textContent = look.name;
  document.querySelector("#look-description").textContent = look.description;
  document.querySelector("#look-color-name").textContent = look.color;
  document.querySelector("#look-swatch").style.setProperty("--swatch", look.swatch);
  sizeOptions.replaceChildren(...look.sizes.map(size => {
    const label = document.createElement("label");
    const choice = document.createElement("input");
    choice.type = "radio";
    choice.name = "size";
    choice.value = size;
    choice.required = true;
    const text = document.createElement("span");
    text.textContent = size;
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
  photo.src = photoUrl(look);
  photo.alt = "";
  photo.loading = "lazy";
  photo.width = 508;
  photo.height = 508;
  frame.append(photo);
  const details = document.createElement("span");
  details.className = "product-details";
  const title = document.createElement("span");
  title.className = "product-title";
  title.textContent = look.name;
  const color = document.createElement("span");
  color.className = "product-color";
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.setProperty("--swatch", look.swatch);
  color.append(swatch, look.color);
  const more = document.createElement("span");
  more.className = "product-more";
  more.setAttribute("aria-hidden", "true");
  more.textContent = "+";
  details.append(title, color, more);
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
  heading.textContent = activeFilter === "saved" ? "Избранное" : "Подборка образов";
  resultCount.textContent = "Показано " + filtered.length;
  filterButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter)));
  updateSavedControl();
  grid.replaceChildren(...filtered.map(createCard));
  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Здесь появятся образы, которые вы сохраните.";
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
  const size = new FormData(orderForm).get("size");
  const message = [
    "Здравствуйте! Хочу заказать товар «" + activeLook.name + "».",
    "Размер: " + size + ". Цвет: " + activeLook.color + ".",
    "Подскажите, пожалуйста, есть ли он в наличии и какая цена?"
  ].join("\n");
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
