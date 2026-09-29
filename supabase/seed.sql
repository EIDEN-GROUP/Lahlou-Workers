-- Lahlou Workers — seed the 6 historical projects (mock data from the site).
-- Run once in Supabase Dashboard > SQL editor. Safe to re-run (skips titles
-- that already exist). Images must live in the public `project-images`
-- bucket under `seed/` (uploaded via scripts/upload-seed-images.mjs).

-- Bucket (public read for project photos)
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read project-images" on storage.objects;
create policy "public read project-images"
  on storage.objects for select
  using (bucket_id = 'project-images');

-- 1. Résidences MISSIMI
insert into public.projects (category, title, city, year, description, image, created_at)
select 'Résidentiel', 'Résidences MISSIMI', 'Agadir', '2025',
  'Ensemble résidentiel de standing livré clé en main, du gros œuvre aux finitions.',
  'https://wcuhjcrrzzsnkpcpmkri.supabase.co/storage/v1/object/public/project-images/seed/missimi.webp',
  '2025-06-01T00:00:00Z'
where not exists (select 1 from public.projects where title = 'Résidences MISSIMI');

-- 2. Immeuble R+5 en post-tension
insert into public.projects (category, title, city, year, description, image, created_at)
select 'Résidentiel', 'Immeuble R+5 en post-tension', 'Agadir', '2024',
  'Structure post-tension pilotée avec un suivi technique constant jusqu''à la livraison.',
  'https://wcuhjcrrzzsnkpcpmkri.supabase.co/storage/v1/object/public/project-images/seed/r-plus-5.webp',
  '2024-09-01T00:00:00Z'
where not exists (select 1 from public.projects where title = 'Immeuble R+5 en post-tension');

-- 3. Villa avec piscine
insert into public.projects (category, title, city, year, description, image, created_at)
select 'Résidentiel', '3 villas avec piscines', 'Agadir', '2024',
  'Villa individuelle avec piscine, finitions haut de gamme et équipe dédiée sur site.',
  'https://wcuhjcrrzzsnkpcpmkri.supabase.co/storage/v1/object/public/project-images/seed/villa.webp',
  '2024-06-01T00:00:00Z'
where not exists (select 1 from public.projects where title = '3 villas avec piscines');

-- 4. Infrastructure cimenterie
insert into public.projects (category, title, city, year, description, image, created_at)
select 'Industriel', 'Cimenterie de Tan-Tan', 'Tan-Tan', '2024',
  'Chantier industriel d''envergure mené en coordination avec les équipes techniques du client.',
  'https://wcuhjcrrzzsnkpcpmkri.supabase.co/storage/v1/object/public/project-images/seed/cimenterie.webp',
  '2024-03-01T00:00:00Z'
where not exists (select 1 from public.projects where title = 'Cimenterie de Tan-Tan');

-- 5. Rénovation siège administratif
insert into public.projects (category, title, city, year, description, image, created_at)
select 'Rénovation', 'Siège Lahlou Workers', 'Agadir', '2023',
  'Réhabilitation complète d''un siège administratif en activité, sans interruption d''exploitation.',
  'https://wcuhjcrrzzsnkpcpmkri.supabase.co/storage/v1/object/public/project-images/seed/renovation-siege.webp',
  '2023-09-01T00:00:00Z'
where not exists (select 1 from public.projects where title = 'Siège Lahlou Workers');

-- 6. Aménagement de bureaux
insert into public.projects (category, title, city, year, description, image, created_at)
select 'Commercial', 'Bureaux OROSAND INVEST', 'Agadir', '2023',
  'Aménagement d''espaces de bureaux, du second œuvre à la livraison des lots.',
  'https://wcuhjcrrzzsnkpcpmkri.supabase.co/storage/v1/object/public/project-images/seed/bureaux.webp',
  '2023-06-01T00:00:00Z'
where not exists (select 1 from public.projects where title = 'Bureaux OROSAND INVEST');

