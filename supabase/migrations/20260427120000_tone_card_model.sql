-- Tone Card model: genre_tags, description + mix_notes, tone_favorites, EQ/context fields, updated_at, search_vector refresh.
-- Assumes existing `tones` per docs/PHASE_3 + PHASE_4 (tags, notes, favorite, search_vector optional).

drop index if exists public.tones_search_idx;
alter table if exists public.tones drop column if exists search_vector;

create table if not exists public.tone_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  tone_id uuid not null references public.tones (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tone_id)
);

insert into public.tone_favorites (user_id, tone_id)
select t.user_id, t.id
from public.tones t
where coalesce(t.favorite, false) = true
  and t.user_id is not null
on conflict do nothing;

alter table public.tones add column if not exists description text;
alter table public.tones add column if not exists mix_notes text;

update public.tones
set mix_notes = notes
where notes is not null
  and btrim(notes) <> ''
  and (mix_notes is null or btrim(coalesce(mix_notes, '')) = '');

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tones'
      and column_name = 'tags'
  ) then
    alter table public.tones rename column tags to genre_tags;
  end if;
end $$;

alter table public.tones drop column if exists notes;
alter table public.tones drop column if exists favorite;

alter table public.tones add column if not exists amp_model text;
alter table public.tones add column if not exists gain double precision;
alter table public.tones add column if not exists bass double precision;
alter table public.tones add column if not exists mid double precision;
alter table public.tones add column if not exists treble double precision;
alter table public.tones add column if not exists presence double precision;
alter table public.tones add column if not exists tuning text;
alter table public.tones add column if not exists guitar_type text;
alter table public.tones add column if not exists pickup_position text;
alter table public.tones add column if not exists play_style text;
alter table public.tones add column if not exists tightness double precision;
alter table public.tones add column if not exists clarity double precision;
alter table public.tones add column if not exists noise_level double precision;

alter table public.tones add column if not exists updated_at timestamptz not null default now();

update public.tones set updated_at = coalesce(updated_at, created_at, now()) where true;

create or replace function public.tones_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tones_set_updated_at on public.tones;
create trigger tones_set_updated_at
  before update on public.tones
  for each row
  execute function public.tones_set_updated_at();

alter table public.tones add column search_vector tsvector
  generated always as (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(mix_notes, '') || ' ' ||
      coalesce(amp_model, '') || ' ' ||
      array_to_string(coalesce(genre_tags, '{}'), ' ')
    )
  ) stored;

create index tones_search_idx on public.tones using gin (search_vector);

alter table public.tone_favorites enable row level security;

create policy "tone_favorites_select_own"
  on public.tone_favorites for select
  using (auth.uid() = user_id);

create policy "tone_favorites_insert_own"
  on public.tone_favorites for insert
  with check (auth.uid() = user_id);

create policy "tone_favorites_delete_own"
  on public.tone_favorites for delete
  using (auth.uid() = user_id);
