const mariadb = require("mysql2");

// Create the connection to database

const connection = mariadb.createConnection({
    host: "localhost",
    user: "root",
    database: "Bookshop",
    password: "root1234",
    dateStrings: true,
});
module.exports = connection;
