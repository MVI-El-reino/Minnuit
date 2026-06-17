let carrito = [];
const numeroDueno = "522227125366"; // CAMBIA ESTO POR EL NÚMERO DEL DUEÑO

// ==========================================
// 1. BASES DE DATOS DE PRECIOS
// ==========================================
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

// --- NUEVOS PRECIOS CUPCAKES Y PASTELES ---
const cupcakesPreciosBase = { "2": 18, "4": 25, "6": 35 };
const cupcakesPreciosSoporte = { "Blanco": 0, "Kraft": 0, "Dorado": 5, "Rosa": 5 };

const pastelesPreciosBase = { "Chico": 20, "Mediano": 28, "Grande": 35 };
const pastelesPreciosVentana = { "Cerrada": 0, "Ventana": 8 };

let precioBaseActual = 25; 
let precioCupcakeActual = 18;
let precioPastelActual = 20;

// ==========================================
// 2. UTILIDADES Y NAVEGACIÓN
// ==========================================
function inicializarBases() { 
    actualizarConfiguradorBases(); 
    actualizarConfiguradorCupcakes();
    actualizarConfiguradorPasteles();
}

function mostrarAlerta(mensaje) {
    const contenedor = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = mensaje;
    contenedor.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function cambiarTab(idSeccion) {
    document.querySelectorAll('.categoria-seccion').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(idSeccion).classList.add('active');
    event.currentTarget.classList.add('active');
}

function cambiarCantidad(inputId, cambio, minimo) {
    let input = document.getElementById(inputId);
    let valorActual = parseInt(input.value);
    let nuevoValor = valorActual + cambio;
    if (nuevoValor >= minimo) { input.value = nuevoValor; } 
    else { mostrarAlerta(`⚠️ La cantidad mínima por selección es ${minimo}.`); }
}

function animarBotónCarrito() {
    const fabCarrito = document.getElementById("fab-carrito");
    fabCarrito.classList.remove('con-items');
    void fabCarrito.offsetWidth;
    fabCarrito.classList.add('con-items');
}

// ==========================================
// 3. LÓGICA DE BASES MDF
// ==========================================
function actualizarConfiguradorBases() {
    const linea = document.getElementById("sel_linea_base").value;
    const grosorSelect = document.getElementById("sel_grosor_base");
    const tamanoSelect = document.getElementById("sel_tamano_base");
    const grosor = grosorSelect.value;
    const tamano = tamanoSelect.value;

    const precios = (linea === "Basic") ? basesBasicPrecios : basesPremiumPrecios;
    
    Array.from(tamanoSelect.options).forEach(opt => {
        let precio = precios[grosor][opt.value];
        opt.text = `${opt.text.split(' - ')[0]} - $${precio}`;
    });

    Array.from(grosorSelect.options).forEach(opt => {
        let precio = precios[opt.value][tamano];
        opt.text = `${opt.text.split(' - ')[0]} - $${precio}`;
    });

    precioBaseActual = precios[grosor][tamano];
    document.getElementById("precio_config_base").innerText = `$${precioBaseActual.toFixed(2)} MXN`;

    const selectColor = document.getElementById("sel_color_logo_base");
    selectColor.innerHTML = "";
    coloresLogotipo[linea].forEach(color => {
        let option = document.createElement("option");
        option.value = color; option.text = color.charAt(0).toUpperCase() + color.slice(1);
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
    
    carrito.push({ nombre: nombreCompuesto, cantidad, detalle: detalleCompuesto, precio: precioBaseActual, subtotal: precioBaseActual * cantidad });
    mostrarAlerta(`🛒 ¡Agregado al carrito!`);
    actualizarVistaCarrito();
    animarBotónCarrito();

    document.getElementById("sel_linea_base").selectedIndex = 0;
    document.getElementById("sel_grosor_base").selectedIndex = 0;
    document.getElementById("sel_tamano_base").selectedIndex = 0;
    document.getElementById("sel_forma_base").selectedIndex = 0;
    document.getElementById("cant_base_config").value = "1"; 
    actualizarConfiguradorBases();
}

// ==========================================
// 4. LÓGICA DE CAJAS CUPCAKES
// ==========================================
function actualizarConfiguradorCupcakes() {
    const tamanoSelect = document.getElementById("sel_tamano_cupcake");
    const soporteSelect = document.getElementById("sel_color_soporte");
    const tamano = tamanoSelect.value;
    const soporte = soporteSelect.value;

    Array.from(tamanoSelect.options).forEach(opt => {
        let pBase = cupcakesPreciosBase[opt.value] + cupcakesPreciosSoporte[soporte];
        opt.text = `${opt.text.split(' - ')[0]} - $${pBase}`;
    });
    
    Array.from(soporteSelect.options).forEach(opt => {
        let pExtra = cupcakesPreciosSoporte[opt.value];
        let extraTxt = pExtra > 0 ? `(+$${pExtra})` : `(Gratis)`;
        opt.text = `${opt.text.split(' (')[0]} ${extraTxt}`;
    });

    precioCupcakeActual = cupcakesPreciosBase[tamano] + cupcakesPreciosSoporte[soporte];
    document.getElementById("precio_config_cupcake").innerText = `$${precioCupcakeActual.toFixed(2)} MXN`;
}

function agregarCupcakeConfigAlCarrito() {
    const cantidad = parseInt(document.getElementById("cant_cupcake_config").value);
    const tamano = document.getElementById("sel_tamano_cupcake").value;
    const soporte = document.getElementById("sel_color_soporte").value;
    
    const nombre = `Caja ${tamano} Cupcakes`;
    const detalle = `Soporte interior: ${soporte}`;
    
    carrito.push({ nombre, cantidad, detalle, precio: precioCupcakeActual, subtotal: precioCupcakeActual * cantidad });
    mostrarAlerta(`🛒 ¡Cajas de Cupcakes agregadas!`);
    actualizarVistaCarrito();
    animarBotónCarrito();

    document.getElementById("sel_tamano_cupcake").selectedIndex = 0;
    document.getElementById("sel_color_soporte").selectedIndex = 0;
    document.getElementById("cant_cupcake_config").value = "1"; 
    actualizarConfiguradorCupcakes();
}

// ==========================================
// 5. LÓGICA DE CAJAS PASTEL
// ==========================================
function actualizarConfiguradorPasteles() {
    const tamanoSelect = document.getElementById("sel_tamano_pastel");
    const ventanaSelect = document.getElementById("sel_ventana_pastel");
    const tamano = tamanoSelect.value;
    const ventana = ventanaSelect.value;

    Array.from(tamanoSelect.options).forEach(opt => {
        let p = pastelesPreciosBase[opt.value] + pastelesPreciosVentana[ventana];
        opt.text = `${opt.text.split(' - ')[0]} - $${p}`;
    });

    Array.from(ventanaSelect.options).forEach(opt => {
        let pExtra = pastelesPreciosVentana[opt.value];
        let extraTxt = pExtra > 0 ? `(+$${pExtra})` : `(Estándar)`;
        opt.text = `${opt.text.split(' (')[0]} ${extraTxt}`;
    });

    precioPastelActual = pastelesPreciosBase[tamano] + pastelesPreciosVentana[ventana];
    document.getElementById("precio_config_pastel").innerText = `$${precioPastelActual.toFixed(2)} MXN`;
}

function agregarPastelConfigAlCarrito() {
    const cantidad = parseInt(document.getElementById("cant_pastel_config").value);
    const tamanoObj = document.getElementById("sel_tamano_pastel");
    const nombreTamano = tamanoObj.options[tamanoObj.selectedIndex].text.split(' -')[0];
    const material = document.getElementById("sel_material_pastel").value;
    const ventana = document.getElementById("sel_ventana_pastel").value;
    const extraInfo = document.getElementById("detalle_pastel1").value || "Sin notas extra";
    
    const nombre = `Caja Pastel (${nombreTamano})`;
    const detalle = `Mat: ${material} | Estilo: ${ventana} | Notas: ${extraInfo}`;
    
    carrito.push({ nombre, cantidad, detalle, precio: precioPastelActual, subtotal: precioPastelActual * cantidad });
    mostrarAlerta(`🛒 ¡Cajas de Pastel agregadas!`);
    actualizarVistaCarrito();
    animarBotónCarrito();

    document.getElementById("sel_tamano_pastel").selectedIndex = 0;
    document.getElementById("sel_material_pastel").selectedIndex = 0;
    document.getElementById("sel_ventana_pastel").selectedIndex = 0;
    document.getElementById("detalle_pastel1").value = "";
    document.getElementById("cant_pastel_config").value = "1"; 
    actualizarConfiguradorPasteles();
}

// ==========================================
// 6. CONTROL DEL CARRITO
// ==========================================
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    mostrarAlerta("❌ Artículo eliminado");
    actualizarVistaCarrito();
    if(carrito.length === 0) { cerrarModal(); }
}

function actualizarVistaCarrito() {
    let totalDinero = 0;
    let totalBases = 0;
    let totalCajas = 0; // Cupcakes y pasteles comparten el mínimo de 30 piezas
    let listaHTML = "";
    
    carrito.forEach((item, index) => {
        totalDinero += item.subtotal;
        
        if(item.nombre.includes("Base")) { totalBases += item.cantidad; }
        if(item.nombre.includes("Caja")) { totalCajas += item.cantidad; }
        
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

    let advertenciaHTML = "";
    let bloqueado = false;

    if (totalBases > 0 && totalBases < 35) {
        advertenciaHTML += `<div class="texto-alerta-rojo">⚠️ Llevas ${totalBases} Bases. Mínimo 35 piezas.</div>`;
        bloqueado = true;
    }
    if (totalCajas > 0 && totalCajas < 30) {
        advertenciaHTML += `<div class="texto-alerta-rojo">⚠️ Llevas ${totalCajas} Cajas. Mínimo 30 piezas.</div>`;
        bloqueado = true;
    }

    if (!bloqueado && carrito.length > 0) {
        advertenciaHTML = `<div class="texto-valido-verde">✅ ¡Cantidades correctas! Pedido autorizado.</div>`;
    }

    alertaPiezas.innerHTML = advertenciaHTML;
    btnPedido.disabled = bloqueado;
}

function abrirModal() {
    if(carrito.length === 0) return mostrarAlerta("🛍️ Tu carrito está vacío.");
    document.getElementById("modal-carrito").style.display = "block";
}
function cerrarModal() {
    document.getElementById("modal-carrito").style.display = "none";
}

// ==========================================
// 7. GENERACIÓN DEL PDF NATIVO (jsPDF) Y WHATSAPP
// ==========================================
async function procesarPedido() {
    let nombreCliente = document.getElementById("nombre_cliente").value.trim();
    if (!nombreCliente) return mostrarAlerta("✏️ Por favor, escribe tu nombre.");
    if (carrito.length === 0) return mostrarAlerta("🛒 Tu carrito está vacío.");

    mostrarAlerta("⏳ Generando nota de pedido...");
    
    // Deshabilitar botón para evitar doble clic
    document.querySelector(".btn-pedido").disabled = true;

    let totalTxt = document.getElementById("modal-total").innerText;
    let textoWhatsApp = `✨ *¡Hola Minuit! Nuevo pedido* ✨\n\n*Cliente:* ${nombreCliente}\n\n*Detalles:*\n`;

    carrito.forEach(item => {
        textoWhatsApp += `▪️ ${item.cantidad}x ${item.nombre} (${item.detalle}) - $${item.subtotal.toFixed(2)}\n`;
    });
    textoWhatsApp += `\n💰 *Total:* ${totalTxt}\n\nQuedo a la espera de los datos de transferencia.`;

    // --- MAGIA DEL PDF NATIVO ---
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const COLOR_PRINCIPAL = [232, 123, 158];
        const COLOR_FONDO = [253, 240, 244];
        const COLOR_TEXTO = [74, 59, 64];

        // ENCABEZADO
        pdf.setFillColor(...COLOR_PRINCIPAL);
        pdf.rect(0, 0, 210, 35, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(28);
        pdf.text("MINUIT", 105, 18, { align: "center" });
        pdf.setFontSize(11);
        pdf.text("Nota de Pedido", 105, 27, { align: "center" });

        // DATOS CLIENTE
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
        pdf.text(new Date().toLocaleDateString("es-MX"), 45, 66);
        pdf.setFont("helvetica", "bold");
        pdf.text("Estado:", 120, 56);
        pdf.setFont("helvetica", "normal");
        pdf.text("Por transferir", 145, 56);

        // TABLA ENCABEZADO
        let y = 90;
        pdf.setFillColor(...COLOR_PRINCIPAL);
        pdf.rect(15, y, 180, 10, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("PRODUCTO", 20, y + 7);
        pdf.text("CANT.", 130, y + 7, { align: "center" });
        pdf.text("TOTAL", 185, y + 7, { align: "right" });
        y += 15;

        // PRODUCTOS
        pdf.setTextColor(...COLOR_TEXTO);
        carrito.forEach(item => {
            if (y > 260) {
                pdf.addPage();
                y = 20;
                pdf.setFillColor(...COLOR_PRINCIPAL);
                pdf.rect(15, y, 180, 10, "F");
                pdf.setTextColor(255,255,255);
                pdf.text("PRODUCTO", 20, y + 7);
                pdf.text("CANT.", 130, y + 7, { align: "center" });
                pdf.text("TOTAL", 185, y + 7, { align: "right" });
                y += 15;
                pdf.setTextColor(...COLOR_TEXTO);
            }

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.text(item.nombre, 20, y);

            // MEJORA PROFESIONAL: Text Wrapping automático para detalles largos
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            let lineasDetalle = pdf.splitTextToSize(String(item.detalle || ""), 90); 
            pdf.text(lineasDetalle, 20, y + 4);

            pdf.setFontSize(10);
            pdf.text(String(item.cantidad), 130, y, { align: "center" });
            pdf.text("$" + item.subtotal.toFixed(2), 185, y, { align: "right" });

            // Ajustar el salto en Y dependiendo de si el detalle ocupó 1, 2 o más renglones
            let alturaExtra = lineasDetalle.length * 3;
            y += Math.max(10, alturaExtra + 4);

            pdf.setDrawColor(240, 220, 227);
            pdf.line(20, y - 3, 190, y - 3);
            y += 5;
        });

        // TOTAL
        y += 5;
        pdf.setFillColor(...COLOR_FONDO);
        pdf.roundedRect(110, y, 85, 22, 4, 4, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...COLOR_PRINCIPAL);
        pdf.setFontSize(12);
        pdf.text("TOTAL A PAGAR", 152, y + 8, { align: "center" });
        pdf.setFontSize(18);
        pdf.text(totalTxt, 152, y + 17, { align: "center" });

        // PIE
        pdf.setTextColor(120,120,120);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text("Gracias por tu compra en Minuit ♥", 105, 285, { align: "center" });
        pdf.text("Conserva este comprobante para futuras referencias", 105, 291, { align: "center" });

        // GUARDAR
        pdf.save(`Pedido_Minuit_${nombreCliente.replace(/\s+/g, "_")}.pdf`);

        // ENVIAR A WHATSAPP
        setTimeout(() => {
            let textoCodificado = encodeURIComponent(textoWhatsApp);
            window.open(`https://wa.me/${numeroDueno}?text=${textoCodificado}`, '_blank');
            
            // Limpieza
            carrito = [];
            actualizarVistaCarrito();
            cerrarModal();
            document.getElementById("nombre_cliente").value = "";
            document.querySelector(".btn-pedido").disabled = false;
        }, 800);

    } catch (error) {
        console.error("Error PDF:", error);
        alert("Ocurrió un error al generar el PDF. Revisa la consola.");
        document.querySelector(".btn-pedido").disabled = false;
    }
}
