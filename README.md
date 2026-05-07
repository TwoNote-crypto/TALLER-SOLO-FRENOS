# Taller Solo Frenos - Sistema POS

Este es el sistema de Punto de Venta (POS) y panel administrativo para "Taller Solo Frenos".

## Requisitos Previos

Para ejecutar este proyecto, necesitas tener instalado **Node.js** en tu sistema Windows.
Puedes descargarlo desde: https://nodejs.org/ (Se recomienda la versión LTS).

## Instrucciones de Instalación y Ejecución

1. Abre una terminal (Símbolo del sistema o PowerShell) en esta carpeta (`PROYECTO TALLER 2.0`).
2. Instala las dependencias necesarias ejecutando:
   ```bash
   npm install
   ```
3. Inicializa la base de datos (creará el archivo `database.sqlite` con datos de prueba):
   ```bash
   npm run init-db
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```
5. Abre tu navegador web y visita: `http://localhost:3000`

## Credenciales de Acceso (Administrador)
- **Usuario:** `admin_taller`
- **Contraseña:** `admin123`

## Funcionalidades
- **Landing Page Pública.**
- **Login Seguro** con sesiones y bcrypt.
- **Panel Administrativo (Dashboard)** oscuro y moderno.
- **Inventario** de productos.
- **Punto de Venta (POS)** con búsqueda de clientes, carrito de compras y generación de tickets.
- Base de datos SQLite integrada, no requiere instalación de motor extra.
