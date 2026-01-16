#!/usr/bin/env node

// Database CLI - allows running init and migration functions from the command line

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { initDatabase } = require('./init');
const { runMigrations } = require('./migrations');

const DB_PATH = path.join(__dirname, '../pogipedia/db/pogs.db');

async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log(`
Database CLI

Commands:
  node data/db-cli.js init       - Initialize a fresh database with latest schema
  node data/db-cli.js migrate    - Run pending migrations on existing database
  node data/db-cli.js help       - Show this help message
    `);
    process.exit(0);
  }

  // Open database connection
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Failed to open database:', err);
      process.exit(1);
    }
  });

  try {
    switch (command.toLowerCase()) {
      case 'init':
        console.log(`Initializing database at path: ${DB_PATH}`);
        await initDatabase(db);
        console.log('✓ INITILIZATION COMPLETE');
        break;

      case 'migrate':
        console.log(`Running migrations on: ${DB_PATH}`);
        await runMigrations(db);
        console.log('✓ MIGRATIONS COMPLETE');
        break;

      case 'help':
        console.log(`
Database CLI

Commands:
    node db-cli.js init       - Initialize a fresh database with the newest table layout
    node db-cli.js migrate    - Update the database to the newest table layout
    node db-cli.js help       - Show this help message
        `);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Use "node db-cli.js help" for usage information');
        process.exit(1);
    }
  } catch (err) {
    console.error('Operation failed:', err);
    process.exit(1);
  } finally {
    // Close database connection
    db.close(() => {
      process.exit(0);
    });
  }
}

main();
