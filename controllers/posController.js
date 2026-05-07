const db = require('../models/db');

const getPOS = (req, res) => {
    db.all('SELECT * FROM productos WHERE cantidad > 0', (err, productos) => {
        if (err) return res.status(500).send("Error");
        res.render('pos', { productos });
    });
};

const getTicketView = (req, res) => {
    const ticketId = req.params.id;
    
    db.get(`
        SELECT t.*, c.nombre as cliente_nombre, c.telefono, c.cedula, u.nombre as vendedor
        FROM tickets t
        LEFT JOIN clientes c ON t.cliente_id = c.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE t.id = ?
    `, [ticketId], (err, ticket) => {
        if (err || !ticket) return res.status(404).send("Ticket no encontrado");

        db.all(`
            SELECT d.*, p.nombre as producto_nombre
            FROM ticket_detalle d
            JOIN productos p ON d.producto_id = p.id
            WHERE d.ticket_id = ?
        `, [ticketId], (err, detalles) => {
            if (err) return res.status(500).send("Error obteniendo detalle");
            
            res.render('ticket', { ticket, detalles });
        });
    });
};

const getPublicTicket = (req, res) => {
    const ticketId = req.params.id;
    
    db.get(`
        SELECT t.*, c.nombre as cliente_nombre, c.telefono, c.cedula, u.nombre as vendedor
        FROM tickets t
        LEFT JOIN clientes c ON t.cliente_id = c.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE t.id = ?
    `, [ticketId], (err, ticket) => {
        if (err || !ticket) return res.status(404).send("Ticket no encontrado");

        db.all(`
            SELECT d.*, p.nombre as producto_nombre
            FROM ticket_detalle d
            JOIN productos p ON d.producto_id = p.id
            WHERE d.ticket_id = ?
        `, [ticketId], (err, detalles) => {
            if (err) return res.status(500).send("Error obteniendo detalle");
            
            res.render('ticket_public', { ticket, detalles });
        });
    });
};

module.exports = { getPOS, getTicketView, getPublicTicket };
