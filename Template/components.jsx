// Componentes reutilizables — todos toman `theme` y `t` (i18n) como props
// Mobile-first: todos los componentes funcionan en pantallas chicas y se expanden.

const { useState, useEffect, useRef } = React;

// ============================================================
// LANGUAGE SWITCHER
// ============================================================
function LangSwitcher({ theme, lang, onChange, variant = 'inline' }) {
  if (variant === 'inline') {
    return (
      <div style={{
        display: 'inline-flex',
        border: `1px solid ${theme.rule}`,
        borderRadius: theme.radius,
        fontFamily: theme.fontMono,
        fontSize: 11,
        overflow: 'hidden',
        userSelect: 'none',
      }}>
        {['es', 'en'].map((l) => (
          <button
            key={l}
            onClick={() => onChange(l)}
            style={{
              background: lang === l ? theme.ink : 'transparent',
              color: lang === l ? '#fff' : theme.ink2,
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >{l}</button>
        ))}
      </div>
    );
  }
}

// ============================================================
// VERIFIED BADGE
// ============================================================
function VerifiedBadge({ theme, size = 'sm', showLabel = true }) {
  const s = size === 'sm' ? { p: '2px 6px', f: 10, ic: 10 } : { p: '4px 9px', f: 11, ic: 12 };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: theme.brandSoft,
      color: theme.brand,
      padding: s.p,
      borderRadius: theme.radius,
      fontSize: s.f,
      fontFamily: theme.fontMono,
      fontWeight: 600,
      letterSpacing: theme.metaSpacing,
      textTransform: theme.metaCase,
      whiteSpace: 'nowrap',
    }}>
      {window.Icon.shield(s.ic)}
      {showLabel && (theme.metaCase === 'uppercase' ? 'VERIFICADO' : 'Verificado')}
    </span>
  );
}

// ============================================================
// HEADER (mobile + desktop)
// ============================================================
function Header({ theme, t, lang, onLang, onNav, onMenuOpen, current, isMobile }) {
  return (
    <header style={{
      background: theme.surface,
      borderBottom: `1px solid ${theme.rule}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {!isMobile && (
        <div style={{
          background: theme.brandInk,
          color: 'rgba(255,255,255,.75)',
          fontSize: 11,
          padding: '4px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: theme.fontMono,
          letterSpacing: 0.3,
        }}>
          <span style={{ textTransform: theme.metaCase }}>{lang === 'es' ? 'Directorio Local · Costa Rica' : 'Local Directory · Costa Rica'}</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <a onClick={() => onNav('register')} style={{ color: 'inherit', cursor: 'pointer', textDecoration: 'none' }}>{t.registrarse}</a>
            <span>+506 0000-0000</span>
          </span>
        </div>
      )}
      <div style={{
        padding: isMobile ? '12px 14px' : '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        maxWidth: 1180,
        margin: '0 auto',
      }}>
        <a onClick={() => onNav('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: 30, height: 30,
            background: theme.brand,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, letterSpacing: -0.5,
            borderRadius: theme.radius,
            fontFamily: theme.fontBody || theme.font,
          }}>DL</div>
          <div>
            <div style={{
              fontSize: isMobile ? 15 : 16,
              fontWeight: 600,
              color: theme.ink,
              letterSpacing: -0.3,
              lineHeight: 1.1,
              fontFamily: theme.fontDisplay || theme.font,
            }}>DirectorioLocal<span style={{ color: theme.brand }}>.cr</span></div>
            {!isMobile && (
              <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginTop: 1 }}>
                {lang === 'es' ? 'Servicios verificados por cantón' : 'Verified services by canton'}
              </div>
            )}
          </div>
        </a>
        <div style={{ flex: 1 }} />
        {!isMobile && (
          <>
            <a onClick={() => onNav('canton')} style={{ fontSize: 13, color: current === 'canton' ? theme.brand : theme.ink2, textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}>{lang === 'es' ? 'Cantones' : 'Cantons'}</a>
            <a onClick={() => onNav('home')} style={{ fontSize: 13, color: theme.ink2, textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}>{lang === 'es' ? 'Categorías' : 'Categories'}</a>
            <a onClick={() => onNav('register')} style={{ fontSize: 13, color: theme.ink2, textDecoration: 'none', cursor: 'pointer', fontWeight: 500 }}>{t.registrarse}</a>
          </>
        )}
        <LangSwitcher theme={theme} lang={lang} onChange={onLang} />
        {isMobile && (
          <button onClick={onMenuOpen} aria-label="menu" style={{
            background: 'transparent', border: `1px solid ${theme.rule}`,
            borderRadius: theme.radius, padding: 6, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.ink,
          }}>{window.Icon.menu(18)}</button>
        )}
      </div>
    </header>
  );
}

// ============================================================
// MOBILE NAV DRAWER
// ============================================================
function MobileDrawer({ theme, t, open, onClose, onNav, lang, onLang }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,20,16,.5)', zIndex: 100,
      animation: 'fadein .15s',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(86vw, 340px)',
        background: theme.surface, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 4,
        animation: 'slidein .2s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Menú</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.ink2 }}>{window.Icon.close(18)}</button>
        </div>
        {[
          ['home', t.home],
          ['canton', lang === 'es' ? 'Cantones' : 'Cantons'],
          ['home', lang === 'es' ? 'Categorías' : 'Categories'],
          ['register', t.registrarse],
        ].map(([k, l], i) => (
          <button key={i} onClick={() => { onNav(k); onClose(); }} style={{
            background: 'transparent', border: 'none', textAlign: 'left',
            padding: '14px 4px', fontSize: 16, fontWeight: 500,
            borderBottom: `1px solid ${theme.ruleSoft}`, cursor: 'pointer',
            color: theme.ink, fontFamily: 'inherit',
          }}>{l}</button>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: theme.ink3 }}>Idioma</span>
          <LangSwitcher theme={theme} lang={lang} onChange={onLang} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SEARCH MODULE — combinado: query + canton + distrito
// ============================================================
function SearchModule({ theme, t, lang, canton, distrito, onLocationOpen, isMobile, compact }) {
  const [q, setQ] = useState('');

  if (isMobile || compact) {
    // Stacked vertical
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onLocationOpen} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
          background: theme.surface, border: `1px solid ${theme.rule}`,
          borderRadius: theme.radius, cursor: 'pointer', textAlign: 'left',
          color: theme.ink, fontFamily: 'inherit', fontSize: 13,
        }}>
          <span style={{ color: theme.brand }}>{window.Icon.pin(15)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase }}>{t.ubicacion}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {distrito.nombre} · {canton.nombre}
            </div>
          </div>
          <span style={{ fontSize: 11, color: theme.brand, fontFamily: theme.fontMono, fontWeight: 600, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase }}>{t.cambiar}</span>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px',
          background: theme.surface,
          border: `1.5px solid ${theme.ink}`,
          borderRadius: theme.radius,
        }}>
          <span style={{ color: theme.ink2 }}>{window.Icon.search(15)}</span>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t.buscarPlaceholder}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 14, color: theme.ink, minWidth: 0,
            }}
          />
          <button style={{
            background: theme.brand, color: '#fff', border: 'none',
            width: 32, height: 32, borderRadius: theme.radius, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{window.Icon.arrow(14)}</button>
        </div>
      </div>
    );
  }

  // Desktop — grid horizontal
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr auto',
      border: `1.5px solid ${theme.ink}`,
      borderRadius: theme.radius,
      overflow: 'hidden',
      background: theme.surface,
    }}>
      <div style={{ padding: '12px 16px', borderRight: `1px solid ${theme.rule}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: theme.ink3 }}>{window.Icon.search(16)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, fontWeight: 600 }}>{lang === 'es' ? 'Servicio' : 'Service'}</div>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t.buscarPlaceholder}
            style={{ border: 'none', outline: 'none', fontSize: 14, color: theme.ink, fontFamily: 'inherit', width: '100%', padding: 0, marginTop: 1, background: 'transparent' }}
          />
        </div>
      </div>
      <button onClick={onLocationOpen} style={{ padding: '12px 16px', borderRight: `1px solid ${theme.rule}`, background: 'transparent', cursor: 'pointer', textAlign: 'left', border: 'none', borderRight: `1px solid ${theme.rule}` }}>
        <div style={{ fontSize: 10, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, fontWeight: 600 }}>{t.canton}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, marginTop: 1 }}>{canton.nombre}, {canton.provincia}</div>
      </button>
      <button onClick={onLocationOpen} style={{ padding: '12px 16px', borderRight: `1px solid ${theme.rule}`, background: 'transparent', cursor: 'pointer', textAlign: 'left', border: 'none', borderRight: `1px solid ${theme.rule}` }}>
        <div style={{ fontSize: 10, fontFamily: theme.fontMono, color: theme.ink3, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, fontWeight: 600 }}>{t.distrito}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, marginTop: 1 }}>{distrito.nombre}</div>
      </button>
      <button style={{
        background: theme.brand, color: '#fff', border: 'none', padding: '0 28px',
        fontSize: 14, fontWeight: 600, letterSpacing: -0.2, cursor: 'pointer',
        fontFamily: 'inherit',
      }}>{lang === 'es' ? 'Buscar' : 'Search'}</button>
    </div>
  );
}

// ============================================================
// LOCATION MODAL — selector de cantón/distrito
// ============================================================
function LocationModal({ theme, t, open, onClose, lang }) {
  if (!open) return null;
  const data = window.CR_DATA;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,20,16,.55)', zIndex: 110,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: 0,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: theme.surface,
        width: '100%',
        maxWidth: 520,
        maxHeight: '85vh',
        borderRadius: `${theme.radiusLg * 2}px ${theme.radiusLg * 2}px 0 0`,
        padding: 20,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase }}>
              {lang === 'es' ? 'Cambiar ubicación' : 'Change location'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2, fontFamily: theme.fontDisplay || theme.font }}>
              {lang === 'es' ? '¿Dónde necesitás el servicio?' : 'Where do you need it?'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.ink2 }}>{window.Icon.close(18)}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1px solid ${theme.rule}`, borderRadius: theme.radius, marginBottom: 14 }}>
          <span style={{ color: theme.ink3 }}>{window.Icon.search(14)}</span>
          <input placeholder={lang === 'es' ? 'Buscar cantón o distrito…' : 'Search canton or district…'} style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent' }}/>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 8 }}>
            {lang === 'es' ? 'Cantón actual: Aserrí · San José' : 'Current canton: Aserrí · San José'}
          </div>
          {data.distritos.map((d) => (
            <button key={d.slug} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '12px 8px', background: 'transparent',
              border: 'none', borderBottom: `1px solid ${theme.ruleSoft}`,
              cursor: 'pointer', fontFamily: 'inherit',
              color: theme.ink, fontSize: 14, fontWeight: d.slug === 'vuelta-de-jorco' ? 600 : 400,
              textAlign: 'left',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {d.slug === 'vuelta-de-jorco' && <span style={{ color: theme.brand }}>{window.Icon.pin(13)}</span>}
                {d.nombre}
              </span>
              <span style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono }}>{d.proveedores} {t.proveedores}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BREADCRUMBS
// ============================================================
function Breadcrumbs({ theme, items, onNav }) {
  return (
    <nav aria-label="breadcrumbs" style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6,
      fontSize: 12, color: theme.ink3,
      fontFamily: theme.fontMono,
      letterSpacing: theme.metaSpacing,
      textTransform: theme.metaCase,
    }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ opacity: 0.5 }}>/</span>}
          {i < items.length - 1 ? (
            <a onClick={() => it.go && onNav(it.go)} style={{ color: theme.ink3, cursor: it.go ? 'pointer' : 'default', textDecoration: 'none' }}>{it.label}</a>
          ) : (
            <span style={{ color: theme.ink, fontWeight: 600 }}>{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============================================================
// CATEGORY CARD
// ============================================================
function CategoryCard({ theme, lang, cat, density = 'normal', onClick }) {
  const compact = density === 'compact';
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      flexDirection: compact ? 'row' : 'column',
      alignItems: compact ? 'center' : 'flex-start',
      gap: compact ? 12 : 14,
      padding: compact ? '12px 14px' : '18px 16px',
      background: theme.surface,
      border: theme.cardBorder,
      borderRadius: theme.radius,
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      transition: 'border-color .15s, transform .15s',
      width: '100%',
      boxShadow: theme.shadow,
    }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.brand}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.rule}
    >
      <div style={{
        width: compact ? 32 : 40, height: compact ? 32 : 40,
        background: theme.brandSoft, color: theme.brand,
        borderRadius: theme.radius,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {window.catIcon(cat.slug, compact ? 16 : 20)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 14 : 15, fontWeight: 600, color: theme.ink, letterSpacing: -0.1 }}>
          {lang === 'es' ? cat.nombre : cat.en}
        </div>
        <div style={{ fontSize: 11, color: theme.ink3, marginTop: 2, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase }}>
          {cat.count} {lang === 'es' ? 'proveedores' : 'providers'}
        </div>
      </div>
      {compact && <span style={{ color: theme.ink3 }}>{window.Icon.chevron(10)}</span>}
    </button>
  );
}

// ============================================================
// PROVIDER CARD
// ============================================================
function ProviderCard({ theme, t, lang, p, density = 'normal', onClick, onContact }) {
  const compact = density === 'compact';
  const photoSize = compact ? 56 : 80;

  return (
    <article style={{
      display: 'flex',
      gap: compact ? 12 : 14,
      padding: compact ? '12px' : '16px',
      background: theme.surface,
      border: theme.cardBorder,
      borderRadius: theme.radius,
      boxShadow: theme.shadow,
      cursor: 'pointer',
      transition: 'box-shadow .15s, border-color .15s',
    }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = theme.shadowLg; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = theme.shadow; }}
    >
      <div style={{ width: photoSize, height: photoSize, flexShrink: 0 }}>
        <div style={window.photoSwatch(p.foto, theme)}>FOTO</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <h3 style={{
            margin: 0,
            fontSize: compact ? 14 : 16,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: -0.2,
            fontFamily: theme.fontDisplay || theme.font,
          }}>{p.nombre}</h3>
          {p.verificado && <VerifiedBadge theme={theme} />}
        </div>
        {!compact && (
          <p style={{
            margin: 0,
            fontSize: 13,
            color: theme.ink2,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{p.desc}</p>
        )}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: compact ? 8 : 14,
          fontSize: 11, color: theme.ink3,
          fontFamily: theme.fontMono,
          letterSpacing: theme.metaSpacing,
          textTransform: theme.metaCase,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: theme.star }}>
            {window.Icon.star(11)}<span style={{ fontWeight: 600 }}>{p.rating}</span>
            <span style={{ color: theme.ink3 }}>({p.reseñas})</span>
          </span>
          <span>{p.años} {lang === 'es' ? 'años en' : 'yrs in'} {p.cantonAtiende[0]}</span>
          {!compact && <span>{p.trabajos} {lang === 'es' ? 'trabajos' : 'jobs'}</span>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{window.Icon.clock(10)} {p.respuesta}</span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
        alignSelf: compact ? 'center' : 'flex-end',
      }}>
        <button onClick={(e) => { e.stopPropagation(); onContact && onContact(p, 'wa'); }} style={{
          background: theme.wa, color: '#fff', border: 'none',
          padding: compact ? '8px 12px' : '10px 14px',
          fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
          borderRadius: theme.radius, cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}>{window.Icon.wa(12)} WhatsApp</button>
        {!compact && (
          <button onClick={(e) => { e.stopPropagation(); onContact && onContact(p, 'phone'); }} style={{
            background: theme.surface, color: theme.ink,
            border: `1px solid ${theme.rule}`,
            padding: '10px 14px',
            fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
            borderRadius: theme.radius, cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}>{window.Icon.phone(12)} {t.llamar}</button>
        )}
      </div>
    </article>
  );
}

// ============================================================
// CONTACT CTAs (sticky bottom on mobile)
// ============================================================
function StickyContact({ theme, t, p, isMobile, onContact }) {
  if (!isMobile) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: theme.surface,
      borderTop: `1px solid ${theme.rule}`,
      padding: '10px 14px',
      display: 'flex', gap: 8,
      zIndex: 30,
      boxShadow: '0 -2px 12px rgba(0,0,0,.06)',
    }}>
      <button onClick={() => onContact(p, 'wa')} style={{
        flex: 2, background: theme.wa, color: '#fff', border: 'none',
        padding: '12px', borderRadius: theme.radius, fontSize: 14, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>{window.Icon.wa(15)} WhatsApp</button>
      <button onClick={() => onContact(p, 'phone')} style={{
        flex: 1, background: theme.surface, color: theme.ink,
        border: `1.5px solid ${theme.ink}`, padding: '12px',
        borderRadius: theme.radius, fontSize: 14, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>{window.Icon.phone(14)} {t.llamar}</button>
    </div>
  );
}

// ============================================================
// FILTER CHIPS
// ============================================================
function FilterChips({ theme, t, filters, onToggle, lang }) {
  const opts = [
    { k: 'hoy', l: t.hoy },
    { k: 'verif', l: t.soloVerif },
    { k: 'sinpe', l: t.sinpe },
    { k: 'finde', l: t.finde },
    { k: 'mejores', l: t.mejores },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {opts.map((o) => {
        const on = filters[o.k];
        return (
          <button key={o.k} onClick={() => onToggle(o.k)} style={{
            padding: '6px 12px',
            border: `1px solid ${on ? theme.brand : theme.rule}`,
            background: on ? theme.brandSoft : theme.surface,
            color: on ? theme.brand : theme.ink2,
            borderRadius: theme.radius * 4,
            fontSize: 12, fontWeight: on ? 600 : 500,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap',
          }}>
            {on && window.Icon.check(11)}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ theme, t, lang, onRegister }) {
  return (
    <div style={{
      background: theme.surface,
      border: `1px dashed ${theme.rule}`,
      borderRadius: theme.radius,
      padding: '36px 24px',
      textAlign: 'center',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      <div style={{
        width: 48, height: 48,
        margin: '0 auto 14px',
        background: theme.brandSoft,
        color: theme.brand,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{window.Icon.pin(20)}</div>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: theme.ink, letterSpacing: -0.2, fontFamily: theme.fontDisplay || theme.font }}>{t.vacioTitulo}</h3>
      <p style={{ margin: '8px 0 18px', fontSize: 14, color: theme.ink2, lineHeight: 1.5 }}>{t.vacioTexto}</p>
      <button onClick={onRegister} style={{
        background: theme.brand, color: '#fff',
        border: 'none', padding: '12px 20px',
        fontSize: 14, fontWeight: 600,
        borderRadius: theme.radius, cursor: 'pointer',
        fontFamily: 'inherit',
      }}>{t.registrarme}</button>
    </div>
  );
}

// ============================================================
// REVIEW PREVIEW
// ============================================================
function ReviewPreview({ theme, p, lang }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>{p.reseña.autor}</span>
        <span style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase }}>{p.reseña.distrito}</span>
      </div>
      <div style={{ display: 'flex', gap: 1, color: theme.star, marginBottom: 8 }}>
        {[1,2,3,4,5].map((i) => <span key={i}>{window.Icon.star(12)}</span>)}
      </div>
      <p style={{ margin: 0, fontSize: 14, color: theme.ink2, lineHeight: 1.55, fontStyle: 'italic' }}>"{p.reseña.texto}"</p>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer({ theme, lang }) {
  return (
    <footer style={{
      background: theme.surfaceAlt,
      borderTop: `1px solid ${theme.rule}`,
      padding: '24px 20px',
      marginTop: 40,
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: theme.ink, fontFamily: theme.fontDisplay || theme.font }}>DirectorioLocal.cr</div>
          <div style={{ fontSize: 12, color: theme.ink3, lineHeight: 1.5 }}>
            {lang === 'es' ? 'El directorio de servicios verificados de Costa Rica, organizado por cantón y distrito.' : 'Costa Rica\'s verified services directory, organized by canton and district.'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 8 }}>
            {lang === 'es' ? 'Directorio' : 'Directory'}
          </div>
          {['Cantones', 'Categorías', 'Distritos populares'].map((l) => (
            <div key={l} style={{ fontSize: 13, color: theme.ink2, padding: '3px 0', cursor: 'pointer' }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 8 }}>
            {lang === 'es' ? 'Para proveedores' : 'For providers'}
          </div>
          {[lang === 'es' ? 'Registrarme' : 'Register', 'FAQ', lang === 'es' ? 'Verificación' : 'Verification'].map((l) => (
            <div key={l} style={{ fontSize: 13, color: theme.ink2, padding: '3px 0', cursor: 'pointer' }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, letterSpacing: theme.metaSpacing, textTransform: theme.metaCase, marginBottom: 8 }}>
            {lang === 'es' ? 'Legal' : 'Legal'}
          </div>
          {[lang === 'es' ? 'Términos' : 'Terms', lang === 'es' ? 'Privacidad' : 'Privacy', 'Reportar'].map((l) => (
            <div key={l} style={{ fontSize: 13, color: theme.ink2, padding: '3px 0', cursor: 'pointer' }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${theme.rule}`, marginTop: 20, paddingTop: 14, fontSize: 11, color: theme.ink3, fontFamily: theme.fontMono, display: 'flex', justifyContent: 'space-between' }}>
        <span>© 2026 DirectorioLocal.cr</span>
        <span>{lang === 'es' ? 'Hecho en Costa Rica 🇨🇷' : 'Made in Costa Rica 🇨🇷'}</span>
      </div>
    </footer>
  );
}

Object.assign(window, {
  LangSwitcher, VerifiedBadge, Header, MobileDrawer, SearchModule, LocationModal,
  Breadcrumbs, CategoryCard, ProviderCard, StickyContact, FilterChips,
  EmptyState, ReviewPreview, Footer,
});
