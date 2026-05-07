---
name: astro-seo
description: SEO templates and patterns for Astro pages in this directory. Use me when creating or editing pages that need meta tags, JSON-LD, or structured data.
---

# SEO templates for El Contactico

## Base layout with SEO (src/layouts/BaseLayout.astro)
```astro
---
const { title, description, image, canonical } = Astro.props
const siteUrl = 'https://directorio.local' // change to the real domain
---
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content={description}>
  <link rel="canonical" href={canonical || Astro.url.href}>
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  <meta property="og:image" content={image || `${siteUrl}/og-default.jpg`}>
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <slot />
</body>
</html>
```

## JSON-LD for provider page (LocalBusiness)
```astro
---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": provider.name,
  "telephone": provider.phone,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": district.name,
    "addressRegion": canton.name,
    "addressCountry": "CR"
  }
}
---
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

## JSON-LD for listing page (ItemList)
```astro
---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `${category.name} in ${district.name}`,
  "itemListElement": providers.map((p, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": p.name,
    "url": `https://directorio.local/proveedor/${p.id}`
  }))
}
---
```

## Provider photo with <Image> from Supabase Storage

Per the Astro docs, remote `src` URLs require explicit `width` and `height` (or `inferSize`) — otherwise the build errors. Provider photos served from `provider-photos` are remote, so always pass dimensions:

```astro
---
import { Image } from 'astro:assets'
---
<Image
  src={provider.photo_url}
  alt={`Photo of ${provider.name}`}
  width={400}
  height={400}
  loading="lazy"
/>
```

You also need to allowlist the Supabase Storage host in `astro.config.mjs` for remote optimization:

```js
import { defineConfig } from 'astro/config'

export default defineConfig({
  image: {
    domains: ['xyzcompany.supabase.co'], // your Supabase project host
  },
})
```
