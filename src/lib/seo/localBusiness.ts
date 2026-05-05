import { toE164 } from '@lib/phone'

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
    telephone: toE164(args.phone),
    description: args.description,
    ...(args.imageUrl && { image: args.imageUrl }),
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
