let carrito = [];
const numeroDueno = "5215551234567"; // CAMBIA ESTO POR EL NÚMERO DEL DUEÑO

// 1. Tablas de precios de las imágenes adjuntas
const basesBasicPrecios = {
    "3MM": { "15cm": 25, "20cm": 35, "23cm": 38, "25cm": 40, "28cm": 45, "30cm": 50, "35cm": 65, "40cm": 80, "45cm": 110, "50cm": 125 },
    "6MM": { "15cm": 35, "20cm": 45, "23cm": 50, "25cm": 65, "28cm": 75, "30cm": 90, "35cm": 110, "40cm": 130, "45cm": 150, "50cm": 180 },
    "9MM": { "15cm": 50, "20cm": 60, "23cm": 75, "25cm": 85, "28cm": 110, "30cm": 140, "35cm": 160, "40cm": 190, "45cm": 220, "50cm": 250 }
};

const basesPremiumPrecios = {
    "3MM": { "15cm": 33, "20cm": 45, "23cm": 48, "25cm": 55, "28cm": 60, "30cm": 65, "35cm": 80, "40cm": 100, "45cm": 125, "50cm": 145 },
    "6MM": { "15cm": 53, "20cm": 60, "23cm": 70, "25cm": 78, "28cm": 90, "30cm": 105, "35cm": 125, "40cm": 145, "45cm": 170, "50cm": 200 },
    "9MM": { "15cm": 60, "20cm": 75, "23cm": 85, "25cm": 95, "28cm": 120, "30cm": 150, "35cm": 170, "40cm": 200, "45cm": 230, "50cm": 260 }
};

const coloresLogotipo = {
    "Basic": ["dorado", "rosa pastel", "rosa mexicano", "azul cielo", "negro", "jade", "tornasol"],
    "Premium": ["blanco", "dorado", "negro"]
};

// 2. Navegación por pestañas
function cambiarTab(idSeccion) {
    document.querySelectorAll('.categoria-seccion').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(idSeccion).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 3. Control de Cantidades (Asegura el mínimo de piezas)
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

// 4. Lógica Dinámica del Configurador de Bases
let precioBaseActual = 25; // Precio inicial por defecto

function inicializarBases() {
    actualizarConfiguradorBases();
}

function actualizarConfiguradorBases() {
    const linea = document.getElementById("sel_linea_base").value;
    const grosor = document.getElementById("sel_grosor_base").value;
    const tamano = document.getElementById("sel_tamano_base").value;

    // Buscar precio unitario
    const precios = (linea === "Basic") ? basesBasicPrecios : basesPremiumPrecios;
    precioBaseActual = precios[grosor][tamano];

    // Actualizar precio en pantalla
    document.getElementById("precio_config_base").innerText = `$${precioBaseActual.toFixed(2)} MXN / u`;

    // Actualizar opciones de color de logotipo
    const selectColor = document.getElementById("sel_color_logo_base");
    selectColor.innerHTML = "";
    coloresLogotipo[linea].forEach(color => {
        let option = document.createElement("option");
        option.value = color;
        option.text = color.charAt(0).toUpperCase() + color.slice(1);
        selectColor.add(option);
    });
}

function agregarBaseConfigAlCarrito() {
    const linea = document.getElementById("sel_linea_base").value;
    const grosor = document.getElementById("sel_grosor_base").value;
    const tamano = document.getElementById("sel_tamano_base").value;
    const forma = document.getElementById("sel_forma_base").value;
    const colorLogo = document.getElementById("sel_color_logo_base").value;
    const cantidad = parseInt(document.getElementById("cant_base_config").value);

    // Crear nombre compuesto para el carrito y WhatsApp
    const nombreCompuesto = `Base ${linea} ${forma} ${grosor} ${tamano}`;
    const detalleCompuesto = `Color Logo: ${colorLogo}`;
    const subtotal = precioBaseActual * cantidad;

    carrito.push({
        nombre: nombreCompuesto,
        cantidad: cantidad,
        detalle: detalleCompuesto,
        precio: precioBaseActual,
        subtotal: subtotal
    });

    alert(`¡${cantidad}x ${nombreCompuesto} agregado al carrito!`);
    actualizarVistaCarrito();
}

// 5. Manejo General del Carrito
function agregarAlCarrito(nombre, precio, idCantidad, idDetalle) {
    let cantidad = parseInt(document.getElementById(idCantidad).value);
    let detalleTxt = document.getElementById(idDetalle).value || "Sin detalle";
    
    let subtotal = precio * cantidad;
    
    carrito.push({ nombre, cantidad, detalle: detalleTxt, precio, subtotal });
    
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

// 6. Modal
function abrirModal() {
    if(carrito.length === 0) return alert("Tu carrito está vacío.");
    document.getElementById("modal-carrito").style.display = "block";
}
function cerrarModal() {
    document.getElementById("modal-carrito").style.display = "none";
}

// 7. Procesar Pedido (PDF + WhatsApp con detalles completos)
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
        // Llenado para WhatsApp (con detalles completos de configuración)
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
