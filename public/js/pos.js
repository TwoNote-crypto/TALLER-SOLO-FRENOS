let carrito = [];
let clienteActual = null;

function addToCart(id) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    const nombre = card.dataset.nombre;
    const precio = parseFloat(card.dataset.precio);

    const existe = carrito.find(item => item.id === id);
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    renderCart();
}

function removeFromCart(id) {
    carrito = carrito.filter(item => item.id !== id);
    renderCart();
}

function updateQuantity(id, change) {
    const item = carrito.find(i => i.id === id);
    if (item) {
        item.cantidad += change;
        if (item.cantidad <= 0) {
            removeFromCart(id);
        } else {
            renderCart();
        }
    }
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    
    if (carrito.length === 0) {
        cartContainer.innerHTML = '<div style="text-align:center; color:#555; margin-top:50px;">El carrito está vacío</div>';
        actualizarTotales(0, 0, 0);
        return;
    }

    let html = '';
    let subtotal = 0;

    carrito.forEach(item => {
        const itemTotal = item.cantidad * item.precio;
        subtotal += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <div class="cart-controls">
                        <button class="cart-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.cantidad}</span>
                        <button class="cart-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="cart-btn" style="color:var(--primary-red);" onclick="removeFromCart(${item.id})">🗑</button>
                    </div>
                </div>
                <div class="cart-item-total">$${itemTotal.toLocaleString('es-CO')}</div>
            </div>
        `;
    });

    cartContainer.innerHTML = html;
    
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    actualizarTotales(subtotal, iva, total);
}

function actualizarTotales(subtotal, iva, total) {
    document.getElementById('subtotal').innerText = `$${subtotal.toLocaleString('es-CO')}`;
    document.getElementById('iva').innerText = `$${iva.toLocaleString('es-CO')}`;
    document.getElementById('total').innerText = `$${total.toLocaleString('es-CO')}`;
    
    // Guardar para el POST
    window.totalesCalculados = { subtotal, iva, total };
}

function buscarCliente() {
    const cedula = document.getElementById('cedula').value.trim();
    if (!cedula) return alert("Ingrese una cédula");

    fetch(`/api/clientes/buscar/${cedula}`)
        .then(res => res.json())
        .then(data => {
            const infoDiv = document.getElementById('client-info');
            infoDiv.style.display = 'block';
            
            if (data.success) {
                clienteActual = data.cliente;
                infoDiv.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:50%; background:#444; display:flex; align-items:center; justify-content:center;">👤</div>
                        <div>
                            <div style="font-weight:bold; color:white;">${clienteActual.nombre}</div>
                            <div style="font-size:0.8rem; color:#888;">C.C: ${clienteActual.cedula}</div>
                        </div>
                    </div>
                `;
            } else {
                clienteActual = { isNew: true, cedula };
                infoDiv.innerHTML = `
                    <div style="color:var(--warning); margin-bottom:10px; font-size:0.8rem;">Cliente no encontrado. Se creará uno nuevo.</div>
                    <input type="text" id="nuevo_nombre" placeholder="Nombre completo" style="width:100%; padding:8px; margin-bottom:5px; background:#111; border:1px solid #444; color:white; border-radius:4px;">
                    <input type="text" id="nuevo_telefono" placeholder="Teléfono" style="width:100%; padding:8px; background:#111; border:1px solid #444; color:white; border-radius:4px;">
                `;
            }
        });
}

function generarTicket() {
    if (carrito.length === 0) return alert("Agregue productos al carrito");
    
    if (clienteActual && clienteActual.isNew) {
        const nombre = document.getElementById('nuevo_nombre').value.trim();
        const telefono = document.getElementById('nuevo_telefono').value.trim();
        if(!nombre) return alert("Ingrese el nombre del nuevo cliente");
        clienteActual.nombre = nombre;
        clienteActual.telefono = telefono;
    } else if (!clienteActual) {
        // Por defecto crear consumidor final
        clienteActual = { isNew: true, cedula: '9999999999', nombre: 'Consumidor Final', telefono: '' };
    }

    const payload = {
        cliente: clienteActual,
        carrito: carrito,
        ...window.totalesCalculados
    };

    fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            window.location.href = `/ticket/${data.ticket_id}`;
        } else {
            alert("Error al procesar la venta: " + data.message);
        }
    });
}

// Lógica de Filtros por Categoría
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const categoria = btn.innerText.trim();

            productCards.forEach(card => {
                if (categoria === 'Todos' || card.dataset.categoria === categoria) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
