# WhatsApp Cloud API — Setup desde cero

Esta guía documenta exactamente cómo configurar el número de WhatsApp Business para el sistema de verificación por OTP. Sigue los pasos en orden si alguna vez hay que reconfigurar.

---

## Datos actuales de producción

| Campo | Valor |
|---|---|
| Meta App ID | `4512575402296858` |
| Meta App Name | `ElContactico` |
| WhatsApp Phone Number ID | `1072843155918984` |
| WABA ID (WhatsApp Business Account) | `1667874237872781` |
| Número registrado | `+506 6370 9184` |
| System User ID | `61589030926795` |
| System User Name | `elcontacticoadmin` |
| Webhook URL | `https://cr-yellow-page.vercel.app/api/whatsapp-webhook` |
| Webhook Verify Token | `directorio-webhook-2026` |
| API Version | v25.0 |

---

## Paso 1 — Crear la App en Meta Developers

1. Ir a https://developers.facebook.com/apps
2. Clic en **"Create App"**
3. Seleccionar **"Other"** como tipo de uso
4. Seleccionar **"Business"** como tipo de app
5. Completar nombre de la app, email de contacto, y seleccionar la Business Portfolio
6. Una vez creada, en el panel de la app ir a **"Add Products"**
7. Buscar **"WhatsApp"** → Clic en **"Set Up"**

---

## Paso 2 — Registrar número de teléfono

> **Importante**: Para un número real (no de prueba), Meta requiere que hayas agregado un método de pago en Business Manager, incluso si solo usas la ventana gratuita de 24h.

1. En el panel de WhatsApp de la app → **"API Setup"** → **"Phone Numbers"**
2. Clic en **"Add phone number"**
3. Ingresar el número en formato internacional con código de país (ej: `50663709184`)
4. Verificar con OTP por llamada o SMS
5. Una vez verificado, el número aparece en la lista con un **Phone Number ID** — **guardar este ID**

---

## Paso 3 — Crear System User (token permanente)

Los tokens de acceso temporales expiran. Para producción, crear un System User con token permanente.

1. Ir a https://business.facebook.com/latest/settings/system-users
2. Clic en **"Add"**
3. Nombre: algo descriptivo (ej: `elcontacticoadmin`)
4. Rol: **Admin**
5. Una vez creado, clic en el System User → **"Add Assets"**
6. Agregar dos tipos de assets:
   - **Apps** → seleccionar la app (ej: `ElContactico`) → marcar **"Full control"**
   - **WhatsApp Accounts** → seleccionar el WABA → marcar **"Full control"**
7. Clic en **"Save changes"**
8. De vuelta en la pantalla del System User → **"Generate New Token"**
9. Seleccionar la app → seleccionar expiración **"Never"**
10. Marcar los permisos:
    - `whatsapp_business_management`
    - `whatsapp_business_messaging`
11. Clic en **"Generate Token"** → **copiar el token y guardarlo de forma segura**

Este token no expira nunca. Si se compromete, revocarlo desde el mismo panel y generar uno nuevo.

---

## Paso 4 — Configurar el Webhook

1. En el panel de la app de Meta → **WhatsApp** → **"Configuration"**
2. En la sección **"Webhook"** → clic en **"Edit"**
3. Completar:
   - **Callback URL**: `https://[dominio]/api/whatsapp-webhook`
   - **Verify Token**: El valor de `WHATSAPP_WEBHOOK_VERIFY_TOKEN` en `.env`
4. Clic en **"Verify and Save"**
   - Meta hace un GET al webhook. El endpoint debe responder devolviendo el `hub.challenge`.
   - Ver implementación en `src/pages/api/whatsapp-webhook.ts`
5. Después de verificar → clic en **"Manage"** junto a la sección Webhook Fields
6. Activar el campo **`messages`** → clic en **"Subscribe"**

---

## Paso 5 — Variables de entorno

Agregar al `.env` y en Vercel (Settings → Environment Variables):

```bash
# Número de WhatsApp a mostrar a usuarios (para que inicien conversación)
PUBLIC_WHATSAPP_BUSINESS_PHONE=50663709184

# ID del número de teléfono en Meta Dashboard
WHATSAPP_PHONE_NUMBER_ID=1072843155918984

# Token del System User (permanente)
WHATSAPP_ACCESS_TOKEN=EABAI...

# App Secret — Meta Developers → App → Settings → Basic → App Secret
WHATSAPP_APP_SECRET=381c1...

# String arbitrario que pusiste al configurar el webhook
WHATSAPP_WEBHOOK_VERIFY_TOKEN=directorio-webhook-2026
```

---

## Cómo funciona el envío de mensajes

### Gratis — Customer Service Window (CSW)
- El usuario envía un mensaje al negocio primero
- Se abre una ventana de 24h durante la cual el negocio puede responder con texto libre **SIN COSTO**
- El webhook captura el mensaje del usuario y responde automáticamente con el OTP

### De pago — Templates de autenticación
- El negocio inicia la conversación (business-initiated)
- Requiere un template aprobado por Meta
- Costo ~$0.025 por mensaje en Costa Rica
- Solo se usa como fallback si el usuario no inició conversación primero

---

## Flujo del webhook (`src/pages/api/whatsapp-webhook.ts`)

### GET — Verificación inicial
```
Meta → GET /api/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
→ El endpoint verifica el token y devuelve hub.challenge como texto plano
```

### POST — Mensajes entrantes
```
Meta → POST /api/whatsapp-webhook (con firma HMAC-SHA256 en header X-Hub-Signature-256)
→ El endpoint:
  1. Verifica la firma HMAC usando WHATSAPP_APP_SECRET
  2. Parsea el payload
  3. Busca mensajes que empiecen con "VERIFICAR {uuid}"
  4. Valida que el número del remitente coincida con el del proveedor
  5. Genera un OTP de 6 dígitos
  6. Responde con el OTP vía sendWhatsAppText (GRATIS, dentro de CSW)
```

---

## Troubleshooting

### El webhook no se verifica
- Confirmar que el Verify Token en Meta coincide exactamente con `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Confirmar que el endpoint responde al GET y devuelve el `hub.challenge` como texto
- Confirmar que el deploy en Vercel está actualizado

### Los mensajes no llegan al webhook
- Confirmar que el campo `messages` está subscrito en el panel de Meta
- Confirmar que el webhook está marcado como activo (verde)
- Revisar los logs en Vercel Dashboard → Functions → `/api/whatsapp-webhook`

### Error de autenticación al enviar mensajes
- Confirmar que el access token no expiró
- Si expiró (a pesar de "Never"), regenerar en Business Manager → System Users
- Confirmar que el `WHATSAPP_PHONE_NUMBER_ID` corresponde al número correcto

### Número de prueba vs número real
- Los números de prueba (+1 555...) pertenecen a un WABA diferente al número real
- El token de acceso es por WABA — un token de un WABA no funciona para el otro
- Para producción, siempre usar el token del System User asociado al WABA del número real
