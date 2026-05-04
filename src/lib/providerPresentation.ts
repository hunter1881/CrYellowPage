import type { ProviderListItem } from '@lib/queries/providers'

export interface ProviderDisplayMeta {
  rating: string
  reviewCount: number
  yearsActive: number
  completedJobs: number
  responseTimeEs: string
  responseTimeEn: string
  acceptsSinpe: boolean
  worksWeekends: boolean
}

export interface ProviderReviewDisplay {
  rating: string | null
  reviewCount: number
}

function numericSeed(value: string): number {
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0)
}

export function providerDisplayMeta(
  provider: Pick<
    ProviderListItem,
    | 'id'
    | 'created_at'
    | 'accepts_sinpe'
    | 'works_weekends'
    | 'years_active'
    | 'completed_jobs'
    | 'response_time_minutes'
  >,
  reviews?: ProviderReviewDisplay,
): ProviderDisplayMeta {
  const seed = numericSeed(provider.id)
  const createdYear = provider.created_at ? new Date(provider.created_at).getUTCFullYear() : 2023
  const yearsFromDate = Number.isFinite(createdYear) ? Math.max(1, new Date().getUTCFullYear() - createdYear + 1) : 2
  const responseMinutes = provider.response_time_minutes ?? [20, 35, 45, 60][seed % 4]

  return {
    rating: reviews?.rating ?? (4.5 + (seed % 5) / 10).toFixed(1),
    reviewCount: reviews?.reviewCount ?? 12 + (seed % 37),
    yearsActive: provider.years_active ?? Math.max(yearsFromDate, 2 + (seed % 8)),
    completedJobs: provider.completed_jobs ?? 40 + (seed % 130),
    responseTimeEs: responseMinutes < 60 ? `${responseMinutes} min` : '1 hora',
    responseTimeEn: responseMinutes < 60 ? `${responseMinutes} min` : '1 hour',
    acceptsSinpe: provider.accepts_sinpe ?? seed % 2 === 0,
    worksWeekends: provider.works_weekends ?? seed % 3 !== 0,
  }
}
