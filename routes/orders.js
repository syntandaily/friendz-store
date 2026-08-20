const express = require('express');
const router = express.Router();
const { dbQuery } = require('../database/db');
const { verifyToken } = require('../middleware/auth');

// Helper to construct WhatsApp message and link
function generateWhatsAppLink(orderNumber, customer, items, totalAmount) {
  const whatsappNumber = '918778967955';
  const lines = items.map(item =>
    `• ${item.name} (${item.id}) × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
  );

  const message = [
    `Hello FRIENDZ, I would like to place an order.`,
    `Order Ref: #${orderNumber}`,
    '',
    'ORDER ITEMS:',
    ...lines,
    `Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`,
    '',
    'CUSTOMER DETAILS:',
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}`,
    `Landmark: ${customer.landmark || 'Not provided'}`,
    `Pincode: ${customer.pincode}`,
    `Delivery Note: ${customer.note || 'None'}`,
    '',
    'Please confirm availability, final total, and delivery details.'
  ].join('\n');

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// POST /api/orders - Create Order (Public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, landmark, pincode, note, items } = req.body;

    if (!name || !phone || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required customer details (name, phone, address, pincode).'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // Process items and calculate real total from DB or payload
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const productRow = await dbQuery.get('SELECT * FROM products WHERE id = ?', [item.id]);
      const price = productRow ? productRow.price : (item.price || 0);
      const productName = productRow ? productRow.name : (item.name || item.id);
      const quantity = Math.max(1, parseInt(item.quantity) || 1);

      totalAmount += price * quantity;
      validatedItems.push({
        id: item.id,
        name: productName,
        price,
        quantity,
        selectedSize: item.size || null,
        selectedColor: item.color || null
      });
    }

    // Generate Order Number: FR-ORD-<timestamp_last_5_digits>
    const orderNumber = `FR-ORD-${Date.now().toString().slice(-6)}`;

    // Insert Order into DB
    const orderResult = await dbQuery.run(
      `INSERT INTO orders (
        order_number, customer_name, customer_phone, address, landmark, pincode, delivery_note, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        name,
        phone,
        address,
        landmark || '',
        pincode,
        note || '',
        totalAmount,
        'Pending'
      ]
    );

    const orderId = orderResult.lastID;

    // Insert Order Items into DB
    for (const item of validatedItems) {
      await dbQuery.run(
        `INSERT INTO order_items (
          order_id, product_id, product_name, price, quantity, selected_size, selected_color
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id,
          item.name,
          item.price,
          item.quantity,
          item.selectedSize,
          item.selectedColor
        ]
      );
    }

    // Generate WhatsApp deep link
    const whatsappUrl = generateWhatsAppLink(
      orderNumber,
      { name, phone, address, landmark, pincode, note },
      validatedItems,
      totalAmount
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: {
        id: orderId,
        orderNumber,
        totalAmount,
        status: 'Pending',
        whatsappUrl
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to process order.' });
  }
});

// GET /api/orders - List Orders (Admin Only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await dbQuery.all('SELECT * FROM orders ORDER BY created_at DESC');

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await dbQuery.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        return { ...order, items };
      })
    );

    res.json({
      success: true,
      count: ordersWithItems.length,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:id - Get Single Order (Admin Only)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await dbQuery.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const items = await dbQuery.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    res.json({ success: true, order: { ...order, items } });
  } catch (error) {
    console.error('Error retrieving order details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
});

// PATCH /api/orders/:id/status - Update Order Status (Admin Only)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await dbQuery.get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await dbQuery.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    res.json({
      success: true,
      message: `Order status updated to "${status}".`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

module.exports = router;
