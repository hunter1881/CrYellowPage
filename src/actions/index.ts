import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { createProviderRegistration } from '@lib/queries/providerRegistrations'

const optionalTrimmedString = z
  .string()
  .nullable()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim() ?? ''
    return trimmed.length > 0 ? trimmed : null
  })

export const server = {
  registerProvider: defineAction({
    accept: 'form',
    input: z.object({
      businessName: z.string().trim().min(3).max(120),
      contactName: z.string().trim().min(3).max(120),
      phone: z.string().trim().regex(/^(?:\+506\s?)?\d{4}-?\d{4}$/),
      whatsapp: optionalTrimmedString,
      email: z.string().trim().pipe(z.email().max(160)),
      districtId: z.uuid(),
      categoryIds: z.array(z.uuid()).min(1).max(4),
      description: z.string().trim().min(30).max(500),
      acceptsSinpe: z.boolean().optional().default(false),
      worksWeekends: z.boolean().optional().default(false),
      yearsActive: z.number().min(0).max(80).default(1),
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
        districtId: input.districtId,
        categoryIds: input.categoryIds,
        description: input.description,
        acceptsSinpe: input.acceptsSinpe,
        worksWeekends: input.worksWeekends,
        yearsActive: input.yearsActive,
        sourceLocale: input.sourceLocale,
      })
    },
  }),
}
