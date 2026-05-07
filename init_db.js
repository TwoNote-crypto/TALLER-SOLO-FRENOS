const db = require('./models/db');
const bcrypt = require('bcrypt');

const initDatabase = async () => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            // Tabla usuarios
            db.run(`CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                usuario TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);

            // Tabla clientes
            db.run(`CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cedula TEXT UNIQUE NOT NULL,
                nombre TEXT NOT NULL,
                telefono TEXT
            )`);

            // Tabla productos
            db.run(`CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                categoria TEXT NOT NULL,
                cantidad INTEGER NOT NULL DEFAULT 0,
                precio REAL NOT NULL,
                stock_minimo INTEGER NOT NULL DEFAULT 10,
                imagen TEXT DEFAULT ''
            )`);

            // Tabla tickets
            db.run(`CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                total REAL NOT NULL,
                cliente_id INTEGER,
                usuario_id INTEGER,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )`);

            // Tabla ticket_detalle
            db.run(`CREATE TABLE IF NOT EXISTS ticket_detalle (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_id INTEGER NOT NULL,
                producto_id INTEGER NOT NULL,
                cantidad INTEGER NOT NULL,
                precio REAL NOT NULL,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id),
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )`);

            console.log('Tablas creadas correctamente.');

            // Insertar usuario admin si no existe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            db.get("SELECT id FROM usuarios WHERE usuario = ?", ['admin_taller'], (err, row) => {
                if (!row) {
                    db.run("INSERT INTO usuarios (nombre, usuario, password) VALUES (?, ?, ?)", 
                        ['Admin Principal', 'admin_taller', hashedPassword],
                        (err) => {
                            if (err) console.error("Error al crear usuario admin:", err);
                            else console.log("Usuario administrador creado (Usuario: admin_taller, Contraseña: admin123)");
                        }
                    );
                }
            });

// Sin datos de prueba para productos. Sistema inicializado en cero.

            resolve();
        });
    });
};

initDatabase().then(() => {
    setTimeout(() => {
        db.close();
        console.log('Base de datos inicializada. Puedes iniciar el servidor.');
    }, 1000);
});
