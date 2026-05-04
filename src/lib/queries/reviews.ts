import { logger } from '@lib/logger'
import { isSupabaseConfigured, supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type ReviewRow = Database['public']['Tables']['reviews']['Row']

export type Review = Pick<
  ReviewRow,
  'id' | 'provider_id' | 'author_name' | 'rating' | 'comment' | 'created_at'
>

export interface ReviewSummary {
  rating: string | null
  reviewCount: number
}

export const emptyReviewSummary: ReviewSummary = {
  rating: null,
  reviewCount: 0,
}

export async function getReviewsByProvider(providerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, provider_id, author_name, rating, comment, created_at')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('getReviewsByProvider', { providerId, error })
    return []
  }

  return data ?? []
}

export async function getReviewSummaryByProvider(providerId: string): Promise<ReviewSummary> {
  const summaries = await getReviewSummariesByProviderIds([providerId])
  return summaries.get(providerId) ?? emptyReviewSummary
}

export async function getReviewSummariesByProviderIds(providerIds: string[]): Promise<Map<string, ReviewSummary>> {
  const uniqueProviderIds = [...new Set(providerIds)]
  const summaries = new Map<string, ReviewSummary>()

  if (uniqueProviderIds.length === 0) return summaries

  if (!isSupabaseConfigured) {
    for (const providerId of uniqueProviderIds) {
      summaries.set(providerId, {
        rating: '4.8',
        reviewCount: 12,
      })
    }
    return summaries
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('provider_id, rating')
    .in('provider_id', uniqueProviderIds)

  if (error) {
    logger.error('getReviewSummariesByProviderIds', { providerIds: uniqueProviderIds, error })
    return summaries
  }

  const ratingsByProviderId = new Map<string, number[]>()
  for (const review of data ?? []) {
    const ratings = ratingsByProviderId.get(review.provider_id) ?? []
    ratings.push(review.rating)
    ratingsByProviderId.set(review.provider_id, ratings)
  }

  for (const [providerId, ratings] of ratingsByProviderId.entries()) {
    const average = ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    summaries.set(providerId, {
      rating: average.toFixed(1),
      reviewCount: ratings.length,
    })
  }

  return summaries
}
