-- SENS-TIA screening database. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Region: choose EU (Frankfurt) when creating the project.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  email text primary key
);

create table if not exists public.screening (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  outcome       text not null check (outcome in ('eligible','not_eligible')),
  consent_version text not null,
  -- the following are stored ONLY when outcome = 'eligible'
  full_name     text,
  email         text,
  phone         text,
  language      text check (language in ('sq','en')),
  time_pref     text check (time_pref in ('morning','midday','afternoon')),
  smoker        boolean,
  availability  text,
  -- admin workflow
  status        text not null default 'new' check (status in ('new','contacted','info_sent','consented','enrolled','declined','withdrawn')),
  participant_code text,
  notes         text
);

alter table public.admins    enable row level security;
alter table public.screening enable row level security;

-- Nobody can read or write tables directly except signed-in admins.
revoke all on public.screening from anon;
revoke all on public.admins    from anon;
-- Needed when 'Automatically expose new tables' is switched OFF (recommended).
-- Row Level Security below still limits these to the listed admin emails.
grant select, insert, update, delete on public.screening to authenticated;
grant select on public.admins to authenticated;

drop policy if exists admin_all_screening on public.screening;
create policy admin_all_screening on public.screening
  for all to authenticated
  using      ((auth.jwt() ->> 'email') in (select email from public.admins))
  with check ((auth.jwt() ->> 'email') in (select email from public.admins));

drop policy if exists admin_read_admins on public.admins;
create policy admin_read_admins on public.admins
  for select to authenticated
  using ((auth.jwt() ->> 'email') in (select email from public.admins));

-- Public entry point: the web form calls ONLY this function.
-- It decides eligibility on the server, stores no health answers, and keeps
-- contact details only for eligible people.
create or replace function public.submit_screening(p jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  a    jsonb := p -> 'answers';
  ok   boolean;
  i    int;
  v    text;
  outc text;
  em   text := nullif(trim(p ->> 'email'), '');
  ph   text := nullif(trim(p ->> 'phone'), '');
  nm   text := nullif(trim(p ->> 'name'), '');
begin
  -- spam trap and basic rate limit
  if coalesce(p ->> 'website', '') <> '' then return 'not_eligible'; end if;
  if (select count(*) from public.screening where created_at > now() - interval '1 minute') > 30 then
    raise exception 'Too many submissions, try again later';
  end if;
  if coalesce(p ->> 'consent', '') <> 'true' then raise exception 'Consent to screening is required'; end if;
  if a is null then raise exception 'Answers missing'; end if;

  -- items 1-3 must be "yes", items 4-10 must be "no"
  ok := true;
  for i in 1..10 loop
    v := a ->> ('q' || i);
    if v is null or v not in ('yes','no') then raise exception 'Answer % missing', i; end if;
    if i <= 3 and v <> 'yes' then ok := false; end if;
    if i >= 4 and v <> 'no'  then ok := false; end if;
  end loop;
  outc := case when ok then 'eligible' else 'not_eligible' end;

  if ok then
    if nm is null or (em is null and ph is null) then raise exception 'Name and a contact are required'; end if;
    insert into public.screening(outcome, consent_version, full_name, email, phone, language, time_pref, smoker, availability)
    values (outc, coalesce(p ->> 'consent_version','v0.1'), left(nm,120), left(em,160), left(ph,40),
            nullif(p ->> 'language',''), nullif(p ->> 'time_pref',''),
            case p ->> 'smoker' when 'yes' then true when 'no' then false else null end,
            left(p ->> 'availability', 400));
  else
    insert into public.screening(outcome, consent_version) values (outc, coalesce(p ->> 'consent_version','v0.1'));
  end if;
  return outc;
end;
$$;

revoke all on function public.submit_screening(jsonb) from public;
grant execute on function public.submit_screening(jsonb) to anon, authenticated;

-- After running this file, add yourself (and the assistant) as admins:
-- insert into public.admins(email) values ('your@email.com');
