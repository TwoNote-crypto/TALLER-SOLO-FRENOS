const db = require('../models/db');

const getMovimientos = async (req, res) => {

    try {

        const [movimientos] = await db.query(`
            SELECT
                m.id,
                p.nombre AS producto,
                u.nombre AS usuario,
                m.tipo_movimiento,
                m.cantidad,
                m.observacion,
                m.fecha_hora
            FROM movimientos m
            INNER JOIN productos p
                ON m.producto_id = p.id
            INNER JOIN usuarios u
                ON m.usuario_id = u.id
            ORDER BY m.fecha_hora DESC
        `);

        res.render('movimientos', {
            movimientos
        });

    } catch (error) {

        console.error(
            'Error movimientos:',
            error
        );

        res.status(500).send(
            'Error cargando movimientos'
        );
    }
};

module.exports = {
    getMovimientos
};