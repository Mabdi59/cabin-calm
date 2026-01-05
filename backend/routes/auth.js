const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  if (!/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' });
  }

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [normalizedEmail, hashedPassword, name],
      function(err) {
        if (err) {
          console.error('Registration error:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ id: this.lastID, email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
          message: 'User registered successfully', 
          token,
          user: { id: this.lastID, email: normalizedEmail, name }
        });
      }
    );
  } catch (error) {
    console.error('Registration server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], async (err, user) => {
    if (err) {
      console.error('Login database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ 
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (error) {
      console.error('Login server error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

module.exports = router;
