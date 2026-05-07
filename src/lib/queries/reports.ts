import { supabase } from '@lib/supabase'
import { logger } from '@lib/logger'

export type ReportReason = 'fraud' | 'fake_info' | 'no_show' | 'bad_quality' | 'spam' | 'other'

export interface InsertReportInput {
  providerId: string
  reason: ReportReason
  details?: string | null
  reporterId?: string | null
}

export async function insertProviderReport(input: InsertReportInput): Promise<{ ok: boolean }> {
  const { error } = await supabase.from('provider_reports').insert({
    provider_id: input.providerId,
    reason: input.reason,
    details: input.details ?? null,
    reporter_id: input.reporterId ?? null,
  })

  if (error) {
    logger.error('insertProviderReport', { providerId: input.providerId, error })
    return { ok: false }
  }

  return { ok: true }
}
