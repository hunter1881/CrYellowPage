import { createClient } from '@supabase/supabase-js'
import type { Database } from '@generated/database.types'
import { logger } from '@lib/logger'
import { normalizePhone } from '@lib/whatsapp'

/**
 * Service-role client — bypasses RLS.
 * Used ONLY in server-side login OTP handlers.
 * Never expose this client to the browser.
 */
function getServiceClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role not configured')
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}

/** Generates a cryptographically random 6-digit OTP string */
function generateCode(): string {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return String(arr[0]! % 1_000_000).padStart(6, '0')
}

/**
 * Returns the synthetic email used as the Supabase Auth identifier for a phone.
 * Users never see this — it is purely an internal auth token.
 */
export function syntheticEmailForPhone(rawPhone: string): string {
  return `${normalizePhone(rawPhone)}@wa.elcontactico.cr`
}

/**
 * Creates a login OTP for the given normalised phone.
 * Invalidates any previous unused codes for the same phone first.
 * Returns the plain-text code (caller sends it via WhatsApp).
 */
export async function createLoginOtp(rawPhone: string): Promise<string> {
  const db = getServiceClient()
  const phone = normalizePhone(rawPhone)

  // Invalidate previous unused codes for this phone
  await db.from('whatsapp_auth_otps').update({ used: true }).eq('phone', phone).eq('used', false)

  const code = generateCode()

  const { error } = await db.from('whatsapp_auth_otps').insert({
    phone,
    code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    used: false,
  })

  if (error) {
    logger.error('createLoginOtp.insert', { phone, error })
    throw new Error('No se pudo generar el código. Intentá de nuevo.')
  }

  return code
}

export type LoginOtpResult =
  | { ok: true; tokenHash: string; email: string }
  | { ok: false; reason: 'not_found' | 'expired' | 'wrong_code' | 'auth_error' }

/**
 * Validates the submitted login OTP, then sets up a Supabase Auth session token.
 *
 * Steps (following the official Supabase server-side auth pattern):
 *  1. Validate the OTP against `whatsapp_auth_otps` and mark it used.
 *  2. Ensure a Supabase Auth user exists for this phone via `admin.createUser`
 *     (idempotent — "already registered" errors are silently ignored).
 *  3. Call `admin.generateLink({ type: 'magiclink', email })` to obtain a
 *     `hashed_token` that can be exchanged for a real session.
 *
 * The caller is responsible for exchanging the token:
 *   `serverClient.auth.verifyOtp({ type: 'magiclink', token_hash })`
 * This must be done with the SSR client (createSupabaseServerClient) so that
 * `@supabase/ssr` writes the session cookies to the HTTP response.
 */
export async function verifyLoginOtpAndGetToken(
  rawPhone: string,
  submittedCode: string,
): Promise<LoginOtpResult> {
  const db = getServiceClient()
  const phone = normalizePhone(rawPhone)

  // ── 1. Validate the OTP ──────────────────────────────────────────────────
  const { data: row, error: queryErr } = await db
    .from('whatsapp_auth_otps')
    .select('id, code, expires_at')
    .eq('phone', phone)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (queryErr) {
    logger.error('verifyLoginOtpAndGetToken.query', { phone, error: queryErr })
    return { ok: false, reason: 'not_found' }
  }
  if (!row) return { ok: false, reason: 'not_found' }
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: 'expired' }
  if (row.code !== submittedCode) return { ok: false, reason: 'wrong_code' }

  // Mark as used before touching auth — prevents replay even if the auth step fails
  await db.from('whatsapp_auth_otps').update({ used: true }).eq('id', row.id)

  // ── 2. Ensure the Supabase Auth user exists ───────────────────────────────
  const email = syntheticEmailForPhone(rawPhone)

  // createUser is idempotent here: if the email is already registered the error
  // is intentionally ignored — generateLink works for both new and existing users.
  await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { phone },
  })

  // ── 3. Generate a one-time token the SSR layer can exchange for a session ─
  const { data: linkData, error: linkErr } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkErr || !linkData?.properties?.hashed_token) {
    logger.error('verifyLoginOtpAndGetToken.generateLink', { email, error: linkErr })
    return { ok: false, reason: 'auth_error' }
  }

  return { ok: true, tokenHash: linkData.properties.hashed_token, email }
}

/**
 * Links any pending provider_registrations for this phone to the auth user.
 * Called after a successful first login so the account page can show the registration status.
 */
export async function linkRegistrationToUser(rawPhone: string, userId: string): Promise<void> {
  const db = getServiceClient()
  const phone = normalizePhone(rawPhone)

  // Match on both phone and whatsapp columns since a user might have
  // provided their number in either field during registration.
  const { error } = await db
    .from('provider_registrations')
    .update({ owner_id: userId })
    .or(`phone.eq.${phone},whatsapp.eq.${phone}`)
    .is('owner_id', null)

  if (error) {
    logger.warn('linkRegistrationToUser', { phone, userId, error })
  }
}
