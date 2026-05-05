import type { ProviderListItem } from '@lib/queries/providers'

export interface ProviderDisplayMeta {
  rating: string | null
  reviewCount: number | null
  yearsActive: number | null
  completedJobs: number | null
  acceptsSinpe: boolean | null
  worksWeekends: boolean | null
}

export interface ProviderReviewDisplay {
  rating: string | null
  reviewCount: number
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
  >,
  reviews?: ProviderReviewDisplay,
): ProviderDisplayMeta {
  const createdYear = provider.created_at ? new Date(provider.created_at).getUTCFullYear() : null
  const yearsFromDate = createdYear !== null && Number.isFinite(createdYear)
    ? Math.max(1, new Date().getUTCFullYear() - createdYear + 1)
    : null
  return {
    rating: reviews?.rating ?? null,
    reviewCount: reviews?.reviewCount ?? null,
    yearsActive: provider.years_active ?? yearsFromDate,
    completedJobs: provider.completed_jobs != null && provider.completed_jobs > 0 ? provider.completed_jobs : null,
    acceptsSinpe: provider.accepts_sinpe ?? null,
    worksWeekends: provider.works_weekends ?? null,
  }
}
