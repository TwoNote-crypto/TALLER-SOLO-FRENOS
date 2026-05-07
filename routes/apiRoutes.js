const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { checkAuth } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para imágenes de productos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/img/productos'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prod-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Todas las llamadas a la API requieren autenticación (en un POS real)
router.use(checkAuth);

// Buscar cliente por cédula
router.get('/clientes/buscar/:cedula', (req, res) => {
    const { cedula } = req.params;
    db.get('SELECT * FROM clientes WHERE cedula = ?', [cedula], (err, row) => {
        if (err) return res.status(500).json({ success: false });
        if (row) return res.json({ success: true, cliente: row });
        res.json({ success: false, message: 'No encontrado' });
    });
});

// Editar cliente
router.post('/clientes/edit/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, cedula, telefono } = req.body;
    
    db.run('UPDATE clientes SET nombre=?, cedula=?, telefono=? WHERE id=?',
        [nombre, cedula, telefono, id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.redirect('/clientes');
        }
    );
});

// Eliminar cliente
router.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM clientes WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// Crear nuevo producto (con imagen)
router.post('/productos', upload.single('imagen'), (req, res) => {
    const { nombre, categoria, cantidad, precio, stock_minimo } = req.body;
    const imagen = req.file ? '/img/productos/' + req.file.filename : '';

    const qty = parseInt(cantidad) || 0;
    const prc = parseFloat(precio) || 0;
    const min_stock = parseInt(stock_minimo) || 10;

    db.run('INSERT INTO productos (nombre, categoria, cantidad, precio, stock_minimo, imagen) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, categoria, qty, prc, min_stock, imagen],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.redirect('/inventory'); // Recargar la página
        }
    );
});
// Editar producto (con o sin imagen)
router.post('/productos/edit/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, cantidad, precio, stock_minimo } = req.body;
    
    const qty = parseInt(cantidad) || 0;
    const prc = parseFloat(precio) || 0;
    const min_stock = parseInt(stock_minimo) || 10;

    if (req.file) {
        const imagen = '/img/productos/' + req.file.filename;
        db.run('UPDATE productos SET nombre=?, categoria=?, cantidad=?, precio=?, stock_minimo=?, imagen=? WHERE id=?',
            [nombre, categoria, qty, prc, min_stock, imagen, id],
            (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.redirect('/inventory');
            }
        );
    } else {
        db.run('UPDATE productos SET nombre=?, categoria=?, cantidad=?, precio=?, stock_minimo=? WHERE id=?',
            [nombre, categoria, qty, prc, min_stock, id],
            (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.redirect('/inventory');
            }
        );
    }
});

// Eliminar producto
router.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM productos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// Procesar Venta / Generar Ticket
router.post('/ventas', (req, res) => {
    const { cliente, carrito, subtotal, iva, total } = req.body;
    const usuario_id = req.session.user.id;

    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ success: false, message: "El carrito está vacío" });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const processTicket = (cliente_id) => {
            db.run('INSERT INTO tickets (total, cliente_id, usuario_id) VALUES (?, ?, ?)',
                [total, cliente_id, usuario_id],
                function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    const ticket_id = this.lastID;
                    
                    let count = 0;
                    let hasError = false;

                    carrito.forEach(item => {
                        db.run('INSERT INTO ticket_detalle (ticket_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)',
                            [ticket_id, item.id, item.cantidad, item.precio],
                            (err) => {
                                if(err) hasError = true;
                            }
                        );

                        // Descontar inventario
                        db.run('UPDATE productos SET cantidad = cantidad - ? WHERE id = ?',
                            [item.cantidad, item.id],
                            (err) => {
                                if(err) hasError = true;
                                count++;
                                
                                if (count === carrito.length) {
                                    if (hasError) {
                                        db.run('ROLLBACK');
                                        return res.status(500).json({ success: false });
                                    } else {
                                        db.run('COMMIT');
                                        return res.json({ success: true, ticket_id });
                                    }
                                }
                            }
                        );
                    });
                }
            );
        };

        // Si es cliente nuevo, lo creamos
        if (cliente.isNew) {
            db.run('INSERT INTO clientes (cedula, nombre, telefono) VALUES (?, ?, ?)',
                [cliente.cedula, cliente.nombre, cliente.telefono || ''],
                function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ success: false, message: 'Error creando cliente' });
                    }
                    processTicket(this.lastID);
                }
            );
        } else {
            // Cliente existente
            processTicket(cliente.id);
        }
    });
});

module.exports = router;
