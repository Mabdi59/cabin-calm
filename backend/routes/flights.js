const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation constants
const validTurbulence = ["none", "light", "moderate", "severe"];
const isValidAnxiety = n => Number.isInteger(n) && n >= 1 && n <= 10;
const MAX_TRIGGERS_LENGTH = 2000;
const MAX_NOTES_LENGTH = 5000;

// Helper to validate date string
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

/*
|--------------------------------------------------------------------------
| GET — All flights
|--------------------------------------------------------------------------
*/
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `
    SELECT *
    FROM flights
    WHERE user_id = ?
    ORDER BY flight_date DESC, created_at DESC
  `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching flights:', err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows || []);
    }
  );
});

/*
|--------------------------------------------------------------------------
| GET — Single flight
|--------------------------------------------------------------------------
*/
router.get("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const flightId = req.params.id;

  db.get(
    `
    SELECT *
    FROM flights
    WHERE id = ? AND user_id = ?
  `,
    [flightId, userId],
    (err, row) => {
      if (err) {
        console.error('Error fetching flight:', err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!row) return res.status(404).json({ error: "Flight not found" });

      res.json(row);
    }
  );
});

/*
|--------------------------------------------------------------------------
| POST — Create flight
|--------------------------------------------------------------------------
*/
router.post("/", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const {
    flight_date,
    airline,
    departure_airport,
    arrival_airport,
    flight_time,
    weather,
    seat_position,
    seat_location,
    turbulence,
    anxiety_level,
    triggers,
    notes
  } = req.body;

  // Required fields validation
  if (
    !flight_date ||
    !airline ||
    !departure_airport ||
    !arrival_airport ||
    !flight_time ||
    !turbulence ||
    anxiety_level === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate date format
  if (!isValidDate(flight_date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  // Validate text fields are not empty
  if (!airline.trim() || !departure_airport.trim() || !arrival_airport.trim() || !flight_time.trim()) {
    return res.status(400).json({ error: "Required text fields cannot be empty" });
  }

  const anxiety = parseInt(anxiety_level);

  if (!isValidAnxiety(anxiety)) {
    return res
      .status(400)
      .json({ error: "Anxiety level must be between 1 and 10" });
  }

  if (!validTurbulence.includes(turbulence)) {
    return res.status(400).json({ error: "Invalid turbulence level" });
  }

  // Trim and validate triggers and notes length
  const trimmedTriggers = (triggers || "").trim();
  const trimmedNotes = (notes || "").trim();

  if (trimmedTriggers.length > MAX_TRIGGERS_LENGTH) {
    return res.status(400).json({ error: `Triggers cannot exceed ${MAX_TRIGGERS_LENGTH} characters` });
  }

  if (trimmedNotes.length > MAX_NOTES_LENGTH) {
    return res.status(400).json({ error: `Notes cannot exceed ${MAX_NOTES_LENGTH} characters` });
  }

  db.run(
    `
    INSERT INTO flights (
      user_id,
      flight_date,
      airline,
      departure_airport,
      arrival_airport,
      flight_time,
      weather,
      seat_position,
      seat_location,
      turbulence,
      anxiety_level,
      triggers,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      userId,
      flight_date,
      airline.trim(),
      departure_airport.trim(),
      arrival_airport.trim(),
      flight_time.trim(),
      weather ? weather.trim() : null,
      seat_position ? seat_position.trim() : null,
      seat_location ? seat_location.trim() : null,
      turbulence,
      anxiety,
      trimmedTriggers,
      trimmedNotes
    ],
    function (err) {
      if (err) {
        console.error('Error creating flight:', err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({
        message: "Flight logged successfully",
        id: this.lastID
      });
    }
  );
});

/*
|--------------------------------------------------------------------------
| PUT — Update flight
|--------------------------------------------------------------------------
*/
router.put("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const flightId = req.params.id;

  const {
    flight_date,
    airline,
    departure_airport,
    arrival_airport,
    flight_time,
    weather,
    seat_position,
    seat_location,
    turbulence,
    anxiety_level,
    triggers,
    notes
  } = req.body;

  // Required fields validation
  if (
    !flight_date ||
    !airline ||
    !departure_airport ||
    !arrival_airport ||
    !flight_time ||
    !turbulence ||
    anxiety_level === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate date format
  if (!isValidDate(flight_date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  // Validate text fields are not empty
  if (!airline.trim() || !departure_airport.trim() || !arrival_airport.trim() || !flight_time.trim()) {
    return res.status(400).json({ error: "Required text fields cannot be empty" });
  }

  const anxiety = parseInt(anxiety_level);

  if (!isValidAnxiety(anxiety)) {
    return res
      .status(400)
      .json({ error: "Anxiety level must be between 1 and 10" });
  }

  if (!validTurbulence.includes(turbulence)) {
    return res.status(400).json({ error: "Invalid turbulence level" });
  }

  // Trim and validate triggers and notes length
  const trimmedTriggers = (triggers || "").trim();
  const trimmedNotes = (notes || "").trim();

  if (trimmedTriggers.length > MAX_TRIGGERS_LENGTH) {
    return res.status(400).json({ error: `Triggers cannot exceed ${MAX_TRIGGERS_LENGTH} characters` });
  }

  if (trimmedNotes.length > MAX_NOTES_LENGTH) {
    return res.status(400).json({ error: `Notes cannot exceed ${MAX_NOTES_LENGTH} characters` });
  }

  db.run(
    `
    UPDATE flights
    SET flight_date = ?,
        airline = ?,
        departure_airport = ?,
        arrival_airport = ?,
        flight_time = ?,
        weather = ?,
        seat_position = ?,
        seat_location = ?,
        turbulence = ?,
        anxiety_level = ?,
        triggers = ?,
        notes = ?
    WHERE id = ? AND user_id = ?
  `,
    [
      flight_date,
      airline.trim(),
      departure_airport.trim(),
      arrival_airport.trim(),
      flight_time.trim(),
      weather ? weather.trim() : null,
      seat_position ? seat_position.trim() : null,
      seat_location ? seat_location.trim() : null,
      turbulence,
      anxiety,
      trimmedTriggers,
      trimmedNotes,
      flightId,
      userId
    ],
    function (err) {
      if (err) {
        console.error('Error updating flight:', err);
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0)
        return res.status(404).json({ error: "Flight not found" });

      res.json({ message: "Flight updated successfully" });
    }
  );
});

/*
|--------------------------------------------------------------------------
| DELETE — Remove flight
|--------------------------------------------------------------------------
*/
router.delete("/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const flightId = req.params.id;

  db.run(
    "DELETE FROM flights WHERE id = ? AND user_id = ?",
    [flightId, userId],
    function (err) {
      if (err) {
        console.error('Error deleting flight:', err);
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0)
        return res.status(404).json({ error: "Flight not found" });

      res.json({ message: "Flight deleted successfully" });
    }
  );
});

/*
|--------------------------------------------------------------------------
| GET — Stats / Trends
|--------------------------------------------------------------------------
*/
router.get("/stats/trends", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `
    SELECT *
    FROM flights
    WHERE user_id = ?
    ORDER BY flight_date ASC
  `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const stats = {
        totalFlights: rows.length,
        averageAnxiety: 0,
        turbulenceDistribution: {
          none: 0,
          light: 0,
          moderate: 0,
          severe: 0
        },
        anxietyTrend: [],
        commonTriggers: {}
      };

      if (!rows.length) return res.json(stats);

      let total = 0;

      rows.forEach(flight => {
        total += flight.anxiety_level;

        if (stats.turbulenceDistribution[flight.turbulence] !== undefined) {
          stats.turbulenceDistribution[flight.turbulence]++;
        }

        stats.anxietyTrend.push({
          date: flight.flight_date,
          anxiety: flight.anxiety_level,
          turbulence: flight.turbulence,
          from: flight.departure_airport,
          to: flight.arrival_airport
        });

        if (flight.triggers) {
          flight.triggers
            .split(",")
            .map(t => t.trim())
            .filter(Boolean)
            .forEach(t => {
              stats.commonTriggers[t] =
                (stats.commonTriggers[t] || 0) + 1;
            });
        }
      });

      stats.averageAnxiety = (total / rows.length).toFixed(1);

      res.json(stats);
    }
  );
});

module.exports = router;
