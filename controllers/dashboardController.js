const db = require('../models/db');

const getDashboard = (req, res) => {
    // Para simplificar, hacemos conteos básicos
    db.serialize(() => {
        let metrics = {
            ventasHoy: 0,
            ticketsGenerados: 0,
            stockBajo: 0,
            clientesAtendidos: 0
        };

        // En un caso real, la fecha de hoy se calcularía con más precisión (between start of day and end of day)
        db.get('SELECT SUM(total) as ventasHoy, COUNT(*) as ticketsGenerados FROM tickets WHERE date(fecha) = date("now")', (err, row) => {
            if (row) {
                metrics.ventasHoy = row.ventasHoy || 0;
                metrics.ticketsGenerados = row.ticketsGenerados || 0;
            }
            
            db.get('SELECT COUNT(*) as stockBajo FROM productos WHERE cantidad <= 10', (err, rowStock) => {
                if (rowStock) metrics.stockBajo = rowStock.stockBajo || 0;

                db.get('SELECT COUNT(DISTINCT cliente_id) as clientesAtendidos FROM tickets', (err, rowClientes) => {
                    if (rowClientes) metrics.clientesAtendidos = rowClientes.clientesAtendidos || 0;

                    // Obtener ultimos 5 tickets
                    db.all(`
                        SELECT t.id, t.fecha, t.total, c.nombre as cliente
                        FROM tickets t
                        LEFT JOIN clientes c ON t.cliente_id = c.id
                        ORDER BY t.fecha DESC LIMIT 5
                    `, (err, recientes) => {
                        res.render('dashboard', { metrics, recientes });
                    });
                });
            });
        });
    });
};

module.exports = {
    getDashboard
};
