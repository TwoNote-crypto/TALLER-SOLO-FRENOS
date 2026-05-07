const db = require('../models/db');

const getInventory = (req, res) => {
    db.all('SELECT * FROM productos', (err, productos) => {
        if (err) return res.status(500).send("Error de DB");
        
        // Calcular estadisticas del inventario
        let totalProductos = productos.length;
        let stockBajo = productos.filter(p => p.cantidad <= 10).length;
        let valorInventario = productos.reduce((acc, curr) => acc + (curr.cantidad * curr.precio), 0);

        res.render('inventory', {
            productos,
            stats: { totalProductos, stockBajo, valorInventario }
        });
    });
};

module.exports = { getInventory };
