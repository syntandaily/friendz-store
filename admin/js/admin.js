document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = '/api';
  let authToken = localStorage.getItem('friendz_token') || '';

  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const loginForm = document.getElementById('login-form');
  const loginAlert = document.getElementById('login-alert');
  const logoutBtn = document.getElementById('logout-btn');

  // Navigation Links & Tabs
  const navLinks = document.querySelectorAll('.nav-link');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const tabTitle = document.getElementById('tab-title');
  const tabSubtitle = document.getElementById('tab-subtitle');

  // Modal Elements
  const productModal = document.getElementById('product-modal');
  const productForm = document.getElementById('product-form');
  const openAddProductBtn = document.getElementById('open-add-product-btn');
  const closeProductModalBtn = document.getElementById('close-product-modal');
  const cancelProductBtn = document.getElementById('cancel-product-btn');
  const productSearchInput = document.getElementById('product-search-input');

  // Data cache
  let allProducts = [];

  // Init Auth Check
  if (authToken) {
    verifySession();
  } else {
    showLogin();
  }

  function showLogin() {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
  }

  function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'flex';
    loadOverviewData();
  }

  async function verifySession() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        showDashboard();
      } else {
        localStorage.removeItem('friendz_token');
        authToken = '';
        showLogin();
      }
    } catch {
      showLogin();
    }
  }

  // LOGIN FORM
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginAlert.style.display = 'none';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        authToken = data.token;
        localStorage.setItem('friendz_token', authToken);
        showDashboard();
      } else {
        loginAlert.textContent = data.message || 'Invalid login details.';
        loginAlert.style.display = 'block';
      }
    } catch (error) {
      loginAlert.textContent = 'Server connection failed.';
      loginAlert.style.display = 'block';
    }
  });

  // LOGOUT
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('friendz_token');
    authToken = '';
    showLogin();
  });

  // NAVIGATION TABS
  const tabInfoMap = {
    overview: { title: 'Dashboard Overview', subtitle: 'Real-time store metrics & summary' },
    products: { title: 'Products Catalog', subtitle: 'Manage e-commerce inventory & prices' },
    orders: { title: 'Customer Orders', subtitle: 'Review and update fulfillment statuses' },
    contact: { title: 'Customer Inquiries', subtitle: 'Customer feedback and submitted forms' }
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.dataset.tab;

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      tabPanes.forEach(pane => {
        pane.style.display = pane.id === `tab-content-${targetTab}` ? 'block' : 'none';
      });

      if (tabInfoMap[targetTab]) {
        tabTitle.textContent = tabInfoMap[targetTab].title;
        tabSubtitle.textContent = tabInfoMap[targetTab].subtitle;
      }

      if (targetTab === 'overview') loadOverviewData();
      if (targetTab === 'products') loadProductsData();
      if (targetTab === 'orders') loadOrdersData();
      if (targetTab === 'contact') loadContactData();
    });
  });

  // 1. OVERVIEW DATA
  async function loadOverviewData() {
    try {
      const [prodRes, ordRes, msgRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/orders`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch(`${API_BASE}/contact`, { headers: { 'Authorization': `Bearer ${authToken}` } })
      ]);

      const prods = await prodRes.json();
      const orders = await ordRes.json();
      const msgs = await msgRes.json();

      document.getElementById('stat-products-count').textContent = prods.count || 0;
      document.getElementById('stat-orders-count').textContent = orders.count || 0;
      document.getElementById('stat-messages-count').textContent = msgs.count || 0;

      const totalRevenue = (orders.orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
      document.getElementById('stat-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;

      // Recent orders snippet
      const recentOrdersBody = document.getElementById('overview-recent-orders');
      if (!orders.orders || orders.orders.length === 0) {
        recentOrdersBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No orders placed yet.</td></tr>';
      } else {
        recentOrdersBody.innerHTML = orders.orders.slice(0, 5).map(o => `
          <tr>
            <td><strong>#${o.order_number}</strong></td>
            <td>${escapeHtml(o.customer_name)}</td>
            <td>${escapeHtml(o.customer_phone)}</td>
            <td>₹${(o.total_amount || 0).toLocaleString('en-IN')}</td>
            <td><span class="badge badge-${(o.status || 'Pending').toLowerCase()}">${o.status}</span></td>
            <td style="color: var(--text-dim); font-size:0.8rem;">${new Date(o.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }

    } catch (err) {
      console.error('Error loading overview metrics:', err);
    }
  }

  // 2. PRODUCTS DATA
  async function loadProductsData() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      allProducts = data.products || [];
      renderProductsTable(allProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-dim);">No products matching filter.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td><code>${p.id}</code></td>
        <td>
          <div style="font-weight:600;">${escapeHtml(p.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-dim);">${escapeHtml(p.collection || '')}</div>
        </td>
        <td><span style="text-transform:capitalize;">${p.gender}</span></td>
        <td>${escapeHtml(p.category || '-')}</td>
        <td><strong>₹${(p.price || 0).toLocaleString('en-IN')}</strong></td>
        <td>${p.featured ? '<i class="fa-solid fa-star" style="color:#f59e0b;"></i> Yes' : 'No'}</td>
        <td>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn-secondary btn-edit-prod" data-id="${p.id}" style="padding:0.4rem 0.75rem; font-size:0.8rem;">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button class="btn-danger btn-delete-prod" data-id="${p.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach Event Listeners
    tbody.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', () => openEditProductModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
  }

  productSearchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p =>
      p.id.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
    renderProductsTable(filtered);
  });

  // PRODUCT MODAL HANDLERS
  openAddProductBtn.addEventListener('click', () => {
    document.getElementById('modal-product-title').textContent = 'Add New Product';
    document.getElementById('prod-is-edit').value = 'false';
    document.getElementById('prod-id').readOnly = false;
    productForm.reset();
    productModal.style.display = 'flex';
  });

  function openEditProductModal(id) {
    const prod = allProducts.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('modal-product-title').textContent = `Edit Product (${prod.id})`;
    document.getElementById('prod-is-edit').value = 'true';
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-id').readOnly = true;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-gender').value = prod.gender || 'men';
    document.getElementById('prod-category').value = prod.category || '';
    document.getElementById('prod-price').value = prod.price || 0;
    document.getElementById('prod-collection').value = prod.collection || '';
    document.getElementById('prod-sizes').value = (prod.sizes || []).join(', ');
    document.getElementById('prod-colors').value = (prod.colors || []).join(', ');
    document.getElementById('prod-material').value = prod.material || '';
    document.getElementById('prod-images').value = (prod.images || []).join(', ');
    document.getElementById('prod-description').value = prod.description || '';
    document.getElementById('prod-featured').checked = prod.featured;
    document.getElementById('prod-newArrival').checked = prod.newArrival;

    productModal.style.display = 'flex';
  }

  closeProductModalBtn.addEventListener('click', () => productModal.style.display = 'none');
  cancelProductBtn.addEventListener('click', () => productModal.style.display = 'none');

  // MANUAL FILE UPLOAD HANDLER (IMAGE & VIDEO)
  const uploadFileBtn = document.getElementById('upload-file-btn');
  const manualFileInput = document.getElementById('manual-file-input');
  const uploadStatusText = document.getElementById('upload-status-text');

  if (uploadFileBtn && manualFileInput) {
    uploadFileBtn.addEventListener('click', async () => {
      const file = manualFileInput.files[0];
      if (!file) {
        alert('Please select an image or video file first.');
        return;
      }

      uploadStatusText.textContent = 'Uploading file...';
      uploadStatusText.style.color = '#a1a1aa';
      uploadFileBtn.disabled = true;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          uploadStatusText.textContent = `✅ Uploaded (${data.fileType})!`;
          uploadStatusText.style.color = '#10b981';

          const prodImagesInput = document.getElementById('prod-images');
          const currentVal = prodImagesInput.value.trim();
          if (currentVal) {
            prodImagesInput.value = `${currentVal}, ${data.filePath}`;
          } else {
            prodImagesInput.value = data.filePath;
          }
          manualFileInput.value = '';
        } else {
          uploadStatusText.textContent = '❌ Upload failed.';
          uploadStatusText.style.color = '#ef4444';
          alert(data.message || 'Upload failed.');
        }
      } catch (err) {
        uploadStatusText.textContent = '❌ Network error.';
        uploadStatusText.style.color = '#ef4444';
        alert('File upload failed.');
      } finally {
        uploadFileBtn.disabled = false;
      }
    });
  }

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isEdit = document.getElementById('prod-is-edit').value === 'true';
    const id = document.getElementById('prod-id').value.trim();

    const payload = {
      id,
      name: document.getElementById('prod-name').value.trim(),
      gender: document.getElementById('prod-gender').value,
      category: document.getElementById('prod-category').value.trim(),
      price: parseFloat(document.getElementById('prod-price').value) || 0,
      collection: document.getElementById('prod-collection').value.trim(),
      sizes: document.getElementById('prod-sizes').value.split(',').map(s => s.trim()).filter(Boolean),
      colors: document.getElementById('prod-colors').value.split(',').map(c => c.trim()).filter(Boolean),
      material: document.getElementById('prod-material').value.trim(),
      images: document.getElementById('prod-images').value.split(',').map(i => i.trim()).filter(Boolean),
      description: document.getElementById('prod-description').value.trim(),
      featured: document.getElementById('prod-featured').checked,
      newArrival: document.getElementById('prod-newArrival').checked
    };

    const url = isEdit ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        productModal.style.display = 'none';
        loadProductsData();
      } else {
        alert(data.message || 'Operation failed.');
      }
    } catch (err) {
      alert('Error saving product.');
    }
  });

  async function deleteProduct(id) {
    if (!confirm(`Are you sure you want to delete product "${id}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        loadProductsData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to delete product.');
    }
  }

  // 3. ORDERS DATA
  async function loadOrdersData() {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      renderOrdersTable(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }

  function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No customer orders found.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const itemsList = (o.items || []).map(i => `${i.product_name} (${i.quantity}x)`).join(', ');
      return `
        <tr>
          <td><strong>#${o.order_number}</strong></td>
          <td>
            <div style="font-weight:600;">${escapeHtml(o.customer_name)}</div>
            <div style="font-size:0.75rem; color:var(--text-dim);">${new Date(o.created_at).toLocaleString()}</div>
          </td>
          <td>
            <div>📞 ${escapeHtml(o.customer_phone)}</div>
            <div style="font-size:0.8rem; color:var(--text-dim); max-width:220px;">📍 ${escapeHtml(o.address)}, ${escapeHtml(o.pincode)}</div>
          </td>
          <td style="font-size:0.85rem; max-width:250px;">${escapeHtml(itemsList)}</td>
          <td><strong>₹${(o.total_amount || 0).toLocaleString('en-IN')}</strong></td>
          <td>
            <select class="form-control order-status-select" data-id="${o.id}" style="padding:0.4rem 0.6rem; font-size:0.85rem; width:auto;">
              ${['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(st => `
                <option value="${st}" ${o.status === st ? 'selected' : ''}>${st}</option>
              `).join('')}
            </select>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.order-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const orderId = select.dataset.id;
        const newStatus = e.target.value;

        try {
          const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: newStatus })
          });
          const data = await res.json();
          if (!data.success) {
            alert('Failed to update order status.');
            loadOrdersData();
          }
        } catch (err) {
          alert('Network error updating status.');
          loadOrdersData();
        }
      });
    });
  }

  // 4. CONTACT MESSAGES DATA
  async function loadContactData() {
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      renderContactTable(data.messages || []);
    } catch (err) {
      console.error('Error loading contact messages:', err);
    }
  }

  function renderContactTable(messages) {
    const tbody = document.getElementById('contact-table-body');
    if (!messages.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-dim);">No contact messages yet.</td></tr>';
      return;
    }

    tbody.innerHTML = messages.map(m => `
      <tr>
        <td style="font-size:0.8rem; color:var(--text-dim);">${new Date(m.created_at).toLocaleDateString()}</td>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td>
          <div>${escapeHtml(m.email)}</div>
          <div style="font-size:0.8rem; color:var(--text-dim);">${escapeHtml(m.phone || '-')}</div>
        </td>
        <td style="max-width:300px; font-size:0.85rem;">${escapeHtml(m.message)}</td>
        <td>
          <span class="badge ${m.status === 'Read' ? 'badge-delivered' : 'badge-pending'}">${m.status || 'Unread'}</span>
        </td>
      </tr>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
