const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('login', { error: null });
});

router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
