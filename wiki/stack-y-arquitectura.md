# Stack y Arquitectura

## Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Astro | 6.2.2 |
| Interactividad | Alpine.js | 3.x |
| Estilos | Tailwind CSS | 4.x |
| Lenguaje | TypeScript strict | — |
| Base de datos | Supabase PostgreSQL | — |
| Auth / Storage | Supabase Auth + Storage | — |
| Hosting | Vercel | — |
| Rendering | SSG + server functions | `output: 'server'` |

**No se usa React/Vue/Svelte en producción.** Los archivos en `Template/` son solo referencia visual.

---

## Modelo de rendering

- `output: 'server'` con `@astrojs/vercel` como adapter
- Páginas de directorio: `export const prerender = true` → generadas en build
- Páginas de cuenta/acciones: server-rendered por defecto
- **Fase 3 (build > 5 min)**: activar ISR con `vercel({ isr: true })`

---

## Estructura de carpetas

```
src/
├── pages/
│   ├── index.astro                    # Home con búsqueda
│   ├── cantones.astro                 # Lista todos los cantones
│   ├── categorias.astro               # Lista todas las categorías
│   ├── search.astro                   # Búsqueda full-text
│   ├── register-provider.astro        # Registro de proveedor
│   ├── robots.txt.ts                  # Sitemap dinámico
│   ├── [canton]/
│   │   ├── index.astro                # Página de cantón
│   │   └── [distrito]/
│   │       ├── index.astro            # Página de distrito
│   │       └── [categoria].astro     # Listado de proveedores
│   ├── proveedor/[id].astro           # Perfil de proveedor
│   ├── account/index.astro            # Dashboard del proveedor
│   ├── api/whatsapp-webhook.ts        # Webhook de WhatsApp
│   └── legal/                         # Páginas legales
├── components/
│   ├── ui/                            # Button, Card, Badge, Input, Alert...
│   ├── directory/                     # ProviderCard, CategoryGrid, SearchBar...
│   ├── seo/                           # JsonLd, OpenGraph, Breadcrumbs
│   ├── layout/                        # Header, Footer, MobileDrawer
│   └── i18n/                          # Componentes de traducción
├── layouts/
│   ├── BaseLayout.astro               # Layout base con SEO
│   └── DirectoryLayout.astro          # Layout para páginas de directorio
├── lib/
│   ├── supabase.ts                    # Cliente Supabase (anon key)
│   ├── supabaseServer.ts              # Cliente Supabase (service role)
│   ├── logger.ts                      # Logger (silencioso en prod)
│   ├── slug.ts                        # toSlug / fromSlug
│   ├── site.ts                        # Config global del sitio
│   ├── i18n.ts                        # Traducciones
│   ├── phone.ts                       # Normalización de teléfonos CR
│   ├── whatsapp.ts                    # WhatsApp Cloud API
│   ├── providerPresentation.ts        # Lógica de presentación de proveedores
│   └── queries/
│       ├── providers.ts               # Queries de proveedores
│       ├── geography.ts               # Queries de cantones/distritos
│       ├── categories.ts              # Queries de categorías
│       ├── reviews.ts                 # Queries de reseñas
│       ├── paymentMethods.ts          # Queries de métodos de pago
│       ├── providerRegistrations.ts   # Queries de registro
│       ├── verification.ts            # OTP de verificación (service role)
│       └── reports.ts                 # Reportes comunitarios
├── actions/
│   └── index.ts                       # Astro Actions (mutaciones Zod-validadas)
├── types/
│   └── database.types.ts              # Generado por Supabase CLI — nunca editar a mano
└── env.d.ts                           # Tipos de variables de entorno
```

---

## Path aliases (tsconfig.json)

```json
{
  "@components/*": "./src/components/*",
  "@layouts/*":    "./src/layouts/*",
  "@lib/*":        "./src/lib/*",
  "@types/*":      "./src/types/*",
  "@actions/*":    "./src/actions/*"
}
```

Nunca usar `../../../` — siempre los aliases.

---

## Convenciones de código

| Elemento | Convención |
|---|---|
| Archivos de página | `kebab-case.astro` |
| Componentes | `PascalCase.astro` |
| Utilidades/queries | `camelCase.ts` |
| Columnas DB | `snake_case` |
| Variables TS | `camelCase` |
| Tipos/interfaces | `PascalCase` |
| Constantes | `SCREAMING_SNAKE_CASE` |

---

## URLs del directorio

```
/                                    → Home con búsqueda
/{canton}/                           → Cantón landing (ej: /cartago/)
/{canton}/{distrito}/                → Distrito landing (ej: /cartago/san-nicolas/)
/{canton}/{distrito}/{categoria}     → Listado proveedores
/proveedor/{uuid}-{nombre-slug}      → Perfil de proveedor
/account/                            → Dashboard del proveedor logueado
```

---

## Variables de entorno

| Variable | Dónde | Notas |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | `.env` + Vercel | Segura para exponer |
| `PUBLIC_SUPABASE_ANON_KEY` | `.env` + Vercel | Segura — RLS la protege |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` + Vercel | NUNCA en `PUBLIC_*` ni en git |
| `PUBLIC_SITE_URL` | Vercel | URL de producción |
| `PUBLIC_WHATSAPP_BUSINESS_PHONE` | `.env` + Vercel | Número en formato `506XXXXXXXX` |
| `WHATSAPP_PHONE_NUMBER_ID` | `.env` + Vercel | ID del número en Meta |
| `WHATSAPP_ACCESS_TOKEN` | `.env` + Vercel | Token del System User (permanente) |
| `WHATSAPP_APP_SECRET` | `.env` + Vercel | App Settings → Basic → App Secret |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | `.env` + Vercel | String arbitrario para verificar webhook |

---

## Comandos

```bash
npm run dev          # Servidor de desarrollo (puerto 4321 o siguiente libre)
npm run build        # Build de producción
npm run db:types     # Regenerar tipos de Supabase después de cambios al schema
```
