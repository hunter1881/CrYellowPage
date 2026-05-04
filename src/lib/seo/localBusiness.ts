export function localBusinessJsonLd(args: {
  name: string
  phone: string
  description: string
  imageUrl?: string | null
  pageUrl: string
  district: string
  canton: string
  areaServed: string[]
  rating?: { value: number; count: number }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: args.name,
    telephone: args.phone,
    description: args.description,
    image: args.imageUrl ?? undefined,
    url: args.pageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: args.district,
      addressRegion: args.canton,
      addressCountry: 'CR',
    },
    areaServed: args.areaServed.map((name) => ({ '@type': 'Place', name })),
    ...(args.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: args.rating.value,
        reviewCount: args.rating.count,
      },
    }),
  }
}
