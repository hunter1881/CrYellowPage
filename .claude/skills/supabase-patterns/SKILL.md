---
name: supabase-patterns
description: Patterns and code examples for working with Supabase in this project. Use me when you need queries, auth, storage, or migrations.
---

# Supabase patterns for DirectorioLocal CR

## Singleton client (src/lib/supabase.js)
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## Query: providers by district and category
```js
export async function getProviders(districtSlug, categorySlug) {
  const { data: district, error: districtError } = await supabase
    .from('districts')
    .select('id')
    .eq('slug', districtSlug)
    .single()
  if (districtError || !district) return []

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()
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
    console.error('getProviders error:', error)
    return []
  }
  return data
}
```

## Generic getStaticPaths() for dynamic routes
```js
export async function getStaticPaths() {
  const { data: districts } = await supabase
    .from('districts')
    .select('slug, cantons(slug)')

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const paths = []
  for (const district of districts) {
    for (const category of categories) {
      paths.push({
        params: {
          canton: district.cantons.slug,
          distrito: district.slug,
          categoria: category.slug
        }
      })
    }
  }
  return paths
}
```

## Provider photo upload
```js
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
