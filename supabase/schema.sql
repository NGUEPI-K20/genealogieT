-- ─────────────────────────────────────────────────────────────────────────────
-- Schéma Supabase — Famille Nguepi, Arbre Généalogique
--
-- À exécuter une seule fois dans le dashboard Supabase du projet :
--   Dashboard → SQL Editor → New query → coller ce fichier → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Table: persons ───────────────────────────────────────────────────────────

create table if not exists public.persons (
  id             text primary key,
  first_name     text not null,
  last_name      text not null,
  birth_name     text,
  birth_year     integer not null,
  death_year     integer,
  birth_place    text,
  current_place  text,
  generation     integer not null check (generation between 1 and 5),
  gender         text check (gender in ('M', 'F')),
  profession     text,
  marital_status text,
  bio            text,
  photo_url      text,
  color          text not null,
  initials       text not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── Table: relations ─────────────────────────────────────────────────────────

create table if not exists public.relations (
  id            text primary key,
  person_a_id   text not null references public.persons(id) on delete cascade,
  person_b_id   text not null references public.persons(id) on delete cascade,
  type          text not null check (type in ('parent', 'union')),
  since_year    integer,
  created_at    timestamptz not null default now()
);

create index if not exists relations_person_a_idx on public.relations(person_a_id);
create index if not exists relations_person_b_idx on public.relations(person_b_id);

-- ─── Trigger : mise à jour automatique de updated_at ─────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;

drop trigger if exists persons_set_updated_at on public.persons;
create trigger persons_set_updated_at
  before update on public.persons
  for each row
  execute function public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Lecture publique (le site vitrine n'a pas de login) ; écriture réservée aux
-- utilisateurs authentifiés (l'unique compte admin créé dans Supabase Auth).

alter table public.persons enable row level security;
alter table public.relations enable row level security;

drop policy if exists "Public read persons" on public.persons;
create policy "Public read persons"
  on public.persons for select
  using (true);

drop policy if exists "Authenticated write persons" on public.persons;
create policy "Authenticated write persons"
  on public.persons for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public read relations" on public.relations;
create policy "Public read relations"
  on public.relations for select
  using (true);

drop policy if exists "Authenticated write relations" on public.relations;
create policy "Authenticated write relations"
  on public.relations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── Storage : bucket pour les photos ─────────────────────────────────────────
-- Bucket public : les fichiers restent accessibles par leur URL publique sans
-- policy SELECT (Supabase sert les objets publics directement). On évite donc
-- une policy SELECT large qui permettrait de lister tous les fichiers du bucket.
-- Écriture réservée aux utilisateurs authentifiés.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated write photos" on storage.objects;
create policy "Authenticated write photos"
  on storage.objects for all
  using (bucket_id = 'photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');
