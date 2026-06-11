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
}

function agregarAlCarrito(nombre, precio, idCantidad, idDetalle) {
    let cantidad = parseInt(document.getElementById(idCantidad).value);
    let detalleTxt = document.getElementById(idDetalle).value || "Sin detalle";
    let subtotal = precio * cantidad;
    
    carrito.push({ nombre, cantidad, detalle: detalleTxt, precio, subtotal });
    mostrarAlerta(`🛒 ¡Agregado al carrito!`);
    actualizarVistaCarrito();
}

// NUEVO: Eliminar un artículo específico del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    mostrarAlerta("❌ Artículo eliminado");
    actualizarVistaCarrito();
    
    // Si vacían el carrito por completo, cerramos el modal automáticamente
    if(carrito.length === 0) {
        cerrarModal();
    }
}

// MODIFICADO: Lógica de validación acumulada de 35 piezas
function actualizarVistaCarrito() {
    let totalDinero = 0;
    let totalPiezasBases = 0; // Contamos solo piezas del catálogo que apliquen a la regla
    let listaHTML = "";
    
    carrito.forEach((item, index) => {
        totalDinero += item.subtotal;
        
        // Si el nombre contiene la palabra "Base", lo sumamos al contador de la regla
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

    // Control de la regla de negocio de las 35 piezas de bases
    const btnPedido = document.querySelector(".btn-pedido");
    const alertaPiezas = document.getElementById("contador-piezas-alerta");

    if (totalPiezasBases < 35) {
        alertaPiezas.className = "texto-alerta-rojo";
        alertaPiezas.innerText = `⚠️ Llevas ${totalPiezasBases} bases de MDF. El mínimo acumulado para procesar fabricación es de 35 piezas.`;
        btnPedido.disabled = true; // Bloquea el botón
    } else {
        alertaPiezas.className = "texto-valido-verde";
        alertaPiezas.innerText = `✅ ¡Súper! Llevas ${totalPiezasBases} bases acumuladas. Pedido autorizado.`;
        btnPedido.disabled = false; // Desbloquea el botón
    }
}

function abrirModal() {
    if(carrito.length === 0) return mostrarAlerta("🛍️ Tu carrito está vacío.");
    document.getElementById("modal-carrito").style.display = "block";
}
function cerrarModal() {
    document.getElementById("modal-carrito").style.display = "none";
}

// 8. Generar PDF y Redirigir a WhatsApp (VERSIÓN CORREGIDA)
async function procesarPedido() {
    let nombreCliente = document.getElementById("nombre_cliente").value;
    if (!nombreCliente) return mostrarAlerta("✏️ Por favor, escribe tu nombre.");
    
    mostrarAlerta("⏳ Generando tu nota de pedido...");
    
    let totalTxt = document.getElementById("modal-total").innerText;
    document.getElementById("pdf-cliente").innerText = nombreCliente;
    document.getElementById("pdf-total").innerText = totalTxt;
    
    let pdfLista = "";
    let textoWhatsApp = `✨ *¡Hola Minuit! Nuevo pedido* ✨\n\n*Cliente:* ${nombreCliente}\n\n*Detalles:*\n`;
    
    carrito.forEach(item => {
        pdfLista += `<li style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;"><strong>${item.cantidad}x ${item.nombre}</strong><br><small style="color: #666;">${item.detalle}</small><br><small style="color: #e87b9e;"><strong>$${item.subtotal.toFixed(2)}</strong></small></li>`;
        textoWhatsApp += `▪️ ${item.cantidad}x ${item.nombre} (${item.detalle}) - $${item.subtotal.toFixed(2)}\n`;
    });
    
    document.getElementById("pdf-lista").innerHTML = pdfLista;
    textoWhatsApp += `\n💰 *Total: ${totalTxt}*\n\nQuedo a la espera de los datos de transferencia.`;

    const elementoPDF = document.getElementById("contenedor-pdf");
    
    // OPCIONES CORREGIDAS PARA PDF - Soluciona el PDF blanco
    const opcionesPDF = {
        margin: [15, 15, 15, 15],
        filename: `Pedido_Minuit_${nombreCliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, // Aumentado para mejor calidad
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 800,
            windowHeight: 1200,
            logging: false,
            async: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Mostrar el contenedor para el renderizado
    elementoPDF.style.visibility = "visible";
    elementoPDF.style.position = "absolute";
    elementoPDF.style.top = "-10000px";
    elementoPDF.style.left = "0";
    
    // Generar PDF con mejor manejo de promesas
    html2pdf()
        .set(opcionesPDF)
        .from(elementoPDF)
        .save()
        .then(() => {
            // Ocultar nuevamente el contenedor
            elementoPDF.style.visibility = "hidden";
            elementoPDF.style.top = "0";
            
            // Redirigir a WhatsApp
            let textoCodificado = encodeURIComponent(textoWhatsApp);
            window.open(`https://wa.me/${numeroDueno}?text=${textoCodificado}`, '_blank');
            
            mostrarAlerta("✅ PDF generado y WhatsApp abierto");
            
            // Limpiamos el sistema para la siguiente compra
            carrito = [];
            actualizarVistaCarrito();
            cerrarModal();
            document.getElementById("nombre_cliente").value = "";
        })
        .catch((error) => {
            console.error("Error al generar PDF:", error);
            mostrarAlerta("❌ Error al generar PDF. Intenta nuevamente.");
            elementoPDF.style.visibility = "hidden";
        });
}
