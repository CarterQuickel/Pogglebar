module.exports = (db) => {
  return new Promise((resolve, reject) => {
    // Create a simple per-user team/loadouts table. Each loadout column stores JSON text.
    db.run(`
      CREATE TABLE IF NOT EXISTS team (
        displayname TEXT PRIMARY KEY,
        selected_team TEXT,
        loadout_1 TEXT,
        loadout_2 TEXT,
        loadout_3 TEXT,
        loadout_4 TEXT
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};