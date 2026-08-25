/**
 * FRIENDZ Main JavaScript File
 * Coordinates global interactions: Header, Search, Mobile Drawer, Detail Modals, and Scroll Animations.
 */

// --- GLOBAL INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  HeaderManager.init();
  MobileMenu.init();
  SearchManager.init();
  CartManager.init();
  ScrollReveal.init();
  ProductModal.init();
  ImageFallbacks.init();
  
  // Set up Floating WhatsApp Tooltip delay check
  const waBtn = document.querySelector('.floating-whatsapp');
  if (waBtn) {
    // Show tooltip after 5 seconds
    setTimeout(() => {
      const tooltip = waBtn.querySelector('.whatsapp-tooltip');
      if (tooltip && !document.body.classList.contains('modal-open')) {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.transform = 'translateX(0)';
        
        // Hide it after 4 seconds
        setTimeout(() => {
          tooltip.style.opacity = '';
          tooltip.style.visibility = '';
          tooltip.style.transform = '';
        }, 5000);
      }
    }, 5000);
  }
});

// Replace missing catalogue photography with a deliberate branded placeholder.
const ImageFallbacks = (() => {
  function init() {
    const applyFallback = (image) => {
      if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
      const mobileSource = image.closest('picture')?.querySelector('source');
      if (mobileSource && image.dataset.desktopSrc) {
        mobileSource.remove();
        image.src = image.dataset.desktopSrc;
        return;
      }
      image.dataset.fallbackApplied = 'true';
      const container = image.closest('.hero-image-wrapper, .category-card, .product-image-container');
      if (!container) return;
      const fallback = document.createElement('span');
      fallback.className = 'image-fallback';
      fallback.textContent = image.alt || 'Friendz collection';
      image.hidden = true;
      container.prepend(fallback);
    };

    document.addEventListener('error', (event) => applyFallback(event.target), true);
    document.querySelectorAll('img').forEach(image => {
      if (image.complete && image.naturalWidth === 0) applyFallback(image);
    });
  }

  return { init };
})();

// --- STICKY HEADER MANAGER ---
const HeaderManager = (() => {
  function init() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Scroll Handler
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once in case page loads scrolled down
  }

  return { init };
})();

// --- MOBILE DRAWERS ---
const MobileMenu = (() => {
  let menuBtn, mobileDrawer, backdrop, closeBtn;

  function init() {
    menuBtn = document.querySelector('.menu-btn');
    mobileDrawer = document.querySelector('.mobile-drawer');
    backdrop = document.querySelector('.drawer-backdrop');
    closeBtn = document.querySelector('.drawer-close-btn');

    if (!mobileDrawer) return;

    if (menuBtn) menuBtn.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    
    // Close drawer on clicking mobile links
    const drawerLinks = document.querySelectorAll('.mobile-nav-link');
    drawerLinks.forEach(link => link.addEventListener('click', close));
  }

  function toggle() {
    const isOpen = mobileDrawer.classList.contains('open');
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function open() {
    if (menuBtn) menuBtn.classList.add('active');
    mobileDrawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function close() {
    if (menuBtn) menuBtn.classList.remove('active');
    mobileDrawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  return { init, open, close };
})();

// --- CROSS-PAGE SEARCH MANAGER ---
const SearchManager = (() => {
  let searchModal, searchInput, searchTrigger, closeBtn;

  function init() {
    searchModal = document.getElementById('search-modal');
    searchInput = document.getElementById('search-input-field');
    searchTrigger = document.querySelector('.search-trigger');
    closeBtn = document.getElementById('search-close');

    if (searchTrigger) {
      searchTrigger.addEventListener('click', open);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    // Keyboard handlers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal && searchModal.classList.contains('open')) {
        close();
      }
    });

    // Check for query parameters on load to trigger filtering (e.g. ?search=shirt)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
      // If we have a local search input on page, pre-populate it
      const pageSearchInput = document.getElementById('search-input');
      if (pageSearchInput) {
        pageSearchInput.value = searchParam;
        // Let filter engine know
        setTimeout(() => {
          pageSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }, 100);
      }
    }

    // Form Submit handling inside modal
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          // If on index or contact, redirect to Men page with query parameters
          // Men page is chosen as a default full collection explorer for searching
          const currentFile = window.location.pathname.split('/').pop();
          if (currentFile === '' || currentFile === 'index.html' || currentFile === 'contact.html') {
            window.location.href = `men.html?search=${encodeURIComponent(query)}`;
          } else {
            // Local page search input handling
            const pageSearchInput = document.getElementById('search-input');
            if (pageSearchInput) {
              pageSearchInput.value = query;
              pageSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            close();
          }
        }
      });
    }
  }

  function open() {
    if (!searchModal) return;
    searchModal.classList.add('open');
    document.body.classList.add('modal-open');
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 300);
  }

  function close() {
    if (!searchModal) return;
    searchModal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  return { init, open, close };
})();

// --- DYNAMIC PRODUCT MODAL HANDLER ---
const ProductModal = (() => {
  let modalEl, overlayEl, wrapperEl, closeEl;
  let activeProduct = null;
  let selectedSize = "";
  let selectedColor = "";

  function init() {
    // Generate Modal markup if missing
    if (document.getElementById('product-details-modal')) return;

    const html = `
      <div id="product-details-modal" class="product-modal" aria-hidden="true" role="dialog">
        <div class="product-modal-overlay"></div>
        <div class="product-modal-wrapper">
          <button class="product-modal-close-btn" aria-label="Close product details">&times;</button>
          
          <!-- Left Panel: Gallery -->
          <div class="modal-gallery-pane">
            <div class="modal-main-image-container">
              <!-- ADD IMG: MODAL MAIN IMAGE -->
              <img id="modal-main-img" src="" alt="Active product display">
            </div>
            <div class="modal-gallery-thumbs" id="modal-thumbs-container">
              <!-- Thumbnails populated dynamically -->
            </div>
          </div>

          <!-- Right Panel: Details -->
          <div class="modal-details-pane">
            <span class="modal-category" id="modal-p-category">Category</span>
            <h2 class="modal-title" id="modal-p-title">Product Name</h2>
            <div class="modal-price" id="modal-p-price">₹0.00</div>
            
            <p class="modal-description" id="modal-p-desc">Product detailed description.</p>
            
            <div class="modal-options">
              <!-- Colors Option -->
              <div id="modal-colors-group">
                <span class="option-group-title">Select Color</span>
                <div class="color-dot-wrapper" id="modal-colors-container"></div>
              </div>
              
              <!-- Sizes Option -->
              <div id="modal-sizes-group">
                <span class="option-group-title">Select Size</span>
                <div class="color-dot-wrapper" id="modal-sizes-container"></div>
              </div>
            </div>

            <div class="modal-spec-list">
              <div class="spec-item">
                <span class="spec-label">Material</span>
                <span class="spec-val" id="modal-p-material">100% Cotton</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Availability</span>
                <span class="spec-val" id="modal-p-status" style="color: #25d366;">In Stock</span>
              </div>
            </div>

            <a href="" target="_blank" rel="noopener noreferrer" class="modal-whatsapp-cta" id="modal-whatsapp-btn">
              <svg viewBox="0 0 24 24"><path d="M12.012 2.25c-5.378 0-9.755 4.378-9.755 9.756 0 1.72.448 3.396 1.298 4.873l-1.38 5.043 5.158-1.353a9.717 9.717 0 0 0 4.679 1.2c5.38 0 9.757-4.378 9.757-9.756 0-2.6-1.011-5.048-2.848-6.886A9.704 9.704 0 0 0 12.012 2.25zm5.727 13.82c-.249.702-1.246 1.282-1.721 1.373-.424.08-1.036.142-2.92-.64a10.66 10.66 0 0 1-4.577-4.045c-.86-1.15-1.503-2.483-1.503-3.865 0-1.564.819-2.33 1.111-2.632.247-.256.657-.384.992-.384.108 0 .205.005.289.01.25.013.418.03.6.413.227.476.776 1.895.842 2.03.067.137.112.298.023.477-.09.18-.135.29-.272.45-.136.16-.285.358-.407.48-.136.136-.278.285-.12.557.158.272.702 1.157 1.503 1.872.8 0 1.488.702 2.29.986c.214.076.34.023.465-.12.125-.143.533-.623.67-.84.135-.215.27-.182.453-.114.182.068 1.157.545 1.361.648.204.102.34.153.386.233.045.08.045.459-.204 1.161z"/></svg>
              Enquire on WhatsApp
            </a>
            <button type="button" class="btn-add-cart modal-add-cart" id="modal-add-cart"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>Add to Bag</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // Cache elements
    modalEl = document.getElementById('product-details-modal');
    overlayEl = modalEl.querySelector('.product-modal-overlay');
    wrapperEl = modalEl.querySelector('.product-modal-wrapper');
    closeEl = modalEl.querySelector('.product-modal-close-btn');

    // Close listeners
    closeEl.addEventListener('click', close);
    overlayEl.addEventListener('click', close);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl.classList.contains('open')) {
        close();
      }
    });
  }

  function open(productId) {
    activeProduct = PRODUCTS.find(p => p.id === productId);
    if (!activeProduct) return;

    // Reset selected attributes
    selectedSize = activeProduct.sizes[0] || "";
    selectedColor = activeProduct.colors[0] || "";

    // Set Text fields
    document.getElementById('modal-p-category').textContent = activeProduct.category;
    document.getElementById('modal-p-title').textContent = activeProduct.name;
    document.getElementById('modal-p-price').textContent = `₹${activeProduct.price.toLocaleString('en-IN')}`;
    document.getElementById('modal-p-desc').textContent = activeProduct.description;
    document.getElementById('modal-p-material').textContent = activeProduct.material;
    document.getElementById('modal-add-cart').dataset.id = activeProduct.id;

    // Set Main Image
    const mainImgEl = document.getElementById('modal-main-img');
    mainImgEl.src = activeProduct.images[0];
    mainImgEl.alt = activeProduct.name;

    // Render Thumbnails
    const thumbsContainer = document.getElementById('modal-thumbs-container');
    thumbsContainer.innerHTML = "";
    
    if (activeProduct.images.length > 1) {
      thumbsContainer.style.display = 'flex';
      activeProduct.images.forEach((imgSrc, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `modal-thumb ${idx === 0 ? 'active' : ''}`;
        thumbBtn.innerHTML = `
          <!-- ADD IMG: MODAL GALLERY THUMBNAIL ${idx} -->
          <img src="${imgSrc}" alt="${activeProduct.name} View ${idx + 1}">
        `;
        thumbBtn.addEventListener('click', () => {
          thumbsContainer.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
          thumbBtn.classList.add('active');
          mainImgEl.src = imgSrc;
        });
        thumbsContainer.appendChild(thumbBtn);
      });
    } else {
      thumbsContainer.style.display = 'none';
    }

    // Populate Colors
    const colorsContainer = document.getElementById('modal-colors-container');
    const colorsGroup = document.getElementById('modal-colors-group');
    colorsContainer.innerHTML = "";
    
    if (activeProduct.colors && activeProduct.colors.length > 0) {
      colorsGroup.style.display = 'block';
      activeProduct.colors.forEach(col => {
        const colBtn = document.createElement('button');
        colBtn.className = `color-option-btn ${col === selectedColor ? 'active' : ''}`;
        colBtn.textContent = col;
        colBtn.addEventListener('click', () => {
          colorsContainer.querySelectorAll('.color-option-btn').forEach(b => b.classList.remove('active'));
          colBtn.classList.add('active');
          selectedColor = col;
          updateWhatsAppCTA();
        });
        colorsContainer.appendChild(colBtn);
      });
    } else {
      colorsGroup.style.display = 'none';
    }

    // Populate Sizes
    const sizesContainer = document.getElementById('modal-sizes-container');
    const sizesGroup = document.getElementById('modal-sizes-group');
    sizesContainer.innerHTML = "";
    
    if (activeProduct.sizes && activeProduct.sizes.length > 0 && activeProduct.sizes[0] !== "Free Size") {
      sizesGroup.style.display = 'block';
      activeProduct.sizes.forEach(sz => {
        const szBtn = document.createElement('button');
        szBtn.className = `size-option-btn ${sz === selectedSize ? 'active' : ''}`;
        szBtn.textContent = sz;
        szBtn.addEventListener('click', () => {
          sizesContainer.querySelectorAll('.size-option-btn').forEach(b => b.classList.remove('active'));
          szBtn.classList.add('active');
          selectedSize = sz;
          updateWhatsAppCTA();
        });
        sizesContainer.appendChild(szBtn);
      });
    } else {
      sizesGroup.style.display = 'none';
    }

    // Update CTA link
    updateWhatsAppCTA();

    // Show Modal
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function close() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function updateWhatsAppCTA() {
    const ctaBtn = document.getElementById('modal-whatsapp-btn');
    if (ctaBtn && activeProduct) {
      ctaBtn.href = getWhatsAppLink(activeProduct, selectedSize, selectedColor);
    }
  }

  return { init, open, close };
})();

// --- ANIMATION SCROLL REVEALS ---
const ScrollReveal = (() => {
  function init() {
    // Add slide reveal properties to elements
    const elementsToReveal = document.querySelectorAll('.category-card, .product-card, .about-content, .about-image-wrapper, .store-info-panel, .store-image-panel');
    
    // Set initial layout transitions via CSS Inline if supported
    elementsToReveal.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px" // Trigger slightly before element enters view
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.unobserve(el); // Stop observing once revealed
        }
      });
    }, observerOptions);

    elementsToReveal.forEach(el => observer.observe(el));
  }

  return { init };
})();
