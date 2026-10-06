let carrito = [];
const numeroDueno = "522215836232"; 

// Usa tus variables ofuscadas de Telegram aquí
const tokenParte1 = "AQUI_TU_NUMERO"; 
const tokenParte2 = "AQUI_TUS_LETRAS"; 
const TELEGRAM_BOT_TOKEN = tokenParte1 + ":" + tokenParte2; 
const TELEGRAM_CHAT_ID = "PEGA_AQUI_TU_ID"; 

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
    "Basic": ["dorado espejo", "tornasol sirena", "rosa espejo", "rosa pastel", "rosa mexicano", "morado", "azul cielo", "jade(verde azulado)", "negro mate"],
    "Premium": ["blanco", "dorado", "negro"]
};

const cupcakesPreciosBase = { "21cm": 18, "31cm": 25 };
const cupcakesPreciosSoporte = { "Blanco": 0, "Kraft": 0, "Dorado": 5, "Rosa": 5 };

const pastelesData = {
    "Petite": {
        "15.5x15.5x10 cm": { precios: [20, 19, 18, 17], extraRedes: 5 },
        "25.5x25.5x15 cm": { precios: [40, 37, 35, 33], extraRedes: 6 },
        "25.5x25.5x25 cm": { precios: [45, 42, 40, 38], extraRedes: 7 },
        "30.5x30.5x25 cm": { precios: [55, 53, 50, 48], extraRedes: 8 }
    },
    "Altas": {
        "15.5x15.5x20 cm": { precios: [30, 29, 28, 26], extraRedes: 5 },
        "20.5x20.5x27 cm": { precios: [42, 40, 38, 36], extraRedes: 6 },
        "25.5x25.5x34 cm": { precios: [50, 47, 45, 43], extraRedes: 7 },
        "30.5x30.5x41 cm": { precios: [60, 57, 55, 53], extraRedes: 8 }
    }
};

const coloresLogotipoPastel = [
    "Rosa pastel", "Rosa mexicano", "Azul cielo", "Morado", "Jade", 
    "Rojo", "Negro", "Dorado espejo", "Rosa espejo", "Tornasol sirena"
];

let precioBaseActual = 25; 
let precioCupcakeActual = 18;
let precioPastelActual = 0;

// === NUEVO: ALMACÉN DE MENÚS ANIMADOS ===
const instanciasSelect = {};

function inicializarTienda() { 
    // Llenar select de colores de pasteles (Nativo primero)
    const selectColorPastel = document.getElementById("sel_color_logo_pastel");
    if (selectColorPastel) {
        selectColorPastel.innerHTML = "";
        coloresLogotipoPastel.forEach(color => {
            let option = document.createElement("option");
            option.value = color; option.text = color;
            selectColorPastel.add(option);
        });
    }

    // Convertir todos los selects a la capa premium (Versión fluida)
    document.querySelectorAll('.controles-config select').forEach(select => {
        instanciasSelect[select.id] = new Choices(select, {
            searchEnabled: false,
            itemSelectText: '',
            shouldSort: false,
            position: 'auto' 
        });
    });
    
    actualizarConfiguradorBases(); 
    actualizarConfiguradorCupcakes();
    actualizarOpcionesTamanoPastel();
}

// Helper para que el diseño premium lea los cambios de tu código
function sincronizarChoice(id) {
    if (instanciasSelect[id]) {
        const selectNat = document.getElementById(id);
        const opciones = Array.from(selectNat.options).map(opt => ({
            value: opt.value, label: opt.text, selected: opt.selected, disabled: opt.disabled
        }));
        instanciasSelect[id].setChoices(opciones, 'value', 'label', true);
    }
}

// Helper para resetear los menús tras agregar al carrito
function resetearSelect(id, indice = 0) {
    const select = document.getElementById(id);
    if(select && select.options.length > 0) {
        select.selectedIndex = indice;
        if(instanciasSelect[id]) {
            instanciasSelect[id].setChoiceByValue(select.options[indice].value);
        }
    }
}

// Helper para Validar Teclado Manual
function validarManual(id, minimo) {
    let input = document.getElementById(id);
    let valor = parseInt(input.value);
    if (isNaN(valor) || valor < minimo) {
        input.value = minimo;
        mostrarAlerta(`⚠️ La cantidad mínima permitida es ${minimo}.`);
    }
}

// ==========================================
// UTILIDADES Y NAVEGACIÓN
// ==========================================
function mostrarAlerta(mensaje) {
    const contenedor = document.getElementById('toast-container');
    if(!contenedor) return;
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
    if(!input) return;
    let valorActual = parseInt(input.value) || 0;
    let nuevoValor = valorActual + cambio;
    if (nuevoValor >= minimo) { input.value = nuevoValor; } 
    else { mostrarAlerta(`⚠️ La cantidad mínima permitida es ${minimo}.`); }
}

function animarBotónCarrito() {
    const fabCarrito = document.getElementById("fab-carrito");
    if(!fabCarrito) return;
    fabCarrito.classList.remove('con-items');
    void fabCarrito.offsetWidth;
    fabCarrito.classList.add('con-items');
}

// ==========================================
// LÓGICA DE BASES MDF
// ==========================================
function actualizarConfiguradorBases() {
    const lineaSelect = document.getElementById("sel_linea_base");
    if (!lineaSelect) return;

    const linea = lineaSelect.value;
    const grosorSelect = document.getElementById("sel_grosor_base");
    const tamanoSelect = document.getElementById("sel_tamano_base");
    const selectColor = document.getElementById("sel_color_logo_base");

    const grosorActual = grosorSelect.value;
    const tamanoActual = tamanoSelect.value;
    const colorActual = selectColor.value;

    const tamanosDisponibles = Array.from(tamanoSelect.options).map(opt => opt.value);
    const grosoresDisponibles = Array.from(grosorSelect.options).map(opt => opt.value);
    const precios = (linea === "Basic") ? basesBasicPrecios : basesPremiumPrecios;

    // ACTUALIZACIÓN FANTASMA (Sin destruir el menú)
    if (instanciasSelect["sel_tamano_base"]) {
        let opcionesTamano = tamanosDisponibles.map(val => ({
            value: val, label: `${val} - $${precios[grosorActual][val]}`, selected: (val === tamanoActual)
        }));
        instanciasSelect["sel_tamano_base"].setChoices(opcionesTamano, 'value', 'label', true);
    }

    if (instanciasSelect["sel_grosor_base"]) {
        let opcionesGrosor = grosoresDisponibles.map(val => ({
            value: val, label: `${val} - $${precios[val][tamanoActual]}`, selected: (val === grosorActual)
        }));
        instanciasSelect["sel_grosor_base"].setChoices(opcionesGrosor, 'value', 'label', true);
    }

    if (instanciasSelect["sel_color_logo_base"]) {
        let opcionesColor = coloresLogotipo[linea].map(color => ({
            value: color, label: color.charAt(0).toUpperCase() + color.slice(1), selected: (color === colorActual)
        }));
        instanciasSelect["sel_color_logo_base"].setChoices(opcionesColor, 'value', 'label', true);
    }

    precioBaseActual = precios[grosorActual][tamanoActual];
    document.getElementById("precio_config_base").innerText = `$${precioBaseActual.toFixed(2)} MXN`;
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
    
    resetearSelect("sel_linea_base");
    resetearSelect("sel_grosor_base");
    resetearSelect("sel_tamano_base");
    resetearSelect("sel_forma_base");
    document.getElementById("cant_base_config").value = "1"; 
    actualizarConfiguradorBases();

    mostrarAlerta(`🛒 ¡Agregado al carrito!`);
    actualizarVistaCarrito();
    animarBotónCarrito();
}

// ==========================================
// LÓGICA DE CAJAS CUPCAKES
// ==========================================
function actualizarConfiguradorCupcakes() {
    
    const tamanoSelect = document.getElementById("sel_tamano_cupcake");
    const tieneSoporteSelect = document.getElementById("sel_tiene_soporte"); // El nuevo interruptor
    const soporteSelect = document.getElementById("sel_color_soporte"); // El menú de colores

    if (!tamanoSelect || !tieneSoporteSelect || !soporteSelect) return; 

    // ================================================================
    // Mostrar u ocultar el menú de colores (¡SÍ LO CONSERVAMOS!)
    // ================================================================
    const contenedorColorSoporte = document.getElementById("contenedor_color_soporte");
    if (tieneSoporteSelect.value === "Si") {
        contenedorColorSoporte.style.display = "block";
    } else {
        contenedorColorSoporte.style.display = "none";
    }

    const tamanoActual = tamanoSelect.value;
    const soporteActual = soporteSelect.value; 
    
    const tamanosDisponibles = Array.from(tamanoSelect.options).map(opt => opt.value);
    const soportesDisponibles = Array.from(soporteSelect.options).map(opt => opt.value);

    // ================================================================
    // NUEVA ACTUALIZACIÓN FANTASMA 1: TAMAÑOS Y TEXTOS LARGOS
    // ================================================================
    // Diccionario con los textos completos que pidió Ely (¡SÍ LO CONSERVAMOS!)
    const nombresLargosCupcakes = {
        "21cm": "21 x 12 x 7.5 cm",
        "31cm": "31 x 12 x 7.5 cm"
    };

    if (instanciasSelect["sel_tamano_cupcake"]) {
        let opcionesTamano = tamanosDisponibles.map(val => {
            // Calculamos el precio base + el extra del soporte seleccionado
            let pBase = cupcakesPreciosBase[val] + cupcakesPreciosSoporte[soporteActual];
            
            // Leemos el texto largo, o usamos el corto si no lo encuentra
            let textoAmostar = nombresLargosCupcakes[val] || val;
            
            // Retornamos el objeto limpio para que la librería lo actualice sin parpadear
            return { value: val, label: `${textoAmostar} - $${pBase}`, selected: (val === tamanoActual) };
        });
        instanciasSelect["sel_tamano_cupcake"].setChoices(opcionesTamano, 'value', 'label', true);
    }

    // ================================================================
    // NUEVA ACTUALIZACIÓN FANTASMA 2: COLORES DE SOPORTE Y PRECIOS
    // ================================================================
    if (instanciasSelect["sel_color_soporte"]) {
        let opcionesSoporte = soportesDisponibles.map(val => {
            // Verificamos si el soporte tiene costo extra o es gratis
            let pExtra = cupcakesPreciosSoporte[val];
            let extraTxt = pExtra > 0 ? `(+$${pExtra})` : `(Gratis)`;
            
            return { value: val, label: `${val} ${extraTxt}`, selected: (val === soporteActual) };
        });
        instanciasSelect["sel_color_soporte"].setChoices(opcionesSoporte, 'value', 'label', true);
    }

    // ================================================================
    // 3. ACTUALIZACIÓN DEL PRECIO MAESTRO EN PANTALLA
    // ================================================================
    precioCupcakeActual = cupcakesPreciosBase[tamanoActual] + cupcakesPreciosSoporte[soporteActual];
    document.getElementById("precio_config_cupcake").innerText = `$${precioCupcakeActual.toFixed(2)} MXN`;
}

function agregarCupcakeConfigAlCarrito() {
    const cantidad = parseInt(document.getElementById("cant_cupcake_config").value);
    const tamano = document.getElementById("sel_tamano_cupcake").value;
    const soporte = document.getElementById("sel_color_soporte").value;
    
    const nombre = `Caja ${tamano} Cupcakes`;
    const detalle = `Soporte interior: ${soporte}`;
    
    carrito.push({ nombre, cantidad, detalle, precio: precioCupcakeActual, subtotal: precioCupcakeActual * cantidad });
    
    resetearSelect("sel_tamano_cupcake");
    resetearSelect("sel_color_soporte");
    document.getElementById("cant_cupcake_config").value = "5";
    actualizarConfiguradorCupcakes();

    mostrarAlerta(`🛒 ¡Cajas agregadas!`);
    actualizarVistaCarrito();
    animarBotónCarrito();
}

// ==========================================
// LÓGICA DE CAJAS PASTEL 
// ==========================================
function actualizarOpcionesTamanoPastel() {
    // Al cambiar la línea de caja, simplemente mandamos llamar al configurador maestro
    // Él se encargará de destruir la lista vieja y construir la nueva sin duplicar.
    actualizarConfiguradorPasteles();
}

function actualizarConfiguradorPasteles() {
    const tipoObj = document.getElementById("sel_tipo_pastel");
    const tamanoObj = document.getElementById("sel_tamano_pastel");
    
    if (!tipoObj || !tamanoObj) return;

    let totalEnCarrito = carrito.reduce((sum, item) => item.tipoPastel ? sum + item.cantidad : sum, 0);
    const cantidadActual = parseInt(document.getElementById("cant_pastel_config").value) || 1;
    let cantidadTotalEvaluada = totalEnCarrito + cantidadActual;

    let indicePrecio = 0; 
    let nivelTexto = "Menudeo (10-39 pzas)";

    if (cantidadTotalEvaluada >= 40 && cantidadTotalEvaluada <= 79) { indicePrecio = 1; nivelTexto = "1er Mayoreo (40-79 pzas)"; }
    else if (cantidadTotalEvaluada >= 80 && cantidadTotalEvaluada <= 149) { indicePrecio = 2; nivelTexto = "2do Mayoreo (80-149 pzas)"; }
    else if (cantidadTotalEvaluada >= 150) { indicePrecio = 3; nivelTexto = "3er Mayoreo (+150 pzas)"; }

    const tipo = tipoObj.value;
    const redes = document.getElementById("sel_redes_pastel").value;
    const contenedorRedes = document.getElementById("contenedor_redes_medida");
    const medidaRedesObj = document.getElementById("sel_medida_redes");
    
    let costoExtraRedes = 0;
    if (redes === "Si") {
        contenedorRedes.style.display = "block";
        costoExtraRedes = parseFloat(medidaRedesObj.value) || 0;
    } else {
        contenedorRedes.style.display = "none";
        costoExtraRedes = 0;
    }

    let tamanoSeleccionado = tamanoObj.value;
    let tamanosDisponibles = Object.keys(pastelesData[tipo]);

    if (!tamanosDisponibles.includes(tamanoSeleccionado)) {
        tamanoSeleccionado = tamanosDisponibles[0];
    }

    // ACTUALIZACIÓN FANTASMA
    if (instanciasSelect["sel_tamano_pastel"]) {
        let opcionesNuevas = tamanosDisponibles.map(tamano => {
            let precioOpcion = pastelesData[tipo][tamano].precios[indicePrecio] + costoExtraRedes;
            return { value: tamano, label: `${tamano} - $${precioOpcion}`, selected: (tamano === tamanoSeleccionado) };
        });
        instanciasSelect["sel_tamano_pastel"].setChoices(opcionesNuevas, 'value', 'label', true);
    }

    const datosTamano = pastelesData[tipo][tamanoSeleccionado];
    let precioBase = datosTamano.precios[indicePrecio] + costoExtraRedes;
    precioPastelActual = precioBase;
    
    document.getElementById("precio_config_pastel").innerText = `$${precioPastelActual.toFixed(2)} MXN`;
    document.getElementById("indicador_mayoreo").innerText = `Nivel Activo: ${nivelTexto}`;
}

function agregarPastelConfigAlCarrito() {
    const cantidad = parseInt(document.getElementById("cant_pastel_config").value);
    const tipo = document.getElementById("sel_tipo_pastel").value;
    const tamano = document.getElementById("sel_tamano_pastel").value;
    const colorLogo = document.getElementById("sel_color_logo_pastel").value;
    const redes = document.getElementById("sel_redes_pastel").value;
    const extraInfo = document.getElementById("detalle_pastel1").value || "Sin notas extra";
    
    const nombre = `Caja Pastel ${tipo} (${tamano})`;
    const detalle = `Logo: ${colorLogo} | Redes: ${redes} | Notas: ${extraInfo}`;
    
    // IMPORTANTE: Guardamos parámetros ocultos para poder recalcular precios después
    carrito.push({ 
        nombre, cantidad, detalle, precio: precioPastelActual, subtotal: precioPastelActual * cantidad,
        tipoPastel: tipo,
        tamanoPastel: tamano,
        redesPastel: redes
    });
    
    resetearSelect("sel_tipo_pastel");
    actualizarOpcionesTamanoPastel();
    resetearSelect("sel_color_logo_pastel");
    resetearSelect("sel_redes_pastel");
    document.getElementById("detalle_pastel1").value = "";
    document.getElementById("cant_pastel_config").value = "5"; 
    
    // Forzamos la actualización visual
    actualizarVistaCarrito();
    actualizarConfiguradorPasteles();

    mostrarAlerta(`🛒 ¡Cajas de Pastel agregadas!`);
    animarBotónCarrito();
}

// ==========================================
// CONTROL DEL CARRITO
// ==========================================
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    mostrarAlerta("❌ Artículo eliminado");
    actualizarVistaCarrito();
    if(carrito.length === 0) { cerrarModal(); }
}

function actualizarVistaCarrito() {
    // 1. Calcular totales de piezas por categoría
    let totalBases = 0;
    let totalCupcakes = 0; 
    let totalPasteles = 0;
    
    carrito.forEach(item => {
        if(item.nombre.includes("Base")) { totalBases += item.cantidad; }
        if(item.nombre.includes("Cupcake")) { totalCupcakes += item.cantidad; }
        if(item.tipoPastel) { totalPasteles += item.cantidad; } 
    });

    // 2. Determinar Nivel de Mayoreo Global para los Pasteles
    let indiceMayoreoGlobal = 0;
    if (totalPasteles >= 40 && totalPasteles <= 79) indiceMayoreoGlobal = 1;
    else if (totalPasteles >= 80 && totalPasteles <= 149) indiceMayoreoGlobal = 2;
    else if (totalPasteles >= 150) indiceMayoreoGlobal = 3;

    // 3. RECALCULAR PRECIOS
    carrito.forEach(item => {
        if(item.tipoPastel) {
            const datos = pastelesData[item.tipoPastel][item.tamanoPastel];
            let nuevoPrecio = datos.precios[indiceMayoreoGlobal];
            if (item.redesPastel === "Si") { nuevoPrecio += datos.extraRedes; }
            
            item.precio = nuevoPrecio;
            item.subtotal = nuevoPrecio * item.cantidad;
        }
    });

    // 4. Renderizar el HTML y sumar el dinero final
    let totalDinero = 0;
    let listaHTML = "";
    
    carrito.forEach((item, index) => {
        totalDinero += item.subtotal;
        
        // ===== DISEÑO SIMPLIFICADO A 2 LÍNEAS =====
        // Quitamos la palabra "Caja Pastel" para no repetir y ahorrar espacio
        let nombreCorto = item.nombre.replace('Caja Pastel ', '');
        
        listaHTML += `
            <li style="position: relative;">
                <button class="btn-eliminar-item" style="position: absolute; right: 0; top: 10px;" onclick="eliminarDelCarrito(${index})">&times;</button>
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--texto-oscuro); width: 90%;">
                    ${item.cantidad} Cajas ${nombreCorto} <span style="color: var(--rosa-principal)">$${item.subtotal.toFixed(2)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--texto-secundario); margin-top: 3px; line-height: 1.2; width: 90%;">
                    Ref: ${item.detalle}
                </div>
            </li>`;
    });
    
    document.getElementById("lista-carrito").innerHTML = listaHTML;

    // ===== NUEVO: CÁLCULOS DE ENVÍO Y COMISIÓN =====
    let costoEnvio = 0;
    let costoComision = 0; // ¡Debe decir costoComision!
    
    // Leemos qué eligieron en el select de envío
    const selEntrega = document.getElementById("sel_entrega");
    if (selEntrega) {
        costoEnvio = parseFloat(selEntrega.value) || 0;
    }
    
    // Leemos qué eligieron en el select de pago
    const selPago = document.getElementById("sel_pago");
    let metodoPago = "Transferencia";
    if (selPago) {
        metodoPago = selPago.value;
        if (metodoPago === "PayPal") {
            costoComision = (totalDinero + costoEnvio) * 0.05; // 5% sobre el total
        }
    }
    
    let granTotal = totalDinero + costoEnvio + costoComision; // Todo bien sumado
    
    // Actualizamos los textos visuales de la página
    document.getElementById("fab-total").innerText = "$" + granTotal.toFixed(2);
    
    const modalTotal = document.getElementById("modal-total");
    modalTotal.innerText = "$" + granTotal.toFixed(2);
    
    // Guardamos los datos desglosados en el "dataset" para que el PDF los lea
    modalTotal.dataset.subtotal = totalDinero.toFixed(2);
    modalTotal.dataset.envio = costoEnvio.toFixed(2);
    modalTotal.dataset.comision = costoComision.toFixed(2); // Y aquí también debe decir costoComision
    modalTotal.dataset.metodopago = metodoPago === "PayPal" ? "PayPal (+5%)" : "Transferencia Bancaria";
    // ===============================================

    // ===== 5. TEXTOS DE MAYOREO ULTRA CORTOS =====
    let bannerMayoreoHTML = "";
    if (totalPasteles > 0) {
        if (totalPasteles < 40) {
            bannerMayoreoHTML = `<div class="banner-mayoreo">📦 <span>Menudeo:</span> Agrega ${40 - totalPasteles} cajas para 1er Mayoreo</div>`;
        } else if (totalPasteles < 80) {
            bannerMayoreoHTML = `<div class="banner-mayoreo">🎉 <span>1er Mayoreo:</span> Agrega ${80 - totalPasteles} para 2do Mayoreo</div>`;
        } else if (totalPasteles < 150) {
            bannerMayoreoHTML = `<div class="banner-mayoreo">🔥 <span>2do Mayoreo:</span> Agrega ${150 - totalPasteles} para 3er Mayoreo</div>`;
        } else {
            bannerMayoreoHTML = `<div class="banner-mayoreo">👑 <span>3er Mayoreo:</span> ¡Mejor precio desbloqueado!</div>`;
        }
    }

    // 6. Validar mínimos de compra globales (Textos más cortos)
    const btnPedido = document.querySelector(".btn-pedido");
    const alertaPiezas = document.getElementById("alertas-cantidades"); 
    const fabCarrito = document.getElementById("fab-carrito");
    const fabTexto = fabCarrito ? fabCarrito.querySelector("span:first-child") : null;

    let advertenciaHTML = "";
    let bloqueado = false;

    // Sumamos pasteles + cupcakes para el mínimo global de cajas
    let totalCajas = totalPasteles + totalCupcakes;

    if (totalBases > 0 && totalBases < 30) { 
        advertenciaHTML += `<div class="texto-alerta-rojo">⚠️ Bases: Faltan ${30 - totalBases} piezas (Mínimo: 30)</div>`; 
        bloqueado = true; 
    }
    if (totalCupcakes > 0 && totalCupcakes < 5) { 
        advertenciaHTML += `<div class="texto-alerta-rojo">⚠️ Cupcakes: Faltan ${5 - totalCupcakes} piezas (Mínimo por modelo: 5)</div>`; 
        bloqueado = true; 
    }
    if (totalCajas > 0 && totalCajas < 30) { 
        advertenciaHTML += `<div class="texto-alerta-rojo">⚠️ Cajas (Pasteles + Cupcakes): Faltan ${30 - totalCajas} piezas para el mínimo global de 30</div>`; 
        bloqueado = true; 
    }
    if (!bloqueado && carrito.length > 0) {
        advertenciaHTML += `<div class="texto-valido-verde">✅ Pedido autorizado</div>`;
        if(fabCarrito) fabCarrito.classList.add("carrito-listo");
        if(fabTexto && fabTexto.id !== "fab-total") fabTexto.innerHTML = "✅ ¡Pedido Listo! Toca aquí";
    } else {
        if(fabCarrito) fabCarrito.classList.remove("carrito-listo");
        if(fabTexto && fabTexto.id !== "fab-total") fabTexto.innerHTML = "🛒 Ver Pedido";
    }

    if(alertaPiezas) alertaPiezas.innerHTML = bannerMayoreoHTML + advertenciaHTML;
    if(btnPedido) btnPedido.disabled = bloqueado;
}
function abrirModal() {
    if(carrito.length === 0) return mostrarAlerta(" Tu carrito está vacío.");
    document.getElementById("modal-carrito").style.display = "block";
}
function cerrarModal() {
    document.getElementById("modal-carrito").style.display = "none";
}

function abrirModalDatos() {
    if(carrito.length === 0) return mostrarAlerta("Tu carrito está vacío.");

    // Cargar datos personales
    if (localStorage.getItem("minuit_nombre")) {
        document.getElementById("nombre_cliente").value = localStorage.getItem("minuit_nombre");
        document.getElementById("tel_cliente").value = localStorage.getItem("minuit_tel") || "";
        document.getElementById("correo_cliente").value = localStorage.getItem("minuit_correo") || "";
        document.getElementById("marca_cliente").value = localStorage.getItem("minuit_marca") || "";
        document.getElementById("ig_cliente").value = localStorage.getItem("minuit_ig") || "";
        mostrarAlerta("✨ Cargamos tus datos anteriores.");
    }
    
    document.getElementById("modal-datos").style.display = "block";
}

function cerrarModalDatos() {
    document.getElementById("modal-datos").style.display = "none";
}
function alternarModoEntrega() {
    const metodo = document.getElementById("sel_entrega").value;
    const bloqueTaller = document.getElementById("bloque_recoger_taller");
    const bloqueEnvio = document.getElementById("bloque_envio_nacional");

    if (metodo === "300") {
        // Eligió Envío Nacional: Oculta Taller, Muestra Botón Dirección
        bloqueTaller.style.display = "none";
        bloqueEnvio.style.display = "block";
    } else {
        // Eligió Recoger: Muestra Taller, Oculta Botón Dirección
        bloqueTaller.style.display = "block";
        bloqueEnvio.style.display = "none";
    }
}
// NUEVAS FUNCIONES PARA EL MODAL DE DIRECCIÓN
function abrirModalDireccion() {
    // Cerramos el modal de datos temporalmente
    cerrarModalDatos();
    
    // Cargar dirección
    if (localStorage.getItem("minuit_calle")) {
        document.getElementById("dir_calle").value = localStorage.getItem("minuit_calle") || "";
        document.getElementById("dir_numero").value = localStorage.getItem("minuit_numero") || "";
        document.getElementById("dir_colonia").value = localStorage.getItem("minuit_colonia") || "";
        document.getElementById("dir_cp").value = localStorage.getItem("minuit_cp") || "";
        document.getElementById("dir_ciudad").value = localStorage.getItem("minuit_ciudad") || "";
        document.getElementById("dir_estado").value = localStorage.getItem("minuit_estado") || "";
        document.getElementById("dir_referencias").value = localStorage.getItem("minuit_referencias") || "";
    }

    document.getElementById("modal-direccion").style.display = "block";
}

function cerrarModalDireccion() {
    document.getElementById("modal-direccion").style.display = "none";
    // Volvemos a abrir el modal principal para que terminen
    document.getElementById("modal-datos").style.display = "block";
}
function mostrarTerminosEnvio() {
    alert(
        " TÉRMINOS DE ENVÍO Y ELABORACIÓN \n\n" +
        "• El pago de $300 cubre el envío estándar. Si al momento de generar tu guía el sistema marca un costo excedente (zona extendida o sobrepeso), te avisaremos para cubrir la diferencia antes del envío.\n\n" +
        "• Tiempo de elaboración: 2 a 3 semanas.\n" +
        "• Tiempo de trayecto (paquetería): 2 a 3 días hábiles adicionales.\n\n" +
        "• Recuerda: Se requiere el pago del monto total para poder agendar tu pedido en nuestro calendario."
    );
}
// ==========================================
// GENERACIÓN DEL PDF NATIVO Y GOOGLE DRIVE
// ==========================================
async function procesarPedido() {
    let nombreCliente = document.getElementById("nombre_cliente").value.trim();
    let telCliente = document.getElementById("tel_cliente").value.trim();
    let correoCliente = document.getElementById("correo_cliente").value.trim() || "No especificado";
    let marcaCliente = document.getElementById("marca_cliente").value.trim() || "N/A";
    let igCliente = document.getElementById("ig_cliente").value.trim() || "N/A";
    
    // Extraer la dirección fraccionada
    let dirCalle = document.getElementById("dir_calle").value.trim();
    let dirNumero = document.getElementById("dir_numero").value.trim();
    let dirColonia = document.getElementById("dir_colonia").value.trim();
    let dirCp = document.getElementById("dir_cp").value.trim();
    let dirCiudad = document.getElementById("dir_ciudad").value.trim();
    let dirEstado = document.getElementById("dir_estado").value.trim();
    let dirReferencias = document.getElementById("dir_referencias").value.trim();

    // 1. Validar solo lo básico primero
    if (!nombreCliente || !telCliente) {
        abrirModalDatos();
        return mostrarAlerta("⚠️ Por favor llena tu Nombre y Teléfono.");
    }
    
    if (carrito.length === 0) return mostrarAlerta("🛒 Tu carrito está vacío.");

    let metodoEnvioSeleccionado = document.getElementById("sel_entrega").value;
    let direccionCliente = "";

    // 2. Validación Inteligente según el envío
    if (metodoEnvioSeleccionado === "300") {
        // Si es foráneo, obligamos a llenar todo
        if (!dirCalle || !dirNumero || !dirColonia || !dirCp || !dirCiudad || !dirEstado) {
            abrirModalDireccion();
            return mostrarAlerta("📍 Por favor completa todos los datos de tu Dirección de Envío.");
        }
        // Armamos la dirección completa para el PDF
        direccionCliente = `${dirCalle} #${dirNumero}, Col. ${dirColonia}, C.P. ${dirCp}, ${dirCiudad}, ${dirEstado}. Ref: ${dirReferencias || "Ninguna"}`;
    } else {
        // Si es local, lo dejamos pasar libremente y le ponemos este texto al PDF
        direccionCliente = "Entrega Local: Recogerá en Taller Minuit.";
    }

    // 3. Guardar en memoria
    localStorage.setItem("minuit_nombre", nombreCliente);
    localStorage.setItem("minuit_tel", telCliente);
    localStorage.setItem("minuit_correo", correoCliente !== "No especificado" ? correoCliente : "");
    localStorage.setItem("minuit_marca", marcaCliente !== "N/A" ? marcaCliente : "");
    localStorage.setItem("minuit_ig", igCliente !== "N/A" ? igCliente : "");
    localStorage.setItem("minuit_calle", dirCalle);
    localStorage.setItem("minuit_numero", dirNumero);
    localStorage.setItem("minuit_colonia", dirColonia);
    localStorage.setItem("minuit_cp", dirCp);
    localStorage.setItem("minuit_ciudad", dirCiudad);
    localStorage.setItem("minuit_estado", dirEstado);
    localStorage.setItem("minuit_referencias", dirReferencias);

    mostrarAlerta("⏳ Generando nota de pedido...");
    document.querySelector(".btn-pedido").disabled = true;

    // Rescatamos los cálculos de envío y sión
    let totalTxt = document.getElementById("modal-total").innerText;
    let datosTotal = document.getElementById("modal-total").dataset;
    let valSubtotal = parseFloat(datosTotal.subtotal || 0);
    let valEnvio = parseFloat(datosTotal.envio || 0);
    let valsion = parseFloat(datosTotal.sion || 0);
    let metodoPagoTexto = datosTotal.metodopago || "Transferencia";
    let tipoEntrega = valEnvio > 0 ? "Envío Nacional" : "Recoger en taller Minuit / Mandar Uber";

    // 2. Plantilla exacta de WhatsApp solicitada por Ely
    let textoWhatsApp = `Hola Minuit!, Aquí están los datos de mi pedido:\n\n DATOS \n*Nombre completo:* ${nombreCliente}\n *# Telefónico:* ${telCliente}\n *Nombre de tu marca:* ${marcaCliente}\n *Usuario de Instagram:* ${igCliente}\n *Dirección completa:* ${direccionCliente}\n *Correo electrónico:* ${correoCliente}\n\n *ENTREGA:* ${tipoEntrega}\n *PAGO:* ${metodoPagoTexto}\n *TOTAL A PAGAR: ${totalTxt}*\n`;

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const COLOR_PRINCIPAL = [232, 123, 158];
        const COLOR_FONDO = [253, 240, 244];
        const COLOR_TEXTO = [74, 59, 64];

       // --- ENCABEZADO Y LOGO ---
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 210, 35, "F");

        const canvasLogo = document.createElement("canvas");
        canvasLogo.width = 500;
        canvasLogo.height = 150;
        const ctx = canvasLogo.getContext("2d");
        const gradiente = ctx.createLinearGradient(0, 0, 500, 150);
        gradiente.addColorStop(0, "#f48fb1");
        gradiente.addColorStop(1, "#e16b90");
        ctx.font = "bold 130px 'Dancing Script', cursive";
        ctx.fillStyle = gradiente;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Minuit", 250, 75);
        
        pdf.addImage(canvasLogo.toDataURL("image/png"), "PNG", 70, 5, 70, 21);

        pdf.setTextColor(158, 127, 138); 
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("NOTA DE PEDIDO", 105, 32, { align: "center" });

        pdf.setDrawColor(240, 220, 227); 
        pdf.setLineWidth(0.5);
        pdf.line(15, 35, 195, 35);

        // --- CAJA DE DATOS DEL CLIENTE AMPLIADA ---
        pdf.setFillColor(...COLOR_FONDO);
        pdf.roundedRect(15, 38, 180, 32, 4, 4, "F"); // Caja más alta
        pdf.setTextColor(...COLOR_TEXTO);
        pdf.setFontSize(9);
        
        // Columna 1
        pdf.setFont("helvetica", "bold"); pdf.text("Cliente:", 20, 44);
        pdf.setFont("helvetica", "normal"); pdf.text(nombreCliente, 40, 44);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Teléfono:", 20, 49);
        pdf.setFont("helvetica", "normal"); pdf.text(telCliente, 40, 49);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Marca/IG:", 20, 54);
        pdf.setFont("helvetica", "normal"); pdf.text(`${marcaCliente} | ${igCliente}`, 40, 54);
        
        // Columna 2
        pdf.setFont("helvetica", "bold"); pdf.text("Fecha:", 115, 44);
        pdf.setFont("helvetica", "normal"); pdf.text(new Date().toLocaleDateString("es-MX"), 135, 44);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Entrega:", 115, 49);
        pdf.setFont("helvetica", "normal"); pdf.text(tipoEntrega, 135, 49);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Pago:", 115, 54);
        pdf.setFont("helvetica", "normal"); pdf.text(metodoPagoTexto, 135, 54);

        // Dirección abarcando el ancho inferior de la caja
        pdf.setFont("helvetica", "bold"); pdf.text("Dirección:", 20, 61);
        pdf.setFont("helvetica", "normal");
        let lineasDir = pdf.splitTextToSize(direccionCliente, 150);
        pdf.text(lineasDir, 40, 61);

        // --- TABLA DE PRODUCTOS ---
        let y = 76; // Bajamos el inicio de la tabla
        pdf.setFillColor(...COLOR_PRINCIPAL);
        pdf.rect(15, y, 180, 10, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("PRODUCTO", 20, y + 7);
        pdf.text("CANT.", 130, y + 7, { align: "center" });
        pdf.text("TOTAL", 185, y + 7, { align: "right" });
        y += 15;

        pdf.setTextColor(...COLOR_TEXTO);
        
        carrito.forEach(item => {
            if (y > 230) {
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

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            let lineasDetalle = pdf.splitTextToSize(String(item.detalle || ""), 90); 
            pdf.text(lineasDetalle, 20, y + 4);

            pdf.setFontSize(10);
            pdf.text(String(item.cantidad), 130, y, { align: "center" });
            pdf.text("$" + item.subtotal.toFixed(2), 185, y, { align: "right" });

            let alturaExtra = lineasDetalle.length * 3;
            y += Math.max(10, alturaExtra + 4);

            pdf.setDrawColor(240, 220, 227);
            pdf.line(20, y - 3, 190, y - 3);
            y += 5;
        });

        // --- CÁLCULOS FINALES Y DESGLOSE ---
        y += 5;
        if (y > 220) { pdf.addPage(); y = 30; }

        pdf.setFillColor(...COLOR_FONDO);
        pdf.roundedRect(100, y, 95, valsion > 0 ? 38 : 32, 4, 4, "F");
        
        pdf.setTextColor(...COLOR_TEXTO);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        let yDesglose = y + 8;
        pdf.text("Subtotal artículos:", 105, yDesglose);
        pdf.text("$" + valSubtotal.toFixed(2), 190, yDesglose, { align: "right" });
        
        yDesglose += 7;
        pdf.text("Envío Nacional:", 105, yDesglose);
        pdf.text("$" + valEnvio.toFixed(2), 190, yDesglose, { align: "right" });
        
        if (valsion > 0) {
            yDesglose += 7;
            pdf.text("Comisión Paypal (5%):", 105, yDesglose);
            pdf.text("$" + valComision.toFixed(2), 190, yDesglose, { align: "right" });
        }

        yDesglose += 9;
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...COLOR_PRINCIPAL);
        pdf.setFontSize(12);
        pdf.text("TOTAL A PAGAR:", 105, yDesglose);
        pdf.setFontSize(14);
        pdf.text(totalTxt, 190, yDesglose, { align: "right" });

        // --- TÉRMINOS Y CONDICIONES (Las reglas de Ely) ---
        let yTerminos = y + 10;
        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text("TÉRMINOS DEL PEDIDO:", 15, yTerminos);
        pdf.setFont("helvetica", "normal");
        
        let terminos = [
            "• Se requiere el pago del monto total para poder agendar tu pedido.",
            "• Tiempo de elaboración: 2 a 3 semanas + 2 a 3 días de envío.",
            "• Si el envío marca un costo excedente al generar la guía, se notificará para cubrir la diferencia.",
            "• Precios no incluyen IVA. Si deseas factura, se agregará el impuesto correspondiente."
        ];
        
        terminos.forEach(linea => {
            yTerminos += 5;
            let textoDividido = pdf.splitTextToSize(linea, 80); 
            pdf.text(textoDividido, 15, yTerminos);
            yTerminos += (textoDividido.length - 1) * 4; 
        });

        // --- PIE DE PÁGINA ---
        pdf.setDrawColor(240, 220, 227); 
        pdf.setLineWidth(0.5);
        pdf.line(20, 275, 190, 275); 

        pdf.setTextColor(74, 59, 64);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("¡Gracias por tu compra en Minuit!", 105, 283, { align: "center" });
        pdf.setTextColor(232, 123, 158);
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.text("Contacto WA: " + numeroDueno, 105, 289, { align: "center" });

        const nombreArchivo = `Pedido_Minuit_${nombreCliente.replace(/\s+/g, "_")}.pdf`;

        // =========================================================
        // SUBIR A GOOGLE DRIVE (AHORA BLINDADO CONTRA SATURACIÓN)
        // =========================================================
        const pdfBase64 = pdf.output('datauristring');
        const urlGoogleScript = "https://script.google.com/macros/s/AKfycbw_RFDbSPc0tZNODZ2cltlC26DtKGciqqkkrLvhHSeg-NkyJ-CfpaQiMbfS0ftjHa77-A/exec";

        try {
            // Intentamos conectar a Google Drive
            const respuesta = await fetch(urlGoogleScript, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ nombreArchivo: nombreArchivo, base64: pdfBase64 })
            });

            const resultado = await respuesta.json();

            if (resultado.estatus === 'exito') {
                textoWhatsApp += `\n📁 *Descarga el PDF de registro aquí:*\n👉 ${resultado.urlDrive}`;
            }
        } catch (errorDrive) {
            // Si Google Drive se satura o tarda mucho, atrapamos el error en silencio
            // y permitimos que el código continúe para no perder al cliente.
            console.warn("Google Drive tardó demasiado, saltando guardado en la nube.");
        }

        // =========================================================
        // CIERRE DE VENTA (ESTO SE EJECUTA SÍ O SÍ)
        // =========================================================
        // Sin importar si Drive funcionó o falló, siempre le damos el PDF al cliente 
        // y lo mandamos a WhatsApp para cerrar su pedido.
        pdf.save(nombreArchivo); 
        abrirWhatsAppYLimpiar(textoWhatsApp);

    } catch (error) {
        // Este error ya solo saltará si falla la creación del PDF en sí (casi imposible)
        console.error("Error al procesar el pedido:", error);
        alert("Ocurrió un error al generar la nota. Por favor intenta de nuevo.");
        document.querySelector(".btn-pedido").disabled = false;
    }
}
function abrirWhatsAppYLimpiar(textoWhatsApp) {
    let textoCodificado = encodeURIComponent(textoWhatsApp);
    let linkWhatsApp = `https://wa.me/${numeroDueno}?text=${textoCodificado}`;

    carrito = [];
    actualizarVistaCarrito();
    cerrarModal();          // Cierra el carrito
    cerrarModalDatos();     // Cierra el formulario de datos

    //limpieza de casillas
    document.getElementById("nombre_cliente").value = "";
    document.getElementById("tel_cliente").value = "";
    document.getElementById("dir_calle").value = "";
    document.getElementById("dir_numero").value = "";
    document.getElementById("dir_colonia").value = "";
    document.getElementById("dir_cp").value = "";
    document.getElementById("dir_ciudad").value = "";
    document.getElementById("dir_estado").value = "";
    document.getElementById("dir_referencias").value = "";
    
    // Reactivamos el botón por si quieren hacer otro pedido
    if(document.getElementById("btn_finalizar_pedido")) {
        document.getElementById("btn_finalizar_pedido").disabled = false;
    }

    window.location.href = linkWhatsApp;
}
