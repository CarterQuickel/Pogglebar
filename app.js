//const
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);
const digio = require('socket.io-client');
require('dotenv').config();
const cookieParser = require('cookie-parser');

// Ensure `fetch` is available in older Node versions (fallback to node-fetch)
if (typeof fetch === 'undefined') {
    try {
        // node-fetch v2 supports CommonJS require
        // If node-fetch isn't installed, this will throw and we'll warn instead
        global.fetch = require('node-fetch');
    } catch (e) {
        console.warn('Global fetch not available and node-fetch is not installed; remote requests may fail.');
    }
}

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
const achievements = require("./modules/backend_js/trophyList.js");
const crateRef = require("./modules/backend_js/crateRef.js");
const { initializeUserState, RARITY_COLORS } = require('./modules/backend_js/userState.js');
const { validateSave } = require('./backend_data/validate_save.js');
const { perks } = require('./modules/backend_js/tb_declar/perk_card.js');
require('./backend_data/marketplace/trading_socket')(io);
// banned list helper (used to print/inspect banned users)
const bannedListModule = require('./modules/backend_js/tb_declar/banned_list.js');
app.get('/api/perks', (req, res) => {
    res.json({ perks });
    console.log("Perks API accessed");
});
const tiers = require("./modules/backend_js/tierList.js");
const { getPogCount, getAllPogs, initializePogDatabase } = require('./backend_data/pog_ref.js');
let pogCount = 0;
let results = [];

async function initApp() {
  try {
    results = await getAllPogs();
    pogCount = await getPogCount();
    console.log(results);
    console.log('Pog CSV count:', results.length);
    console.log('DB pog count:', pogCount);
  } catch (err) {
    console.error("Error initializing app:", err);
    process.exit(1);
  }
}

initApp();
/* This creates session middleware with given options;
The 'secret' option is used to sign the session ID cookie.
The 'resave' option is used to force the session to be saved back to the session store, even if the session was never modified during the request.
The 'saveUninitialized' option is used to force a session that is not initialized to be saved to the store.*/
app.use(session({
    secret: 'youweremybrotheranakin',
    resave: false,
    saveUninitialized: false
}));
app.use((req, res, next) => {
    next();
});

// Body parsers and cookie parser must be registered before route handlers so
// POST handlers (like /login/confirm) can read req.body. They were previously
// registered after routers which caused missing req.body on form posts.
app.use(express.urlencoded({limit: '50mb', extended: true }));
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());

//routes
const marketplaceRouter = require('./routes/marketplace_rt.js');
app.use('/', marketplaceRouter);
const collectionRouter = require('./routes/collection_rt.js');
app.use('/', collectionRouter);
const authRouter = require('./routes/authenticate_rt.js');
app.use('/', authRouter);
const loginRouter = require('./routes/login_rt.js');
app.use('/', loginRouter);

// API key for Formbar API access
const API_KEY = process.env.API_KEY;

// URL to take user to Formbar for authentication
const AUTH_URL = process.env.AUTH_URL; // ... or the address to the instance of fbjs you wish to connect to

//URL to take user back to after authentication
const THIS_URL = process.env.THIS_URL; // ... or whatever the address to your application is

const socket = digio(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

// Map of fid (string) -> Set of socket ids for connected clients
const userSockets = new Map();

// Attach server-side socket.io handlers for identifying clients
io.on('connection', (socket) => {
    // when client identifies, store mapping
    socket.on('identify', (data) => {
        try {
            const fid = data && (data.fid || data.FID || data.fid === 0 ? data.fid : null);
            if (fid == null) return;
            const key = String(fid);
            let set = userSockets.get(key);
            if (!set) { set = new Set(); userSockets.set(key, set); }
            set.add(socket.id);
            socket._identifiedFid = key;
        } catch (e) {
            // ignore
        }
    });

    socket.on('disconnect', () => {
        try {
            const key = socket._identifiedFid;
            if (!key) return;
            const set = userSockets.get(key);
            if (!set) return;
            set.delete(socket.id);
            if (set.size === 0) userSockets.delete(key);
        } catch (e) {}
    });
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

/* It is a good idea to use a Environment Variable or a .env file that is in the .gitignore file for your SECRET.
This will prevent it from getting out and allowing people to hack your cookies.*/

//set
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use('/static', express.static('static'));

app.use((req, res, next) => {
    try {
        const banned = bannedListModule && typeof bannedListModule.getBannedList === 'function'
            ? bannedListModule.getBannedList()
            : [];
        const fid = req.session && req.session.user && (req.session.user.fid || req.session.user.FID) ? Number(req.session.user.fid || req.session.user.FID) : null;
        const isBanned = fid != null && banned.some(b => (b && b.fid && Number(b.fid) === fid) || (typeof b === 'number' && b === fid));
        // attach to session and locals for templates and client scripts
        if (!req.session.user) req.session.user = req.session.user || {};
        req.session.user.isBanned = !!isBanned;
        res.locals.userBanned = !!isBanned;
    } catch (e) {
        console.error('Failed to evaluate banned status for session user:', e);
    }
    next();
});

// user settings database (use repo-root `data` folder)
const { runMigrations } = require('./data/migrations.js');

const usdb = new sqlite3.Database('./data/usersettings.sqlite');
// reduce SQLITE_BUSY errors under concurrent access by setting a busy timeout
try {
    if (typeof usdb.configure === 'function') {
        usdb.configure('busyTimeout', 10000);
    }
    // Enable WAL journal mode to reduce writer/reader contention
    usdb.run('PRAGMA journal_mode = WAL');
    usdb.run('PRAGMA synchronous = NORMAL');
} catch (e) {
    console.warn('Failed to set sqlite pragmas/busyTimeout:', e);
}

// Helper utilities: lightweight retry wrappers to handle transient SQLITE_BUSY errors
function runWithRetries(db, sql, params, attempts, cb) {
    let tries = 0;
    function once() {
        db.run(sql, params, function(err) {
            if (err && err.code === 'SQLITE_BUSY' && tries < attempts) {
                tries++;
                return setTimeout(once, 150);
            }
            return cb(err, this);
        });
    }
    once();
}

function getWithRetries(db, sql, params, attempts, cb) {
    let tries = 0;
    function once() {
        db.get(sql, params, function(err, row) {
            if (err && err.code === 'SQLITE_BUSY' && tries < attempts) {
                tries++;
                return setTimeout(once, 150);
            }
            return cb(err, row);
        });
    }
    once();
}

// Run migrations on startup
runMigrations(usdb).catch(err => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
});


//logout
app.post("/logout", (req, res) => {
    // Defensive: clear token and user from session before destroying
    try {
        if (req.session) {
            req.session.token = null;
            req.session.user = null;
        }
    } catch (e) {
        console.warn('Failed to clear session properties before destroy:', e);
    }

    req.session.destroy(err => {
        if (err) return res.status(500).send("Logout failed");
        // Clear session cookie and explicitly expire the short-lived auth fallback cookie (fb_token)
        try { res.clearCookie("connect.sid"); } catch(e) {}
        try {
            // Some browsers require matching path/domain to delete — set expired cookies on common paths
            res.cookie('fb_token', '', { httpOnly: true, maxAge: 0, path: '/' });
            // also explicitly expire on /login path in case the cookie was set there
            res.cookie('fb_token', '', { httpOnly: true, maxAge: 0, path: '/login' });
            console.log('Cleared fb_token fallback cookie on logout (paths: / and /login)');
        } catch (e) {
            try { res.clearCookie('fb_token'); } catch(e) {}
        }

        const wantsJson = req.headers['accept'] && req.headers['accept'].includes('application/json');
        if (wantsJson) {
            return res.json({ redirect: '/logged-out' });
        }
        return res.redirect('/logged-out');
    });
});

// ── Admin: Reset a user's data to default values ──────────────────────────
app.post('/api/reset-user', express.json(), (req, res) => {
    // Only allow admins to call this endpoint
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'not_authenticated' });
    const callerFid = Number(req.session.user.fid || req.session.user.FID || 0);
    const adminIds = [73,84,44,87,43];
    if (!adminIds.includes(callerFid)) {
        console.warn(`[RESET-USER] Forbidden: caller fid ${callerFid} not in admin list`);
        return res.status(403).json({ error: 'forbidden', message: 'caller is not an admin' });
    }

    const body = req.body || {};
    console.log('[RESET-USER] request payload from callerFid=%d: %o', callerFid, body);
    const targetFid = body.fid ? Number(body.fid) : null;
    const displayname = body.displayname || null;

    if ((!targetFid || Number.isNaN(targetFid)) && !displayname) {
        return res.status(400).json({ error: 'missing_target', message: 'target fid or displayname required' });
    }

    // Find the user row
    const lookupSql = targetFid ? 'SELECT uid, displayname, fid FROM userSettings WHERE fid = ?' : 'SELECT uid, displayname, fid FROM userSettings WHERE displayname = ?';
    const lookupParam = targetFid ? [targetFid] : [displayname];

    usdb.get(lookupSql, lookupParam, (err, row) => {
        if (err) {
            console.error('Reset-user lookup error:', err);
            return res.status(500).json({ error: 'db', message: String(err) });
        }
        if (!row) return res.status(404).json({ error: 'not_found', message: 'target user not found' });

        const userUid = Number(row.uid);
        const targetName = row.displayname;
        const targetFidResolved = row.fid;

        // Require explicit re-typed confirmation fid to match the target's fid
        const confirmFid = body.confirmFid ? Number(body.confirmFid) : null;
        if (confirmFid === null || Number.isNaN(confirmFid) || Number(confirmFid) !== Number(targetFidResolved)) {
            console.warn(`[RESET-USER] Confirmation mismatch: typed=${body.confirmFid} expected=${targetFidResolved}`);
            return res.status(400).json({ error: 'confirm_mismatch', message: 'Confirmation FID did not match target' });
        }

        // Ensure lastResetAt column exists before starting the transaction so we can set it atomically.
        // This reduces the race window where a client's autosave could acceptably overwrite a reset.
        usdb.run("ALTER TABLE userSettings ADD COLUMN lastResetAt INTEGER", [], () => {
            // Begin transaction: delete per-instance inventory and reset userSettings fields to defaults
            usdb.serialize(() => {
                usdb.run('BEGIN TRANSACTION');

                // delete inventory instances for the user
                runWithRetries(usdb, 'DELETE FROM inventory WHERE user_uid = ?', [userUid], 5, (delErr) => {
                    if (delErr) console.warn('[RESET-USER] Failed to delete inventory rows:', delErr);

                    // Reset userSettings to the same defaults used by the reset script
                    // Keep these in sync with data/resetUser.js
                    const defaults = {
                        theme: 'black',
                        score: 0,
                        inventory: JSON.stringify([]),
                        Isize: 10,
                        xp: 0,
                        maxxp: 30,
                        level: 1,
                        income: 0,
                        totalSold: 0,
                        cratesOpened: 0,
                        pogamount: JSON.stringify([]),
                        // Use canonical achievements/tiers lists loaded at app startup
                        achievements: JSON.stringify(achievements || []),
                        tiers: JSON.stringify(tiers || []),
                        mergeCount: 0,
                        highestCombo: 0,
                        wish: 0,
                        crates: JSON.stringify([]),
                        // do not overwrite pfp — preserve the user's existing avatar
                    };

                    // include lastResetAt in the same UPDATE so it is set atomically with the reset
                    const updSql = `UPDATE userSettings SET
                        score = ?, Isize = ?, xp = ?, maxxp = ?, level = ?, income = ?, totalSold = ?, cratesOpened = ?,
                        pogamount = ?, achievements = ?, tiers = ?, mergeCount = ?, highestCombo = ?, wish = ?, crates = ?, inventory = ?, lastResetAt = ?
                        WHERE uid = ?`;

                    const nowTs = Date.now();
                    const params = [
                        defaults.score, defaults.Isize, defaults.xp, defaults.maxxp, defaults.level, defaults.income, defaults.totalSold, defaults.cratesOpened,
                        defaults.pogamount, defaults.achievements, defaults.tiers, defaults.mergeCount, defaults.highestCombo, defaults.wish, defaults.crates, defaults.inventory,
                        nowTs,
                        userUid
                    ];

                    usdb.run(updSql, params, function(updErr) {
                        if (updErr) {
                            console.error('[RESET-USER] Failed to update userSettings:', updErr);
                            usdb.run('ROLLBACK');
                            return res.status(500).json({ error: 'db_update', message: String(updErr) });
                        }

                        usdb.run('COMMIT');
                        console.log(`[RESET-USER] Admin fid ${callerFid} reset user ${targetName} (uid ${userUid}, fid ${targetFidResolved}) lastResetAt=${nowTs}`);

                        // Emit a force-reload to any connected sockets for the target fid
                        try {
                            const key = String(targetFidResolved);
                            const set = userSockets.get(key);
                            if (set && set.size > 0) {
                                set.forEach(sid => {
                                    try { io.to(sid).emit('force-reload', { reason: 'admin_reset', lastResetAt: nowTs }); } catch (e) {}
                                });
                            }
                        } catch (e) {
                            console.warn('[RESET-USER] Failed to emit force-reload to sockets:', e);
                        }

                        return res.json({ ok: true, lastResetAt: nowTs });
                    });
                });
            });
        });
    });
});
// logged-out landing page
app.get('/logged-out', (req, res) => {
    res.render('loggedout');
});

// patch notes page
app.get('/patch', (req, res) => {
    res.render('patch', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});

// trade room page
app.get('/chatroom', (req, res) => {
    res.render('chatroom', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});

app.get('/achievements', (req, res) => {
    res.render('achievements', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});

app.get('/battle', (req, res) => {
    res.render('battle', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});

app.get('/pogipedia', (req, res) => {
    res.render('pogipedia', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
});

app.get('/leaderboard', (req, res) => {
    usdb.all(
        'SELECT * FROM userSettings ORDER BY score DESC LIMIT 50', [],
        (err, rows) => {
            if (err) {
                console.error('DB select error:', err);
            }
            res.render('leaderboard', { userdata: req.session.user, maxPogs: pogCount, pogList: results, scores: rows });
        }
    );
});

app.get('/playerbase', (req, res) => {
    usdb.all(
        'SELECT * FROM userSettings ORDER BY score DESC', [],
        (err, rows) => {
            if (err) {
                console.error('DB select error:', err);
            }
            // If current user is an admin, print the banned list to server console for debugging
            try {
                const currentId = req.session && req.session.user && req.session.user.fid ? Number(req.session.user.fid) : null;
                const adminIds = [73,84,44,87,43];
                if (currentId && adminIds.includes(currentId)) {
                    console.log('Admin entered playerbase; banned list:', bannedListModule.getBannedList());
                }
            } catch (e) {
                console.error('Error while printing banned list for admin:', e);
            }

            res.render('playerbase', {
                userdata: req.session.user,
                maxPogs: pogCount,
                pogList: results,
                scores: rows,
                bannedList: (bannedListModule && typeof bannedListModule.getBannedList === 'function') ? bannedListModule.getBannedList() : []
            });
        }
    );
});

app.get('/api/leaderboard', (req, res) => {
    usdb.all('SELECT displayname, score FROM userSettings ORDER BY score DESC LIMIT 50', [], (err, rows) => {
        if (err) {
            console.error('API leaderboard error', err);
            return res.status(500).json({ error: 'db' });
        }
        res.json(rows || []);
    });
});

app.get('/api/playerbase', (req, res) => {
    usdb.all('SELECT displayname, score FROM userSettings ORDER BY score DESC', [], (err, rows) => {
        if (err) {
            console.error('API playerbase error', err);
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
    if (!req.session || !req.session.user || !req.session.user.displayName) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const displayName = req.session.user.displayName;

    // 1. Build the raw incoming save object from the client
    const incoming = {
        theme: req.body.lightMode,
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
        pfp: req.body.pfp,
        incomeWishActive: req.body.incomeWishActive,
        incomeWishEndTime: req.body.incomeWishEndTime,
        dropRateWishActive: req.body.dropRateWishActive,
        dropRateWishEndTime: req.body.dropRateWishEndTime,
        clarityWishActive: req.body.clarityWishActive,
        clarityWishEndTime: req.body.clarityWishEndTime,
        clarityPreviews: req.body.clarityPreviews,
        clarityResults: req.body.clarityResults,
        clarityUsedCount: req.body.clarityUsedCount
        ,
        clientSaveTime: req.body.clientSaveTime
    }

    // 2. Fetch the current DB row so we can compare for cheating
    usdb.get('SELECT * FROM userSettings WHERE displayname = ?', [displayName], (err, row) => {
        if (err) {
            console.error('Error reading current user for validation:', err);
            return res.status(500).json({ message: 'Error reading user data' });
        }

        // Parse JSON columns from the DB row
        let current = {};
        if (row) {
            current = { ...row };
            try { current.inventory = JSON.parse(row.inventory || '[]'); } catch (e) { current.inventory = []; }
            try { current.pogamount = JSON.parse(row.pogamount || '[]'); } catch (e) { current.pogamount = []; }
            try { current.achievements = JSON.parse(row.achievements || '[]'); } catch (e) { current.achievements = []; }
            try { current.tiers = JSON.parse(row.tiers || '[]'); } catch (e) { current.tiers = []; }
            try { current.crates = JSON.parse(row.crates || '[]'); } catch (e) { current.crates = []; }
        }

        // ── Reject stale client saves if an admin reset happened recently
        try {
            const clientSaveTime = Number(req.body && req.body.clientSaveTime ? req.body.clientSaveTime : 0) || 0;
            const lastResetAt = row && row.lastResetAt ? Number(row.lastResetAt) : 0;
            if (lastResetAt && clientSaveTime && clientSaveTime < lastResetAt) {
                console.warn(`[DATASAVE] Rejecting stale save for ${displayName}: clientSaveTime=${clientSaveTime} < lastResetAt=${lastResetAt}`);
                return res.status(409).json({ error: 'stale_save', reload: true, lastResetAt });
            }
        } catch (e) {
            // don't block saves on parse errors
        }

        // 3. Validate & sanitize
        const { sanitized: userSave, warnings } = validateSave(incoming, current, results);

        if (warnings.length > 0) {
            console.warn(`[DATASAVE] Validation warnings for ${displayName}:`, warnings);
        }

        // 4. Persist to DB
        req.session.save(saveErr => {
            if (saveErr) {
                console.error('Error saving session:', saveErr);
                return res.status(500).json({ message: 'Error saving session' });
            }

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
                JSON.stringify(userSave.achievements || incoming.achievements),
                JSON.stringify(userSave.tiers || incoming.tiers),
                userSave.mergeCount,
                userSave.highestCombo,
                userSave.wish,
                JSON.stringify(userSave.crates),
                userSave.pfp,
                displayName
            ];

            usdb.run(
                `UPDATE userSettings SET fid = ?, theme = ?, score = ?, inventory = ?, Isize = ?, xp = ?, maxxp = ?, level = ?, income = ?, totalSold = ?, cratesOpened = ?, pogamount = ?, achievements = ?, tiers = ?, mergeCount = ?, highestCombo = ?, wish = ?, crates = ?, pfp = ? WHERE displayname = ?`,
                params,
                function (dbErr) {
                    if (dbErr) {
                        console.error('Error updating user settings:', dbErr);
                        return res.status(500).json({ message: 'Error updating user settings' });
                    }
                    // Update session user with sanitized save
                    req.session.user = { ...req.session.user, ...userSave };

                    // Synchronize per-instance inventory rows into the new inventory table.
                    // Normalize client inventory items into {pog_uid, quantity} and replace
                    // the user's rows in the inventory table. If the client inventory
                    // is empty we clear the server rows.
                    try {
                        const normalize = (it) => {
                            if (it == null) return null;
                            if (typeof it === 'number') return { pog_uid: Number(it), quantity: 1 };
                            if (typeof it === 'string' && /^[0-9]+$/.test(it)) return { pog_uid: Number(it), quantity: 1 };
                            // accept the newer camelCase pogUid from crate openings in addition to legacy keys
                            const pogUid = Number(it.pogUid || it.pogid || it.pog_uid || it.pog || it.uid || it.number || (it.pog && it.pog.uid) || NaN);
                            if (!Number.isFinite(pogUid)) return null;
                            let q = Number(it.quantity || it.qty || it.count || 1);
                            if (!Number.isFinite(q) || q < 1) q = 1;
                            return { pog_uid: pogUid, quantity: q };
                        };

                        const toSync = Array.isArray(userSave.inventory) ? userSave.inventory.map(normalize).filter(x => x) : [];

                        // Get numeric user uid and perform sync, then respond with canonical inventory
                        usdb.get('SELECT uid FROM userSettings WHERE displayname = ?', [displayName], (uidErr, urow) => {
                            if (uidErr || !urow) {
                                if (uidErr) console.warn('[DATASAVE] Could not lookup user uid to sync inventory:', uidErr);
                                // respond anyway without canonical inventory
                                return res.json({ message: 'Data saved successfully', corrected: warnings.length > 0 ? { inventory: userSave.inventory } : null });
                            }
                            const userUid = Number(urow.uid);

                            // Helper to finish by reading server-side inventory rows and returning canonicalized inventory
                            const finishAndRespond = () => {
                                usdb.all('SELECT uid, pog_uid, quantity FROM inventory WHERE user_uid = ?', [userUid], (invErr, invRows) => {
                                    let enrichedInventory = [];
                                    if (!invErr && Array.isArray(invRows) && invRows.length > 0) {
                                        enrichedInventory = invRows.map(r => {
                                            const match = results.find(p => Number(p.id) === Number(r.pog_uid) || Number(p.number) === Number(r.pog_uid) || Number(p.uid) === Number(r.pog_uid));
                                            const meta = match || {};
                                            const rarityMeta = RARITY_COLORS.find(rc => String(rc.name).toLowerCase() === String(meta.rarity || '').toLowerCase()) || {};
                                            const pogColorName = (meta && (meta.color || meta.pogcol || meta.pogCol || meta.pog_color)) || '';
                                            const visualColor = (rarityMeta && rarityMeta.color) || pogColorName || '';
                                            return {
                                                id: r.uid,
                                                pogid: Number(r.pog_uid),
                                                name: meta.name || `Pog #${r.pog_uid}`,
                                                rarity: meta.rarity || 'Trash',
                                                code2: meta.code2 || meta.code || 'unknown',
                                                income: rarityMeta.income || Number(meta.income) || 0,
                                                description: meta.description || '',
                                                creator: meta.creator || '',
                                                locked: false,
                                                quantity: r.quantity || 1,
                                                pogcol: pogColorName,
                                                color: visualColor
                                            };
                                        });
                                    } else {
                                        // fall back to the sanitized userSave.inventory (already canonicalized)
                                        try {
                                            enrichedInventory = Array.isArray(userSave.inventory) ? userSave.inventory : JSON.parse(userSave.inventory || '[]');
                                            enrichedInventory = enrichedInventory.map(it => ({ ...it, pogcol: it.pogcol || it.color || '', color: it.color || it.pogcol || '' }));
                                        } catch (e) { enrichedInventory = []; }
                                    }
                                    // set canonical inventory into userSave so client gets authoritative list
                                    userSave.inventory = enrichedInventory;
                                    req.session.user = { ...req.session.user, ...userSave };

                                    return res.json({
                                        message: 'Data saved successfully',
                                        corrected: warnings.length > 0 ? {
                                            money: userSave.score,
                                            Isize: userSave.Isize,
                                            wish: userSave.wish,
                                            xp: userSave.xp,
                                            maxXP: userSave.maxxp,
                                            level: userSave.level,
                                            cratesOpened: userSave.cratesOpened,
                                            totalSold: userSave.totalSold,
                                            mergeCount: userSave.mergeCount,
                                            highestCombo: userSave.highestCombo,
                                            inventory: userSave.inventory,
                                            income: userSave.income
                                        } : null
                                    });
                                });
                            };

                            // If there is nothing to sync, simply delete existing rows for the user and finish
                            if (toSync.length === 0) {
                                runWithRetries(usdb, 'DELETE FROM inventory WHERE user_uid = ?', [userUid], 5, (delErr) => {
                                    if (delErr) console.warn('[DATASAVE] Failed to clear inventory rows for user (empty):', delErr);
                                    return finishAndRespond();
                                });
                                return;
                            }

                            // Otherwise replace rows in a transaction, then finish
                            usdb.serialize(() => {
                                usdb.run('BEGIN TRANSACTION');
                                runWithRetries(usdb, 'DELETE FROM inventory WHERE user_uid = ?', [userUid], 5, (delErr) => {
                                    if (delErr) console.warn('[DATASAVE] Failed to clear inventory rows for user:', delErr);

                                    const insertNext = (idx) => {
                                        if (idx >= toSync.length) {
                                            usdb.run('COMMIT', [], (commitErr) => {
                                                if (commitErr) console.warn('[DATASAVE] Commit failed after inventory sync:', commitErr);
                                                return finishAndRespond();
                                            });
                                            return;
                                        }
                                        const itm = toSync[idx];
                                        runWithRetries(usdb, 'INSERT INTO inventory (user_uid, pog_uid, quantity) VALUES (?, ?, ?)', [userUid, itm.pog_uid, itm.quantity], 5, (insErr) => {
                                            if (insErr) console.warn('[DATASAVE] Failed to insert inventory row:', insErr);
                                            insertNext(idx + 1);
                                        });
                                    };
                                    insertNext(0);
                                });
                            });
                        });
                    } catch (e) {
                        console.warn('[DATASAVE] Inventory sync failed:', e);
                    }
                    // response will be returned after inventory sync completes (see finishAndRespond)
                }
            );
        });
    });
});

// ── Server-side slot purchase ─────────────────────────────────────────────
// Handles Digipog payment AND updates Isize in the DB atomically.
// Client calls this instead of modifying Isize locally.
app.post('/api/buy-slots', express.json(), (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    // Log incoming request for debugging
    try {
        console.log('[BUY-SLOTS] Incoming request', { sessionUser: req.session.user && {
            displayName: req.session.user.displayName || req.session.user.displayname,
            fid: req.session.user.fid
        }, body: req.body });
    } catch (e) { console.warn('[BUY-SLOTS] Failed to log request info', e); }

    const displayName = req.session.user.displayName || req.session.user.displayname;
    const fid = req.session.user.fid;
    const amount = Number(req.body.amount);
    const pin = req.body.pin;

    if (!Number.isFinite(amount) || amount < 1 || amount > 90) {
        return res.status(400).json({ success: false, message: 'Invalid slot amount' });
    }

    // Check current Isize in DB first
    usdb.get('SELECT Isize FROM userSettings WHERE displayname = ?', [displayName], (err, row) => {
        if (err || !row) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        const currentIsize = Number(row.Isize) || 10;
        if (currentIsize + amount > 100) {
            return res.status(400).json({ success: false, message: 'Would exceed 100 slots' });
        }

        const slotPrice = 25 * amount;
        const isAdmin = fid === 73 || fid === 44 || fid === 87 || fid === 26 || fid === 43 || fid === 1 || fid === 127;

        // Helper to finalize the DB update after payment succeeds
        function finalizeSlotPurchase() {
            const newIsize = currentIsize + amount;
            usdb.run(
                'UPDATE userSettings SET Isize = ? WHERE displayname = ?',
                [newIsize, displayName],
                function (dbErr) {
                    if (dbErr) {
                        console.error('Error updating Isize:', dbErr);
                        return res.status(500).json({ success: false, message: 'Database error' });
                    }
                    console.log(`[BUY-SLOTS] ${displayName} bought ${amount} slots. Isize: ${currentIsize} → ${newIsize}`);
                    return res.json({ success: true, message: `+${amount} slots`, Isize: newIsize });
                }
            );
        }

        if (isAdmin) {
            // Admins skip payment
            console.log('Admin slot purchase bypassed cost deduction.');
            return finalizeSlotPurchase();
        }

        // Process Digipog payment
        const paydesc = {
            from: fid,
            to: 30,
            amount: slotPrice,
            reason: `Pogglebar - Slots x${amount}`,
            pin: pin,
            pool: true
        };
        // Log the outgoing payment descriptor for debugging
        console.log('[BUY-SLOTS] Initiating payment:', { paydesc, AUTH_URL: process.env.AUTH_URL });

        fetch(`${process.env.AUTH_URL}/api/digipogs/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paydesc),
        })
        .then(async (resp) => {
            const text = await resp.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.warn('[BUY-SLOTS] Non-JSON response from transfer endpoint:', text);
                return res.status(502).json({ success: false, message: 'Bad gateway from payment provider' });
            }
            console.log('[BUY-SLOTS] Transfer response:', data);
            if (data && data.success) {
                return finalizeSlotPurchase();
            }
            return res.json({ success: false, message: (data && data.message) || 'Payment failed' });
        })
        .catch(err => {
            console.error('Error during slot payment:', err);
            return res.status(500).json({ success: false, message: 'Payment error' });
        });
    });
});

// ── Server-side wish trade ────────────────────────────────────────────────
// The client calls this instead of modifying wish/inventory locally.
// Verifies a Dragon Ball exists in the DB inventory, removes it, increments wish.
app.post('/api/trade-wish', express.json(), (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const displayName = req.session.user.displayName;
    const dragonBallId = Number(req.body.dragonBallId);

    if (!Number.isFinite(dragonBallId)) {
        return res.status(400).json({ error: 'Invalid Dragon Ball ID' });
    }

    // Use inventory table: find the inventory instance by uid and ensure it belongs to the user and is a Dragon Ball
    // Also fetch the stored legacy `inventory` JSON so we can fallback to migrate a client-only item
    usdb.get('SELECT uid, inventory FROM userSettings WHERE displayname = ?', [displayName], (err, userRow) => {
        if (err || !userRow) {
            console.error('Error fetching user uid for wish trade:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        const userUid = userRow.uid;

        // resolve the set of Dragon Ball pog ids once so we can use it for fallbacks
        const dragonPogIds = (results || []).filter(p => String(p.name || '').toLowerCase() === 'dragon ball').map(p => Number(p.id));

        usdb.get('SELECT uid as iid, pog_uid, quantity FROM inventory WHERE uid = ? AND user_uid = ?', [dragonBallId, userUid], (invErr, invRow) => {
            if (invErr) {
                console.error('Error reading inventory for wish trade:', invErr);
                return res.status(500).json({ error: 'Database error' });
            }

            // Helper to proceed once we have a canonical inventory row and its effective uid
            function proceedWithInventoryRow(dbInvRow, effectiveUid) {
                const pogMeta = results.find(p => Number(p.id) === Number(dbInvRow.pog_uid) || Number(p.uid) === Number(dbInvRow.pog_uid));
                const pogName = pogMeta ? pogMeta.name : null;
                if (pogName !== 'Dragon Ball') {
                    return res.status(400).json({ error: 'Item is not a Dragon Ball' });
                }

                // delete the inventory instance and increment wish on userSettings
                dbRunWithRetries = function(sql, params, cb) { // lightweight inline retry to avoid SQLITE_BUSY
                    let tries = 0;
                    function once() {
                        usdb.run(sql, params, function(e) {
                            if (e && e.code === 'SQLITE_BUSY' && tries < 5) { tries++; return setTimeout(once, 150); }
                            return cb(e, this);
                        });
                    }
                    once();
                };

                dbRunWithRetries('DELETE FROM inventory WHERE uid = ?', [effectiveUid], (delErr) => {
                    if (delErr) {
                        console.error('Error deleting inventory instance for wish trade:', delErr);
                        return res.status(500).json({ error: 'Database error' });
                    }

                    // increment wish
                    usdb.get('SELECT wish FROM userSettings WHERE uid = ?', [userUid], (wishErr, wishRow) => {
                        if (wishErr) { console.error('Error reading wish:', wishErr); return res.status(500).json({ error: 'Database error' }); }
                        const currentWish = Number(wishRow && wishRow.wish) || 0;
                        const newWish = currentWish + 1;
                        dbRunWithRetries('UPDATE userSettings SET wish = ? WHERE uid = ?', [newWish, userUid], (updErr) => {
                            if (updErr) { console.error('Error updating wish:', updErr); return res.status(500).json({ error: 'Database error' }); }
                            console.log(`[TRADE-WISH] ${displayName} traded Dragon Ball (inv uid: ${effectiveUid}) for wish. Wishes: ${currentWish} → ${newWish}`);

                            function enrichInvRow(invRow, pogList) {
                                const match = (pogList || []).find(p => {
                                    return Number(p.id) === Number(invRow.pog_uid) || Number(p.number) === Number(invRow.pog_uid) || Number(p.uid) === Number(invRow.pog_uid);
                                });
                                if (match) {
                                    const meta = RARITY_COLORS.find(r => String(r.name).toLowerCase() === String(match.rarity || '').toLowerCase()) || {};
                                    const pogColorName = match.color || match.pogcol || match.pogCol || match.pog_color || '';
                                    const visualColor = meta.color || pogColorName || '';
                                    return {
                                        id: invRow.uid,
                                        pogid: Number(invRow.pog_uid),
                                        name: match.name || 'Unknown Pog',
                                        rarity: match.rarity || 'Trash',
                                        code2: match.code2 || match.code || 'unknown',
                                        income: meta.income || Number(match.income) || 0,
                                        description: match.description || '',
                                        creator: match.creator || '',
                                        locked: false,
                                        quantity: invRow.quantity || 1,
                                        pogcol: pogColorName,
                                        color: visualColor
                                    };
                                }
                                return {
                                    id: invRow.uid,
                                    pogid: Number(invRow.pog_uid),
                                    name: `Pog #${invRow.pog_uid}`,
                                    rarity: 'Trash',
                                    code2: 'unknown',
                                    income: 0,
                                    description: '',
                                    creator: '',
                                    locked: false,
                                    quantity: invRow.quantity || 1,
                                    pogcol: '',
                                    color: ''
                                };
                            }

                            usdb.all('SELECT uid, pog_uid, quantity FROM inventory WHERE user_uid = ?', [userUid], (invErr, invRows) => {
                                let enrichedInventory = [];
                                if (!invErr && Array.isArray(invRows) && invRows.length > 0) {
                                    enrichedInventory = invRows.map(r => enrichInvRow(r, results));
                                } else {
                                    if (invErr) console.error('Error loading inventory after wish trade:', invErr);
                                    enrichedInventory = [];
                                }

                                // Ensure the traded item is not present in the response inventory
                                enrichedInventory = enrichedInventory.filter(it => Number(it.id) !== Number(effectiveUid));

                                // Persist authoritative inventory back to userSettings.inventory so the legacy JSON stays in sync
                                try {
                                    const invJson = JSON.stringify(enrichedInventory);
                                    runWithRetries(usdb, 'UPDATE userSettings SET inventory = ? WHERE uid = ?', [invJson, userUid], 3, (syncErr) => {
                                        if (syncErr) console.warn('[TRADE-WISH] Failed to sync inventory JSON after trade:', syncErr);
                                    });
                                    // also refresh session copy
                                    try { req.session.user = { ...req.session.user, inventory: enrichedInventory }; } catch (e) {}
                                } catch (e) {
                                    console.warn('[TRADE-WISH] Could not stringify inventory for session sync:', e);
                                }

                                return res.json({ wish: newWish, removedInventoryId: effectiveUid, inventory: enrichedInventory });
                            });
                        });
                    });
                });
            }

            if (!invRow) {
                // try matching by legacy_id for older client-generated ids
                usdb.get('SELECT uid as iid, pog_uid, quantity FROM inventory WHERE legacy_id = ? AND user_uid = ?', [dragonBallId, userUid], (legacyErr, legacyRow) => {
                    if (legacyErr) {
                        console.error('Error reading inventory (legacy lookup) for wish trade:', legacyErr);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    if (!legacyRow) {
                        // If the requested id wasn't found, fall back to "any" Dragon Ball in the inventory table.
                        // This catches cases where the client clicked a stale/timestamp id but the user still has
                        // a Dragon Ball in the canonical inventory table.
                        const queryFallback = () => {
                            // As a final fallback, check the user's legacy JSON inventory (userSettings.inventory)
                            // to see if the client clicked on an unsaved/timestamp id. If found, remove it from
                            // the legacy JSON, insert a canonical inventory row, then proceed.
                            try {
                                let legacyInv = [];
                                try { legacyInv = JSON.parse(userRow.inventory || '[]'); } catch (e) { legacyInv = []; }

                                // Find by a few possible id fields the client might have sent
                                const matchIndex = legacyInv.findIndex(it => {
                                    if (!it) return false;
                                    try {
                                        return String(it.id) === String(dragonBallId) || String(it.displayId) === String(dragonBallId) || String(it.uid) === String(dragonBallId) || String(it.legacy_id) === String(dragonBallId);
                                    } catch (e) { return false; }
                                });

                                let usedIndex = matchIndex;
                                if (matchIndex === -1) {
                                    // No exact match for the clicked id — try a permissive search for any Dragon Ball
                                    usedIndex = legacyInv.findIndex(it => {
                                        if (!it) return false;
                                        const nameOk = String(it.name || '').toLowerCase() === 'dragon ball';
                                        const pogMatch = Number(it.pogid || it.pog_uid || it.uid || it.number || NaN);
                                        const pogOk = dragonPogIds.includes(pogMatch);
                                        return (nameOk || pogOk) && !it.locked;
                                    });
                                }

                                if (usedIndex === -1) {
                                    console.warn(`[TRADE-WISH] Inventory not found for displayName=${displayName} dragonBallId=${dragonBallId} (queried user_uid=${userUid})`);
                                    return res.status(400).json({ error: 'Dragon Ball not found in inventory' });
                                }

                                const matched = legacyInv[usedIndex];
                                // Try to determine pog_uid from the legacy item shape
                                const pogUid = Number(matched.pogid || matched.pog_uid || matched.pogUid || matched.pog || matched.uid || matched.number || matched.pogId || NaN);
                                if (!Number.isFinite(pogUid) || Number(pogUid) <= 0) {
                                    console.warn('[TRADE-WISH] Could not determine pog_uid from legacy inventory item:', matched);
                                    return res.status(400).json({ error: 'Invalid legacy inventory item' });
                                }

                                // Remove the item from the stored JSON inventory so it doesn't reappear on next load
                                const newLegacyInv = legacyInv.slice().filter(it => {
                                    try {
                                        const sameId = String(it.id) === String(matched.id) || String(it.displayId) === String(matched.displayId);
                                        const samePog = Number(it.pogid || it.pog_uid || it.uid || it.number || NaN) === pogUid;
                                        return !(sameId || samePog);
                                    } catch (e) { return true; }
                                });

                                // Helper to insert remaining legacy items into the inventory table when it is empty
                                const migrateRemainingIfEmpty = (cb) => {
                                    usdb.get('SELECT COUNT(*) as c FROM inventory WHERE user_uid = ?', [userUid], (cntErr, cntRow) => {
                                        if (cntErr) { console.warn('[TRADE-WISH] Count inventory failed during migration:', cntErr); return cb(); }
                                        const count = Number(cntRow && cntRow.c) || 0;
                                        if (count > 0) return cb();
                                        const toInsert = Array.isArray(newLegacyInv) ? newLegacyInv : [];
                                        let idx = 0;
                                        const next = () => {
                                            if (idx >= toInsert.length) return cb();
                                            const itm = toInsert[idx++] || {};
                                            const pogUidIns = Number(itm.pogid || itm.pog_uid || itm.pogUid || itm.pog || itm.uid || itm.number || itm.pogId || NaN);
                                            if (!Number.isFinite(pogUidIns) || pogUidIns <= 0) return next();
                                            const qtyIns = Number(itm.quantity || itm.qty || itm.count || 1);
                                            runWithRetries(usdb, 'INSERT INTO inventory (user_uid, pog_uid, quantity, legacy_id) VALUES (?, ?, ?, ?)', [userUid, pogUidIns, qtyIns, itm.id || itm.displayId || itm.legacy_id || null], 5, () => next());
                                        };
                                        next();
                                    });
                                };

                                runWithRetries(usdb, 'UPDATE userSettings SET inventory = ? WHERE uid = ?', [JSON.stringify(newLegacyInv), userUid], 5, (updErr) => {
                                    if (updErr) console.warn('[TRADE-WISH] Failed to update userSettings.inventory while migrating legacy item:', updErr);

                                    // If inventory table is empty, migrate the remaining legacy items so the client retains its full inventory
                                    migrateRemainingIfEmpty(() => {
                                        // Insert a proper inventory row for the Dragon Ball so proceedWithInventoryRow can delete it normally
                                        usdb.run('INSERT INTO inventory (user_uid, pog_uid, quantity, legacy_id) VALUES (?, ?, ?, ?)', [userUid, pogUid, Number(matched.quantity || matched.qty || matched.count || 1), dragonBallId], function(finalErr) {
                                            if (finalErr) {
                                                console.error('[TRADE-WISH] Insert failed during legacy migration:', finalErr);
                                                return res.status(500).json({ error: 'Database error' });
                                            }
                                            const newIid = this.lastID;
                                            const fakeRow = { iid: newIid, pog_uid: pogUid, quantity: Number(matched.quantity || matched.qty || matched.count || 1) };
                                            proceedWithInventoryRow(fakeRow, newIid);
                                        });
                                    });
                                });
                            } catch (e) {
                                console.error('Error during legacy inventory fallback for wish trade:', e);
                                return res.status(500).json({ error: 'Server error' });
                            }
                            return;
                        };

                        if (dragonPogIds.length > 0) {
                            usdb.get('SELECT uid as iid, pog_uid, quantity FROM inventory WHERE user_uid = ? AND pog_uid IN (' + dragonPogIds.map(() => '?').join(',') + ') ORDER BY uid LIMIT 1', [userUid, ...dragonPogIds], (anyErr, anyRow) => {
                                if (anyErr) {
                                    console.error('Error finding fallback Dragon Ball row for wish trade:', anyErr);
                                    return res.status(500).json({ error: 'Database error' });
                                }

                                if (anyRow) {
                                    console.warn(`[TRADE-WISH] Fallback: deleting first Dragon Ball row uid=${anyRow.iid} for displayName=${displayName} (requested id ${dragonBallId})`);
                                    proceedWithInventoryRow(anyRow, anyRow.iid);
                                    return;
                                }

                                return queryFallback();
                            });
                        } else {
                            return queryFallback();
                        }
                        return;
                    }
                    proceedWithInventoryRow(legacyRow, legacyRow.iid || legacyRow.uid || legacyRow.iid);
                });
            } else {
                proceedWithInventoryRow(invRow, dragonBallId);
            }
        });
    });
});

// ── Server-side crate opening ─────────────────────────────────────────────
// The client calls this instead of rolling RNG locally.
// Returns the pog result; the client is responsible for calling save() after.
app.post('/api/open-crate', express.json(), async (req, res) => {
  try {
    // 1️⃣ Auth check
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const crateIndex = Number(req.body.crateIndex);
    if (!Number.isFinite(crateIndex) || crateIndex < 0 || crateIndex >= crateRef.length) {
      return res.status(400).json({ error: 'Invalid crate index' });
    }

    const crate = crateRef[crateIndex];
    const pogListLocal = results; // master pog list
    if (!pogListLocal || !pogListLocal.length) {
      return res.status(500).json({ error: 'Pog list not loaded' });
    }

    const norm = s => String(s || '').trim().toLowerCase();

    // 2️⃣ Apply drop rate boost (trust-but-verify)
    const multiplier = req.body.dropRateBoost === true ? 1.5 : 1.0;

    // 3️⃣ Roll RNG
    let rand = Math.random();
    let cumulativeChance = 0;
    let chosen = null;

    for (const tier of crate.rarities) {
      const boostedChance = (Number(tier.chance) || 0) * multiplier;
      cumulativeChance += boostedChance;
      if (rand < cumulativeChance) {
        const candidates = pogListLocal.filter(p => norm(p.rarity) === norm(tier.name));
        if (candidates.length === 0) continue;

        chosen = candidates[Math.floor(Math.random() * candidates.length)];
        break;
      }
    }

    // 4️⃣ Fallback if no tier matched
    if (!chosen) {
      const fallbackTier = crate.rarities[crate.rarities.length - 1];
      if (fallbackTier) {
        const candidates = pogListLocal.filter(p => norm(p.rarity) === norm(fallbackTier.name));
        if (candidates.length > 0) {
          chosen = candidates[Math.floor(Math.random() * candidates.length)];
        }
      }
    }

    if (!chosen) {
      return res.status(500).json({ error: 'Failed to generate pog result' });
    }

    // 5️⃣ Build pogResult for frontend (normalized)
    const meta = RARITY_COLORS.find(r => norm(r.name) === norm(chosen.rarity)) || {};
            const displayId = Date.now() + Math.floor(Math.random() * 10000);
            const pogResult = {
                locked: false,
                // pog CSV loader uses `id` while some DB-sourced pogs may have `uid` — prefer uid then id
                pogUid: Number(chosen.uid || chosen.id || chosen.number), // store only UID in inventory (coerced to Number)
                id: displayId,
                displayId: displayId, // temporary frontend ID (also provide `id` for older client code)
                name: chosen.name,
                rarity: chosen.rarity,
                pogcol: chosen.color || 'white',
                color: meta.color || 'white',
                code2: chosen.code2,
                income: meta.income || 5,
                description: (chosen.description || '') + '',
                creator: chosen.creator || ''
            };

            // Validate pog UID before attempting DB insert
            if (!Number.isFinite(pogResult.pogUid) || Number(pogResult.pogUid) <= 0) {
                console.error('OPEN CRATE ERROR: invalid pog uid for chosen pog', chosen);
                return res.status(500).json({ error: 'server', message: 'Invalid pog identifier for crate result' });
            }

            // 6️⃣ Add to user inventory (normalized)
        // Ensure we have the authoritative DB uid for this session user (session may only store fid)
        const lookupDisplay = req.session.user && (req.session.user.displayName || req.session.user.displayname);
        try {
            const userRow = await new Promise((resolve, reject) => {
                getWithRetries(usdb, 'SELECT uid FROM userSettings WHERE displayname = ?', [lookupDisplay], 5, (gErr, row) => {
                    if (gErr) return reject(gErr);
                    if (!row) return reject(new Error('User not found'));
                    return resolve(row);
                });
            });

            const userUid = userRow.uid;

            // Insert inventory instance (quantity defaults to 1). Use runWithRetries to avoid SQLITE_BUSY
            await new Promise((resolve, reject) => {
                runWithRetries(usdb, 'INSERT INTO inventory (user_uid, pog_uid, quantity) VALUES (?, ?, ?)', [userUid, pogResult.pogUid, 1], 5, (insErr) => {
                    if (insErr) return reject(insErr);
                    return resolve();
                });
            });

            // Respond with the pog result (client will call save afterwards)
            return res.json({ ok: true, pogResult });
        } catch (dbErr) {
            console.error('OPEN CRATE DB ERROR:', dbErr);
            // If inventory table is missing, hint to run migrations
            if (dbErr && dbErr.message && dbErr.message.toLowerCase().includes('no such table')) {
                return res.status(500).json({ error: 'db', message: 'Inventory table missing; please run migrations' });
            }
            return res.status(500).json({ error: dbErr.message || String(dbErr) });
        }

  } catch (err) {
    console.error("OPEN CRATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
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
    const isAdmin = id === 73 || id === 84 || id === 44 || id === 87 || id === 43;
    
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
// ban hammer (from Phighting!)
app.post('/api/ban', express.json(), (req, res) => {
    // Simple admin check (same test used elsewhere)
    const adminIds = [73,44,87,43];
    const currentId = req.session.user && req.session.user.fid ? Number(req.session.user.fid) : null;
    if (!currentId || !adminIds.includes(currentId)) {
        return res.status(403).json({ ok: false, message: 'forbidden' });
    }

    const body = req.body || {};
    const fid = body.fid ? (isNaN(Number(body.fid)) ? null : Number(body.fid)) : null;
    const displayname = body.displayname ? String(body.displayname) : null;
    if (!fid && !displayname) return res.status(400).json({ ok: false, message: 'missing identifier' });

    // Protect certain internal/admin FIDs from being banned.
    const PROTECTED_FIDS = [73, 44, 87, 43];
    if (fid && PROTECTED_FIDS.includes(fid)) {
        return res.status(400).json({ ok: false, message: 'cannot ban this user' });
    }

    const userObj = fid ? { fid } : { name: displayname };
    try {
        bannedListModule.addBannedUser(userObj);
        return res.json({ ok: true });
    } catch (e) {
        console.error('Failed to add banned user', e);
        return res.status(500).json({ ok: false });
    }
});

// unban user
app.post('/api/unban', express.json(), (req, res) => {
    const adminIds = [73,44,87,43];
    const currentId = req.session.user && req.session.user.fid ? Number(req.session.user.fid) : null;
    if (!currentId || !adminIds.includes(currentId)) {
        return res.status(403).json({ ok: false, message: 'forbidden' });
    }

    const body = req.body || {};
    const fid = body.fid ? (isNaN(Number(body.fid)) ? null : Number(body.fid)) : null;
    const displayname = body.displayname ? String(body.displayname) : null;
    if (!fid && !displayname) return res.status(400).json({ ok: false, message: 'missing identifier' });

    const userObj = fid ? { fid } : { name: displayname };
    try {
        bannedListModule.removeBannedUser(userObj);
        return res.json({ ok: true });
    } catch (e) {
        console.error('Failed to remove banned user', e);
        return res.status(500).json({ ok: false });
    }
});

// API route to get user state
app.get('/api/user-state', (req, res) => {
    const displayName = req.session.user.displayName;
    usdb.get('SELECT * FROM userSettings WHERE displayname = ?', [displayName], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'User not found' });

        // attempt to read per-instance inventory rows
        usdb.all('SELECT uid, pog_uid, quantity FROM inventory WHERE user_uid = ?', [row.uid], (invErr, invRows) => {
            let enrichedInventory = [];
            if (!invErr && Array.isArray(invRows) && invRows.length > 0) {
                // enrich with pog metadata from CSV/loaded results
                enrichedInventory = invRows.map(r => {
                    const match = results.find(p => Number(p.id) === Number(r.pog_uid) || Number(p.number) === Number(r.pog_uid) || Number(p.uid) === Number(r.pog_uid));
                    const meta = match || {};
                    const rarityMeta = RARITY_COLORS.find(rc => String(rc.name).toLowerCase() === String(meta.rarity || '').toLowerCase()) || {};
                    // prefer pog-specific color name (match.color) but fall back to rarity color for visual hex
                    const pogColorName = (meta && (meta.color || meta.pogcol || meta.pogCol || meta.pog_color)) || '';
                    const visualColor = (rarityMeta && rarityMeta.color) || pogColorName || '';
                    return {
                        id: r.uid,
                        pogid: Number(r.pog_uid),
                        name: meta.name || `Pog #${r.pog_uid}`,
                        rarity: meta.rarity || 'Trash',
                        code2: meta.code2 || meta.code || 'unknown',
                        income: rarityMeta.income || Number(meta.income) || 0,
                        description: meta.description || '',
                        creator: meta.creator || '',
                        locked: false,
                        quantity: r.quantity || 1,
                        // provide both properties because different client code reads different keys
                        pogcol: pogColorName,
                        color: visualColor
                    };
                });
            } else {
                try {
                    const legacy = JSON.parse(row.inventory || '[]');
                    // normalize items to ensure pogcol/color exist for client
                    enrichedInventory = (Array.isArray(legacy) ? legacy : []).map(it => ({
                        ...it,
                        pogcol: it.pogcol || it.color || '',
                        color: it.color || it.pogcol || ''
                    }));
                } catch (e) { enrichedInventory = []; }
            }

            const userState = initializeUserState(Object.assign({}, row, { inventory: enrichedInventory }));
            res.json({ userState, rarityColors: RARITY_COLORS });
        });
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

    // ensure session tiers exist and are populated; if empty array, use canonical tiers
    if (!Array.isArray(req.session.user.tiers) || req.session.user.tiers.length === 0) {
        req.session.user.tiers = JSON.parse(JSON.stringify(tiers));
    }

    const idx = req.session.user.tiers.findIndex(t => Number(t.tier) === Number(tierNum));
    if (idx === -1) {
        console.warn('Tier not found during claim. Request body:', req.body);
        try { console.warn('Session tiers snapshot:', JSON.stringify(req.session.user.tiers).slice(0,2000)); } catch (e) { console.warn('Failed to stringify session tiers:', e); }
        return res.status(404).json({ error: 'Tier not found' });
    }

    req.session.user.tiers[idx].status = status;

    // persist to DB
    const tiersJson = JSON.stringify(req.session.user.tiers);
    const displayName = req.session.user.displayName;
    console.log('Saving tiers for', displayName, req.session.user.tiers);
    runWithRetries(usdb, 'UPDATE userSettings SET tiers = ? WHERE displayname = ?', [tiersJson, displayName], 5, function(err) {
        if (err) {
            console.error('Error saving tiers for', displayName, err);
            // try to add the column if it doesn't exist, then retry once
            if (err.message && err.message.toLowerCase().includes('no such column')) {
                usdb.run("ALTER TABLE userSettings ADD COLUMN tiers TEXT DEFAULT '[]'", [], function(altErr) {
                    if (altErr) {
                        console.error('Failed to add tiers column:', altErr);
                        return res.status(500).json({ error: 'db', message: altErr.message || String(altErr) });
                    }
                    // retry update
                    runWithRetries(usdb, 'UPDATE userSettings SET tiers = ? WHERE displayname = ?', [tiersJson, displayName], 5, function(err2) {
                        if (err2) {
                            console.error('Error saving tiers after adding column for', displayName, err2);
                            return res.status(500).json({ error: 'db', message: err2.message || String(err2) });
                        }
                        // after tiers saved, possibly grant a perk if this tier awards one
                        handlePostTierSave(req, res, idx, status, displayName);
                    });
                });
                return;
            }
            return res.status(500).json({ error: 'db', message: err.message || String(err) });
        }
        // after tiers saved, possibly grant a perk if this tier awards one
        handlePostTierSave(req, res, idx, status, displayName);
    });
});

    // helper to handle optional perk granting after tiers were saved
    function handlePostTierSave(reqParam, resParam, idxParam, statusParam, displayNameParam) {
        // ensure session is saved before continuing
        reqParam.session.save(saveErr => {
            if (saveErr) console.error('Failed to save session after tiers update:', saveErr);
            console.log('Tiers saved and session saved for', displayNameParam);

            // check whether this tier grants a perk
            try {
                const claimedTier = reqParam.session.user.tiers && reqParam.session.user.tiers[idxParam] ? reqParam.session.user.tiers[idxParam] : null;
                const rewardType = claimedTier && claimedTier.reward ? String(claimedTier.reward) : null;
                // only proceed if the reward is a "Perk" and the client marked it claimed
                console.log('Post-tier: rewardType=', rewardType, 'statusParam=', statusParam);
                if (rewardType === 'Perk' && statusParam) {
                    console.log('Post-tier: entering perk grant flow for', displayNameParam, 'tier idx', idxParam);
                    // helper to process an authoritative perks array and attempt to grant one
                    function processPerksArray(existingPerks) {
                        console.log('processPerksArray: existingPerks length=', (existingPerks||[]).length);
                        existingPerks = Array.isArray(existingPerks) ? existingPerks : [];
                        // build set of owned perk names
                        const owned = new Set((existingPerks || []).map(p => p && p.name).filter(Boolean));
                        // filter global perks list to those not owned
                        const available = (perks || []).filter(p => !owned.has(p.name));
                        if (!available || available.length === 0) {
                            console.log('No available perks to grant for', displayNameParam);
                            // still respond with tiers but no grantedPerk
                            return resParam.json({ tiers: reqParam.session.user.tiers, grantedPerk: null });
                        }

                        // choose random available perk
                        const choice = available[Math.floor(Math.random() * available.length)];
                        const granted = { name: choice.name, givenAt: Date.now() };
                        existingPerks.push(granted);
                        const perksJson = JSON.stringify(existingPerks);

                        // persist perks to DB; if column missing, try to add then retry
                        runWithRetries(usdb, 'UPDATE userSettings SET perks = ? WHERE displayname = ?', [perksJson, displayNameParam], 5, function(updateErr) {
                            if (updateErr) {
                                console.error('Error saving perks for', displayNameParam, updateErr);
                                if (updateErr.message && updateErr.message.toLowerCase().includes('no such column')) {
                                    usdb.run("ALTER TABLE userSettings ADD COLUMN perks TEXT DEFAULT '[]'", [], function(altErr2) {
                                        if (altErr2) {
                                            console.error('Failed to add perks column:', altErr2);
                                            return resParam.status(500).json({ error: 'db', message: altErr2.message || String(altErr2) });
                                        }
                                        // retry update
                                        runWithRetries(usdb, 'UPDATE userSettings SET perks = ? WHERE displayname = ?', [perksJson, displayNameParam], 5, function(err3) {
                                            if (err3) {
                                                console.error('Error saving perks after ALTER for', displayNameParam, err3);
                                                return resParam.status(500).json({ error: 'db', message: err3.message || String(err3) });
                                            }
                                            // update session and return granted perk
                                            reqParam.session.user.perks = existingPerks;
                                            reqParam.session.save(() => {
                                                return resParam.json({ tiers: reqParam.session.user.tiers, grantedPerk: granted });
                                            });
                                        });
                                    });
                                    return;
                                }
                                return resParam.status(500).json({ error: 'db', message: updateErr.message || String(updateErr) });
                            }
                            // success: update session and return granted perk
                            reqParam.session.user.perks = existingPerks;
                            reqParam.session.save(() => {
                                return resParam.json({ tiers: reqParam.session.user.tiers, grantedPerk: granted });
                            });
                        });
                    }

                    // fetch authoritative perks array from DB
                    getWithRetries(usdb, 'SELECT perks FROM userSettings WHERE displayname = ?', [displayNameParam], 5, (getErr, row) => {
                        if (getErr) {
                            // If the column doesn't exist yet, try to add it then proceed with empty array
                            if (getErr.message && getErr.message.toLowerCase().includes('no such column')) {
                                console.warn('Perks column missing, attempting to add it for', displayNameParam);
                                usdb.run("ALTER TABLE userSettings ADD COLUMN perks TEXT DEFAULT '[]'", [], (altErr) => {
                                    if (altErr) {
                                        console.error('Failed to add perks column:', altErr);
                                        return resParam.status(500).json({ error: 'db', message: altErr.message || String(altErr) });
                                    }
                                    // proceed assuming empty perks
                                    return processPerksArray([]);
                                });
                                return;
                            }
                            console.error('Failed to read perks for', displayNameParam, getErr);
                            return resParam.status(500).json({ error: 'db', message: getErr.message || String(getErr) });
                        }
                        let existingPerks = [];
                        try { existingPerks = row && row.perks ? JSON.parse(row.perks) : []; } catch (e) { existingPerks = []; }
                        return processPerksArray(existingPerks);
                    });
                } else {
                    // not a perk reward or not claiming a perk; respond with saved tiers only
                    return resParam.json({ tiers: reqParam.session.user.tiers });
                }
            } catch (e) {
                console.error('Error during post-tier processing for', displayNameParam, e);
                return resParam.status(500).json({ error: 'server' });
            }
        });
    }

// GET saved tiers (reads DB to confirm persisted data)
app.get('/api/perk-tiers', (req, res) => {
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    const displayName = req.session.user.displayName || req.session.user.displayname;
    const tiers = (req.session.user.tiers);
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
