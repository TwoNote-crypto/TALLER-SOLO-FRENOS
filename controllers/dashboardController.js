const db = require('../models/db');

const getDashboard = async (req, res) => {

    try {

        // VENTAS Y TICKETS
        const [ventas] = await db.query(`
            SELECT 
                SUM(total) AS ventasHoy,
                COUNT(*) AS ticketsGenerados
            FROM tickets
        `);

        // STOCK BAJO
        const [stock] = await db.query(`
            SELECT COUNT(*) AS stockBajo
            FROM productos
            WHERE cantidad <= 10
        `);

        // CLIENTES
        const [clientes] = await db.query(`
            SELECT COUNT(DISTINCT cliente_id) AS clientesAtendidos
            FROM tickets
        `);

        // TICKETS RECIENTES
        const [recientes] = await db.query(`
            SELECT 
                t.id,
                t.fecha,
                t.total,
                c.nombre AS cliente
            FROM tickets t
            LEFT JOIN clientes c
            ON t.cliente_id = c.id
            ORDER BY t.fecha DESC
            LIMIT 5
        `);

        const metrics = {
            ventasHoy: ventas[0].ventasHoy || 0,
            ticketsGenerados: ventas[0].ticketsGenerados || 0,
            stockBajo: stock[0].stockBajo || 0,
            clientesAtendidos: clientes[0].clientesAtendidos || 0
        };

        res.render('dashboard', {
            metrics,
            recientes
        });

    } catch (error) {

        console.error(
            'Error dashboard:',
            error
        );

        res.status(500).send(
            'Error cargando dashboard'
        );
    }
};

module.exports = {
    getDashboard
};
