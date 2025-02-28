const mysql = require('mysql');
const util = require('util');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: false
});

// Convert pool.query to use promises
const dbQuery = util.promisify(pool.query).bind(pool);

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
    } else {
        console.log('Connected to MySQL as id', connection.threadId);
        connection.release(); // Release connection back to the pool
    }
});

// Keep connection alive
// setInterval(async () => {
//     try {
//         await dbQuery('SELECT 1');
//         console.log('Keeping MySQL connection alive');
//     } catch (error) {
//         console.error('Error keeping connection alive:', error.message);
//     }
// }, 30000); // Run every 30 seconds

module.exports = dbQuery;