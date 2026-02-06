const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');

const pogs = new sqlite3.Database("pogipedia/db/pog.db", (err) => {
    if (err) {
        console.error("Error connecting to pog database:", err.message);
    } else {
        console.log("Connected to pog database.");
    }
});

const headers = [
    'id', 'name', 'color', 'code', 'number', 'code2',
    'description', 'type', 'rarity', 'creator'
];

function initializePogDatabase() {
    const results = [];
    fs.createReadStream('pogipedia/db/pogs.csv')
        .pipe(csv({ headers }))
        .on('data', (row) => {
            const { id, name, color, description, rarity, creator } = row;
            results.push({ id, name, color, description, rarity, creator });
        })
        .on('end', () => {
        });
    }

function getPogCount() {
    return new Promise((resolve, reject) => {
        pogs.get(`SELECT COUNT(*) AS count FROM pogs`, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    });
}

function getAllPogs() {
    return new Promise((resolve, reject) => {
        pogs.all(`SELECT * FROM pogs`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    getPogCount,
    getAllPogs,
    initializePogDatabase
};
