import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { createProviderRegistration } from '@lib/queries/providerRegistrations'
import type { ServiceAreaInput } from '@lib/queries/providerRegistrations'
import { selectedIncludesSinpe } from '@lib/queries/paymentMethods'
import { insertReview } from '@lib/queries/reviews'

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
      email: looseString()
        .transform((s) => s.trim())
        .pipe(
          z.email('Correo electrónico inválido.').max(160, 'Correo electrónico demasiado largo.'),
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
}
