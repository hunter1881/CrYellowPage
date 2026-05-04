create extension if not exists pgcrypto;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  iso2 text not null unique,
  iso3 text not null unique,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.provinces (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete restrict,
  code text not null,
  name text not null,
  slug text not null,
  area_m2 numeric,
  source text not null default 'INEC UGED 2024',
  created_at timestamptz not null default now(),
  unique (country_id, code),
  unique (country_id, slug)
);

create table if not exists public.cantons (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references public.provinces(id) on delete restrict,
  code text not null,
  name text not null,
  slug text not null,
  area_m2 numeric,
  source text not null default 'INEC UGED 2024',
  created_at timestamptz not null default now(),
  unique (province_id, code),
  unique (province_id, slug)
);

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  canton_id uuid not null references public.cantons(id) on delete restrict,
  code text not null,
  postal_code text not null,
  name text not null,
  slug text not null,
  area_m2 numeric,
  source text not null default 'INEC UGED 2024',
  source_updated_at date,
  created_at timestamptz not null default now(),
  unique (canton_id, code),
  unique (canton_id, slug),
  unique (postal_code)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon_emoji text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp text,
  email text,
  description text,
  photo_url text,
  district_id uuid not null references public.districts(id) on delete restrict,
  owner_id uuid references auth.users(id) on delete set null,
  verified boolean not null default false,
  accepts_sinpe boolean not null default false,
  works_weekends boolean not null default false,
  years_active integer not null default 1 check (years_active >= 0),
  completed_jobs integer not null default 0 check (completed_jobs >= 0),
  response_time_minutes integer check (response_time_minutes is null or response_time_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_categories (
  provider_id uuid not null references public.providers(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (provider_id, category_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

create index if not exists idx_provinces_country on public.provinces(country_id);
create index if not exists idx_cantons_province on public.cantons(province_id);
create index if not exists idx_districts_canton on public.districts(canton_id);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_providers_district on public.providers(district_id);
create index if not exists idx_providers_verified on public.providers(verified) where verified = true;
create index if not exists idx_provider_categories_category on public.provider_categories(category_id);
create index if not exists idx_reviews_provider on public.reviews(provider_id);

alter table public.countries enable row level security;
alter table public.provinces enable row level security;
alter table public.cantons enable row level security;
alter table public.districts enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.provider_categories enable row level security;
alter table public.reviews enable row level security;

create policy "countries_public_read" on public.countries for select using (true);
create policy "provinces_public_read" on public.provinces for select using (true);
create policy "cantons_public_read" on public.cantons for select using (true);
create policy "districts_public_read" on public.districts for select using (true);
create policy "categories_public_read" on public.categories for select using (true);
create policy "provider_categories_public_read" on public.provider_categories for select using (true);
create policy "reviews_public_read" on public.reviews for select using (true);

create policy "providers_public_verified_read" on public.providers
for select using (verified = true);

create policy "providers_owner_read" on public.providers
for select using (auth.uid() = owner_id);

create policy "providers_owner_insert" on public.providers
for insert with check (auth.uid() = owner_id);

create policy "providers_owner_update" on public.providers
for update using (auth.uid() = owner_id)
with check (auth.uid() = owner_id and verified = (select p.verified from public.providers p where p.id = providers.id));

create policy "reviews_authenticated_insert" on public.reviews
for insert with check (auth.uid() = author_id);

insert into storage.buckets (id, name, public)
values ('provider-photos', 'provider-photos', true)
on conflict (id) do update set public = excluded.public;

create policy "provider_photos_public_read" on storage.objects
for select using (bucket_id = 'provider-photos');

create policy "provider_photos_authenticated_insert" on storage.objects
for insert to authenticated with check (bucket_id = 'provider-photos');

create policy "provider_photos_authenticated_update" on storage.objects
for update to authenticated using (bucket_id = 'provider-photos')
with check (bucket_id = 'provider-photos');
