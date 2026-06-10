async function procesarCompra(carrito) {
    // URL que te dará Render cuando despliegues el backend
    const BACKEND_URL = "https://tu-backend-en-render.onrender.com/crear-preferencia";

    try {
        const respuesta = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: carrito })
        });
        
        const data = await respuesta.json();
        
        // Mercado Pago nos devuelve una URL de pago, redirigimos al cliente ahí
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert("Hubo un error al generar el pago.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
