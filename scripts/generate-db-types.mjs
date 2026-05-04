import { exec, execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const execAsync = promisify(exec)

async function loadEnvFile(path) {
  if (!existsSync(path)) return
  const contents = await readFile(path, 'utf8')
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue
    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && !process.env[key]) process.env[key] = value
  }
}

await loadEnvFile('.env.local')
await loadEnvFile('.env')

const projectRef = process.env.SUPABASE_PROJECT_REF

if (!projectRef) {
  throw new Error('Missing SUPABASE_PROJECT_REF')
}

async function generateTypes() {
  try {
    return await execFileAsync('supabase', ['gen', 'types', 'typescript', '--project-id', projectRef])
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    return execAsync(`${npxCommand} supabase gen types typescript --project-id ${projectRef}`)
  }
}

const { stdout } = await generateTypes()

await writeFile('src/types/database.types.ts', stdout)
