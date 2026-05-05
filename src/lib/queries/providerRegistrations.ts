import { ActionError } from 'astro:actions'
import { logger } from '@lib/logger'
import { selectedIncludesSinpe } from '@lib/queries/paymentMethods'
import { supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type ProviderRegistrationInsert = Database['public']['Tables']['provider_registrations']['Insert']

export interface ProviderRegistrationInput {
  businessName: string
  contactName: string
  phone: string
  whatsapp?: string | null
  email: string
  districtId: string
  categoryIds: string[]
  description: string
  paymentMethodSlugs: string[]
  worksWeekends: boolean
  yearsActive: number
  sourceLocale: 'es' | 'en'
}

export async function createProviderRegistration(input: ProviderRegistrationInput): Promise<{ id: string }> {
  const [districtResult, categoriesResult] = await Promise.all([
    supabase.from('districts').select('id').eq('id', input.districtId).maybeSingle(),
    supabase.from('categories').select('id').in('id', input.categoryIds),
  ])

  if (districtResult.error) {
    logger.error('createProviderRegistration.district', {
      districtId: input.districtId,
      error: districtResult.error,
    })
    throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No pudimos validar el distrito.' })
  }

  if (!districtResult.data) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'El distrito seleccionado no existe.' })
  }

  if (categoriesResult.error) {
    logger.error('createProviderRegistration.categories', {
      categoryIds: input.categoryIds,
      error: categoriesResult.error,
    })
    throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No pudimos validar las categorías.' })
  }

  const validCategoryIds = new Set((categoriesResult.data ?? []).map((category) => category.id))
  if (validCategoryIds.size !== input.categoryIds.length) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Una o más categorías no existen.' })
  }

  const id = crypto.randomUUID()
  const registration: ProviderRegistrationInsert = {
    id,
    business_name: input.businessName,
    contact_name: input.contactName,
    phone: input.phone,
    whatsapp: input.whatsapp || null,
    email: input.email,
    district_id: input.districtId,
    category_ids: input.categoryIds,
    description: input.description,
    accepts_sinpe: selectedIncludesSinpe(input.paymentMethodSlugs),
    works_weekends: input.worksWeekends,
    years_active: input.yearsActive,
    source_locale: input.sourceLocale,
    status: 'pending',
  }

  const { error } = await supabase.from('provider_registrations').insert(registration)

  if (error) {
    logger.error('createProviderRegistration.insert', { districtId: input.districtId, error })
    throw new ActionError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'No pudimos guardar la solicitud. Intentá de nuevo.',
    })
  }

  return { id }
}
