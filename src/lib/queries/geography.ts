import { logger } from '@lib/logger'
import { mockCanton, mockCantonsWithDistricts, mockDistricts, getMockDistrict } from '@lib/mockData'
import { isSupabaseConfigured, supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type CantonRow = Database['public']['Tables']['cantons']['Row']
type DistrictRow = Database['public']['Tables']['districts']['Row']
type ProvinceRow = Database['public']['Tables']['provinces']['Row']

export type Province = Pick<ProvinceRow, 'id' | 'name' | 'slug' | 'code'>
export type Canton = Pick<CantonRow, 'id' | 'province_id' | 'name' | 'slug'>
export type District = Pick<DistrictRow, 'id' | 'canton_id' | 'name' | 'slug'>
export type CantonWithDistricts = Canton & { province?: Province; districts: District[] }

export async function getCantons(): Promise<Canton[]> {
  if (!isSupabaseConfigured) return [mockCanton]

  const { data, error } = await supabase.from('cantons').select('id, province_id, name, slug').order('name')

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
    .select('id, province_id, name, slug')
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

  // Run both queries in parallel — district slug may appear in multiple cantons
  const [cantonResult, districtsResult] = await Promise.all([
    supabase.from('cantons').select('id, province_id, name, slug').eq('slug', cantonSlug).maybeSingle(),
    supabase.from('districts').select('id, canton_id, name, slug').eq('slug', districtSlug),
  ])

  if (cantonResult.error) {
    logger.error('getDistrictBySlugs.canton', { cantonSlug, error: cantonResult.error })
    return null
  }
  const canton = cantonResult.data
  if (!canton) return null

  if (districtsResult.error) {
    logger.error('getDistrictBySlugs.district', { districtSlug, error: districtsResult.error })
    return null
  }
  const district = (districtsResult.data ?? []).find((d) => d.canton_id === canton.id) ?? null
  return district ? { ...district, canton } : null
}

export async function getCantonsWithDistricts(): Promise<CantonWithDistricts[]> {
  if (!isSupabaseConfigured) return mockCantonsWithDistricts

  const [cantons, districts, provinces] = await Promise.all([
    getCantons(),
    supabase.from('districts').select('id, canton_id, name, slug').order('name'),
    supabase.from('provinces').select('id, name, slug, code').order('code'),
  ])

  if (districts.error) {
    logger.error('getCantonsWithDistricts.districts', { error: districts.error })
    return cantons.map((canton) => ({ ...canton, districts: [] }))
  }

  if (provinces.error) {
    logger.error('getCantonsWithDistricts.provinces', { error: provinces.error })
  }

  const provinceById = new Map((provinces.data ?? []).map((province) => [province.id, province]))

  return cantons.map((canton) => ({
    ...canton,
    province: provinceById.get(canton.province_id),
    districts: (districts.data ?? []).filter((district) => district.canton_id === canton.id),
  }))
}

export async function getCantonStaticPaths(): Promise<Array<{ params: { canton: string } }>> {
  if (!isSupabaseConfigured) {
    return [{ params: { canton: mockCanton.slug } }]
  }

  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .select('district_id')
    .eq('verified', true)

  if (providersError) {
    logger.error('getCantonStaticPaths.providers', { error: providersError })
    return []
  }

  const districtIds = [...new Set(
    (providers ?? []).map((provider) => provider.district_id).filter((id): id is string => id !== null)
  )]
  if (districtIds.length === 0) return []

  const { data: districts, error: districtsError } = await supabase
    .from('districts')
    .select('id, canton_id')
    .in('id', districtIds)

  if (districtsError) {
    logger.error('getCantonStaticPaths.districts', { error: districtsError })
    return []
  }

  const cantonIds = [...new Set((districts ?? []).map((district) => district.canton_id))]
  if (cantonIds.length === 0) return []

  const cantons = await getCantons()
  return cantons
    .filter((canton) => cantonIds.includes(canton.id))
    .map((canton) => ({ params: { canton: canton.slug } }))
}

/**
 * Static paths for CANTON landing pages — all cantons that exist in the DB.
 * No provider filter: a canton page must exist regardless of whether it has
 * verified providers yet (it shows an empty-state or district list).
 */
export async function getCantonStaticPathsAll(): Promise<Array<{ params: { canton: string } }>> {
  if (!isSupabaseConfigured) {
    return [{ params: { canton: mockCanton.slug } }]
  }

  const cantons = await getCantons()
  return cantons.map((canton) => ({ params: { canton: canton.slug } }))
}

/**
 * Static paths for DISTRICT landing pages — all districts that exist in the DB.
 * No provider filter: a district page must exist for every district so the
 * geographic hierarchy is navigable even before providers are added.
 */
export async function getDistrictStaticPathsAll(): Promise<
  Array<{ params: { canton: string; distrito: string } }>
> {
  if (!isSupabaseConfigured) {
    return mockDistricts.map((district) => ({
      params: { canton: mockCanton.slug, distrito: district.slug },
    }))
  }

  const [cantons, districtsResult] = await Promise.all([
    getCantons(),
    supabase.from('districts').select('id, canton_id, slug'),
  ])

  if (districtsResult.error) {
    logger.error('getDistrictStaticPathsAll', { error: districtsResult.error })
    return []
  }

  const cantonSlugById = new Map(cantons.map((canton) => [canton.id, canton.slug]))

  return (districtsResult.data ?? []).flatMap((district) => {
    const cantonSlug = cantonSlugById.get(district.canton_id)
    return cantonSlug ? [{ params: { canton: cantonSlug, distrito: district.slug } }] : []
  })
}

export async function getDistrictStaticPaths(): Promise<
  Array<{ params: { canton: string; distrito: string } }>
> {
  if (!isSupabaseConfigured) {
    return mockDistricts.map((district) => ({
      params: { canton: mockCanton.slug, distrito: district.slug },
    }))
  }

  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .select('district_id')
    .eq('verified', true)

  if (providersError) {
    logger.error('getDistrictStaticPaths.providers', { error: providersError })
    return []
  }

  const districtIds = [...new Set(
    (providers ?? []).map((provider) => provider.district_id).filter((id): id is string => id !== null)
  )]
  if (districtIds.length === 0) return []

  const [cantons, districtsResult] = await Promise.all([
    getCantons(),
    supabase.from('districts').select('id, canton_id, name, slug').in('id', districtIds),
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

export async function getDistrictLabelById(districtId: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    const district = mockDistricts.find((d) => d.id === districtId)
    if (!district) return null
    return `${district.name}, ${mockCanton.name}`
  }

  const { data, error } = await supabase
    .from('districts')
    .select('name, canton:cantons!inner(name)')
    .eq('id', districtId)
    .maybeSingle()

  if (error) {
    logger.error('getDistrictLabelById', { districtId, error })
    return null
  }
  if (!data) return null

  const canton = Array.isArray(data.canton) ? data.canton[0] : data.canton
  return canton?.name ? `${data.name}, ${canton.name}` : data.name
}

export type DistrictWithCanton = District & { canton: Canton }

/**
 * Returns the first district (alphabetically by canton, then district) that has
 * at least one verified provider. Uses a single JOIN query instead of iterating.
 */
export async function getFirstActiveDistrict(): Promise<DistrictWithCanton | null> {
  if (!isSupabaseConfigured) {
    return mockDistricts[0] ? { ...mockDistricts[0], canton: mockCanton } : null
  }

  // Single query: get one district_id that has a verified provider
  const { data: providerRow, error: providerError } = await supabase
    .from('providers')
    .select('district_id')
    .eq('verified', true)
    .limit(1)
    .maybeSingle()

  if (providerError) {
    logger.error('getFirstActiveDistrict.provider', { error: providerError })
    return null
  }
  if (!providerRow) return null

  const { data: district, error: districtError } = await supabase
    .from('districts')
    .select('id, canton_id, name, slug')
    .eq('id', providerRow.district_id!)
    .maybeSingle()

  if (districtError) {
    logger.error('getFirstActiveDistrict.district', { error: districtError })
    return null
  }
  if (!district) return null

  const { data: canton, error: cantonError } = await supabase
    .from('cantons')
    .select('id, province_id, name, slug')
    .eq('id', district.canton_id)
    .maybeSingle()

  if (cantonError) {
    logger.error('getFirstActiveDistrict.canton', { error: cantonError })
    return null
  }
  if (!canton) return null

  return { ...district, canton }
}
