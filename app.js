let carrito = [];
const numeroDueno = "5215551234567"; // CAMBIA ESTO POR EL NÚMERO DEL DUEÑO

// 1. Navegación por pestañas
function cambiarTab(idSeccion) {
    document.querySelectorAll('.categoria-seccion').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(idSeccion).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 2. Control de Cantidades (Asegura el mínimo de piezas)
function cambiarCantidad(inputId, cambio, minimo) {
    let input = document.getElementById(inputId);
    let valorActual = parseInt(input.value);
    let nuevoValor = valorActual + cambio;
    
    if (nuevoValor >= minimo) {
        input.value = nuevoValor;
    } else {
        alert("La cantidad mínima para este producto es de " + minimo + " piezas.");
    }
}

// 3. Manejo del Carrito
function agregarAlCarrito(nombre, precio, idCantidad, idDetalle) {
    let cantidad = parseInt(document.getElementById(idCantidad).value);
    let detalle = document.getElementById(idDetalle).value || "Sin detalle";
    
    let subtotal = precio * cantidad;
    
    carrito.push({ nombre, cantidad, detalle, precio, subtotal });
    
    alert(`¡${cantidad}x ${nombre} agregado al carrito!`);
    actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
    let total = 0;
    let listaHTML = "";
    
    carrito.forEach((item, index) => {
        total += item.subtotal;
        listaHTML += `<li><strong>${item.cantidad}x ${item.nombre}</strong><br><small>Ref: ${item.detalle}</small><br><small>Sub: $${item.subtotal.toFixed(2)}</small></li>`;
    });
    
    document.getElementById("fab-total").innerText = "$" + total.toFixed(2);
    document.getElementById("modal-total").innerText = "$" + total.toFixed(2);
    document.getElementById("lista-carrito").innerHTML = listaHTML;
}

// 4. Modal
function abrirModal() {
    if(carrito.length === 0) return alert("Tu carrito está vacío.");
    document.getElementById("modal-carrito").style.display = "block";
}
function cerrarModal() {
    document.getElementById("modal-carrito").style.display = "none";
}

// 5. Procesar Pedido (PDF + WhatsApp)
async function procesarPedido() {
    let nombreCliente = document.getElementById("nombre_cliente").value;
    if (!nombreCliente) return alert("Por favor, escribe tu nombre para el pedido.");
    
    let totalTxt = document.getElementById("modal-total").innerText;
    
    // Preparar el HTML oculto para el PDF
    document.getElementById("pdf-cliente").innerText = nombreCliente;
    document.getElementById("pdf-total").innerText = totalTxt;
    
    let pdfLista = "";
    let textoWhatsApp = `✨ *¡Hola Minuit! Nuevo pedido* ✨\n\n*Cliente:* ${nombreCliente}\n\n*Detalles:*\n`;
    
    carrito.forEach(item => {
        // Llenado para PDF
        pdfLista += `<li style="margin-bottom: 10px;"><strong>${item.cantidad}x ${item.nombre}</strong> - ${item.detalle} <span style="float:right;">$${item.subtotal.toFixed(2)}</span></li>`;
        // Llenado para WhatsApp
        textoWhatsApp += `▪️ ${item.cantidad}x ${item.nombre} (${item.detalle}) - $${item.subtotal.toFixed(2)}\n`;
    });
    
    document.getElementById("pdf-lista").innerHTML = pdfLista;
    textoWhatsApp += `\n💰 *Total: ${totalTxt}*\n\nQuedo a la espera de los datos de transferencia.`;

    // Generar y descargar PDF
    const elementoPDF = document.getElementById("contenedor-pdf");
    const opcionesPDF = {
        margin: 10,
        filename: `Pedido_Minuit_${nombreCliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Mostramos temporalmente, tomamos foto, y volvemos a ocultar (necesario para html2pdf)
    elementoPDF.style.left = "0";
    elementoPDF.style.position = "relative";
    
    html2pdf().set(opcionesPDF).from(elementoPDF).save().then(() => {
        elementoPDF.style.position = "absolute";
        elementoPDF.style.left = "-9999px";
        
        // Redirigir a WhatsApp después de guardar el PDF
        let textoCodificado = encodeURIComponent(textoWhatsApp);
        window.open(`https://wa.me/${numeroDueno}?text=${textoCodificado}`, '_blank');
        
        // Limpiar carrito
        carrito = [];
        actualizarVistaCarrito();
        cerrarModal();
    });
}
