const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const usdb = new sqlite3.Database('./data/usersettings.sqlite');
const {
    getPogCount,
    initializePogDatabase
} = require('../backend_data/pog_ref.js');

router.get('/marketplace', async (req, res) => {
    try {
        const [pogCount, results] = await Promise.all([
            getPogCount(),
            initializePogDatabase()
        ]);
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
        
        if (!err && row) {
            try {
                const inv = JSON.parse(row.inventory || '[]');
                
                req.session.user = req.session.user || {};
                req.session.user.inventory = Array.isArray(inv) ? inv : [];
            } catch (e) {
                console.log('Error parsing inventory from DB:', e);
                // leave session inventory as-is if parse fails
            }
        } else {
            console.log('No database row found or error occurred');
        }
        return res.render('marketplace', { userdata: req.session.user, maxPogs: pogCount, pogList: results });
    });
        } catch (error) {
            console.error("Error in marketplace route:", error);
            return res.status(500).send("Internal Server Error");
        }
});

module.exports = router;