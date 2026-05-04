/**
 * Centralized UI translation dictionary — Spanish only.
 * Add all user-visible strings here — never hardcode text in components.
 *
 * Keys use dot-notation: 'section.item'
 */
export const ui = {
  // ─── Navigation ──────────────────────────────────────────────────────────
  'nav.cantons': 'Cantones',
  'nav.categories': 'Categorías',
  'nav.provider': 'Sos proveedor',
  'nav.account': 'Mi cuenta',
  'nav.changeLocation': 'Cambiar ubicación',

  // ─── Layout ──────────────────────────────────────────────────────────────
  'layout.tagline': 'Servicios verificados por cantón',
  'layout.isProvider': 'Sos proveedor',

  // ─── Mobile drawer ───────────────────────────────────────────────────────
  'mobile.menu': 'Menú',
  'mobile.home': 'Inicio',
  'mobile.language': 'Idioma',

  // ─── Common ──────────────────────────────────────────────────────────────
  'common.view': 'Ver',
  'common.search': 'Buscar',
  'common.find': 'Encontrar',
  'common.location': 'Ubicación',
  'common.call': 'Llamar',
  'common.register': 'Registrarme',
  'common.verified': 'Verificado',
  'common.pending': 'Pendiente',
  'common.providers': 'proveedores',
  'common.viewProviders': 'Ver proveedores',
  'common.selectDistrict': 'Seleccionar distrito',
  'common.optional': 'opcional',
  'common.seeAll': 'Ver todos →',
  'common.registerService': 'Registrá tu servicio',

  // ─── Location modal ───────────────────────────────────────────────────────
  'location.heading': '¿Dónde necesitás el servicio?',
  'location.meta': 'Cambiar ubicación',
  'location.viewDistrict': 'Ver distrito',

  // ─── District list ────────────────────────────────────────────────────────
  'district.listHeading': 'Distritos del cantón',
  'district.view': 'Ver',

  // ─── Category grid ────────────────────────────────────────────────────────
  'category.viewProviders': 'Ver proveedores',

  // ─── Empty state ─────────────────────────────────────────────────────────
  'empty.label': 'Sin resultados',
  'empty.defaultTitle': 'Aún no tenemos proveedores en esta categoría',
  'empty.defaultBody': 'Esta categoría todavía está creciendo. Si ofrece este servicio en la zona, puede registrar su negocio.',
  'empty.registerCta': 'Registrarme como proveedor',

  // ─── Filter panel ─────────────────────────────────────────────────────────
  'filter.heading': 'Filtros',
  'filter.sort': 'Ordenar',

  // ─── Provider card ────────────────────────────────────────────────────────
  'provider.defaultDescription': 'Proveedor local verificado disponible en este distrito.',
  'provider.yearsUnit': 'años',
  'provider.jobsUnit': 'trabajos',
  'provider.photo': 'Foto',

  // ─── Provider contact box ─────────────────────────────────────────────────
  'contact.heading': 'Contactar al proveedor',
  'contact.identityConfirmed': 'Identidad confirmada',
  'contact.servesArea': 'Atiende esta zona',
  'contact.acceptsSinpe': 'Acepta SINPE Móvil',
  'contact.worksWeekends': 'Atiende fines de semana',
  'contact.disclaimer': 'Identidad confirmada por DirectorioLocal. Verifique precio y disponibilidad directamente con el proveedor.',
  'contact.report': 'Reportar información',

  // ─── Sticky contact bar ───────────────────────────────────────────────────
  'sticky.call': 'Llamar',

  // ─── Provider signup card ─────────────────────────────────────────────────
  'signup.forProviders': 'Para proveedores',
  'signup.question': '¿Sos proveedor?',
  'signup.description': 'Registrá tu negocio para aparecer en búsquedas por cantón, distrito y categoría.',
  'signup.cta': 'Registrarme',

  // ─── Review preview ───────────────────────────────────────────────────────
  'reviews.seeAll': 'Ver todas',
  'reviews.placeholder': 'El módulo dinámico de reseñas usará Astro Server Islands cuando conectemos escrituras reales.',

  // ─── Registration form ────────────────────────────────────────────────────
  'form.applicationMeta': 'Solicitud de proveedor',
  'form.applicationTitle': 'Datos públicos y de contacto',
  'form.businessName': 'Nombre del negocio',
  'form.contactPerson': 'Persona de contacto',
  'form.phone': 'Teléfono',
  'form.district': 'Distrito donde atiende principalmente',
  'form.selectDistrict': 'Seleccione un distrito',
  'form.serviceCategories': 'Categorías de servicio',
  'form.serviceDescription': 'Descripción corta del servicio',
  'form.yearsActive': 'Años de experiencia',
  'form.acceptsSinpe': 'Acepta SINPE',
  'form.worksWeekends': 'Atiende fines de semana',
  'form.submit': 'Enviar solicitud',

  // ─── Home page ────────────────────────────────────────────────────────────
  'home.directory': 'Directorio de servicios de Costa Rica',
  'home.tagline': 'Encuentre servicios locales verificados por distrito',
  'home.description': 'Busque fontaneros, personal de limpieza, especialistas en reparaciones y otros proveedores por cantón, distrito y categoría.',
  'home.coverage': 'Cobertura por cantón y distrito',
  'home.whatsapp': 'Contacto directo por WhatsApp',
  'home.lastVerified': 'Últimos verificados',
  'home.seeAll': 'Ver todos →',
  'home.browseCanton': 'Explorar por cantón',
  'home.categoriesUnit': 'categorías',
  'home.cantonsUnit': 'cantones',

  // ─── Register provider page ───────────────────────────────────────────────
  'register.forProviders': 'Para proveedores',
  'register.title': 'Registrá tu servicio local',
  'register.process': 'Proceso',
  'register.step1': 'Enviás la solicitud.',
  'register.step2': 'Revisamos zona, categoría y contacto.',
  'register.step3': 'Publicamos el perfil cuando esté verificado.',
  'register.sent': 'Solicitud enviada',

  // ─── Search page ──────────────────────────────────────────────────────────
  'search.heading': 'Buscar',
  'search.minChars': 'Escribí al menos 2 caracteres para buscar.',
  'search.removeFilter': 'Quitar filtro',

  // ─── Account dashboard ────────────────────────────────────────────────────
  'account.meta': 'Panel de proveedor',
  'account.title': 'Mi cuenta',
  'account.signOut': 'Cerrar sesión',
  'account.publishedProfile': 'Tu perfil publicado',
  'account.editProfile': 'Editar perfil',
  'account.viewPublic': 'Ver página pública',
  'account.noProfile': 'Aún no tenés un perfil activo en el directorio.',
  'account.registerService': 'Registrá tu servicio',
  'account.applicationSent': 'Solicitud enviada',
  'account.underReview': 'En revisión',
  'account.approved': 'Aprobada',
  'account.rejected': 'Rechazada',
  'account.reviewNotice': 'Revisamos las solicitudes en 1–2 días hábiles.',

  // ─── Login page ───────────────────────────────────────────────────────────
  'login.meta': 'Panel de proveedor',
  'login.title': 'Accedé a tu cuenta',
  'login.subtitle': 'Te enviamos un enlace mágico al correo. Sin contraseña.',
  'login.checkEmail': '¡Revisá tu correo!',
  'login.emailLabel': 'Correo electrónico',
  'login.sendLink': 'Enviar enlace mágico',
  'login.noProfile': '¿Aún no tenés perfil? ',
  'login.registerService': 'Registrá tu servicio',

  // ─── Edit profile page ────────────────────────────────────────────────────
  'edit.myAccount': 'Mi cuenta',
  'edit.title': 'Editar perfil',
  'edit.saved': 'Cambios guardados.',
  'edit.phone': 'Teléfono',
  'edit.description': 'Descripción',
  'edit.descriptionHint': 'Máx. 500 caracteres.',
  'edit.yearsActive': 'Años de experiencia',
  'edit.responseTime': 'Tiempo de respuesta (min)',
  'edit.categories': 'Categorías (1–4)',
  'edit.options': 'Opciones',
  'edit.acceptsSinpe': 'Acepta SINPE Móvil',
  'edit.worksWeekends': 'Atiende fines de semana',
  'edit.save': 'Guardar cambios',
  'edit.cancel': 'Cancelar',

  // ─── Provider profile page ────────────────────────────────────────────────
  'profile.reviews': 'reseñas',
  'profile.about': 'Acerca del proveedor',
  'profile.serviceArea': 'Área de servicio',
  'profile.primaryLocation': 'Ubicación principal',
  'profile.listedServices': 'Servicios listados',
  'profile.jobs': 'Trabajos',
  'profile.rating': 'Calificación',
  'profile.repliesIn': 'Responde en',

  // ─── Footer ───────────────────────────────────────────────────────────────
  'footer.directory': 'Directorio',
  'footer.popularDistricts': 'Distritos populares',
  'footer.verification': 'Verificación',
  'footer.terms': 'Términos',
  'footer.privacy': 'Privacidad',
  'footer.report': 'Reportar',
  'footer.madeIn': 'Hecho en Costa Rica',

  // ─── Badge ────────────────────────────────────────────────────────────────
  'badge.verified': 'Verificado',
} as const

export type UiKey = keyof typeof ui

/**
 * Returns the Spanish string for the given key.
 * Use in .astro frontmatter and components.
 *
 * @example {t('home.tagline')}
 */
export function t(key: UiKey): string {
  return ui[key] as string
}

// English translations preserved for future URL-based i18n
// const uiEn = {
//   'nav.cantons': 'Cantons',
//   'nav.categories': 'Categories',
//   'nav.provider': 'Are you a provider?',
//   'nav.account': 'My account',
//   'nav.changeLocation': 'Change location',
//   'layout.tagline': 'Verified services by canton',
//   'layout.isProvider': 'Are you a provider?',
//   'mobile.menu': 'Menu',
//   'mobile.home': 'Home',
//   'mobile.language': 'Language',
//   'common.view': 'View',
//   'common.search': 'Search',
//   'common.find': 'Find',
//   'common.location': 'Location',
//   'common.call': 'Call',
//   'common.register': 'Register',
//   'common.verified': 'Verified',
//   'common.pending': 'Pending',
//   'common.providers': 'providers',
//   'common.viewProviders': 'View providers',
//   'common.selectDistrict': 'Select district',
//   'common.optional': 'optional',
//   'common.seeAll': 'See all →',
//   'common.registerService': 'Register your service',
//   'location.heading': 'Where do you need service?',
//   'location.meta': 'Change location',
//   'location.viewDistrict': 'View district',
//   'district.listHeading': 'Canton districts',
//   'district.view': 'View',
//   'category.viewProviders': 'View providers',
//   'empty.label': 'No results',
//   'empty.defaultTitle': 'No providers yet in this category',
//   'empty.defaultBody': 'This category is still growing. If you offer this service in the area, you can register your business.',
//   'empty.registerCta': 'Register as a provider',
//   'filter.heading': 'Filters',
//   'filter.sort': 'Sort',
//   'provider.defaultDescription': 'Verified local provider available in this district.',
//   'provider.yearsUnit': 'yrs',
//   'provider.jobsUnit': 'jobs',
//   'provider.photo': 'Photo',
//   'contact.heading': 'Contact provider',
//   'contact.identityConfirmed': 'Identity confirmed',
//   'contact.servesArea': 'Serves this area',
//   'contact.acceptsSinpe': 'Accepts SINPE Movil',
//   'contact.worksWeekends': 'Works weekends',
//   'contact.disclaimer': 'Identity confirmed by DirectorioLocal. Confirm price and availability directly with the provider.',
//   'contact.report': 'Report information',
//   'sticky.call': 'Call',
//   'signup.forProviders': 'For providers',
//   'signup.question': 'Are you a provider?',
//   'signup.description': 'Register your business to appear in searches by canton, district, and category.',
//   'signup.cta': 'Register',
//   'reviews.seeAll': 'See all',
//   'reviews.placeholder': 'The dynamic reviews module will use Astro Server Islands when real review writes are connected.',
//   'form.applicationMeta': 'Provider application',
//   'form.applicationTitle': 'Public and contact details',
//   'form.businessName': 'Business name',
//   'form.contactPerson': 'Contact person',
//   'form.phone': 'Phone',
//   'form.district': 'Main district served',
//   'form.selectDistrict': 'Select a district',
//   'form.serviceCategories': 'Service categories',
//   'form.serviceDescription': 'Short service description',
//   'form.yearsActive': 'Years active',
//   'form.acceptsSinpe': 'Accepts SINPE',
//   'form.worksWeekends': 'Works weekends',
//   'form.submit': 'Send application',
//   'home.directory': 'Costa Rica service directory',
//   'home.tagline': 'Find verified local services by district',
//   'home.description': 'Search plumbers, cleaners, repair specialists, and other providers by canton, district, and category.',
//   'home.coverage': 'Coverage by canton and district',
//   'home.whatsapp': 'Direct WhatsApp contact',
//   'home.lastVerified': 'Recently verified',
//   'home.seeAll': 'See all →',
//   'home.browseCanton': 'Browse by canton',
//   'home.categoriesUnit': 'categories',
//   'home.cantonsUnit': 'cantons',
//   'register.forProviders': 'For providers',
//   'register.title': 'Register your local service',
//   'register.process': 'Process',
//   'register.step1': 'You send the application.',
//   'register.step2': 'We review area, category, and contact details.',
//   'register.step3': 'We publish the profile once verified.',
//   'register.sent': 'Application sent',
//   'search.heading': 'Search',
//   'search.minChars': 'Type at least 2 characters to search.',
//   'search.removeFilter': 'Remove filter',
//   'account.meta': 'Provider panel',
//   'account.title': 'My account',
//   'account.signOut': 'Sign out',
//   'account.publishedProfile': 'Your published profile',
//   'account.editProfile': 'Edit profile',
//   'account.viewPublic': 'View public page',
//   'account.noProfile': "You don't have an active profile in the directory yet.",
//   'account.registerService': 'Register your service',
//   'account.applicationSent': 'Application sent',
//   'account.underReview': 'Under review',
//   'account.approved': 'Approved',
//   'account.rejected': 'Rejected',
//   'account.reviewNotice': 'We review applications within 1–2 business days.',
//   'login.meta': 'Provider panel',
//   'login.title': 'Sign in to your account',
//   'login.subtitle': "We'll send a magic link to your email. No password needed.",
//   'login.checkEmail': 'Check your email!',
//   'login.emailLabel': 'Email address',
//   'login.sendLink': 'Send magic link',
//   'login.noProfile': "Don't have a profile yet? ",
//   'login.registerService': 'Register your service',
//   'edit.myAccount': 'My account',
//   'edit.title': 'Edit profile',
//   'edit.saved': 'Changes saved.',
//   'edit.phone': 'Phone',
//   'edit.description': 'Description',
//   'edit.descriptionHint': 'Max. 500 characters.',
//   'edit.yearsActive': 'Years of experience',
//   'edit.responseTime': 'Response time (min)',
//   'edit.categories': 'Categories (1–4)',
//   'edit.options': 'Options',
//   'edit.acceptsSinpe': 'Accepts SINPE Móvil',
//   'edit.worksWeekends': 'Works weekends',
//   'edit.save': 'Save changes',
//   'edit.cancel': 'Cancel',
//   'profile.reviews': 'reviews',
//   'profile.about': 'About the provider',
//   'profile.serviceArea': 'Service area',
//   'profile.primaryLocation': 'Primary location',
//   'profile.listedServices': 'Listed services',
//   'profile.jobs': 'Jobs',
//   'profile.rating': 'Rating',
//   'profile.repliesIn': 'Replies in',
//   'footer.directory': 'Directory',
//   'footer.popularDistricts': 'Popular districts',
//   'footer.verification': 'Verification',
//   'footer.terms': 'Terms',
//   'footer.privacy': 'Privacy',
//   'footer.report': 'Report',
//   'footer.madeIn': 'Made in Costa Rica',
//   'badge.verified': 'Verified',
// }
