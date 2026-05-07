/**
 * WhatsApp Cloud API webhook endpoint.
 *
 * Two responsibilities:
 *   GET  — Webhook verification handshake (required by Meta on first setup).
 *   POST — Receives incoming messages, opens a customer-service window (CSW),
 *           and sends OTP codes as free plain-text messages.
 *
 * FREE OTP flow:
 *   1. Provider taps the "Verificar por WhatsApp" button in their account page.
 *   2. That button opens a wa.me link with text "VERIFICAR [providerId]".
 *   3. Provider sends it → Meta fires a webhook to this endpoint.
 *   4. This handler generates an OTP and sends it back as a FREE text (within CSW).
 *   5. Provider enters the code on the site → verifyPhoneOtp Action validates it.
 */

export const prerender = false

import type { APIRoute } from 'astro'
import { createPhoneOtp } from '@lib/queries/verification'
import { sendWhatsAppText } from '@lib/whatsapp'
import { verifyWebhookSignature } from '@lib/whatsapp'
import { supabase } from '@lib/supabase'
import { logger } from '@lib/logger'

// ── GET: Meta webhook verification handshake ────────────────────────────────

export const GET: APIRoute = ({ request }) => {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  const verifyToken = import.meta.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

// ── POST: Incoming message handler ──────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')

  // Validate the request actually came from Meta
  const valid = await verifyWebhookSignature(rawBody, signature)
  if (!valid) {
    logger.warn('whatsapp.webhook: invalid signature')
    return new Response('Forbidden', { status: 403 })
  }

  let payload: WhatsAppWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  // Process each entry + change (Meta can batch them)
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue
      for (const msg of change.value?.messages ?? []) {
        if (msg.type !== 'text') continue
        await handleIncomingMessage(
          msg.from,
          msg.text?.body ?? '',
        )
      }
    }
  }

  // Meta requires a 200 response within 20 s, even if we do nothing with the message
  return new Response('OK', { status: 200 })
}

// ── Internal handler ─────────────────────────────────────────────────────────

async function handleIncomingMessage(fromPhone: string, body: string): Promise<void> {
  const text = body.trim().toUpperCase()

  // Expected format: "VERIFICAR <uuid>"
  if (!text.startsWith('VERIFICAR ')) return

  const providerId = text.replace('VERIFICAR ', '').trim().toLowerCase()
  if (!isUuid(providerId)) return

  // Confirm the provider exists and its phone matches
  const { data: provider } = await supabase
    .from('providers')
    .select('id, phone, phone_verified')
    .eq('id', providerId)
    .maybeSingle()

  if (!provider || provider.phone_verified) return

  // Loose match: strip non-digits and compare last 8 digits
  const normalizedFrom = fromPhone.replace(/\D/g, '')
  const normalizedStored = provider.phone.replace(/\D/g, '')
  const last8From = normalizedFrom.slice(-8)
  const last8Stored = normalizedStored.slice(-8)

  if (last8From !== last8Stored) {
    // Phone mismatch — could be someone trying to verify another provider
    logger.warn('whatsapp.webhook: phone mismatch', { providerId, fromPhone })
    return
  }

  try {
    const code = await createPhoneOtp(provider.id, provider.phone)
    await sendWhatsAppText(
      fromPhone,
      `¡Hola! Tu código de verificación para DirectorioLocal CR es:\n\n*${code}*\n\nVálido por 10 minutos. No lo compartas.`,
    )
  } catch (err) {
    logger.error('whatsapp.webhook.handleIncomingMessage', { providerId, error: String(err) })
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)
}

// ── Types ────────────────────────────────────────────────────────────────────

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      field: string
      value?: {
        messages?: Array<{
          from: string
          type: string
          text?: { body: string }
        }>
      }
    }>
  }>
}
