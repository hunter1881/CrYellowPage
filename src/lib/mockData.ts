import type { Category } from '@lib/queries/categories'
import type { Canton, CantonWithDistricts, District } from '@lib/queries/geography'
import type { ProviderListItem, ProviderProfile } from '@lib/queries/providers'
import { providerUrl } from '@lib/slug'

export const mockCanton: Canton = {
  id: '00000000-0000-4000-8000-000000000001',
  province_id: '00000000-0000-4000-8000-000000000000',
  name: 'Aserrí',
  slug: 'aserri',
}

export const mockDistricts: District[] = [
  { id: '00000000-0000-4000-8000-000000000101', canton_id: mockCanton.id, name: 'Aserrí Centro', slug: 'aserri-centro' },
  { id: '00000000-0000-4000-8000-000000000102', canton_id: mockCanton.id, name: 'Tarbaca', slug: 'tarbaca' },
  { id: '00000000-0000-4000-8000-000000000103', canton_id: mockCanton.id, name: 'Vuelta de Jorco', slug: 'vuelta-de-jorco' },
  { id: '00000000-0000-4000-8000-000000000104', canton_id: mockCanton.id, name: 'San Gabriel', slug: 'san-gabriel' },
]

export const mockCategories: Category[] = [
  { id: '00000000-0000-4000-8000-000000000201', name: 'Fontanería', slug: 'fontaneria', icon_emoji: '💧' },
  { id: '00000000-0000-4000-8000-000000000202', name: 'Electricidad', slug: 'electricidad', icon_emoji: '⚡' },
  { id: '00000000-0000-4000-8000-000000000203', name: 'Limpieza', slug: 'limpieza', icon_emoji: '🧽' },
  { id: '00000000-0000-4000-8000-000000000204', name: 'Jardinería', slug: 'jardineria', icon_emoji: '🌿' },
]

export const mockProviders: ProviderListItem[] = [
  {
    id: '00000000-0000-4000-8000-000000000301',
    name: 'Don Rafa Fontanería',
    phone: '8712-4490',
    whatsapp: '50687124490',
    description: 'Fontanero con 18 años atendiendo Aserrí. Reparación de fugas, instalación de tanques y emergencias.',
    photo_url: null,
    created_at: '2026-01-01T00:00:00.000Z',
    accepts_sinpe: true,
    works_weekends: true,
    years_active: 18,
    completed_jobs: 230,
    response_time_minutes: 35,
  },
  {
    id: '00000000-0000-4000-8000-000000000302',
    name: 'Fontanería Emergencia 24',
    phone: '8990-1147',
    whatsapp: '50689901147',
    description: 'Servicio de emergencia 24/7 para fugas y obstrucciones en zona sur de San José.',
    photo_url: null,
    created_at: '2026-01-02T00:00:00.000Z',
    accepts_sinpe: true,
    works_weekends: true,
    years_active: 9,
    completed_jobs: 145,
    response_time_minutes: 20,
  },
  {
    id: '00000000-0000-4000-8000-000000000303',
    name: 'Servicios Jorco',
    phone: '7045-2218',
    whatsapp: '50670452218',
    description: 'Instalaciones, mantenimiento y reparaciones menores para hogares en Vuelta de Jorco.',
    photo_url: null,
    created_at: '2026-01-03T00:00:00.000Z',
    accepts_sinpe: false,
    works_weekends: true,
    years_active: 6,
    completed_jobs: 88,
    response_time_minutes: 45,
  },
]

export const mockCantonsWithDistricts: CantonWithDistricts[] = [
  {
    ...mockCanton,
    province: {
      id: '00000000-0000-4000-8000-000000000000',
      code: '1',
      name: 'San José',
      slug: 'san-jose',
    },
    districts: mockDistricts,
  },
]

export function getMockDistrict(cantonSlug: string, districtSlug: string) {
  if (cantonSlug !== mockCanton.slug) return null
  const district = mockDistricts.find((item) => item.slug === districtSlug)
  return district ? { ...district, canton: mockCanton } : null
}

export function getMockCategory(categorySlug: string) {
  return mockCategories.find((category) => category.slug === categorySlug) ?? null
}

export function getMockProvider(routeSlug: string): ProviderProfile | null {
  const provider = mockProviders.find((item) => routeSlug.startsWith(item.id))
  const district = mockDistricts[2]
  if (!provider) return null

  return {
    ...provider,
    email: null,
    district_id: district.id,
    verified: true,
    district: {
      id: district.id,
      name: district.name,
      slug: district.slug,
      canton: mockCanton,
    },
    categories: [mockCategories[0]],
  }
}

export function getMockListingPaths() {
  return [
    {
      params: {
        canton: mockCanton.slug,
        distrito: 'vuelta-de-jorco',
        categoria: 'fontaneria',
      },
    },
  ]
}

export function getMockProviderPaths() {
  return mockProviders.map((provider) => ({
    params: { id: providerUrl(provider.id, provider.name).replace('/proveedor/', '') },
  }))
}
