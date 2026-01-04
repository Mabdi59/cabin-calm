const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all education content
router.get('/', (req, res) => {
  const category = req.query.category;
  
  let query = 'SELECT * FROM education_content';
  let params = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY category, title';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get a single education article
router.get('/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM education_content WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(row);
  });
});

module.exports = router;
