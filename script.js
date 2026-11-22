// Product data is stored directly in JavaScript. No server or database is required.
const products = [
  {id:1,name:"Nova X5 Smartphone (128 GB)",category:"Mobiles",price:12999,oldPrice:15999,rating:4.4,emoji:"📱",tint:"#e8f0ff",discount:"18% off"},
  {id:2,name:"Wireless Bluetooth Headphones",category:"Electronics",price:1499,oldPrice:2499,rating:4.3,emoji:"🎧",tint:"#f0eaff",discount:"40% off"},
  {id:3,name:"Everyday Casual Sneakers",category:"Fashion",price:899,oldPrice:1799,rating:4.1,emoji:"👟",tint:"#fff1e8",discount:"50% off"},
  {id:4,name:"Smart Watch with Fitness Tracking",category:"Electronics",price:2199,oldPrice:3999,rating:4.2,emoji:"⌚",tint:"#e7f8f4",discount:"45% off"},
  {id:5,name:"Classic Cotton T-Shirt",category:"Fashion",price:499,oldPrice:999,rating:4.0,emoji:"👕",tint:"#fff0f2",discount:"50% off"},
  {id:6,name:"Comfort Lounge Chair",category:"Home",price:3499,oldPrice:4999,rating:4.5,emoji:"🪑",tint:"#f5f0e8",discount:"30% off"},
  {id:7,name:"Compact Mixer Grinder",category:"Appliances",price:1899,oldPrice:2799,rating:4.2,emoji:"🥤",tint:"#edf4ff",discount:"32% off"},
  {id:8,name:"Daily Care Beauty Kit",category:"Beauty",price:699,oldPrice:1199,rating:4.1,emoji:"🧴",tint:"#fff0f7",discount:"41% off"},
  {id:9,name:"Football Size 5",category:"Sports",price:599,oldPrice:899,rating:4.4,emoji:"⚽",tint:"#eff8e9",discount:"33% off"},
  {id:10,name:"Laptop Backpack 25L",category:"Fashion",price:1099,oldPrice:1699,rating:4.3,emoji:"🎒",tint:"#f0f2f6",discount:"35% off"},
  {id:11,name:"Portable Mini Speaker",category:"Electronics",price:999,oldPrice:1499,rating:4.0,emoji:"🔊",tint:"#fff5e7",discount:"33% off"},
  {id:12,name:"Table Lamp for Bedroom",category:"Home",price:799,oldPrice:1299,rating:4.2,emoji:"💡",tint:"#fff8df",discount:"38% off"}
];

const $ = (id) => document.getElementById(id);
let activeCategory = "All";
let searchText = "";
let cart = JSON.parse(localStorage.getItem("shopkart-cart") || "[]");

function money(value) {
  return "₹" + value.toLocaleString("en-IN");
}
function saveCart() {
  localStorage.setItem("shopkart-cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  $("cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}
function getVisibleProducts() {
  let list = products.filter(product => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const searchMatch = (product.name + " " + product.category).toLowerCase().includes(searchText);
    return categoryMatch && searchMatch;
  });
  const sort = $("sortSelect").value;
  if (sort === "low") list.sort((a,b) => a.price - b.price);
  if (sort === "high") list.sort((a,b) => b.price - a.price);
  if (sort === "rating") list.sort((a,b) => b.rating - a.rating);
  return list;
}
function renderProducts() {
  const list = getVisibleProducts();
  $("sectionTitle").textContent = activeCategory === "All" ? "Recommended for you" : activeCategory;
  $("resultCount").textContent = `${list.length} products available`;
  $("emptyState").hidden = list.length !== 0;
  $("productGrid").innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-visual" style="--tint:${product.tint}">
        <span class="discount">${product.discount}</span>
        <span class="product-emoji">${product.emoji}</span>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <span class="rating">★ ${product.rating}</span>
        <div class="price-line">
          <span class="price">${money(product.price)}</span>
          <span class="old-price">${money(product.oldPrice)}</span>
          <span class="off">${Math.round((1-product.price/product.oldPrice)*100)}% off</span>
        </div>
        <button class="add-btn" onclick="addToCart(${product.id})">ADD TO CART</button>
      </div>
    </article>`).join("");
}
function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({id,qty:1});
  saveCart();
  showToast("Added to your cart");
  renderCart();
}
function changeQty(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}
function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  showToast("Item removed");
}
function renderCart() {
  const container = $("cartItems");
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><div>🛒</div><strong>Your cart is empty</strong><p style="font-size:12px;margin-top:7px">Add something you like!</p></div>`;
  } else {
    container.innerHTML = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      return `<div class="cart-item">
        <div class="cart-item-emoji">${product.emoji}</div>
        <div><h4>${product.name}</h4><p>${money(product.price)}</p>
          <div class="qty"><button onclick="changeQty(${item.id},-1)">−</button><span>${item.qty}</span><button onclick="changeQty(${item.id},1)">+</button></div>
          <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
        </div>
        <strong style="font-size:12px">${money(product.price * item.qty)}</strong>
      </div>`;
    }).join("");
  }
  const total = cart.reduce((sum,item) => {
    const product = products.find(p => p.id === item.id);
    return sum + product.price * item.qty;
  },0);
  $("cartTotal").textContent = money(total);
  $("cartSubtitle").textContent = `${cart.reduce((sum,item)=>sum+item.qty,0)} item(s) in your cart`;
  $("cartBottom").style.display = cart.length ? "block" : "none";
}
function openCart() {
  $("cartDrawer").classList.add("open");
  $("overlay").classList.add("show");
  document.body.style.overflow = "hidden";
  renderCart();
}
function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("overlay").classList.remove("show");
  document.body.style.overflow = "";
}
let toastTimer;
function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2200);
}

$("searchInput").addEventListener("input", event => {
  searchText = event.target.value.trim().toLowerCase();
  renderProducts();
});
$("categoryStrip").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
});
$("sortSelect").addEventListener("change", renderProducts);
$("resetFilters").addEventListener("click", () => {
  activeCategory = "All";
  searchText = "";
  $("searchInput").value = "";
  document.querySelectorAll(".category").forEach(item => item.classList.toggle("active", item.dataset.category === "All"));
  renderProducts();
});
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
$("shopNow").addEventListener("click", () => $("productsSection").scrollIntoView({behavior:"smooth"}));
$("loginBtn").addEventListener("click", () => showToast("Login is not enabled in this offline demo"));
$("sellerBtn").addEventListener("click", () => showToast("Seller portal is a demo feature"));
$("moreBtn").addEventListener("click", () => showToast("You are viewing the offline demo store"));
$("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  alert("Demo order placed successfully!\\nThis project does not process real payments.");
  cart = [];
  saveCart();
  renderCart();
  closeCart();
  showToast("Demo order completed");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

updateCartCount();
renderProducts();
renderCart();
