import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, 'supabase', 'sources', 'inec-uged-2024.dbf')
const outputPath = path.join(root, 'supabase', 'seed.sql')

function readDbf(filePath) {
  const buffer = fs.readFileSync(filePath)
  const recordCount = buffer.readUInt32LE(4)
  const headerLength = buffer.readUInt16LE(8)
  const recordLength = buffer.readUInt16LE(10)
  const fields = []

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    const name = buffer.subarray(offset, offset + 11).toString('ascii').replace(/\0.*$/, '')
    fields.push({
      name,
      type: String.fromCharCode(buffer[offset + 11]),
      length: buffer[offset + 16],
      start: fields.reduce((total, field) => total + field.length, 1),
    })
  }

  const rows = []
  for (let index = 0; index < recordCount; index += 1) {
    const base = headerLength + index * recordLength
    if (buffer[base] === 0x2a) continue

    const row = {}
    for (const field of fields) {
      const raw = buffer
        .subarray(base + field.start, base + field.start + field.length)
        .toString('utf8')
        .trim()
      row[field.name] = raw
    }
    rows.push(row)
  }

  return rows
}

function toSlug(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[ñÑ]/g, 'n')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function sql(value) {
  if (value === null || value === undefined || value === '') return 'null'
  return `'${String(value).replaceAll("'", "''")}'`
}

function numberSql(value) {
  if (value === null || value === undefined || value === '') return 'null'
  return String(Number(value))
}

function dateSql(value) {
  if (!/^\d{8}$/.test(value)) return 'null'
  return sql(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`)
}

function uniqBy(items, keyFn) {
  const map = new Map()
  for (const item of items) {
    const key = keyFn(item)
    if (!map.has(key)) map.set(key, item)
  }
  return [...map.values()]
}

function sumArea(rows) {
  return rows.reduce((total, row) => total + Number(row.areaM2 || row.AREA_M2 || 0), 0)
}

function assertCount(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label} count mismatch: expected ${expected}, got ${actual}`)
  }
}

const districts = readDbf(sourcePath).map((row) => ({
  provinceCode: row.COD_UGED.slice(0, 1),
  cantonCode: row.COD_UGED.slice(0, 3),
  districtCode: row.COD_UGED,
  provinceName: row.NOMB_UGEP,
  cantonName: row.NOMB_UGEC,
  districtName: row.NOMB_UGED,
  areaM2: row.AREA_M2,
  sourceUpdatedAt: row.FECHA_ACTU,
}))

const provinces = uniqBy(districts, (row) => row.provinceCode).map((province) => ({
  code: province.provinceCode,
  name: province.provinceName,
  slug: toSlug(province.provinceName),
  areaM2: sumArea(districts.filter((row) => row.provinceCode === province.provinceCode)),
}))

const cantons = uniqBy(districts, (row) => row.cantonCode).map((canton) => ({
  provinceCode: canton.provinceCode,
  code: canton.cantonCode,
  name: canton.cantonName,
  slug: toSlug(canton.cantonName),
  areaM2: sumArea(districts.filter((row) => row.cantonCode === canton.cantonCode)),
}))

assertCount('province', provinces.length, 7)
assertCount('canton', cantons.length, 84)
assertCount('district', districts.length, 492)

const categories = [
  ['Fontanería', 'fontaneria', '💧', 'Reparaciones de fugas, tuberías, tanques y emergencias de agua.'],
  ['Electricidad', 'electricidad', '⚡', 'Instalaciones, reparaciones eléctricas y mantenimiento residencial.'],
  ['Limpieza', 'limpieza', '🧽', 'Limpieza residencial, comercial y servicios por visita.'],
  ['Jardinería', 'jardineria', '🌿', 'Mantenimiento de jardines, zonas verdes y poda menor.'],
  ['Reparaciones', 'reparaciones', '🛠️', 'Arreglos menores, mantenimiento general y mejoras del hogar.'],
  ['Cerrajería', 'cerrajeria', '🔑', 'Aperturas, cambios de llavín y servicios de seguridad básica.'],
  ['Pintura', 'pintura', '🎨', 'Pintura interior, exterior y retoques residenciales.'],
  ['Aire acondicionado', 'aire-acondicionado', '❄️', 'Instalación, limpieza y mantenimiento de aires acondicionados.'],
]

const providerRows = [
  {
    id: '00000000-0000-4000-8000-000000000301',
    name: 'Don Rafa Fontanería',
    phone: '8712-4490',
    whatsapp: '50687124490',
    description: 'Fontanero con 18 años atendiendo Aserrí. Reparación de fugas, instalación de tanques y emergencias.',
    districtCode: '10603',
    verified: true,
    acceptsSinpe: true,
    worksWeekends: true,
    yearsActive: 18,
    completedJobs: 230,
    responseTimeMinutes: 35,
    categories: ['fontaneria', 'reparaciones'],
  },
  {
    id: '00000000-0000-4000-8000-000000000302',
    name: 'Fontanería Emergencia 24',
    phone: '8990-1147',
    whatsapp: '50689901147',
    description: 'Servicio de emergencia 24/7 para fugas y obstrucciones en zona sur de San José.',
    districtCode: '10603',
    verified: true,
    acceptsSinpe: true,
    worksWeekends: true,
    yearsActive: 9,
    completedJobs: 145,
    responseTimeMinutes: 20,
    categories: ['fontaneria'],
  },
  {
    id: '00000000-0000-4000-8000-000000000303',
    name: 'Servicios Jorco',
    phone: '7045-2218',
    whatsapp: '50670452218',
    description: 'Instalaciones, mantenimiento y reparaciones menores para hogares en Vuelta de Jorco.',
    districtCode: '10603',
    verified: true,
    acceptsSinpe: false,
    worksWeekends: true,
    yearsActive: 6,
    completedJobs: 88,
    responseTimeMinutes: 45,
    categories: ['fontaneria', 'reparaciones'],
  },
]

const lines = []
lines.push('-- Generated by scripts/generate-geography-seed.mjs from INEC UGED 2024 DBF.')
lines.push('-- Validated counts: 7 provinces, 84 cantons, 492 districts.')
lines.push('')
lines.push('insert into public.countries (iso2, iso3, name, slug)')
lines.push("values ('CR', 'CRI', 'Costa Rica', 'costa-rica')")
lines.push('on conflict (iso2) do update set name = excluded.name, slug = excluded.slug;')
lines.push('')

for (const province of provinces) {
  lines.push(`insert into public.provinces (country_id, code, name, slug, area_m2, source)`)
  lines.push(
    `select id, ${sql(province.code)}, ${sql(province.name)}, ${sql(province.slug)}, ${numberSql(province.areaM2)}, 'INEC UGED 2024' from public.countries where iso2 = 'CR'`,
  )
  lines.push(
    'on conflict (country_id, code) do update set name = excluded.name, slug = excluded.slug, area_m2 = excluded.area_m2, source = excluded.source;',
  )
}
lines.push('')

for (const canton of cantons) {
  lines.push(`insert into public.cantons (province_id, code, name, slug, area_m2, source)`)
  lines.push(
    `select id, ${sql(canton.code)}, ${sql(canton.name)}, ${sql(canton.slug)}, ${numberSql(canton.areaM2)}, 'INEC UGED 2024' from public.provinces where code = ${sql(canton.provinceCode)}`,
  )
  lines.push(
    'on conflict (province_id, code) do update set name = excluded.name, slug = excluded.slug, area_m2 = excluded.area_m2, source = excluded.source;',
  )
}
lines.push('')

for (const district of districts) {
  lines.push(
    'insert into public.districts (canton_id, code, postal_code, name, slug, area_m2, source, source_updated_at)',
  )
  lines.push(
    `select id, ${sql(district.districtCode)}, ${sql(district.districtCode)}, ${sql(district.districtName)}, ${sql(toSlug(district.districtName))}, ${numberSql(district.areaM2)}, 'INEC UGED 2024', ${dateSql(district.sourceUpdatedAt)} from public.cantons where code = ${sql(district.cantonCode)}`,
  )
  lines.push(
    'on conflict (postal_code) do update set name = excluded.name, slug = excluded.slug, area_m2 = excluded.area_m2, source = excluded.source, source_updated_at = excluded.source_updated_at;',
  )
}
lines.push('')

lines.push('insert into public.categories (name, slug, icon_emoji, description)')
lines.push('values')
lines.push(
  categories
    .map(([name, slug, icon, description]) => `  (${sql(name)}, ${sql(slug)}, ${sql(icon)}, ${sql(description)})`)
    .join(',\n'),
)
lines.push('on conflict (slug) do update set name = excluded.name, icon_emoji = excluded.icon_emoji, description = excluded.description;')
lines.push('')

for (const provider of providerRows) {
  lines.push(
    'insert into public.providers (id, name, phone, whatsapp, description, district_id, verified, accepts_sinpe, works_weekends, years_active, completed_jobs, response_time_minutes)',
  )
  lines.push(
    `select ${sql(provider.id)}::uuid, ${sql(provider.name)}, ${sql(provider.phone)}, ${sql(provider.whatsapp)}, ${sql(provider.description)}, id, ${provider.verified}, ${provider.acceptsSinpe}, ${provider.worksWeekends}, ${provider.yearsActive}, ${provider.completedJobs}, ${provider.responseTimeMinutes} from public.districts where postal_code = ${sql(provider.districtCode)}`,
  )
  lines.push(
    'on conflict (id) do update set name = excluded.name, phone = excluded.phone, whatsapp = excluded.whatsapp, description = excluded.description, district_id = excluded.district_id, verified = excluded.verified, accepts_sinpe = excluded.accepts_sinpe, works_weekends = excluded.works_weekends, years_active = excluded.years_active, completed_jobs = excluded.completed_jobs, response_time_minutes = excluded.response_time_minutes;',
  )
  for (const categorySlug of provider.categories) {
    lines.push('insert into public.provider_categories (provider_id, category_id)')
    lines.push(
      `select ${sql(provider.id)}::uuid, id from public.categories where slug = ${sql(categorySlug)}`,
    )
    lines.push('on conflict (provider_id, category_id) do nothing;')
  }
}

lines.push('')
lines.push(`insert into public.reviews (provider_id, author_name, rating, comment)
values
  ('00000000-0000-4000-8000-000000000301', 'Cliente de Vuelta de Jorco', 5, 'Respondió rápido y resolvió una fuga el mismo día.'),
  ('00000000-0000-4000-8000-000000000302', 'Vecina de Aserrí', 5, 'Llegaron en la noche y explicaron bien el trabajo.'),
  ('00000000-0000-4000-8000-000000000303', 'Cliente local', 4, 'Buen servicio para reparaciones menores en la casa.');`)

fs.writeFileSync(outputPath, `${lines.join('\n')}\n`)

console.log(`Generated ${path.relative(root, outputPath)}`)
console.log(`Provinces: ${provinces.length}`)
console.log(`Cantons: ${cantons.length}`)
console.log(`Districts: ${districts.length}`)
