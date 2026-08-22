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
  let allOrders = [];
  let allContacts = [];
  let allAttributesGrouped = {
    gender: [],
    category: [],
    collection: [],
    size: [],
    color: [],
    material: []
  };

  // GLOBAL PAGINATION STATE
  const paginationState = {
    products: { currentPage: 1, pageSize: 10 },
    orders: { currentPage: 1, pageSize: 10 },
    contact: { currentPage: 1, pageSize: 10 },
    'attr-gender': { currentPage: 1, pageSize: 10 },
    'attr-category': { currentPage: 1, pageSize: 10 },
    'attr-collection': { currentPage: 1, pageSize: 10 },
    'attr-size': { currentPage: 1, pageSize: 10 },
    'attr-color': { currentPage: 1, pageSize: 10 },
    'attr-material': { currentPage: 1, pageSize: 10 }
  };

  function getPaginatedItems(items, tableKey) {
    if (!paginationState[tableKey]) {
      paginationState[tableKey] = { currentPage: 1, pageSize: 10 };
    }
    const state = paginationState[tableKey];
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));

    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }
    if (state.currentPage < 1) {
      state.currentPage = 1;
    }

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = Math.min(startIndex + state.pageSize, totalItems);
    const pageItems = items.slice(startIndex, endIndex);

    return {
      items: pageItems,
      totalItems,
      totalPages,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      startIndex,
      endIndex
    };
  }

  function updatePaginationFooter(tableKey, paginationData, onPageChange) {
    const infoEl = document.querySelector(`.pagination-info[data-table="${tableKey}"]`);
    const controlsEl = document.querySelector(`.pagination-controls[data-table="${tableKey}"]`);

    if (infoEl) {
      if (paginationData.totalItems === 0) {
        infoEl.textContent = 'Showing 0 to 0 of 0 entries';
      } else {
        const start = paginationData.startIndex + 1;
        const end = paginationData.endIndex;
        infoEl.textContent = `Showing ${start} to ${end} of ${paginationData.totalItems} entries`;
      }
    }

    if (!controlsEl) return;
    controlsEl.innerHTML = '';

    if (paginationData.totalPages <= 1) {
      return;
    }

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn-secondary';
    prevBtn.style.cssText = 'padding: 0.35rem 0.65rem; font-size: 0.8rem; width: auto; font-weight: 500; cursor: pointer;';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = paginationData.currentPage === 1;
    if (prevBtn.disabled) prevBtn.style.opacity = '0.4';
    prevBtn.addEventListener('click', () => {
      if (paginationData.currentPage > 1) {
        paginationState[tableKey].currentPage--;
        onPageChange();
      }
    });
    controlsEl.appendChild(prevBtn);

    // Page Number Buttons
    for (let i = 1; i <= paginationData.totalPages; i++) {
      if (
        paginationData.totalPages <= 7 ||
        i === 1 ||
        i === paginationData.totalPages ||
        Math.abs(i - paginationData.currentPage) <= 1
      ) {
        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = i === paginationData.currentPage ? 'btn-primary' : 'btn-secondary';
        pageBtn.style.cssText = 'padding: 0.35rem 0.65rem; font-size: 0.8rem; width: auto; font-weight: 600; min-width: 32px; cursor: pointer;';
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
          paginationState[tableKey].currentPage = i;
          onPageChange();
        });
        controlsEl.appendChild(pageBtn);
      } else if (
        (i === 2 && paginationData.currentPage > 3) ||
        (i === paginationData.totalPages - 1 && paginationData.currentPage < paginationData.totalPages - 2)
      ) {
        const dots = document.createElement('span');
        dots.style.cssText = 'color: var(--text-muted); font-size: 0.8rem; padding: 0 0.2rem; align-self: center;';
        dots.textContent = '...';
        controlsEl.appendChild(dots);
      }
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn-secondary';
    nextBtn.style.cssText = 'padding: 0.35rem 0.65rem; font-size: 0.8rem; width: auto; font-weight: 500; cursor: pointer;';
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = paginationData.currentPage === paginationData.totalPages;
    if (nextBtn.disabled) nextBtn.style.opacity = '0.4';
    nextBtn.addEventListener('click', () => {
      if (paginationData.currentPage < paginationData.totalPages) {
        paginationState[tableKey].currentPage++;
        onPageChange();
      }
    });
    controlsEl.appendChild(nextBtn);
  }

  // EVENT LISTENERS FOR PER-PAGE LIMIT SELECTORS
  document.querySelectorAll('.page-limit-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const tableKey = e.target.dataset.table;
      const newLimit = parseInt(e.target.value, 10) || 10;
      if (paginationState[tableKey]) {
        paginationState[tableKey].pageSize = newLimit;
        paginationState[tableKey].currentPage = 1;
      }

      if (tableKey === 'products') renderProductsTable(allProducts);
      else if (tableKey === 'orders') renderOrdersTable(allOrders);
      else if (tableKey === 'contact') renderContactTable(allContacts);
      else if (tableKey.startsWith('attr-')) {
        const type = tableKey.replace('attr-', '');
        renderSingleAttributeTable(type);
      }
    });
  });


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
    switchTab('overview');
    loadAttributesData();
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
    products: { title: 'Products Inventory', subtitle: 'Manage e-commerce inventory & prices' },
    'add-product': { title: 'Product Form', subtitle: 'Create or edit store catalog products' },
    'attr-gender': { title: 'Gender & Category Types', subtitle: 'Manage main department options' },
    'attr-category': { title: 'Category Names', subtitle: 'Manage product classification categories' },
    'attr-collection': { title: 'Collections', subtitle: 'Manage seasonal collections & style lines' },
    'attr-size': { title: 'Sizes', subtitle: 'Manage available size options' },
    'attr-color': { title: 'Colors', subtitle: 'Manage apparel color palette' },
    'attr-material': { title: 'Material & Fabric', subtitle: 'Manage fabric compositions' },
    orders: { title: 'Customer Orders', subtitle: 'Review and update fulfillment statuses' },
    contact: { title: 'Customer Inquiries', subtitle: 'Customer feedback and submitted forms' }
  };

  function switchTab(targetTab) {
    navLinks.forEach(l => {
      l.classList.toggle('active', l.dataset.tab === targetTab);
    });

    tabPanes.forEach(pane => {
      pane.style.display = pane.id === `tab-content-${targetTab}` ? 'block' : 'none';
    });

    if (tabInfoMap[targetTab]) {
      tabTitle.textContent = tabInfoMap[targetTab].title;
      tabSubtitle.textContent = tabInfoMap[targetTab].subtitle;
    }

    if (targetTab === 'overview') loadOverviewData();
    if (targetTab === 'products') loadProductsData();
    if (targetTab === 'add-product') loadAttributesData();
    if (targetTab.startsWith('attr-')) loadAttributesData();
    if (targetTab === 'orders') loadOrdersData();
    if (targetTab === 'contact') loadContactData();
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.dataset.tab;
      if (targetTab === 'add-product') {
        openAddProductView();
      } else {
        switchTab(targetTab);
      }
    });
  });

  document.querySelectorAll('.nav-to-products').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('products');
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

      allProducts = prods.products || [];
      allOrders = orders.orders || [];
      allContacts = msgs.messages || [];

      document.getElementById('stat-products-count').textContent = prods.count || allProducts.length || 0;
      document.getElementById('stat-orders-count').textContent = orders.count || allOrders.length || 0;
      document.getElementById('stat-messages-count').textContent = msgs.count || allContacts.length || 0;

      const pendingCount = allOrders.filter(o => (o.status || 'Pending').toLowerCase() === 'pending').length;
      const pendingEl = document.getElementById('stat-pending-orders');
      if (pendingEl) {
        pendingEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${pendingCount} Pending`;
      }

      const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      document.getElementById('stat-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;

      // Recent orders snippet
      const recentOrdersBody = document.getElementById('overview-recent-orders');
      if (!allOrders.length) {
        recentOrdersBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No orders placed yet.</td></tr>';
      } else {
        recentOrdersBody.innerHTML = allOrders.slice(0, 5).map(o => `
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

  function renderProductsTable(products = allProducts) {
    const tbody = document.getElementById('products-table-body');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No products matching filter.</td></tr>';
      updatePaginationFooter('products', { totalItems: 0, totalPages: 0, currentPage: 1, startIndex: 0, endIndex: 0 });
      return;
    }

    const paginated = getPaginatedItems(products, 'products');

    tbody.innerHTML = paginated.items.map(p => `
      <tr>
        <td>
          <div style="font-weight:600;">${escapeHtml(p.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-dim);">${escapeHtml(p.collection ? 'Collection: ' + p.collection : '')}</div>
        </td>
        <td><span style="text-transform:capitalize;">${escapeHtml(p.gender)}</span></td>
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

    updatePaginationFooter('products', paginated, () => renderProductsTable(products));
  }

  if (productSearchInput) {
    productSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      paginationState.products.currentPage = 1; // Reset to page 1 on search
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.collection && p.collection.toLowerCase().includes(term)) ||
        (p.gender && p.gender.toLowerCase().includes(term))
      );
      renderProductsTable(filtered);
    });
  }



  // MEDIA PREVIEW LOGIC
  const mediaPreviewContainer = document.getElementById('media-preview-container');
  const mediaPreviewGrid = document.getElementById('media-preview-grid');
  const prodImagesInput = document.getElementById('prod-images');
  const manualFileInput = document.getElementById('manual-file-input');

  function isVideoFile(pathOrName) {
    if (!pathOrName) return false;
    const lower = pathOrName.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.endsWith('.mov') || lower.startsWith('data:video');
  }

  function updateMediaPreview() {
    if (!mediaPreviewGrid || !mediaPreviewContainer) return;
    mediaPreviewGrid.innerHTML = '';
    let hasMedia = false;

    // 1. Local selected file preview (before upload)
    if (manualFileInput && manualFileInput.files && manualFileInput.files[0]) {
      const file = manualFileInput.files[0];
      const objectUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/') || isVideoFile(file.name);

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position: relative; display: inline-block; text-align: center; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 8px; border: 1px dashed var(--primary);';

      if (isVideo) {
        wrapper.innerHTML = `
          <video src="${objectUrl}" controls style="max-width: 140px; max-height: 110px; border-radius: 6px; object-fit: cover;"></video>
          <div style="font-size: 0.7rem; color: #38bdf8; font-weight: 600; margin-top: 0.25rem;">[Local Selected Video]</div>
        `;
      } else {
        wrapper.innerHTML = `
          <img src="${objectUrl}" style="max-width: 140px; max-height: 110px; border-radius: 6px; object-fit: cover;">
          <div style="font-size: 0.7rem; color: #38bdf8; font-weight: 600; margin-top: 0.25rem;">[Local Selected Image]</div>
        `;
      }
      mediaPreviewGrid.appendChild(wrapper);
      hasMedia = true;
    }

    // 2. Paths entered in prod-images input or uploaded
    if (prodImagesInput && prodImagesInput.value.trim()) {
      const rawPaths = prodImagesInput.value.split(',').map(p => p.trim()).filter(Boolean);
      rawPaths.forEach(rawPath => {
        const srcPath = rawPath.startsWith('http') || rawPath.startsWith('/') ? rawPath : '/' + rawPath;
        const isVideo = isVideoFile(rawPath);

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: relative; display: inline-block; text-align: center; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 8px; border: 1px solid var(--border-color);';

        const fileName = rawPath.split('/').pop();
        if (isVideo) {
          wrapper.innerHTML = `
            <video src="${srcPath}" controls style="max-width: 140px; max-height: 110px; border-radius: 6px; object-fit: cover;" onerror="this.outerHTML='<span style=\\'font-size:0.75rem; color:#ef4444; display:block; padding:1rem;\\'>Video load error</span>'"></video>
            <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.25rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(fileName)}</div>
          `;
        } else {
          wrapper.innerHTML = `
            <img src="${srcPath}" style="max-width: 140px; max-height: 110px; border-radius: 6px; object-fit: cover;" onerror="this.outerHTML='<span style=\\'font-size:0.75rem; color:#ef4444; display:block; padding:1rem;\\'>Image load error</span>'">
            <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.25rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(fileName)}</div>
          `;
        }
        mediaPreviewGrid.appendChild(wrapper);
        hasMedia = true;
      });
    }

    mediaPreviewContainer.style.display = hasMedia ? 'block' : 'none';
  }

  if (manualFileInput) {
    manualFileInput.addEventListener('change', updateMediaPreview);
  }
  if (prodImagesInput) {
    prodImagesInput.addEventListener('input', updateMediaPreview);
  }

  // DYNAMIC ATTRIBUTES MANAGEMENT
  async function loadAttributesData() {
    try {
      const res = await fetch(`${API_BASE}/attributes`);
      const data = await res.json();
      if (data.success) {
        allAttributesGrouped = data.grouped || {};
        renderAttributesTab();
        populateProductFormDropdowns();
      }
    } catch (err) {
      console.error('Error loading attributes:', err);
    }
  }

  function renderSingleAttributeTable(t) {
    const container = document.getElementById(`attr-table-${t}`);
    if (!container) return;
    const items = allAttributesGrouped[t] || [];
    const tableKey = `attr-${t}`;

    if (!items.length) {
      container.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">No records found. Add options using the form above.</td></tr>';
      updatePaginationFooter(tableKey, { totalItems: 0, totalPages: 0, currentPage: 1, startIndex: 0, endIndex: 0 });
      return;
    }

    const paginated = getPaginatedItems(items, tableKey);

    container.innerHTML = paginated.items.map((item, idx) => {
      const createdDate = item.created_at ? item.created_at.split(' ')[0] : 'N/A';
      const globalIdx = paginated.startIndex + idx + 1;
      return `
        <tr>
          <td><strong>${globalIdx}</strong></td>
          <td><span style="font-weight: 600; color: var(--text-main);">${escapeHtml(item.name)}</span></td>
          <td><span style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(createdDate)}</span></td>
          <td style="text-align: center;">
            <button class="btn-danger btn-delete-attr" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.btn-delete-attr').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteAttribute(btn.dataset.id);
      });
    });

    updatePaginationFooter(tableKey, paginated, () => renderSingleAttributeTable(t));
  }

  function renderAttributesTab() {
    const types = ['gender', 'category', 'collection', 'size', 'color', 'material'];
    types.forEach(t => renderSingleAttributeTable(t));
  }



  function populateProductFormDropdowns() {
    // 1. Gender dropdown
    const genderSelect = document.getElementById('prod-gender');
    if (genderSelect) {
      const genders = allAttributesGrouped.gender || [];
      const currentVal = genderSelect.value || 'men';
      genderSelect.innerHTML = genders.map(g => {
        let val = g.name.toLowerCase();
        if (val.includes('footwear') || val.includes('sandal')) val = 'sandals';
        return `<option value="${val}">${escapeHtml(g.name)}</option>`;
      }).join('');
      if (currentVal) genderSelect.value = currentVal;
    }

    // 2. Category dropdown
    const categorySelect = document.getElementById('prod-category');
    if (categorySelect) {
      const categories = allAttributesGrouped.category || [];
      const currentVal = categorySelect.value || '';
      categorySelect.innerHTML = '<option value="">-- Select Category --</option>' + categories.map(c => `
        <option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>
      `).join('');
      if (currentVal) categorySelect.value = currentVal;
    }

    // 3. Collection dropdown
    const collectionSelect = document.getElementById('prod-collection');
    if (collectionSelect) {
      const collections = allAttributesGrouped.collection || [];
      const currentVal = collectionSelect.value || '';
      collectionSelect.innerHTML = '<option value="">-- Select Collection --</option>' + collections.map(c => `
        <option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>
      `).join('');
      if (currentVal) collectionSelect.value = currentVal;
    }

    // 4. Material dropdown
    const materialSelect = document.getElementById('prod-material');
    if (materialSelect) {
      const materials = allAttributesGrouped.material || [];
      const currentVal = materialSelect.value || '';
      materialSelect.innerHTML = '<option value="">-- Select Material / Fabric --</option>' + materials.map(m => `
        <option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>
      `).join('');
      if (currentVal) materialSelect.value = currentVal;
    }

    // 5. Sizes dynamic toggle chips
    const sizesChips = document.getElementById('prod-sizes-chips');
    const sizesInput = document.getElementById('prod-sizes');
    if (sizesChips && sizesInput) {
      const sizes = allAttributesGrouped.size || [];
      const currentSelected = sizesInput.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      sizesChips.innerHTML = sizes.map(s => {
        const isSelected = currentSelected.includes(s.name.toLowerCase());
        return `<span class="attr-chip ${isSelected ? 'selected' : ''}" data-val="${escapeHtml(s.name)}">${escapeHtml(s.name)}</span>`;
      }).join('');

      sizesChips.querySelectorAll('.attr-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('selected');
          const selectedVals = Array.from(sizesChips.querySelectorAll('.attr-chip.selected')).map(c => c.dataset.val);
          sizesInput.value = selectedVals.join(', ');
        });
      });
    }

    // 6. Colors dynamic toggle chips
    const colorsChips = document.getElementById('prod-colors-chips');
    const colorsInput = document.getElementById('prod-colors');
    if (colorsChips && colorsInput) {
      const colors = allAttributesGrouped.color || [];
      const currentSelected = colorsInput.value.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
      colorsChips.innerHTML = colors.map(c => {
        const isSelected = currentSelected.includes(c.name.toLowerCase());
        return `<span class="attr-chip ${isSelected ? 'selected' : ''}" data-val="${escapeHtml(c.name)}">${escapeHtml(c.name)}</span>`;
      }).join('');

      colorsChips.querySelectorAll('.attr-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('selected');
          const selectedVals = Array.from(colorsChips.querySelectorAll('.attr-chip.selected')).map(c => c.dataset.val);
          colorsInput.value = selectedVals.join(', ');
        });
      });
    }
  }

  // Add Attribute Form Submissions
  document.querySelectorAll('.attr-add-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = form.dataset.type;
      const input = form.querySelector('.attr-input');
      const name = input.value.trim();
      if (!name) return;

      try {
        const res = await fetch(`${API_BASE}/attributes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ type, name })
        });
        const data = await res.json();
        if (data.success) {
          input.value = '';
          await loadAttributesData();
        } else {
          alert(data.message || 'Failed to add attribute.');
        }
      } catch (err) {
        alert('Network error adding attribute.');
      }
    });
  });

  // CUSTOM CONFIRMATION POPUP MODAL
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-modal-title');
  const confirmMessage = document.getElementById('confirm-modal-message');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
  const confirmOkBtn = document.getElementById('confirm-ok-btn');
  let activeConfirmAction = null;

  function showConfirmModal(title, message, onConfirm) {
    if (!confirmModal) return;
    if (title) confirmTitle.textContent = title;
    if (message) confirmMessage.textContent = message;
    activeConfirmAction = onConfirm;
    confirmModal.style.display = 'flex';
  }

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', () => {
      confirmModal.style.display = 'none';
      activeConfirmAction = null;
    });
  }

  if (confirmOkBtn) {
    confirmOkBtn.addEventListener('click', async () => {
      confirmModal.style.display = 'none';
      if (typeof activeConfirmAction === 'function') {
        const action = activeConfirmAction;
        activeConfirmAction = null;
        await action();
      }
    });
  }

  async function deleteAttribute(id) {
    showConfirmModal(
      'Remove Master Attribute Option',
      'Are you sure you want to remove this option? It will be deleted from the database.',
      async () => {
        try {
          const res = await fetch(`${API_BASE}/attributes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          const data = await res.json();
          if (data.success) {
            await loadAttributesData();
          } else {
            alert(data.message || 'Failed to delete attribute.');
          }
        } catch (err) {
          alert('Error deleting attribute.');
        }
      }
    );
  }


  // PRODUCT FORM PAGE HANDLERS
  async function openAddProductView() {
    const pageTitle = document.getElementById('page-product-title');
    if (pageTitle) pageTitle.innerHTML = '<i class="fa-solid fa-box-archive" style="color: var(--primary); margin-right: 0.5rem;"></i> Add New Product';
    document.getElementById('prod-is-edit').value = 'false';
    document.getElementById('prod-id').value = '';
    if (productForm) productForm.reset();
    await loadAttributesData();
    updateMediaPreview();
    switchTab('add-product');
  }

  if (openAddProductBtn) {
    openAddProductBtn.addEventListener('click', openAddProductView);
  }

  async function openEditProductModal(id) {
    const prod = allProducts.find(p => p.id === id);
    if (!prod) return;

    const pageTitle = document.getElementById('page-product-title');
    if (pageTitle) pageTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--primary); margin-right: 0.5rem;"></i> Edit Product (${escapeHtml(prod.name)})`;
    
    document.getElementById('prod-is-edit').value = 'true';
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-price').value = prod.price || 0;
    document.getElementById('prod-sizes').value = (prod.sizes || []).join(', ');
    document.getElementById('prod-colors').value = (prod.colors || []).join(', ');
    document.getElementById('prod-images').value = (prod.images || []).join(', ');
    document.getElementById('prod-description').value = prod.description || '';
    document.getElementById('prod-featured').checked = prod.featured;
    document.getElementById('prod-newArrival').checked = prod.newArrival;

    await loadAttributesData();

    if (document.getElementById('prod-gender')) document.getElementById('prod-gender').value = prod.gender || 'men';
    if (document.getElementById('prod-category')) document.getElementById('prod-category').value = prod.category || '';
    if (document.getElementById('prod-collection')) document.getElementById('prod-collection').value = prod.collection || '';
    if (document.getElementById('prod-material')) document.getElementById('prod-material').value = prod.material || '';

    populateProductFormDropdowns();
    updateMediaPreview();
    switchTab('add-product');
  }

  // MANUAL FILE UPLOAD HANDLER (IMAGE & VIDEO)
  const uploadFileBtn = document.getElementById('upload-file-btn');
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
          updateMediaPreview();
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

  if (productForm) {
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
          switchTab('products');
        } else {
          alert(data.message || 'Operation failed.');
        }
      } catch (err) {
        alert('Error saving product.');
      }
    });
  }


  async function deleteProduct(id) {
    showConfirmModal(
      'Confirm Product Deletion',
      `Are you sure you want to delete product "${id}"? This action cannot be undone.`,
      async () => {
        try {
          const res = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          const data = await res.json();
          if (data.success) {
            loadProductsData();
          } else {
            alert(data.message || 'Failed to delete product.');
          }
        } catch (err) {
          alert('Error deleting product.');
        }
      }
    );
  }


  // 3. ORDERS DATA
  async function loadOrdersData() {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      allOrders = data.orders || [];
      renderOrdersTable(allOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }

  function renderOrdersTable(orders = allOrders) {
    const tbody = document.getElementById('orders-table-body');
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No customer orders found.</td></tr>';
      updatePaginationFooter('orders', { totalItems: 0, totalPages: 0, currentPage: 1, startIndex: 0, endIndex: 0 });
      return;
    }

    const paginated = getPaginatedItems(orders, 'orders');

    tbody.innerHTML = paginated.items.map(o => {
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

    updatePaginationFooter('orders', paginated, () => renderOrdersTable(orders));
  }

  // 4. CONTACT MESSAGES DATA
  async function loadContactData() {
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      allContacts = data.messages || [];
      renderContactTable(allContacts);
    } catch (err) {
      console.error('Error loading contact messages:', err);
    }
  }

  function renderContactTable(messages = allContacts) {
    const tbody = document.getElementById('contact-table-body');
    if (!messages.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-dim);">No contact messages yet.</td></tr>';
      updatePaginationFooter('contact', { totalItems: 0, totalPages: 0, currentPage: 1, startIndex: 0, endIndex: 0 });
      return;
    }

    const paginated = getPaginatedItems(messages, 'contact');

    tbody.innerHTML = paginated.items.map(m => `
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

    updatePaginationFooter('contact', paginated, () => renderContactTable(messages));
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
