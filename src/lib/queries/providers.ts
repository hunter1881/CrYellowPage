import { getCategoryBySlug } from '@lib/queries/categories'
import { getDistrictBySlugs } from '@lib/queries/geography'
import { logger } from '@lib/logger'
import { getMockListingPaths, getMockProvider, getMockProviderPaths, mockProviders } from '@lib/mockData'
import { providerIdFromSlug, toSlug } from '@lib/slug'
import { isSupabaseConfigured, supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type ProviderRow = Database['public']['Tables']['providers']['Row']

export type ProviderListItem = Pick<
  ProviderRow,
  | 'id'
  | 'name'
  | 'phone'
  | 'whatsapp'
  | 'description'
  | 'photo_url'
  | 'created_at'
  | 'accepts_sinpe'
  | 'works_weekends'
  | 'years_active'
  | 'completed_jobs'
  | 'response_time_minutes'
>

export type ProviderProfile = ProviderListItem &
  Pick<ProviderRow, 'email' | 'district_id' | 'verified'> & {
    district: {
      id: string
      name: string
      slug: string
      canton: {
        id: string
        name: string
        slug: string
      }
    }
    categories: Array<{ id: string; name: string; slug: string; icon_emoji: string | null }>
  }

export async function getProvidersByDistrictAndCategory(
  cantonSlug: string,
  districtSlug: string,
  categorySlug: string,
): Promise<ProviderListItem[]> {
  if (!isSupabaseConfigured) {
    return cantonSlug === 'aserri' && districtSlug === 'vuelta-de-jorco' && categorySlug === 'fontaneria'
      ? mockProviders
      : []
  }

  const [district, category] = await Promise.all([
    getDistrictBySlugs(cantonSlug, districtSlug),
    getCategoryBySlug(categorySlug),
  ])

  if (!district || !category) return []

  const { data: providerCategories, error: providerCategoriesError } = await supabase
    .from('provider_categories')
    .select('provider_id, category_id')
    .eq('category_id', category.id)

  if (providerCategoriesError) {
    logger.error('getProvidersByDistrictAndCategory.providerCategories', {
      districtSlug,
      categorySlug,
      error: providerCategoriesError,
    })
    return []
  }

  const providerIds = (providerCategories ?? []).map((row) => row.provider_id)
  if (providerIds.length === 0) return []

  const { data, error } = await supabase
    .from('providers')
    .select(
      'id, name, phone, whatsapp, description, photo_url, created_at, accepts_sinpe, works_weekends, years_active, completed_jobs, response_time_minutes',
    )
    .eq('district_id', district.id)
    .eq('verified', true)
    .in('id', providerIds)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('getProvidersByDistrictAndCategory.providers', {
      districtSlug,
      categorySlug,
      error,
    })
    return []
  }

  return data ?? []
}

export async function getProviderByRouteSlug(routeSlug: string): Promise<ProviderProfile | null> {
  if (!isSupabaseConfigured) return getMockProvider(routeSlug)

  const providerId = providerIdFromSlug(routeSlug)

  // Round 1: fetch provider
  const { data: provider, error } = await supabase
    .from('providers')
    .select(
      'id, name, phone, whatsapp, email, description, photo_url, district_id, verified, created_at, accepts_sinpe, works_weekends, years_active, completed_jobs, response_time_minutes',
    )
    .eq('id', providerId)
    .eq('verified', true)
    .maybeSingle()

  if (error) {
    logger.error('getProviderByRouteSlug.provider', { routeSlug, error })
    return null
  }
  if (!provider) return null

  // Round 2: fetch district + provider_categories in parallel
  const [districtResult, providerCategoriesResult] = await Promise.all([
    supabase.from('districts').select('id, canton_id, name, slug').eq('id', provider.district_id).maybeSingle(),
    supabase.from('provider_categories').select('category_id').eq('provider_id', provider.id),
  ])

  if (districtResult.error || !districtResult.data) {
    logger.error('getProviderByRouteSlug.district', { providerId, error: districtResult.error })
    return null
  }
  if (providerCategoriesResult.error) {
    logger.error('getProviderByRouteSlug.providerCategories', { providerId, error: providerCategoriesResult.error })
    return null
  }

  const district = districtResult.data
  const categoryIds = (providerCategoriesResult.data ?? []).map((row) => row.category_id)

  // Round 3: fetch canton + categories in parallel
  const [cantonResult, categoriesResult] = await Promise.all([
    supabase.from('cantons').select('id, name, slug').eq('id', district.canton_id).maybeSingle(),
    categoryIds.length > 0
      ? supabase.from('categories').select('id, name, slug, icon_emoji').in('id', categoryIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; slug: string; icon_emoji: string | null }>, error: null }),
  ])

  if (cantonResult.error || !cantonResult.data) {
    logger.error('getProviderByRouteSlug.canton', { providerId, error: cantonResult.error })
    return null
  }
  if (categoriesResult.error) {
    logger.error('getProviderByRouteSlug.categories', { providerId, error: categoriesResult.error })
    return null
  }

  return {
    ...provider,
    district: {
      id: district.id,
      name: district.name,
      slug: district.slug,
      canton: cantonResult.data,
    },
    categories: categoriesResult.data ?? [],
  }
}

export async function getProviderStaticPaths(): Promise<Array<{ params: { id: string } }>> {
  if (!isSupabaseConfigured) return getMockProviderPaths()

  const { data, error } = await supabase
    .from('providers')
    .select('id, name, district_id')
    .eq('verified', true)

  if (error) {
    logger.error('getProviderStaticPaths', { error })
    return []
  }

  return (data ?? []).map((provider) => ({
    params: { id: `${provider.id}-${toSlug(provider.name)}` },
  }))
}

export async function getListingStaticPaths(): Promise<
  Array<{ params: { canton: string; distrito: string; categoria: string } }>
> {
  if (!isSupabaseConfigured) return getMockListingPaths()

  // min_providers = 1: emit a static path for any (canton, district, category)
  // with at least one verified provider. The "<3 providers = thin content"
  // Google heuristic does not fit a hyperlocal directory where a small district
  // legitimately has 1–2 providers per category. The EmptyState in the listing
  // page is reserved for the case where active filters reduce the visible set
  // to 0, not for the listing as a whole.
  const { data, error } = await supabase.rpc('list_valid_listing_combinations', { min_providers: 1 })

  if (error) {
    logger.error('getListingStaticPaths', { error })
    return []
  }

  return (data ?? []).map((row) => ({
    params: {
      canton: row.canton_slug as string,
      distrito: row.district_slug as string,
      categoria: row.category_slug as string,
    },
  }))
}

export async function getRecentProviders(limit: number = 3): Promise<ProviderListItem[]> {
  if (!isSupabaseConfigured) return mockProviders.slice(0, limit)

  const { data, error } = await supabase
    .from('providers')
    .select(
      'id, name, phone, whatsapp, description, photo_url, created_at, accepts_sinpe, works_weekends, years_active, completed_jobs, response_time_minutes',
    )
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('getRecentProviders', { limit, error })
    return []
  }

  return data ?? []
}

export interface ProviderSearchResult extends ProviderListItem {
  district_id: string
  rank: number
}

export async function searchProviders(
  q: string,
  districtId?: string,
): Promise<ProviderSearchResult[]> {
  if (!isSupabaseConfigured || q.trim().length === 0) return []

  const { data, error } = await supabase.rpc('search_providers', {
    q: q.trim(),
    p_district: districtId ?? undefined,
    p_limit: 20,
    p_offset: 0,
  })

  if (error) {
    logger.error('searchProviders', { q, districtId, error })
    return []
  }

  return (data ?? []) as ProviderSearchResult[]
}

export async function getProviderCountByDistrictIds(districtIds: string[]): Promise<number> {
  if (!isSupabaseConfigured) return mockProviders.length
  if (districtIds.length === 0) return 0

  const { count, error } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('verified', true)
    .in('district_id', districtIds)

  if (error) {
    logger.error('getProviderCountByDistrictIds', { districtIds, error })
    return 0
  }
  return count ?? 0
}

