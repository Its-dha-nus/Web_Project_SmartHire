const mysql = require('mysql2/promise');
const fs = require('fs'); // Built-in Node module to read files
const path = require('path');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        // This reads the Aiven security certificate you just downloaded
        ca: fs.readFileSync(path.join(__dirname, '../ca.pem')) 
    }
});

module.exports = pool;