//const
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const fs = require('fs');
const csv = require('csv-parser');
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);
const digio = require('socket.io-client');
require('dotenv').config();

//debug
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
  
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
  
process.on('exit', (code) => {
    console.error('PROCESS EXITED WITH CODE:', code);
});

//modules
const achievements = require("./modules/backend_js/trophyList.js")
const crateRef = require("./modules/backend_js/crateRef.js")
const { initializeUserState, RARITY_COLORS } = require('./modules/backend_js/userState.js');
const { perks } = require('./modules/backend_js/tb_declar/perk_card.js');
app.get('/api/perks', (req, res) => {
  res.json({ perks });
  console.log("Perks API accessed");
});
const tiers = require("./modules/backend_js/tierList.js");

// API key for Formbar API access
const API_KEY = process.env.API_KEY;

// URL to take user to Formbar for authentication
const AUTH_URL = process.env.AUTH_URL; // ... or the address to the instance of fbjs you wish to connect to

//URL to take user back to after authentication
const THIS_URL = process.env.THIS_URL; // ... or whatever the address to your application is

const headers = [
    'id', 'name', 'color', 'code', 'number', 'code2',
    'description', 'type', 'rarity', 'creator'
];

const results = [];

fs.createReadStream('pogipedia/db/pogs.csv')
    .pipe(csv({ headers }))
    .on('data', (row) => {
        const { id, name, color, description, rarity, creator } = row;
        results.push({ id, name, color, description, rarity, creator });
    })
    .on('end', () => {
    });

const socket = digio(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

// socket events for digipog transfers
socket.on('connect', () => {
    console.log('Connected to Formbar socket server');
    // Send the transfer 
    socket.emit('transfer digipogs');
});

socket.on('connect_error',
    (err) => {
        //console.error('Connection error:', err);
    }
);

socket.on('transferResponse', (response) => {
    console.log('Transfer response:', response);
});

/* This creates session middleware with given options;
The 'secret' option is used to sign the session ID cookie.
The 'resave' option is used to force the session to be saved back to the session store, even if the session was never modified during the request.
The 'saveUninitialized' option is used to force a session that is not initialized to be saved to the store.*/
app.use(session({
    secret: 'youweremybrotheranakin',
    resave: false,
    saveUninitialized: false
}));
/* It is a good idea to use a Environment Variable or a .env file that is in the .gitignore file for your SECRET.
This will prevent it from getting out and allowing people to hack your cookies.*/

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    console.log("Authenticating...");
    if (req.session.user) {
        const tokenData = req.session.token;
        try {
            // Check if the token has expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenData.exp < currentTime) {
                throw new Error('Token has expired');
            }
            next();
        } catch (err) {
            res.redirect(`${AUTH_URL}/oauth?refreshToken=${tokenData.refreshToken}&redirectURL=${THIS_URL}`);
        }
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
}
// The following isAuthenticated function checks when the access token expires and promptly retrieves a new one using the user's refresh token.

//set
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use('/static', express.static('static'));
app.use(express.urlencoded({limit: '50mb', extended: true }));
app.use(express.json({limit: '50mb'}));

// user settings database (use repo-root `data` folder)
const { runMigrations } = require('./data/migrations');

const usdb = new sqlite3.Database('./data/usersettings.sqlite');

// Run migrations on startup
runMigrations(usdb).catch(err => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
});

// pog database
const pogs = new sqlite3.Database("pogipedia/db/pog.db", (err) => {
    if (err) {
        console.error("Error connecting to pog database:", err.message);
    } else {
        console.log("Connected to pog database.");
    }
});

let pogCount = 0;
//show many pogs there are
pogs.get(`SELECT COUNT(*) AS count FROM pogs`, (err, row) => {
    if (err) {
        console.error("Error counting pogs:", err.message);
    } else {
        console.log(`Pog database contains ${row.count} pogs.`);
        pogCount = row.count;
    }
});

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

// home page
app.get('/collection', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    const displayName = req.session.user.displayName || req.session.user.displayname || null;
    if (!displayName) {
        // fall back to session user if displayName missing
        return res.render('collection', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
    }

    // load latest user data from DB, parse JSON fields, and render
    usdb.get('SELECT * FROM userSettings WHERE displayname = ?', [displayName], (err, row) => {
        if (err) {
            console.error('Error loading user for collection:', err);
            return res.render('collection', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
        }
        if (!row) {
            // no saved DB row — use session
            return res.render('collection', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
        }

        // build userdata object from DB row safely
        const userdataFromDb = {
            fid: row.fid,
            displayName: row.displayname,
            theme: row.theme,
            score: row.score,
            inventory: (() => { try { return JSON.parse(row.inventory || '[]'); } catch(e){ return []; } })(),
            Isize: row.Isize,
            xp: row.xp,
            maxxp: row.maxxp,
            level: row.level,
            income: row.income,
            totalSold: row.totalSold,
            cratesOpened: row.cratesOpened,
            pogamount: (() => { try { return JSON.parse(row.pogamount || '[]'); } catch(e){ return []; } })(),
            achievements: (() => { try { return JSON.parse(row.achievements || '[]'); } catch(e){ return []; } })(),
            tiers: (() => { try { return JSON.parse(row.tiers || '[]'); } catch(e){ return []; } })(),
            mergeCount: row.mergeCount,
            highestCombo: row.highestCombo || row.comboHigh || 0,
            wish: row.wish,
            crates: (() => { try { return JSON.parse(row.crates || '[]'); } catch(e){ return []; } })(),
            pfp: row.pfp || "static/icons/pfp/defaultpfp.png"
        };

        // update session to match DB (so other routes match too)
        req.session.user = Object.assign(req.session.user || {}, userdataFromDb);

        return res.render('collection', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
    });
});

// login route
app.get('/', isAuthenticated, (req, res) => {
    try {
        function insertUser() {

            const displayName = req.session.user.displayName;

            const id = req.session.token.id;

            usdb.get(`SELECT uid FROM userSettings WHERE displayname = ?`, [displayName], [id], (err, row) => {
                if (err) {
                    return console.error("Error querying user:", err.message);
                }
                if (row) {
                    console.log(`User '${displayName}' already exists with uid ${row.uid} and fid ${id}`);
                    return;
                } else {
                    usdb.run(`INSERT INTO userSettings (fid, theme, score, inventory, Isize, xp, maxxp, level, income, totalSold, cratesOpened, pogamount, achievements, tiers, mergeCount, highestCombo, wish, crates, pfp, displayname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            id,
                            req.session.user.theme,
                            req.session.user.score,
                            JSON.stringify(req.session.user.inventory),
                            req.session.user.Isize,
                            req.session.user.xp,
                            req.session.user.maxxp,
                            req.session.user.level,
                            req.session.user.income,
                            req.session.user.totalSold,
                            req.session.user.cratesOpened,
                            JSON.stringify(req.session.user.pogamount),
                            JSON.stringify(req.session.user.achievements),
                            JSON.stringify(req.session.user.tiers),
                            req.session.user.mergeCount,
                            req.session.user.highestCombo,
                            req.session.user.wish,
                            JSON.stringify(req.session.user.crates),
                            req.session.user.pfp,
                            displayName
                        ],
                        function (err) {
                            if (err) {
                                return console.error("Error inserting user:", err.message);
                            }
                            console.log(`User '${displayName}' inserted with rowid ${this.lastID} and fid ${id}`);
                            console.log(req.session.user);
                        });
                }
            });
        }

        // add variable references here
        req.session.user = {
            fid: req.session.token?.id || 0,
            displayName: req.session.token?.displayName || "guest",
            theme: req.session.user.theme || 'dark',
            score: req.session.user.score || 0,
            inventory: req.session.user.inventory || [],
            Isize: req.session.user.Isize || 3,
            xp: req.session.user.xp || 0,
            maxxp: req.session.user.maxxp || 15,
            level: req.session.user.level || 1,
            income: req.session.user.income || 0,
            totalSold: req.session.user.totalSold || 0,
            cratesOpened: req.session.user.cratesOpened || 0,
            pogamount: req.session.user.pogamount || [],
            achievements: req.session.user.achievements || achievements,
            tiers: req.session.user.tiers || tiers,
            mergeCount: req.session.user.mergeCount || 0,
            highestCombo: req.session.user.highestCombo || 0,
            wish: req.session.user.wish || 0,
            crates: req.session.user.crates || crateRef,
            pfp: req.session.user.pfp || "static/icons/pfp/defaultpfp.png"
        };

        // load user data from database
        const displayName = req.session.token?.displayName || "guest";
        const id = req.session.token?.id || 0;
        usdb.get(`SELECT * FROM userSettings WHERE displayname = ?`, [displayName], [id], (err, row) => {
            if (err) {
                return console.error("Error querying user:", err.message);
            }
            if (row) {
                req.session.user = {
                    fid: id,
                    displayName: displayName,
                    theme: row.theme,
                    score: row.score,
                    inventory: JSON.parse(row.inventory),
                    Isize: row.Isize,
                    xp: row.xp,
                    maxxp: row.maxxp,
                    level: row.level,
                    income: row.income,
                    totalSold: row.totalSold,
                    cratesOpened: row.cratesOpened,
                    pogamount: JSON.parse(row.pogamount),
                    achievements: JSON.parse(row.achievements),
                    tiers: JSON.parse(row.tiers),
                    mergeCount: row.mergeCount,
                    highestCombo: row.comboHigh,
                    wish: row.wish,
                    crates: JSON.parse(row.crates),
                    pfp: row.pfp
                };
                console.log(`User data loaded for '${displayName}'`);
            } else {
                // all starting values are HERE
                req.session.user = {
                    fid: id,
                    displayName: displayName,
                    theme: 'dark',
                    score: 0,
                    inventory: [],
                    Isize: 10,
                    xp: 0,
                    maxxp: 30,
                    level: 1,
                    income: 0,
                    totalSold: 0,
                    cratesOpened: 0,
                    pogamount: [],
                    achievements: achievements,
                    tiers: tiers,
                    mergeCount: 0,
                    highestCombo: 0,
                    wish: 0,
                    crates: crateRef,
                    pfp: "static/icons/pfp/defaultpfp.png"
                };

                console.log(`No existing user data for '${displayName}', using defaults.`);
            }
            // Call insertUser and handle callback
            insertUser();
            res.render('collection.ejs', { userdata: req.session.user, token: req.session.token, maxPogs: pogCount, pogList: results });
        });
    } catch (error) {
        res.send(error.message)
    }
});

// patch notes page
app.get('/patch', (req, res) => {
    res.render('patch', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});

// trade room page
app.get('/chatroom', (req, res) => {
    res.render('chatroom', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});


//marketplace
app.get('/marketplace', (req, res) => {
    console.log('=== MARKETPLACE ROUTE DEBUG ===');
    console.log('req.session exists:', !!req.session);
    console.log('req.session.user exists:', !!req.session.user);
    console.log('req.session.user:', req.session.user);
    console.log('req.session.user.inventory:', req.session.user?.inventory);
    console.log('req.session.user.displayName:', req.session.user?.displayName);
    
    // Ensure we send the freshest userdata (including inventory) by loading from DB when possible
    const displayName = req.session.user && (req.session.user.displayName || req.session.user.displayname);
    console.log('displayName extracted:', displayName);
    
    if (!displayName) {
        console.log('No displayName found, rendering with session data only');
        console.log('Session userdata being sent:', req.session.user);
        return res.render('marketplace', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
    }

    console.log('Querying database for user:', displayName);
    usdb.get('SELECT * FROM userSettings WHERE displayname = ?', [displayName], (err, row) => {
        console.log('Database query result - err:', err);
        console.log('Database query result - row exists:', !!row);
        
        if (!err && row) {
            console.log('Database row inventory (raw):', row.inventory);
            try {
                const inv = JSON.parse(row.inventory || '[]');
                console.log('Parsed inventory from DB:', inv);
                console.log('Parsed inventory length:', inv.length);
                
                req.session.user = req.session.user || {};
                req.session.user.inventory = Array.isArray(inv) ? inv : [];
                console.log('Updated session inventory:', req.session.user.inventory);
            } catch (e) {
                console.log('Error parsing inventory from DB:', e);
                // leave session inventory as-is if parse fails
            }
        } else {
            console.log('No database row found or error occurred');
        }

        console.log('Final userdata being sent to template:', req.session.user);
        console.log('================================');
        return res.render('marketplace', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
    });
});



app.get('/achievements', (req, res) => {
    res.render('achievements', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});

app.get('/leaderboard', (req, res) => {
    usdb.all(
        'SELECT * FROM userSettings ORDER BY score DESC LIMIT 100', [],
        (err, rows) => {
            if (err) {
                console.error('DB select error:', err);
            }
            res.render('leaderboard', { userdata: req.session.user, maxPogs: pogCount, pogList: results, scores: rows });
        }
    );
});

app.get('/api/leaderboard', (req, res) => {
    usdb.all('SELECT displayname, score FROM userSettings ORDER BY score DESC LIMIT 100', [], (err, rows) => {
        if (err) {
            console.error('API leaderboard error', err);
            return res.status(500).json({ error: 'db' });
        }
        res.json(rows || []);
    });
});

// API endpoint to get recent trades
app.get('/api/trades/recent', (req, res) => {
    // Return only pending trade offers so completed/accepted ones don't reappear
    usdb.all('SELECT * FROM chat WHERE trade_type = ? AND trade_status = ? ORDER BY id DESC LIMIT 50', ['trade', 'pending'], (err, rows) => {
        if (err) {
            console.error('API trades error', err);
            return res.status(500).json({ error: 'db' });
        }
        res.json(rows || []);
    });
});

// Add this with your other API endpoints
app.get('/api/auctions/active', (req, res) => {
    usdb.all('SELECT * FROM market WHERE AuctionStatus = ? ORDER BY createdAt DESC LIMIT 50', ['active'], (err, rows) => {
        if (err) {
            console.error('API auctions error', err);
            return res.status(500).json({ error: 'db' });
        }
        res.json(rows || []);
    });
});


// save data route
app.post('/datasave', (req, res) => {
    const userSave = {
        theme: req.body.lightMode ? 'dark' : 'dark',
        score: req.body.money,
        inventory: req.body.inventory,
        Isize: req.body.Isize,
        xp: req.body.xp,
        maxxp: req.body.maxXP,
        level: req.body.level,
        income: req.body.income,
        totalSold: req.body.totalSold,
        cratesOpened: req.body.cratesOpened,
        pogamount: req.body.pogAmount,
        tiers: req.body.tiers,
        achievements: req.body.achievements,
        mergeCount: req.body.mergeCount,
        highestCombo: req.body.highestCombo,
        wish: req.body.wish,
        crates: req.body.crates,
        pfp: req.body.pfp
    }

    // save to session
    req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ message: 'Error saving session' });
        } else {
                const params = [
                req.session.user.fid,
                userSave.theme,
                userSave.score,
                JSON.stringify(userSave.inventory),
                userSave.Isize,
                userSave.xp,
                userSave.maxxp,
                userSave.level,
                userSave.income,
                userSave.totalSold,
                userSave.cratesOpened,
                JSON.stringify(userSave.pogamount),
                JSON.stringify(userSave.achievements),
                JSON.stringify(userSave.tiers),
                userSave.mergeCount,
                req.session.user.highestCombo,
                userSave.wish,
                JSON.stringify(userSave.crates),
                userSave.pfp,
                req.session.user.displayName
            ]
            usdb.run(`UPDATE userSettings SET fid = ?, theme = ?, score = ?, inventory = ?, Isize = ?, xp = ?, maxxp = ?, level = ?, income = ?, totalSold = ?, cratesOpened = ?, pogamount = ?, achievements = ?, tiers = ?, mergeCount = ?, highestCombo = ?, wish = ?, crates = ?, pfp = ? WHERE displayname = ?`, params, function (err) {
                if (err) {
                    console.error('Error updating user settings:', err);
                    return res.status(500).json({ message: 'Error updating user settings' });
                }
                req.session.user = { ...req.session.user, ...userSave };
                return res.json({ message: 'Data saved successfully' });
            });
        }
    });
});

// Express route to handle digipog transfer requests
// the URL for the post must be the same as the one in the fetch request
app.post('/api/digipogs/transfer', (req, res) => {
    // req.body gets the information sent from the client
    const cost = req.body.price;
    const payload = req.body;
    const reason = payload.reason;
    const pin = payload.pin;
    const id = req.session.user.fid; // Formbar user ID of payer from session
    
    // carter and vincent ids for testing respectively
    const isAdmin = id === 73 || id === 84 || id === 44 || id === 87;
    
    if (isAdmin) {
        // For admins, return success without processing actual transaction
        console.log('Admin transaction bypassed cost deduction.');
        return res.json({ success: true, message: 'Admin transaction (no cost)', amount: 0 });
    }
    
    console.log(cost, reason, pin, id);
    const paydesc = {
        from: id, // Formbar user ID of payer
        to: 30,    // Formbar user ID of payee (e.g., pog collecting's account)
        amount: cost,
        reason: reason,
        // security pin for the payer's account
        pin: pin,
        pool: true
    };
    // make a direct transfer request using fetch
    fetch(`${AUTH_URL}/api/digipogs/transfer`, {
        method: 'POST',
        // headers to specify json content
        headers: { 'Content-Type': 'application/json' },
        // stringify the paydesc object to send as JSON
        body: JSON.stringify(paydesc),
    }).then((transferResult) => {
        return transferResult.json();
    }).then((responseData) => {
        console.log("Transfer Response:", responseData);
        //res.JSON must be here to send the response back to the client
        res.json(responseData);
    }).catch(err => {
        console.error("Error during digipog transfer:", err);
        res.status(500).json({ message: 'Error during digipog transfer' });
    });
});

// API endpoints to persist user team/loadouts server-side
app.get('/api/user/team', (req, res) => {
    const displayName = req.session.user && (req.session.user.displayName || req.session.user.displayname);
    if (!displayName) return res.status(401).json({ error: 'not_authenticated' });

    usdb.get('SELECT selected_team, loadout_1, loadout_2, loadout_3, loadout_4 FROM team WHERE displayname = ?', [displayName], (err, row) => {
        if (err) return res.status(500).json({ error: 'db_error', detail: err.message });
        if (!row) {
            // return default empty shape
            return res.json({ selected: null, loadouts: [null, null, null, null] });
        }

        const parseOrNull = (txt) => {
            if (!txt) return null;
            try { return JSON.parse(txt); } catch (e) { return null; }
        };

        const loadouts = [parseOrNull(row.loadout_1), parseOrNull(row.loadout_2), parseOrNull(row.loadout_3), parseOrNull(row.loadout_4)];
        const selected = row.selected_team ? parseInt(row.selected_team, 10) : null;
        return res.json({ selected: isNaN(selected) ? null : selected, loadouts });
    });
});

// Save entire loadout array (array of 4 entries) and selected index
app.post('/api/user/team', express.json(), (req, res) => {
    const displayName = req.session.user && (req.session.user.displayName || req.session.user.displayname);
    if (!displayName) return res.status(401).json({ error: 'not_authenticated' });

    const body = req.body || {};
    const loadouts = Array.isArray(body.loadouts) ? body.loadouts : null;
    const selected = typeof body.selected === 'number' ? body.selected : (body.selected == null ? null : Number(body.selected));

    if (!loadouts || loadouts.length !== 4) return res.status(400).json({ error: 'invalid_loadouts' });

    // store each loadout as JSON text (or null)
    const vals = loadouts.map(l => l ? JSON.stringify(l) : null);
    const selectedTxt = (selected == null || isNaN(selected)) ? null : String(selected);

    usdb.run(
        `INSERT OR REPLACE INTO team (displayname, selected_team, loadout_1, loadout_2, loadout_3, loadout_4)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [displayName, selectedTxt, vals[0], vals[1], vals[2], vals[3]],
        function(err) {
            if (err) return res.status(500).json({ error: 'db_error', detail: err.message });
            return res.json({ ok: true });
        }
    );
});

// login page
app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = {
            displayName: tokenData.displayName,
            fid: tokenData.fid,
            theme: tokenData.theme || 'dark',
            score: tokenData.score || 0,
            inventory: tokenData.inventory || [],
            Isize: tokenData.Isize || 3,
            xp: tokenData.xp || 0,
            maxxp: tokenData.maxxp || 100,
            level: tokenData.level || 1,
            income: tokenData.income || 0,
            totalSold: tokenData.totalSold || 0,
            cratesOpened: tokenData.cratesOpened || 0,
            pogamount: tokenData.pogamount || [],
            achievements: tokenData.achievements || achievements,
            tiers: tokenData.tiers || tiers,
            mergeCount: tokenData.mergeCount || 0,
            highestCombo: tokenData.highestCombo || 0,
            wish: tokenData.wish || 0,
            crates: tokenData.crates || crateRef,
            pfp: tokenData.pfp || "static/icons/pfp/defaultpfp.png"
        };
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.post('/api/user/sync-inventory', express.json(), (req, res) => {
    const inventory = req.body && req.body.inventory ? req.body.inventory : null;
    const displayName = req.session.user && (req.session.user.displayName || req.session.user.displayname);
    if (!displayName || !Array.isArray(inventory)) {
        return res.status(400).json({ ok: false, message: 'Missing user or inventory' });
    }

    const invJson = JSON.stringify(inventory);
    usdb.run('UPDATE userSettings SET inventory = ? WHERE displayname = ?', [invJson, displayName], function(err) {
        if (err) {
            console.error('Failed to sync inventory to DB for', displayName, err);
            return res.status(500).json({ ok: false, error: err.message });
        }
        // update session object too
        req.session.user = req.session.user || {};
        req.session.user.inventory = inventory;
        // optionally update other derived session fields here
        return res.json({ ok: true, changes: this.changes });
    });
});

// API route to get user state
app.get('/api/user-state', (req, res) => {
  const displayName = req.session.user.displayName;
  usdb.get('SELECT * FROM userSettings WHERE displayname = ?', [displayName], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'User not found' });
    
    const userState = initializeUserState(row);
    res.json({ userState, rarityColors: RARITY_COLORS });
  });
});

// API to claim or update a single perk tier status
app.post('/api/perk-tiers/claim', express.json(), (req, res) => {
    console.log('POST /api/perk-tiers/claim called');
    if (!req.session || !req.session.user) {
        console.log('No session or user for claim');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const { tier: tierNum, status } = req.body || {};
    if (typeof tierNum === 'undefined' || !status) {
        console.log('Missing tier or status in body', req.body);
        return res.status(400).json({ error: 'Missing tier or status' });
    }

    // ensure session tiers exist
    req.session.user.tiers = Array.isArray(req.session.user.tiers) ? req.session.user.tiers : JSON.parse(JSON.stringify(tiers));

    const idx = req.session.user.tiers.findIndex(t => Number(t.tier) === Number(tierNum));
    if (idx === -1) return res.status(404).json({ error: 'Tier not found' });

    req.session.user.tiers[idx].status = status;

    // persist to DB
    const tiersJson = JSON.stringify(req.session.user.tiers);
    const displayName = req.session.user.displayName;
    console.log('Saving tiers for', displayName, req.session.user.tiers);
    usdb.run('UPDATE userSettings SET tiers = ? WHERE displayname = ?', [tiersJson, displayName], function(err) {
        if (err) {
            console.error('Error saving tiers for', displayName, err);
            // try to add the column if it doesn't exist, then retry once
            if (err.message && err.message.toLowerCase().includes('no such column')) {
                usdb.run("ALTER TABLE userSettings ADD COLUMN tiers TEXT DEFAULT '[]'", [], function(altErr) {
                    if (altErr) {
                        console.error('Failed to add tiers column:', altErr);
                        return res.status(500).json({ error: 'db' });
                    }
                    // retry update
                    usdb.run('UPDATE userSettings SET tiers = ? WHERE displayname = ?', [tiersJson, displayName], function(err2) {
                        if (err2) {
                            console.error('Error saving tiers after adding column for', displayName, err2);
                            return res.status(500).json({ error: 'db' });
                        }
                        // ensure session is saved before responding
                        req.session.save(saveErr => {
                            if (saveErr) console.error('Failed to save session after tiers update:', saveErr);
                            console.log('Tiers saved and session saved (after ALTER) for', displayName);
                            return res.json({ tiers: req.session.user.tiers });
                        });
                    });
                });
                return;
            }
            return res.status(500).json({ error: 'db' });
        }
        // ensure session is saved before responding
        req.session.save(saveErr => {
            if (saveErr) console.error('Failed to save session after tiers update:', saveErr);
            console.log('Tiers saved and session saved for', displayName);
            return res.json({ tiers: req.session.user.tiers });
        });
    });
});

// GET saved tiers (reads DB to confirm persisted data)
app.get('/api/perk-tiers', (req, res) => {
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    const displayName = req.session.user.displayName || req.session.user.displayname;
    const tiers = (req.session.user.tiers);
    console.log(req.session.user);
    if (!displayName) return res.status(400).json({ error: 'Missing displayName in session' });
    usdb.get('SELECT tiers FROM userSettings WHERE displayname = ?', [displayName], (err, row) => {
        if (err) {
            console.error('Error reading tiers from DB for', displayName, err);
            return res.status(500).json({ error: 'db' });
        }
        try {
            return res.json({ tiers });
        } catch (e) {
            console.error('Failed to parse tiers JSON from DB for', displayName, e);
            return res.json({ tiers: req.session.user.tiers || [] });
        }
    });
});

//listens
http.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});

//trade room stuff
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

// Add this helper function in your app.js
function completeAuction(auction, winnerId, winnerName, winnerPfp, finalBid) {
    // Update auction to completed
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

            // Broadcast completion to all clients
            io.emit('auction completed', completedAuction);
            console.log(`Auction completed: ${winnerName} won ${auction.pog} for $${finalBid}`);
        }
    );
}
