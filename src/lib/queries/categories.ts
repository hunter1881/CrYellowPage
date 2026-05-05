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

export async function getCategoriesWithCountsByDistrictId(districtId: string): Promise<CategoryWithCount[]> {
  if (!isSupabaseConfigured) return mockCategories.map((c) => ({ ...c, count: 2 }))

  // Single join query: provider_categories filtered to verified providers in this district
  // Replaces 2 sequential queries (providers, then provider_categories)
  const { data: rows, error } = await supabase
    .from('provider_categories')
    .select('category_id, providers!inner(district_id, verified)')
    .eq('providers.district_id', districtId)
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
