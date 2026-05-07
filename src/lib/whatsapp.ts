import { logger } from '@lib/logger'

const GRAPH_URL = 'https://graph.facebook.com/v19.0'

/**
 * Normalises a Costa Rica phone number to E.164 digits (no '+').
 * WhatsApp Cloud API expects the number without '+': "50688887777".
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('506') && digits.length === 11) return digits
  if (digits.length === 8) return `506${digits}`
  return digits
}

/**
 * Sends a plain-text message within an open customer-service window (CSW).
 * ✅ FREE — no template charge.
 * ⚠️  Only works if the user messaged the business first (within the past 24 h).
 */
export async function sendWhatsAppText(phone: string, text: string): Promise<boolean> {
  const phoneNumberId = import.meta.env.WHATSAPP_PHONE_NUMBER_ID
  const token = import.meta.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !token) {
    logger.info('whatsapp.sendText: not configured, skipping', { phone })
    return false
  }

  try {
    const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizePhone(phone),
        type: 'text',
        text: { body: text, preview_url: false },
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      logger.error('whatsapp.sendText.failed', { status: res.status, body })
      return false
    }
    return true
  } catch (err) {
    logger.error('whatsapp.sendText.error', { error: String(err) })
    return false
  }
}

/**
 * Sends an authentication template message.
 * 💰 CHARGED ~$0.025 per message for Costa Rica (Rest of Latin America rate).
 * Use as fallback when no CSW is open (i.e. business initiates the conversation).
 *
 * Requires a pre-approved template named `otp_verification` (or the value of
 * WHATSAPP_OTP_TEMPLATE_NAME) with one body variable: the 6-digit code.
 */
export async function sendOtpTemplate(phone: string, code: string): Promise<boolean> {
  const phoneNumberId = import.meta.env.WHATSAPP_PHONE_NUMBER_ID
  const token = import.meta.env.WHATSAPP_ACCESS_TOKEN
  const templateName = import.meta.env.WHATSAPP_OTP_TEMPLATE_NAME ?? 'otp_verification'

  if (!phoneNumberId || !token) {
    logger.info('whatsapp.sendOtpTemplate: not configured, skipping', { phone })
    return false
  }

  try {
    const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(phone),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: code }],
            },
          ],
        },
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      logger.error('whatsapp.sendOtpTemplate.failed', { status: res.status, body })
      return false
    }
    return true
  } catch (err) {
    logger.error('whatsapp.sendOtpTemplate.error', { error: String(err) })
    return false
  }
}

/**
 * Verifies the signature on an incoming webhook from Meta.
 * Must be called before processing any webhook payload.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = import.meta.env.WHATSAPP_APP_SECRET
  if (!secret) return false
  if (!signatureHeader?.startsWith('sha256=')) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const expected = `sha256=${Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`

  return expected === signatureHeader
}
