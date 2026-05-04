---
applyTo: "src/**/*.astro,src/lib/seo/**"
---

# SEO templates for DirectorioLocal CR

Use these patterns when creating or editing pages that need meta tags, JSON-LD, or structured data.

## Base layout with SEO (src/layouts/BaseLayout.astro)
```astro
---
const { title, description, image, canonical } = Astro.props
const siteUrl = 'https://directorio.local' // replace with real domain
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
  },
  "areaServed": [district.name],
  "image": provider.photo_url,
  "url": `https://directorio.local/proveedor/${provider.id}-${toSlug(provider.name)}`,
  "description": provider.description
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
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

## JSON-LD for home page (WebSite + SearchAction)
```astro
---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DirectorioLocal CR",
  "url": "https://directorio.local",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://directorio.local/?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
---
```

## Provider photo with <Image> from Supabase Storage

Remote `src` URLs require explicit `width` and `height`:

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

Also allowlist the Supabase Storage host in `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'

export default defineConfig({
  image: {
    domains: ['xyzcompany.supabase.co'], // your Supabase project host
  },
})
```

## Required meta tags on every page
```html
<title>{name} en {district}, {canton} - DirectorioLocal CR</title>
<meta name="description" content="Encuentra {category} en {district}. Contacto directo, sin intermediarios.">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<link rel="canonical" href="https://directorio.local/{canton}/{district}/{category}">
```

## Per-page SEO checklist
- [ ] Unique, descriptive title (50-60 chars) with location keyword
- [ ] Meta description with local keyword (150-160 chars)
- [ ] Appropriate JSON-LD
- [ ] Canonical URL
- [ ] Unique H1 heading with primary keyword
- [ ] URLs in kebab-case, unaccented
