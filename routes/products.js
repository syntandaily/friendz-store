const express = require('express');
const router = express.Router();
const { dbQuery } = require('../database/db');
const { verifyToken } = require('../middleware/auth');

// Format product DB row into JavaScript object (parse JSON fields)
function formatProduct(row) {
  if (!row) return null;
  return {
    ...row,
    featured: Boolean(row.featured),
    newArrival: Boolean(row.newArrival),
    sizes: row.sizes ? JSON.parse(row.sizes) : [],
    colors: row.colors ? JSON.parse(row.colors) : [],
    images: row.images ? JSON.parse(row.images) : []
  };
}

// GET /api/products - List products with filters & search
router.get('/', async (req, res) => {
  try {
    const { gender, category, collection, kidGender, featured, newArrival, search } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (gender) {
      sql += ' AND gender = ?';
      params.push(gender.toLowerCase());
    }

    if (category) {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    if (collection) {
      sql += ' AND LOWER(collection) = LOWER(?)';
      params.push(collection);
    }

    if (kidGender) {
      sql += ' AND LOWER(kidGender) = LOWER(?)';
      params.push(kidGender);
    }

    if (featured !== undefined) {
      sql += ' AND featured = ?';
      params.push(featured === 'true' || featured === '1' ? 1 : 0);
    }

    if (newArrival !== undefined) {
      sql += ' AND newArrival = ?';
      params.push(newArrival === 'true' || newArrival === '1' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ? OR id LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await dbQuery.all(sql, params);
    const products = rows.map(formatProduct);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
});

// GET /api/products/:id - Single product
router.get('/:id', async (req, res) => {
  try {
    const row = await dbQuery.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product: formatProduct(row) });
  } catch (error) {
    console.error('Error fetching single product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
});

// POST /api/products - Create Product (Admin Only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      id, name, category, gender, kidGender, price,
      sizes, colors, material, description, images,
      featured, newArrival, collection, stock
    } = req.body;

    if (!id || !name || !price || !gender) {
      return res.status(400).json({ success: false, message: 'Missing required product fields (id, name, price, gender).' });
    }

    const existing = await dbQuery.get('SELECT id FROM products WHERE id = ?', [id]);
    if (existing) {
      return res.status(400).json({ success: false, message: `Product ID "${id}" already exists.` });
    }

    await dbQuery.run(
      `INSERT INTO products (
        id, name, category, gender, kidGender, price, sizes, colors, material, description, images, featured, newArrival, collection, stock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        category || '',
        gender.toLowerCase(),
        kidGender || null,
        parseFloat(price) || 0,
        JSON.stringify(Array.isArray(sizes) ? sizes : (sizes ? [sizes] : [])),
        JSON.stringify(Array.isArray(colors) ? colors : (colors ? [colors] : [])),
        material || '',
        description || '',
        JSON.stringify(Array.isArray(images) ? images : (images ? [images] : [])),
        featured ? 1 : 0,
        newArrival ? 1 : 0,
        collection || '',
        parseInt(stock) || 50
      ]
    );

    const created = await dbQuery.get('SELECT * FROM products WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: formatProduct(created)
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

// PUT /api/products/:id - Update Product (Admin Only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, category, gender, kidGender, price,
      sizes, colors, material, description, images,
      featured, newArrival, collection, stock
    } = req.body;

    const existing = await dbQuery.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await dbQuery.run(
      `UPDATE products SET
        name = ?, category = ?, gender = ?, kidGender = ?, price = ?,
        sizes = ?, colors = ?, material = ?, description = ?, images = ?,
        featured = ?, newArrival = ?, collection = ?, stock = ?
      WHERE id = ?`,
      [
        name,
        category || '',
        gender ? gender.toLowerCase() : '',
        kidGender || null,
        parseFloat(price) || 0,
        JSON.stringify(Array.isArray(sizes) ? sizes : []),
        JSON.stringify(Array.isArray(colors) ? colors : []),
        material || '',
        description || '',
        JSON.stringify(Array.isArray(images) ? images : []),
        featured ? 1 : 0,
        newArrival ? 1 : 0,
        collection || '',
        parseInt(stock) || 50,
        id
      ]
    );

    const updated = await dbQuery.get('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: formatProduct(updated)
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id - Delete Product (Admin Only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbQuery.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await dbQuery.run('DELETE FROM products WHERE id = ?', [id]);

    res.json({ success: true, message: `Product "${id}" deleted successfully.` });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

module.exports = router;
