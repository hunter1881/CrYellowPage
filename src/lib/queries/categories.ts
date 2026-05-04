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
