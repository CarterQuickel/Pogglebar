module.exports = (db) => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS team (
        selected_team TEXT
        loadout_1 TEXT,
        loadout_2 TEXT,
        loadout_3 TEXT,
        loadout_4 TEXT
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};