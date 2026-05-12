const db = require('../models/db');

const getInventory = async (req, res) => {

    try {

        // OBTENER PRODUCTOS
        const [productos] = await db.execute(`
            SELECT * FROM productos
        `);

        // ESTADÍSTICAS
        const totalProductos = productos.length;

        const stockBajo = productos.filter(
            p => p.cantidad <= 10
        ).length;

        const valorInventario = productos.reduce(
            (acc, curr) =>
                acc + (curr.cantidad * curr.precio),
            0
        );

        // RENDER
        res.render('inventory', {
            productos,
            stats: {
                totalProductos,
                stockBajo,
                valorInventario
            }
        });

    } catch (error) {

        console.error(
            'Error inventario:',
            error
        );

        res.status(500).send(
            'Error cargando inventario'
        );
    }
};

module.exports = {
    getInventory
};