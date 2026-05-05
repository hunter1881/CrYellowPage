/**
 * Applies a specific migration SQL file to the remote Supabase project.
 * Uses the Supabase Management API (same pattern as apply-seed.mjs).
 *
 * Usage: node scripts/apply-migration.mjs <migration-file>
 * Example: node scripts/apply-migration.mjs supabase/migrations/20260505200000_reviews_work_confirmed.sql
 */
import fs from 'node:fs'
import path from 'node:path'

async function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const env = {}
  const contents = fs.readFileSync(filePath, 'utf8')
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const sep = trimmed.indexOf('=')
    if (sep === -1) continue
    const key = trimmed.slice(0, sep).trim()
    const value = trimmed.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key) env[key] = value
  }
  return env
}

const envLocal = await loadEnv('.env.local')
const envMain = await loadEnv('.env')
const env = { ...envMain, ...envLocal }

const projectRef = env.SUPABASE_PROJECT_REF
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = env.PUBLIC_SUPABASE_URL

if (!projectRef || !serviceRoleKey || !supabaseUrl) {
  console.error('❌ Missing required env vars: SUPABASE_PROJECT_REF, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_SUPABASE_URL')
  process.exit(1)
}

const migrationArg = process.argv[2]
if (!migrationArg) {
  // Default: apply all pending migrations in order
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  console.log(`No file specified. Available migrations:\n${files.map((f) => `  ${f}`).join('\n')}`)
  console.log('\nUsage: node scripts/apply-migration.mjs supabase/migrations/<file>.sql')
  process.exit(0)
}

const migrationPath = path.isAbsolute(migrationArg)
  ? migrationArg
  : path.join(process.cwd(), migrationArg)

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ File not found: ${migrationPath}`)
  process.exit(1)
}

const sql = fs.readFileSync(migrationPath, 'utf8')
console.log(`\n📦 Applying migration: ${path.basename(migrationPath)}`)
console.log(`   Project: ${projectRef}`)
console.log(`   SQL size: ${sql.length} chars\n`)

// Try Management API directly (most reliable for schema changes)
const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql }),
  }
)

if (!response.ok) {
  const body = await response.text()
  console.error(`❌ Management API error ${response.status}:`, body)

  // Fallback: try via REST RPC
  console.log('\n⚠️  Trying fallback via REST RPC...')
  const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ sql }),
  })

  if (!rpcResponse.ok) {
    const rpcBody = await rpcResponse.text()
    console.error(`❌ REST RPC also failed ${rpcResponse.status}:`, rpcBody)
    process.exit(1)
  }
  console.log('✅ Migration applied via REST RPC.')
  process.exit(0)
}

const result = await response.json()
console.log('✅ Migration applied successfully via Management API.')
if (result && typeof result === 'object') {
  console.log('   Result:', JSON.stringify(result).slice(0, 200))
}
