module.exports = (db) => {
  return new Promise((resolve, reject) => {
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
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};