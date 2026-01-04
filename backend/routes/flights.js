const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all flights for a user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM flights WHERE user_id = ? ORDER BY flight_date DESC, created_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get a single flight
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const flightId = req.params.id;

  db.get(
    'SELECT * FROM flights WHERE id = ? AND user_id = ?',
    [flightId, userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      res.json(row);
    }
  );
});

// Create a new flight
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { flight_date, airline, route, flight_time, weather, turbulence, anxiety_level, triggers, notes } = req.body;

  if (!flight_date || !airline || !route || !flight_time || !turbulence || anxiety_level === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (anxiety_level < 1 || anxiety_level > 10) {
    return res.status(400).json({ error: 'Anxiety level must be between 1 and 10' });
  }

  const validTurbulence = ['none', 'light', 'moderate', 'severe'];
  if (!validTurbulence.includes(turbulence)) {
    return res.status(400).json({ error: 'Invalid turbulence level' });
  }

  db.run(
    `INSERT INTO flights (user_id, flight_date, airline, route, flight_time, weather, turbulence, anxiety_level, triggers, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, flight_date, airline, route, flight_time, weather, turbulence, anxiety_level, triggers, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ 
        message: 'Flight logged successfully',
        id: this.lastID
      });
    }
  );
});

// Update a flight
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const flightId = req.params.id;
  const { flight_date, airline, route, flight_time, weather, turbulence, anxiety_level, triggers, notes } = req.body;

  if (!flight_date || !airline || !route || !flight_time || !turbulence || anxiety_level === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (anxiety_level < 1 || anxiety_level > 10) {
    return res.status(400).json({ error: 'Anxiety level must be between 1 and 10' });
  }

  const validTurbulence = ['none', 'light', 'moderate', 'severe'];
  if (!validTurbulence.includes(turbulence)) {
    return res.status(400).json({ error: 'Invalid turbulence level' });
  }

  db.run(
    `UPDATE flights SET flight_date = ?, airline = ?, route = ?, flight_time = ?, weather = ?, 
     turbulence = ?, anxiety_level = ?, triggers = ?, notes = ?
     WHERE id = ? AND user_id = ?`,
    [flight_date, airline, route, flight_time, weather, turbulence, anxiety_level, triggers, notes, flightId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      res.json({ message: 'Flight updated successfully' });
    }
  );
});

// Delete a flight
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const flightId = req.params.id;

  db.run(
    'DELETE FROM flights WHERE id = ? AND user_id = ?',
    [flightId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      res.json({ message: 'Flight deleted successfully' });
    }
  );
});

// Get trends/analytics
router.get('/stats/trends', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM flights WHERE user_id = ? ORDER BY flight_date ASC',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const stats = {
        totalFlights: rows.length,
        averageAnxiety: 0,
        turbulenceDistribution: { none: 0, light: 0, moderate: 0, severe: 0 },
        anxietyTrend: [],
        commonTriggers: {}
      };

      if (rows.length === 0) {
        return res.json(stats);
      }

      let totalAnxiety = 0;
      rows.forEach(flight => {
        totalAnxiety += flight.anxiety_level;
        stats.turbulenceDistribution[flight.turbulence]++;
        stats.anxietyTrend.push({
          date: flight.flight_date,
          anxiety: flight.anxiety_level,
          turbulence: flight.turbulence
        });

        if (flight.triggers) {
          const triggers = flight.triggers.split(',').map(t => t.trim());
          triggers.forEach(trigger => {
            if (trigger) {
              stats.commonTriggers[trigger] = (stats.commonTriggers[trigger] || 0) + 1;
            }
          });
        }
      });

      stats.averageAnxiety = (totalAnxiety / rows.length).toFixed(1);

      res.json(stats);
    }
  );
});

module.exports = router;
