import { logger } from '@lib/logger'
import { isSupabaseConfigured, supabase } from '@lib/supabase'
import type { Database } from '@generated/database.types'

type PaymentMethodRow = Database['public']['Tables']['payment_methods']['Row']
export type PaymentMethod = Pick<PaymentMethodRow, 'id' | 'name' | 'slug' | 'category' | 'sort_order'>

/** Fallback list used when Supabase is not configured (local dev without credentials). */
const fallbackPaymentMethods: PaymentMethod[] = [
  { id: 'pm-sinpe-movil',     name: 'SINPE Móvil',          slug: 'sinpe-movil',      category: 'digital', sort_order: 10 },
  { id: 'pm-sinpe-transfer',  name: 'SINPE Transferencia',  slug: 'sinpe-transfer',   category: 'digital', sort_order: 20 },
  { id: 'pm-payphone',        name: 'Payphone',             slug: 'payphone',         category: 'digital', sort_order: 30 },
  { id: 'pm-pagos-bac',       name: 'Pagos BAC',            slug: 'pagos-bac',        category: 'digital', sort_order: 40 },
  { id: 'pm-paypal',          name: 'PayPal',               slug: 'paypal',           category: 'digital', sort_order: 50 },
  { id: 'pm-tarjeta-credito', name: 'Tarjeta de crédito',   slug: 'tarjeta-credito',  category: 'card',    sort_order: 60 },
  { id: 'pm-tarjeta-debito',  name: 'Tarjeta de débito',    slug: 'tarjeta-debito',   category: 'card',    sort_order: 70 },
  { id: 'pm-efectivo-col',    name: 'Efectivo (colones)',   slug: 'efectivo-colones', category: 'cash',    sort_order: 80 },
  { id: 'pm-efectivo-usd',    name: 'Efectivo (dólares)',   slug: 'efectivo-dolares', category: 'cash',    sort_order: 90 },
  { id: 'pm-deposito',        name: 'Depósito bancario',    slug: 'deposito-bancario',category: 'bank',    sort_order: 100 },
  { id: 'pm-cheque',          name: 'Cheque',               slug: 'cheque',           category: 'bank',    sort_order: 110 },
]

const CATEGORY_LABELS: Record<string, string> = {
  digital: 'Pago digital',
  card:    'Tarjeta',
  cash:    'Efectivo',
  bank:    'Transferencia bancaria',
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (!isSupabaseConfigured) return fallbackPaymentMethods

  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, name, slug, category, sort_order')
    .eq('active', true)
    .order('sort_order')

  if (error) {
    logger.error('getPaymentMethods', { error })
    return fallbackPaymentMethods
  }

  return data ?? fallbackPaymentMethods
}

/** Returns the payment methods grouped by category for easier rendering. */
export function groupPaymentMethods(methods: PaymentMethod[]): { label: string; items: PaymentMethod[] }[] {
  const order = ['digital', 'card', 'cash', 'bank']
  const map = new Map<string, PaymentMethod[]>()
  for (const m of methods) {
    if (!map.has(m.category)) map.set(m.category, [])
    map.get(m.category)!.push(m)
  }
  return order
    .filter((cat) => map.has(cat))
    .map((cat) => ({ label: CATEGORY_LABELS[cat] ?? cat, items: map.get(cat)! }))
}

/** True if the selected slugs include any SINPE variant. */
export function selectedIncludesSinpe(slugs: string[]): boolean {
  return slugs.some((s) => s === 'sinpe-movil' || s === 'sinpe-transfer')
}
