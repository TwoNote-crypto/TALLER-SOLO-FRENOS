const db = require('../models/db');

const getReportes = async (req, res) => {

    try {

        // ======================================
        // TOTAL VENTAS
        // ======================================

        const [ventas] = await db.execute(`
            SELECT
                COUNT(*) AS total_tickets,
                SUM(total) AS total_ventas
            FROM tickets
        `);

        // ======================================
        // PRODUCTOS MÁS VENDIDOS
        // ======================================

        const [productosVendidos] = await db.execute(`
            SELECT
                p.nombre,
                SUM(td.cantidad) AS total_vendido
            FROM ticket_detalle td
            INNER JOIN productos p
                ON td.producto_id = p.id
            GROUP BY td.producto_id
            ORDER BY total_vendido DESC
            LIMIT 5
        `);

        // ======================================
        // STOCK BAJO
        // ======================================

        const [stockBajo] = await db.execute(`
            SELECT
                nombre,
                cantidad,
                stock_minimo
            FROM productos
            WHERE cantidad <= stock_minimo
            ORDER BY cantidad ASC
        `);

        // ======================================
        // MOVIMIENTOS RECIENTES
        // ======================================

        const [movimientos] = await db.execute(`
            SELECT
                m.tipo_movimiento,
                m.cantidad,
                m.fecha_hora,
                p.nombre AS producto,
                u.nombre AS usuario
            FROM movimientos m
            INNER JOIN productos p
                ON m.producto_id = p.id
            INNER JOIN usuarios u
                ON m.usuario_id = u.id
            ORDER BY m.fecha_hora DESC
            LIMIT 10
        `);

        // ======================================
        // ALERTAS ACTIVAS
        // ======================================

        const [alertas] = await db.execute(`
            SELECT
                a.mensaje,
                a.fecha,
                p.nombre AS producto
            FROM alertastock a
            INNER JOIN productos p
                ON a.producto_id = p.id
            WHERE a.estado = 'activa'
            ORDER BY a.fecha DESC
        `);

        res.render('reportes', {

            ventas: ventas[0],

            productosVendidos,

            stockBajo,

            movimientos,

            alertas,

            page: 'reportes'
        });

    } catch (error) {

        console.error(
            'Error reportes:',
            error
        );

        res.status(500).send(
            'Error cargando reportes'
        );
    }
};

module.exports = {
    getReportes
};