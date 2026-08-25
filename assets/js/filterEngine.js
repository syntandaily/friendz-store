/**
 * FRIENDZ FILTER ENGINE v2
 * Comprehensive filtering system with category-specific filters, sorting, and active indicators
 * Supports: Search, Category, Size, and Price filtering with real-time product updates
 */

const FilterConfig = {
  women: {
    categories: ["Tops", "Kurtis", "Dresses", "Ethnic Wear", "Casual Wear", "Bottom Wear"],
    sizes: ["XS", "S", "M", "L", "XL", "Free Size", "26", "28", "30", "32"],
    priceRanges: [
      { label: "Under ₹999", min: 0, max: 999 },
      { label: "₹999 – ₹1,499", min: 999, max: 1499 },
      { label: "₹1,499 – ₹1,999", min: 1499, max: 1999 },
      { label: "₹1,999 – ₹2,999", min: 1999, max: 2999 },
      { label: "Above ₹2,999", min: 2999, max: Infinity }
    ]
  },
  men: {
    categories: ["Shirts", "T-Shirts", "Polo T-Shirts", "Jeans", "Trousers", "Formal Wear", "Casual Wear", "Ethnic Wear"],
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    priceRanges: [
      { label: "Under ₹999", min: 0, max: 999 },
      { label: "₹999 – ₹1,499", min: 999, max: 1499 },
      { label: "₹1,499 – ₹1,999", min: 1499, max: 1999 },
      { label: "₹1,999 – ₹2,999", min: 1999, max: 2999 },
      { label: "Above ₹2,999", min: 2999, max: Infinity }
    ]
  },
  kids: {
    genders: ["boys", "girls", "both"],
    categories: ["Boys", "Girls", "Shirts", "T-Shirts", "Dresses", "Frocks", "Casual Wear", "Party Wear", "Ethnic Wear"],
    sizes: ["0–1 Y", "1–2 Y", "2–3 Y", "3–4 Y", "4–5 Y", "5–6 Y", "6–7 Y", "7–8 Y", "8–10 Y", "10–12 Y", "12–14 Y"],
    priceRanges: [
      { label: "Under ₹499", min: 0, max: 499 },
      { label: "₹499 – ₹799", min: 499, max: 799 },
      { label: "₹799 – ₹1,299", min: 799, max: 1299 },
      { label: "₹1,299 – ₹1,799", min: 1299, max: 1799 },
      { label: "Above ₹1,799", min: 1799, max: Infinity }
    ]
  },
  sandals: {
    categories: ["Men", "Women", "Kids", "Casual", "Fashion", "Daily Wear", "Party Wear"],
    sizes: ["5", "6", "7", "8", "9", "10", "11"],
    priceRanges: [
      { label: "Under ₹499", min: 0, max: 499 },
      { label: "₹499 – ₹799", min: 499, max: 799 },
      { label: "₹799 – ₹999", min: 799, max: 999 },
      { label: "₹999 – ₹1,499", min: 999, max: 1499 },
      { label: "Above ₹1,499", min: 1499, max: Infinity }
    ]
  }
};

const FilterEngine = (() => {
  let originalProducts = [];
  let filteredProducts = [];
  let currentPageType = "";

  const activeFilters = {
    searchQuery: "",
    categories: [],
    sizes: [],
    prices: [],
    kidGender: "both",
    sort: "featured"
  };

  let productGridEl, noResultsEl, resultsCountEl, searchInputEl, sortSelectEl;
  let filterDrawerEl, filterBackdropEl, mobileFilterBtnEl, mobileSortBtnEl;

  // Product data and filter labels may use different dash or spacing styles.
  // Compare canonical values so equivalent sizes always match.
  function normalizeSize(size) {
    return String(size)
      .trim()
      .toUpperCase()
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .replace(/\s+/g, '');
  }

  /**
   * Initialize the filter engine for a page
   * @param {string} pageType The page type: "women", "men", "kids", or "footwear"
   */
  function init(pageType) {
    currentPageType = pageType;

    // Get products for this category
    if (pageType === "all") {
      originalProducts = [...PRODUCTS];
    } else {
      originalProducts = PRODUCTS.filter(p => p.gender === pageType);
    }

    filteredProducts = [...originalProducts];

    // Cache DOM elements
    productGridEl = document.getElementById('product-grid');
    noResultsEl = document.getElementById('no-results');
    resultsCountEl = document.getElementById('results-count');
    searchInputEl = document.getElementById('search-input');
    sortSelectEl = document.getElementById('sort-select');
    filterDrawerEl = document.getElementById('filter-drawer');
    filterBackdropEl = document.getElementById('filter-backdrop');
    mobileFilterBtnEl = document.getElementById('mobile-filter-btn');
    mobileSortBtnEl = document.getElementById('mobile-sort-btn');

    // Price range has been removed from the storefront filters.
    document.querySelectorAll('.price-grid').forEach(grid => grid.closest('.filter-group')?.remove());

    // Attach event listeners
    attachEventListeners();

    // Initial render
    applyFilters();

    // Listen for dynamic product updates from backend
    document.addEventListener('friendz:products-updated', (e) => {
      if (currentPageType === "all") {
        originalProducts = [...e.detail];
      } else {
        originalProducts = e.detail.filter(p => p.gender === currentPageType);
      }
      applyFilters();
    });
  }

  function attachEventListeners() {
    // Search input
    document.querySelectorAll('#search-input, #search-input-mobile').forEach(input => {
      input.addEventListener('input', (e) => {
        activeFilters.searchQuery = e.target.value.toLowerCase();
        document.querySelectorAll('#search-input, #search-input-mobile').forEach(other => {
          if (other !== e.target) other.value = e.target.value;
        });
        applyFilters();
      });
    });

    // Sort select
    if (sortSelectEl) {
      sortSelectEl.addEventListener('change', (e) => {
        activeFilters.sort = e.target.value;
        applyFilters();
      });
    }

    // Category filters
    document.querySelectorAll('.category-filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const value = e.target.value;
        toggleFilterValue('categories', value, e.target.checked);
        syncControls('categories', value, e.target.checked);
        applyFilters();
      });
    });

    // Size filters
    document.querySelectorAll('.size-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        const selected = !activeFilters.sizes.includes(size);
        toggleFilterValue('sizes', size, selected);
        syncControls('sizes', size, selected);
        applyFilters();
      });
    });

    // Price filters
    document.querySelectorAll('.price-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const priceLabel = btn.dataset.price;
        const selected = !activeFilters.prices.includes(priceLabel);
        toggleFilterValue('prices', priceLabel, selected);
        syncControls('prices', priceLabel, selected);
        applyFilters();
      });
    });

    // Clear all filters
    document.querySelectorAll('.clear-all-btn').forEach(btn => {
      btn.addEventListener('click', clearAllFilters);
    });

    // Remove individual filter indicators
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-remove-btn')) {
        const filterType = e.target.dataset.filterType;
        const filterValue = e.target.dataset.filterValue;
        removeFilter(filterType, filterValue);
      }
    });

    // Mobile filter drawer
    if (mobileFilterBtnEl) {
      mobileFilterBtnEl.addEventListener('click', openFilterDrawer);
    }

    if (filterBackdropEl) {
      filterBackdropEl.addEventListener('click', closeFilterDrawer);
    }

    document.querySelectorAll('.apply-filters-btn').forEach(btn => {
      btn.addEventListener('click', closeFilterDrawer);
    });

    // Kids gender filters. "Both" resets the gender restriction.
    document.querySelectorAll('.gender-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilters.kidGender = btn.dataset.gender;
        document.querySelectorAll('.gender-filter-btn').forEach(control => {
          control.classList.toggle('active', control.dataset.gender === activeFilters.kidGender);
        });
        applyFilters();
      });
    });

    document.querySelectorAll('.filter-drawer-close').forEach(btn => {
      btn.addEventListener('click', closeFilterDrawer);
    });

    // Close drawer on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && filterDrawerEl?.classList.contains('active')) {
        closeFilterDrawer();
      }
    });
  }

  function toggleFilterValue(type, value, selected) {
    activeFilters[type] = activeFilters[type].filter(item => item !== value);
    if (selected) activeFilters[type].push(value);
  }

  function syncControls(type, value, selected) {
    const selectors = {
      categories: `.category-filter-checkbox[value="${value}"]`,
      sizes: `.size-pill[data-size="${value}"]`,
      prices: `.price-pill[data-price="${value}"]`
    };
    document.querySelectorAll(selectors[type]).forEach(control => {
      if (type === 'categories') control.checked = selected;
      else control.classList.toggle('active', selected);
    });
  }

  function applyFilters() {
    filteredProducts = originalProducts.filter(product => {
      // A boys/girls selection also includes unisex Kids products.
      if (currentPageType === 'kids' && activeFilters.kidGender !== 'both' &&
          product.kidGender !== activeFilters.kidGender && product.kidGender !== 'both') {
        return false;
      }

      // Search filter
      if (activeFilters.searchQuery) {
        const term = activeFilters.searchQuery;
        const matchesName = product.name.toLowerCase().includes(term);
        const matchesCategory = product.category.toLowerCase().includes(term);
        const matchesDesc = product.description.toLowerCase().includes(term);
        const matchesMaterial = product.material.toLowerCase().includes(term);

        if (!matchesName && !matchesCategory && !matchesDesc && !matchesMaterial) {
          return false;
        }
      }

      // Category filter
      if (activeFilters.categories.length > 0) {
        if (!activeFilters.categories.includes(product.category)) {
          return false;
        }
      }

      // Size filter
      if (activeFilters.sizes.length > 0) {
        const selectedSizes = new Set(activeFilters.sizes.map(normalizeSize));
        const hasSize = (product.sizes || []).some(size => selectedSizes.has(normalizeSize(size)));
        if (!hasSize) {
          return false;
        }
      }

      // Price filter
      if (activeFilters.prices.length > 0) {
        const config = FilterConfig[currentPageType];
        const priceRanges = config.priceRanges;
        const matchesPrice = activeFilters.prices.some(priceLabel => {
          const range = priceRanges.find(r => r.label === priceLabel);
          return range && product.price >= range.min && product.price <= range.max;
        });
        if (!matchesPrice) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    sortProducts();

    // Render results
    render();
    updateActiveIndicators();
  }

  function sortProducts() {
    switch (activeFilters.sort) {
      case "newest":
        filteredProducts.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "featured":
      default:
        filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
  }

  function render() {
    if (!productGridEl) return;

    // Update results count
    if (resultsCountEl) {
      const count = filteredProducts.length;
      resultsCountEl.textContent = count === 1 ? "1 PRODUCT" : `${count} PRODUCTS`;
    }

    if (filteredProducts.length === 0) {
      if (noResultsEl) noResultsEl.classList.add('active');
      productGridEl.style.display = 'none';
      return;
    }

    if (noResultsEl) noResultsEl.classList.remove('active');
    productGridEl.style.display = 'grid';

    let gridHTML = "";
    filteredProducts.forEach(product => {
      const sizesHTML = product.sizes.join(' / ');
      const imgPath = product.images[0];
      const imgAlt = product.name;

      gridHTML += `
        <article class="product-card" data-id="${product.id}">
          <div class="product-image-container">
            <img class="product-img" src="${imgPath}" alt="${imgAlt}" loading="lazy">
            <div class="product-card-overlay">
              <div class="overlay-actions">
                <button class="btn-card-action btn-view-image" data-id="${product.id}" aria-label="View large product image">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  View Image
                </button>
                <button class="btn-card-action btn-details" data-id="${product.id}">View Details</button>
              </div>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
            <span class="product-sizes-preview">Sizes: ${sizesHTML}</span>
          </div>
          <button type="button" class="btn-add-cart" data-id="${product.id}"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>Add to Bag</button>
          <a class="btn-whatsapp-direct" href="${getWhatsAppLink(product)}" target="_blank" rel="noopener noreferrer" aria-label="Enquire on WhatsApp for ${product.name}">
            <svg viewBox="0 0 24 24"><path d="M12.012 2.25c-5.378 0-9.755 4.378-9.755 9.756 0 1.72.448 3.396 1.298 4.873l-1.38 5.043 5.158-1.353a9.717 9.717 0 0 0 4.679 1.2c5.38 0 9.757-4.378 9.757-9.756 0-2.6-1.011-5.048-2.848-6.886A9.704 9.704 0 0 0 12.012 2.25zm5.727 13.82c-.249.702-1.246 1.282-1.721 1.373-.424.08-1.036.142-2.92-.64a10.66 10.66 0 0 1-4.577-4.045c-.86-1.15-1.503-2.483-1.503-3.865 0-1.564.819-2.33 1.111-2.632.247-.256.657-.384.992-.384.108 0 .205.005.289.01.25.013.418.03.6.413.227.476.776 1.895.842 2.03.067.137.112.298.023.477-.09.18-.135.29-.272.45-.136.16-.285.358-.407.48-.136.136-.278.285-.12.557.158.272.702 1.157 1.503 1.872.8 0 1.488.702 2.29.986c.214.076.34.023.465-.12.125-.143.533-.623.67-.84.135-.215.27-.182.453-.114.182.068 1.157.545 1.361.648.204.102.34.153.386.233.045.08.045.459-.204 1.161z"/></svg>
            Enquire on WhatsApp
          </a>
        </article>
      `;
    });

    productGridEl.innerHTML = gridHTML;

    // Attach product card listeners
    attachProductCardListeners();
  }

  function attachProductCardListeners() {
    // View Details
    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        ProductModal.open(id);
      });
    });

    // View Image
    document.querySelectorAll('.btn-view-image').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnContainer = e.target.closest('.btn-view-image');
        const id = btnContainer.getAttribute('data-id');
        const product = PRODUCTS.find(p => p.id === id);
        if (product) {
          Lightbox.open(product.images);
        }
      });
    });
  }

  function updateActiveIndicators() {
    const indicatorContainer = document.getElementById('active-filters-container');
    if (!indicatorContainer) return;

    let html = "";
    const hasFilters = activeFilters.categories.length > 0 ||
                       activeFilters.sizes.length > 0 ||
                       activeFilters.searchQuery;

    if (!hasFilters) {
      indicatorContainer.style.display = 'none';
      return;
    }

    indicatorContainer.style.display = 'block';
    html += '<div class="active-filters-list">';

    // Add category indicators
    activeFilters.categories.forEach(cat => {
      html += `<span class="filter-indicator">${cat} <button class="filter-remove-btn" data-filter-type="categories" data-filter-value="${cat}">×</button></span>`;
    });

    // Add size indicators
    activeFilters.sizes.forEach(size => {
      html += `<span class="filter-indicator">${size} <button class="filter-remove-btn" data-filter-type="sizes" data-filter-value="${size}">×</button></span>`;
    });

    html += '</div>';

    if (hasFilters) {
      html += '<button class="clear-all-btn" aria-label="Clear all filters">Clear All</button>';
    }

    indicatorContainer.innerHTML = html;

    // Reattach event listeners for new elements
    document.querySelectorAll('.clear-all-btn').forEach(btn => {
      btn.addEventListener('click', clearAllFilters);
    });
  }

  function removeFilter(filterType, filterValue) {
    if (filterType === "categories") {
      toggleFilterValue('categories', filterValue, false);
      syncControls('categories', filterValue, false);
    } else if (filterType === "sizes") {
      toggleFilterValue('sizes', filterValue, false);
      syncControls('sizes', filterValue, false);
    } else if (filterType === "prices") {
      toggleFilterValue('prices', filterValue, false);
      syncControls('prices', filterValue, false);
    }
    applyFilters();
  }

  function clearAllFilters() {
    activeFilters.searchQuery = "";
    activeFilters.categories = [];
    activeFilters.sizes = [];
    activeFilters.prices = [];
    activeFilters.kidGender = "both";
    activeFilters.sort = "featured";

    // Reset UI
    document.querySelectorAll('#search-input, #search-input-mobile').forEach(input => input.value = "");
    if (sortSelectEl) sortSelectEl.value = "featured";

    document.querySelectorAll('.category-filter-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.size-pill').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.price-pill').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.gender-filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.gender === 'both'));

    applyFilters();
    closeFilterDrawer();
  }

  function openFilterDrawer() {
    if (filterDrawerEl && filterBackdropEl) {
      filterDrawerEl.classList.add('active');
      filterBackdropEl.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeFilterDrawer() {
    if (filterDrawerEl && filterBackdropEl) {
      filterDrawerEl.classList.remove('active');
      filterBackdropEl.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  return {
    init,
    applyFilters,
    clearAllFilters
  };
})();
