module.exports = (db) => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS iaps (
        inventory_slots INTEGER,
        perks TEXT,
        equipment TEXT
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};