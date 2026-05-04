import { getCategoryBySlug } from '@lib/queries/categories'
import { getCantons, getDistrictBySlugs } from '@lib/queries/geography'
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

  const { data: district, error: districtError } = await supabase
    .from('districts')
    .select('id, canton_id, name, slug')
    .eq('id', provider.district_id)
    .maybeSingle()

  if (districtError || !district) {
    logger.error('getProviderByRouteSlug.district', { providerId, error: districtError })
    return null
  }

  const { data: canton, error: cantonError } = await supabase
    .from('cantons')
    .select('id, name, slug')
    .eq('id', district.canton_id)
    .maybeSingle()

  if (cantonError || !canton) {
    logger.error('getProviderByRouteSlug.canton', { providerId, error: cantonError })
    return null
  }

  const { data: providerCategories, error: providerCategoriesError } = await supabase
    .from('provider_categories')
    .select('provider_id, category_id')
    .eq('provider_id', provider.id)

  if (providerCategoriesError) {
    logger.error('getProviderByRouteSlug.providerCategories', {
      providerId,
      error: providerCategoriesError,
    })
    return null
  }

  const categoryIds = (providerCategories ?? []).map((row) => row.category_id)
  const categories =
    categoryIds.length > 0
      ? await supabase.from('categories').select('id, name, slug, icon_emoji').in('id', categoryIds)
      : { data: [], error: null }

  if (categories.error) {
    logger.error('getProviderByRouteSlug.categories', { providerId, error: categories.error })
    return null
  }

  return {
    ...provider,
    district: {
      id: district.id,
      name: district.name,
      slug: district.slug,
      canton,
    },
    categories: categories.data ?? [],
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

  const [cantons, districtsResult, providersResult, providerCategoriesResult, categoriesResult] =
    await Promise.all([
      getCantons(),
      supabase.from('districts').select('id, canton_id, name, slug'),
      supabase.from('providers').select('id, district_id').eq('verified', true),
      supabase.from('provider_categories').select('provider_id, category_id'),
      supabase.from('categories').select('id, name, slug'),
    ])

  if (districtsResult.error || providersResult.error || providerCategoriesResult.error || categoriesResult.error) {
    logger.error('getListingStaticPaths', {
      districtsError: districtsResult.error,
      providersError: providersResult.error,
      providerCategoriesError: providerCategoriesResult.error,
      categoriesError: categoriesResult.error,
    })
    return []
  }

  const cantonSlugById = new Map(cantons.map((canton) => [canton.id, canton.slug]))
  const districtById = new Map((districtsResult.data ?? []).map((district) => [district.id, district]))
  const categorySlugById = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.slug]))
  const districtIdByProviderId = new Map(
    (providersResult.data ?? []).map((provider) => [provider.id, provider.district_id]),
  )
  const countByCombination = new Map<string, number>()

  for (const providerCategory of providerCategoriesResult.data ?? []) {
    const districtId = districtIdByProviderId.get(providerCategory.provider_id)
    const district = districtId ? districtById.get(districtId) : undefined
    const cantonSlug = district ? cantonSlugById.get(district.canton_id) : undefined
    const categorySlug = categorySlugById.get(providerCategory.category_id)
    if (!district || !cantonSlug || !categorySlug) continue

    const key = `${cantonSlug}/${district.slug}/${categorySlug}`
    countByCombination.set(key, (countByCombination.get(key) ?? 0) + 1)
  }

  return [...countByCombination.entries()].flatMap(([key, count]) => {
    if (count < 3) return []
    const [canton, distrito, categoria] = key.split('/')
    return [{ params: { canton, distrito, categoria } }]
  })
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

