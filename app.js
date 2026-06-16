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
    const grosorSelect = document.getElementById("sel_grosor_base");
    const tamanoSelect = document.getElementById("sel_tamano_base");
    
    // Obtenemos los valores actuales
    const grosor = grosorSelect.value;
    const tamano = tamanoSelect.value;

    const precios = (linea === "Basic") ? basesBasicPrecios : basesPremiumPrecios;
    
    // 1. Actualizar textos de opciones en Tamaño
    Array.from(tamanoSelect.options).forEach(opt => {
        let precio = precios[grosor][opt.value];
        let nombreOriginal = opt.text.split(' - ')[0]; // Limpiamos nombre si ya tenía precio
        opt.text = `${nombreOriginal} - $${precio}`;
    });

    // 2. Actualizar textos de opciones en Grosor
    Array.from(grosorSelect.options).forEach(opt => {
        let precio = precios[opt.value][tamano];
        let nombreOriginal = opt.text.split(' - ')[0];
        opt.text = `${nombreOriginal} - $${precio}`;
    });

    // Actualizar precio grande y colores
    precioBaseActual = precios[grosor][tamano];
    document.getElementById("precio_config_base").innerText = `$${precioBaseActual.toFixed(2)} MXN`;

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

    // ==========================================
    // FORZAR RESETEO
    // ==========================================
    
    // 1. Reseteamos los valores de los selectores a sus opciones iniciales
    document.getElementById("sel_linea_base").selectedIndex = 0;
    document.getElementById("sel_grosor_base").selectedIndex = 0;
    document.getElementById("sel_tamano_base").selectedIndex = 0;
    document.getElementById("sel_forma_base").selectedIndex = 0;
    
    // 2. Reseteamos el contador de piezas al mínimo (1)
    document.getElementById("cant_base_config").value = "1"; 
    
    // 3. Ejecutamos la función de actualización para que el precio y los colores vuelvan al inicio
    actualizarConfiguradorBases();
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

// ===== GENERAR PDF DEFINITIVO Y ABRIR WHATSAPP =====
function procesarPedido() {
    let nombreCliente = document.getElementById("nombre_cliente").value;
    if (!nombreCliente) return mostrarAlerta("✏️ Por favor, escribe tu nombre.");
    
    mostrarAlerta("⏳ Generando tu nota de pedido...");
    
    let totalTxt = document.getElementById("modal-total").innerText;
    let pdfLista = "";
    
    let textoWhatsApp = `✨ *¡Hola Minuit! Nuevo pedido* ✨\n\n*Cliente:* ${nombreCliente}\n\n*Detalles:*\n`;
    
    carrito.forEach(item => {
        // Agregamos page-break-inside: avoid para que no parta los productos a la mitad
        pdfLista += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8dce5; padding: 15px 0; page-break-inside: avoid;">
                <div style="width: 75%;">
                    <strong style="color: #4a3b40; font-size: 16px; display: block; margin-bottom: 4px;">${item.cantidad}x ${item.nombre}</strong>
                    <span style="color: #9e7f8a; font-size: 13px;">Ref: ${item.detalle}</span>
                </div>
                <div style="width: 25%; text-align: right;">
                    <strong style="color: #e87b9e; font-size: 16px;">$${item.subtotal.toFixed(2)}</strong>
                </div>
            </div>
        `;
        textoWhatsApp += `▪️ ${item.cantidad}x ${item.nombre} (${item.detalle}) - $${item.subtotal.toFixed(2)}\n`;
    });
    
    textoWhatsApp += `\n💰 *Total: ${totalTxt}*\n\nQuedo a la espera de los datos de transferencia.`;

    // ==========================================
    // CREACIÓN DEL DISEÑO DEL PDF EN EL DOM
    // ==========================================
    const element = document.createElement('div');
    element.id = "pdf-temporal-minuit";
    
    // Estilos para que sea perfecto en PDF pero invisible para el usuario
    element.style.position = "absolute";
    element.style.top = "0";
    element.style.left = "-10000px"; // Escondido a la izquierda
    element.style.width = "800px";   // Ancho estricto
    element.style.padding = "40px";
    element.style.backgroundColor = "#ffffff";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.boxSizing = "border-box";

    element.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #f8dce5; padding-bottom: 20px; margin-bottom: 25px;">
            <h1 style="color: #e87b9e; font-size: 42px; margin: 0; font-family: 'Georgia', serif; font-style: italic;">Minuit</h1>
            <p style="color: #9e7f8a; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px; font-weight: bold;">Nota de Pedido</p>
        </div>

        <div style="background-color: #fdf0f4; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: flex; justify-content: space-between;">
            <div>
                <p style="margin: 0 0 5px 0; font-size: 16px; color: #4a3b40;"><strong>Cliente:</strong> ${nombreCliente}</p>
                <p style="margin: 0; font-size: 14px; color: #9e7f8a;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX')}</p>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; font-size: 14px; color: #9e7f8a;"><strong>Estado:</strong> Por transferir</p>
            </div>
        </div>

        <div style="margin-bottom: 30px;">
            ${pdfLista}
        </div>

        <div style="text-align: right; background-color: #fdf0f4; padding: 20px; border-radius: 12px; margin-bottom: 40px; page-break-inside: avoid;">
            <h2 style="margin: 0; color: #e87b9e; font-size: 28px;">Total a Pagar: ${totalTxt}</h2>
        </div>

        <div style="text-align: center; page-break-inside: avoid;">
            <p style="color: #9e7f8a; font-size: 14px;">¡Gracias por tu compra, Minuit!</p>
            <p style="color: #9e7f8a; font-size: 12px; margin-top: 5px;">Conserva este comprobante para tu referencia.</p>
        </div>
    `;

    // ¡CLAVE! Insertamos el elemento físicamente en la página para que la PC lo pueda ver
    document.body.appendChild(element);

    const opcionesPDF = {
        margin: [15, 10, 15, 10], // Márgenes superior, derecho, inferior, izquierdo
        filename: `Pedido_Minuit_${nombreCliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            width: 800, 
            windowWidth: 800,
            scrollY: 0, // ¡CLAVE! Ignora el scroll del cliente y toma la foto desde arriba
            scrollX: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Evita cortes a la mitad
    };

    html2pdf().set(opcionesPDF).from(element).save().then(() => {
        // Limpieza: Borramos la plantilla de la página para no dejar basura
        document.body.removeChild(element);
        
        let textoCodificado = encodeURIComponent(textoWhatsApp);
        window.open(`https://wa.me/${numeroDueno}?text=${textoCodificado}`, '_blank');
        
        carrito = [];
        actualizarVistaCarrito();
        cerrarModal();
        document.getElementById("nombre_cliente").value = "";
    });
}
