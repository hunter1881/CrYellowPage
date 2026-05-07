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
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        overflow: 'hidden',
        userSelect: 'none',
        background: theme.surface,
      }}>
        {['es', 'en'].map((l) => (
          <button
            key={l}
            onClick={() => onChange(l)}
            style={{
              background: lang === l ? theme.ink : 'transparent',
              color: lang === l ? '#fff' : theme.ink2,
              border: 'none',
              padding: '6px 12px',
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
  const s = size === 'sm' ? { p: '3px 8px', f: 11, ic: 11 } : { p: '5px 10px', f: 12, ic: 12 };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: theme.brandSoft,
      color: theme.brand,
      padding: s.p,
      borderRadius: 999,
      fontSize: s.f,
      fontFamily: theme.font,
      fontWeight: 600,
      letterSpacing: -0.1,
      whiteSpace: 'nowrap',
    }}>
      {window.Icon.shield(s.ic)}
      {showLabel && 'Verificado'}
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
            width: 32, height: 32,
            background: `linear-gradient(135deg, ${theme.brand}, ${theme.brandInk})`,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, letterSpacing: -0.5,
            borderRadius: theme.radius,
            fontFamily: theme.fontBody || theme.font,
            boxShadow: '0 2px 8px rgba(14,90,63,.25)',
          }}>DL</div>
          <div style={{
            fontSize: isMobile ? 16 : 17,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: -0.3,
            lineHeight: 1.1,
            fontFamily: theme.fontDisplay || theme.font,
          }}>El Contactico</div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onLocationOpen} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
          background: theme.surface, border: `1px solid ${theme.rule}`,
          borderRadius: theme.radiusLg, cursor: 'pointer', textAlign: 'left',
          color: theme.ink, fontFamily: 'inherit', fontSize: 13,
          boxShadow: theme.shadow,
        }}>
          <span style={{ color: theme.brand }}>{window.Icon.pin(15)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: theme.ink3, fontWeight: 500 }}>{t.ubicacion}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {distrito.nombre} · {canton.nombre}
            </div>
          </div>
          <span style={{ fontSize: 12, color: theme.brand, fontWeight: 600 }}>{t.cambiar}</span>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 6px 6px 14px',
          background: theme.surface,
          border: `1px solid ${theme.rule}`,
          borderRadius: theme.radiusLg,
          boxShadow: theme.shadowLg,
        }}>
          <span style={{ color: theme.ink3 }}>{window.Icon.search(16)}</span>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t.buscarPlaceholder}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 14, color: theme.ink, minWidth: 0,
              padding: '8px 0',
            }}
          />
          <button style={{
            background: theme.brand, color: '#fff', border: 'none',
            height: 36, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(14,90,63,.25)',
          }}>{window.Icon.search(13)}</button>
        </div>
      </div>
    );
  }

  // Desktop — grid horizontal
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr auto',
      border: `1px solid ${theme.rule}`,
      borderRadius: theme.radiusLg,
      overflow: 'hidden',
      background: theme.surface,
      boxShadow: theme.shadowLg,
    }}>
      <div style={{ padding: '14px 18px', borderRight: `1px solid ${theme.ruleSoft}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: theme.ink3 }}>{window.Icon.search(16)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.ink3, fontWeight: 500 }}>{lang === 'es' ? 'Servicio' : 'Service'}</div>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t.buscarPlaceholder}
            style={{ border: 'none', outline: 'none', fontSize: 14, color: theme.ink, fontFamily: 'inherit', width: '100%', padding: 0, marginTop: 2, background: 'transparent' }}
          />
        </div>
      </div>
      <button onClick={onLocationOpen} style={{ padding: '14px 18px', background: 'transparent', cursor: 'pointer', textAlign: 'left', border: 'none', borderRight: `1px solid ${theme.ruleSoft}` }}>
        <div style={{ fontSize: 11, color: theme.ink3, fontWeight: 500 }}>{t.canton}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, marginTop: 2 }}>{canton.nombre}, {canton.provincia}</div>
      </button>
      <button onClick={onLocationOpen} style={{ padding: '14px 18px', background: 'transparent', cursor: 'pointer', textAlign: 'left', border: 'none', borderRight: `1px solid ${theme.ruleSoft}` }}>
        <div style={{ fontSize: 11, color: theme.ink3, fontWeight: 500 }}>{t.distrito}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, marginTop: 2 }}>{distrito.nombre}</div>
      </button>
      <button style={{
        background: theme.brand, color: '#fff', border: 'none', padding: '0 32px',
        fontSize: 14, fontWeight: 600, letterSpacing: -0.2, cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>{window.Icon.search(14)} {lang === 'es' ? 'Buscar' : 'Search'}</button>
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
            <div style={{ fontSize: 12, color: theme.ink3, fontWeight: 500 }}>
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
          <div style={{ fontSize: 12, color: theme.ink3, fontWeight: 500, marginBottom: 10 }}>
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
              <span style={{ fontSize: 12, color: theme.ink3 }}>{d.proveedores} {t.proveedores}</span>
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
      fontSize: 13, color: theme.ink3,
      fontFamily: theme.font,
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
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: compact ? 10 : 16,
      padding: compact ? '14px' : '20px 18px 18px',
      background: hover ? theme.brand : theme.surface,
      border: theme.cardBorder,
      borderColor: hover ? theme.brand : theme.rule,
      borderRadius: theme.radiusLg,
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      transition: 'background .25s, border-color .25s, transform .25s',
      width: '100%',
      boxShadow: theme.shadow,
      transform: hover ? 'translateY(-2px)' : 'none',
      minHeight: compact ? 'auto' : 130,
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        width: compact ? 36 : 44, height: compact ? 36 : 44,
        background: hover ? 'rgba(255,255,255,.15)' : theme.brandSoft,
        color: hover ? '#fff' : theme.brand,
        borderRadius: theme.radius,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background .25s, color .25s',
      }}>
        {window.catIcon(cat.slug, compact ? 18 : 24)}
      </div>
      <div style={{ flex: 1, minWidth: 0, marginTop: compact ? 0 : 'auto' }}>
        <div style={{
          fontSize: compact ? 14.5 : 17,
          fontWeight: 600,
          color: hover ? '#fff' : theme.ink,
          letterSpacing: -0.3,
          transition: 'color .25s',
        }}>
          {lang === 'es' ? cat.nombre : cat.en}
        </div>
        <div style={{
          fontSize: 12.5,
          color: hover ? 'rgba(255,255,255,.7)' : theme.ink3,
          marginTop: 2,
          transition: 'color .25s',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          {cat.count} {lang === 'es' ? 'pros' : 'pros'}
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            opacity: hover ? 1 : 0, transform: hover ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'opacity .25s, transform .25s',
          }}>{window.Icon.arrow(11)}</span>
        </div>
      </div>
    </button>
  );
}

// ============================================================
// PROVIDER CARD
// ============================================================
function ProviderCard({ theme, t, lang, p, density = 'normal', onClick, onContact }) {
  const compact = density === 'compact';
  const photoSize = compact ? 56 : 88;

  return (
    <article style={{
      display: 'flex',
      gap: compact ? 12 : 16,
      padding: compact ? '12px' : '18px',
      background: theme.surface,
      border: theme.cardBorder,
      borderRadius: theme.radiusLg,
      boxShadow: theme.shadow,
      cursor: 'pointer',
      transition: 'box-shadow .2s, transform .2s, border-color .2s',
    }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = theme.shadowLg; e.currentTarget.style.borderColor = theme.brand + '40'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = theme.shadow; e.currentTarget.style.borderColor = theme.rule; }}
    >
      <div style={{ width: photoSize, height: photoSize, flexShrink: 0, borderRadius: theme.radius, overflow: 'hidden' }}>
        <div style={{ ...window.photoSwatch(p.foto, theme), borderRadius: theme.radius }}>FOTO</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <h3 style={{
            margin: 0,
            fontSize: compact ? 14 : 17,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: -0.3,
            fontFamily: theme.fontDisplay || theme.font,
          }}>{p.nombre}</h3>
          {p.verificado && <VerifiedBadge theme={theme} />}
        </div>
        {!compact && (
          <p style={{
            margin: 0,
            fontSize: 13.5,
            color: theme.ink2,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{p.desc}</p>
        )}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: compact ? 10 : 14,
          fontSize: 12.5, color: theme.ink3,
          fontFamily: theme.font,
          alignItems: 'center',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: theme.ink2 }}>
            <span style={{ color: theme.star }}>{window.Icon.star(12)}</span>
            <span style={{ fontWeight: 600, color: theme.ink }}>{p.rating}</span>
            <span>({p.reseñas})</span>
          </span>
          <span style={{ width: 3, height: 3, borderRadius: 2, background: theme.ink3, opacity: .4 }}></span>
          <span>{p.años} {lang === 'es' ? 'años en' : 'yrs in'} {p.cantonAtiende[0]}</span>
          {!compact && <>
            <span style={{ width: 3, height: 3, borderRadius: 2, background: theme.ink3, opacity: .4 }}></span>
            <span>{p.trabajos} {lang === 'es' ? 'trabajos' : 'jobs'}</span>
          </>}
          <span style={{ width: 3, height: 3, borderRadius: 2, background: theme.ink3, opacity: .4 }}></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{window.Icon.clock(11)} {p.respuesta}</span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
        alignSelf: 'center',
      }}>
        <button onClick={(e) => { e.stopPropagation(); onContact && onContact(p, 'wa'); }} style={{
          background: theme.wa, color: '#fff', border: 'none',
          padding: compact ? '8px 14px' : '10px 16px',
          fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
          borderRadius: 999, cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(22,163,74,.25)',
        }}>{window.Icon.wa(13)} WhatsApp</button>
        {!compact && (
          <button onClick={(e) => { e.stopPropagation(); onContact && onContact(p, 'phone'); }} style={{
            background: theme.surface, color: theme.ink2,
            border: `1px solid ${theme.rule}`,
            padding: '10px 16px',
            fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
            borderRadius: 999, cursor: 'pointer',
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
        <span style={{ fontSize: 12, color: theme.ink3 }}>{p.reseña.distrito}</span>
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
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: theme.ink, fontFamily: theme.fontDisplay || theme.font }}>El Contactico</div>
          <div style={{ fontSize: 12, color: theme.ink3, lineHeight: 1.5 }}>
            {lang === 'es' ? 'El directorio de servicios verificados de Costa Rica, organizado por cantón y distrito.' : 'Costa Rica\'s verified services directory, organized by canton and district.'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: theme.ink, fontWeight: 600, marginBottom: 12 }}>
            {lang === 'es' ? 'Directorio' : 'Directory'}
          </div>
          {['Cantones', 'Categorías', 'Distritos populares'].map((l) => (
            <div key={l} style={{ fontSize: 13, color: theme.ink2, padding: '3px 0', cursor: 'pointer' }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, color: theme.ink, fontWeight: 600, marginBottom: 12 }}>
            {lang === 'es' ? 'Para proveedores' : 'For providers'}
          </div>
          {[lang === 'es' ? 'Registrarme' : 'Register', 'FAQ', lang === 'es' ? 'Verificación' : 'Verification'].map((l) => (
            <div key={l} style={{ fontSize: 13, color: theme.ink2, padding: '3px 0', cursor: 'pointer' }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, color: theme.ink, fontWeight: 600, marginBottom: 12 }}>
            {lang === 'es' ? 'Legal' : 'Legal'}
          </div>
          {[lang === 'es' ? 'Términos' : 'Terms', lang === 'es' ? 'Privacidad' : 'Privacy', 'Reportar'].map((l) => (
            <div key={l} style={{ fontSize: 13, color: theme.ink2, padding: '3px 0', cursor: 'pointer' }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${theme.rule}`, marginTop: 24, paddingTop: 16, fontSize: 12, color: theme.ink3, display: 'flex', justifyContent: 'space-between' }}>
        <span>© 2026 El Contactico</span>
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
