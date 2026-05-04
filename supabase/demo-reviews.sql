-- Demo reviews for the 3 seed providers in Vuelta de Jorco, Aserrí.
-- Run with: npx supabase db execute --linked -f supabase/demo-reviews.sql

insert into public.reviews (id, provider_id, author_name, rating, comment, created_at)
values
  -- Don Rafa Fontanería (301)
  (
    '00000000-0000-4000-9000-000000000101',
    '00000000-0000-4000-8000-000000000301',
    'Carlos Méndez',
    5,
    'Excelente trabajo, llegó puntual y resolvió la fuga en menos de una hora. Muy recomendado.',
    '2026-04-28 09:15:00+00'
  ),
  (
    '00000000-0000-4000-9000-000000000102',
    '00000000-0000-4000-8000-000000000301',
    'Adriana Solís',
    5,
    'Don Rafa es muy profesional. Nos cobró justo y dejó todo limpio. Ya lo llamaremos de nuevo.',
    '2026-04-20 14:30:00+00'
  ),
  (
    '00000000-0000-4000-9000-000000000103',
    '00000000-0000-4000-8000-000000000301',
    'Mauricio Vargas',
    4,
    'Buen servicio, aunque tardó un poco más de lo esperado. La calidad del trabajo fue muy buena.',
    '2026-04-10 11:00:00+00'
  ),

  -- Fontanería Emergencia 24 (302)
  (
    '00000000-0000-4000-9000-000000000201',
    '00000000-0000-4000-8000-000000000302',
    'Patricia Rojas',
    5,
    'A las 11 de la noche se reventó una tubería y llegaron en 40 minutos. Salvados. 100% recomendados.',
    '2026-04-25 23:45:00+00'
  ),
  (
    '00000000-0000-4000-9000-000000000202',
    '00000000-0000-4000-8000-000000000302',
    'Roberto Jiménez',
    5,
    'Rápidos y eficientes. El precio de emergencia es razonable comparado con otros. Muy buena atención.',
    '2026-04-18 08:20:00+00'
  ),
  (
    '00000000-0000-4000-9000-000000000203',
    '00000000-0000-4000-8000-000000000302',
    'Silvia Ureña',
    4,
    'Llegaron rápido y arreglaron el problema. Un poco caro pero la emergencia lo justifica.',
    '2026-04-05 16:10:00+00'
  ),

  -- Servicios Jorco (303)
  (
    '00000000-0000-4000-9000-000000000301',
    '00000000-0000-4000-8000-000000000303',
    'Diego Castro',
    5,
    'Instalaron el sistema completo de tuberías en mi casa nueva. Trabajo impecable, muy ordenados.',
    '2026-04-22 10:00:00+00'
  ),
  (
    '00000000-0000-4000-9000-000000000302',
    '00000000-0000-4000-8000-000000000303',
    'Fernanda Mora',
    5,
    'Muy buenos profesionales. Solucionaron un problema de presión de agua que teníamos hace años.',
    '2026-04-15 15:45:00+00'
  ),
  (
    '00000000-0000-4000-9000-000000000303',
    '00000000-0000-4000-8000-000000000303',
    'Álvaro Quesada',
    4,
    'Buena calidad de materiales y mano de obra. El presupuesto fue claro desde el inicio.',
    '2026-04-08 09:30:00+00'
  )
on conflict (id) do nothing;
