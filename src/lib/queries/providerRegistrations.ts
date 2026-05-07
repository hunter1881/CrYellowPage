import { ActionError } from 'astro:actions'
import { logger } from '@lib/logger'
import { selectedIncludesSinpe } from '@lib/queries/paymentMethods'
import { supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type ProviderRegistrationInsert = Database['public']['Tables']['provider_registrations']['Insert']

export type ServiceAreaInput =
  | { level: 'country' }
  | { level: 'canton'; canton_id: string }
  | { level: 'district'; district_id: string }

export interface ProviderRegistrationInput {
  businessName: string
  contactName: string
  phone: string
  whatsapp?: string | null
  email?: string | null
  serviceAreas: ServiceAreaInput[]
  categoryIds: string[]
  description: string
  paymentMethodSlugs: string[]
  worksWeekends: boolean
  yearsActive: number
  sourceLocale: 'es' | 'en'
}

export async function createProviderRegistration(input: ProviderRegistrationInput): Promise<{ id: string }> {
  const cantonIds = input.serviceAreas
    .filter((a): a is { level: 'canton'; canton_id: string } => a.level === 'canton')
    .map((a) => a.canton_id)
  const districtIds = input.serviceAreas
    .filter((a): a is { level: 'district'; district_id: string } => a.level === 'district')
    .map((a) => a.district_id)

  const [cantonsResult, districtsResult, categoriesResult] = await Promise.all([
    cantonIds.length > 0
      ? supabase.from('cantons').select('id').in('id', cantonIds)
      : Promise.resolve({ data: [], error: null }),
    districtIds.length > 0
      ? supabase.from('districts').select('id').in('id', districtIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('categories').select('id').in('id', input.categoryIds),
  ])

  if (cantonsResult.error) {
    logger.error('createProviderRegistration.cantons', { cantonIds, error: cantonsResult.error })
    throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No pudimos validar los cantones.' })
  }
  if ((cantonsResult.data?.length ?? 0) !== cantonIds.length) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Uno o más cantones seleccionados no existen.' })
  }

  if (districtsResult.error) {
    logger.error('createProviderRegistration.districts', { districtIds, error: districtsResult.error })
    throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No pudimos validar los distritos.' })
  }
  if ((districtsResult.data?.length ?? 0) !== districtIds.length) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Uno o más distritos seleccionados no existen.' })
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
  const registration = {
    id,
    business_name: input.businessName,
    contact_name: input.contactName,
    phone: input.phone,
    whatsapp: input.whatsapp || null,
    email: input.email ?? null,
    district_id: null,
    category_ids: input.categoryIds,
    description: input.description,
    accepts_sinpe: selectedIncludesSinpe(input.paymentMethodSlugs),
    works_weekends: input.worksWeekends,
    years_active: input.yearsActive,
    source_locale: input.sourceLocale,
    status: 'pending',
    service_areas: input.serviceAreas,
  }

  const { error } = await supabase
    .from('provider_registrations')
    .insert(registration)

  if (error) {
    // Postgres unique-violation code is 23505. Triggered by the partial unique
    // index on (email) WHERE status='pending' — a duplicate pending application
    // for the same email. Return a friendly Spanish message instead of leaking
    // the raw DB error.
    if (error.code === '23505') {
      throw new ActionError({
        code: 'CONFLICT',
        message: 'Ya tenemos una solicitud pendiente con este número de teléfono.',
      })
    }
    logger.error('createProviderRegistration.insert', { serviceAreas: input.serviceAreas, error })
    throw new ActionError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'No pudimos guardar la solicitud. Intentá de nuevo.',
    })
  }

  return { id }
}
