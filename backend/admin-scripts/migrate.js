const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "cabincalm.db");
const db = new sqlite3.Database(dbPath);

console.log("\n🚀 Running database migration...\n");

// helper — check if a column already exists
function columnExists(table, column) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table});`, (err, rows) => {
      if (err) return reject(err);

      const exists = rows.some(r => r.name === column);
      resolve(exists);
    });
  });
}

async function runMigration() {
  try {
    // DEPARTURE AIRPORT
    const hasDepartureAirport = await columnExists("flights", "departure_airport");

    if (!hasDepartureAirport) {
      console.log("➕ Adding departure_airport column...");
      await new Promise((resolve, reject) => {
        db.run(
          `ALTER TABLE flights ADD COLUMN departure_airport TEXT`,
          err => (err ? reject(err) : resolve())
        );
      });
      console.log("✓ departure_airport column added");
    } else {
      console.log("✔ departure_airport column already exists — skipped");
    }

    // ARRIVAL AIRPORT
    const hasArrivalAirport = await columnExists("flights", "arrival_airport");

    if (!hasArrivalAirport) {
      console.log("➕ Adding arrival_airport column...");
      await new Promise((resolve, reject) => {
        db.run(
          `ALTER TABLE flights ADD COLUMN arrival_airport TEXT`,
          err => (err ? reject(err) : resolve())
        );
      });
      console.log("✓ arrival_airport column added");
    } else {
      console.log("✔ arrival_airport column already exists — skipped");
    }

    // SEAT POSITION
    const hasSeatPosition = await columnExists("flights", "seat_position");

    if (!hasSeatPosition) {
      console.log("➕ Adding seat_position column...");
      await new Promise((resolve, reject) => {
        db.run(
          `ALTER TABLE flights ADD COLUMN seat_position TEXT`,
          err => (err ? reject(err) : resolve())
        );
      });
      console.log("✓ seat_position column added");
    } else {
      console.log("✔ seat_position column already exists — skipped");
    }

    // SEAT LOCATION
    const hasSeatLocation = await columnExists("flights", "seat_location");

    if (!hasSeatLocation) {
      console.log("➕ Adding seat_location column...");
      await new Promise((resolve, reject) => {
        db.run(
          `ALTER TABLE flights ADD COLUMN seat_location TEXT`,
          err => (err ? reject(err) : resolve())
        );
      });
      console.log("✓ seat_location column added");
    } else {
      console.log("✔ seat_location column already exists — skipped");
    }

    // Migrate data from route to departure/arrival if route column exists
    const hasRoute = await columnExists("flights", "route");
    if (hasRoute) {
      console.log("➕ Checking for route data to migrate...");
      await new Promise((resolve, reject) => {
        db.all(`SELECT id, route FROM flights WHERE route IS NOT NULL AND (departure_airport IS NULL OR arrival_airport IS NULL)`, (err, rows) => {
          if (err) return reject(err);
          
          if (rows.length === 0) {
            console.log("✔ No route data needs migration");
            return resolve();
          }

          console.log(`📦 Migrating ${rows.length} flight record(s)...`);
          
          const updates = rows.map(row => {
            return new Promise((res, rej) => {
              // Split route (e.g., "JFK → LAX" or "JFK - LAX")
              const parts = row.route.split(/\s*[→-]\s*/);
              if (parts.length === 2) {
                db.run(
                  `UPDATE flights SET departure_airport = ?, arrival_airport = ? WHERE id = ?`,
                  [parts[0].trim(), parts[1].trim(), row.id],
                  err => (err ? rej(err) : res())
                );
              } else {
                console.log(`⚠ Skipping flight ${row.id} - unexpected route format: ${row.route}`);
                res(); // Skip if format is unexpected
              }
            });
          });

          Promise.all(updates).then(() => resolve()).catch(reject);
        });
      });
      console.log("✓ Route data migration complete");
    }

    // EDUCATION SUMMARY
    const hasSummary = await columnExists("education_content", "summary");

    if (!hasSummary) {
      console.log("➕ Adding summary column to education_content...");
      await new Promise((resolve, reject) => {
        db.run(
          `ALTER TABLE education_content ADD COLUMN summary TEXT`,
          err => (err ? reject(err) : resolve())
        );
      });
      console.log("✓ summary column added");
    } else {
      console.log("✔ summary column already exists — skipped");
    }

    console.log("\n🎉 Migration complete! Database updated.");
    console.log("👉 You can now restart your server.\n");

  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
  } finally {
    db.close();
  }
}

runMigration();
