// Initialize database with the latest schema for all tables
// Used only for fresh database creation, bypassing migration history

const sqlite3 = require('sqlite3').verbose();

async function initDatabase(db) {
  try {
    // Create userSettings table with latest schema
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS userSettings (
          uid INTEGER PRIMARY KEY AUTOINCREMENT,
          fid INTEGER UNIQUE,
          theme TEXT,
          score INTEGER,
          inventory TEXT,
          Isize INTEGER,
          xp INTEGER,
          maxxp INTEGER,
          level INTEGER,
          income INTEGER,
          totalSold INTEGER,
          cratesOpened INTEGER,
          pogamount TEXT,
          achievements TEXT,
          mergeCount INTEGER,
          highestCombo INTEGER,
          wish INTEGER,
          crates TEXT,
          pfp TEXT,
          displayname TEXT UNIQUE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Create chat table with latest schema
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS chat (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trade_type TEXT DEFAULT 'trade',
          name TEXT,
          msg TEXT,
          time INTEGER,
          pfp TEXT,
          userId TEXT,
          giving_item_name TEXT,
          receiving_item_name TEXT,
          trade_status TEXT DEFAULT 'pending',
          accepter_name TEXT,
          accepter_userId TEXT
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✓ Database initialized with latest schema');
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
}

module.exports = { initDatabase };
