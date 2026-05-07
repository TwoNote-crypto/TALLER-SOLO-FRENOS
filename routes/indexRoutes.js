const express = require('express');
const router = express.Router();
const { checkAuth } = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const inventoryController = require('../controllers/inventoryController');
const posController = require('../controllers/posController');
const clientesController = require('../controllers/clientesController');

// Landing page (Pública)
router.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('landing');
});

// Rutas protegidas (Requieren autenticación)
router.get('/dashboard', checkAuth, dashboardController.getDashboard);
router.get('/inventory', checkAuth, inventoryController.getInventory);
router.get('/pos', checkAuth, posController.getPOS);
router.get('/ticket/:id', checkAuth, posController.getTicketView);
router.get('/ticket/public/:id', posController.getPublicTicket);
router.get('/clientes', checkAuth, clientesController.getClientes);

module.exports = router;
