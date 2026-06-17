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
// ===== GENERAR PDF DEFINITIVO Y ABRIR WHATSAPP =====
async function procesarPedido() {

    let nombreCliente = document.getElementById("nombre_cliente").value.trim();

    if (!nombreCliente) {
        return mostrarAlerta("✏️ Por favor, escribe tu nombre.");
    }

    if (carrito.length === 0) {
        return mostrarAlerta("🛒 Tu carrito está vacío.");
    }

    mostrarAlerta("⏳ Generando nota de pedido...");

    let totalTxt = document.getElementById("modal-total").innerText;

    let pdfLista = "";

    let textoWhatsApp =
`✨ *¡Hola Minuit! Nuevo pedido* ✨

*Cliente:* ${nombreCliente}

*Detalles:*
`;

    carrito.forEach(item => {

        pdfLista += `
            <div style="
                border-bottom:1px solid #f8dce5;
                padding:12px 0;
            ">
                <div>
                    <strong>
                        ${item.cantidad}x ${item.nombre}
                    </strong>
                </div>

                <div style="
                    color:#9e7f8a;
                    font-size:13px;
                    margin-top:4px;
                ">
                    Ref: ${item.detalle}
                </div>

                <div style="
                    color:#e87b9e;
                    font-weight:bold;
                    margin-top:6px;
                ">
                    $${item.subtotal.toFixed(2)}
                </div>
            </div>
        `;

        textoWhatsApp +=
`▪️ ${item.cantidad}x ${item.nombre} (${item.detalle}) - $${item.subtotal.toFixed(2)}
`;
    });

    textoWhatsApp += `

💰 *Total:* ${totalTxt}

Quedo a la espera de los datos de transferencia.
`;

    // ==========================================
    // CREAR CONTENEDOR PDF
    // ==========================================

    const element = document.createElement("div");

    element.id = "pdf-temporal-minuit";

    element.style.position = "fixed";
    element.style.top = "50px";
    element.style.left = "50px";
    element.style.width = "800px";
    element.style.padding = "40px";
    element.style.backgroundColor = "#ffffff";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.boxSizing = "border-box";
    element.style.zIndex = "999999";

    element.innerHTML = `
        <div style="
            text-align:center;
            border-bottom:2px solid #f8dce5;
            padding-bottom:20px;
            margin-bottom:25px;
        ">
            <h1 style="
                color:#e87b9e;
                font-size:42px;
                margin:0;
                font-family:Georgia, serif;
                font-style:italic;
            ">
                Minuit
            </h1>

            <p style="
                color:#9e7f8a;
                font-size:14px;
                text-transform:uppercase;
                letter-spacing:2px;
                margin-top:8px;
                font-weight:bold;
            ">
                Nota de Pedido
            </p>
        </div>

        <div style="
            background:#fdf0f4;
            padding:15px;
            border-radius:10px;
            margin-bottom:25px;
        ">
            <p style="margin:0 0 8px 0;">
                <strong>Cliente:</strong>
                ${nombreCliente}
            </p>

            <p style="margin:0 0 8px 0;">
                <strong>Fecha:</strong>
                ${new Date().toLocaleDateString("es-MX")}
            </p>

            <p style="margin:0;">
                <strong>Estado:</strong>
                Por transferir
            </p>
        </div>

        <div>
            ${pdfLista}
        </div>

        <div style="
            background:#fdf0f4;
            padding:20px;
            border-radius:10px;
            margin-top:25px;
            text-align:right;
        ">
            <h2 style="
                margin:0;
                color:#e87b9e;
            ">
                Total a Pagar: ${totalTxt}
            </h2>
        </div>

        <div style="
            text-align:center;
            margin-top:35px;
            color:#9e7f8a;
        ">
            <p>
                ¡Gracias por tu compra en Minuit!
            </p>

            <p style="font-size:12px;">
                Conserva este comprobante para futuras referencias.
            </p>
        </div>
    `;

    document.body.appendChild(element);

    // Dar tiempo a renderizar
    await new Promise(resolve => setTimeout(resolve, 500));

    try {

       const { jsPDF } = window.jspdf;

const { jsPDF } = window.jspdf;

const pdf = new jsPDF("p", "mm", "a4");

const COLOR_PRINCIPAL = [232, 123, 158];
const COLOR_FONDO = [253, 240, 244];
const COLOR_TEXTO = [74, 59, 64];

// =====================================
// ENCABEZADO
// =====================================

pdf.setFillColor(...COLOR_PRINCIPAL);
pdf.rect(0, 0, 210, 35, "F");

pdf.setTextColor(255, 255, 255);
pdf.setFont("helvetica", "bold");
pdf.setFontSize(28);
pdf.text("MINUIT", 105, 18, { align: "center" });

pdf.setFontSize(11);
pdf.text("Nota de Pedido", 105, 27, { align: "center" });

// =====================================
// DATOS CLIENTE
// =====================================

pdf.setFillColor(...COLOR_FONDO);
pdf.roundedRect(15, 45, 180, 28, 4, 4, "F");

pdf.setTextColor(...COLOR_TEXTO);
pdf.setFontSize(11);

pdf.setFont("helvetica", "bold");
pdf.text("Cliente:", 20, 56);

pdf.setFont("helvetica", "normal");
pdf.text(nombreCliente, 45, 56);

pdf.setFont("helvetica", "bold");
pdf.text("Fecha:", 20, 66);

pdf.setFont("helvetica", "normal");
pdf.text(
    new Date().toLocaleDateString("es-MX"),
    45,
    66
);

pdf.setFont("helvetica", "bold");
pdf.text("Estado:", 120, 56);

pdf.setFont("helvetica", "normal");
pdf.text("Por transferir", 145, 56);

// =====================================
// TABLA ENCABEZADO
// =====================================

let y = 90;

pdf.setFillColor(...COLOR_PRINCIPAL);
pdf.rect(15, y, 180, 10, "F");

pdf.setTextColor(255, 255, 255);
pdf.setFont("helvetica", "bold");
pdf.setFontSize(10);

pdf.text("PRODUCTO", 20, y + 7);
pdf.text("CANT.", 120, y + 7);
pdf.text("TOTAL", 170, y + 7);

y += 15;

// =====================================
// PRODUCTOS
// =====================================

pdf.setTextColor(...COLOR_TEXTO);

carrito.forEach(item => {

    if (y > 260) {

        pdf.addPage();

        y = 20;

        pdf.setFillColor(...COLOR_PRINCIPAL);
        pdf.rect(15, y, 180, 10, "F");

        pdf.setTextColor(255,255,255);

        pdf.text("PRODUCTO", 20, y + 7);
        pdf.text("CANT.", 120, y + 7);
        pdf.text("TOTAL", 170, y + 7);

        y += 15;

        pdf.setTextColor(...COLOR_TEXTO);
    }

    pdf.setFont("helvetica", "bold");
    pdf.text(item.nombre, 20, y);

    pdf.setFont("helvetica", "normal");

    pdf.setFontSize(8);

    pdf.text(
        String(item.detalle || ""),
        20,
        y + 5
    );

    pdf.setFontSize(10);

    pdf.text(
        String(item.cantidad),
        125,
        y
    );

    pdf.text(
        "$" + item.subtotal.toFixed(2),
        165,
        y
    );

    pdf.setDrawColor(240, 220, 227);

    pdf.line(
        20,
        y + 8,
        190,
        y + 8
    );

    y += 15;
});

// =====================================
// TOTAL
// =====================================

y += 10;

pdf.setFillColor(...COLOR_FONDO);

pdf.roundedRect(
    110,
    y,
    85,
    22,
    4,
    4,
    "F"
);

pdf.setFont("helvetica", "bold");

pdf.setTextColor(...COLOR_PRINCIPAL);

pdf.setFontSize(12);

pdf.text(
    "TOTAL A PAGAR",
    152,
    y + 8,
    { align: "center" }
);

pdf.setFontSize(18);

pdf.text(
    totalTxt,
    152,
    y + 17,
    { align: "center" }
);

// =====================================
// PIE
// =====================================

pdf.setTextColor(120,120,120);

pdf.setFontSize(10);

pdf.text(
    "Gracias por tu compra en Minuit ♥",
    105,
    285,
    { align: "center" }
);

pdf.text(
    "Conserva este comprobante para futuras referencias",
    105,
    291,
    { align: "center" }
);

// =====================================
// GUARDAR
// =====================================

pdf.save(
    `Pedido_Minuit_${nombreCliente.replace(/\s+/g, "_")}.pdf`
);

    } catch (error) {

        console.error("Error PDF:", error);

        alert(
            "Ocurrió un error al generar el PDF. Revisa la consola."
        );

    } finally {

        const pdfTemporal =
            document.getElementById("pdf-temporal-minuit");

        if (pdfTemporal) {
            pdfTemporal.remove();
        }
    }
}
