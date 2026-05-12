const db = require('../models/db');

const getClientes = async (req, res) => {

    try {

        // OBTENER CLIENTES
        const [clientes] = await db.execute(`
            SELECT * FROM clientes
            ORDER BY id DESC
        `);

        // RENDER
        res.render('clientes', {
            clientes
        });

    } catch (error) {

        console.error(
            'Error clientes:',
            error
        );

        res.status(500).send(
            'Error cargando clientes'
        );
    }
};

module.exports = {
    getClientes
};