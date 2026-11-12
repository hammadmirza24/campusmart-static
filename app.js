// ============================================================
//  CampusMart — Lecture 3 (JS Fundamentals & the DOM)
// ============================================================

// ---------- 1. Data ----------
const listings = [
  { id: 1, title: "Casio fx-991EX Calculator",         price: 4500, category: "Electronics", condition: "Good" },
  { id: 2, title: "Introduction to Algorithms (CLRS)", price: 3500, category: "Books",        condition: "Like new" },
  { id: 3, title: "Logitech Wireless Mouse",           price: 1800, category: "Electronics", condition: "Good" },
  { id: 4, title: "Discrete Mathematics by Rosen",     price: 2200, category: "Books",        condition: "Fair" },
  { id: 5, title: "Study Table with Drawer",           price: 6000, category: "Furniture",    condition: "Good" },
  { id: 6, title: "Geometry Box Set",                  price: 600,  category: "Stationery",   condition: "Like new" },
];

// Favourites: a Set stores UNIQUE ids
const favorites = new Set();


// ---------- 2. DOM selections ----------
const grid         = document.querySelector("#listing-grid");
const searchInput  = document.querySelector("#search");
const resultCount  = document.querySelector("#result-count");
const favCount     = document.querySelector("#fav-count");
const themeToggle  = document.querySelector("#theme-toggle");

// ---------- Activity: combined filters + sort + saved total ----------
const categorySelect = document.querySelector("#category");
const sortSelect     = document.querySelector("#sort");
const savedTotal     = document.querySelector("#saved-total");


// ---------- 3. Helpers ----------
const formatPrice = (n) => `Rs ${n.toLocaleString("en-PK")}`;

// ---------- 4. Build one card ----------
function createCard(listing) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.id = listing.id;

  const img = document.createElement("img");
  img.src = `https://placehold.co/400x300?text=${encodeURIComponent(listing.category)}`;
  img.alt = listing.title;
  img.width = 400;
  img.height = 300;

  const body = document.createElement("div");
  body.className = "card-body";

  const h3 = document.createElement("h3");
  h3.textContent = listing.title;              // textContent → safe from XSS

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(listing.price);

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${listing.category} · ${listing.condition}`;

  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.type = "button";
  favBtn.setAttribute("aria-pressed", favorites.has(listing.id));
  favBtn.textContent = favorites.has(listing.id) ? "♥ Saved" : "♡ Save";

  body.append(h3, price, meta, favBtn);
  article.append(img, body);
  return article;
}

// ---------- 5. Render ----------
function render(items) {
  grid.replaceChildren(...items.map(createCard)); // clears old, adds new
  resultCount.textContent = `${items.length} item(s) found`;
  favCount.textContent = favorites.size;
}

render(listings); // initial paint

// ---------- 6. Filters + sort + saved total ----------
// One function used by ALL inputs (search, category, sort).
function applyFilters() {
  const query    = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sortBy   = sortSelect.value;

  // 1. Filter by search text AND category
  let filtered = listings.filter((l) => {
    const matchesText =
      l.title.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query);
    const matchesCategory = category === "ALL" || l.category === category;
    return matchesText && matchesCategory;
  });

  // 2. Sort (toSorted returns a NEW array; original untouched)
  if (sortBy === "PRICE_ASC") {
    filtered = filtered.toSorted((a, b) => a.price - b.price);
  } else if (sortBy === "PRICE_DESC") {
    filtered = filtered.toSorted((a, b) => b.price - a.price);
  } else {
    // Newest = higher id first
    filtered = filtered.toSorted((a, b) => b.id - a.id);
  }

  // 3. Render (resultCount already updates in render())
  render(filtered);

  // 4. Empty-state message
  if (filtered.length === 0) {
    resultCount.textContent = "No listings match your search";
  }

  // 5. Saved-total using reduce over the favourites set
  const total = [...favorites].reduce((sum, id) => {
    const item = listings.find((l) => l.id === id);
    return item ? sum + item.price : sum;
  }, 0);
  savedTotal.textContent = `Total value of saved items: ${formatPrice(total)}`;
}


// ---------- 7. Event listeners for filters and sort ----------
searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);


// ---------- 8. Favourites — event delegation ----------
grid.addEventListener("click", (event) => {
  const button = event.target.closest(".fav-btn");
  if (!button) return;                      // click wasn't on a fav button
  const id = Number(button.closest(".card").dataset.id);
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  // Re-render with the CURRENT filters
  applyFilters();
});

// ---------- 9. Dark-mode toggle ----------
themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme === "dark";
  root.dataset.theme = isDark ? "light" : "dark";
  themeToggle.textContent = isDark ? "🌙" : "☀️";
  themeToggle.setAttribute("aria-pressed", String(!isDark));
});
