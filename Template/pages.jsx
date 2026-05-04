// Páginas — Home, Canton, District, Category, Provider
// Mobile-first: layout colapsa a una columna en chico, expande en grande.

const { useState: usePagesState } = React;

// ============================================================
// HOME PAGE
// ============================================================
function HomePage({ theme, t, lang, isMobile, density, onNav, onLocationOpen, onContact }) {
  const data = window.CR_DATA;
  const canton = data.cantonActual;
  const distrito = data.distritoActual;

  return (
    <div>
      {/* Search-first hero — directorio, no marketing */}
      <section style={{
        background: theme.surface,
        borderBottom: `1px solid ${theme.rule}`,
        padding: isMobile ? '16px 14px 18px' : '28px 24px 32px',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 8,
            marginBottom: isMobile ? 12 : 16,
          }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 4, fontWeight: 600 }}>
                {lang === 'es' ? 'Directorio de servicios' : 'Services directory'}
              </div>
              <h1 style={{
                fontSize: isMobile ? 22 : 30,
                fontWeight: 600,
                margin: 0,
                letterSpacing: -0.6,
                lineHeight: 1.15,
                fontFamily: theme.fontDisplay || theme.font,
                color: theme.ink,
              }}>
                {lang === 'es' ? 'Encontrá un servicio en' : 'Find a service in'}<br/>
                <span style={{ color: theme.brand }}>{distrito.nombre}, {canton.nombre}</span>
              </h1>
            </div>
            {!isMobile && (
              <div style={{ fontSize: 12, color: theme.ink3, fontFamily: theme.fontMono, textAlign: 'right' }}>
                <div>17 {lang === 'es' ? 'proveedores en este distrito' : 'providers in this district'}</div>
                <div style={{ marginTop: 2 }}>89 {lang === 'es' ? 'en todo el cantón Aserrí' : 'across canton Aserrí'}</div>
              </div>
            )}
          </div>
          <SearchModule theme={theme} t={t} lang={lang} canton={canton} distrito={distrito} onLocationOpen={onLocationOpen} isMobile={isMobile} />
        </div>
      </section>

      <div style={{
        maxWidth: 1180, margin: '0 auto',
        padding: isMobile ? '20px 14px' : '32px 24px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
        gap: isMobile ? 24 : 32,
      }}>
        {/* Sidebar / mobile-bottom: distritos del cantón */}
        <aside style={{ order: isMobile ? 2 : 0 }}>
          <div style={{
            fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3,
            letterSpacing: theme.metaSpacing, textTransform: theme.metaCase,
            paddingBottom: 8, borderBottom: `1px solid ${theme.rule}`, marginBottom: 6,
            fontWeight: 600,
          }}>
            {lang === 'es' ? 'Distritos de Aserrí' : 'Districts of Aserrí'}
          </div>
          <div>
            {data.distritos.map((d, i) => (
              <button key={d.slug} onClick={() => onNav('district', { distrito: d })} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '8px 4px',
                background: 'transparent', border: 'none',
                borderBottom: i < data.distritos.length - 1 ? `1px solid ${theme.ruleSoft}` : 'none',
                fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                textAlign: 'left',
              }}>
                <span style={{ color: d.slug === distrito.slug ? theme.brand : theme.ink, fontWeight: d.slug === distrito.slug ? 600 : 400 }}>{d.nombre}</span>
                <span style={{ color: theme.ink3, fontFamily: theme.fontMono, fontSize: 11 }}>{d.proveedores}</span>
              </button>
            ))}
          </div>
          <div style={{
            marginTop: 18,
            padding: 14,
            background: theme.brandSoft,
            border: `1px solid ${theme.brand}`,
            borderRadius: theme.radius,
          }}>
            <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.brandInk, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 4, fontWeight: 600 }}>
              {lang === 'es' ? '¿Sos proveedor?' : 'Are you a provider?'}
            </div>
            <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.45, marginBottom: 10 }}>
              {lang === 'es' ? 'Registrate gratis y atendé clientes de tu cantón.' : 'Register free and serve clients in your canton.'}
            </div>
            <button onClick={() => onNav('register')} style={{
              background: theme.brand, color: '#fff', border: 'none',
              padding: '8px 12px', fontSize: 12, fontWeight: 600,
              borderRadius: theme.radius, cursor: 'pointer', fontFamily: 'inherit',
            }}>{t.registrarme}</button>
          </div>
        </aside>

        <div>
          {/* Categorías */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, margin: 0, letterSpacing: -0.3, fontFamily: theme.fontDisplay || theme.font }}>
              {lang === 'es' ? 'Categorías en este distrito' : 'Categories in this district'}
            </h2>
            <span style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase }}>
              {data.categorias.length} {lang === 'es' ? 'categorías' : 'categories'}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: density === 'compact' ? 8 : 12,
            marginBottom: 32,
          }}>
            {data.categorias.map((c) => (
              <CategoryCard key={c.slug} theme={theme} lang={lang} cat={c} density={density} onClick={() => onNav('category', { cat: c })} />
            ))}
          </div>

          {/* Recientes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, margin: 0, letterSpacing: -0.3, fontFamily: theme.fontDisplay || theme.font }}>
              {lang === 'es' ? 'Últimos verificados' : 'Recently verified'}
            </h2>
            <button onClick={() => onNav('category', { cat: data.categorias[0] })} style={{
              fontSize: 12, color: theme.brand, background: 'transparent', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>{t.verTodos} {window.Icon.arrow(11)}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: density === 'compact' ? 8 : 10 }}>
            {data.proveedores.slice(0, 3).map((p) => (
              <ProviderCard key={p.slug} theme={theme} t={t} lang={lang} p={p} density={density}
                onClick={() => onNav('provider', { provider: p })}
                onContact={onContact}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CANTON PAGE
// ============================================================
function CantonPage({ theme, t, lang, isMobile, density, onNav }) {
  const data = window.CR_DATA;
  return (
    <div>
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.rule}`, padding: isMobile ? '12px 14px' : '12px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Breadcrumbs theme={theme} onNav={onNav} items={[
            { label: t.home, go: 'home' },
            { label: data.cantonActual.provincia },
            { label: data.cantonActual.nombre },
          ]} />
        </div>
      </div>
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.rule}`, padding: isMobile ? '20px 14px' : '32px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 6, fontWeight: 600 }}>
            {lang === 'es' ? 'Cantón' : 'Canton'} · {data.cantonActual.provincia}
          </div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 600, margin: 0, letterSpacing: -0.6, fontFamily: theme.fontDisplay || theme.font }}>
            {lang === 'es' ? 'Servicios verificados en' : 'Verified services in'} <span style={{ color: theme.brand }}>{data.cantonActual.nombre}</span>
          </h1>
          <p style={{ fontSize: 14, color: theme.ink2, marginTop: 8, lineHeight: 1.5, maxWidth: 640 }}>
            {lang === 'es'
              ? `Encontrá fontaneros, electricistas, jardineros y más servicios cerca de tu casa. ${data.cantonActual.nombre} tiene 7 distritos con 89 proveedores activos.`
              : `Find plumbers, electricians, gardeners and more services near you. ${data.cantonActual.nombre} has 7 districts with 89 active providers.`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '20px 14px' : '28px 24px' }}>
        <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, margin: '0 0 12px', letterSpacing: -0.3, fontFamily: theme.fontDisplay || theme.font }}>
          {lang === 'es' ? 'Distritos del cantón' : 'Canton districts'}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 10,
        }}>
          {data.distritos.map((d) => (
            <button key={d.slug} onClick={() => onNav('district', { distrito: d })} style={{
              background: theme.surface,
              border: theme.cardBorder,
              borderRadius: theme.radius,
              padding: isMobile ? '14px 12px' : '16px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              boxShadow: theme.shadow,
              transition: 'border-color .15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.brand}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.rule}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.ink, letterSpacing: -0.2 }}>{d.nombre}</div>
              <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span>{d.proveedores} {lang === 'es' ? 'proveedores' : 'providers'}</span>
                <span>{window.Icon.arrow(11)}</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 28, padding: isMobile ? 16 : 20,
          background: theme.surfaceAlt, borderRadius: theme.radius, border: `1px solid ${theme.rule}`,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 6px', fontFamily: theme.fontDisplay || theme.font }}>
            {lang === 'es' ? `Sobre ${data.cantonActual.nombre}` : `About ${data.cantonActual.nombre}`}
          </h3>
          <p style={{ fontSize: 13, color: theme.ink2, lineHeight: 1.55, margin: 0 }}>
            {lang === 'es'
              ? `Aserrí es uno de los 20 cantones de la provincia de San José. Sus 7 distritos abarcan zonas urbanas como Aserrí Centro y Salitrillos, así como áreas rurales como Vuelta de Jorco, Tarbaca y Legua. Los proveedores que atienden este cantón conocen sus carreteras, distancias y particularidades.`
              : `Aserrí is one of the 20 cantons in San José province. Its 7 districts span urban zones like Aserrí Centro and Salitrillos, and rural areas such as Vuelta de Jorco, Tarbaca and Legua. Providers serving this canton know its roads, distances and quirks.`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DISTRICT PAGE
// ============================================================
function DistrictPage({ theme, t, lang, isMobile, density, onNav }) {
  const data = window.CR_DATA;
  return (
    <div>
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.rule}`, padding: isMobile ? '12px 14px' : '12px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Breadcrumbs theme={theme} onNav={onNav} items={[
            { label: t.home, go: 'home' },
            { label: data.cantonActual.nombre, go: 'canton' },
            { label: data.distritoActual.nombre },
          ]} />
        </div>
      </div>
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.rule}`, padding: isMobile ? '20px 14px' : '32px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 6, fontWeight: 600 }}>
            {lang === 'es' ? 'Distrito' : 'District'} · {data.cantonActual.nombre}
          </div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 600, margin: 0, letterSpacing: -0.6, fontFamily: theme.fontDisplay || theme.font }}>
            <span style={{ color: theme.brand }}>{data.distritoActual.nombre}</span>
          </h1>
          <p style={{ fontSize: 14, color: theme.ink2, marginTop: 8, lineHeight: 1.5, maxWidth: 640 }}>
            {lang === 'es'
              ? '17 proveedores activos en Vuelta de Jorco. Todos confirmaron identidad y atienden la zona regularmente.'
              : '17 active providers in Vuelta de Jorco. All have confirmed their identity and serve the area regularly.'}
          </p>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              [lang === 'es' ? 'Proveedores' : 'Providers', '17'],
              [lang === 'es' ? 'Verificados' : 'Verified', '14'],
              [lang === 'es' ? 'Categorías' : 'Categories', '5'],
              [lang === 'es' ? 'Calificación promedio' : 'Avg rating', '4.7'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: theme.ink, letterSpacing: -0.4, fontFamily: theme.fontDisplay || theme.font }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '20px 14px' : '28px 24px' }}>
        <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, margin: '0 0 12px', letterSpacing: -0.3, fontFamily: theme.fontDisplay || theme.font }}>
          {lang === 'es' ? 'Categorías de servicios disponibles' : 'Available service categories'}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: density === 'compact' ? 8 : 12,
          marginBottom: 32,
        }}>
          {data.categorias.map((c) => (
            <CategoryCard key={c.slug} theme={theme} lang={lang} cat={c} density={density} onClick={() => onNav('category', { cat: c })} />
          ))}
        </div>

        <div style={{
          padding: isMobile ? 14 : 18,
          background: theme.surfaceAlt, border: `1px solid ${theme.rule}`,
          borderRadius: theme.radius,
        }}>
          <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 6, fontWeight: 600 }}>
            {lang === 'es' ? 'Distritos cercanos' : 'Nearby districts'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.distritos.filter(d => d.slug !== 'vuelta-de-jorco').slice(0, 5).map((d) => (
              <button key={d.slug} onClick={() => onNav('district', { distrito: d })} style={{
                fontSize: 12, padding: '6px 10px',
                border: `1px solid ${theme.rule}`, borderRadius: theme.radius * 4,
                color: theme.ink2, background: theme.surface, cursor: 'pointer',
                fontFamily: 'inherit',
              }}>{d.nombre} <span style={{ color: theme.ink3, fontFamily: theme.fontMono, marginLeft: 2 }}>{d.proveedores}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CATEGORY PAGE
// ============================================================
function CategoryPage({ theme, t, lang, isMobile, density, cat, onNav, onContact }) {
  const data = window.CR_DATA;
  const [filters, setFilters] = usePagesState({ hoy: false, verif: true, sinpe: false, finde: false, mejores: false });
  const [showFilters, setShowFilters] = usePagesState(false);
  const [sort, setSort] = usePagesState('rating');

  let providers = data.proveedores.filter((p) => p.categoria === cat.slug);
  if (filters.verif) providers = providers.filter((p) => p.verificado);
  if (filters.hoy) providers = providers.filter((p) => p.hoy);
  if (filters.sinpe) providers = providers.filter((p) => p.sinpe);
  if (filters.finde) providers = providers.filter((p) => p.finSemana);
  if (sort === 'rating') providers.sort((a, b) => b.rating - a.rating);
  if (sort === 'years') providers.sort((a, b) => b.años - a.años);

  // Empty state demo: para 'reparaciones' fingimos que no hay
  const empty = cat.slug === 'reparaciones' && providers.length === 0;

  return (
    <div>
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.rule}`, padding: isMobile ? '12px 14px' : '12px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Breadcrumbs theme={theme} onNav={onNav} items={[
            { label: t.home, go: 'home' },
            { label: data.cantonActual.nombre, go: 'canton' },
            { label: data.distritoActual.nombre, go: 'district' },
            { label: lang === 'es' ? cat.nombre : cat.en },
          ]} />
        </div>
      </div>

      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.rule}`, padding: isMobile ? '18px 14px' : '24px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, background: theme.brandSoft, color: theme.brand, borderRadius: theme.radius, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {window.catIcon(cat.slug, 18)}
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, fontWeight: 600 }}>
                {data.cantonActual.nombre} · {data.distritoActual.nombre}
              </div>
              <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 600, margin: '2px 0 0', letterSpacing: -0.5, fontFamily: theme.fontDisplay || theme.font }}>
                {lang === 'es' ? `${cat.nombre} en ${data.distritoActual.nombre}` : `${cat.en} in ${data.distritoActual.nombre}`}
              </h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: theme.ink2, lineHeight: 1.5, margin: 0 }}>
            {lang === 'es' ? `${providers.length} proveedores que atienden este distrito` : `${providers.length} providers serving this district`}
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: 1180, margin: '0 auto',
        padding: isMobile ? '14px 14px' : '24px 24px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
        gap: isMobile ? 14 : 28,
      }}>
        {/* Filters: drawer en mobile, sidebar en desktop */}
        {!isMobile && (
          <aside>
            <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, paddingBottom: 8, borderBottom: `1px solid ${theme.rule}`, marginBottom: 10, fontWeight: 600 }}>{t.filtros}</div>
            {[
              { k: 'hoy', l: t.hoy },
              { k: 'verif', l: t.soloVerif },
              { k: 'sinpe', l: t.sinpe },
              { k: 'finde', l: t.finde },
              { k: 'mejores', l: t.mejores },
            ].map((f) => (
              <label key={f.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 13, color: theme.ink2, cursor: 'pointer' }}>
                <span style={{
                  width: 16, height: 16,
                  border: `1.5px solid ${filters[f.k] ? theme.brand : theme.rule}`,
                  background: filters[f.k] ? theme.brand : theme.surface,
                  borderRadius: theme.radius / 2,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}
                  onClick={() => setFilters({ ...filters, [f.k]: !filters[f.k] })}
                >{filters[f.k] && window.Icon.check(11)}</span>
                {f.l}
              </label>
            ))}
            <div style={{ marginTop: 18, fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, paddingBottom: 8, borderBottom: `1px solid ${theme.rule}`, marginBottom: 10, fontWeight: 600 }}>{t.ordenar}</div>
            {[
              { k: 'rating', l: t.mejores },
              { k: 'years', l: lang === 'es' ? 'Más años' : 'Most years' },
              { k: 'response', l: lang === 'es' ? 'Responde más rápido' : 'Fastest response' },
            ].map((o) => (
              <button key={o.k} onClick={() => setSort(o.k)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
                fontSize: 13, color: sort === o.k ? theme.ink : theme.ink2, fontWeight: sort === o.k ? 600 : 400,
                background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                width: '100%', textAlign: 'left',
              }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, border: `1.5px solid ${sort === o.k ? theme.brand : theme.rule}`, background: sort === o.k ? theme.brand : 'transparent', flexShrink: 0 }} />
                {o.l}
              </button>
            ))}
          </aside>
        )}

        <div>
          {isMobile && (
            <div style={{ marginBottom: 12 }}>
              <FilterChips theme={theme} t={t} filters={filters} onToggle={(k) => setFilters({ ...filters, [k]: !filters[k] })} lang={lang} />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, fontWeight: 600 }}>
              {empty ? '0' : providers.length} {lang === 'es' ? 'resultados' : 'results'}
            </span>
            {!isMobile && (
              <button onClick={() => setSort(sort === 'rating' ? 'years' : 'rating')} style={{
                fontSize: 12, color: theme.ink2, background: 'transparent',
                border: `1px solid ${theme.rule}`, padding: '5px 10px',
                borderRadius: theme.radius, cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>{window.Icon.filter(12)} {sort === 'rating' ? t.mejores : (lang === 'es' ? 'Más años' : 'Most years')} {window.Icon.chevronDown(10)}</button>
            )}
          </div>

          {empty ? (
            <EmptyState theme={theme} t={t} lang={lang} onRegister={() => onNav('register')} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: density === 'compact' ? 8 : 10 }}>
              {providers.map((p) => (
                <ProviderCard key={p.slug} theme={theme} t={t} lang={lang} p={p} density={density}
                  onClick={() => onNav('provider', { provider: p })}
                  onContact={onContact}
                />
              ))}
            </div>
          )}

          {/* Distritos vecinos / categorías relacionadas */}
          <div style={{ marginTop: 32, padding: isMobile ? 14 : 18, background: theme.surfaceAlt, border: `1px solid ${theme.rule}`, borderRadius: theme.radius }}>
            <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 8, fontWeight: 600 }}>
              {lang === 'es' ? `${cat.nombre} en distritos cercanos` : `${cat.en} in nearby districts`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.distritos.filter(d => d.slug !== 'vuelta-de-jorco').slice(0, 4).map((d) => (
                <button key={d.slug} style={{
                  fontSize: 12, padding: '6px 10px',
                  border: `1px solid ${theme.rule}`, borderRadius: theme.radius * 4,
                  color: theme.ink2, background: theme.surface, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>{cat.nombre} en {d.nombre}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROVIDER PROFILE
// ============================================================
function ProviderPage({ theme, t, lang, isMobile, p, onNav, onContact }) {
  const data = window.CR_DATA;
  const cat = data.categorias.find(c => c.slug === p.categoria);

  return (
    <div style={{ paddingBottom: isMobile ? 80 : 0 }}>
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.rule}`, padding: isMobile ? '12px 14px' : '12px 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Breadcrumbs theme={theme} onNav={onNav} items={[
            { label: t.home, go: 'home' },
            { label: data.cantonActual.nombre, go: 'canton' },
            { label: data.distritoActual.nombre, go: 'district' },
            { label: lang === 'es' ? cat.nombre : cat.en, go: 'category' },
            { label: p.nombre },
          ]} />
        </div>
      </div>

      <div style={{
        maxWidth: 1180, margin: '0 auto',
        padding: isMobile ? '18px 14px' : '28px 24px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
        gap: isMobile ? 20 : 32,
      }}>
        {/* Main */}
        <div>
          <div style={{ display: 'flex', gap: isMobile ? 12 : 18, marginBottom: 18, alignItems: isMobile ? 'flex-start' : 'center' }}>
            <div style={{ width: isMobile ? 80 : 110, height: isMobile ? 80 : 110, flexShrink: 0 }}>
              <div style={window.photoSwatch(p.foto, theme, { big: true })}>FOTO</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 4, fontWeight: 600 }}>
                {lang === 'es' ? cat.nombre : cat.en} · {data.cantonActual.nombre} · {data.distritoActual.nombre}
              </div>
              <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 600, margin: 0, letterSpacing: -0.5, lineHeight: 1.15, fontFamily: theme.fontDisplay || theme.font }}>{p.nombre}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 8 }}>
                {p.verificado && <VerifiedBadge theme={theme} size="md" />}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: theme.ink }}>
                  <span style={{ color: theme.star }}>{window.Icon.star(12)}</span>
                  <strong>{p.rating}</strong>
                  <span style={{ color: theme.ink3 }}>· {p.reseñas} {t.reseñas}</span>
                </span>
              </div>
            </div>
          </div>

          {/* About */}
          <div style={{ background: theme.surface, border: theme.cardBorder, borderRadius: theme.radius, padding: 16, marginBottom: 14, boxShadow: theme.shadow }}>
            <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 8, fontWeight: 600 }}>{t.acerca}</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: theme.ink }}>{p.desc}</p>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 0,
            border: theme.cardBorder,
            borderRadius: theme.radius,
            background: theme.surface,
            marginBottom: 14,
            overflow: 'hidden',
            boxShadow: theme.shadow,
          }}>
            {[
              [lang === 'es' ? `Años en ${p.cantonAtiende[0]}` : `Years in ${p.cantonAtiende[0]}`, p.años],
              [lang === 'es' ? 'Trabajos completados' : 'Completed jobs', p.trabajos],
              [lang === 'es' ? 'Calificación' : 'Rating', p.rating],
              [lang === 'es' ? 'Responde en' : 'Replies in', p.respuesta],
            ].map(([k, v], i) => (
              <div key={k} style={{
                padding: 14,
                borderRight: !isMobile && i < 3 ? `1px solid ${theme.ruleSoft}` : 'none',
                borderBottom: isMobile && i < 2 ? `1px solid ${theme.ruleSoft}` : 'none',
                borderRight: isMobile ? (i % 2 === 0 ? `1px solid ${theme.ruleSoft}` : 'none') : (i < 3 ? `1px solid ${theme.ruleSoft}` : 'none'),
              }}>
                <div style={{ fontSize: 10, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 4, fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.ink, letterSpacing: -0.4, fontFamily: theme.fontDisplay || theme.font }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Service area */}
          <div style={{ background: theme.surface, border: theme.cardBorder, borderRadius: theme.radius, padding: 16, marginBottom: 14, boxShadow: theme.shadow }}>
            <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 10, fontWeight: 600 }}>{t.areaServicio}</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: theme.ink3, marginBottom: 4 }}>{lang === 'es' ? 'Cantones que atiende' : 'Cantons served'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.cantonAtiende.map((c) => (
                  <span key={c} style={{ fontSize: 12, padding: '4px 10px', background: theme.brandSoft, color: theme.brand, borderRadius: theme.radius * 4, fontWeight: 600 }}>{c}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: theme.ink3, marginBottom: 4 }}>{lang === 'es' ? 'Distritos específicos' : 'Specific districts'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.distritosAtiende.map((d) => (
                  <span key={d} style={{ fontSize: 12, padding: '4px 10px', background: theme.surfaceAlt, color: theme.ink2, border: `1px solid ${theme.rule}`, borderRadius: theme.radius * 4 }}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: theme.surface, border: theme.cardBorder, borderRadius: theme.radius, padding: 16, boxShadow: theme.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, fontWeight: 600 }}>{t.reseñasTitulo} · {p.reseñas}</div>
              <button style={{ fontSize: 12, color: theme.brand, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{t.verTodas} →</button>
            </div>
            <ReviewPreview theme={theme} p={p} lang={lang} />
          </div>
        </div>

        {/* Side / contact */}
        <aside style={{ display: isMobile ? 'none' : 'block' }}>
          <div style={{
            background: theme.surface,
            border: `1.5px solid ${theme.ink}`,
            borderRadius: theme.radius,
            padding: 16,
            position: 'sticky',
            top: 88,
          }}>
            <div style={{ fontSize: 11, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 12, fontWeight: 600 }}>
              {lang === 'es' ? 'Contactar al proveedor' : 'Contact provider'}
            </div>
            <button onClick={() => onContact(p, 'wa')} style={{
              width: '100%', background: theme.wa, color: '#fff',
              border: 'none', padding: 14, fontSize: 14, fontWeight: 600,
              borderRadius: theme.radius, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8,
            }}>{window.Icon.wa(15)} {lang === 'es' ? 'Escribir por WhatsApp' : 'Message on WhatsApp'}</button>
            <button onClick={() => onContact(p, 'phone')} style={{
              width: '100%', background: theme.surface, color: theme.ink,
              border: `1.5px solid ${theme.ink}`, padding: 14, fontSize: 14, fontWeight: 600,
              borderRadius: theme.radius, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>{window.Icon.phone(14)} {p.tel}</button>
            <div style={{ borderTop: `1px solid ${theme.ruleSoft}`, marginTop: 14, paddingTop: 12, fontSize: 12, color: theme.ink2, lineHeight: 1.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{window.Icon.clock(11)} {lang === 'es' ? `Responde en ${p.respuesta}` : `Replies in ${p.respuesta}`}</div>
              {p.sinpe && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{window.Icon.check(11)} {lang === 'es' ? 'Acepta SINPE Móvil' : 'Accepts SINPE Móvil'}</div>}
              {p.finSemana && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{window.Icon.check(11)} {lang === 'es' ? 'Atiende fines de semana' : 'Open weekends'}</div>}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: theme.ink3, lineHeight: 1.5, paddingTop: 10, borderTop: `1px solid ${theme.ruleSoft}` }}>
              {lang === 'es' ? 'Identidad confirmada por DirectorioLocal el 14/03/2025.' : 'Identity confirmed by DirectorioLocal on 03/14/2025.'}
            </div>
          </div>
          <button style={{
            marginTop: 12, width: '100%', background: 'transparent', border: 'none',
            color: theme.ink3, fontSize: 11, fontFamily: theme.fontMono,
            letterSpacing: theme.metaSpacing, textTransform: theme.metaCase,
            cursor: 'pointer', padding: 8, fontWeight: 600,
          }}>{t.reportar}</button>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, CantonPage, DistrictPage, CategoryPage, ProviderPage });
