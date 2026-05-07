---
name: supabase-patterns
description: Patterns and code examples for working with Supabase in this project. Use me when you need queries, auth, storage, or migrations.
---

# Supabase patterns for El Contactico

## Current schema shape

Geography:

```text
countries -> provinces -> cantons -> districts
```

Directory:

```text
categories
providers
provider_categories
reviews
```

Provider rows include the template UI fields `accepts_sinpe`, `works_weekends`, `years_active`, `completed_jobs`, and `response_time_minutes`.

Generate Costa Rica geography seed data from the official INEC DBF source:

```bash
npm run db:seed:generate
```

## Singleton typed client (src/lib/supabase.ts)
```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@types/database.types'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
```

## Query: providers by district and category
```ts
import { supabase } from '@lib/supabase'
import { logger } from '@lib/logger'

export async function getProviders(cantonSlug, districtSlug, categorySlug) {
  const { data: district, error: districtError } = await supabase
    .from('districts')
    .select('id, slug, canton:cantons!inner(slug)')
    .eq('slug', districtSlug)
    .eq('canton.slug', cantonSlug)
    .maybeSingle()

  if (districtError) {
    logger.error('getProviders.district', { districtSlug, error: districtError })
    return []
  }
  if (!district) return []

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (categoryError) {
    logger.error('getProviders.category', { categorySlug, error: categoryError })
    return []
  }
  if (!category) return []

  const { data, error } = await supabase
    .from('providers')
    .select(`
      id, name, phone, whatsapp, description, photo_url, created_at,
      accepts_sinpe, works_weekends, years_active, completed_jobs, response_time_minutes,
      provider_categories!inner(category_id)
    `)
    .eq('district_id', district.id)
    .eq('provider_categories.category_id', category.id)
    .eq('verified', true)

  if (error) {
    logger.error('getProviders.list', { cantonSlug, districtSlug, categorySlug, error })
    return []
  }
  return data ?? []
}
```

## Generic getStaticPaths() for dynamic routes
```ts
export async function getStaticPaths() {
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
    for (const providerCategory of row.provider_categories) {
      const key = `${row.district.canton.slug}/${row.district.slug}/${providerCategory.category.slug}`
      if (seen.has(key)) continue
      seen.add(key)
      paths.push({
        params: {
          canton: row.district.canton.slug,
          distrito: row.district.slug,
          categoria: providerCategory.category.slug
        }
      })
    }
  }
  return paths
}
```

## Provider photo upload
```ts
export async function uploadProviderPhoto(providerId, file) {
  const ext = file.name.split('.').pop()
  const path = `${providerId}/photo.${ext}`

  const { error } = await supabase.storage
    .from('provider-photos')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage
    .from('provider-photos')
    .getPublicUrl(path)

  return data.publicUrl
}
```
