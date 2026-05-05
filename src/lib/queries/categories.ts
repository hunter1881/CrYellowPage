import { logger } from '@lib/logger'
import { mockCategories } from '@lib/mockData'
import { isSupabaseConfigured, supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

export type Category = Pick<CategoryRow, 'id' | 'name' | 'slug' | 'icon_emoji'>

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return mockCategories

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon_emoji')
    .order('name')

  if (error) {
    logger.error('getCategories', { error })
    return []
  }

  return data ?? []
}

export async function getCategoryBySlug(categorySlug: string): Promise<Category | null> {
  if (!isSupabaseConfigured) {
    return mockCategories.find((category) => category.slug === categorySlug) ?? null
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon_emoji')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (error) {
    logger.error('getCategoryBySlug', { categorySlug, error })
    return null
  }

  return data
}

export type CategoryWithCount = Category & { count: number }

export async function getCategoriesByDistrictId(districtId: string): Promise<Category[]> {
  if (!isSupabaseConfigured) return mockCategories

  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .select('id, district_id')
    .eq('district_id', districtId)
    .eq('verified', true)

  if (providersError) {
    logger.error('getCategoriesByDistrictId.providers', { districtId, error: providersError })
    return []
  }

  const providerIds = (providers ?? []).map((provider) => provider.id)
  if (providerIds.length === 0) return []

  const { data: providerCategories, error: providerCategoriesError } = await supabase
    .from('provider_categories')
    .select('provider_id, category_id')
    .in('provider_id', providerIds)

  if (providerCategoriesError) {
    logger.error('getCategoriesByDistrictId.providerCategories', {
      districtId,
      error: providerCategoriesError,
    })
    return []
  }

  const categoryIds = [...new Set((providerCategories ?? []).map((row) => row.category_id))]
  if (categoryIds.length === 0) return []

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon_emoji')
    .in('id', categoryIds)
    .order('name')

  if (error) {
    logger.error('getCategoriesByDistrictId.categories', { districtId, error })
    return []
  }

  return data ?? []
}

/**
 * Batched count of distinct active categories per district. One query for N districts
 * — replaces calling getCategoriesByDistrictId in a loop. Returns a Map keyed by
 * district_id; districts with zero verified providers are absent from the map.
 */
export async function getCategoryCountsByDistrictIds(
  districtIds: string[],
): Promise<Map<string, number>> {
  if (districtIds.length === 0) return new Map()
  if (!isSupabaseConfigured) {
    return new Map(districtIds.map((id) => [id, mockCategories.length]))
  }

  const { data, error } = await supabase
    .from('provider_categories')
    .select('category_id, providers!inner(district_id, verified)')
    .in('providers.district_id', districtIds)
    .eq('providers.verified', true)

  if (error) {
    logger.error('getCategoryCountsByDistrictIds', { districtIds, error })
    return new Map()
  }

  const distinctByDistrict = new Map<string, Set<string>>()
  for (const row of data ?? []) {
    const provider = Array.isArray(row.providers) ? row.providers[0] : row.providers
    if (!provider) continue
    const set = distinctByDistrict.get(provider.district_id) ?? new Set<string>()
    set.add(row.category_id)
    distinctByDistrict.set(provider.district_id, set)
  }

  return new Map([...distinctByDistrict].map(([districtId, set]) => [districtId, set.size]))
}

export async function getCategoriesWithCountsByDistrictId(districtId: string): Promise<CategoryWithCount[]> {
  if (!isSupabaseConfigured) return mockCategories.map((c) => ({ ...c, count: 2 }))

  // Step 1: get all provider IDs that effectively cover this district (country/canton/district level)
  const { data: effective, error: effError } = await supabase
    .from('provider_effective_districts')
    .select('provider_id')
    .eq('district_id', districtId)

  if (effError) {
    logger.error('getCategoriesWithCountsByDistrictId.effective', { districtId, error: effError })
    return []
  }

  const providerIds = (effective ?? []).map((r) => r.provider_id).filter(Boolean) as string[]
  if (providerIds.length === 0) return []

  // Step 2: get categories for those verified providers
  const { data: rows, error } = await supabase
    .from('provider_categories')
    .select('category_id, providers!inner(verified)')
    .in('provider_id', providerIds)
    .eq('providers.verified', true)

  if (error) {
    logger.error('getCategoriesWithCountsByDistrictId', { districtId, error })
    return []
  }

  if (!rows || rows.length === 0) return []

  // Count providers per category
  const countByCategory = new Map<string, number>()
  for (const row of rows) {
    countByCategory.set(row.category_id, (countByCategory.get(row.category_id) ?? 0) + 1)
  }

  const categoryIds = [...countByCategory.keys()]

  const { data, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, icon_emoji')
    .in('id', categoryIds)
    .order('name')

  if (catError) {
    logger.error('getCategoriesWithCountsByDistrictId.categories', { districtId, error: catError })
    return []
  }

  return (data ?? []).map((cat) => ({ ...cat, count: countByCategory.get(cat.id) ?? 0 }))
}
