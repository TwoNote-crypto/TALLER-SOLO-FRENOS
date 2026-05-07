const db = require('../models/db');
const bcrypt = require('bcrypt');

const login = (req, res) => {
    const usuario = req.body.usuario ? req.body.usuario.trim() : '';
    const password = req.body.password ? req.body.password : '';

    console.log(`Intento de login con usuario: '${usuario}'`);

    db.get(
        'SELECT * FROM usuarios WHERE usuario = ?',
        [usuario],
        async (err, user) => {

            // ERROR DE BASE DE DATOS
            if (err) {
                console.error("Error DB:", err);

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            // USUARIO NO EXISTE
            if (!user) {
                console.log("Usuario no encontrado en la DB.");

                return res.render('login', {
                    error: 'Usuario no encontrado'
                });
            }

            try {

                // VALIDAR PASSWORD
                const match = await bcrypt.compare(password, user.password);

                if (match) {

                    console.log("Login exitoso. Redirigiendo a dashboard...");

                    // GUARDAR SESIÓN
                    req.session.user = {
                        id: user.id,
                        nombre: user.nombre,
                        usuario: user.usuario
                    };

                    // GUARDAR Y REDIRIGIR
                    req.session.save((saveErr) => {

                        if (saveErr) {
                            console.error("Error guardando sesión:", saveErr);

                            return res.status(500).json({
                                success: false,
                                message: saveErr.message
                            });
                        }

                        return res.redirect('/dashboard');
                    });

                } else {

                    console.log("Contraseña incorrecta.");

                    return res.render('login', {
                        error: 'Contraseña incorrecta'
                    });
                }

            } catch (bcryptError) {

                console.error("Error bcrypt:", bcryptError);

                return res.status(500).json({
                    success: false,
                    message: bcryptError.message
                });
            }
        }
    );
};

const logout = (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.error("Error cerrando sesión:", err);
        }

        res.redirect('/login');
    });
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