const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'cabincalm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    throw err;
  }
  console.log('Connected to CabinCalm database');
});

// Enable foreign keys enforcement
db.run('PRAGMA foreign_keys = ON;', (err) => {
  if (err) {
    console.error('Failed to enable foreign keys:', err);
  }
});

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

  // Flights table — UPDATED to match frontend fields
  db.run(`
    CREATE TABLE IF NOT EXISTS flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,

      flight_date DATE NOT NULL,
      airline TEXT NOT NULL,

      departure_airport TEXT NOT NULL,
      arrival_airport TEXT NOT NULL,

      flight_time TEXT NOT NULL,
      weather TEXT,

      seat_position TEXT,
      seat_location TEXT,

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
      summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Unique constraint to prevent duplicate articles
  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_article
    ON education_content (
      LOWER(title),
      LOWER(category)
    )
  `);

  // Performance indexes
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_flights_user_date
    ON flights(user_id, flight_date)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_flights_user
    ON flights(user_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_education_category
    ON education_content(LOWER(category))
  `);

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(LOWER(email))
  `);

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_education_title_category
    ON education_content(LOWER(title), LOWER(category))
  `);

  // Default education content
  const educationContent = [
    {
      title: 'Understanding Turbulence',
      category: 'turbulence',
      summary: 'Learn why turbulence happens and why it\'s completely safe.',
      content:
        'Turbulence is caused by irregular air movements in the atmosphere. While it can feel scary, modern aircraft are designed to withstand much more stress than turbulence creates. Think of it like driving over a bumpy road - uncomfortable but not dangerous.'
    },
    {
      title: 'Engine Sounds',
      category: 'sounds',
      summary: 'Why engine sounds change during different flight phases.',
      content:
        "Engine sounds change during different phases of flight. During takeoff, engines are at maximum power and louder. During cruise, they become quieter. Changes in engine noise are normal and part of the pilot's planned flight operations."
    },
    {
      title: 'Takeoff and Climb',
      category: 'phases',
      summary: 'What to expect during takeoff and initial climb.',
      content:
        "During takeoff you'll feel acceleration and hear loud engine noise. The nose of the aircraft tilts up and you may feel pressure changes. Pilots reduce engine power slightly after initial climb for noise reduction and fuel efficiency - this is normal."
    },
    {
      title: 'Descent and Landing',
      category: 'phases',
      summary: 'Normal sensations and sounds during landing approach.',
      content:
        "During descent you may hear engines get quieter and feel your ears pop. You'll also hear thumps as landing gear deploys and feel the aircraft slow as flaps extend. These are normal landing preparations."
    },
    {
      title: 'Wing Movements',
      category: 'sensations',
      summary: 'Why airplane wings flex and why that\'s a good thing.',
      content:
        'Aircraft wings are designed to flex - sometimes several feet. This flexibility helps absorb turbulence and improves safety. Seeing wings flex is completely normal.'
    },
    {
      title: 'Air Pockets',
      category: 'turbulence',
      summary: 'The truth about "air pockets" and sudden drops.',
      content:
        'What people call "air pockets" are simply rising or sinking air currents. The airplane does not drop - it rides through air like a boat rides over waves.'
    }
  ];

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO education_content (title, category, summary, content)
     VALUES (?, ?, ?, ?)`
  );

  educationContent.forEach(item => {
    stmt.run(item.title, item.category, item.summary, item.content);
  });

  stmt.finalize();
});

module.exports = db;
