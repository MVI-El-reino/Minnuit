let carrito = [];
const numeroDueno = "522227125366"; // CAMBIA ESTO POR EL NÚMERO DEL DUEÑO

// 1. Tablas de precios
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

// Alertas Toasts
function mostrarAlerta(mensaje) {
    const contenedor = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = mensaje;
    contenedor.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// Navegación de pestañas
function cambiarTab(idSeccion) {
    document.querySelectorAll('.categoria-seccion').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(idSeccion).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Control de Cantidades individuales
function cambiarCantidad(inputId, cambio, minimo) {
    let input = document.getElementById(inputId);
    let valorActual = parseInt(input.value);
    let nuevoValor = valorActual + cambio;
    
    if (nuevoValor >= minimo) {
        input.value = nuevoValor;
    } else {
        mostrarAlerta(`⚠️ La cantidad mínima para este artículo es ${minimo}.`);
    }
}

// Configuración dinámica de bases
let precioBaseActual = 25; 
function inicializarBases() { actualizarConfiguradorBases(); }

function actualizarConfiguradorBases() {
    const linea = document.getElementById("sel_linea_base").value;
    const grosor = document.getElementById("sel_grosor_base").value;
    const tamano = document.getElementById("sel_tamano_base").value;

    const precios = (linea === "Basic") ? basesBasicPrecios : basesPremiumPrecios;
    precioBaseActual = precios[grosor][tamano];

    document.getElementById("precio_config_base").innerText = `$${precioBaseActual.toFixed(2)} MXN / u`;

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

    const nombreCompuesto = `Base ${linea} ${forma} ${grosor} ${tamano}`;
    const detalleCompuesto = `Logo: ${colorLogo}`;
    const subtotal = precioBaseActual * cantidad;

    carrito.push({ nombre: nombreCompuesto, cantidad, detalle: detalleCompuesto, precio: precioBaseActual, subtotal });
    mostrarAlerta(`🛒 ¡Agregado al carrito!`);
    actualizarVistaCarrito();
    animarBotónCarrito();
}

function agregarAlCarrito(nombre, precio, idCantidad, idDetalle) {
    let cantidad = parseInt(document.getElementById(idCantidad).value);
    let detalleTxt = document.getElementById(idDetalle).value || "Sin detalle";
    let subtotal = precio * cantidad;
    
    carrito.push({ nombre, cantidad, detalle: detalleTxt, precio, subtotal });
    mostrarAlerta(`🛒 ¡Agregado al carrito!`);
    actualizarVistaCarrito();
    animarBotónCarrito();
}

// Función para animar el botón del carrito
function animarBotónCarrito() {
    const fabCarrito = document.getElementById("fab-carrito");
    fabCarrito.classList.remove('con-items');
    void fabCarrito.offsetWidth;
    fabCarrito.classList.add('con-items');
}

// NUEVO: Eliminar un artículo específico del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    mostrarAlerta("❌ Artículo eliminado");
    actualizarVistaCarrito();
    
    if(carrito.length === 0) {
        cerrarModal();
    }
}

// MODIFICADO: Lógica de validación acumulada de 35 piezas
function actualizarVistaCarrito() {
    let totalDinero = 0;
    let totalPiezasBases = 0;
    let listaHTML = "";
    
    carrito.forEach((item, index) => {
        totalDinero += item.subtotal;
        
        if(item.nombre.includes("Base")) {
            totalPiezasBases += item.cantidad;
        }
        
        listaHTML += `
            <li>
                <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${index})">&times;</button>
                <strong>${item.cantidad}x ${item.nombre}</strong><br>
                <small>Ref: ${item.detalle}</small><br>
                <small>Sub: $${item.subtotal.toFixed(2)}</small>
            </li>`;
    });
    
    document.getElementById("fab-total").innerText = "$" + totalDinero.toFixed(2);
    document.getElementById("modal-total").innerText = "$" + totalDinero.toFixed(2);
    document.getElementById("lista-carrito").innerHTML = listaHTML;

    const btnPedido = document.querySelector(".btn-pedido");
    const alertaPiezas = document.getElementById("contador-piezas-alerta");

    if (totalPiezasBases < 35) {
        alertaPiezas.className = "texto-alerta-rojo";
        alertaPiezas.innerText = `⚠️ Llevas ${totalPiezasBases} bases de MDF. El mínimo acumulado para procesar fabricación es de 35 piezas.`;
        btnPedido.disabled = true;
    } else {
        alertaPiezas.className = "texto-valido-verde";
        alertaPiezas.innerText = `✅ ¡Súper! Llevas ${totalPiezasBases} bases acumuladas. Pedido autorizado.`;
        btnPedido.disabled = false;
    }
}

function abrirModal() {
    if(carrito.length === 0) return mostrarAlerta("🛍️ Tu carrito está vacío.");
    document.getElementById("modal-carrito").style.display = "block";
}
function cerrarModal() {
    document.getElementById("modal-carrito").style.display = "none";
}

// ===== GENERAR PDF CON jsPDF NATIVO (SIN html2canvas) =====
function procesarPedido() {
    let nombreCliente = document.getElementById("nombre_cliente").value;
    if (!nombreCliente) return mostrarAlerta("✏️ Por favor, escribe tu nombre.");
    
    mostrarAlerta("⏳ Generando tu nota de pedido...");
    
    // Importar jsPDF desde el CDN (ya está en index.html)
    const { jsPDF } = window.jspdf;
    
    // Crear documento PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Colores Minuit
    const colorRosa = [232, 123, 158];
    const colorTexto = [74, 59, 64];
    const colorGris = [158, 127, 138];
    const colorFondo = [253, 240, 244];
    
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margen = 20;
    
    // ===== ENCABEZADO =====
    doc.setFillColor(...colorFondo);
    doc.rect(margen, yPos, 170, 30, 'F');
    
    doc.setTextColor(...colorRosa);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("✨ MINUIT ✨", 105, yPos + 15, { align: 'center' });
    
    doc.setTextColor(...colorGris);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Resumen de Pedido", 105, yPos + 25, { align: 'center' });
    
    yPos += 40;
    
    // ===== DATOS DEL CLIENTE =====
    doc.setFillColor(...colorFondo);
    doc.rect(margen, yPos, 170, 18, 'F');
    
    doc.setTextColor(...colorTexto);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Cliente: ${nombreCliente}`, margen + 5, yPos + 7);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const fecha = new Date().toLocaleDateString('es-MX');
    doc.text(`Fecha: ${fecha}`, margen + 5, yPos + 13);
    
    yPos += 25;
    
    // ===== ENCABEZADO DE TABLA =====
    doc.setTextColor(...colorRosa);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCTO", margen + 5, yPos);
    doc.text("CANTIDAD", 120, yPos);
    doc.text("PRECIO", 160, yPos);
    
    // Línea divisoria
    doc.setDrawColor(...colorRosa);
    doc.setLineWidth(0.5);
    doc.line(margen, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    
    // ===== ITEMS DEL CARRITO =====
    doc.setTextColor(...colorTexto);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    let totalPedido = 0;
    
    carrito.forEach((item, index) => {
        // Verificar si necesita nueva página
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }
        
        // Nombre del producto
        doc.setFont("helvetica", "bold");
        doc.text(`${item.cantidad}x ${item.nombre}`, margen + 5, yPos);
        
        // Detalle
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colorGris);
        doc.setFontSize(8);
        doc.text(`Ref: ${item.detalle}`, margen + 5, yPos + 4);
        
        doc.setTextColor(...colorTexto);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(item.cantidad.toString(), 120, yPos);
        doc.text(`$${item.subtotal.toFixed(2)}`, 160, yPos, { align: 'right' });
        
        totalPedido += item.subtotal;
        yPos += 12;
    });
    
    // Línea final
    doc.setDrawColor(...colorRosa);
    doc.setLineWidth(1);
    doc.line(margen, yPos, 190, yPos);
    
    yPos += 10;
    
    // ===== TOTAL =====
    doc.setFillColor(...colorFondo);
    doc.rect(margen, yPos, 170, 15, 'F');
    
    doc.setTextColor(...colorRosa);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: $${totalPedido.toFixed(2)}`, 190, yPos + 9, { align: 'right' });
    
    yPos += 25;
    
    // ===== PIE DE PÁGINA =====
    doc.setTextColor(...colorGris);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("✅ ¡Gracias por tu compra, Minuit! 🌸", 105, yPos, { align: 'center' });
    doc.text("Conserva este comprobante para tu referencia.", 105, yPos + 5, { align: 'center' });
    
    // Guardar PDF
    doc.save(`Pedido_Minuit_${nombreCliente.replace(/\s+/g, '_')}.pdf`);
    
    // ===== ENVIAR A WHATSAPP =====
    let textoWhatsApp = `✨ *¡Hola Minuit! Nuevo pedido* ✨\n\n*Cliente:* ${nombreCliente}\n\n*Detalles:*\n`;
    
    carrito.forEach(item => {
        textoWhatsApp += `▪️ ${item.cantidad}x ${item.nombre} (${item.detalle}) - $${item.subtotal.toFixed(2)}\n`;
    });
    
    textoWhatsApp += `\n💰 *Total: $${totalPedido.toFixed(2)}*\n\nQuedo a la espera de los datos de transferencia.`;
    
    let textoCodificado = encodeURIComponent(textoWhatsApp);
    window.open(`https://wa.me/${numeroDueno}?text=${textoCodificado}`, '_blank');
    
    mostrarAlerta("✅ PDF descargado - WhatsApp abierto");
    
    // Limpiar carrito
    carrito = [];
    actualizarVistaCarrito();
    cerrarModal();
    document.getElementById("nombre_cliente").value = "";
}
