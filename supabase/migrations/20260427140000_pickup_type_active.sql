-- Split "active" from pickup family: coil style + optional active electronics.
alter table public.tones
  add column if not exists active_pickups boolean not null default false;

-- Legacy rows that used guitar_type = 'active' → humbucker + active (common case; users can fix in editor).
update public.tones
set
  active_pickups = true,
  guitar_type = 'humbucker'
where guitar_type = 'active';
