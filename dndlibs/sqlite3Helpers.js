/* This file was made because I find sqlite3 has a lot of complications in javascript
    with running commands asynchronously leading to lots of errors and messy messy
    code to fix them. One stackoverflow user called this "callback hell".

    This code fixes that problem by opening the database per call, (slow, I know)
    and running desired requests in serial. Each function is designed with await in mind.
*/

const sql = require('sqlite3').verbose();

/** Opens the database, executes the statement, closes the database, returns statement result as an iterable
 * @function execute
 * @param {String} statement The sql statement to run.
 * @param {...args} parameters The parameters used to replace ?'s in the statement
 */
async function execute(statement, ...args) {
    const db = new sql.Database('./dnd.db', sql.OPEN_READWRITE, err => {
        err ? console.log(err.message) : console.log("Database opened!")
        // ALL CODE SHOULD BE EXECUTED IN THIS CALLBACK
        db.all(statement, args, (err, row) => {
            if (err) console.log(err.message);
            else if (row) yield row;
            else return;
        });
    });
}

module.exports = {
    execute
};