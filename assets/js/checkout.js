document.addEventListener('DOMContentLoaded', () => {
  const orderList = document.getElementById('order-items');
  const totalEl = document.getElementById('order-total');
  const emptyState = document.getElementById('cart-empty');
  const form = document.getElementById('checkout-form');

  function cartProducts() {
    return CartManager.getItems().map(item => ({ ...item, product: PRODUCTS.find(product => product.id === item.id) })).filter(item => item.product);
  }

  function render() {
    const items = cartProducts();
    orderList.innerHTML = items.map(({ product, quantity }) => `
      <li class="order-item">
        <div><strong>${product.name}</strong><span>${product.id} · ₹${product.price.toLocaleString('en-IN')}</span></div>
        <div class="quantity-controls"><button type="button" data-cart-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">−</button><b>${quantity}</b><button type="button" data-cart-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button><button type="button" data-cart-action="remove" data-id="${product.id}" class="remove-item">Remove</button></div>
      </li>`).join('');
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    emptyState.hidden = items.length > 0;
    form.querySelector('button[type="submit"]').disabled = items.length === 0;
  }

  orderList.addEventListener('click', event => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    let items = CartManager.getItems();
    const item = items.find(entry => entry.id === button.dataset.id);
    if (!item) return;
    if (button.dataset.cartAction === 'increase') item.quantity += 1;
    if (button.dataset.cartAction === 'decrease') item.quantity -= 1;
    if (button.dataset.cartAction === 'remove' || item.quantity < 1) items = items.filter(entry => entry.id !== button.dataset.id);
    CartManager.save(items);
    render();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const items = cartProducts();
    if (!items.length) return;

    const data = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Order...';

    const orderPayload = {
      name: data.get('name'),
      phone: data.get('phone'),
      address: data.get('address'),
      landmark: data.get('landmark') || '',
      pincode: data.get('pincode'),
      note: data.get('note') || '',
      items: items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const resData = await res.json();

      if (resData.success && resData.order && resData.order.whatsappUrl) {
        CartManager.save([]);
        window.open(resData.order.whatsappUrl, '_blank', 'noopener');
        location.reload();
        return;
      }
    } catch (e) {
      console.warn('Backend server unavailable, falling back to client WhatsApp order.', e);
    }

    // Fallback WhatsApp Link
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const lines = items.map(item => `• ${item.product.name} (${item.product.id}) × ${item.quantity} — ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`);
    const message = [
      'Hello FRIENDZ, I would like to place an order.', '', 'ORDER ITEMS:', ...lines,
      `Estimated total: ₹${total.toLocaleString('en-IN')}`, '', 'CUSTOMER DETAILS:',
      `Name: ${data.get('name')}`, `Phone: ${data.get('phone')}`, `Address: ${data.get('address')}`,
      `Landmark: ${data.get('landmark') || 'Not provided'}`, `Pincode: ${data.get('pincode')}`,
      `Delivery note: ${data.get('note') || 'None'}`, '', 'Please confirm availability, final total, and delivery details.'
    ].join('\n');
    CartManager.save([]);
    window.open(`https://wa.me/918778967955?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  CartManager.init();
  render();
});

