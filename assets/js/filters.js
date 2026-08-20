/**
 * FRIENDZ Front-End Search and Filtering Engine
 * Handles client-side grid generation, categories toggling, size matching, sorting, and search.
 */

const FilterEngine = (() => {
  let originalProducts = [];
  let filteredProducts = [];
  let currentPageGender = "";

  const activeFilters = {
    searchQuery: ""
  };

  let productGridEl, noResultsEl;

  /**
   * Initializes the engine for a page
   * @param {string} gender The scope of the page ("men", "women", "kids", "footwear", "all")
   */
  function init(gender) {
    currentPageGender = gender;
    
    // Filter the initial array by page gender (if not "all")
    if (gender === "all") {
      originalProducts = [...PRODUCTS];
    } else {
      originalProducts = PRODUCTS.filter(p => p.gender === gender);
    }
    
    filteredProducts = [...originalProducts];

    // Cache common layout DOM elements
    productGridEl = document.getElementById('product-grid');
    resultsCountEl = document.getElementById('results-count');
    noResultsEl = document.getElementById('no-results');
    searchInputEl = document.getElementById('search-input');

    // Initial render
    apply();
  }

  /**
   * Applies the current filter state to products and renders them
   */
  function apply() {
    filteredProducts = originalProducts.filter(product => {
      if (activeFilters.searchQuery) {
        const term = activeFilters.searchQuery;
        const matchesName = product.name.toLowerCase().includes(term);
        const matchesDesc = product.description.toLowerCase().includes(term);
        const matchesId = product.id.toLowerCase().includes(term);
        const matchesMaterial = product.material.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc && !matchesId && !matchesMaterial) {
          return false;
        }
      }

      return true;
    });

    render();
  }

  /**
   * Outputs the products markup into the target grid container
   */
  function render() {
    if (!productGridEl) return;

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

      // Image placeholder code representation
      const imgPath = product.images[0];
      const imgAlt = product.name;

      gridHTML += `
        <!-- START PRODUCT CARD: ${product.id} -->
        <article class="product-card" data-id="${product.id}">
          <div class="product-image-container">
            <!-- ADD IMG: ${product.gender.toUpperCase()} PRODUCT ${product.id} IMAGE -->
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
        <!-- END PRODUCT CARD -->
      `;
    });

    productGridEl.innerHTML = gridHTML;

    // Attach details click events
    productGridEl.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        ProductModal.open(id);
      });
    });

    // Attach View Image click events
    productGridEl.querySelectorAll('.btn-view-image').forEach(btn => {
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

  return {
    init,
    apply
  };
})();
