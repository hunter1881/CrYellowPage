-- Migration: payment_methods + provider_payment_methods
-- Replaces the denormalized `accepts_sinpe` boolean with a proper
-- many-to-many relation between providers and the CR payment methods
-- catalogue.  The old column is kept as a generated/legacy convenience
-- flag so existing queries still compile.

-- ────────────────────────────────────────────────────────────────────
-- 1. Payment-methods catalogue
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.payment_methods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                -- display name in Spanish
  slug        text not null unique,         -- kebab-case identifier
  category    text not null,               -- 'digital' | 'card' | 'cash' | 'bank'
  description text,
  logo_url    text,                         -- optional icon/logo
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────
-- 2. Provider ↔ payment-method junction
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.provider_payment_methods (
  provider_id       uuid not null references public.providers(id) on delete cascade,
  payment_method_id uuid not null references public.payment_methods(id) on delete restrict,
  created_at        timestamptz not null default now(),
  primary key (provider_id, payment_method_id)
);

-- ────────────────────────────────────────────────────────────────────
-- 3. Indexes
-- ────────────────────────────────────────────────────────────────────
create index if not exists idx_payment_methods_slug     on public.payment_methods(slug);
create index if not exists idx_payment_methods_category on public.payment_methods(category);
create index if not exists idx_ppm_provider             on public.provider_payment_methods(provider_id);
create index if not exists idx_ppm_method               on public.provider_payment_methods(payment_method_id);

-- ────────────────────────────────────────────────────────────────────
-- 4. RLS
-- ────────────────────────────────────────────────────────────────────
alter table public.payment_methods          enable row level security;
alter table public.provider_payment_methods enable row level security;

-- Catalogue is public-read, no public write
create policy "payment_methods_public_read" on public.payment_methods
  for select using (active = true);

-- Provider payment methods: public read
create policy "ppm_public_read" on public.provider_payment_methods
  for select using (true);

-- Providers can manage their own payment methods
create policy "ppm_owner_insert" on public.provider_payment_methods
  for insert with check (
    auth.uid() = (select owner_id from public.providers where id = provider_id)
  );

create policy "ppm_owner_delete" on public.provider_payment_methods
  for delete using (
    auth.uid() = (select owner_id from public.providers where id = provider_id)
  );

-- ────────────────────────────────────────────────────────────────────
-- 5. Seed — all payment methods used in the CR market (2026)
-- ────────────────────────────────────────────────────────────────────
insert into public.payment_methods (name, slug, category, description, sort_order) values
  -- Digital / mobile
  ('SINPE Móvil',          'sinpe-movil',       'digital', 'Transferencia entre números de teléfono vía SINPE del BCCR. El método más usado en CR.', 10),
  ('SINPE Transferencia',  'sinpe-transfer',    'digital', 'Transferencia SINPE tradicional entre cuentas bancarias (IBAN).', 20),
  ('Payphone',             'payphone',          'digital', 'App de pagos costarricense: QR, link de pago y cobros con tarjeta desde el celular.', 30),
  ('Pagos BAC',            'pagos-bac',         'digital', 'App Pagos BAC para transferencias y pagos entre clientes BAC Credomatic.', 40),
  ('PayPal',               'paypal',            'digital', 'Pagos internacionales en línea. Aceptado por algunos proveedores de servicios digitales.', 50),
  -- Cards
  ('Tarjeta de crédito',   'tarjeta-credito',   'card',    'Visa, Mastercard, American Express. Cobro presencial con datafono o link de pago.', 60),
  ('Tarjeta de débito',    'tarjeta-debito',    'card',    'Débito de cuenta corriente o ahorros. Cobro presencial con datafono.', 70),
  -- Cash
  ('Efectivo (colones)',   'efectivo-colones',  'cash',    'Pago en colones costarricenses al finalizar el trabajo.', 80),
  ('Efectivo (dólares)',   'efectivo-dolares',  'cash',    'Pago en dólares americanos. Aceptado por muchos proveedores de zonas turísticas.', 90),
  -- Bank
  ('Depósito bancario',    'deposito-bancario', 'bank',    'Depósito en cuenta corriente o ahorros de cualquier banco del sistema financiero nacional.', 100),
  ('Cheque',               'cheque',            'bank',    'Cheque de cuenta corriente. Menos frecuente; usado en contratos de obra o servicios mayores.', 110)
on conflict (slug) do update
  set name        = excluded.name,
      category    = excluded.category,
      description = excluded.description,
      sort_order  = excluded.sort_order;

-- ────────────────────────────────────────────────────────────────────
-- 6. Backfill: seed providers that had accepts_sinpe = true
--    get "sinpe-movil" linked automatically
-- ────────────────────────────────────────────────────────────────────
insert into public.provider_payment_methods (provider_id, payment_method_id)
select p.id, pm.id
from   public.providers p
cross join public.payment_methods pm
where  p.accepts_sinpe = true
  and  pm.slug = 'sinpe-movil'
on conflict do nothing;
