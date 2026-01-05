const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "cabincalm.db");
const db = new sqlite3.Database(dbPath);

console.log("\n🧹 Running VACUUM on database to optimize storage...\n");

db.run("VACUUM", (err) => {
  if (err) {
    console.error("❌ VACUUM failed:", err);
  } else {
    console.log("✨ VACUUM completed successfully!");
    console.log("📊 Database file has been optimized and defragmented.\n");
  }
  
  db.close();
});
