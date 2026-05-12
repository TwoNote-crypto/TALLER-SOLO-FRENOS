const db = require('./models/db');
const bcrypt = require('bcrypt');

const initDatabase = async () => {
    try {
        // Tabla usuarios
        await db.query(`CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            usuario VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'vendedor'
        )`);

        // Tabla clientes
        await db.query(`CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cedula VARCHAR(50) UNIQUE NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            telefono VARCHAR(50)
        )`);

        // Tabla productos
        await db.query(`CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            categoria VARCHAR(100) NOT NULL,
            cantidad INT NOT NULL DEFAULT 0,
            precio DECIMAL(10,2) NOT NULL,
            stock_minimo INT NOT NULL DEFAULT 10,
            imagen TEXT
        )`);

        // Tabla tickets
        await db.query(`CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            total DECIMAL(10,2) NOT NULL,
            cliente_id INT,
            usuario_id INT,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        )`);

        // Tabla ticket_detalle
        await db.query(`CREATE TABLE IF NOT EXISTS ticket_detalle (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            producto_id INT NOT NULL,
            cantidad INT NOT NULL,
            precio DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
        )`);

        // Tabla movimientos
        await db.query(`CREATE TABLE IF NOT EXISTS movimientos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT NOT NULL,
            usuario_id INT,
            tipo_movimiento VARCHAR(50) NOT NULL,
            cantidad INT NOT NULL,
            observacion TEXT,
            fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        )`);

        // Tabla alertastock
        await db.query(`CREATE TABLE IF NOT EXISTS alertastock (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT NOT NULL,
            mensaje TEXT NOT NULL,
            estado VARCHAR(50) DEFAULT 'activa',
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
        )`);

        console.log('Tablas de MySQL creadas correctamente.');

        // Insertar usuario admin si no existe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const [rows] = await db.query("SELECT id FROM usuarios WHERE usuario = ?", ['admin_taller']);
        if (rows.length === 0) {
            await db.query("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)", 
                ['Admin Principal', 'admin_taller', hashedPassword, 'admin']
            );
            console.log("Usuario administrador creado (Usuario: admin_taller, Contraseña: admin123)");
        }

    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
    }
};

initDatabase().then(() => {
    console.log('Base de datos inicializada. Puedes iniciar el servidor.');
    process.exit(0);
});
