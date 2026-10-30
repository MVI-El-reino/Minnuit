// ==========================================================================
// REGISTRO DE CAMBIOS (20/10/2026)
// 1. CUPCAKES - Soporte interno: se quitó el selector "Color del Soporte Interno".
//    Ahora el color es fijo (constante SOPORTE_INTERNO_COLOR) y se le muestra al cliente
//    solo si pide soporte. Si el cliente elige "No", el carrito dice "Soporte interior: No".
// 2. CUPCAKES - Logotipo y redes: se agregaron "Color del Logotipo", "Redes Sociales",
//    "Medida de Redes" y "Anota tus redes / Observaciones", igual que en Cajas para Pastel.
// 3. PAGO - PayPal ahora se muestra como "Mercado Pago/PayPal (+5% de comisión)" en el menú
//    y en el PDF (campo Pago y etiqueta de la comisión). El valor interno sigue siendo "PayPal".
// 4. ENVÍO Y PAGO - Estos menús se dibujan con Choices, igual que los de los pedidos.
// ==========================================================================

let carrito = [];
const numeroDueno = "522215836232"; 

// Colores del PDF de la nota de pedido (ajústalos a los de tu marca)
const COLOR_FONDO = [252, 240, 245];
const COLOR_TEXTO = [60, 50, 55];
const COLOR_PRINCIPAL = [245, 143, 176];

// Usa tus variables ofuscadas de Telegram aquí
const tokenParte1 = "AQUI_TU_NUMERO"; 
const tokenParte2 = "AQUI_TUS_LETRAS"; 
const TELEGRAM_BOT_TOKEN = tokenParte1 + ":" + tokenParte2; 
const TELEGRAM_CHAT_ID = "PEGA_AQUI_TU_ID"; 

const basesBasicPrecios = {
    "3mm": { "15cm": 25, "20cm": 35, "23cm": 38, "25cm": 40, "28cm": 45, "30cm": 50, "35cm": 65, "40cm": 80, "45cm": 110, "50cm": 125 },
    "6mm": { "15cm": 35, "20cm": 45, "23cm": 50, "25cm": 65, "28cm": 75, "30cm": 90, "35cm": 110, "40cm": 130, "45cm": 150, "50cm": 180 },
    "9mm": { "15cm": 50, "20cm": 60, "23cm": 75, "25cm": 85, "28cm": 110, "30cm": 140, "35cm": 160, "40cm": 190, "45cm": 220, "50cm": 250 }
};

const basesPremiumPrecios = {
    "3mm": { "15cm": 33, "20cm": 45, "23cm": 48, "25cm": 55, "28cm": 60, "30cm": 65, "35cm": 80, "40cm": 100, "45cm": 125, "50cm": 145 },
    "6mm": { "15cm": 53, "20cm": 60, "23cm": 70, "25cm": 78, "28cm": 90, "30cm": 105, "35cm": 125, "40cm": 145, "45cm": 170, "50cm": 200 },
    "9mm": { "15cm": 60, "20cm": 75, "23cm": 85, "25cm": 95, "28cm": 120, "30cm": 150, "35cm": 170, "40cm": 200, "45cm": 230, "50cm": 260 }
};

const coloresLogotipo = {
    "Basic": ["dorado espejo", "tornasol sirena", "rosa espejo", "rosa pastel", "rosa mexicano", "morado", "azul cielo", "jade(verde azulado)", "negro mate"],
    "Premium": ["blanco", "dorado", "negro"]
};

const cupcakesPreciosBase = { "21cm": 18, "31cm": 25 };
// ==========================================
// SOPORTE INTERNO DE CUPCAKES (CAMBIO 1)
// La dueña ya no deja elegir el color: el cliente ve el color fijo y su costo.
// Para cambiar el color o el precio, modifica SOLO estas dos líneas.
// ==========================================
const SOPORTE_INTERNO_COLOR = "Blanco";   // Color que se incluye cuando el cliente pide soporte
const SOPORTE_INTERNO_PRECIO = 0;         // Costo extra del soporte (0 = gratis)

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

// Copia de las opciones originales de cada selector (se guarda una sola vez al cargar la página)
const opcionesOriginales = {};

// Configuración única de los menús Choices (la misma al arrancar y al reconstruirlos)
const CONFIG_MENU = { searchEnabled: false, itemSelectText: "", shouldSort: false, position: "auto" };

// Reemplaza las opciones de un menú. No edita la lista que ya está dibujada: quita el menú anterior,
// deja el <select> nativo solo con las opciones nuevas y crea el menú otra vez.
// Así nunca se acumulan opciones ni queda un menú viejo en pantalla.
function reemplazarOpciones(id, opciones) {
    // Esperamos un instante para no reconstruir el menú mientras Choices todavía procesa el clic
    setTimeout(() => {
        const select = document.getElementById(id);
        if (!select) return;

        // Lo que el cliente tiene elegido en este momento
        const valorActual = select.value;
        const elegido = opciones.find(o => o.value === valorActual) || opciones.find(o => o.selected) || opciones[0];

        // 1. Quitamos el menú anterior de la pantalla
        if (instanciasSelect[id]) {
            try {
                instanciasSelect[id].destroy();
            } catch (error) {
                console.warn("No se pudo quitar el menú anterior de " + id, error);
            }
            delete instanciasSelect[id];
        }

        // 2. Dejamos el <select> nativo solo con las opciones nuevas
        select.innerHTML = "";
        opciones.forEach(o => {
            const opcion = document.createElement("option");
            opcion.value = o.value;
            opcion.text = o.label;
            opcion.selected = (o === elegido);
            select.appendChild(opcion);
        });

        // 3. Creamos el menú de nuevo a partir de ese <select>
        instanciasSelect[id] = new Choices(select, CONFIG_MENU);
    }, 0);
}

function inicializarTienda() { 
    const selectEnvioInicial = document.getElementById("sel_entrega");
    if (selectEnvioInicial) selectEnvioInicial.value = "0";
    // Guardamos las opciones originales de todos los selects antes de que Choices los modifique
    document.querySelectorAll("select").forEach(select => {
        if (!opcionesOriginales[select.id]) opcionesOriginales[select.id] = Array.from(select.options).map(opt => opt.value);
    });

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

    // CAMBIO 2: el color del logotipo de cupcakes usa la misma lista que pasteles
    const selectColorCupcake = document.getElementById("sel_color_logo_cupcake");
    if (selectColorCupcake) {
        selectColorCupcake.innerHTML = "";
        coloresLogotipoPastel.forEach(color => {
            const option = document.createElement("option");
            option.value = color; option.text = color;
            selectColorCupcake.add(option);
        });
    }

    // Convertir todos los selects a la capa premium (Versión fluida)
    // CAMBIO 4: dibujamos con Choices los selects de los pedidos Y también los de envío y pago
    const selectsDeMenu = [...document.querySelectorAll('.controles-config select'), document.getElementById("sel_entrega"), document.getElementById("sel_pago"), document.getElementById("sel_factura")].filter(Boolean);
    selectsDeMenu.forEach(select => {
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
        reemplazarOpciones(id, opciones);
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

    const tamanosDisponibles = (opcionesOriginales[tamanoSelect.id] || Array.from(tamanoSelect.options).map(opt => opt.value));
    const grosoresDisponibles = (opcionesOriginales[grosorSelect.id] || Array.from(grosorSelect.options).map(opt => opt.value));
    const precios = (linea === "Basic") ? basesBasicPrecios : basesPremiumPrecios;

    // ACTUALIZACIÓN FANTASMA (Sin destruir el menú)
    if (instanciasSelect["sel_tamano_base"]) {
        let opcionesTamano = tamanosDisponibles.map(val => ({
            value: val, label: `${val} - $${precios[grosorActual][val]}`, selected: (val === tamanoActual)
        }));
        reemplazarOpciones("sel_tamano_base", opcionesTamano);
    }

    if (instanciasSelect["sel_grosor_base"]) {
        let opcionesGrosor = grosoresDisponibles.map(val => ({
            value: val, label: `${val} - $${precios[val][tamanoActual]}`, selected: (val === grosorActual)
        }));
        reemplazarOpciones("sel_grosor_base", opcionesGrosor);
    }

    if (instanciasSelect["sel_color_logo_base"]) {
        let opcionesColor = coloresLogotipo[linea].map(color => ({
            value: color, label: color.charAt(0).toUpperCase() + color.slice(1), selected: (color === colorActual)
        }));
        reemplazarOpciones("sel_color_logo_base", opcionesColor);
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

    const nombreCompuesto = `Bases ${linea} ${forma} ${grosor} ${tamano}`;
    const detalleCompuesto = `Logo: ${colorLogo}`;
    
    // LÓGICA ANTI-DUPLICADOS
    const index = carrito.findIndex(item => item.nombre === nombreCompuesto && item.detalle === detalleCompuesto);
    if (index !== -1) {
        carrito[index].cantidad += cantidad;
        carrito[index].subtotal = carrito[index].cantidad * precioBaseActual;
    } else {
        carrito.push({ nombre: nombreCompuesto, cantidad, detalle: detalleCompuesto, precio: precioBaseActual, subtotal: precioBaseActual * cantidad });
    }
    
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
    // CAJAS DE CUPCAKES: calcula el precio con capacidad, soporte y redes.
    // Se vuelve a ejecutar cada vez que el cliente cambia un menú de cupcakes.
    const tamanoSelect = document.getElementById("sel_tamano_cupcake");
    const tieneSoporteSelect = document.getElementById("sel_tiene_soporte");
    const redesSelect = document.getElementById("sel_redes_cupcake");
    const medidaRedesSelect = document.getElementById("sel_medida_redes_cupcake");

    if (!tamanoSelect || !tieneSoporteSelect || !redesSelect || !medidaRedesSelect) return;

    // ----------------------------------------------------------
    // 1. SOPORTE INTERNO (CAMBIO 1)
    // El color ya no se elige: solo se muestra el color fijo si el cliente pide soporte.
    // El color y el precio se cambian en SOPORTE_INTERNO_COLOR y SOPORTE_INTERNO_PRECIO (arriba).
    // ----------------------------------------------------------
    const tieneSoporte = tieneSoporteSelect.value === "Si";
    const textoSoporte = document.getElementById("texto_soporte_interno");
    if (textoSoporte) textoSoporte.style.display = tieneSoporte ? "block" : "none";

    const spanColorSoporte = document.getElementById("color_soporte_fijo");
    if (spanColorSoporte) spanColorSoporte.innerText = SOPORTE_INTERNO_COLOR;

    const extraSoporte = tieneSoporte ? SOPORTE_INTERNO_PRECIO : 0;

    // ----------------------------------------------------------
    // 2. REDES SOCIALES (CAMBIO 2)
    // Igual que en Cajas para Pastel: si el cliente elige redes, aparece "Medida de Redes"
    // y su costo (el "value" de la opción) se suma al precio de la caja.
    // ----------------------------------------------------------
    const contenedorRedes = document.getElementById("contenedor_redes_medida_cupcake");
    let costoExtraRedes = 0;
    if (redesSelect.value === "Si") {
        contenedorRedes.style.display = "block";
        costoExtraRedes = parseFloat(medidaRedesSelect.value) || 0;
    } else {
        contenedorRedes.style.display = "none";
        costoExtraRedes = 0;
    }

    // ----------------------------------------------------------
    // 3. PRECIOS DE LAS CAPACIDADES (menú "Capacidad")
    // ----------------------------------------------------------
    const tamanoActual = tamanoSelect.value;
    const tamanosDisponibles = (opcionesOriginales[tamanoSelect.id] || Array.from(tamanoSelect.options).map(opt => opt.value));

    // Textos largos que ve el cliente en el menú de capacidad
    const nombresLargosCupcakes = {
        "21cm": "2 cupcakes - 21x12x7.5 cm",
        "31cm": "4 cupcakes - 31 x 12 x 7.5 cm"
    };

    if (instanciasSelect["sel_tamano_cupcake"]) {
        const opcionesTamano = tamanosDisponibles.map(val => {
            // Precio que se muestra = base de la capacidad + soporte (si lo pide) + redes (si las elige)
            const pBase = cupcakesPreciosBase[val] + extraSoporte + costoExtraRedes;
            const textoAmostar = nombresLargosCupcakes[val] || val;
            return { value: val, label: `${textoAmostar} - $${pBase}`, selected: (val === tamanoActual) };
        });
        reemplazarOpciones("sel_tamano_cupcake", opcionesTamano);
    }

    // ----------------------------------------------------------
    // 4. PRECIO MAESTRO: el que se guarda al agregar la caja al carrito
    // ----------------------------------------------------------
    precioCupcakeActual = cupcakesPreciosBase[tamanoActual] + extraSoporte + costoExtraRedes;
    document.getElementById("precio_config_cupcake").innerText = `$${precioCupcakeActual.toFixed(2)} MXN`;
}

// ==========================================
// AGREGAR UNA CAJA DE CUPCAKES AL CARRITO (CAMBIOS 1 y 2)
// El nombre sigue incluyendo "Cupcake", así el carrito cuenta bien los mínimos.
// El detalle guarda soporte, color del logotipo, redes y notas, igual que las cajas de pastel.
// ==========================================
function agregarCupcakeConfigAlCarrito() {
    const cantidad = parseInt(document.getElementById("cant_cupcake_config").value);
    const tamano = document.getElementById("sel_tamano_cupcake").value;
    const tieneSoporte = document.getElementById("sel_tiene_soporte").value === "Si";
    const colorLogo = document.getElementById("sel_color_logo_cupcake").value;
    const redes = document.getElementById("sel_redes_cupcake").value;
    const extraInfo = document.getElementById("detalle_cupcake1").value || "Sin notas extra";

    // --- NUEVO FORMATO DEL NOMBRE PARA CUPCAKES ---
    const cantidadCupcakes = tamano === "31cm" ? "4" : "2";
    const nombre = `Caja (${cantidadCupcakes} Cupcakes) ${tamano}`;
    
    // Antes siempre salía el color del soporte, aunque el cliente eligiera "No". Ahora dice "No" cuando no lo pide.
    const soporteTexto = tieneSoporte ? `${SOPORTE_INTERNO_COLOR} (incluido)` : "No";
    const detalle = `Soporte interior: ${soporteTexto} | Logo: ${colorLogo} | Redes: ${redes} | Notas: ${extraInfo}`;

    // LÓGICA ANTI-DUPLICADOS
    const index = carrito.findIndex(item => item.nombre === nombre && item.detalle === detalle);
    if (index !== -1) {
        carrito[index].cantidad += cantidad;
        carrito[index].subtotal = carrito[index].cantidad * precioCupcakeActual;
    } else {
        carrito.push({ nombre, cantidad, detalle, precio: precioCupcakeActual, subtotal: precioCupcakeActual * cantidad });
    }

    // Regresamos los menús a su opción inicial para la siguiente caja
    resetearSelect("sel_tamano_cupcake");
    resetearSelect("sel_color_logo_cupcake");
    resetearSelect("sel_redes_cupcake");
    document.getElementById("detalle_cupcake1").value = "";
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
        reemplazarOpciones("sel_tamano_pastel", opcionesNuevas);
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
    // LÓGICA ANTI-DUPLICADOS
    const index = carrito.findIndex(item => item.nombre === nombre && item.detalle === detalle);
    if (index !== -1) {
        carrito[index].cantidad += cantidad;
        carrito[index].subtotal = carrito[index].cantidad * precioPastelActual;
    } else {
        carrito.push({ 
            nombre, cantidad, detalle, precio: precioPastelActual, subtotal: precioPastelActual * cantidad,
            tipoPastel: tipo,
            tamanoPastel: tamano,
            redesPastel: redes
        });
    }
    
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
    actualizarCarrito();
    if(carrito.length === 0) { cerrarModal(); }
}

function actualizarVistaCarrito() {
    // 1. Calcular totales de piezas por categoría
    let totalBases = 0;
    let totalCupcakes = 0; 
    let totalPasteles = 0;
    
    carrito.forEach(item => {
        if(item.nombre.includes("Bases")) { totalBases += item.cantidad; }
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
       
        let nombreCorto = item.nombre.replace('Caja Pastel ', '');
        
        // 1. Filtramos y armamos el texto perfecto según el tipo de producto
        let prefijo = nombreCorto.includes('Bases') ? ' ' : 'Cajas';
        let nombreLimpio = nombreCorto;

        // Si detecta que es un cupcake, reordena las palabras a tu gusto
        if (nombreCorto.includes('Cupcake')) {
            let medida = nombreCorto.includes('31cm') ? '31cm' : '21cm';
            let capacidadText = medida === '31cm' ? '(4 cupcakes)' : '(2 cupcakes)';
            nombreLimpio = `${capacidadText} ${medida}`;
            prefijo = 'Cajas';
        }

        // 2. Imprimimos el elemento en el carrito
        listaHTML += `
            <li style="position: relative;">
                <button class="btn-eliminar-item" style="position: absolute; right: 0; top: 10px;" onclick="eliminarDelCarrito(${index})">&times;</button>
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--texto-oscuro); width: 90%;">
                    ${item.cantidad} - ${prefijo} ${nombreLimpio} <span style="color: var(--rosa-principal)">$${item.subtotal.toFixed(2)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--texto-secundario); margin-top: 3px; line-height: 1.2; width: 90%;">
                    Ref: ${item.detalle}
                </div>
            </li>`;
    });
    
    document.getElementById("lista-carrito").innerHTML = listaHTML;

    let costoEnvio = 0;
    let costoComision = 0; 
    let costoIVA = 0; 
    
    // Leemos qué eligieron en el select de envío
    const selEntrega = document.getElementById("sel_entrega");
    if (selEntrega) { costoEnvio = parseFloat(selEntrega.value) || 0; }
    
    // Leemos qué eligieron en el select de pago (Solo una vez)
    const selPago = document.getElementById("sel_pago");
    let metodoPago = "Transferencia";
    if (selPago) {
        metodoPago = selPago.value;
    }

    // Leemos qué eligieron en el select de factura
    const selFactura = document.getElementById("sel_factura");
    let requiereFactura = selFactura ? selFactura.value : "No";

    // ========================================================
    // ACTUALIZAR EL RECUADRO DE DATOS BANCARIOS VISUALES
    // ========================================================
    const cajaBancos = document.getElementById("caja_datos_bancarios");
    if (cajaBancos) {
        if (metodoPago === "PayPal") {
            // --- ELIGIÓ TARJETA DE CRÉDITO (LINK MERCADO PAGO) ---
            if (requiereFactura === "Si") {
                cajaBancos.innerHTML = `
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #e87b9e; font-size: 0.95rem;">💳 PAGO CON TARJETA + FACTURA</p>
                    <div style="box-sizing: border-box; background: white; padding: 10px; border-radius: 8px; border: 1px solid #fce4ec;">
                        <p style="margin: 0 0 6px 0;">Al confirmar tu pedido, te enviaremos por WhatsApp tu <strong>link de pago seguro</strong> (Mercado Pago).</p>
                        <p style="margin: 0; font-size: 0.8rem; color: #d81b60;">* Recuerda tener a la mano tu Constancia de Situación Fiscal.</p>
                    </div>
                `;
            } else {
                cajaBancos.innerHTML = `
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #e87b9e; font-size: 0.95rem;">💳 PAGO CON TARJETA</p>
                    <div style="box-sizing: border-box; background: white; padding: 10px; border-radius: 8px; border: 1px solid #fce4ec;">
                        <p style="margin: 0;">Al confirmar tu pedido, te enviaremos por WhatsApp tu <strong>link de pago seguro</strong> (Mercado Pago) para que pagues cómodamente.</p>
                    </div>
                `;
            }
        } else {
            // --- ELIGIÓ TRANSFERENCIA BANCARIA ---
            if (requiereFactura === "Si") {
                // Imagen 3 (Banamex - Factura) -> Ahora con el recuadro blanco igual que Santander
                cajaBancos.innerHTML = `
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #e87b9e; font-size: 0.95rem;">DATOS BANCARIOS</p>
                    <div style="box-sizing: border-box; background: white; padding: 10px; border-radius: 8px; border: 1px solid #fce4ec;">
                        <p style="margin: 0 0 5px 0; font-weight: bold; color: #4a3b40;">🏦 BANAMEX</p>
                        <p style="margin: 0 0 3px 0;"><strong>Nombre:</strong> Daniel Bonilla Rodriguez</p>
                        <p style="margin: 0 0 3px 0;"><strong>No° cuenta:</strong> 886 5665 / Suc. 7012</p>
                        <p style="margin: 0 0 3px 0;"><strong>CLABE:</strong> 0026 5070 1288 6566 51</p>
                        <p style="margin: 0;"><strong>Tarjeta (Oxxo):</strong> 5204 1662 4268 9190</p>
                    </div>
                `;
            } else {
                // Imágenes 1 y 2 (Santander y Mercado Pago en carrusel) -> Con flechas y títulos limpios
                cajaBancos.innerHTML = `
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #e87b9e; font-size: 0.95rem;">DATOS BANCARIOS</p>
                    <div style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 10px; padding-bottom: 5px;">
                        
                        <!-- Tarjeta 1: Santander -->
                        <div style="flex: 0 0 100%; scroll-snap-align: center; box-sizing: border-box; background: white; padding: 10px; border-radius: 8px; border: 1px solid #fce4ec; position: relative;">
                            <p style="margin: 0 0 5px 0; font-weight: bold; color: #4a3b40;">🏦 Opción 1: SANTANDER</p>
                            <p style="margin: 0 0 3px 0;"><strong>Nombre:</strong> Elizabeth Ramirez Ramirez</p>
                            <p style="margin: 0 0 3px 0;"><strong>No° cuenta:</strong> 1402 4074 580</p>
                            <p style="margin: 0 0 3px 0;"><strong>CLABE:</strong> 0146 5014 0240 7458 03</p>
                            <p style="margin: 0; width: 85%;"><strong>Tarjeta (Oxxo):</strong> 5579 0870 1226 6216</p>
                            
                            <!-- Flecha indicadora derecha -->
                            <div style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #ff6b96; font-size: 22px; font-weight: bold; opacity: 0.7;">
                                ❯
                            </div>
                        </div>
                        
                        <!-- Tarjeta 2: Mercado Pago -->
                        <div style="flex: 0 0 100%; scroll-snap-align: center; box-sizing: border-box; background: white; padding: 10px; border-radius: 8px; border: 1px solid #fce4ec; position: relative;">
                            <!-- Flecha indicadora izquierda -->
                            <div style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #ff6b96; font-size: 22px; font-weight: bold; opacity: 0.7;">
                                ❮
                            </div>
                            
                            <div style="margin-left: 28px;">
                                <p style="margin: 0 0 5px 0; font-weight: bold; color: #4a3b40;">💳 Opción 2: MERCADO PAGO</p>
                                <p style="margin: 0 0 3px 0;"><strong>Nombre:</strong> Elizabeth Ramírez Ramírez</p>
                                <p style="margin: 0 0 3px 0;"><strong>CLABE:</strong> 722 969 070 993 840 205</p>
                                <p style="margin: 0; font-size: 0.8rem; color: #a39599;">(Transferencia directa a cuenta)</p>
                            </div>
                        </div>
                        
                    </div>
                `;
            }
        }
    }
    // ========================================================

    // TU MATEMÁTICA INTACTA
    let subtotalPrevio = totalDinero + costoEnvio + costoComision;
    if (requiereFactura === "Si") {
        costoIVA = subtotalPrevio * 0.16; // 16% sobre todo lo anterior
    }
    
    let granTotal = subtotalPrevio + costoIVA;
    
    // Actualizamos los textos visuales de la página
    document.getElementById("fab-total").innerText = "$" + granTotal.toFixed(2);
    
    const modalTotal = document.getElementById("modal-total");
    modalTotal.innerText = "$" + granTotal.toFixed(2);
    
    // Guardamos los datos desglosados en el "dataset" para que el PDF los lea
    modalTotal.dataset.subtotal = totalDinero.toFixed(2);
    modalTotal.dataset.envio = costoEnvio.toFixed(2);
    modalTotal.dataset.comision = costoComision.toFixed(2); 
    modalTotal.dataset.iva = costoIVA.toFixed(2); 
    modalTotal.dataset.factura = requiereFactura; 
    modalTotal.dataset.metodopago = metodoPago === "PayPal" ? "Tarjeta de credito (link Mercado Pago)" : "Transferencia Bancaria";
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
// NUEVAS FUNCIONES PARA EL MODAL DE DIRECCIÓN
function abrirModalDireccion() {
    // Cerramos el modal de datos temporalmente
    cerrarModalDatos();
    
    // Si hay una dirección guardada en el celular, mostramos el botón. Si no, se queda oculto.
    const btnCargar = document.getElementById("btn_cargar_direccion");
    if (btnCargar) {
        if (localStorage.getItem("minuit_calle")) {
            btnCargar.style.display = "block";
        } else {
            btnCargar.style.display = "none";
        }
    }

    document.getElementById("modal-direccion").style.display = "block";
}

function cargarDireccionGuardada() {
    // Rellenamos los campos con la bóveda local del navegador
    if (localStorage.getItem("minuit_calle")) {
        document.getElementById("dir_calle").value = localStorage.getItem("minuit_calle") || "";
        document.getElementById("dir_numero").value = localStorage.getItem("minuit_numero") || "";
        document.getElementById("dir_colonia").value = localStorage.getItem("minuit_colonia") || "";
        document.getElementById("dir_cp").value = localStorage.getItem("minuit_cp") || "";
        document.getElementById("dir_ciudad").value = localStorage.getItem("minuit_ciudad") || "";
        document.getElementById("dir_estado").value = localStorage.getItem("minuit_estado") || "";
        document.getElementById("dir_referencias").value = localStorage.getItem("minuit_referencias") || "";
        
        mostrarAlerta("✨ Dirección cargada exitosamente.");
        
        // Ocultamos el botón después de usarlo para que se vea limpio
        document.getElementById("btn_cargar_direccion").style.display = "none";
    }
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
        "• Envío (paquetería): 2-5 días hábiles adicionales dependiendo tu zona.\n\n" +
        "• Recuerda: Se requiere el pago del monto total para poder agendar tu pedido."
    );
}
/**
 * Muestra las condiciones del cobro de comisión por uso de terminal/plataforma.
 */
/*function mostrarTerminosComision() {
    alert(
        "💳 COMISIÓN POR USO DE PLATAFORMA\n\n" +
        "Los pagos realizados mediante tarjeta de crédito (Mercado Pago o PayPal) generan un cargo extra del 5% sobre el total de tu pedido debido a las comisiones de la plataforma.\n"
    );
}*/

/**
 * Muestra las condiciones sobre el desglose de impuestos (IVA).
 */
function mostrarTerminosIVA() {
    alert(
        "FACTURACIÓN\n\n" +
        "Si requieres factura selecciona la opcion 'SI'.\n\n" +
        "Al confirmar tu pedido por WhatsApp, adjunta tu constancia de Situación fiscal."
    );
}
// ==========================================
// GENERACIÓN DEL PDF NATIVO Y GOOGLE DRIVE
// ==========================================
// =========================================================
// LOGO PARA EL PDF: archivo del repositorio
// OJO: en Vercel los nombres distinguen mayúsculas y minúsculas.
// El archivo se llama "Logo Minuit1.png" (L y M mayúsculas, con espacio).
// =========================================================
const RUTA_LOGO = "Logo%20Minuit1.png";

// Carga el logo, lo pone sobre fondo blanco y lo convierte a JPEG (jsPDF lo acepta sin problemas).
// Si no se encuentra o tarda más de 5 segundos, devuelve null y el PDF se genera sin logo.
function cargarLogoParaPDF(ruta) {
    return new Promise((resolve) => {
        const imagen = new Image();
        imagen.crossOrigin = "anonymous";

        const limite = setTimeout(() => {
            console.warn("El logo tardó demasiado en cargar:", ruta);
            resolve(null);
        }, 5000);

        imagen.onload = () => {
            clearTimeout(limite);
            try {
                // Reducimos el tamaño para que el PDF y la subida a Drive sean más ligeros
                const escala = Math.min(1, 800 / imagen.naturalWidth);
                const lienzo = document.createElement("canvas");
                lienzo.width = Math.round(imagen.naturalWidth * escala);
                lienzo.height = Math.round(imagen.naturalHeight * escala);

                const contexto = lienzo.getContext("2d");
                contexto.fillStyle = "#ffffff";
                contexto.fillRect(0, 0, lienzo.width, lienzo.height);
                contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

                // Ajustamos el logo a un máximo de 40 x 18 mm, sin deformarlo
                const proporcion = imagen.naturalHeight / imagen.naturalWidth;
                let ancho = 40;
                let alto = ancho * proporcion;
                if (alto > 18) {
                    alto = 18;
                    ancho = alto / proporcion;
                }

                resolve({ datos: lienzo.toDataURL("image/jpeg", 0.92), ancho: ancho, alto: alto });
            } catch (error) {
                console.warn("No se pudo preparar el logo:", error);
                resolve(null);
            }
        };

        imagen.onerror = () => {
            clearTimeout(limite);
            console.warn("No se encontró el logo:", ruta, "- revisa el nombre y las mayúsculas");
            resolve(null);
        };

        imagen.src = ruta;
    });
}

// =========================================================
// VALIDACIÓN DE DATOS DEL CLIENTE
// Solo se valida el teléfono (10 dígitos) y el código postal (5 números válidos).
// Los demás campos únicamente se piden que no estén vacíos.
// Devuelve null si todo está bien, o { campo, mensaje } con el primer problema.
// =========================================================
function validarDatosPedido(d) {
    if (!d.nombre) {
        return { campo: "nombre_cliente", mensaje: "Escribe tu nombre." };
    }

    const telefono = d.telefono.replace(/[\s\-().]/g, "");
    if (!/^\d{10}$/.test(telefono)) {
        return { campo: "tel_cliente", mensaje: "El teléfono debe tener 10 dígitos, sin +52 y sin letras. Ejemplo: 2711234567." };
    }

    if (d.envioNacional) {
        const obligatorios = [
            ["dir_calle", d.calle, "la calle"],
            ["dir_numero", d.numero, "el número (o S/N)"],
            ["dir_colonia", d.colonia, "la colonia"],
            ["dir_ciudad", d.ciudad, "la ciudad o municipio"],
            ["dir_estado", d.estado, "el estado"]
        ];
        for (const [campo, valor, descripcion] of obligatorios) {
            if (!valor) return { campo: campo, mensaje: "Falta " + descripcion + " de tu dirección de envío." };
        }

        if (!/^\d{5}$/.test(d.cp) || parseInt(d.cp, 10) < 1000) {
            return { campo: "dir_cp", mensaje: "El código postal debe tener 5 números válidos (por ejemplo 72000)." };
        }
    }

    return null;
}

// Lleva al cliente al campo con error
function mostrarCampoConError(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    if (idCampo.startsWith("dir_")) {
        // Campos de dirección: abrimos su ventana sin borrar lo que el cliente ya escribió
        document.getElementById("modal-datos").style.display = "none";
        document.getElementById("modal-direccion").style.display = "block";
    } else if (document.getElementById("modal-datos").style.display !== "block") {
        // Si la ventana de datos no está abierta, la abrimos (carga nombre y teléfono guardados)
        abrirModalDatos();
    }
    campo.focus();
}

async function procesarPedido(soloDescargar = false) {
    try {
        // Deshabilitamos ambos botones para evitar clics dobles
        if(document.getElementById("btn_finalizar_pedido")) document.getElementById("btn_finalizar_pedido").disabled = true;
        if(document.getElementById("btn_solo_descarga")) document.getElementById("btn_solo_descarga").disabled = true;

        await procesarPedidoCompleto(soloDescargar);
        
    } catch (error) {
        console.error("Error al procesar el pedido:", error);
        alert("Ocurrió un error al generar la nota: " + error.message + ". Por favor intenta de nuevo.");
        
        // Reactivamos los botones si hubo error
        if(document.getElementById("btn_finalizar_pedido")) document.getElementById("btn_finalizar_pedido").disabled = false;
        if(document.getElementById("btn_solo_descarga")) document.getElementById("btn_solo_descarga").disabled = false;
    }
}

async function procesarPedidoCompleto(soloDescargar) {
    // 0. Forzamos una última actualización matemática antes de imprimir el PDF
    actualizarVistaCarrito();
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

    // 1. Validamos los datos antes de generar nada
    if (carrito.length === 0) {
        if(document.getElementById("btn_finalizar_pedido")) document.getElementById("btn_finalizar_pedido").disabled = false;
        if(document.getElementById("btn_solo_descarga")) document.getElementById("btn_solo_descarga").disabled = false;
        return mostrarAlerta("🛒 Tu carrito está vacío.");
    }

    let metodoEnvioSeleccionado = document.getElementById("sel_entrega").value;
    let esEnvioNacional = metodoEnvioSeleccionado === "300";

    const problema = validarDatosPedido({
        nombre: nombreCliente,
        telefono: telCliente,
        envioNacional: esEnvioNacional,
        calle: dirCalle,
        numero: dirNumero,
        colonia: dirColonia,
        cp: dirCp,
        ciudad: dirCiudad,
        estado: dirEstado
    });

    if (problema) {
        mostrarCampoConError(problema.campo);
        if(document.getElementById("btn_finalizar_pedido")) document.getElementById("btn_finalizar_pedido").disabled = false;
        if(document.getElementById("btn_solo_descarga")) document.getElementById("btn_solo_descarga").disabled = false;
        return alert(problema.mensaje);
    }

    // Dejamos el teléfono solo con números (por ejemplo, "271 117 0530" se guarda como "2711170530")
    telCliente = telCliente.replace(/[\s\-().]/g, "");

    // 2. Armamos la dirección que aparece en el PDF
    let direccionCliente = esEnvioNacional
        ? `${dirCalle} #${dirNumero}, Col. ${dirColonia}, C.P. ${dirCp}, ${dirCiudad}, ${dirEstado}. Ref: ${dirReferencias || "Ninguna"}`
        : "Entrega Local: Recogerá en Taller Minuit.";

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
    
    // Rescatamos los cálculos
    let totalTxt = document.getElementById("modal-total").innerText;
    let datosTotal = document.getElementById("modal-total").dataset;
    let valSubtotal = parseFloat(datosTotal.subtotal || 0);
    let valEnvio = parseFloat(datosTotal.envio || 0);
    let valComision = 0; // Ya no hay comisión extra
    let valIva = parseFloat(datosTotal.iva || 0); 
    let requiereFactura = datosTotal.factura || "No"; 
    let metodoPagoTexto = datosTotal.metodopago || "Transferencia";
    let tipoEntrega = valEnvio > 0 ? "Envío Nacional" : "Recoger en taller Minuit / Mandar Uber";

    let metodoPagoSeleccionado = document.getElementById("sel_pago") ? document.getElementById("sel_pago").value : "Transferencia";

    // --- NUEVO: DEFINIR QUÉ DATOS BANCARIOS MOSTRAR ---
    let datosBancariosMensaje = "";
    let datosBancariosPDF = [];

    if (requiereFactura === "Si") {
        datosBancariosMensaje = "\n🏦 *DATOS DE PAGO (FACTURA)*\nBanco: BANAMEX\nNombre: Daniel Bonilla Rodriguez\nNo. de cuenta: 886 5665 / Sucursal 7012\nCLABE: 0026 5070 1288 6566 51\nTarjeta (Oxxo): 5204 1662 4268 9190\n\n📌 *Importante:* Al confirmar tu pedido envía tu Constancia de Situación Fiscal y Uso de CFDI.";
        datosBancariosPDF = [
            "DATOS PARA PAGO (CON FACTURA):",
            "Banco: BANAMEX | Daniel Bonilla Rodriguez",
            "Cuenta: 886 5665 Suc. 7012",
            "CLABE: 0026 5070 1288 6566 51",
            "Tarjeta (Oxxo): 5204 1662 4268 9190"
        ];
    } else {
        if (metodoPagoSeleccionado === "PayPal") { 
            datosBancariosMensaje = "\n💳 *PAGO CON TARJETA*\nTe enviaremos tu link de pago seguro (Mercado Pago) por este medio.\n*(No aplica cobro extra de comisión)*";
            datosBancariosPDF = [
                "PAGO CON TARJETA DE CRÉDITO:",
                "Te enviaremos tu link de Mercado Pago",
                "por WhatsApp para que pagues de forma segura."
            ];
        } else { 
            datosBancariosMensaje = "\n🏦 *DATOS DE PAGO (Elige una opción)*\n\n*Opción 1: SANTANDER*\nNombre: Elizabeth Ramirez Ramirez\nNo. de cuenta: 1402 4074 580\nCLABE: 0146 5014 0240 7458 03\nTarjeta (Oxxo): 5579 0870 1226 6216\n\n*Opción 2: MERCADO PAGO*\nNombre: Elizabeth Ramírez Ramírez\nCLABE: 722 969 070 993 840 205";
            datosBancariosPDF = [
                "DATOS PARA PAGO (Elige una opción):",
                "Opción 1 (SANTANDER): Elizabeth Ramirez",
                "Cta: 1402 4074 580 | CLABE: 0146 5014 0240 7458 03",
                "Tarjeta (Oxxo): 5579 0870 1226 6216",
                "", 
                "Opción 2 (MERCADO PAGO): Elizabeth Ramírez",
                "CLABE: 722 969 070 993 840 205"
            ];
        }
    }

    // Le inyectamos los datos bancarios al mensaje final de WhatsApp
    let textoWhatsApp = `Hola Minuit!, Aquí están los datos de mi pedido:\n\n DATOS \n*Nombre completo:* ${nombreCliente}\n *# Telefónico:* ${telCliente}\n *Nombre de tu marca:* ${marcaCliente}\n *Usuario de Instagram:* ${igCliente}\n *Dirección completa:* ${direccionCliente}\n *Correo electrónico:* ${correoCliente}\n\n *ENTREGA:* ${tipoEntrega}\n *PAGO:* ${metodoPagoTexto}\n *FACTURA:* ${requiereFactura}\n *TOTAL A PAGAR: ${totalTxt}*\n${datosBancariosMensaje}\n`;
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        // --- ENCABEZADO CON EL LOGO ORIGINAL ---
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 210, 35, "F");

        const logo = await cargarLogoParaPDF(RUTA_LOGO);
        if (logo) pdf.addImage(logo.datos, "JPEG", 15, 10, logo.ancho, logo.alto);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(33, 33, 33);
        pdf.text("Resumen de Pedido", 195, 20, { align: "right" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);

        pdf.setDrawColor(220, 220, 220);
        pdf.line(15, 35, 195, 35);

        pdf.setTextColor(...COLOR_PRINCIPAL); 
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("NOTA DE PEDIDO", 105, 32, { align: "center" });

        pdf.setDrawColor(240, 220, 227); 
        pdf.setLineWidth(0.5);
        pdf.line(15, 35, 195, 35);

        // --- CAJA DE DATOS DEL CLIENTE ---
        pdf.setFillColor(...COLOR_FONDO);
        pdf.roundedRect(15, 38, 180, 32, 4, 4, "F"); 
        pdf.setTextColor(...COLOR_TEXTO);
        pdf.setFontSize(9);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Cliente:", 20, 44);
        pdf.setFont("helvetica", "normal"); pdf.text(nombreCliente, 40, 44);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Teléfono:", 20, 49);
        pdf.setFont("helvetica", "normal"); pdf.text(telCliente, 40, 49);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Marca/IG:", 20, 54);
        pdf.setFont("helvetica", "normal"); pdf.text(`${marcaCliente} | ${igCliente}`, 40, 54);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Fecha:", 115, 44);
        pdf.setFont("helvetica", "normal"); pdf.text(new Date().toLocaleDateString("es-MX"), 135, 44);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Entrega:", 115, 49);
        pdf.setFont("helvetica", "normal"); pdf.text(tipoEntrega, 135, 49);
        
        pdf.setFont("helvetica", "bold"); pdf.text("Pago:", 115, 54);
        pdf.setFont("helvetica", "normal"); pdf.text(metodoPagoTexto, 135, 54);

        pdf.setFont("helvetica", "bold"); pdf.text("Dirección:", 20, 61);
        pdf.setFont("helvetica", "normal");
        let lineasDir = pdf.splitTextToSize(direccionCliente, 150);
        pdf.text(lineasDir, 40, 61);

        // --- TABLA DE PRODUCTOS ---
        let y = 76; 
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
            
            pdf.text(lineasDetalle, 20, y + 4.5);

            pdf.setFontSize(10);
            pdf.text(String(item.cantidad), 130, y, { align: "center" });
            pdf.text("$" + item.subtotal.toFixed(2), 185, y, { align: "right" });

            let altoTotalDetalle = lineasDetalle.length * 3.5;
            pdf.setDrawColor(240, 220, 227);
            pdf.line(20, y + 6 + altoTotalDetalle, 190, y + 6 + altoTotalDetalle);
            
            y += 12 + altoTotalDetalle;
        });

        // --- CÁLCULOS FINALES Y DESGLOSE ---
        y += 5;
        if (y > 220) { pdf.addPage(); y = 30; }

        let alturaCajaDesglose = 32;
        if (valComision > 0) alturaCajaDesglose += 6;
        if (valIva > 0) alturaCajaDesglose += 6;

        pdf.setFillColor(...COLOR_FONDO);
        pdf.roundedRect(100, y, 95, alturaCajaDesglose, 4, 4, "F");
        
        pdf.setTextColor(...COLOR_TEXTO);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        let yDesglose = y + 8;
        pdf.text("Subtotal artículos:", 105, yDesglose);
        pdf.text("$" + valSubtotal.toFixed(2), 190, yDesglose, { align: "right" });
        
        yDesglose += 7;
        pdf.text("Envío Nacional:", 105, yDesglose);
        pdf.text("$" + valEnvio.toFixed(2), 190, yDesglose, { align: "right" });
        
        if (valComision > 0) {
            yDesglose += 7;
            pdf.text("Tarjeta de Crédito", 105, yDesglose);
            pdf.text("$" + valComision.toFixed(2), 190, yDesglose, { align: "right" });
        }

        if (valIva > 0) {
            yDesglose += 7;
            pdf.text("IVA (16%):", 105, yDesglose);
            pdf.text("$" + valIva.toFixed(2), 190, yDesglose, { align: "right" });
        }

        yDesglose += 9;
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...COLOR_PRINCIPAL);
        pdf.setFontSize(12);
        pdf.text("TOTAL A PAGAR:", 105, yDesglose);
        pdf.setFontSize(14);
        pdf.text(totalTxt, 190, yDesglose, { align: "right" });

        // --- IMPRIMIR DATOS BANCARIOS EN EL PDF ---
        let yTerminos = y + 7; // Alineamos con el inicio del recuadro de totales
        pdf.setTextColor(...COLOR_TEXTO);
        pdf.setFontSize(8); // Letra un poco más pequeña para que quepa bien
        pdf.setFont("helvetica", "bold");
        
        datosBancariosPDF.forEach((linea, index) => {
            if (linea === "") {
                yTerminos += 1.5; // Espacio chiquito extra entre Opción 1 y Opción 2
            } else {
                if(index > 0) pdf.setFont("helvetica", "normal");
                pdf.text(linea, 15, yTerminos);
                yTerminos += 3.8;
            }
        });

        // TRUCO: Asegurarnos de que los términos vayan ABAJO de todo (ya sea del cuadro rosa o de los bancos)
        let finDelCuadroRosa = y + alturaCajaDesglose + 6;
        if (yTerminos < finDelCuadroRosa) {
            yTerminos = finDelCuadroRosa; 
        } else {
            yTerminos += 4; 
        }

        // --- TÉRMINOS Y CONDICIONES ---
        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text("TÉRMINOS DEL PEDIDO:", 15, yTerminos);
        pdf.setFont("helvetica", "normal");
        
        let terminos = [
            "• Se requiere el pago del monto total para poder agendar tu pedido.",
            "• Tiempo de elaboración: 2 a 3 semanas + 2 a 3 días de envío.",
            "• Si el envío marca un costo excedente al generar la guía, se notificará.",
            "• Precios no incluyen IVA. Si deseas factura, se agregará el impuesto."
        ];
        
        terminos.forEach(linea => {
            yTerminos += 4.5;
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
        // 1. GUARDAR COPIA LOCAL (Bóveda del navegador)
        // =========================================================
        const pdfBase64 = pdf.output('datauristring');
        try {
            localStorage.setItem("minuit_ultimo_pdf", pdfBase64);
        } catch (e) {
            console.warn("No se pudo guardar la copia local.", e);
        }

        // =========================================================
        // 2. ¡DESCARGAR INMEDIATAMENTE!
        // =========================================================
        pdf.save(nombreArchivo); 

        // =========================================================
        // 3. INTERCEPTOR PARA EL BOTÓN DE "SOLO DESCARGAR"
        // =========================================================
        const urlGoogleScript = "https://script.google.com/macros/s/AKfycbw_RFDbSPc0tZNODZ2cltlC26DtKGciqqkkrLvhHSeg-NkyJ-CfpaQiMbfS0ftjHa77-A/exec";

        if (soloDescargar) {
            mostrarAlerta("✅ ¡Nota descargada! Subiendo copia a tu registro...");
            
            fetch(urlGoogleScript, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ nombreArchivo: nombreArchivo, base64: pdfBase64 })
            }).catch(e => console.warn(e));

            if (document.getElementById("btn_finalizar_pedido")) document.getElementById("btn_finalizar_pedido").disabled = false;
            if (document.getElementById("btn_solo_descarga")) document.getElementById("btn_solo_descarga").disabled = false;
            return; 
        }

        // =========================================================
        // 4. SI PRESIONÓ "ENVIAR", SUBIMOS A DRIVE Y VAMOS A WHATSAPP
        // =========================================================
        mostrarAlerta("📤 Generando link de Drive y abriendo WhatsApp...");
        const controlador = new AbortController();
        const tiempoLimite = setTimeout(() => controlador.abort(), 8000);

        try {
            const respuesta = await fetch(urlGoogleScript, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ nombreArchivo: nombreArchivo, base64: pdfBase64 }),
                signal: controlador.signal
            });

            const resultado = await respuesta.json();
            if (resultado.estatus === 'exito') {
                textoWhatsApp += `\n📁 *Descarga el PDF de registro aquí:*\n👉 ${resultado.urlDrive}`;
            }
        } catch (errorDrive) {
            console.warn("Drive falló o tardó mucho, seguimos sin link.", errorDrive);
        } finally {
            clearTimeout(tiempoLimite);
        }

        abrirWhatsAppYLimpiar(textoWhatsApp);

    } catch (error) {
        console.error("Error al procesar el pedido:", error);
        alert("Ocurrió un error al generar la nota: " + error.message + ". Por favor intenta de nuevo.");
        if (document.getElementById("btn_finalizar_pedido")) document.getElementById("btn_finalizar_pedido").disabled = false;
        if (document.getElementById("btn_solo_descarga")) document.getElementById("btn_solo_descarga").disabled = false;
    }
}
// ==========================================
// RECUPERAR ÚLTIMO PEDIDO
// ==========================================
function descargarUltimoPedido() {
    const pdfBase64 = localStorage.getItem("minuit_ultimo_pdf");
    
    if (!pdfBase64) {
        mostrarAlerta("⚠️ No tienes pedidos recientes guardados en este dispositivo.");
        return;
    }
    
    mostrarAlerta("📥 Descargando tu último pedido...");
    
    // Crear un enlace invisible y forzar el clic para descargarlo
    const enlace = document.createElement("a");
    enlace.href = pdfBase64;
    enlace.download = "Mi_Ultimo_Pedido_Minuit.pdf";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

function abrirWhatsAppYLimpiar(textoWhatsApp) {
    let textoCodificado = encodeURIComponent(textoWhatsApp);
    let linkWhatsApp = `https://wa.me/${numeroDueno}?text=${textoCodificado}`;

    carrito = [];
    actualizarVistaCarrito();
    cerrarModal();          
    cerrarModalDatos();     

    // limpieza de casillas
    document.getElementById("nombre_cliente").value = "";
    document.getElementById("tel_cliente").value = "";
    document.getElementById("dir_calle").value = "";
    document.getElementById("dir_numero").value = "";
    document.getElementById("dir_colonia").value = "";
    document.getElementById("dir_cp").value = "";
    document.getElementById("dir_ciudad").value = "";
    document.getElementById("dir_estado").value = "";
    document.getElementById("dir_referencias").value = "";
    
    if(document.getElementById("btn_finalizar_pedido")) {
        document.getElementById("btn_finalizar_pedido").disabled = false;
    }

    // EL TRUCO PARA EVITAR QUE SE CANCELE LA DESCARGA
    // Le damos 2 segundos al navegador para procesar el PDF antes de sacarlo de la página
    setTimeout(() => {
        window.location.href = linkWhatsApp;
    }, 2000);
}
