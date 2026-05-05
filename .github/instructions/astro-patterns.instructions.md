---
applyTo: "src/**/*.astro,src/lib/**,src/actions/**"
---

# Astro patterns for DirectorioLocal CR

Use these copyable patterns when implementing Astro 6 + Supabase features.

## Singleton typed Supabase client

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@types/database.types'

const url = import.meta.env.PUBLIC_SUPABASE_URL
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(url, anonKey)
```

## Typed env vars

```ts
// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string
  readonly PUBLIC_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Logger (no-op in prod)

```ts
// src/lib/logger.ts
const isDev = import.meta.env.DEV

export const logger = {
  info: (...args: unknown[]) => { if (isDev) console.info(...args) },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args) },
  error: (label: string, ctx?: Record<string, unknown>) => {
    console.error(`[${label}]`, ctx ?? '')
  },
}
```

## Slug helpers

```ts
// src/lib/slug.ts
export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[ñÑ]/g, 'n')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function providerUrl(id: string, name: string): string {
  return `/proveedor/${id}-${toSlug(name)}`
}
```

## Query function pattern

Every query function lives in `src/lib/queries/<domain>.ts`, returns typed data, handles errors loudly.

```ts
// src/lib/queries/providers.ts
import { supabase } from '@lib/supabase'
import { logger } from '@lib/logger'
import type { Database } from '@types/database.types'

type ProviderRow = Database['public']['Tables']['providers']['Row']
export type ProviderListItem = Pick<
  ProviderRow,
  'id' | 'name' | 'phone' | 'whatsapp' | 'description' | 'photo_url'
>

export async function getProvidersByDistrictAndCategory(
  districtSlug: string,
  categorySlug: string,
): Promise<ProviderListItem[]> {
  const { data: district, error: dErr } = await supabase
    .from('districts').select('id').eq('slug', districtSlug).maybeSingle()
  if (dErr) { logger.error('getProviders.district', { districtSlug, error: dErr }); return [] }
  if (!district) return []

  const { data: category, error: cErr } = await supabase
    .from('categories').select('id').eq('slug', categorySlug).maybeSingle()
  if (cErr) { logger.error('getProviders.category', { categorySlug, error: cErr }); return [] }
  if (!category) return []

  const { data, error } = await supabase
    .from('providers')
    .select('id, name, phone, whatsapp, description, photo_url, provider_categories!inner(category_id)')
    .eq('district_id', district.id)
    .eq('provider_categories.category_id', category.id)
    .eq('verified', true)
    .order('created_at', { ascending: false })

  if (error) { logger.error('getProviders.list', { error }); return [] }
  return data ?? []
}
```

## Generic getStaticPaths skipping empty combinations

```astro
---
// src/pages/[canton]/[distrito]/[categoria].astro
import { supabase } from '@lib/supabase'
import { getProvidersByDistrictAndCategory } from '@lib/queries/providers'

export async function getStaticPaths() {
  // Only generate pages for combinations that have at least one verified provider.
  const { data, error } = await supabase
    .from('providers')
    .select(`
      district:districts!inner(slug, canton:cantons!inner(slug)),
      provider_categories!inner(category:categories!inner(slug))
    `)
    .eq('verified', true)

  if (error || !data) return []

  const seen = new Set<string>()
  const paths = []
  for (const row of data) {
    for (const pc of row.provider_categories) {
      const key = `${row.district.canton.slug}/${row.district.slug}/${pc.category.slug}`
      if (seen.has(key)) continue
      seen.add(key)
      paths.push({
        params: {
          canton: row.district.canton.slug,
          distrito: row.district.slug,
          categoria: pc.category.slug,
        },
      })
    }
  }
  return paths
}

const { canton, distrito, categoria } = Astro.params
const providers = await getProvidersByDistrictAndCategory(distrito!, categoria!)
---
```

## Astro Action — provider registration

```ts
// src/actions/index.ts
import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'
import { supabase } from '@lib/supabase'

export const server = {
  registerProvider: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(3).max(120),
      phone: z.string().regex(/^\d{4}-\d{4}$/, 'Formato esperado 8888-8888'),
      whatsapp: z.string().regex(/^\+506\d{8}$/, 'Formato esperado +50688888888'),
      email: z.string().email().optional().or(z.literal('')),
      description: z.string().max(200),
      districtSlug: z.string(),
      categorySlugs: z.array(z.string()).min(1),
    }),
    handler: async (input, ctx) => {
      const userId = ctx.locals.user?.id
      if (!userId) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'Login required' })
      }

      const { data: district } = await supabase
        .from('districts').select('id').eq('slug', input.districtSlug).single()
      if (!district) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'District not found' })
      }

      const { data: provider, error } = await supabase
        .from('providers')
        .insert({
          name: input.name,
          phone: input.phone,
          whatsapp: input.whatsapp,
          email: input.email || null,
          description: input.description,
          district_id: district.id,
          owner_id: userId,
          verified: false,
        })
        .select('id')
        .single()

      if (error) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { providerId: provider.id }
    },
  }),
}
```
