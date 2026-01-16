// In your migrations file or create a new one
const createAuctionTable = (db) => {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS market (
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        pfp TEXT,
        pog TEXT NOT NULL,
        startPrice INTEGER NOT NULL,
        maxAcceptedBid INTEGER NOT NULL,
        minBidIncrement INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        AuctionTime INTEGER NOT NULL,
        AuctionStatus TEXT DEFAULT 'active',
        winner_id INTEGER,
        winner_name TEXT,
        winner_pfp TEXT,
        winner_bid INTEGER,
        bid_history TEXT DEFAULT '[]',
        PRIMARY KEY (user_id, pog)
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
