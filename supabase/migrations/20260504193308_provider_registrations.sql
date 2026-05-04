create table if not exists public.provider_registrations (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  phone text not null,
  whatsapp text,
  email text not null,
  district_id uuid not null references public.districts(id) on delete restrict,
  category_ids uuid[] not null,
  description text not null,
  accepts_sinpe boolean not null default false,
  works_weekends boolean not null default false,
  years_active integer not null default 1 check (years_active >= 0),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'approved', 'rejected')),
  source_locale text not null default 'es' check (source_locale in ('es', 'en')),
  created_at timestamptz not null default now()
);

create index if not exists idx_provider_registrations_status
on public.provider_registrations(status, created_at desc);

create index if not exists idx_provider_registrations_district
on public.provider_registrations(district_id);

alter table public.provider_registrations enable row level security;

create policy "provider_registrations_public_insert"
on public.provider_registrations
for insert
to anon, authenticated
with check (status = 'pending');

grant insert on public.provider_registrations to anon, authenticated;
