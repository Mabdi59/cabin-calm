const express = require("express");
const db = require("../database");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET — All education content (optional category filter)
| Returns: id, title, category, summary (for preview cards)
|--------------------------------------------------------------------------
*/
router.get("/", (req, res) => {
  let category = req.query.category || "";

  // normalize values
  category = category.toString().trim().toLowerCase();

  let query = `
    SELECT MIN(id) AS id, title, category, summary
    FROM education_content
  `;

  const params = [];

  if (category && category !== "all") {
    query += " WHERE LOWER(category) = ?";
    params.push(category);
    query += " GROUP BY LOWER(title), LOWER(category)";
  } else {
    query += " GROUP BY LOWER(title), LOWER(category)";
  }

  query += " ORDER BY LOWER(category), LOWER(title)";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Education query failed:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows || []);
  });
});

/*
|--------------------------------------------------------------------------
| GET — Single education article
| Returns: full article with content and created_at
|--------------------------------------------------------------------------
*/
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  db.get(
    `
    SELECT id, title, category, summary, content, created_at
    FROM education_content
    WHERE id = ?
  `,
    [id],
    (err, row) => {
      if (err) {
        console.error("Education fetch failed:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ error: "Article not found" });
      }

      res.json(row);
    }
  );
});

module.exports = router;
