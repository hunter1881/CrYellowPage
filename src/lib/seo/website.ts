export function websiteJsonLd(args: { name: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: args.name,
    url: args.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${args.url}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
