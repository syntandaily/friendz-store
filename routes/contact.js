const express = require('express');
const router = express.Router();
const { dbQuery } = require('../database/db');
const { verifyToken } = require('../middleware/auth');

// POST /api/contact - Submit contact message (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    await dbQuery.run(
      'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone || '', message]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received.'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contact message.' });
  }
});

// GET /api/contact - List contact messages (Admin Only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const messages = await dbQuery.all('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact messages.' });
  }
});

// PATCH /api/contact/:id/status - Update Message Status (Admin Only)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    await dbQuery.run('UPDATE contact_messages SET status = ? WHERE id = ?', [status || 'Read', req.params.id]);
    res.json({ success: true, message: 'Message status updated.' });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ success: false, message: 'Failed to update message status.' });
  }
});

module.exports = router;
