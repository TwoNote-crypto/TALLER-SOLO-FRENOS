const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================
// CONFIGURAR EJS
// ======================================

app.set('view engine', 'ejs');

app.set(
    'views',
    path.join(__dirname, 'views')
);

// ======================================
// MIDDLEWARES
// ======================================

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(bodyParser.json());

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

// ======================================
// SESIONES
// ======================================

app.set('trust proxy', 1);

app.use(session({

    secret: 'solo-frenos-secret-key',

    resave: false,

    saveUninitialized: false,

    cookie: {

        secure: false,

        sameSite: 'lax',

        maxAge: 24 * 60 * 60 * 1000
    }
}));

// ======================================
// USUARIO GLOBAL EN VISTAS
// ======================================

app.use((req, res, next) => {

    res.locals.user = (
        req.session &&
        req.session.user
    )
        ? req.session.user
        : null;

    next();
});

// ======================================
// IMPORTAR RUTAS
// ======================================

const indexRoutes =
    require('./routes/indexRoutes');

const authRoutes =
    require('./routes/authRoutes');

const apiRoutes =
    require('./routes/apiRoutes');

// ======================================
// USAR RUTAS
// ======================================

app.use('/', indexRoutes);

app.use('/', authRoutes);

app.use('/api', apiRoutes);

// ======================================
// 404
// ======================================

app.use((req, res) => {

    res.status(404).render('404', {

        title: 'Página no encontrada'
    });
});

// ======================================
// INICIAR SERVIDOR
// ======================================

app.listen(
    PORT,
    '0.0.0.0',
    () => {

        console.log(
            `Servidor de Taller Solo Frenos corriendo en puerto ${PORT}`
        );
    }
);