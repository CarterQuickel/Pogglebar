module.exports = (db) => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS iaps (
        tiers TEXT
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};