import { logger } from '@lib/logger'
import { supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type ReviewRow = Database['public']['Tables']['reviews']['Row']

export type Review = Pick<ReviewRow, 'id' | 'provider_id' | 'rating' | 'comment' | 'created_at'>

export async function getReviewsByProvider(providerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, provider_id, rating, comment, created_at')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('getReviewsByProvider', { providerId, error })
    return []
  }

  return data ?? []
}
