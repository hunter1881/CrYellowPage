import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { createProviderRegistration } from '@lib/queries/providerRegistrations'
import type { ServiceAreaInput } from '@lib/queries/providerRegistrations'
import { selectedIncludesSinpe } from '@lib/queries/paymentMethods'
import { insertReview } from '@lib/queries/reviews'
import { createPhoneOtp, verifyPhoneOtp } from '@lib/queries/verification'
import { insertProviderReport } from '@lib/queries/reports'
import { sendWhatsAppText, sendOtpTemplate } from '@lib/whatsapp'
import { supabase } from '@lib/supabase'

// JS .trim() does not strip Unicode format characters (U+200B zero-width space,
// U+200C/D zero-width joiners, etc.). A name of 3 zero-width spaces would pass
// .trim().min(3). cleanText strips format chars BEFORE trimming so length checks
// reflect visible content. Surfaced by qa-tester exploratory run 2026-05-05 (BUG-001).
function cleanText(value: string): string {
  return value.replace(/\p{Cf}/gu, '').trim()
}

// Coerce non-string inputs (null, undefined, number from coerce, etc.) to "" so
// the type-check passes and the field-specific refinement can produce a Spanish
// error. Without this, an empty form field that arrives as null would trigger
// Zod's default English `invalid_type` message ("expected string, received null")
// before any custom refinement runs. Surfaced by TC-RGR-004 verification run
// 2026-05-05 (BUG-004 residual): only 10/12 rows of TC-RGR-004 passed because
// the businessName/contactName empty-input cases hit the type-check path.
const looseString = () =>
  z.preprocess((value) => (typeof value === 'string' ? value : ''), z.string())

const requiredText = (label: string, min: number, max: number) =>
  looseString()
    .transform(cleanText)
    .refine((s) => s.length >= min, { message: `${label}: mínimo ${min} caracteres.` })
    .refine((s) => s.length <= max, { message: `${label}: máximo ${max} caracteres.` })

const optionalTrimmedString = z
  .string()
  .nullable()
  .optional()
  .transform((value) => {
    const cleaned = cleanText(value ?? '')
    return cleaned.length > 0 ? cleaned : null
  })

export const server = {
  registerProvider: defineAction({
    accept: 'form',
    input: z.object({
      businessName: requiredText('Nombre del negocio', 3, 120),
      contactName: requiredText('Persona de contacto', 3, 120),
      phone: looseString()
        .transform((s) => s.trim())
        .refine(
          (s) => /^(?:\+506\s?)?\d{4}-?\d{4}$/.test(s),
          'Teléfono inválido. Formato: 8888-8888 o +506 8888-8888.',
        ),
      whatsapp: optionalTrimmedString,
      email: z.preprocess(
        (v) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : null),
        z.string().email('Correo electrónico inválido.').max(160).nullable(),
      ),
      serviceAreaJson: z.preprocess(
        (val) => {
          if (typeof val !== 'string') return []
          try {
            return JSON.parse(val)
          } catch {
            return []
          }
        },
        z
          .array(
            z.discriminatedUnion('level', [
              z.object({ level: z.literal('country') }),
              z.object({ level: z.literal('canton'), canton_id: z.string().uuid() }),
              z.object({ level: z.literal('district'), district_id: z.string().uuid() }),
            ]),
          )
          .min(1, 'Seleccione al menos un área de servicio.')
          .max(50, 'Demasiadas áreas de servicio.'),
      ),
      categoryIds: z
        .array(z.uuid())
        .min(1, 'Seleccione al menos una categoría.')
        .max(4, 'Máximo 4 categorías.'),
      description: requiredText('Descripción', 30, 500),
      paymentMethodSlugs: z.array(z.string().trim().min(1)).max(11).default([]),
      worksWeekends: z.boolean().optional().default(false),
      yearsActive: z.number().min(0, 'Años no puede ser negativo.').max(80, 'Máximo 80 años.').default(1),
      sourceLocale: z.enum(['es', 'en']).default('es'),
      website: optionalTrimmedString,
    }),
    handler: async (input) => {
      if (input.website) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'Solicitud inválida.' })
      }

      return createProviderRegistration({
        businessName: input.businessName,
        contactName: input.contactName,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        serviceAreas: input.serviceAreaJson as ServiceAreaInput[],
        categoryIds: input.categoryIds,
        description: input.description,
        paymentMethodSlugs: input.paymentMethodSlugs,
        worksWeekends: input.worksWeekends,
        yearsActive: input.yearsActive,
        sourceLocale: input.sourceLocale,
      })
    },
  }),

  submitReview: defineAction({
    accept: 'form',
    input: z.object({
      providerId: z.uuid('Proveedor inválido.'),
      authorName: requiredText('Nombre', 1, 80),
      rating: z.coerce
        .number({ message: 'Calificación inválida.' })
        .int('La calificación debe ser un número entero.')
        .min(1, 'Seleccione una calificación de 1 a 5 estrellas.')
        .max(5, 'Calificación máxima: 5 estrellas.'),
      comment: requiredText('Comentario', 1, 800),
      workConfirmed: z
        .enum(['yes', 'no'], { message: 'Confirme si recibió el servicio.' })
        .transform((v) => v === 'yes'),
    }),
    handler: async (input) => {
      const result = await insertReview({
        providerId: input.providerId,
        authorName: input.authorName,
        rating: input.rating,
        comment: input.comment,
        workConfirmed: input.workConfirmed,
      })

      if (!result.ok) {
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: result.message })
      }

      return { providerId: input.providerId }
    },
  }),

  // ── Phone verification ────────────────────────────────────────────────────

  /**
   * Generates an OTP and sends it via WhatsApp.
   *
   * Strategy (zero-cost when possible):
   *   1. Try sending a plain-text message (free, within an open customer-service window).
   *   2. If not sent, fall back to an authentication template (~$0.025/msg for CR).
   *
   * The free path relies on the user having messaged the business number first —
   * the webhook handler in /api/whatsapp-webhook.ts opens that CSW automatically.
   */
  requestPhoneVerification: defineAction({
    accept: 'json',
    input: z.object({
      providerId: z.string().uuid('ID de proveedor inválido.'),
    }),
    handler: async (input, ctx) => {
      const userId = ctx.locals.user?.id

      // Verify ownership: provider must belong to the logged-in user
      const { data: provider, error } = await supabase
        .from('providers')
        .select('id, phone, phone_verified')
        .eq('id', input.providerId)
        .maybeSingle()

      if (error || !provider) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Proveedor no encontrado.' })
      }

      if (userId) {
        const { data: owned } = await supabase
          .from('providers')
          .select('id')
          .eq('id', input.providerId)
          .eq('owner_id', userId)
          .maybeSingle()
        if (!owned) {
          throw new ActionError({ code: 'FORBIDDEN', message: 'No tenés permiso para verificar este perfil.' })
        }
      }

      if (provider.phone_verified) {
        return { sent: false, alreadyVerified: true }
      }

      const code = await createPhoneOtp(provider.id, provider.phone)

      const message = `Tu código de verificación para El Contactico es: *${code}*\nVálido por 10 minutos.`

      // Try free path first (requires open CSW), then fall back to template
      const sentFree = await sendWhatsAppText(provider.phone, message)
      if (!sentFree) {
        await sendOtpTemplate(provider.phone, code)
      }

      return { sent: true, alreadyVerified: false }
    },
  }),

  /**
   * Validates the 6-digit OTP entered by the provider.
   * On success the Postgres trigger sets verified=true automatically.
   */
  verifyPhoneOtp: defineAction({
    accept: 'json',
    input: z.object({
      providerId: z.string().uuid('ID de proveedor inválido.'),
      code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, 'El código debe ser de 6 dígitos.'),
    }),
    handler: async (input) => {
      const result = await verifyPhoneOtp(input.providerId, input.code)

      if (!result.ok) {
        const messages: Record<typeof result.reason, string> = {
          not_found: 'No encontramos un código activo. Solicitá uno nuevo.',
          expired: 'El código expiró. Solicitá uno nuevo.',
          used: 'Este código ya fue utilizado. Solicitá uno nuevo.',
          wrong_code: 'Código incorrecto. Revisá el mensaje en WhatsApp.',
        }
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: messages[result.reason],
        })
      }

      return { verified: true }
    },
  }),

  // ── Community reports ─────────────────────────────────────────────────────

  /**
   * Submits a community report against a provider.
   * The Postgres trigger auto-hides the provider after 3 fraud/fake_info reports.
   */
  reportProvider: defineAction({
    accept: 'form',
    input: z.object({
      providerId: z.string().uuid('Proveedor inválido.'),
      reason: z.enum(['fraud', 'fake_info', 'no_show', 'bad_quality', 'spam', 'other'], {
        message: 'Motivo inválido.',
      }),
      details: z
        .string()
        .trim()
        .max(500, 'Máximo 500 caracteres.')
        .optional()
        .transform((v) => (v && v.length > 0 ? v : null)),
    }),
    handler: async (input, ctx) => {
      const reporterId = ctx.locals.user?.id ?? null

      const result = await insertProviderReport({
        providerId: input.providerId,
        reason: input.reason,
        details: input.details,
        reporterId,
      })

      if (!result.ok) {
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No se pudo enviar el reporte.' })
      }

      return { reported: true }
    },
  }),
}
