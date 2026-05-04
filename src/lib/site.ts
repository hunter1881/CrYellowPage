export const siteName = 'DirectorioLocal CR'
export const defaultDescription =
  'Encuentre proveedores locales verificados por cantón, distrito y categoría en Costa Rica.'
export const defaultDescriptionEn =
  'Find verified local service providers by canton, district, and category across Costa Rica.'

export function absoluteUrl(path: string, site: URL | undefined): string {
  const base = site?.href ?? import.meta.env.PUBLIC_SITE_URL ?? 'https://directoriolocal.cr'
  return new URL(path, base).href
}
