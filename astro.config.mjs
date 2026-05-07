import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

// In dev, don't set `site` so Astro.site resolves to localhost automatically.
// In production, PUBLIC_SITE_URL must be set in the deployment environment.
const site = process.env.PUBLIC_SITE_URL ?? (process.env.NODE_ENV === 'production' ? 'https://elcontactico.cr' : undefined)
const supabaseHost = process.env.PUBLIC_SUPABASE_URL
  ? new URL(process.env.PUBLIC_SUPABASE_URL).hostname
  : 'example.supabase.co'

export default defineConfig({
  site,
  output: 'server',
  adapter: vercel(),
  integrations: [
    sitemap({
      entryLimit: 10000,
      serialize(item) {
        if (/\/proveedor\//.test(item.url)) {
          item.priority = 0.7
          item.changefreq = 'weekly'
        } else if (/^https?:\/\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/?$/.test(item.url)) {
          item.priority = 0.9
          item.changefreq = 'daily'
        } else if (item.url === `${site}/` || item.url === site) {
          item.priority = 1.0
          item.changefreq = 'daily'
        }
        return item
      },
    }),
  ],
  image: {
    domains: [supabaseHost],
  },
})
