const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const usdb = new sqlite3.Database('./data/usersettings.sqlite');
const { Server } = require('socket.io');
const app = express();
const http = require('http').createServer(app);
const io = new Server(http);

module.exports = function(io) {

    // Helper functions
    function completeAuction(auction, winnerId, winnerName, winnerPfp, finalBid) {
        usdb.run(`UPDATE market SET AuctionStatus = ?, winner_id = ?, winner_name = ?, winner_pfp = ?, winner_bid = ? 
                  WHERE user_id = ? AND pog = ?`,
            ['completed', winnerId, winnerName, winnerPfp, finalBid, auction.user_id, auction.pog],
            function(err) {
                if (err) {
                    console.error('Error completing auction:', err);
                    return;
                }

                const completedAuction = {
                    ...auction,
                    AuctionStatus: 'completed',
                    winner_id: winnerId,
                    winner_name: winnerName,
                    winner_pfp: winnerPfp,
                    winner_bid: finalBid
                };

                io.emit('auction completed', completedAuction);
                console.log(`Auction completed: ${winnerName} won ${auction.pog} for $${finalBid}`);
            }
        );
    }

    // Helper function to update user inventory
    function updateUserInventory(userId, newInventory, callback) {
        const inventoryJson = JSON.stringify(newInventory);
        usdb.run(`UPDATE userSettings SET inventory = ? WHERE displayname = ?`, 
            [inventoryJson, userId], function(err) {
                if (callback) callback(err, this.changes);
            });
    }
    
    // Helper function to get user inventory
    function getUserInventory(userId, callback) {
        usdb.get(`SELECT inventory FROM userSettings WHERE displayname = ?`, [userId], (err, row) => {
            if (err || !row) {
                callback(err || new Error('User not found'), null);
                return;
            }
            try {
                const inventory = JSON.parse(row.inventory || '[]');
                callback(null, inventory);
            } catch (parseErr) {
                callback(parseErr, null);
            }
        });
    }

    io.on('connection', (socket) => {
    // Send recent trade history to the connecting client (only pending offers)
    usdb.all('SELECT * FROM chat WHERE trade_type = ? AND trade_status = ? ORDER BY id DESC LIMIT 50', ['trade', 'pending'], (err, rows) => {
        if (!err && Array.isArray(rows)) {
            socket.emit('trade history', rows.reverse());
        }
    });

    //marketplace stuff
    // Add these inside your io.on('connection', (socket) => { ... }) section

// Handle auction errors
socket.on('auction error', (error) => {
    console.error('Auction error:', error);
});

// Send existing auctions to connecting client
usdb.all('SELECT * FROM market WHERE AuctionStatus = ? ORDER BY createdAt DESC LIMIT 50', ['active'], (err, rows) => {
    if (!err && Array.isArray(rows)) {
        socket.emit('auction history', rows);
    }
});

// Handle auction creation
socket.on('create auction', (data) => {
    const sellerId = data.sellerId;
    const sellerName = data.sellerName;
    const sellerPfp = data.sellerPfp;
    const pogName = data.pogName;
    const startPrice = data.startPrice;
    const maxAcceptedBid = data.maxAcceptedBid;
    const minBidIncrement = data.minBidIncrement;
    const auctionTime = data.auctionTime;
    const createdAt = Date.now();

    // Validate that user owns the pog
    getUserInventory(sellerId, (err, inventory) => {
        if (err) {
            socket.emit('auction error', { message: 'Could not verify inventory' });
            return;
        }

        const hasPog = inventory.some(item => item.name === pogName && item.rarity !== "Unique");
        if (!hasPog) {
            socket.emit('auction error', { message: 'You do not own this pog or it cannot be auctioned' });
            return;
        }

        // Create auction in database
        usdb.run(`INSERT INTO market (user_id, name, pfp, pog, startPrice, maxAcceptedBid, minBidIncrement, createdAt, AuctionTime, AuctionStatus) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [sellerId, sellerName, sellerPfp, pogName, startPrice, maxAcceptedBid, minBidIncrement, createdAt, auctionTime, 'active'],
            function(err) {
                if (err) {
                    console.error('Error creating auction:', err);
                    socket.emit('auction error', { message: 'Failed to create auction' });
                    return;
                }

                const newAuction = {
                    user_id: sellerId,
                    name: sellerName,
                    pfp: sellerPfp,
                    pog: pogName,
                    startPrice: startPrice,
                    maxAcceptedBid: maxAcceptedBid,
                    minBidIncrement: minBidIncrement,
                    createdAt: createdAt,
                    AuctionTime: auctionTime,
                    AuctionStatus: 'active',
                    winner_id: null,
                    winner_name: null,
                    winner_pfp: null,
                    winner_bid: null,
                    bid_history: '[]'
                };

                // Broadcast new auction to all clients
                io.emit('auction created', newAuction);
                console.log(`Auction created: ${sellerName} auctioning ${pogName}`);
            }
        );
    });
});

// Handle bid placement
socket.on('place bid', (data) => {
    const sellerId = data.sellerId;
    const pogName = data.pogName;
    const bidAmount = data.bidAmount;
    const bidderName = data.bidderName;
    const bidderPfp = data.bidderPfp;
    const bidderId = data.bidderId;

    // Get current auction
    usdb.get('SELECT * FROM market WHERE user_id = ? AND pog = ? AND AuctionStatus = ?', 
        [sellerId, pogName, 'active'], (err, auction) => {
            if (err || !auction) {
                socket.emit('bid error', { message: 'Auction not found or no longer active' });
                return;
            }

            // Check if auction has expired
            const endTime = auction.createdAt + (auction.AuctionTime * 60 * 1000);
            if (Date.now() > endTime) {
                socket.emit('bid error', { message: 'This auction has expired' });
                return;
            }

            // Validate bid amount
            const currentBid = auction.winner_bid || auction.startPrice;
            const minimumBid = currentBid + auction.minBidIncrement;
            
            if (bidAmount < minimumBid) {
                socket.emit('bid error', { message: `Bid must be at least $${minimumBid}` });
                return;
            }

            // Check if this is a "Buy It Now" bid
            if (bidAmount >= auction.maxAcceptedBid) {
                // Complete auction immediately
                completeAuction(auction, bidderId, bidderName, bidderPfp, auction.maxAcceptedBid);
                return;
            }

            // Update auction with new bid
            const bidHistory = JSON.parse(auction.bid_history || '[]');
            bidHistory.push({
                bidder: bidderName,
                amount: bidAmount,
                time: Date.now()
            });

            usdb.run(`UPDATE market SET winner_id = ?, winner_name = ?, winner_pfp = ?, winner_bid = ?, bid_history = ? 
                      WHERE user_id = ? AND pog = ?`,
                [bidderId, bidderName, bidderPfp, bidAmount, JSON.stringify(bidHistory), sellerId, pogName],
                function(err) {
                    if (err) {
                        console.error('Error updating bid:', err);
                        socket.emit('bid error', { message: 'Failed to place bid' });
                        return;
                    }

                    // Get updated auction and broadcast
                    usdb.get('SELECT * FROM market WHERE user_id = ? AND pog = ?', [sellerId, pogName], (err, updatedAuction) => {
                        if (!err && updatedAuction) {
                            io.emit('bid placed', updatedAuction);
                            console.log(`Bid placed: ${bidderName} bid $${bidAmount} on ${pogName}`);
                        }
                    });
                }
            );
        }
    );
});

// Handle "Buy It Now"
socket.on('buy it now', (data) => {
    const sellerId = data.sellerId;
    const pogName = data.pogName;
    const price = data.price;
    const buyerName = data.buyerName;
    const buyerPfp = data.buyerPfp;
    const buyerId = data.buyerId;

    // Get current auction
    usdb.get('SELECT * FROM market WHERE user_id = ? AND pog = ? AND AuctionStatus = ?', 
        [sellerId, pogName, 'active'], (err, auction) => {
            if (err || !auction) {
                socket.emit('buy error', { message: 'Auction not found or no longer active' });
                return;
            }

            // Check if auction has expired
            const endTime = auction.createdAt + (auction.AuctionTime * 60 * 1000);
            if (Date.now() > endTime) {
                socket.emit('buy error', { message: 'This auction has expired' });
                return;
            }

            // Verify price matches maxAcceptedBid
            if (price !== auction.maxAcceptedBid) {
                socket.emit('buy error', { message: 'Invalid buy it now price' });
                return;
            }

            // Complete auction
            completeAuction(auction, buyerId, buyerName, buyerPfp, price);
        }
    );
});


    // Handle new trade offers
    socket.on('trade offer', (data) => {
        const name = data && data.name ? String(data.name).slice(0, 100) : 'Anonymous';
        const pfp = data && data.pfp ? String(data.pfp) : null;
        const userId = data && data.userId ? String(data.userId).slice(0, 100) : null;
        const givingItem = data && data.giving_item_name ? String(data.giving_item_name).slice(0, 200) : '';
        const receivingItem = data && data.receiving_item_name ? String(data.receiving_item_name).slice(0, 200) : '';
        const message = data && data.message ? String(data.message).slice(0, 2000) : '';
        const time = Date.now();

        // Validate trade offer
        if (!givingItem || !receivingItem) {
            socket.emit('trade error', { message: 'Invalid trade offer' });
            return;
        }

        // Validate that user owns the item they're offering
        getUserInventory(userId, (err, inventory) => {
            if (err) {
                socket.emit('trade error', { message: 'Could not verify inventory' });
                return;
            }

            const hasItem = inventory.some(item => item.name === givingItem && item.rarity !== "Unique");
            if (!hasItem) {
                socket.emit('trade error', { message: 'You do not own this item or it cannot be traded' });
                return;
            }

            // Save trade to database
            usdb.run(`INSERT INTO chat (trade_type, name, msg, time, pfp, userId, giving_item_name, receiving_item_name, trade_status) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                ['trade', name, message, time, pfp, userId, givingItem, receivingItem, 'pending'], 
                function (err) {
                    if (err) {
                        console.error('Error saving trade offer:', err);
                        socket.emit('trade error', { message: 'Failed to save trade' });
                        return;
                    }
                    
                    const savedTrade = { 
                        id: this.lastID, 
                        trade_type: 'trade',
                        name, 
                        msg: message, 
                        time, 
                        pfp, 
                        userId,
                        giving_item_name: givingItem,
                        receiving_item_name: receivingItem,
                        trade_status: 'pending'
                    };
                    
                    // Broadcast trade to all clients
                    io.emit('trade offer', savedTrade);
                    console.log(`Trade posted: ${name} offering ${givingItem} for ${receivingItem}`);
                }
            );
        });
    });

    // Handle trade acceptance
    socket.on('accept trade', (data) => {
        const tradeId = data.tradeId;
        const accepterName = data.accepter_name;
        const accepterUserId = data.accepter_userId;
        
        // First, get the trade details
        usdb.get('SELECT * FROM chat WHERE id = ? AND trade_status = ?', [tradeId, 'pending'], (err, trade) => {
            if (err || !trade) {
                socket.emit('trade error', { message: 'Trade not found or already completed' });
                return;
            }

            // Validate that accepter has the requested item
            getUserInventory(accepterUserId, (err, accepterInventory) => {
                if (err) {
                    socket.emit('trade error', { message: 'Could not verify your inventory' });
                    return;
                }

                const hasRequestedItem = accepterInventory.some(item => 
                    item.name === trade.receiving_item_name && item.rarity !== "Unique"
                );

                if (!hasRequestedItem) {
                    socket.emit('trade error', { message: 'You do not own the requested item' });
                    return;
                }

                // Get trader's inventory
                getUserInventory(trade.userId, (err, traderInventory) => {
                    if (err) {
                        socket.emit('trade error', { message: 'Could not verify trader inventory' });
                        return;
                    }

                    // Validate trader still has the offered item
                    const traderHasItem = traderInventory.some(item => 
                        item.name === trade.giving_item_name && item.rarity !== "Unique"
                    );

                    if (!traderHasItem) {
                        socket.emit('trade error', { message: 'Trader no longer has the offered item' });
                        return;
                    }

                    // Perform the trade - update inventories
                    // Remove offered item from trader, add requested item to trader
                    const traderItemIndex = traderInventory.findIndex(item => item.name === trade.giving_item_name);
                    const offeredItem = traderInventory[traderItemIndex];
                    traderInventory.splice(traderItemIndex, 1);

                    const accepterItemIndex = accepterInventory.findIndex(item => item.name === trade.receiving_item_name);
                    const requestedItem = accepterInventory[accepterItemIndex];
                    traderInventory.push(requestedItem);

                    // Remove requested item from accepter, add offered item to accepter
                    accepterInventory.splice(accepterItemIndex, 1);
                    accepterInventory.push(offeredItem);

                    // Update both inventories in database
                    updateUserInventory(trade.userId, traderInventory, (err) => {
                        if (err) {
                            socket.emit('trade error', { message: 'Failed to update trader inventory' });
                            return;
                        }

                        updateUserInventory(accepterUserId, accepterInventory, (err) => {
                            if (err) {
                                socket.emit('trade error', { message: 'Failed to update accepter inventory' });
                                return;
                            }

                            // Update trade status to completed
                            usdb.run(`UPDATE chat SET trade_status = ?, accepter_name = ?, accepter_userId = ? WHERE id = ?`,
                                ['completed', accepterName, accepterUserId, tradeId], (err) => {
                                    if (err) {
                                        console.error('Error updating trade status:', err);
                                        socket.emit('trade error', { message: 'Failed to complete trade' });
                                        return;
                                    }

                                    // build payload with updated inventories so clients can update without refetch
                                    const payload = {
                                        tradeId,
                                        traderUserId: trade.userId,
                                        accepterUserId,
                                        giving_item_name: trade.giving_item_name,
                                        receiving_item_name: trade.receiving_item_name,
                                        updatedTraderInventory: traderInventory,
                                        updatedAccepterInventory: accepterInventory
                                    };

                                    // Notify all clients (clients will apply update only if it matches their user)
                                    io.emit('trade completed', payload);
                                    
                                    // Notify the accepter socket with their updated inventory (ack)
                                    socket.emit('trade accepted', { 
                                        success: true, 
                                        message: 'Trade completed successfully!',
                                        received_item: trade.giving_item_name,
                                        updatedInventory: accepterInventory
                                    });

                                    console.log(`Trade ${tradeId} completed: ${accepterName} accepted ${trade.name}'s trade`);
                                    console.log(`${trade.name} gave ${trade.giving_item_name}, received ${trade.receiving_item_name}`);
                                    console.log(`${accepterName} gave ${trade.receiving_item_name}, received ${trade.giving_item_name}`);
                                });
                        });
                    });
                });
            });
        });
    });
});
};