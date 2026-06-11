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

// Función para animar el botón del carrito - BOUNCE EFFECT
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

// ===== GENERAR PDF - VERSIÓN CORREGIDA (SIN PDF BLANCO) =====
async function procesarPedido() {
    let nombreCliente = document.getElementById("nombre_cliente").value;
    if (!nombreCliente) return mostrarAlerta("✏️ Por favor, escribe tu nombre.");
    
    mostrarAlerta("⏳ Generando tu nota de pedido...");
    
    let totalTxt = document.getElementById("modal-total").innerText;
    
    // Construir HTML del PDF dinamicamente
    let pdfHTML = `
        <div style="font-family: Arial, sans-serif; color: #2d3436; max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e87b9e; padding-bottom: 15px;">
                <h1 style="color: #e87b9e; font-size: 28px; margin: 0; font-family: 'Dancing Script', cursive;">✨ Minuit ✨</h1>
                <h3 style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Resumen de Pedido</h3>
            </div>
            
            <div style="margin-bottom: 20px; padding: 10px; background: #fdf0f4; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold;"><strong>Cliente:</strong> ${nombreCliente}</p>
                <p style="margin: 5px 0 0 0; font-weight: bold;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX')}</p>
            </div>
            
            <h3 style="color: #4a3b40; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #fadbe4; padding-bottom: 8px;">Detalles de Productos</h3>
            
            <ul style="list-style: none; padding: 0; margin: 0;">
    `;
    
    carrito.forEach(item => {
        pdfHTML += `
            <li style="margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <strong style="font-size: 14px; color: #2d3436;">${item.cantidad}x ${item.nombre}</strong>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">${item.detalle}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #e87b9e; font-weight: bold; font-size: 14px;">$${item.subtotal.toFixed(2)}</div>
                    </div>
                </div>
            </li>
        `;
    });
    
    pdfHTML += `
            </ul>
            
            <div style="margin-top: 25px; padding-top: 15px; border-top: 2px solid #e87b9e; text-align: right;">
                <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">TOTAL:</p>
                <h2 style="color: #e87b9e; margin: 0; font-size: 24px;">${totalTxt}</h2>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fadbe4; text-align: center; font-size: 11px; color: #999;">
                <p style="margin: 0;">✅ ¡Gracias por tu compra, Minuit! 🌸</p>
                <p style="margin: 5px 0 0 0;">Conserva este comprobante para tu referencia.</p>
            </div>
        </div>
    `;
    
    // Crear elemento temporal para renderizar
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = pdfHTML;
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.padding = '40px';
    document.body.appendChild(tempContainer);
    
    // Esperar a que se renderice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Pedido_Minuit_${nombreCliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 800,
            windowHeight: 'auto',
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf()
        .set(opt)
        .from(tempContainer)
        .save()
        .then(() => {
            // Eliminar contenedor temporal
            document.body.removeChild(tempContainer);
            
            // Preparar mensaje WhatsApp
            let textoWhatsApp = `✨ *¡Hola Minuit! Nuevo pedido* ✨\n\n*Cliente:* ${nombreCliente}\n\n*Detalles:*\n`;
            carrito.forEach(item => {
                textoWhatsApp += `▪️ ${item.cantidad}x ${item.nombre} (${item.detalle}) - $${item.subtotal.toFixed(2)}\n`;
            });
            textoWhatsApp += `\n💰 *Total: ${totalTxt}*\n\nQuedo a la espera de los datos de transferencia.`;
            
            // Abrir WhatsApp
            let textoCodificado = encodeURIComponent(textoWhatsApp);
            window.open(`https://wa.me/${numeroDueno}?text=${textoCodificado}`, '_blank');
            
            mostrarAlerta("✅ PDF descargado - WhatsApp abierto");
            
            // Limpiar carrito
            carrito = [];
            actualizarVistaCarrito();
            cerrarModal();
            document.getElementById("nombre_cliente").value = "";
        })
        .catch((error) => {
            console.error("Error al generar PDF:", error);
            document.body.removeChild(tempContainer);
            mostrarAlerta("❌ Error al generar PDF. Intenta nuevamente.");
        });
}
