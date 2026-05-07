const db = require('../models/db');
const bcrypt = require('bcrypt');

const login = (req, res) => {
    const usuario = req.body.usuario ? req.body.usuario.trim() : '';
    const password = req.body.password ? req.body.password : '';
    
    console.log(`Intento de login con usuario: '${usuario}'`);

    db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (err, user) => {
        if (err) {
            console.error("Error DB:", err);
            return res.status(500).json({ success: false, message: 'Error de servidor' });
        }
        if (!user) {
            console.log("Usuario no encontrado en la DB.");
            return res.render('login', { error: 'Usuario no encontrado' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            console.log("Login exitoso. Redirigiendo a dashboard...");
            req.session.user = {
                id: user.id,
                nombre: user.nombre,
                usuario: user.usuario
            };
            req.session.save((err) => {
                res.redirect('/dashboard');
            });
        } else {
            console.log("Contraseña incorrecta.");
            res.render('login', { error: 'Contraseña incorrecta' });
        }
    });
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = {
    login,
    logout,
    checkAuth
};
