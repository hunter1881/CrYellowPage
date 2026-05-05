/**
 * Normalize a Costa Rica phone number to E.164 format (+506XXXXXXXX).
 *
 * Accepts inputs in any of these forms (and many more):
 *   '8712-4490'     → '+50687124490'
 *   '+506 8712-4490' → '+50687124490'
 *   '506 8712 4490' → '+50687124490'
 *   '50687124490'   → '+50687124490'
 *
 * Required by:
 *   - schema.org `LocalBusiness.telephone` for Google rich results (E.164 mandatory)
 *   - `tel:` links so they work from international dialers and one-tap-call apps
 */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('506') && digits.length >= 11) return `+${digits}`
  return `+506${digits}`
}
