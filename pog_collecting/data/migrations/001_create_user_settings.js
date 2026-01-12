module.exports = (db) => {
  return new Promise((resolve, reject) => {
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
      )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};