#!/usr/bin/env node
// QA test-data cleanup utility.
//
// Deletes specific provider_registrations rows by UUID using the service-role
// key from .env. Used after qa-tester exploratory or form-validation runs to
// remove rows the agent inserted as evidence.
//
// Usage:
//   node scripts/qa-cleanup.mjs <uuid> [<uuid> ...]
//
// Example:
//   node scripts/qa-cleanup.mjs 938c78a8-3c6d-44c0-8f6e-2c187968c8c0 a07616d6-...
//
// Requires .env with PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const ids = process.argv.slice(2).filter((a) => a && !a.startsWith('--'))
if (ids.length === 0) {
  console.error('Usage: node scripts/qa-cleanup.mjs <uuid> [<uuid> ...]')
  process.exit(1)
}

// Validate UUID shape — refuse anything weird so a typo can't accidentally
// match a wider set under some future schema with looser id columns.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const bad = ids.filter((id) => !UUID_RE.test(id))
if (bad.length > 0) {
  console.error('Refusing to run — these args do not look like UUIDs:', bad)
  process.exit(1)
}

// Read both .env and .env.local. .env.local overrides .env per convention,
// BUT only when the override value is non-empty — empty placeholders in
// .env.local should not blank out real values from .env.
function parseEnv(path) {
  if (!existsSync(path)) return {}
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const eq = l.indexOf('=')
        const k = l.slice(0, eq).trim()
        const v = l.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
        return [k, v]
      })
      .filter(([, v]) => v.length > 0),
  )
}
if (!existsSync('.env') && !existsSync('.env.local')) {
  console.error('Missing .env and .env.local')
  process.exit(1)
}
const env = { ...parseEnv('.env'), ...parseEnv('.env.local') }

const url = env.PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Parsed env keys:', Object.keys(env).join(', '))
  console.error('PUBLIC_SUPABASE_URL value:', JSON.stringify(env.PUBLIC_SUPABASE_URL))
  console.error('SUPABASE_SERVICE_ROLE_KEY length:', (env.SUPABASE_SERVICE_ROLE_KEY || '').length)
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

console.log(`Deleting ${ids.length} provider_registrations row(s)...`)
const { data, error } = await supabase
  .from('provider_registrations')
  .delete()
  .in('id', ids)
  .select('id, email, business_name')

if (error) {
  console.error('Delete failed:', error)
  process.exit(1)
}

console.log(`Deleted ${data?.length ?? 0} row(s):`)
for (const row of data ?? []) {
  console.log(`  - ${row.id} · ${row.email} · ${row.business_name}`)
}

const notFound = ids.filter((id) => !(data ?? []).some((r) => r.id === id))
if (notFound.length > 0) {
  console.log(`\nNot found in DB (already deleted or never existed):`)
  for (const id of notFound) console.log(`  - ${id}`)
}

process.exit(0)
