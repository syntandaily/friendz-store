const CartManager = (() => {
  const storageKey = 'friendz-cart';
  const bagIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

  function getItems() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
  }

  function save(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
    updateCount();
  }

  function add(productId) {
    const items = getItems();
    const existing = items.find(item => item.id === productId);
    if (existing) existing.quantity += 1;
    else items.push({ id: productId, quantity: 1 });
    save(items);
  }

  function updateCount() {
    const count = getItems().reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = count; el.hidden = count === 0; });
  }

  function init() {
    const tools = document.querySelector('.right-nav-tools');
    if (tools && !tools.querySelector('.cart-link')) {
      const link = document.createElement('a');
      link.className = 'cart-link';
      link.href = 'checkout.html';
      link.setAttribute('aria-label', 'View shopping cart');
      link.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg><span class="sr-only">Cart</span><span class="cart-count" hidden>0</span>';
      tools.insertBefore(link, tools.querySelector('.menu-btn'));
    }
    document.addEventListener('click', event => {
      const button = event.target.closest('.btn-add-cart');
      if (!button) return;
      add(button.dataset.id);
      button.innerHTML = `${bagIcon} Added to Bag`;
      button.classList.add('added');
      setTimeout(() => { button.innerHTML = `${bagIcon} Add to Bag`; button.classList.remove('added'); }, 1200);
    });
    updateCount();
  }

  return { init, getItems, save, updateCount };
})();
