import { logger } from '@lib/logger'
import { mockCanton, mockCantonsWithDistricts, mockDistricts, getMockDistrict } from '@lib/mockData'
import { isSupabaseConfigured, supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type CantonRow = Database['public']['Tables']['cantons']['Row']
type DistrictRow = Database['public']['Tables']['districts']['Row']

export type Canton = Pick<CantonRow, 'id' | 'name' | 'slug'>
export type District = Pick<DistrictRow, 'id' | 'canton_id' | 'name' | 'slug'>
export type CantonWithDistricts = Canton & { districts: District[] }

export async function getCantons(): Promise<Canton[]> {
  if (!isSupabaseConfigured) return [mockCanton]

  const { data, error } = await supabase.from('cantons').select('id, name, slug').order('name')

  if (error) {
    logger.error('getCantons', { error })
    return []
  }

  return data ?? []
}

export async function getCantonBySlug(cantonSlug: string): Promise<Canton | null> {
  if (!isSupabaseConfigured) return cantonSlug === mockCanton.slug ? mockCanton : null

  const { data, error } = await supabase
    .from('cantons')
    .select('id, name, slug')
    .eq('slug', cantonSlug)
    .maybeSingle()

  if (error) {
    logger.error('getCantonBySlug', { cantonSlug, error })
    return null
  }

  return data
}

export async function getDistrictsByCantonId(cantonId: string): Promise<District[]> {
  if (!isSupabaseConfigured) {
    return cantonId === mockCanton.id ? mockDistricts : []
  }

  const { data, error } = await supabase
    .from('districts')
    .select('id, canton_id, name, slug')
    .eq('canton_id', cantonId)
    .order('name')

  if (error) {
    logger.error('getDistrictsByCantonId', { cantonId, error })
    return []
  }

  return data ?? []
}

export async function getDistrictBySlugs(
  cantonSlug: string,
  districtSlug: string,
): Promise<(District & { canton: Canton }) | null> {
  if (!isSupabaseConfigured) return getMockDistrict(cantonSlug, districtSlug)

  const canton = await getCantonBySlug(cantonSlug)
  if (!canton) return null

  const { data, error } = await supabase
    .from('districts')
    .select('id, canton_id, name, slug')
    .eq('canton_id', canton.id)
    .eq('slug', districtSlug)
    .maybeSingle()

  if (error) {
    logger.error('getDistrictBySlugs', { cantonSlug, districtSlug, error })
    return null
  }

  return data ? { ...data, canton } : null
}

export async function getCantonsWithDistricts(): Promise<CantonWithDistricts[]> {
  if (!isSupabaseConfigured) return mockCantonsWithDistricts

  const [cantons, districts] = await Promise.all([
    getCantons(),
    supabase.from('districts').select('id, canton_id, name, slug').order('name'),
  ])

  if (districts.error) {
    logger.error('getCantonsWithDistricts.districts', { error: districts.error })
    return cantons.map((canton) => ({ ...canton, districts: [] }))
  }

  return cantons.map((canton) => ({
    ...canton,
    districts: (districts.data ?? []).filter((district) => district.canton_id === canton.id),
  }))
}

export async function getCantonStaticPaths(): Promise<Array<{ params: { canton: string } }>> {
  const cantons = await getCantons()
  return cantons.map((canton) => ({ params: { canton: canton.slug } }))
}

export async function getDistrictStaticPaths(): Promise<
  Array<{ params: { canton: string; distrito: string } }>
> {
  if (!isSupabaseConfigured) {
    return mockDistricts.map((district) => ({
      params: { canton: mockCanton.slug, distrito: district.slug },
    }))
  }

  const [cantons, districtsResult] = await Promise.all([
    getCantons(),
    supabase.from('districts').select('id, canton_id, name, slug'),
  ])

  if (districtsResult.error) {
    logger.error('getDistrictStaticPaths', { error: districtsResult.error })
    return []
  }

  const cantonSlugById = new Map(cantons.map((canton) => [canton.id, canton.slug]))

  return (districtsResult.data ?? []).flatMap((district) => {
    const canton = cantonSlugById.get(district.canton_id)
    return canton ? [{ params: { canton, distrito: district.slug } }] : []
  })
}
