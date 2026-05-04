import type { ProviderListItem } from '@lib/queries/providers'

export interface ProviderDisplayMeta {
  rating: string | null
  reviewCount: number | null
  yearsActive: number | null
  completedJobs: number | null
  responseTimeEs: string | null
  responseTimeEn: string | null
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
  const createdYear = provider.created_at ? new Date(provider.created_at).getUTCFullYear() : null
  const yearsFromDate = createdYear !== null && Number.isFinite(createdYear)
    ? Math.max(1, new Date().getUTCFullYear() - createdYear + 1)
    : null
  const responseMinutes = provider.response_time_minutes ?? null

  return {
    rating: reviews?.rating ?? null,
    reviewCount: reviews?.reviewCount ?? null,
    yearsActive: provider.years_active ?? yearsFromDate,
    completedJobs: provider.completed_jobs ?? null,
    responseTimeEs: responseMinutes !== null ? (responseMinutes < 60 ? `${responseMinutes} min` : '1 hora') : null,
    responseTimeEn: responseMinutes !== null ? (responseMinutes < 60 ? `${responseMinutes} min` : '1 hour') : null,
    acceptsSinpe: provider.accepts_sinpe ?? seed % 2 === 0,
    worksWeekends: provider.works_weekends ?? seed % 3 !== 0,
  }
}
