const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taller_solo_frenos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Conectado a MySQL correctamente.');

module.exports = pool;