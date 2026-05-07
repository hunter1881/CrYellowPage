import { createClient } from '@supabase/supabase-js'
import type { Database } from '@generated/database.types'
import { logger } from '@lib/logger'

/**
 * Service-role client — bypasses RLS.
 * Used ONLY in action handlers that manage OTP codes (a table with no public policies).
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
 * Creates a new OTP code for the given provider + phone.
 * Invalidates any previous unused codes for the same provider first.
 * Returns the plain-text code (caller is responsible for sending it).
 */
export async function createPhoneOtp(providerId: string, phone: string): Promise<string> {
  const db = getServiceClient()

  // Mark previous codes as used so only the latest one is valid
  await db
    .from('phone_otp_codes')
    .update({ used: true })
    .eq('provider_id', providerId)
    .eq('used', false)

  const code = generateCode()

  const { error } = await db.from('phone_otp_codes').insert({
    provider_id: providerId,
    phone,
    code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    used: false,
  })

  if (error) {
    logger.error('createPhoneOtp.insert', { providerId, error })
    throw new Error('No se pudo generar el código de verificación.')
  }

  return code
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'used' | 'wrong_code' }

/**
 * Validates the submitted OTP code against the latest active code for the provider.
 * On success: marks the code used and sets providers.phone_verified = true.
 * The auto_approve_provider trigger in Postgres then sets verified=true if quality thresholds pass.
 */
export async function verifyPhoneOtp(
  providerId: string,
  submittedCode: string,
): Promise<OtpVerifyResult> {
  const db = getServiceClient()

  const { data: row, error } = await db
    .from('phone_otp_codes')
    .select('id, code, expires_at, used')
    .eq('provider_id', providerId)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('verifyPhoneOtp.fetch', { providerId, error })
    return { ok: false, reason: 'not_found' }
  }

  if (!row) return { ok: false, reason: 'not_found' }
  if (row.used) return { ok: false, reason: 'used' }
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: 'expired' }
  if (row.code !== submittedCode) return { ok: false, reason: 'wrong_code' }

  // Mark OTP as used
  await db.from('phone_otp_codes').update({ used: true }).eq('id', row.id)

  // Set phone_verified = true on the provider row
  // The trg_provider_auto_approve trigger fires here and may also set verified=true
  const { error: updateError } = await db
    .from('providers')
    .update({ phone_verified: true })
    .eq('id', providerId)

  if (updateError) {
    logger.error('verifyPhoneOtp.updateProvider', { providerId, error: updateError })
    return { ok: false, reason: 'not_found' }
  }

  return { ok: true }
}
