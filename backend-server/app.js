// ============================================
// Sikandar Raw Mutton — App Logic
// Payment, Stock & Tracking Systems
// ============================================

// --- Product Data with Stock ---
const PRODUCTS = [
  {
    id: 'dry-mutton',
    name: 'Dry Mutton',
    category: 'dry',
    price: 750,
    image: 'images/dry-mutton.png',
    description: 'Tender boneless mutton pieces, slow-cooked with aromatic spices until perfectly dry and rich in flavour.',
    meta: { weight: 'Per Kg', freshness: '100% Fresh', type: 'Mixed' },
    weights: ['250g', '500g', '1 Kg'],
    weightMultipliers: [0.25, 0.5, 1],
    stock: 25, // in kg
  },
  {
    id: 'wet-mutton',
    name: 'Wet Mutton',
    category: 'wet',
    price: 650,
    image: 'images/wet-mutton.png',
    description: 'Fresh curry-cut mutton with bone — perfect for rich gravies, nihari, and traditional home-cooked recipes.',
    meta: { weight: 'Per Kg', freshness: '100% Fresh', type: 'Mixed' },
    weights: ['250g', '500g', '1 Kg'],
    weightMultipliers: [0.25, 0.5, 1],
    stock: 18, // in kg
  }
];

// --- State ---
let cart = [];
let selectedWeights = {};  // productId -> index
let quantities = {};       // productId -> count on card

PRODUCTS.forEach(p => {
  selectedWeights[p.id] = 2; // default 1 Kg
  quantities[p.id] = 1;
});

// --- Order History from localStorage ---
let orderHistory = JSON.parse(localStorage.getItem('srm_orders') || '[]');

// ============================================
// Stock Helpers
// ============================================
function getStockLevel(product) {
  if (product.stock <= 0) return 'out';
  if (product.stock <= 5) return 'low';
  if (product.stock <= 15) return 'medium';
  return 'high';
}

function getStockLabel(product) {
  const level = getStockLevel(product);
  if (level === 'out') return '❌ Out of Stock';
  if (level === 'low') return `⚠️ Only ${product.stock} kg left!`;
  if (level === 'medium') return `📦 ${product.stock} kg in stock`;
  return `✅ In Stock`;
}

function getStockClass(product) {
  return 'stock-' + getStockLevel(product);
}

// ============================================
// Render Products
// ============================================
let currentFilter = 'all';

function renderProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => {
    const wIdx = selectedWeights[p.id];
    const qty = quantities[p.id];
    const unitPrice = Math.round(p.price * p.weightMultipliers[wIdx]);
    const isOutOfStock = p.stock <= 0;
    const stockLevel = getStockLevel(p);

    return `
      <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-id="${p.id}">
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="product-image-overlay"></div>
          <div class="product-price-tag">₹${unitPrice}</div>
          <div class="stock-badge ${getStockClass(p)}">
            ${getStockLabel(p)}
          </div>
        </div>
        <div class="product-body">
          <span class="product-type-label ${p.category}">${p.category} mutton</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description}</p>
          <div class="product-meta">
            <span>⚖️ ${p.meta.weight}</span>
            <span>✅ ${p.meta.freshness}</span>
            <span>🥩 ${p.meta.type}</span>
          </div>
          <div class="weight-select">
            ${p.weights.map((w, i) => `
              <button class="weight-option ${i === wIdx ? 'active' : ''}"
                      onclick="selectWeight('${p.id}', ${i})">${w}</button>
            `).join('')}
          </div>
          <div class="product-actions">
            <div class="quantity-control">
              <button class="qty-btn" onclick="changeQty('${p.id}', -1)" ${isOutOfStock ? 'disabled' : ''}>−</button>
              <span class="qty-value">${qty}</span>
              <button class="qty-btn" onclick="changeQty('${p.id}', 1)" ${isOutOfStock ? 'disabled' : ''}>+</button>
            </div>
            <button class="add-to-cart-btn ${isOutOfStock ? 'disabled-btn' : ''}" 
                    id="atc-${p.id}" 
                    onclick="${isOutOfStock ? '' : `addToCart('${p.id}')`}"
                    ${isOutOfStock ? 'disabled' : ''}>
              ${isOutOfStock ? '🚫 Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>
          <p class="per-kg">Price: ₹${p.price}/Kg</p>
        </div>
      </div>
    `;
  }).join('');
}

// --- Weight Selection ---
function selectWeight(productId, index) {
  selectedWeights[productId] = index;
  renderProducts(currentFilter);
}

// --- Quantity on Card ---
function changeQty(productId, delta) {
  quantities[productId] = Math.max(1, (quantities[productId] || 1) + delta);
  renderProducts(currentFilter);
}

// ============================================
// Category Filter
// ============================================
function filterCategory(cat, el) {
  currentFilter = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderProducts(cat);
}

// ============================================
// Cart Logic
// ============================================
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;

  const wIdx = selectedWeights[productId];
  const weightLabel = product.weights[wIdx];
  const unitPrice = Math.round(product.price * product.weightMultipliers[wIdx]);
  const qty = quantities[productId];
  const weightKg = product.weightMultipliers[wIdx] * qty;

  // Check stock
  if (weightKg > product.stock) {
    showToast(`⚠️ Only ${product.stock} kg of ${product.name} available!`);
    return;
  }

  // Check if same product + weight already in cart
  const existing = cart.find(c => c.productId === productId && c.weightIndex === wIdx);
  if (existing) {
    const totalKg = (existing.qty + qty) * product.weightMultipliers[wIdx];
    if (totalKg > product.stock) {
      showToast(`⚠️ Can't add more — only ${product.stock} kg in stock!`);
      return;
    }
    existing.qty += qty;
  } else {
    cart.push({
      productId,
      name: product.name,
      image: product.image,
      weightLabel,
      weightIndex: wIdx,
      unitPrice,
      qty,
      weightMultiplier: product.weightMultipliers[wIdx],
    });
  }

  updateCartUI();
  showToast(`🥩 ${product.name} (${weightLabel}) added to cart!`);

  // Button feedback
  const btn = document.getElementById(`atc-${productId}`);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '✓ Added!';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '🛒 Add to Cart';
    }, 1200);
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function changeCartQty(index, delta) {
  const item = cart[index];
  const product = PRODUCTS.find(p => p.id === item.productId);
  const newQty = Math.max(1, item.qty + delta);
  const totalKg = newQty * item.weightMultiplier;

  if (product && totalKg > product.stock) {
    showToast(`⚠️ Only ${product.stock} kg available!`);
    return;
  }

  cart[index].qty = newQty;
  updateCartUI();
}

// ============================================
// Cart UI
// ============================================
function toggleCart() {
  const overlay = document.getElementById('cart-overlay');
  const sidebar = document.getElementById('cart-sidebar');
  const isOpen = overlay.classList.contains('open');

  if (isOpen) {
    overlay.classList.remove('open');
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    overlay.classList.add('open');
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function updateCartUI() {
  // Badge
  const badge = document.getElementById('cart-badge');
  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);
  badge.textContent = totalItems || '';
  badge.dataset.count = totalItems;
  if (totalItems > 0) {
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 400);
  }

  // Cart items list
  const itemsContainer = document.getElementById('cart-items');
  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">🛒</span>
        <p>Your cart is empty</p>
        <p style="font-size:13px;">Add some fresh mutton to get started!</p>
      </div>
    `;
  } else {
    itemsContainer.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-weight">${item.weightLabel}</p>
          <p class="cart-item-price">₹${item.unitPrice * item.qty}</p>
        </div>
        <div class="cart-item-qty">
          <button onclick="changeCartQty(${i}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeCartQty(${i}, 1)">+</button>
        </div>
        <button class="cart-remove" onclick="removeFromCart(${i})" title="Remove">✕</button>
      </div>
    `).join('');
  }

  // Totals
  const subtotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
  const delivery = subtotal > 0 ? 50 : 0;
  const total = subtotal + delivery;

  const totalsEl = document.getElementById('cart-totals');
  totalsEl.innerHTML = `
    <div class="cart-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
    <div class="cart-row"><span>Delivery</span><span>₹${delivery}</span></div>
    <div class="cart-row total"><span>Total</span><span>₹${total}</span></div>
  `;

  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn.disabled = cart.length === 0;
}

// ============================================
// Payment System
// ============================================
let selectedPaymentMethod = 'card'; // 'card', 'paypal', 'upi'

function placeOrder() {
  if (cart.length === 0) return;
  toggleCart();
  openPaymentModal();
}

function openPaymentModal() {
  const subtotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
  const delivery = 50;
  const total = subtotal + delivery;

  const modal = document.getElementById('payment-modal');
  const overlay = document.getElementById('payment-overlay');

  // Render order summary inside modal
  document.getElementById('payment-items').innerHTML = cart.map(c => `
    <div class="payment-summary-item">
      <span>${c.name} (${c.weightLabel}) × ${c.qty}</span>
      <span>₹${c.unitPrice * c.qty}</span>
    </div>
  `).join('') + `
    <div class="payment-summary-item"><span>Delivery</span><span>₹${delivery}</span></div>
    <div class="payment-summary-total"><span>Total</span><span>₹${total}</span></div>
  `;

  document.getElementById('payment-total-display').textContent = `₹${total}`;

  // Reset
  selectedPaymentMethod = 'card';
  updatePaymentMethodUI();
  document.getElementById('payment-form').reset();
  document.getElementById('payment-success').classList.remove('active');
  document.getElementById('payment-content').classList.remove('hidden');
  document.getElementById('payment-processing').classList.remove('active');

  overlay.classList.add('active');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  document.getElementById('payment-overlay').classList.remove('active');
  document.getElementById('payment-modal').classList.remove('active');
  document.body.style.overflow = '';
  stopConfetti();
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  updatePaymentMethodUI();
}

function updatePaymentMethodUI() {
  document.querySelectorAll('.pay-method-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.method === selectedPaymentMethod);
  });

  // Show/hide method-specific sections
  document.getElementById('card-fields').style.display = selectedPaymentMethod === 'card' ? 'block' : 'none';
  document.getElementById('paypal-fields').style.display = selectedPaymentMethod === 'paypal' ? 'block' : 'none';
  document.getElementById('upi-fields').style.display = selectedPaymentMethod === 'upi' ? 'block' : 'none';
}

function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, '');
  value = value.substring(0, 16);
  const groups = value.match(/.{1,4}/g);
  input.value = groups ? groups.join(' ') : value;
}

function formatExpiry(input) {
  let value = input.value.replace(/\D/g, '');
  value = value.substring(0, 4);
  if (value.length >= 3) {
    value = value.substring(0, 2) + '/' + value.substring(2);
  }
  input.value = value;
}

function confirmPayment() {
  // Validate common fields
  const name = document.getElementById('pay-name').value.trim();
  const phone = document.getElementById('pay-phone').value.trim();
  const address = document.getElementById('pay-address').value.trim();

  if (!name) { showToast('⚠️ Please enter your name'); return; }
  if (!phone || phone.length < 10) { showToast('⚠️ Please enter a valid phone number'); return; }
  if (!address) { showToast('⚠️ Please enter your delivery address'); return; }

  // Validate payment-specific fields
  if (selectedPaymentMethod === 'card') {
    const cardNum = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('card-expiry').value;
    const cvv = document.getElementById('card-cvv').value;
    if (cardNum.length < 16) { showToast('⚠️ Enter a valid card number'); return; }
    if (expiry.length < 5) { showToast('⚠️ Enter a valid expiry date'); return; }
    if (cvv.length < 3) { showToast('⚠️ Enter a valid CVV'); return; }
  } else if (selectedPaymentMethod === 'upi') {
    const upiId = document.getElementById('upi-id').value.trim();
    if (!upiId || !upiId.includes('@')) { showToast('⚠️ Enter a valid UPI ID'); return; }
  }

  // Show processing
  document.getElementById('payment-content').classList.add('hidden');
  document.getElementById('payment-processing').classList.add('active');

  // Simulate payment processing
  setTimeout(() => {
    processPaymentSuccess(name, phone, address);
  }, 2000);
}

function processPaymentSuccess(name, phone, address) {
  document.getElementById('payment-processing').classList.remove('active');

  // Deduct stock
  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.weightMultiplier * item.qty;
      if (product.stock < 0) product.stock = 0;
    }
  });

  // Generate order
  const orderId = 'SM-' + String(Math.floor(100000 + Math.random() * 900000));
  const subtotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
  const delivery = 50;
  const total = subtotal + delivery;

  const order = {
    id: orderId,
    items: [...cart],
    subtotal,
    delivery,
    total,
    customer: { name, phone, address },
    paymentMethod: selectedPaymentMethod,
    status: 'confirmed',
    date: new Date().toISOString(),
    trackingStep: 0,
  };

  // Save to history
  orderHistory.unshift(order);
  localStorage.setItem('srm_orders', JSON.stringify(orderHistory));

  // Show success with animations
  const successEl = document.getElementById('payment-success');
  document.getElementById('success-order-id').textContent = orderId;
  successEl.classList.add('active');

  // Trigger glow-through
  document.getElementById('payment-modal').classList.add('success-glow');

  // Launch confetti
  startConfetti();

  // Specular flash
  setTimeout(() => {
    document.getElementById('payment-modal').classList.add('specular-flash');
    setTimeout(() => {
      document.getElementById('payment-modal').classList.remove('specular-flash');
    }, 800);
  }, 300);

  // Store cart for tracking then clear
  window._lastOrder = order;
  cart = [];
  updateCartUI();
  renderProducts(currentFilter);
  renderOrderHistory();
}

function goToTracking() {
  closePaymentModal();
  stopConfetti();
  document.getElementById('payment-modal').classList.remove('success-glow');

  const order = window._lastOrder;
  if (!order) return;

  showTrackingForOrder(order);
}

// ============================================
// Confetti System
// ============================================
let confettiInterval = null;
let confettiParticles = [];

function startConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  container.innerHTML = '';
  confettiParticles = [];

  const colors = ['#e63946', '#ff6b6b', '#f0b040', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];
  const shapes = ['circle', 'square', 'diamond'];

  function createParticle() {
    const particle = document.createElement('div');
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const startX = Math.random() * 100;
    const duration = Math.random() * 2 + 2;
    const delay = Math.random() * 0.5;

    particle.className = `confetti-particle confetti-${shape}`;
    particle.style.cssText = `
      left: ${startX}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${Math.random() * 0.6 + 0.4};
    `;

    container.appendChild(particle);
    confettiParticles.push(particle);

    // Clean up after animation
    setTimeout(() => {
      if (particle.parentNode) particle.remove();
    }, (duration + delay) * 1000);
  }

  // Initial burst
  for (let i = 0; i < 30; i++) {
    createParticle();
  }

  // Continued particles
  confettiInterval = setInterval(() => {
    for (let i = 0; i < 5; i++) {
      createParticle();
    }
  }, 400);

  // Stop after 4 seconds
  setTimeout(stopConfetti, 4000);
}

function stopConfetti() {
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}

// ============================================
// Order Tracking (Enhanced)
// ============================================
function showTrackingForOrder(order) {
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('order-history-section').classList.remove('active');
  const trackingSection = document.getElementById('tracking-section');
  trackingSection.classList.add('active');

  document.getElementById('tracking-order-id').textContent = 'Order #' + order.id;

  // Order summary
  const summaryEl = document.getElementById('tracking-summary');
  summaryEl.innerHTML = `
    <h4>Order Summary</h4>
    ${order.items.map(c => `
      <div class="tracking-item">
        <span>${c.name} (${c.weightLabel}) × ${c.qty}</span>
        <span>₹${c.unitPrice * c.qty}</span>
      </div>
    `).join('')}
    <div class="tracking-item"><span>Delivery</span><span>₹${order.delivery}</span></div>
    <div class="tracking-total"><span>Total</span><span>₹${order.total}</span></div>
    <div class="tracking-customer">
      <p>📦 ${order.customer.name}</p>
      <p>📞 ${order.customer.phone}</p>
      <p>📍 ${order.customer.address}</p>
      <p>💳 ${order.paymentMethod === 'card' ? 'Credit Card' : order.paymentMethod === 'paypal' ? 'PayPal' : 'UPI'}</p>
    </div>
  `;

  // Reset all steps
  const steps = document.querySelectorAll('.tracking-step');
  steps.forEach(s => {
    s.classList.remove('completed', 'active-step');
    const timeEl = s.querySelector('.step-time');
    if (timeEl) timeEl.textContent = '--';
  });

  // Initialize delivery map
  initDeliveryMap();

  // Simulate progress
  simulateTracking(0, order);
}

function simulateTracking(stepIndex, order) {
  const steps = document.querySelectorAll('.tracking-step');
  if (stepIndex >= steps.length) return;

  // Acknowledgement messages for each step
  const acknowledgements = [
    '✅ Order confirmed! We\'re on it.',
    '🔥 Your order is being freshly prepared!',
    '🛵 Delivery boy is on the way to you!',
    '🎉 Your order has been delivered! Enjoy!',
  ];

  setTimeout(() => {
    // Mark previous as completed
    if (stepIndex > 0) {
      steps[stepIndex - 1].classList.remove('active-step');
      steps[stepIndex - 1].classList.add('completed');
    }

    // Mark current as active
    steps[stepIndex].classList.add('active-step');

    // Set time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const timeEl = document.getElementById(`step-time-${stepIndex}`);
    if (timeEl) timeEl.textContent = timeStr;

    // Show acknowledgement toast
    showToast(acknowledgements[stepIndex]);

    // Update map marker position
    updateDeliveryMapStep(stepIndex);

    // Update order status
    const statusMap = ['confirmed', 'preparing', 'delivering', 'delivered'];
    if (order && statusMap[stepIndex]) {
      order.status = statusMap[stepIndex];
      const histOrder = orderHistory.find(o => o.id === order.id);
      if (histOrder) {
        histOrder.status = order.status;
        histOrder.trackingStep = stepIndex;
        localStorage.setItem('srm_orders', JSON.stringify(orderHistory));
        renderOrderHistory();
      }
    }

    // If last step, mark as completed after a moment
    if (stepIndex === steps.length - 1) {
      setTimeout(() => {
        steps[stepIndex].classList.remove('active-step');
        steps[stepIndex].classList.add('completed');
        updateMapStatusPill('Delivered', 'delivered');
      }, 3000);
    }

    simulateTracking(stepIndex + 1, order);
  }, stepIndex === 0 ? 500 : 4000);
}

function showShop() {
  document.getElementById('main-content').classList.remove('hidden');
  document.getElementById('tracking-section').classList.remove('active');
  document.getElementById('order-history-section').classList.remove('active');
  document.getElementById('profile-section').classList.remove('active');
  destroyDeliveryMap();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Delivery Map (Leaflet.js)
// ============================================
let deliveryMap = null;
let riderMarker = null;
let riderTrailLine = null;
let mapAnimationFrame = null;

// Shop location: Donar Gaumti, Dilwarpur, Darbhanga, Bihar
const SHOP_LOCATION = [26.1542, 85.8918];

// Simulated route waypoints (shop → through town → delivery)
const ROUTE_WAYPOINTS = [
  [26.1542, 85.8918],   // Shop
  [26.1558, 85.8945],   // Nearby road
  [26.1580, 85.8968],   // Intersection
  [26.1605, 85.8935],   // Turn
  [26.1625, 85.8960],   // Main road
  [26.1640, 85.8990],   // Bridge area
  [26.1660, 85.9015],   // Approaching destination
  [26.1680, 85.9040],   // Near destination
  [26.1695, 85.9058],   // Destination
];

// Step -> which waypoint index the rider should be at
const STEP_WAYPOINT_MAP = {
  0: 0,  // Order Confirmed: rider at shop
  1: 2,  // Preparing: rider near shop
  2: 5,  // Out for Delivery: rider mid-route
  3: 8,  // Delivered: rider at destination
};

function createCustomIcon(emoji, size, className) {
  return L.divIcon({
    html: `<div class="map-marker ${className || ''}">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    className: 'custom-map-icon'
  });
}

function createRiderIcon() {
  return L.divIcon({
    html: `<div class="rider-marker-wrap">
      <div class="rider-marker-icon">🚴</div>
      <div class="rider-marker-label">Delivery Boy</div>
      <div class="rider-marker-pulse"></div>
    </div>`,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    className: 'custom-map-icon'
  });
}

function initDeliveryMap() {
  destroyDeliveryMap();

  const mapEl = document.getElementById('tracking-map');
  if (!mapEl) return;

  // Create map
  deliveryMap = L.map('tracking-map', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
    dragging: true,
    doubleClickZoom: false,
  });

  // Map tiles — auto-detect system dark/light mode
  const isLightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const tileUrl = isLightMode
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  L.tileLayer(tileUrl, {
    maxZoom: 19,
  }).addTo(deliveryMap);

  // Add zoom control to bottom-right
  L.control.zoom({ position: 'bottomright' }).addTo(deliveryMap);

  // Draw the delivery route line (dashed)
  const routeLine = L.polyline(ROUTE_WAYPOINTS, {
    color: 'rgba(230, 57, 70, 0.3)',
    weight: 4,
    dashArray: '8 12',
    lineCap: 'round',
  }).addTo(deliveryMap);

  // Rider trail (solid, grows as rider moves)
  riderTrailLine = L.polyline([ROUTE_WAYPOINTS[0]], {
    color: '#e63946',
    weight: 4,
    lineCap: 'round',
    className: 'rider-trail-glow',
  }).addTo(deliveryMap);

  // Shop marker
  L.marker(SHOP_LOCATION, {
    icon: createCustomIcon('🏪', 40, 'marker-shop'),
  }).addTo(deliveryMap).bindPopup(
    '<div class="map-popup"><strong>Sikandar Raw Mutton</strong><br>Donar Gaumti, Darbhanga</div>'
  );

  // Destination marker
  const dest = ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];
  L.marker(dest, {
    icon: createCustomIcon('📍', 40, 'marker-dest'),
  }).addTo(deliveryMap).bindPopup(
    '<div class="map-popup"><strong>Delivery Location</strong><br>Your Address</div>'
  );

  // Rider/Delivery boy marker (starts at shop)
  riderMarker = L.marker(SHOP_LOCATION, {
    icon: createRiderIcon(),
    zIndexOffset: 1000,
  }).addTo(deliveryMap);

  // Fit bounds to show full route
  const bounds = L.latLngBounds(ROUTE_WAYPOINTS);
  deliveryMap.fitBounds(bounds.pad(0.3));

  // Set initial status
  updateMapStatusPill('Locating...', 'locating');

  // Fix map rendering after section becomes visible
  setTimeout(() => {
    if (deliveryMap) deliveryMap.invalidateSize();
  }, 300);
}

function updateDeliveryMapStep(stepIndex) {
  if (!deliveryMap || !riderMarker) return;

  const targetWaypointIdx = STEP_WAYPOINT_MAP[stepIndex] ?? 0;
  const statusLabels = ['📍 At Shop', '🔥 Preparing', '🛵 On the Way', '✅ Arrived'];
  const statusClasses = ['locating', 'preparing', 'delivering', 'delivered'];

  updateMapStatusPill(statusLabels[stepIndex] || 'Tracking...', statusClasses[stepIndex] || '');

  // Animate rider along waypoints to the target
  animateRiderTo(targetWaypointIdx);
}

let currentWaypointIdx = 0;

function animateRiderTo(targetIdx) {
  if (!riderMarker || targetIdx <= currentWaypointIdx) return;

  const startIdx = currentWaypointIdx;
  const totalSteps = targetIdx - startIdx;
  const stepsPerWaypoint = 30; // animation frames per segment
  let frame = 0;
  const totalFrames = totalSteps * stepsPerWaypoint;

  if (mapAnimationFrame) cancelAnimationFrame(mapAnimationFrame);

  function animate() {
    if (frame >= totalFrames) {
      currentWaypointIdx = targetIdx;
      return;
    }

    const progress = frame / totalFrames;
    const exactIdx = startIdx + progress * totalSteps;
    const segIdx = Math.floor(exactIdx);
    const segProgress = exactIdx - segIdx;

    if (segIdx < ROUTE_WAYPOINTS.length - 1) {
      const from = ROUTE_WAYPOINTS[segIdx];
      const to = ROUTE_WAYPOINTS[segIdx + 1];
      const lat = from[0] + (to[0] - from[0]) * segProgress;
      const lng = from[1] + (to[1] - from[1]) * segProgress;

      riderMarker.setLatLng([lat, lng]);

      // Update trail
      const trailPoints = ROUTE_WAYPOINTS.slice(0, segIdx + 1).concat([[lat, lng]]);
      if (riderTrailLine) riderTrailLine.setLatLngs(trailPoints);

      // Pan map to keep rider visible
      if (frame % 10 === 0) {
        deliveryMap.panTo([lat, lng], { animate: true, duration: 0.5 });
      }
    }

    frame++;
    mapAnimationFrame = requestAnimationFrame(animate);
  }

  animate();
}

function updateMapStatusPill(text, className) {
  const pill = document.getElementById('map-status-pill');
  if (!pill) return;
  pill.textContent = text;
  pill.className = 'map-status-pill';
  if (className) pill.classList.add('map-pill-' + className);
}

function destroyDeliveryMap() {
  if (mapAnimationFrame) {
    cancelAnimationFrame(mapAnimationFrame);
    mapAnimationFrame = null;
  }
  if (deliveryMap) {
    deliveryMap.remove();
    deliveryMap = null;
  }
  riderMarker = null;
  riderTrailLine = null;
  currentWaypointIdx = 0;
}

// ============================================
// Order History
// ============================================
function toggleOrderHistory() {
  const section = document.getElementById('order-history-section');
  const mainContent = document.getElementById('main-content');
  const trackingSection = document.getElementById('tracking-section');

  if (section.classList.contains('active')) {
    section.classList.remove('active');
    mainContent.classList.remove('hidden');
  } else {
    mainContent.classList.add('hidden');
    trackingSection.classList.remove('active');
    section.classList.add('active');
    renderOrderHistory();
  }
}

function renderOrderHistory() {
  const container = document.getElementById('order-history-list');
  if (!container) return;

  if (orderHistory.length === 0) {
    container.innerHTML = `
      <div class="order-history-empty">
        <span class="empty-icon">📋</span>
        <p>No orders yet</p>
        <p style="font-size:13px;">Place your first order to see it here!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = orderHistory.map(order => {
    const date = new Date(order.date);
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    const statusConfig = {
      confirmed: { label: 'Confirmed', class: 'status-confirmed', icon: '✓' },
      preparing: { label: 'Preparing', class: 'status-preparing', icon: '🔥' },
      delivering: { label: 'Out for Delivery', class: 'status-delivering', icon: '🚚' },
      delivered: { label: 'Delivered', class: 'status-delivered', icon: '✅' },
    };

    const status = statusConfig[order.status] || statusConfig.confirmed;

    return `
      <div class="order-history-card">
        <div class="order-card-header">
          <div>
            <p class="order-card-id">#${order.id}</p>
            <p class="order-card-date">${dateStr} · ${timeStr}</p>
          </div>
          <span class="order-status-pill ${status.class}">
            ${status.icon} ${status.label}
          </span>
        </div>
        <div class="order-card-items">
          ${order.items.map(c => `
            <span class="order-card-item">${c.name} (${c.weightLabel}) × ${c.qty}</span>
          `).join('')}
        </div>
        <div class="order-card-footer">
          <span class="order-card-total">₹${order.total}</span>
          <div class="order-card-actions">
            <span class="order-card-payment">💳 ${order.paymentMethod === 'card' ? 'Card' : order.paymentMethod === 'paypal' ? 'PayPal' : 'UPI'}</span>
            <button class="order-track-btn" onclick="trackExistingOrder('${order.id}')">
              📍 Track
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function trackExistingOrder(orderId) {
  const order = orderHistory.find(o => o.id === orderId);
  if (order) {
    showTrackingForOrder(order);
  }
}

// ============================================
// User Profile
// ============================================
let userProfile = JSON.parse(localStorage.getItem('srm_profile') || 'null') || {
  name: '', email: '', phone: '', dob: '',
  avatar: '👤',
  addresses: [],
  payments: [],
  prefs: { notifications: true, emails: false, darkMode: true, language: 'en' }
};

function toggleProfile() {
  const profileSection = document.getElementById('profile-section');
  const isActive = profileSection.classList.contains('active');

  // Hide everything else
  document.getElementById('main-content').classList.add('hidden');
  document.getElementById('tracking-section').classList.remove('active');
  document.getElementById('order-history-section').classList.remove('active');

  if (isActive) {
    profileSection.classList.remove('active');
    document.getElementById('main-content').classList.remove('hidden');
  } else {
    profileSection.classList.add('active');
    loadProfileUI();
  }
}

function loadProfileUI() {
  // Fill form fields
  document.getElementById('profile-name').value = userProfile.name || '';
  document.getElementById('profile-email').value = userProfile.email || '';
  document.getElementById('profile-phone').value = userProfile.phone || '';
  document.getElementById('profile-dob').value = userProfile.dob || '';

  // Display name/phone
  document.getElementById('profile-display-name').textContent = userProfile.name || 'Guest User';
  document.getElementById('profile-display-phone').textContent = userProfile.phone ? `📞 ${userProfile.phone}` : 'No phone added';

  // Avatar
  document.getElementById('profile-avatar').textContent = userProfile.avatar || '👤';
  document.getElementById('nav-avatar').textContent = userProfile.avatar || '👤';

  // Prefs
  document.getElementById('pref-notifications').checked = userProfile.prefs.notifications;
  document.getElementById('pref-emails').checked = userProfile.prefs.emails;
  document.getElementById('pref-darkmode').checked = userProfile.prefs.darkMode;
  document.getElementById('pref-language').value = userProfile.prefs.language;

  // Stats
  updateProfileStats();

  // Addresses
  renderAddresses();

  // Payment methods
  renderPaymentMethods();
}

function saveProfile() {
  userProfile.name = document.getElementById('profile-name').value.trim();
  userProfile.email = document.getElementById('profile-email').value.trim();
  userProfile.phone = document.getElementById('profile-phone').value.trim();
  userProfile.dob = document.getElementById('profile-dob').value;

  localStorage.setItem('srm_profile', JSON.stringify(userProfile));

  // Update display
  document.getElementById('profile-display-name').textContent = userProfile.name || 'Guest User';
  document.getElementById('profile-display-phone').textContent = userProfile.phone ? `📞 ${userProfile.phone}` : 'No phone added';

  showToast('✅ Profile saved successfully!');
}

function changeAvatar() {
  const avatars = ['👤','👨','👩','🧑','👦','👧','🧔','👨‍🍳','🤴','👸','🦸','🦹','🧑‍💻','🧑‍🎓'];
  const currentIdx = avatars.indexOf(userProfile.avatar);
  const nextIdx = (currentIdx + 1) % avatars.length;
  userProfile.avatar = avatars[nextIdx];

  document.getElementById('profile-avatar').textContent = userProfile.avatar;
  document.getElementById('nav-avatar').textContent = userProfile.avatar;
  localStorage.setItem('srm_profile', JSON.stringify(userProfile));
  showToast(`Avatar changed to ${userProfile.avatar}`);
}

function updateProfileStats() {
  const orders = orderHistory;
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Find favourite item
  const itemCount = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      itemCount[item.name] = (itemCount[item.name] || 0) + item.qty;
    });
  });
  const favItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('stat-total-orders').textContent = totalOrders;
  document.getElementById('stat-total-spent').textContent = `₹${totalSpent}`;
  document.getElementById('stat-fav-item').textContent = favItem ? favItem[0].split(' ')[0] : '—';
}

// --- Addresses ---
function renderAddresses() {
  const container = document.getElementById('profile-addresses');
  if (userProfile.addresses.length === 0) {
    container.innerHTML = '<p class="profile-empty-msg">No saved addresses yet.</p>';
    return;
  }
  container.innerHTML = userProfile.addresses.map((addr, i) => `
    <div class="address-card">
      <div class="address-info">
        <span class="address-label">${addr.label}</span>
        <span class="address-text">${addr.address}</span>
      </div>
      <button class="address-delete" onclick="deleteAddress(${i})" title="Remove">&times;</button>
    </div>
  `).join('');
}

function addNewAddress() {
  const label = prompt('Address label (Home, Office, etc.):');
  if (!label) return;
  const address = prompt('Full address:');
  if (!address) return;

  userProfile.addresses.push({ label, address });
  localStorage.setItem('srm_profile', JSON.stringify(userProfile));
  renderAddresses();
  showToast('📍 Address saved!');
}

function deleteAddress(index) {
  userProfile.addresses.splice(index, 1);
  localStorage.setItem('srm_profile', JSON.stringify(userProfile));
  renderAddresses();
  showToast('🗑️ Address removed');
}

// --- Payment Methods ---
function renderPaymentMethods() {
  const container = document.getElementById('profile-payments');
  if (userProfile.payments.length === 0) {
    container.innerHTML = '<p class="profile-empty-msg">No saved payment methods.</p>';
    return;
  }
  container.innerHTML = userProfile.payments.map((pm, i) => `
    <div class="payment-method-card">
      <span class="pm-icon">${pm.type === 'card' ? '💳' : pm.type === 'upi' ? '📱' : '🅿️'}</span>
      <div class="pm-info">
        <span class="pm-name">${pm.name}</span>
        <span class="pm-detail">${pm.detail}</span>
      </div>
      <button class="address-delete" onclick="deletePayment(${i})" title="Remove">&times;</button>
    </div>
  `).join('');
}

function addNewPayment() {
  const type = prompt('Payment type (card / upi / paypal):');
  if (!type) return;
  let name = '', detail = '';
  if (type.toLowerCase() === 'card') {
    const last4 = prompt('Last 4 digits of card:');
    if (!last4) return;
    name = 'Credit/Debit Card';
    detail = `•••• •••• •••• ${last4}`;
  } else if (type.toLowerCase() === 'upi') {
    const upiId = prompt('UPI ID:');
    if (!upiId) return;
    name = 'UPI';
    detail = upiId;
  } else {
    const email = prompt('PayPal email:');
    if (!email) return;
    name = 'PayPal';
    detail = email;
  }

  userProfile.payments.push({ type: type.toLowerCase(), name, detail });
  localStorage.setItem('srm_profile', JSON.stringify(userProfile));
  renderPaymentMethods();
  showToast('💳 Payment method saved!');
}

function deletePayment(index) {
  userProfile.payments.splice(index, 1);
  localStorage.setItem('srm_profile', JSON.stringify(userProfile));
  renderPaymentMethods();
  showToast('🗑️ Payment method removed');
}

// --- Preferences ---
function savePreferences() {
  userProfile.prefs.notifications = document.getElementById('pref-notifications').checked;
  userProfile.prefs.emails = document.getElementById('pref-emails').checked;
  userProfile.prefs.language = document.getElementById('pref-language').value;
  localStorage.setItem('srm_profile', JSON.stringify(userProfile));
  showToast('⚙️ Preferences saved!');
}

function toggleThemeOverride(isDark) {
  userProfile.prefs.darkMode = isDark;
  localStorage.setItem('srm_profile', JSON.stringify(userProfile));
  if (isDark) {
    document.documentElement.classList.remove('light-mode');
  } else {
    document.documentElement.classList.add('light-mode');
  }
  showToast(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
}

// --- Account ---
function logoutUser() {
  showToast('👋 Logged out. See you soon!');
  setTimeout(() => {
    showShop();
  }, 500);
}

function deleteAccount() {
  if (confirm('⚠️ Are you sure? This will delete all your data including orders, profile, and preferences.')) {
    localStorage.removeItem('srm_profile');
    localStorage.removeItem('srm_orders');
    userProfile = { name: '', email: '', phone: '', dob: '', avatar: '👤', addresses: [], payments: [], prefs: { notifications: true, emails: false, darkMode: true, language: 'en' } };
    orderHistory = [];
    showToast('🗑️ Account deleted.');
    showShop();
    renderProducts();
    updateCartUI();
  }
}

// ============================================
// Toast
// ============================================
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================
// Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
  renderOrderHistory();

  // Load profile avatar in navbar
  const savedProfile = JSON.parse(localStorage.getItem('srm_profile') || 'null');
  if (savedProfile) {
    userProfile = savedProfile;
    document.getElementById('nav-avatar').textContent = userProfile.avatar || '👤';
    // Apply saved theme preference
    if (!userProfile.prefs.darkMode) {
      document.documentElement.classList.add('light-mode');
    }
  }
});
