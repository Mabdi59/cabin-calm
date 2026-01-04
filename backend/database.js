const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'cabincalm.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Flights table
  db.run(`
    CREATE TABLE IF NOT EXISTS flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      flight_date DATE NOT NULL,
      airline TEXT NOT NULL,
      route TEXT NOT NULL,
      flight_time TEXT NOT NULL,
      weather TEXT,
      turbulence TEXT NOT NULL,
      anxiety_level INTEGER NOT NULL,
      triggers TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Education content table
  db.run(`
    CREATE TABLE IF NOT EXISTS education_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default education content
  const educationContent = [
    {
      title: 'Understanding Turbulence',
      category: 'turbulence',
      content: 'Turbulence is caused by irregular air movements in the atmosphere. While it can feel scary, modern aircraft are designed to withstand much more stress than turbulence creates. Think of it like driving over a bumpy road - uncomfortable but not dangerous.'
    },
    {
      title: 'Engine Sounds',
      category: 'sounds',
      content: 'Engine sounds change during different phases of flight. During takeoff, engines are at maximum power and louder. During cruise, they become quieter. Changes in engine noise are normal and part of the pilot\'s flight plan.'
    },
    {
      title: 'Takeoff and Climb',
      category: 'phases',
      content: 'During takeoff, you\'ll feel acceleration and hear loud engine noise. The nose of the aircraft tilts up, and you may feel pressure changes. This is all normal. Pilots reduce engine power slightly after initial climb for noise reduction and fuel efficiency.'
    },
    {
      title: 'Descent and Landing',
      category: 'phases',
      content: 'During descent, you may hear the engines quiet down and feel your ears pop. You\'ll also hear thumps as landing gear deploys and feel the aircraft slow as flaps extend. These are all normal landing preparations.'
    },
    {
      title: 'Wing Movements',
      category: 'sensations',
      content: 'Aircraft wings are designed to flex - they can move up and down several feet! This flexibility helps absorb turbulence and makes the aircraft safer. Seeing wings flex is completely normal and expected.'
    },
    {
      title: 'Air Pockets',
      category: 'turbulence',
      content: 'There\'s no such thing as an "air pocket." What people call air pockets are simply areas of rising or sinking air (updrafts and downdrafts). The aircraft doesn\'t "drop" - it rides through these air currents like a boat on waves.'
    }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO education_content (title, category, content) VALUES (?, ?, ?)');
  educationContent.forEach(item => {
    stmt.run(item.title, item.category, item.content);
  });
  stmt.finalize();
});

module.exports = db;
