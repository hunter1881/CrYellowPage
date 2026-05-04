/**
 * Applies supabase/seed.sql to the remote Supabase project
 * using the Supabase Management API.
 *
 * Usage: node scripts/apply-seed.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { readFile, existsSync } from 'node:fs'
import { promisify } from 'node:util'

const readFileAsync = promisify(readFile)

async function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return
  const contents = fs.readFileSync(filePath, 'utf8')
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const sep = trimmed.indexOf('=')
    if (sep === -1) continue
    const key = trimmed.slice(0, sep).trim()
    const value = trimmed.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && !process.env[key]) process.env[key] = value
  }
}

await loadEnv('.env.local')
await loadEnv('.env')

const projectRef = process.env.SUPABASE_PROJECT_REF
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL

if (!projectRef || !serviceRoleKey || !supabaseUrl) {
  console.error('Missing required env vars: SUPABASE_PROJECT_REF, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_SUPABASE_URL')
  process.exit(1)
}

const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql')
const sql = fs.readFileSync(seedPath, 'utf8')

console.log(`Applying seed.sql (${sql.length} chars) to project ${projectRef}...`)

// Use Supabase's postgres REST endpoint via service role
const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
  },
  body: JSON.stringify({ sql }),
})

if (!response.ok) {
  // Fallback: use Management API
  console.log('REST RPC not available, trying Management API...')

  // Get the access token from supabase CLI
  const { execSync } = await import('node:child_process')
  let accessToken
  try {
    accessToken = execSync('npx supabase --experimental access-token', { encoding: 'utf8' }).trim()
  } catch {
    // Try reading from the config file
    const configPaths = [
      path.join(process.env.HOME || process.env.USERPROFILE || '', '.supabase', 'access-token'),
      path.join(process.env.APPDATA || '', 'supabase', 'access-token'),
    ]
    for (const p of configPaths) {
      if (fs.existsSync(p)) {
        accessToken = fs.readFileSync(p, 'utf8').trim()
        break
      }
    }
  }

  if (!accessToken) {
    console.error('Could not get Supabase access token. Run: npx supabase login')
    process.exit(1)
  }

  const mgmtResponse = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  if (!mgmtResponse.ok) {
    const body = await mgmtResponse.text()
    console.error('Management API failed:', mgmtResponse.status, body)
    process.exit(1)
  }

  const result = await mgmtResponse.json()
  console.log('Seed applied via Management API.')
  console.log(JSON.stringify(result).slice(0, 200))
  process.exit(0)
}

const result = await response.json()
console.log('Seed applied successfully.')
console.log(JSON.stringify(result).slice(0, 200))
