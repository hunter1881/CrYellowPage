#!/usr/bin/env node
// PostToolUse hook for Write|Edit. Scans the modified file for the most common
// antipatterns from .claude/rules/antipatterns.md and prints warnings to stderr.
// Non-blocking by design (exit 0 even when issues found) — surfaces to Claude as a hint.
//
// Receives JSON on stdin with shape: { tool_input: { file_path: string }, ... }

import { readFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'

let input = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (input += c))
process.stdin.on('end', () => {
  try {
    const { tool_input } = JSON.parse(input || '{}')
    const filePath = tool_input?.file_path
    if (!filePath) return

    const rel = relative(process.cwd(), resolve(filePath)).replaceAll('\\', '/')
    if (!rel.startsWith('src/') && !rel.startsWith('astro.config')) return
    if (!/\.(astro|ts|tsx|mjs|js)$/.test(rel)) return
    if (rel.startsWith('src/types/database.types.ts')) return

    const code = readFileSync(filePath, 'utf8')
    const findings = []

    const checks = [
      { re: /<script[^>]*\bis:inline\b(?![^>]*type=["']application\/(ld\+)?json["'])(?![^>]*data-astro-rerun)[\s\S]{0,80}?(addEventListener|querySelector\b)/, msg: '§1 <script is:inline> with DOM logic — use a bundled <script> + custom element' },
      { re: /\.select\(['"`]\*['"`]\)/, msg: "§2 select('*') — list explicit columns" },
      { re: /^---[\s\S]*?\bsupabase\.from\(/m, msg: '§3 inline Supabase query in .astro frontmatter — push to src/lib/queries/' },
      { re: /\bconsole\.(log|error|warn|info|debug)\(/, msg: '§5 console.* — use logger from @lib/logger' },
      { re: /fetch\(\s*[`'"][^`'"]*\.supabase\.co/, msg: '§6 direct fetch to Supabase URL — use the typed client' },
      { re: /from ['"]\.\.\/\.\.\/\.\./, msg: '§7 ../../../ import chain — use path aliases' },
      { re: /<img\s/, msg: '§8 bare <img> — use <Image> from astro:assets' },
      { re: /\binnerHTML\s*=/, msg: '§9 innerHTML assignment — use textContent + createElement' },
      { re: /import\s*\{\s*ViewTransitions\s*\}/, msg: '§15 ViewTransitions is the Astro 5 name — use ClientRouter' },
      { re: /PUBLIC_SUPABASE_SERVICE_ROLE_KEY|PUBLIC_.*SERVICE_ROLE/i, msg: 'CRITICAL: service role in PUBLIC_* — server-only var, never PUBLIC_*' },
    ]

    for (const { re, msg } of checks) {
      if (re.test(code)) findings.push(msg)
    }

    if (findings.length > 0) {
      process.stderr.write(`\n[antipattern check] ${rel}\n`)
      for (const f of findings) process.stderr.write(`  - ${f}\n`)
      process.stderr.write(`See .claude/rules/antipatterns.md for full reference.\n\n`)
    }
  } catch {
    // Hook failures must never block — silent on parse error.
  }
})
