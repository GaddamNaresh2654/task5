// Data: demo catalog
const PRODUCTS = [
  { id: 'p1', title: 'Wireless Headphones', category: 'Audio', price: 59.99, img: 'https://images.unsplash.com/photo-1518441902110-0f1ab3d42e4a?q=80&w=800&auto=format&fit=crop', },
  { id: 'p2', title: 'Smart Watch', category: 'Wearables', price: 79.99, img: 'https://images.unsplash.com/photo-1518085250887-2f903c200fee?q=80&w=800&auto=format&fit=crop', },
  { id: 'p3', title: 'Gaming Mouse', category: 'Accessories', price: 29.99, img: 'https://images.unsplash.com/photo-1585079542156-2755d9c4d04b?q=80&w=800&auto=format&fit=crop', },
  { id: 'p4', title: 'Portable Speaker', category: 'Audio', price: 49.99, img: 'https://images.unsplash.com/photo-1526178613714-0a88f1a6c5fb?q=80&w=800&auto=format&fit=crop', },
  { id: 'p5', title: '4K Action Camera', category: 'Cameras', price: 119.99, img: 'https://images.unsplash.com/photo-1519183071298-a2962be96f83?q=80&w=800&auto=format&fit=crop', },
  { id: 'p6', title: 'Mechanical Keyboard', category: 'Accessories', price: 89.99, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop', },
];

// State
const state = {
  cart: JSON.parse(localStorage.getItem('capstone_cart') || '{}'),
  query: '',
  category: 'all',
};

// Elements
const els = {
  grid: document.getElementById('product-grid'),
  search: document.getElementById('search'),
  filter: document.getElementById('category-filter'),
  cartPanel: document.getElementById('cart'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  cartCount: document.querySelector('.cart-count'),
  toggles: document.querySelectorAll('[data-action="toggle-cart"]'),
  navToggle: document.querySelector('.nav-toggle'),
  navMenu: document.getElementById('nav-menu'),
  year: document.getElementById('year'),
  contactForm: document.getElementById('contact-form'),
  contactStatus: document.getElementById('contact-status'),
};

// Utils
const currency = (n) => `$${n.toFixed(2)}`;
const saveCart = () => localStorage.setItem('capstone_cart', JSON.stringify(state.cart));

// Render product cards
function renderProducts() {
  const filtered = PRODUCTS.filter(p =>
    (state.category === 'all' || p.category === state.category) &&
    p.title.toLowerCase().includes(state.query)
  );

  els.grid.setAttribute('aria-busy', 'true');
  els.grid.innerHTML = filtered.map(p => `
    <li class="product-card">
      <img class="lazy" data-src="${p.img}" alt="${p.title}" width="400" height="300">
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <div class="price">${currency(p.price)}</div>
        <div class="actions">
          <button class="btn" data-add="${p.id}">Add to Cart</button>
          <button class="btn btn-secondary" data-details="${p.id}">Details</button>
        </div>
      </div>
    </li>
  `).join('');
  els.grid.setAttribute('aria-busy', 'false');
  setupLazyLoading();
}

// Populate categories
function initCategories() {
  const cats = ['all', ...new Set(PRODUCTS.map(p => p.category))];
  els.filter.innerHTML = cats.map(c => `<option value="${c}">${c[0].toUpperCase()}${c.slice(1)}</option>`).join('');
  els.filter.value = state.category;
}

// Cart rendering
function renderCart() {
  const items = Object.entries(state.cart);
  if (!items.length) {
    els.cartItems.innerHTML = '<li style="padding:12px">Your cart is empty.</li>';
    els.cartTotal.textContent = currency(0);
    els.cartCount.textContent = '0';
    return;
  }
  let total = 0;
  els.cartItems.innerHTML = items.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    const line = p.price * qty;
    total += line;
    return `
      <li class="cart-item">
        <img src="${p.img}" alt="${p.title}" width="64" height="64">
        <div>
          <div>${p.title}</div>
          <div>${currency(p.price)} ×
            <button class="icon-button" data-dec="${p.id}">−</button>
            <strong>${qty}</strong>
            <button class="icon-button" data-inc="${p.id}">+</button>
          </div>
        </div>
        <div>${currency(line)}</div>
      </li>`;
  }).join('');
  els.cartTotal.textContent = currency(total);
  const count = items.reduce((n, [, q]) => n + q, 0);
  els.cartCount.textContent = String(count);
}

// Event delegation
document.addEventListener('click', (e) => {
  const addId = e.target.closest('[data-add]')?.getAttribute('data-add');
  if (addId) {
    state.cart[addId] = (state.cart[addId] || 0) + 1;
    saveCart();
    renderCart();
  }

  const inc = e.target.closest('[data-inc]')?.getAttribute('data-inc');
  if (inc) {
    state.cart[inc] += 1; saveCart(); renderCart();
  }

  const dec = e.target.closest('[data-dec]')?.getAttribute('data-dec');
  if (dec) {
    state.cart[dec] = Math.max(0, (state.cart[dec] || 0) - 1);
    if (state.cart[dec] === 0) delete state.cart[dec];
    saveCart(); renderCart();
  }

  if (e.target.closest('[data-action="toggle-cart"]')) {
    const hidden = els.cartPanel.hasAttribute('hidden');
    if (hidden) els.cartPanel.removeAttribute('hidden'); else els.cartPanel.setAttribute('hidden','');
  }

  const detailsId = e.target.closest('[data-details]')?.getAttribute('data-details');
  if (detailsId) {
    const p = PRODUCTS.find(x => x.id === detailsId);
    alert(`${p.title}\nCategory: ${p.category}\nPrice: ${currency(p.price)}`);
  }
});

// Search & filter
els.search.addEventListener('input', () => { state.query = els.search.value.trim().toLowerCase(); renderProducts(); });
els.filter.addEventListener('change', () => { state.category = els.filter.value; renderProducts(); });

// Mobile nav toggle
els.navToggle.addEventListener('click', () => {
  const expanded = els.navToggle.getAttribute('aria-expanded') === 'true';
  els.navToggle.setAttribute('aria-expanded', String(!expanded));
  els.navMenu.classList.toggle('open');
});

// Contact form (demo validation only)
els.contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(els.contactForm);
  const name = form.get('name')?.toString().trim();
  const email = form.get('email')?.toString().trim();
  const message = form.get('message')?.toString().trim();
  if (!name || !email || !message) {
    els.contactStatus.textContent = 'Please fill out all fields.';
    els.contactStatus.style.color = 'var(--danger)';
    return;
  }
  els.contactStatus.textContent = 'Message sent! (Demo)';
  els.contactStatus.style.color = 'var(--ok)';
  els.contactForm.reset();
});

// Lazy loading for product images
function setupLazyLoading(){
  const lazyImgs = document.querySelectorAll('img.lazy');
  if (!('IntersectionObserver' in window)) {
    lazyImgs.forEach(img => { img.src = img.dataset.src; img.classList.remove('lazy'); });
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target; img.src = img.dataset.src; img.classList.remove('lazy'); io.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });
  lazyImgs.forEach(img => io.observe(img));
}

// Init
function init(){
  els.year.textContent = String(new Date().getFullYear());
  initCategories();
  renderProducts();
  renderCart();
}
document.addEventListener('DOMContentLoaded', init);


