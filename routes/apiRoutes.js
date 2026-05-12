const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { checkAuth } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// ======================================
// CONFIGURACIÓN MULTER
// ======================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            path.join(
                __dirname,
                '../public/img/productos'
            )
        );
    },

    filename: function (req, file, cb) {

        const uniqueSuffix =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1E9);

        cb(
            null,
            'prod-' +
            uniqueSuffix +
            path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage
});

// ======================================
// TODA LA API REQUIERE LOGIN
// ======================================

router.use(checkAuth);



// ======================================
// BUSCAR CLIENTE
// ======================================

router.get('/clientes/buscar/:cedula', async (req, res) => {

    try {

        const { cedula } = req.params;

        const [rows] = await db.execute(
            'SELECT * FROM clientes WHERE cedula = ?',
            [cedula]
        );

        if (rows.length > 0) {

            return res.json({
                success: true,
                cliente: rows[0]
            });
        }

        res.json({
            success: false,
            message: 'No encontrado'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });
    }
});



// ======================================
// EDITAR CLIENTE
// ======================================

router.post('/clientes/edit/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            cedula,
            telefono
        } = req.body;

        await db.execute(`
            UPDATE clientes
            SET nombre = ?, cedula = ?, telefono = ?
            WHERE id = ?
        `, [
            nombre,
            cedula,
            telefono,
            id
        ]);

        res.redirect('/clientes');

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



// ======================================
// ELIMINAR CLIENTE
// ======================================

router.delete('/clientes/:id', async (req, res) => {

    try {

        const { id } = req.params;

        await db.execute(
            'DELETE FROM clientes WHERE id = ?',
            [id]
        );

        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



// ======================================
// CREAR PRODUCTO
// ======================================

router.post('/productos', upload.single('imagen'), async (req, res) => {

    try {

        const {
            nombre,
            categoria,
            cantidad,
            precio,
            stock_minimo
        } = req.body;

        const imagen = req.file
            ? '/img/productos/' + req.file.filename
            : '';

        const qty = parseInt(cantidad) || 0;
        const prc = parseFloat(precio) || 0;
        const min_stock = parseInt(stock_minimo) || 10;

        await db.execute(`
            INSERT INTO productos
            (
                nombre,
                categoria,
                cantidad,
                precio,
                stock_minimo,
                imagen
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            nombre,
            categoria,
            qty,
            prc,
            min_stock,
            imagen
        ]);

        res.redirect('/inventory');

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



// ======================================
// EDITAR PRODUCTO
// ======================================

router.post('/productos/edit/:id', upload.single('imagen'), async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            categoria,
            cantidad,
            precio,
            stock_minimo
        } = req.body;

        const qty = parseInt(cantidad) || 0;
        const prc = parseFloat(precio) || 0;
        const min_stock = parseInt(stock_minimo) || 10;

        // CON IMAGEN
        if (req.file) {

            const imagen =
                '/img/productos/' +
                req.file.filename;

            await db.execute(`
                UPDATE productos
                SET
                    nombre = ?,
                    categoria = ?,
                    cantidad = ?,
                    precio = ?,
                    stock_minimo = ?,
                    imagen = ?
                WHERE id = ?
            `, [
                nombre,
                categoria,
                qty,
                prc,
                min_stock,
                imagen,
                id
            ]);

        } else {

            // SIN IMAGEN
            await db.execute(`
                UPDATE productos
                SET
                    nombre = ?,
                    categoria = ?,
                    cantidad = ?,
                    precio = ?,
                    stock_minimo = ?
                WHERE id = ?
            `, [
                nombre,
                categoria,
                qty,
                prc,
                min_stock,
                id
            ]);
        }

        res.redirect('/inventory');

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



// ======================================
// ELIMINAR PRODUCTO
// ======================================

router.delete('/productos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        // ======================================
        // ELIMINAR ALERTAS
        // ======================================

        await db.execute(`
            DELETE FROM alertastock
            WHERE producto_id = ?
        `, [id]);

        // ======================================
        // ELIMINAR MOVIMIENTOS
        // ======================================

        await db.execute(`
            DELETE FROM movimientos
            WHERE producto_id = ?
        `, [id]);

        // ======================================
        // ELIMINAR DETALLES DE VENTA
        // ======================================

        await db.execute(`
            DELETE FROM ticket_detalle
            WHERE producto_id = ?
        `, [id]);

        // ======================================
        // ELIMINAR PRODUCTO
        // ======================================

        await db.execute(`
            DELETE FROM productos
            WHERE id = ?
        `, [id]);

        res.json({
            success: true
        });

    } catch (error) {

        console.error(
            'Error eliminando producto:',
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



// ======================================
// PROCESAR VENTA
// ======================================

router.post('/ventas', async (req, res) => {

    try {

        const {
            cliente,
            carrito,
            total
        } = req.body;

        const usuario_id =
            req.session.user.id;

        // VALIDAR CARRITO
        if (
            !carrito ||
            carrito.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: 'Carrito vacío'
            });
        }

        let cliente_id;

        // ======================================
        // CLIENTE NUEVO
        // ======================================

        if (cliente.isNew) {

            const [result] = await db.execute(`
                INSERT INTO clientes
                (
                    cedula,
                    nombre,
                    telefono
                )
                VALUES (?, ?, ?)
            `, [
                cliente.cedula,
                cliente.nombre,
                cliente.telefono || ''
            ]);

            cliente_id =
                result.insertId;

        } else {

            cliente_id =
                cliente.id;
        }

        // ======================================
        // CREAR TICKET
        // ======================================

        const [ticketResult] = await db.execute(`
            INSERT INTO tickets
            (
                total,
                cliente_id,
                usuario_id
            )
            VALUES (?, ?, ?)
        `, [
            total,
            cliente_id,
            usuario_id
        ]);

        const ticket_id =
            ticketResult.insertId;

        // ======================================
        // RECORRER PRODUCTOS
        // ======================================

        for (const item of carrito) {

            // INSERTAR DETALLE
            await db.execute(`
                INSERT INTO ticket_detalle
                (
                    ticket_id,
                    producto_id,
                    cantidad,
                    precio,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)
            `, [
                ticket_id,
                item.id,
                item.cantidad,
                item.precio,
                item.cantidad * item.precio
            ]);

            // DESCONTAR STOCK
            await db.execute(`
                UPDATE productos
                SET cantidad = cantidad - ?
                WHERE id = ?
            `, [
                item.cantidad,
                item.id
            ]);

            // OBTENER PRODUCTO ACTUAL
            const [productoActual] = await db.execute(`
                SELECT
                    nombre,
                    cantidad,
                    stock_minimo
                FROM productos
                WHERE id = ?
            `, [
                item.id
            ]);

            const producto =
                productoActual[0];

            // VALIDAR STOCK BAJO
            if (
                producto.cantidad <=
                producto.stock_minimo
            ) {

                // VALIDAR ALERTA EXISTENTE
                const [alertaExistente] = await db.execute(`
                    SELECT id
                    FROM alertastock
                    WHERE producto_id = ?
                    AND estado = 'activa'
                `, [
                    item.id
                ]);

                // CREAR ALERTA
                if (
                    alertaExistente.length === 0
                ) {

                    await db.execute(`
                        INSERT INTO alertastock
                        (
                            producto_id,
                            mensaje
                        )
                        VALUES (?, ?)
                    `, [
                        item.id,
                        `Stock bajo para ${producto.nombre}`
                    ]);
                }
            }

            // REGISTRAR MOVIMIENTO
            await db.execute(`
                INSERT INTO movimientos
                (
                    producto_id,
                    usuario_id,
                    tipo_movimiento,
                    cantidad,
                    observacion
                )
                VALUES (?, ?, ?, ?, ?)
            `, [
                item.id,
                usuario_id,
                'venta',
                item.cantidad,
                'Venta realizada desde POS'
            ]);
        }

        // RESPUESTA EXITOSA
        res.json({
            success: true,
            ticket_id
        });

    } catch (error) {

        console.error(
            'Error venta:',
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;