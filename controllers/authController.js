const db = require('../models/db');

const login = async (req, res) => {

    try {

        const usuario = req.body.usuario
            ? req.body.usuario.trim()
            : '';

        const password = req.body.password
            ? req.body.password
            : '';

        console.log(
            `Intento de login con usuario: '${usuario}'`
        );

        // CONSULTA MYSQL
        const [results] = await db.query(
            'SELECT * FROM usuarios WHERE usuario = ?',
            [usuario]
        );

        // USUARIO
        const user = results[0];

        // NO EXISTE
        if (!user) {

            return res.render('login', {
                error: 'Usuario no encontrado'
            });
        }

        // VALIDAR PASSWORD
        const match = password === user.password;

        // PASSWORD INCORRECTA
        if (!match) {

            return res.render('login', {
                error: 'Contraseña incorrecta'
            });
        }

        console.log('Login exitoso.');

        // GUARDAR SESIÓN
        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            usuario: user.usuario,
            rol: user.rol
        };

        // REDIRECT
        return res.redirect('/dashboard');

    } catch (error) {

        console.error(
            'Error login:',
            error
        );

        return res.status(500).send(
            'Error en login'
        );
    }
};

const logout = (req, res) => {

    if (req.session) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
};

const checkAuth = (req, res, next) => {

    if (req.session && req.session.user) {

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