/* Shared catalogue filter layout for Men, Kids and Footwear. */
const CatalogFilters = (() => {
  function controls(config, title) {
    const genderFilter = config.genders ? `
      <div class="filter-group"><span class="filter-title">Gender</span>
        <div class="filter-list gender-filter-list">
          ${config.genders.map(value => `<button type="button" class="gender-filter-btn${value === 'both' ? ' active' : ''}" data-gender="${value}">${value[0].toUpperCase() + value.slice(1)}</button>`).join('')}
        </div>
      </div>` : '';
    const categories = config.categories.map(value => `<label class="filter-item"><input type="checkbox" class="category-filter-checkbox" value="${value}">${value}</label>`).join('');
    const sizes = config.sizes.map(value => `<button type="button" class="size-pill" data-size="${value}">${value}</button>`).join('');
    return `
      <div class="filter-group"><label class="filter-title" for="search-input">Search ${title}</label><input id="search-input" type="search" placeholder="Search styles" autocomplete="off"></div>
      ${genderFilter}
      <div class="filter-group"><span class="filter-title">Category</span><div class="filter-list">${categories}</div></div>
      <div class="filter-group"><span class="filter-title">Size</span><div class="size-grid">${sizes}</div></div>
      <button type="button" class="clear-all-btn">Clear all</button>`;
  }

  function mount(pageType, title) {
    if (document.querySelector('.filters-sidebar')) return;
    const baseConfig = FilterConfig[pageType];
    // Use the actual available sizes, so every product size has a matching filter.
    const config = pageType === 'kids'
      ? { ...baseConfig, sizes: [...new Set(PRODUCTS.filter(product => product.gender === 'kids').flatMap(product => product.sizes || []))] }
      : baseConfig;
    const layout = document.querySelector('.catalog-layout');
    const catalog = layout?.querySelector('section');
    if (!config || !layout || !catalog) return;
    const sidebar = document.createElement('aside');
    sidebar.className = 'filters-sidebar';
    sidebar.setAttribute('aria-label', 'Product filters');
    sidebar.innerHTML = controls(config, title);
    layout.insertBefore(sidebar, catalog);

    const mobile = document.createElement('div');
    mobile.className = 'mobile-filter-controls';
    mobile.innerHTML = '<button type="button" id="mobile-filter-btn" class="mobile-control-btn">FILTERS</button>';
    layout.insertBefore(mobile, catalog);

    const backdrop = document.createElement('div');
    backdrop.id = 'filter-backdrop';
    backdrop.className = 'filter-backdrop';
    const drawer = document.createElement('aside');
    drawer.id = 'filter-drawer';
    drawer.className = 'filter-drawer';
    drawer.setAttribute('aria-label', 'Filter options');
    drawer.innerHTML = `<div class="filter-drawer-header"><h2>FILTERS</h2><button type="button" class="filter-drawer-close" aria-label="Close filters">×</button></div><div class="filter-drawer-content">${controls(config, title).replace('id="search-input"', 'id="search-input-mobile"')}</div><div class="filter-drawer-footer"><button type="button" class="apply-filters-btn">SHOW RESULTS</button></div>`;
    layout.append(backdrop, drawer);

    const header = document.createElement('div');
    header.className = 'catalog-header';
    header.innerHTML = '<div class="results-count" id="results-count">0 PRODUCTS</div><div class="sort-select-wrapper"><select id="sort-select" aria-label="Sort products"><option value="featured">Featured</option><option value="newest">Newest</option></select></div>';
    const grid = catalog.querySelector('#product-grid');
    if (grid) catalog.insertBefore(header, grid);
  }

  return { mount };
})();
