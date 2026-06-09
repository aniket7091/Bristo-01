const menuGrid = document.querySelector('[data-menu-grid]');
const categoryFilter = document.querySelector('[data-category-filter]');
const searchInput = document.querySelector('[data-menu-search]');
const cartList = document.querySelector('[data-cart-list]');
const orderForm = document.querySelector('[data-order-form]');
const subtotalEl = document.querySelector('[data-subtotal-amount]');
const gstEl = document.querySelector('[data-gst-amount]');
const totalAmountEl = document.querySelector('[data-total-amount]');
const orderFeedback = document.querySelector('[data-order-feedback]');
const clearCartButton = document.querySelector('[data-clear-cart]');
const placeOrderButton = document.querySelector('[data-place-order]');

// Tracking elements
const trackingSection = document.getElementById('order-tracking-section');
const trackingCard = document.getElementById('order-tracking-card');
const dismissTrackingBtn = document.getElementById('dismiss-tracking-btn');
const trackCustomerName = document.getElementById('track-customer-name');
const trackTableNumber = document.getElementById('track-table-number');
const trackingItemsList = document.getElementById('tracking-items-list');
const trackSubtotal = document.getElementById('track-subtotal');
const trackGst = document.getElementById('track-gst');
const trackTotal = document.getElementById('track-total');
const timerText = document.getElementById('timer-text');
const timerLabel = document.getElementById('timer-label');
const timerCircle = document.getElementById('timer-circle');
const trackingTimer = document.getElementById('tracking-timer');

const GST_RATE = 0.18;

let allMenuItems = [];
let cart = [];
let trackingOrderId = null;
let trackingInterval = null;
let timerInterval = null;

const formatCurrency = (value) => {
  const num = Number(value);
  return `₹${Number.isInteger(num) ? num : num.toFixed(2)}`;
};

const showOrderFeedback = (message, type) => {
  orderFeedback.textContent = message;
  orderFeedback.className = `feedback ${type}`;
  orderFeedback.classList.remove('hidden');
};

const getCartSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

const updateSummary = () => {
  const subtotal = getCartSubtotal();
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + gst;
  subtotalEl.textContent = formatCurrency(subtotal);
  gstEl.textContent = formatCurrency(gst);
  totalAmountEl.textContent = formatCurrency(total);
};

const renderCart = () => {
  if (!cart.length) {
    cartList.innerHTML = '<div class="empty-state">Your order summary will appear here once you add items.</div>';
    updateSummary();
    return;
  }

  cartList.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="item-row">
            <div>
              <strong>${item.name}</strong>
              <div class="small">${formatCurrency(item.price)} each</div>
            </div>
            <div class="quantity-control">
              <button type="button" data-cart-action="decrease" data-id="${item._id}">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-action="increase" data-id="${item._id}">+</button>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  updateSummary();
};

const addToCart = (menuItemId) => {
  const existingItem = cart.find((item) => item._id === menuItemId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const menuItem = allMenuItems.find((item) => item._id === menuItemId);
    if (!menuItem) return;
    cart.push({ ...menuItem, quantity: 1 });
  }
  renderCart();
};

const changeQuantity = (menuItemId, direction) => {
  cart = cart
    .map((item) => {
      if (item._id !== menuItemId) return item;
      return { ...item, quantity: item.quantity + direction };
    })
    .filter((item) => item.quantity > 0);

  renderCart();
};

const renderCategories = () => {
  const categories = ['All', ...new Set(allMenuItems.map((item) => item.category))];
  categoryFilter.innerHTML = categories
    .map((category) => `<option value="${category === 'All' ? '' : category}">${category}</option>`)
    .join('');

  const categoryFromUrl = new URLSearchParams(window.location.search).get('category');
  if (categoryFromUrl && categories.includes(categoryFromUrl)) {
    categoryFilter.value = categoryFromUrl;
  }
};

const renderMenu = (items) => {
  if (!items.length) {
    menuGrid.innerHTML = '<div class="empty-state">No menu items match your current search.</div>';
    return;
  }

  menuGrid.innerHTML = items
    .map(
      (item) => `
        <article class="menu-card">
          <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" />
          <div class="menu-meta">
            <span class="badge">${item.category}</span>
            <span class="price">${formatCurrency(item.price)}</span>
          </div>
          <div>
            <h3>${item.name}</h3>
            <p>${item.description || 'Freshly prepared and cafe favorite.'}</p>
          </div>
          <button class="btn btn-primary" type="button" data-add-to-cart="${item._id}">Add to Order</button>
        </article>
      `
    )
    .join('');
};

const applyFilters = () => {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = allMenuItems.filter((item) => {
    const matchesSearch = !search || `${item.name} ${item.description}`.toLowerCase().includes(search);
    const matchesCategory = !category || item.category === category;
    return matchesSearch && matchesCategory;
  });

  renderMenu(filtered);
};

const loadMenu = async () => {
  try {
    menuGrid.innerHTML = '<div class="empty-state">Loading menu...</div>';
    const data = await BristoAPI.request(BristoAPI.API.menu);
    allMenuItems = data.menuItems;
    renderCategories();
    applyFilters();
  } catch (error) {
    menuGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
};

// ─── ORDER TRACKING ─────────────────────────────────────────

const STATUS_ORDER = ['pending', 'preparing', 'ready', 'completed'];
const STATUS_LABELS = {
  pending: 'Order Placed',
  preparing: 'Being Prepared',
  ready: 'Ready for Pickup!',
  completed: 'Completed'
};

const updateTrackingUI = (order) => {
  trackCustomerName.textContent = order.customerName;
  trackTableNumber.textContent = `Table ${order.tableNumber}`;

  // Items list
  trackingItemsList.innerHTML = order.items
    .map((item) => `<div class="tracking-item-row"><span>${item.quantity} × ${item.name}</span><span>${formatCurrency(item.price * item.quantity)}</span></div>`)
    .join('');

  // Totals
  const subtotal = order.subtotal != null ? order.subtotal : order.totalAmount / (1 + GST_RATE);
  const gstAmount = order.gstAmount != null ? order.gstAmount : Math.round(subtotal * GST_RATE);
  trackSubtotal.textContent = formatCurrency(subtotal);
  trackGst.textContent = formatCurrency(gstAmount);
  trackTotal.textContent = formatCurrency(order.totalAmount);

  // Progress steps
  const statusIdx = STATUS_ORDER.indexOf(order.status);
  const steps = document.querySelectorAll('#tracking-progress .progress-step');
  const lines = document.querySelectorAll('#tracking-progress .progress-line');

  steps.forEach((step, i) => {
    step.classList.toggle('active', i <= statusIdx);
    step.classList.toggle('current', i === statusIdx);
  });
  lines.forEach((line, i) => {
    line.classList.toggle('active', i < statusIdx);
  });

  // Timer logic
  if (order.status === 'preparing') {
    trackingTimer.classList.remove('hidden');
    startCountdown(order);
    timerLabel.textContent = 'Your order will be ready in';
    trackingCard.className = 'order-tracking-card status-preparing';
  } else if (order.status === 'ready') {
    stopCountdown();
    trackingTimer.classList.remove('hidden');
    timerText.textContent = '✅';
    timerLabel.textContent = 'Your order is ready! Please collect it.';
    trackingCard.className = 'order-tracking-card status-ready';
    if (timerCircle) {
      timerCircle.style.strokeDashoffset = '0';
    }
  } else if (order.status === 'completed') {
    stopTracking();
    return;
  } else {
    // pending
    trackingTimer.classList.remove('hidden');
    timerText.textContent = '⏳';
    timerLabel.textContent = 'Waiting for the café to accept your order...';
    trackingCard.className = 'order-tracking-card status-pending';
  }
};

const startCountdown = (order) => {
  stopCountdown();
  const estimatedMs = (order.estimatedMinutes || 20) * 60 * 1000;
  const startTime = new Date(order.updatedAt || order.createdAt).getTime();
  const endTime = startTime + estimatedMs;
  const circumference = 2 * Math.PI * 45;

  if (timerCircle) {
    timerCircle.style.strokeDasharray = circumference;
  }

  const tick = () => {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerText.textContent = `${mins}:${String(secs).padStart(2, '0')}`;

    const fraction = remaining / estimatedMs;
    if (timerCircle) {
      timerCircle.style.strokeDashoffset = circumference * (1 - fraction);
    }

    if (remaining <= 0) {
      timerText.textContent = 'Almost ready!';
      stopCountdown();
    }
  };

  tick();
  timerInterval = setInterval(tick, 1000);
};

const stopCountdown = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const pollOrderStatus = async () => {
  if (!trackingOrderId) return;
  try {
    const data = await BristoAPI.request(`${BristoAPI.API.orders}/${trackingOrderId}/track`);
    updateTrackingUI(data.order);
  } catch (error) {
    // Order not found or error — stop tracking
    stopTracking();
  }
};

const startTracking = (orderId) => {
  trackingOrderId = orderId;
  localStorage.setItem('bristo_tracking_order', orderId);
  trackingSection.classList.remove('hidden');

  // Poll every 10 seconds
  pollOrderStatus();
  trackingInterval = setInterval(pollOrderStatus, 10000);

  // Scroll to tracking section
  trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const stopTracking = () => {
  trackingOrderId = null;
  localStorage.removeItem('bristo_tracking_order');
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
  stopCountdown();
  trackingSection.classList.add('hidden');
};

// Resume tracking if user reloads the page
const resumeTracking = () => {
  const savedOrderId = localStorage.getItem('bristo_tracking_order');
  if (savedOrderId) {
    startTracking(savedOrderId);
  }
};

// ─── EVENT LISTENERS ─────────────────────────────────────────

menuGrid?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-to-cart]');
  if (!button) return;
  addToCart(button.dataset.addToCart);
});

cartList?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;

  const direction = button.dataset.cartAction === 'increase' ? 1 : -1;
  changeQuantity(button.dataset.id, direction);
});

categoryFilter?.addEventListener('change', applyFilters);
searchInput?.addEventListener('input', applyFilters);
clearCartButton?.addEventListener('click', () => {
  cart = [];
  renderCart();
});

dismissTrackingBtn?.addEventListener('click', stopTracking);

orderForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!cart.length) {
    showOrderFeedback('Please add at least one item before placing an order.', 'error');
    return;
  }

  const button = placeOrderButton;
  const payload = Object.fromEntries(new FormData(orderForm).entries());
  payload.items = cart.map((item) => ({ menuItemId: item._id, quantity: item.quantity }));

  try {
    button.disabled = true;
    button.textContent = 'Placing Order...';
    const data = await BristoAPI.request(BristoAPI.API.orders, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const order = data.order;
    showOrderFeedback(
      `${data.message} Subtotal: ${formatCurrency(order.subtotal)} + GST: ${formatCurrency(order.gstAmount)} = Total: ${formatCurrency(order.totalAmount)}`,
      'success'
    );
    cart = [];
    orderForm.reset();
    renderCart();

    // Start tracking the placed order
    startTracking(order._id);
  } catch (error) {
    showOrderFeedback(error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Place Order';
  }
});

renderCart();
loadMenu();
resumeTracking();
