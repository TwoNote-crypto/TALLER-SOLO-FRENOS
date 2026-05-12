const db = require('../models/db');

const getPOS = async (req, res) => {

    try {

        // PRODUCTOS DISPONIBLES
        const [productos] = await db.execute(`
            SELECT * FROM productos
            WHERE cantidad > 0
        `);

        res.render('pos', {
            productos
        });

    } catch (error) {

        console.error(
            'Error POS:',
            error
        );

        res.status(500).send(
            'Error cargando POS'
        );
    }
};

const getTicketView = async (req, res) => {

    try {

        const ticketId = req.params.id;

        // TICKET
        const [tickets] = await db.execute(`
            SELECT 
                t.*,
                c.nombre AS cliente_nombre,
                c.telefono,
                c.cedula,
                u.nombre AS vendedor
            FROM tickets t
            LEFT JOIN clientes c
            ON t.cliente_id = c.id
            LEFT JOIN usuarios u
            ON t.usuario_id = u.id
            WHERE t.id = ?
        `, [ticketId]);

        const ticket = tickets[0];

        // NO EXISTE
        if (!ticket) {

            return res.status(404).send(
                'Ticket no encontrado'
            );
        }

        // DETALLE
        const [detalles] = await db.execute(`
            SELECT 
                d.*,
                p.nombre AS producto_nombre
            FROM ticket_detalle d
            JOIN productos p
            ON d.producto_id = p.id
            WHERE d.ticket_id = ?
        `, [ticketId]);

        // RENDER
        res.render('ticket', {
            ticket,
            detalles
        });

    } catch (error) {

        console.error(
            'Error ticket:',
            error
        );

        res.status(500).send(
            'Error obteniendo ticket'
        );
    }
};

const getPublicTicket = async (req, res) => {

    try {

        const ticketId = req.params.id;

        // TICKET
        const [tickets] = await db.execute(`
            SELECT 
                t.*,
                c.nombre AS cliente_nombre,
                c.telefono,
                c.cedula,
                u.nombre AS vendedor
            FROM tickets t
            LEFT JOIN clientes c
            ON t.cliente_id = c.id
            LEFT JOIN usuarios u
            ON t.usuario_id = u.id
            WHERE t.id = ?
        `, [ticketId]);

        const ticket = tickets[0];

        // NO EXISTE
        if (!ticket) {

            return res.status(404).send(
                'Ticket no encontrado'
            );
        }

        // DETALLES
        const [detalles] = await db.execute(`
            SELECT 
                d.*,
                p.nombre AS producto_nombre
            FROM ticket_detalle d
            JOIN productos p
            ON d.producto_id = p.id
            WHERE d.ticket_id = ?
        `, [ticketId]);

        // RENDER
        res.render('ticket_public', {
            ticket,
            detalles
        });

    } catch (error) {

        console.error(
            'Error ticket público:',
            error
        );

        res.status(500).send(
            'Error obteniendo ticket'
        );
    }
};

module.exports = {
    getPOS,
    getTicketView,
    getPublicTicket
};
