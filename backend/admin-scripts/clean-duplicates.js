const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "cabincalm.db");
const db = new sqlite3.Database(dbPath);

console.log("\n🧹 Cleaning duplicate education articles...\n");

db.serialize(() => {
  // First, check how many duplicates exist
  db.get(
    `
    SELECT 
      COUNT(*) as total,
      COUNT(*) - COUNT(DISTINCT LOWER(title) || '|' || LOWER(category)) as duplicates
    FROM education_content
  `,
    (err, row) => {
      if (err) {
        console.error("❌ Error checking duplicates:", err);
        db.close();
        return;
      }

      console.log(`📊 Total articles: ${row.total}`);
      console.log(`📊 Duplicate articles: ${row.duplicates}`);

      if (row.duplicates === 0) {
        console.log("\n✨ No duplicates found. Database is clean!");
        db.close();
        return;
      }

      // Delete duplicates, keeping the one with the lowest ID
      db.run(
        `
        DELETE FROM education_content
        WHERE id NOT IN (
          SELECT MIN(id)
          FROM education_content
          GROUP BY LOWER(title), LOWER(category)
        )
      `,
        function (err) {
          if (err) {
            console.error("\n❌ Error deleting duplicates:", err);
          } else {
            console.log(`\n✓ Deleted ${this.changes} duplicate article(s)`);
            console.log("✨ Database cleaned successfully!");
          }

          db.close();
        }
      );
    }
  );
});
