export const siteName = 'DirectorioLocal CR'
export const defaultDescription =
  'Encuentre proveedores locales verificados por cantón, distrito y categoría en Costa Rica.'
export const defaultDescriptionEn =
  'Find verified local service providers by canton, district, and category across Costa Rica.'

/**
 * Build an absolute URL for a given path.
 *
 * Priority:
 * 1. `site` — Astro.site (set from PUBLIC_SITE_URL or astro.config.mjs `site`)
 * 2. `PUBLIC_SITE_URL` env var
 * 3. Hard-coded production fallback
 *
 * NOTE: For <a href> in components, prefer relative paths instead of calling
 * this function — breadcrumbs use toPath() to strip the origin at render time.
 * This function should only be used for canonical URLs and JSON-LD.
 */
export function absoluteUrl(path: string, site: URL | undefined): string {
  const base = site?.href ?? import.meta.env.PUBLIC_SITE_URL ?? 'https://directoriolocal.cr'
  return new URL(path, base).href
}
