# Wiki — DirectorioLocal CR

Documentación técnica del proyecto. Léela antes de hacer cambios grandes o si hay que reconstruir algo desde cero.

## Índice

| Documento | Descripción |
|---|---|
| [stack-y-arquitectura.md](./stack-y-arquitectura.md) | Stack técnico, estructura de carpetas, aliases, convenciones |
| [base-de-datos.md](./base-de-datos.md) | Esquema de Supabase, migraciones, RLS, índices, tipos |
| [fase2-verificacion.md](./fase2-verificacion.md) | Sistema de verificación por WhatsApp + auto-aprobación + reportes |
| [whatsapp-setup.md](./whatsapp-setup.md) | Guía paso a paso para configurar WhatsApp Cloud API desde cero |
| [deploy-vercel.md](./deploy-vercel.md) | Cómo deployar en Vercel, variables de entorno, redeploy |

## Links rápidos

- **Repositorio**: https://github.com/hunter1881/CrYellowPage
- **Producción**: https://cr-yellow-page.vercel.app
- **Supabase**: https://supabase.com/dashboard/project/gddselzcwtfbcrbvqntd
- **Meta App (WhatsApp)**: https://developers.facebook.com/apps/4512575402296858
- **WhatsApp Manager**: https://business.facebook.com/wa/manage/home/
- **Vercel Dashboard**: https://vercel.com/hunter1881s-projects/cr-yellow-page

## Estado del proyecto

| Fase | Estado | Descripción |
|---|---|---|
| Fase 1 — SSG | ✅ Completo | Directorio estático, todas las páginas de cantones/distritos/categorías |
| Fase 2 — Verificación | ✅ Completo | WhatsApp OTP, auto-aprobación, reportes comunitarios |
| Fase 3 — ISR | ⏳ Pendiente | Activar cuando el build supere 5 minutos |
| Fase 4 — Auth completo | ⏳ Pendiente | Middleware edge, geo-redirects |
