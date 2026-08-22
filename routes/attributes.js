const express = require('express');
const router = express.Router();
const { dbQuery } = require('../database/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/attributes - Fetch all product attributes (grouped & list)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM product_attributes';
    const params = [];

    if (type) {
      sql += ' WHERE type = ?';
      params.push(type.toLowerCase());
    }

    sql += ' ORDER BY type ASC, name ASC';

    const rows = await dbQuery.all(sql, params);

    // Group attributes by type for easy frontend consumption
    const grouped = {
      gender: [],
      category: [],
      collection: [],
      size: [],
      color: [],
      material: []
    };

    rows.forEach(item => {
      if (grouped[item.type]) {
        grouped[item.type].push(item);
      } else {
        grouped[item.type] = [item];
      }
    });

    res.json({
      success: true,
      count: rows.length,
      attributes: rows,
      grouped
    });
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product attributes.' });
  }
});

// POST /api/attributes - Create a new dynamic attribute (Admin Only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!type || !name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Attribute type and name are required.' });
    }

    const cleanType = type.trim().toLowerCase();
    const cleanName = name.trim();

    // Check duplicate
    const existing = await dbQuery.get(
      'SELECT id FROM product_attributes WHERE type = ? AND LOWER(name) = LOWER(?)',
      [cleanType, cleanName]
    );

    if (existing) {
      return res.status(400).json({ success: false, message: `Attribute "${cleanName}" already exists under "${cleanType}".` });
    }

    const result = await dbQuery.run(
      'INSERT INTO product_attributes (type, name) VALUES (?, ?)',
      [cleanType, cleanName]
    );

    const created = await dbQuery.get('SELECT * FROM product_attributes WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Attribute created successfully.',
      attribute: created
    });
  } catch (error) {
    console.error('Error creating attribute:', error);
    res.status(500).json({ success: false, message: 'Failed to save attribute.' });
  }
});

// DELETE /api/attributes/:id - Delete attribute (Admin Only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbQuery.get('SELECT id FROM product_attributes WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Attribute item not found.' });
    }

    await dbQuery.run('DELETE FROM product_attributes WHERE id = ?', [id]);

    res.json({ success: true, message: 'Attribute deleted successfully.' });
  } catch (error) {
    console.error('Error deleting attribute:', error);
    res.status(500).json({ success: false, message: 'Failed to delete attribute.' });
  }
});

module.exports = router;
