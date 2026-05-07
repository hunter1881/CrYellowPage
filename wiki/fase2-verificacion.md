# Fase 2 — Sistema de Verificación por WhatsApp

## Qué hace

La Fase 2 agrega tres capacidades al sistema:

1. **Verificación de teléfono por WhatsApp OTP** — El proveedor demuestra que controla el número que registró
2. **Auto-aprobación automática** — Si el teléfono está verificado y la descripción tiene ≥30 chars, el proveedor se aprueba sin intervención humana
3. **Reportes comunitarios** — Cualquier usuario puede reportar un proveedor como fraudulento; 3+ reportes de fraude lo desactivan automáticamente

---

## Archivos involucrados

| Archivo | Descripción |
|---|---|
| `supabase/migrations/20260507000000_phase2_verification.sql` | Migración con tablas, triggers y políticas RLS |
| `src/lib/whatsapp.ts` | Integración WhatsApp Cloud API |
| `src/lib/queries/verification.ts` | Generación y validación de OTPs |
| `src/lib/queries/reports.ts` | Inserción de reportes comunitarios |
| `src/actions/index.ts` | 3 nuevas Astro Actions |
| `src/pages/api/whatsapp-webhook.ts` | Webhook para mensajes entrantes de WhatsApp |
| `src/pages/account/index.astro` | Widget de verificación en el dashboard |

---

## Flujo de verificación (proveedor)

```
[Dashboard /account/]
    │
    ├─ phone_verified = false → muestra botón "Verificar por WhatsApp"
    │
    ▼
Clic en el botón → abre WhatsApp con mensaje prellenado:
    "VERIFICAR {uuid-del-proveedor}"
    │
    ▼
[Webhook POST /api/whatsapp-webhook]
    │
    ├─ Verifica firma HMAC-SHA256
    ├─ Detecta mensaje "VERIFICAR {uuid}"
    ├─ Valida que el número del remitente coincida con el del proveedor
    ├─ Genera OTP de 6 dígitos (crypto.getRandomValues)
    ├─ Guarda OTP en `phone_otp_codes` (expira en 10 min)
    └─ Responde con texto libre GRATIS: "Tu código es: 123456"
    │
    ▼
[Dashboard — usuario ve campo de código]
    │
    ├─ Usuario ingresa el código
    └─ Llama a Astro Action `actions.verifyPhoneOtp`
    │
    ▼
[src/lib/queries/verification.ts → verifyPhoneOtp()]
    │
    ├─ Busca el OTP activo
    ├─ Verifica que no haya expirado
    ├─ Verifica que no haya sido usado
    ├─ Compara el código
    ├─ Marca el OTP como usado
    └─ Sets providers.phone_verified = true
    │
    ▼
[Postgres trigger trg_provider_auto_approve]
    │
    ├─ Detecta que phone_verified cambió a true
    ├─ Verifica que description >= 30 chars
    └─ Sets providers.verified = true → PROVEEDOR APROBADO ✅
```

---

## Flujo de reportes comunitarios

```
[Página de proveedor]
    │
    └─ Usuario hace clic en "Reportar"
    │
    ▼
Llama a Astro Action `actions.reportProvider`
    │
    └─ Inserta en `provider_reports` (anon, sin auth requerido)
    │
    ▼
[Postgres trigger trg_auto_flag_reported]
    │
    ├─ Cuenta reportes con reason = 'fraud' OR 'fake_info'
    ├─ Si count >= 3
    └─ Sets providers.verified = false → PROVEEDOR DESACTIVADO 🚫
```

---

## Código clave

### Envío de OTP (gratis)

```typescript
// src/lib/whatsapp.ts
export async function sendWhatsAppText(phone: string, text: string) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text },
      }),
    }
  )
  // ...
}
```

Solo funciona dentro de la Customer Service Window (24h desde que el usuario envió un mensaje).

### Generación de OTP

```typescript
// src/lib/queries/verification.ts
function generateCode(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 1_000_000).padStart(6, '0')
}
```

Criptográficamente seguro. No usa `Math.random()`.

### Trigger de auto-aprobación (Postgres)

```sql
CREATE OR REPLACE FUNCTION auto_approve_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.phone_verified = true
     AND OLD.phone_verified = false
     AND length(coalesce(NEW.description, '')) >= 30 THEN
    NEW.verified = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_provider_auto_approve
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION auto_approve_provider();
```

---

## Astro Actions agregadas

### `requestPhoneVerification`
- Verifica que el `owner_id` del proveedor sea el usuario autenticado
- Crea un OTP en la DB
- Intenta enviar por texto libre (CSW); si falla, cae a template pagado

### `verifyPhoneOtp`
- Valida el código de 6 dígitos
- Errores con mensajes en español:
  - `not_found` → "No encontramos un código pendiente para este número"
  - `expired` → "El código expiró. Vuelve a enviar el mensaje"
  - `used` → "Este código ya fue usado"
  - `wrong_code` → "Código incorrecto. Verifica el mensaje de WhatsApp"

### `reportProvider`
- Inserta un reporte en `provider_reports`
- Valida el `reason` contra el enum permitido

---

## Seguridad

- **OTPs** solo accesibles via service_role (no RLS público en `phone_otp_codes`)
- **Firma HMAC-SHA256** verificada en cada POST del webhook antes de procesar
- **Expiración**: OTPs expiran a los 10 minutos
- **Un solo uso**: OTPs marcados como `used = true` al ser validados
- **Invalidación**: Al crear nuevo OTP, los anteriores sin usar del mismo proveedor se marcan como usados
- **Match de número**: El webhook verifica que los últimos 8 dígitos del remitente coincidan con el número del proveedor

---

## Cómo replicar en otro entorno

1. Aplicar la migración: `npx supabase db push`
2. Regenerar tipos: `npm run db:types`
3. Configurar las 5 variables de entorno de WhatsApp (ver `wiki/stack-y-arquitectura.md`)
4. Configurar el webhook en Meta (ver `wiki/whatsapp-setup.md`)
5. Deployar en Vercel con las nuevas variables
