# Deploy en Vercel

## Datos del proyecto en Vercel

| Campo | Valor |
|---|---|
| Proyecto | `cr-yellow-page` |
| URL de producción | https://cr-yellow-page.vercel.app |
| Repositorio | https://github.com/hunter1881/CrYellowPage |
| Dashboard | https://vercel.com/hunter1881s-projects/cr-yellow-page |
| Build command | `astro build` |
| Output directory | `dist/` |

---

## Cómo funciona el deploy

El deploy es automático. Cada `git push` a la rama `main` dispara un nuevo build en Vercel.

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push y:
1. Instala dependencias (`npm ci`)
2. Ejecuta `astro build`
3. Genera ~597 páginas estáticas + funciones serverless
4. Publica en producción (~46 segundos de build time)

---

## Primero configurar un proyecto desde cero

Si el proyecto se mueve a otro repositorio o se crea un nuevo deploy:

1. Ir a https://vercel.com/new
2. Importar el repositorio de GitHub
3. Framework preset: seleccionar **Astro**
4. Build command: `astro build` (ya configurado en `package.json`)
5. Output directory: `dist` (Astro lo genera aquí)
6. Agregar todas las variables de entorno (ver sección abajo)
7. Clic en **Deploy**

---

## Variables de entorno requeridas

Configurarlas en Vercel Dashboard → Settings → Environment Variables.  
Aplicar a todos los environments (Production, Preview, Development).

| Variable | Ejemplo | Notas |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Del dashboard de Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Del dashboard de Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | **Solo servidor** — nunca PUBLIC_ |
| `PUBLIC_SITE_URL` | `https://cr-yellow-page.vercel.app` | URL del sitio en producción |
| `PUBLIC_WHATSAPP_BUSINESS_PHONE` | `50663709184` | Número sin + |
| `WHATSAPP_PHONE_NUMBER_ID` | `1072843155918984` | Del Meta Dashboard |
| `WHATSAPP_ACCESS_TOKEN` | `EABAI...` | Token del System User |
| `WHATSAPP_APP_SECRET` | `381c1...` | Meta → App Settings → Basic |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | `directorio-webhook-2026` | String que configuraste en Meta |

---

## Estructura del build

El proyecto usa `output: 'server'` en `astro.config.mjs`. Esto significa:

- Las páginas con `export const prerender = true` se generan como HTML estático
- Las páginas sin ese flag se sirven como funciones serverless en Vercel
- El endpoint `src/pages/api/whatsapp-webhook.ts` siempre es serverless (`prerender = false`)

---

## Ver logs de producción

Para debuggear funciones serverless en producción:

1. Ir a https://vercel.com/hunter1881s-projects/cr-yellow-page
2. Tab **"Functions"** → seleccionar la función (ej: `api/whatsapp-webhook`)
3. Tab **"Logs"** para ver requests en tiempo real

---

## Redeploy manual

Si un deploy falla o hay que forzar uno:

1. Vercel Dashboard → Deployments
2. Seleccionar el último deploy
3. Clic en los 3 puntos → **"Redeploy"**

O desde la terminal:
```bash
npx vercel --prod
```

---

## Dominio personalizado

Cuando se quiera cambiar a `elcontactico.cr`:

1. Vercel Dashboard → Settings → Domains
2. Agregar `elcontactico.cr`
3. Configurar los DNS en el registrador:
   - `A` record: `76.76.21.21`
   - `CNAME www`: `cname.vercel-dns.com`
4. Actualizar `PUBLIC_SITE_URL` a `https://elcontactico.cr`
5. Redeploy para que Astro use la nueva `site` config
