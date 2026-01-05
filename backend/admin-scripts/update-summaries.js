const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "cabincalm.db");
const db = new sqlite3.Database(dbPath);

console.log("\n📝 Updating education article summaries...\n");

const summaries = {
  'understanding turbulence': 'Learn why turbulence happens and why it\'s completely safe.',
  'engine sounds': 'Why engine sounds change during different flight phases.',
  'takeoff and climb': 'What to expect during takeoff and initial climb.',
  'descent and landing': 'Normal sensations and sounds during landing approach.',
  'wing movements': 'Why airplane wings flex and why that\'s a good thing.',
  'air pockets': 'The truth about "air pockets" and sudden drops.'
};

db.serialize(() => {
  let updated = 0;
  const keys = Object.keys(summaries);
  
  keys.forEach((title, index) => {
    db.run(
      `UPDATE education_content 
       SET summary = ? 
       WHERE LOWER(title) = ? AND summary IS NULL`,
      [summaries[title], title],
      function (err) {
        if (err) {
          console.error(`❌ Error updating "${title}":`, err);
        } else if (this.changes > 0) {
          console.log(`✓ Updated: ${title}`);
          updated += this.changes;
        }

        if (index === keys.length - 1) {
          console.log(`\n✨ Updated ${updated} article(s) with summaries`);
          db.close();
        }
      }
    );
  });
});
