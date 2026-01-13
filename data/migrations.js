// Migration runner - applies incremental schema updates to existing databases
// For fresh databases, use init.js instead

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Track applied migrations in the database
function initMigrationsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Get list of applied migrations
function getAppliedMigrations(db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT name FROM migrations ORDER BY applied_at', (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => r.name));
    });
  });
}

// Run all pending migrations
async function runMigrations(db) {
  try {
    await initMigrationsTable(db);
    const applied = await getAppliedMigrations(db);
    const files = fs.readdirSync(MIGRATIONS_DIR).sort();

    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      if (applied.includes(file)) {
        console.log(`Already applied: ${file}`);
        continue;
      }

      console.log(`→ Running migration: ${file}`);
      const migration = require(path.join(MIGRATIONS_DIR, file));
      
      try {
        await migration(db);
        // Mark migration as applied
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO migrations (name) VALUES (?)', [file], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (err) {
        console.error(`Failed to get: ${file}`, err);
        throw err;
      }
    }
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}

module.exports = { runMigrations };