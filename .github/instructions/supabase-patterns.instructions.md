---
applyTo: "src/lib/**,src/actions/**"
---

# Supabase patterns for DirectorioLocal CR

Use these copyable patterns for queries, auth, storage, and migrations.

## Singleton client (src/lib/supabase.ts)
```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@types/database.types'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
```

## Query: providers by district and category
```ts
export async function getProviders(districtSlug: string, categorySlug: string) {
  const { data: district, error: districtError } = await supabase
    .from('districts')
    .select('id')
    .eq('slug', districtSlug)
    .maybeSingle()
  if (districtError || !district) return []

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()
  if (categoryError || !category) return []

  const { data, error } = await supabase
    .from('providers')
    .select(`
      id, name, phone, whatsapp, description, photo_url,
      provider_categories!inner(category_id)
    `)
    .eq('district_id', district.id)
    .eq('provider_categories.category_id', category.id)
    .eq('verified', true)

  if (error) {
    logger.error('getProviders', { error })
    return []
  }
  return data ?? []
}
```

## Generic getStaticPaths() for dynamic routes
```ts
export async function getStaticPaths() {
  const { data: districts } = await supabase
    .from('districts')
    .select('slug, cantons(slug)')

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const paths = []
  for (const district of districts ?? []) {
    for (const category of categories ?? []) {
      paths.push({
        params: {
          canton: (district.cantons as any).slug,
          distrito: district.slug,
          categoria: category.slug
        }
      })
    }
  }
  return paths
}
```

## Provider photo upload (from Astro Action)
```ts
export async function uploadProviderPhoto(providerId: string, file: File) {
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

## Auth — check current user in Astro Action
```ts
import { ActionError } from 'astro:actions'

// In an Astro Action handler:
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) {
  throw new ActionError({ code: 'UNAUTHORIZED', message: 'Login required' })
}
```

## RLS-safe insert (providers)
```ts
const { data, error } = await supabase
  .from('providers')
  .insert({
    name: input.name,
    district_id: district.id,
    owner_id: user.id,   // required for RLS INSERT policy
    verified: false,
  })
  .select('id')
  .single()
```
