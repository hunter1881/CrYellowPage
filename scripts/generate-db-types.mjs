import { execFile } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const projectRef = process.env.SUPABASE_PROJECT_REF

if (!projectRef) {
  throw new Error('Missing SUPABASE_PROJECT_REF')
}

const { stdout } = await execFileAsync('supabase', [
  'gen',
  'types',
  'typescript',
  '--project-id',
  projectRef,
])

await writeFile('src/types/database.types.ts', stdout)
