export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[ñÑ]/g, 'n')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function providerUrl(id: string, name: string): string {
  return `/proveedor/${id}-${toSlug(name)}`
}

export function providerIdFromSlug(slug: string): string {
  const match = slug.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
  )
  return match?.[0] ?? slug
}
