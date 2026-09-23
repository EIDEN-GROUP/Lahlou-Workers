-- Lahlou Workers — demo submissions (fake data, clearly marked).
-- Run in Supabase Dashboard > SQL editor AFTER supabase/seed.sql.
-- Safe to re-run (every block skips rows that already exist).
-- Purpose: fill the admin dashboard (contacts, devis, candidatures) so you
-- can preview lists, charts and email notifications.
-- DELETE these rows before going live (they are not real submissions).

-- ── Demo contacts ──
insert into public.contacts (name, phone, email, message, created_at)
select 'Yasmine El Fassi', '+212 661 234 567', 'yasmine.elfassi@example.com',
  'Bonjour, je suis promoteur à Agadir et je cherche une équipe de coffreurs pour un immeuble R+4 à Hay Essalam. Démarrage prévu en octobre. Merci de me recontacter.',
  '2026-09-20T10:00:00Z'
where not exists (select 1 from public.contacts where email = 'yasmine.elfassi@example.com');

insert into public.contacts (name, phone, email, message, created_at)
select 'Mehdi Bennani', '+212 662 345 678', 'mehdi.bennani@example.com',
  'Nous rénovons nos bureaux à Casablanca (200 m²) et cherchons des peintres et carreleurs. Délai serré, réponse rapide appréciée.',
  '2026-09-18T15:30:00Z'
where not exists (select 1 from public.contacts where email = 'mehdi.bennani@example.com');

-- ── Demo devis ──
insert into public.devis (need, city, surface, start_date, duration, trades, crew_size, name, company, phone, email, channel, created_at)
select 'Équipe seule', 'Agadir', '450', '2026-10-01', '4 mois',
  array['Maçons', 'Coffreurs', 'Ferrailleurs'], 12,
  'Karim Tazi', 'SARL Tazi Construction', '+212 663 456 789', 'karim.tazi@example.com', 'WhatsApp',
  '2026-09-19T09:00:00Z'
where not exists (select 1 from public.devis where email = 'karim.tazi@example.com');

insert into public.devis (need, city, surface, start_date, duration, trades, crew_size, name, company, phone, email, channel, created_at)
select 'Rénovation', 'Casablanca', '120', '2026-11-15', '6 semaines',
  array['Peintres', 'Carreleurs', 'Plombiers'], 5,
  'Salma Idrissi', '', '+212 664 567 890', 'salma.idrissi@example.com', 'Appel',
  '2026-09-17T14:00:00Z'
where not exists (select 1 from public.devis where email = 'salma.idrissi@example.com');

-- ── Demo candidatures ──
insert into public.recruits (name, trade, experience, city, phone, created_at)
select 'Hassan Ouazzani', 'Maçon', 8, 'Agadir', '+212 665 678 901', '2026-09-20T08:00:00Z'
where not exists (select 1 from public.recruits where phone = '+212 665 678 901');

insert into public.recruits (name, trade, experience, city, phone, created_at)
select 'Fatima Zahra Amrani', 'Peintre', 5, 'Inezgane', '+212 666 789 012', '2026-09-19T11:00:00Z'
where not exists (select 1 from public.recruits where phone = '+212 666 789 012');

insert into public.recruits (name, trade, experience, city, phone, created_at)
select 'Omar Benali', 'Électricien', 6, 'Taroudant', '+212 667 890 123', '2026-09-16T16:00:00Z'
where not exists (select 1 from public.recruits where phone = '+212 667 890 123');

-- ── Cleanup (run before going live) ──
-- delete from public.contacts where email like '%@example.com';
-- delete from public.devis where email like '%@example.com';
-- delete from public.recruits where phone in ('+212 665 678 901', '+212 666 789 012', '+212 667 890 123');
