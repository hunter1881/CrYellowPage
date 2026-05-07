# Base de Datos (Supabase)

## Conexión

- **Proyecto**: `gddselzcwtfbcrbvqntd`
- **URL**: `https://gddselzcwtfbcrbvqntd.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/gddselzcwtfbcrbvqntd

---

## Esquema de tablas

### `cantons`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Nombre oficial INEC |
| `slug` | text | kebab-case sin tildes |

### `districts`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `canton_id` | uuid | FK → cantons |
| `name` | text | Nombre oficial INEC |
| `slug` | text | kebab-case sin tildes |

### `categories`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `slug` | text | |
| `icon_emoji` | text | Emoji para UI |

### `providers`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `phone` | text | Formato E.164 |
| `whatsapp` | text | Formato E.164 |
| `email` | text | |
| `description` | text | Mín 30 chars para auto-aprobación |
| `photo_url` | text | URL de Supabase Storage |
| `district_id` | uuid | FK → districts |
| `owner_id` | uuid | FK → auth.users |
| `verified` | boolean | `false` hasta aprobación |
| `phone_verified` | boolean | `false` hasta verificación WhatsApp |
| `accepts_sinpe` | boolean | |
| `works_weekends` | boolean | |
| `response_time_minutes` | integer | |
| `years_active` | integer | |
| `completed_jobs` | integer | |
| `created_at` | timestamptz | |

### `provider_categories`
| Columna | Tipo | Notas |
|---|---|---|
| `provider_id` | uuid | FK → providers |
| `category_id` | uuid | FK → categories |

### `reviews`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `provider_id` | uuid | FK → providers |
| `author_id` | uuid | FK → auth.users |
| `rating` | integer | 1-5 |
| `comment` | text | |
| `work_confirmed` | boolean | |
| `created_at` | timestamptz | |

### `phone_otp_codes` *(Fase 2)*
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `provider_id` | uuid | FK → providers |
| `phone` | text | Número normalizado |
| `code` | text | 6 dígitos |
| `expires_at` | timestamptz | 10 min desde creación |
| `used` | boolean | |
| `created_at` | timestamptz | |

### `provider_reports` *(Fase 2)*
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `provider_id` | uuid | FK → providers |
| `reporter_id` | uuid | FK → auth.users (nullable) |
| `reason` | text | `fraud`, `fake_info`, `no_show`, `bad_quality`, `spam`, `other` |
| `details` | text | Máx 500 chars |
| `created_at` | timestamptz | |

---

## Migraciones

Las migraciones están en `supabase/migrations/` y se aplican con:

```bash
npx supabase db push
```

Para ver cuáles están aplicadas:
```bash
npx supabase migration list
```

### Migraciones aplicadas

| Archivo | Descripción |
|---|---|
| `20260504113000_initial_directory_schema.sql` | Schema inicial — todas las tablas base |
| `20260504193308_provider_registrations.sql` | Sistema de registro de proveedores |
| `20260504193924_provider_registration_constraints.sql` | Constraints adicionales |
| `20260504220000_search_providers.sql` | Búsqueda full-text con `to_tsvector` |
| `20260504230000_search_unaccent.sql` | Extensión `unaccent` para búsqueda sin tildes |
| `20260505000000_payment_methods.sql` | Métodos de pago SINPE |
| `20260505120000_listing_combinations_rpc.sql` | RPC para `getStaticPaths` eficiente |
| `20260505200000_reviews_work_confirmed.sql` | Campo `work_confirmed` en reviews |
| `20260505210000_reset_seed_completed_jobs.sql` | Fix de datos de seed |
| `20260505220000_provider_registration_email_unique.sql` | Email único en registros |
| `20260506000000_service_areas.sql` | Áreas de servicio de proveedores |
| `20260507000000_phase2_verification.sql` | Fase 2: OTP WhatsApp + auto-aprobación + reportes |

---

## Triggers automáticos (Fase 2)

### `trg_provider_auto_approve`
**Cuándo**: BEFORE UPDATE en `providers`  
**Condición**: `phone_verified` cambia a `true` AND `length(description) >= 30`  
**Acción**: Sets `verified = true` automáticamente

### `trg_auto_flag_reported`
**Cuándo**: AFTER INSERT en `provider_reports`  
**Condición**: El proveedor acumula ≥3 reportes de tipo `fraud` o `fake_info`  
**Acción**: Sets `providers.verified = false`

---

## RLS (Row Level Security)

Todas las tablas tienen RLS habilitado. Reglas principales:

| Tabla | Lectura | Escritura |
|---|---|---|
| `cantons`, `districts`, `categories` | Pública | Solo admin |
| `providers` | `verified = true` (público) + dueño ve el suyo | Solo `owner_id = auth.uid()` |
| `reviews` | Pública | Solo autenticados |
| `provider_reports` | — | Cualquiera (insert público) |
| `phone_otp_codes` | Solo service_role | Solo service_role |

---

## Índices

```sql
CREATE INDEX idx_providers_district ON providers(district_id);
CREATE INDEX idx_providers_verified ON providers(verified) WHERE verified = true;
CREATE INDEX idx_provider_categories_category ON provider_categories(category_id);
CREATE INDEX idx_districts_canton ON districts(canton_id);
CREATE INDEX idx_districts_slug ON districts(slug);
CREATE INDEX idx_cantons_slug ON cantons(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
```

---

## Regenerar tipos TypeScript

Después de cualquier cambio al schema:

```bash
npm run db:types
```

Esto ejecuta:
```bash
npx supabase gen types typescript --project-id gddselzcwtfbcrbvqntd > src/types/database.types.ts
```

**Nunca editar `src/types/database.types.ts` a mano.**

---

## Storage

- **Bucket**: `provider-photos` (público)
- **Path**: `{provider_id}/{filename}`
- **URL pública**: `https://gddselzcwtfbcrbvqntd.supabase.co/storage/v1/object/public/provider-photos/{path}`
