import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mercadopago
import requests

app = Flask(__name__)
# Permitimos que nuestro frontend se comunique con este servidor sin bloqueos de seguridad
CORS(app)

# Configuración de credenciales (Se configuran de forma segura en el panel de Render)
MP_ACCESS_TOKEN = os.environ.get("MP_ACCESS_TOKEN")
WA_TOKEN = os.environ.get("WA_TOKEN")
WA_PHONE_ID = os.environ.get("WA_PHONE_ID")
MI_TELEFONO = os.environ.get("MI_TELEFONO") # Formato: 521XXXXXXXXXX

sdk = mercadopago.SDK(MP_ACCESS_TOKEN)

# 1. Ruta para crear el enlace de pago
@app.route('/crear-preferencia',死 methods=['POST'])
def crear_preferencia():
    datos = request.get_json()
    items_carrito = datos.get("items", [])
    
    # Estructuramos la preferencia para Mercado Pago
    preference_data = {
        "items": items_carrito,
        "back_urls": {
            "success": "https://tu-frontend.vercel.app/exito.html",
            "failure": "https://tu-frontend.vercel.app/error.html"
        },
        "auto_return": "approved",
        "notification_url": "https://tu-backend-en-render.onrender.com/webhook"
    }
    
    result = sdk.preference().create(preference_data)
    return jsonify({"init_point": result["response"]["init_point"]})

# 2. El Webhook: Escucha cuándo Mercado Pago aprueba el dinero
@app.route('/webhook', methods=['POST'])
def webhook():
    # Mercado Pago envía parámetros en la URL del webhook
    id_pago = request.args.get('data.id')
    tipo = request.args.get('type')
    
    if tipo == 'payment' and id_pago:
        # Consultamos a Mercado Pago la autenticidad del pago
        url_pago = f"https://api.mercadopago.com/v1/payments/{id_pago}"
        headers = {"Authorization": f"Bearer {MP_ACCESS_TOKEN}"}
        respuesta = requests.get(url_pago, headers=headers).json()
        
        if respuesta.get("status") == "approved":
            # Extraemos los datos del reporte para el dueño
            cliente = respuesta["payer"].get("first_name", "Cliente")
            monto = respuesta["transaction_amount"]
            descripcion = respuesta["description"]
            
            # Formateamos el mensaje de WhatsApp
            mensaje = f"🟢 *¡NUEVA COMPRA PAGADA!*\n\n" \
                      f"*Cliente:* {cliente}\n" \
                      f"*Total:* ${monto} MXN\n" \
                      f"*Pedido:* {descripcion}\n"
            
            enviar_whatsapp(mensaje)
            
    return "", 200

def enviar_whatsapp(texto):
    url_wa = f"https://graph.facebook.com/v17.0/{WA_PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WA_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": MI_TELEFONO,
        "type": "text",
        "text": {"body": texto}
    }
    requests.post(url_wa, json=payload, headers=headers)

if __name__ == '__main__':
    app.run(port=5000)
