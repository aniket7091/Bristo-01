const token = BristoAPI.getOwnerToken();
if (!token) {
  window.location.href = '/owner-login';
}

const ownerNameEl = document.querySelector('[data-owner-name]');
const logoutButton = document.querySelector('[data-logout]');
const menuForm = document.querySelector('[data-menu-form]');
const menuFeedback = document.querySelector('[data-menu-feedback]');
const menuList = document.querySelector('[data-admin-menu-list]');
const ordersCurrent = document.querySelector('[data-current-orders]');
const ordersCompleted = document.querySelector('[data-completed-orders]');
const orderFilter = document.querySelector('[data-order-table-filter]');
const formTitle = document.querySelector('[data-menu-form-title]');
const cancelEditButton = document.querySelector('[data-cancel-edit]');
const previewImage = document.querySelector('[data-preview-image]');
const previewPlaceholder = document.querySelector('[data-preview-placeholder]');
const imageInput = document.querySelector('[data-image-input]');
const imageStatus = document.querySelector('[data-image-status]');
const metrics = {
  menuCount: document.querySelector('[data-metric-menu]'),
  currentCount: document.querySelector('[data-metric-current]'),
  completedCount: document.querySelector('[data-metric-completed]'),
  revenue: document.querySelector('[data-metric-revenue]')
};

// Invoice modal elements
const invoiceOverlay = document.getElementById('invoice-overlay');
const invoiceContent = document.getElementById('invoice-content');
const closeInvoiceBtn = document.getElementById('close-invoice-btn');
const closeInvoiceBtn2 = document.getElementById('close-invoice-btn-2');
const printInvoiceBtn = document.getElementById('print-invoice-btn');

let menuItems = [];
let orders = [];
let filteredTableNumber = '';
let imageSelection = null;

const formatCurrency = (value) => {
  const num = Number(value);
  return `₹${Number.isInteger(num) ? num : num.toFixed(2)}`;
};

const STATUS_FLOW = {
  pending: { next: 'preparing', label: '✅ Accept Order', btnClass: 'btn-success' },
  preparing: { next: 'ready', label: '🍽️ Mark Ready', btnClass: 'btn-warning' },
  ready: { next: 'completed', label: '✔️ Complete', btnClass: 'btn-primary' }
};

const STATUS_BADGES = {
  pending: { label: 'Pending', color: '#e67e22' },
  preparing: { label: 'Preparing', color: '#3498db' },
  ready: { label: 'Ready', color: '#2ecc71' },
  completed: { label: 'Completed', color: '#95a5a6' }
};

const showMenuFeedback = (message, type) => {
  menuFeedback.textContent = message;
  menuFeedback.className = `feedback ${type}`;
  menuFeedback.classList.remove('hidden');
};

const setPreview = (src) => {
  if (src) {
    previewImage.src = src;
    previewImage.classList.remove('hidden');
    previewPlaceholder.classList.add('hidden');
  } else {
    previewImage.src = '';
    previewImage.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
  }
};

const resetForm = () => {
  menuForm.reset();
  menuForm.dataset.editingId = '';
  menuForm.dataset.currentImageUrl = '';
  menuForm.dataset.currentFileId = '';
  imageSelection = null;
  formTitle.textContent = 'Add Menu Item';
  cancelEditButton.classList.add('hidden');
  imageStatus.textContent = 'Upload an item photo to ImageKit before saving.';
  setPreview('');
};

const uploadSelectedImage = async () => {
  if (!imageSelection) {
    return {
      imageUrl: menuForm.dataset.currentImageUrl || '',
      fileId: menuForm.dataset.currentFileId || ''
    };
  }

  imageStatus.textContent = 'Uploading image to ImageKit...';
  const formData = new FormData();
  formData.append('image', imageSelection);

  const response = await fetch(BristoAPI.API.upload, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BristoAPI.getOwnerToken()}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed.');
  }

  imageStatus.textContent = 'Image uploaded and ready to save.';
  return {
    imageUrl: data.imageUrl,
    fileId: data.fileId
  };
};

const renderMetrics = () => {
  const activeOrders = orders.filter((order) => ['pending', 'preparing', 'ready'].includes(order.status));
  const completedOrders = orders.filter((order) => order.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  metrics.menuCount.textContent = menuItems.length;
  metrics.currentCount.textContent = activeOrders.length;
  metrics.completedCount.textContent = completedOrders.length;
  metrics.revenue.textContent = formatCurrency(totalRevenue);
};

const renderMenuList = () => {
  if (!menuItems.length) {
    menuList.innerHTML = '<div class="empty-state">No menu items yet. Add your first signature dish.</div>';
    return;
  }

  menuList.innerHTML = menuItems
    .map(
      (item) => `
        <div class="admin-list-item">
          <div class="admin-card-head">
            <div>
              <strong>${item.name}</strong>
              <div class="small">${item.category} · ${formatCurrency(item.price)}</div>
            </div>
            <span class="badge">${item.isAvailable ? 'Available' : 'Hidden'}</span>
          </div>
          <p class="small">${item.description || 'No description added yet.'}</p>
          <div class="inline-actions">
            <button class="btn btn-secondary" type="button" data-edit-menu="${item._id}">Edit</button>
            <button class="btn btn-danger" type="button" data-delete-menu="${item._id}">Delete</button>
          </div>
        </div>
      `
    )
    .join('');
};

const renderActiveOrderCards = (target, list) => {
  if (!list.length) {
    target.innerHTML = '<div class="empty-state">No active orders right now.</div>';
    return;
  }

  target.innerHTML = list
    .map((order) => {
      const statusInfo = STATUS_BADGES[order.status] || STATUS_BADGES.pending;
      const flowAction = STATUS_FLOW[order.status];
      const subtotal = order.subtotal != null ? order.subtotal : order.totalAmount / 1.18;
      const gstAmount = order.gstAmount != null ? order.gstAmount : order.totalAmount - subtotal;

      let actionButtons = '';
      if (flowAction) {
        actionButtons = `
          <div class="order-actions-row">
            <button class="btn ${flowAction.btnClass}" type="button" data-update-status="${order._id}" data-next-status="${flowAction.next}">
              ${flowAction.label}
            </button>
            ${order.status === 'pending' ? `
              <label class="est-time-label">
                <span class="small">Est. minutes:</span>
                <input type="number" class="est-time-input" data-est-time="${order._id}" value="${order.estimatedMinutes || 20}" min="1" max="120" />
              </label>
            ` : ''}
          </div>
        `;
      }

      return `
        <div class="order-card order-status-${order.status}">
          <div class="order-row">
            <div>
              <strong>${order.customerName}</strong>
              <div class="small">Table ${order.tableNumber} · ${new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <span class="order-status-badge" style="--badge-color:${statusInfo.color}">${statusInfo.label}</span>
          </div>
          <div class="order-items-list">
            ${order.items
              .map((item) => `<div class="small order-item-line">${item.quantity} × ${item.name} <span class="muted">(${formatCurrency(item.price)} each)</span></div>`)
              .join('')}
          </div>
          <div class="order-gst-breakdown">
            <div class="small"><span class="muted">Subtotal:</span> ${formatCurrency(subtotal)}</div>
            <div class="small"><span class="muted">GST (18%):</span> ${formatCurrency(gstAmount)}</div>
            <div class="order-total-line"><strong>Total: ${formatCurrency(order.totalAmount)}</strong></div>
          </div>
          ${actionButtons}
        </div>
      `;
    })
    .join('');
};

const renderCompletedOrderCards = (target, list) => {
  if (!list.length) {
    target.innerHTML = '<div class="empty-state">No completed orders yet.</div>';
    return;
  }

  target.innerHTML = list
    .map((order) => {
      const subtotal = order.subtotal != null ? order.subtotal : order.totalAmount / 1.18;
      const gstAmount = order.gstAmount != null ? order.gstAmount : order.totalAmount - subtotal;

      return `
        <div class="order-card order-status-completed">
          <div class="order-row">
            <div>
              <strong>${order.customerName}</strong>
              <div class="small">Table ${order.tableNumber} · ${new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <span class="order-status-badge" style="--badge-color:#95a5a6">Completed</span>
          </div>
          <div class="order-items-list">
            ${order.items
              .map((item) => `<div class="small order-item-line">${item.quantity} × ${item.name} <span class="muted">(${formatCurrency(item.price)} each)</span></div>`)
              .join('')}
          </div>
          <div class="order-gst-breakdown">
            <div class="small"><span class="muted">Subtotal:</span> ${formatCurrency(subtotal)}</div>
            <div class="small"><span class="muted">GST (18%):</span> ${formatCurrency(gstAmount)}</div>
            <div class="order-total-line"><strong>Total: ${formatCurrency(order.totalAmount)}</strong></div>
          </div>
          <button class="btn btn-invoice" type="button" data-generate-invoice="${order._id}">
            📄 Generate Invoice
          </button>
        </div>
      `;
    })
    .join('');
};

const renderOrders = () => {
  const filteredOrders = filteredTableNumber
    ? orders.filter((order) => String(order.tableNumber) === String(filteredTableNumber))
    : orders;

  renderActiveOrderCards(
    ordersCurrent,
    filteredOrders.filter((order) => ['pending', 'preparing', 'ready'].includes(order.status))
  );
  renderCompletedOrderCards(
    ordersCompleted,
    filteredOrders.filter((order) => order.status === 'completed')
  );
};

const loadProfile = async () => {
  const data = await BristoAPI.request(`${BristoAPI.API.auth}/me`, {
    headers: {
      Authorization: `Bearer ${BristoAPI.getOwnerToken()}`
    }
  });
  ownerNameEl.textContent = data.owner.name;
};

const loadMenu = async () => {
  const data = await BristoAPI.request(BristoAPI.API.menu);
  menuItems = data.menuItems;
  renderMenuList();
  renderMetrics();
};

const loadOrders = async () => {
  const data = await BristoAPI.request(BristoAPI.API.orders, {
    headers: {
      Authorization: `Bearer ${BristoAPI.getOwnerToken()}`
    }
  });
  orders = data.orders;
  renderOrders();
  renderMetrics();
};

// ─── STATUS UPDATE HANDLER ─────────────────────────────────

const handleStatusUpdate = async (orderId, nextStatus) => {
  try {
    const body = { status: nextStatus };

    // If accepting an order, include estimated time
    if (nextStatus === 'preparing') {
      const estInput = document.querySelector(`[data-est-time="${orderId}"]`);
      if (estInput) {
        body.estimatedMinutes = Number(estInput.value) || 20;
      }
    }

    await BristoAPI.request(`${BristoAPI.API.orders}/${orderId}/status`, BristoAPI.authorizedJsonOptions('PATCH', body));
    await loadOrders();
  } catch (error) {
    showMenuFeedback(error.message, 'error');
  }
};

// ─── INVOICE HANDLER ────────────────────────────────────────

const calculateInvoiceTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice || item.price || 0) * Number(item.quantity || 0)),
    0
  );

  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  return {
    subtotal,
    gst,
    grandTotal,
  };
};

const handleGenerateInvoice = async (orderId) => {
  try {
    const data = await BristoAPI.request(`${BristoAPI.API.orders}/${orderId}/invoice`, {
      headers: {
        Authorization: `Bearer ${BristoAPI.getOwnerToken()}`
      }
    });

    const inv = data.invoice;
    const totals = calculateInvoiceTotals(inv.items);

    invoiceContent.innerHTML = `
      <div class="invoice-header-section">
        <div class="invoice-brand">
          <div class="invoice-logo">☕</div>
          <div>
            <h3 style="margin:0">Bristo Café</h3>
            <div class="small muted">Premium Dining Experience</div>
          </div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-number">Invoice #${inv.invoiceNumber}</div>
          <div class="small muted">Date: ${new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      <div class="invoice-customer-info">
        <div><strong>Customer:</strong> ${inv.customerName}</div>
        <div><strong>Table:</strong> ${inv.tableNumber}</div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items
            .map(
              (item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unitPrice)}</td>
              <td style="text-align:right">${formatCurrency(item.lineTotal)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="invoice-totals-section">
        <div class="invoice-total-row">
          <span>Subtotal</span>
          <span>${formatCurrency(totals.subtotal)}</span>
        </div>
        <div class="invoice-total-row gst-row">
          <span>GST (18%)</span>
          <span>${formatCurrency(totals.gst)}</span>
        </div>
        <div class="invoice-total-row grand-total">
          <strong>Grand Total</strong>
          <strong>${formatCurrency(totals.grandTotal)}</strong>
        </div>
      </div>

      <div class="invoice-footer-note">
        <p class="small muted" style="text-align:center;margin-top:1.5rem">Thank you for dining with us! ☕</p>
      </div>
    `;

    invoiceOverlay.classList.remove('hidden');
  } catch (error) {
    showMenuFeedback(error.message, 'error');
  }
};

const closeInvoice = () => {
  invoiceOverlay.classList.add('hidden');
};

const printInvoice = () => {
  window.print();
};

// ─── FORM HANDLERS ─────────────────────────────────────────

menuForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = menuForm.querySelector('button[type="submit"]');
  const formData = new FormData(menuForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    submitButton.disabled = true;
    submitButton.textContent = menuForm.dataset.editingId ? 'Updating Item...' : 'Saving Item...';
    const uploadResult = await uploadSelectedImage();
    payload.imageUrl = uploadResult.imageUrl;
    payload.imageFileId = uploadResult.fileId;
    payload.isAvailable = payload.isAvailable === 'on';

    const isEditing = Boolean(menuForm.dataset.editingId);
    const url = isEditing ? `${BristoAPI.API.menu}/${menuForm.dataset.editingId}` : BristoAPI.API.menu;
    const method = isEditing ? 'PUT' : 'POST';

    const data = await BristoAPI.request(url, BristoAPI.authorizedJsonOptions(method, payload));
    showMenuFeedback(data.message, 'success');
    resetForm();
    await loadMenu();
  } catch (error) {
    showMenuFeedback(error.message, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = menuForm.dataset.editingId ? 'Update Menu Item' : 'Save Menu Item';
  }
});

imageInput?.addEventListener('change', (event) => {
  const [file] = event.target.files;
  imageSelection = file || null;

  if (file) {
    setPreview(URL.createObjectURL(file));
    imageStatus.textContent = 'Image selected. Save the form to upload it to ImageKit.';
  } else {
    setPreview(menuForm.dataset.currentImageUrl || '');
    imageStatus.textContent = 'Upload an item photo to ImageKit before saving.';
  }
});

cancelEditButton?.addEventListener('click', resetForm);

menuList?.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-menu]');
  const deleteButton = event.target.closest('[data-delete-menu]');

  if (editButton) {
    const item = menuItems.find((entry) => entry._id === editButton.dataset.editMenu);
    if (!item) return;

    formTitle.textContent = 'Edit Menu Item';
    cancelEditButton.classList.remove('hidden');
    menuForm.dataset.editingId = item._id;
    menuForm.dataset.currentImageUrl = item.imageUrl || '';
    menuForm.dataset.currentFileId = item.imageFileId || '';
    menuForm.name.value = item.name;
    menuForm.price.value = item.price;
    menuForm.category.value = item.category;
    menuForm.description.value = item.description || '';
    menuForm.isAvailable.checked = Boolean(item.isAvailable);
    imageInput.value = '';
    imageSelection = null;
    imageStatus.textContent = 'Current image loaded. Choose a new file only if you want to replace it.';
    setPreview(item.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (deleteButton) {
    const confirmed = window.confirm('Delete this menu item?');
    if (!confirmed) return;

    try {
      await BristoAPI.request(`${BristoAPI.API.menu}/${deleteButton.dataset.deleteMenu}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${BristoAPI.getOwnerToken()}`
        }
      });
      await loadMenu();
    } catch (error) {
      showMenuFeedback(error.message, 'error');
    }
  }
});

// ─── ORDER EVENT DELEGATION ─────────────────────────────────

[ordersCurrent, ordersCompleted].forEach((container) => {
  container?.addEventListener('click', async (event) => {
    // Status update buttons
    const statusBtn = event.target.closest('[data-update-status]');
    if (statusBtn) {
      const orderId = statusBtn.dataset.updateStatus;
      const nextStatus = statusBtn.dataset.nextStatus;
      statusBtn.disabled = true;
      statusBtn.textContent = 'Updating...';
      await handleStatusUpdate(orderId, nextStatus);
      return;
    }

    // Invoice button
    const invoiceBtn = event.target.closest('[data-generate-invoice]');
    if (invoiceBtn) {
      invoiceBtn.disabled = true;
      invoiceBtn.textContent = 'Loading...';
      await handleGenerateInvoice(invoiceBtn.dataset.generateInvoice);
      invoiceBtn.disabled = false;
      invoiceBtn.textContent = '📄 Generate Invoice';
    }
  });
});

// Invoice modal close/print
closeInvoiceBtn?.addEventListener('click', closeInvoice);
closeInvoiceBtn2?.addEventListener('click', closeInvoice);
printInvoiceBtn?.addEventListener('click', printInvoice);
invoiceOverlay?.addEventListener('click', (e) => {
  if (e.target === invoiceOverlay) closeInvoice();
});

orderFilter?.addEventListener('input', (event) => {
  filteredTableNumber = event.target.value.trim();
  renderOrders();
});

logoutButton?.addEventListener('click', () => {
  BristoAPI.clearOwnerSession();
  window.location.href = '/owner-login';
});

const initializeDashboard = async () => {
  try {
    await Promise.all([loadProfile(), loadMenu(), loadOrders()]);
  } catch (error) {
    BristoAPI.clearOwnerSession();
    window.location.href = '/owner-login';
  }
};

resetForm();
initializeDashboard();

// Auto-refresh orders every 30 seconds
setInterval(loadOrders, 30000);
