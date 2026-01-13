module.exports = (db) => {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS market (
        
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};