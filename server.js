const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones (Optimizado para VPS y PM2)
app.set('trust proxy', 1);

app.use(session({
    secret: 'solo-frenos-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true si usas HTTPS con Nginx
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware global para pasar usuario a las vistas (con manejo de callbacks/undefined)
app.use((req, res, next) => {
    res.locals.user = (req.session && req.session.user) ? req.session.user : null;
    next();
});

// Importar rutas
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Usar rutas
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/api', apiRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Página no encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de Taller Solo Frenos corriendo en http://localhost:${PORT}`);
});