// Sanity check. This works but the same code in one of my command files has
// issues with db methods being called out of order. I'm writing sqlite3Helpers.js
// to fix this.

const sql = require('sqlite3').verbose();

const db = new sql.Database('./dnd.db', sql.OPEN_READWRITE, err =>
    err ? console.log(err.message) : console.log("Database opened!")
);

db.get(`SELECT * FROM Users;`, (err, row) => {
    err ? console.log(err.message) : console.log("db.get: no error");
    console.log(row);
});