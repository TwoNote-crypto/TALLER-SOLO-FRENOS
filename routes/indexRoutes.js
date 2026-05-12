const express = require('express');
const router = express.Router();

const { checkAuth } = require('../controllers/authController');

const dashboardController = require('../controllers/dashboardController');

const inventoryController = require('../controllers/inventoryController');

const posController = require('../controllers/posController');

const movimientosController = require('../controllers/movimientosController');

const clientesController = require('../controllers/clientesController');

const reportesController = require('../controllers/reportesController');


// ======================================
// LANDING PAGE
// ======================================

router.get('/', (req, res) => {

    if (req.session.user) {

        return res.redirect('/dashboard');
    }

    res.render('landing');
});


// ======================================
// DASHBOARD
// ======================================

router.get(
    '/dashboard',
    checkAuth,
    dashboardController.getDashboard
);


// ======================================
// INVENTARIO
// ======================================

router.get(
    '/inventory',
    checkAuth,
    inventoryController.getInventory
);


// ======================================
// POS / VENTAS
// ======================================

router.get(
    '/pos',
    checkAuth,
    posController.getPOS
);


// ======================================
// TICKETS
// ======================================

router.get(
    '/ticket/:id',
    checkAuth,
    posController.getTicketView
);

router.get(
    '/ticket/public/:id',
    posController.getPublicTicket
);


// ======================================
// CLIENTES
// ======================================

router.get(
    '/clientes',
    checkAuth,
    clientesController.getClientes
);


// ======================================
// MOVIMIENTOS INVENTARIO
// ======================================

router.get(
    '/movimientos',
    checkAuth,
    movimientosController.getMovimientos
);


// ======================================
// REPORTES
// ======================================

router.get(
    '/reportes',
    checkAuth,
    reportesController.getReportes
);


module.exports = router;