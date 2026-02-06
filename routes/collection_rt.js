const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const router = express.Router();
const usdb = new sqlite3.Database('./data/usersettings.sqlite');
const {
    getPogCount,
    getAllPogs
} = require('../backend_data/pog_ref.js');

// home page
router.get('/collection', async (req, res) => {
    try {
        const [pogCount, results] = await Promise.all([
            getPogCount(),
            getAllPogs()
        ]);
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
    } catch (error) {
        console.error("Error in collection route:", error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router