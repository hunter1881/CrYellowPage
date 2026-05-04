export function placeJsonLd(args: { name: string; url: string; parentName?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: args.name,
    url: args.url,
    containedInPlace: args.parentName
      ? {
          '@type': 'Place',
          name: args.parentName,
        }
      : undefined,
  }
}
