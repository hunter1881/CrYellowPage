export interface ItemListEntry {
  name: string
  url: string
}

export function itemListJsonLd(args: { name: string; items: ItemListEntry[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: args.name,
    itemListElement: args.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  }
}
