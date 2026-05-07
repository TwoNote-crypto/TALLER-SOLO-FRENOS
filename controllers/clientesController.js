const db = require('../models/db');

const getClientes = (req, res) => {
    db.all('SELECT * FROM clientes ORDER BY id DESC', [], (err, clientes) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error de servidor");
        }
        res.render('clientes', { clientes });
    });
};

module.exports = {
    getClientes
};
