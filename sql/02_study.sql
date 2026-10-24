-- SENS-TIA online study forms: tables, functions and analysis views.
-- Run once in Supabase: SQL Editor > New query > paste this whole file > Run.
-- Then run the one-line key step at the bottom of this file (see STUDY_SETUP.md).
-- Generated from study/spec.js: if the forms change, regenerate this file and run it again (it is safe to re-run).

create table if not exists public.study_config (
  id int primary key default 1 check (id = 1),
  key_hash text not null
);

create table if not exists public.study_participants (
  code text primary key check (code ~ '^[ST][0-9]{2}$'),
  is_test boolean not null default false,
  site_order text not null check (site_order in ('RPL','RLP','PRL','PLR','LRP','LPR')),
  created_at timestamptz not null default now()
);

create table if not exists public.study_forms (
  id bigint generated always as identity primary key,
  client_id uuid not null unique,
  code text not null references public.study_participants(code) on delete cascade on update cascade,
  form_type text not null,
  walk_no smallint check (walk_no between 1 and 3),
  site text check (site in ('R','P','L')),
  lang text check (lang in ('en','sq')),
  started_at timestamptz,
  submitted_at timestamptz not null default now(),
  superseded boolean not null default false,
  answers jsonb not null
);
create unique index if not exists study_forms_current on public.study_forms (code, form_type, coalesce(walk_no, 0)) where not superseded;

-- Allowed form types (re-created on every run so older installs get the digit-span types too).
do $$ declare r record; begin
  for r in select conname from pg_constraint where conrelid = 'public.study_forms'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%form_type%' loop
    execute format('alter table public.study_forms drop constraint %I', r.conname);
  end loop;
  alter table public.study_forms add constraint study_forms_type_chk check (form_type in ('enrolment','before','after','ds_pre','ds_post','memory'));
  alter table public.study_forms add constraint study_forms_walk_chk check ((form_type in ('before','after','ds_pre','ds_post') and walk_no is not null) or (form_type in ('enrolment','memory') and walk_no is null));
end $$;

-- Which photo is a real route photo and which is a decoy. EDIT THE ROWS BELOW to match your real photos (Table Editor > study_photo_key).
create table if not exists public.study_photo_key (
  photo_id text primary key,
  site text not null check (site in ('R','P','L')),
  is_route boolean not null
);
insert into public.study_photo_key (photo_id, site, is_route) values
  ('p01','R',true),('p02','R',true),('p03','R',true),('p04','R',true),('p05','R',true),
  ('p06','P',true),('p07','P',true),('p08','P',true),('p09','P',true),('p10','P',true),
  ('p11','L',true),('p12','L',true),('p13','L',true),('p14','L',true),('p15','L',true),
  ('p16','R',false),('p17','R',false),('p18','P',false),('p19','P',false),('p20','L',false),('p21','L',false)
on conflict (photo_id) do nothing;

create table if not exists public.study_photo_answers (
  id bigint generated always as identity primary key,
  batch_id uuid not null,
  code text not null references public.study_participants(code) on delete cascade on update cascade,
  position smallint not null check (position between 1 and 60),
  photo_id text not null,
  answer text not null check (answer in ('passed','not_passed')),
  response_ms integer,
  lang text,
  submitted_at timestamptz not null default now(),
  superseded boolean not null default false,
  unique (batch_id, position)
);
create index if not exists study_photo_answers_code on public.study_photo_answers (code);

create table if not exists public.study_log (
  code text not null references public.study_participants(code) on delete cascade on update cascade,
  walk_no smallint not null check (walk_no between 1 and 3),
  site text check (site in ('R','P','L')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (code, walk_no)
);

-- Nobody can touch the tables directly with the public (anon) key. Only the functions below can, and only with the researcher key.
alter table public.study_config enable row level security;
alter table public.study_participants enable row level security;
alter table public.study_forms enable row level security;
alter table public.study_photo_key enable row level security;
alter table public.study_photo_answers enable row level security;
alter table public.study_log enable row level security;
revoke all on public.study_config, public.study_participants, public.study_forms, public.study_photo_key, public.study_photo_answers, public.study_log from anon, authenticated;

create or replace function public._study_auth(p_key text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_key is null or not exists (select 1 from public.study_config where key_hash = encode(sha256(convert_to(p_key, 'utf8')), 'hex')) then
    raise exception 'bad_key' using errcode = '28000';
  end if;
end $$;

create or replace function public.study_check_key(p_key text) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  return p_key is not null and exists (select 1 from public.study_config where key_hash = encode(sha256(convert_to(p_key, 'utf8')), 'hex'));
end $$;

create or replace function public._study_state(p_code text) returns jsonb
language sql security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'exists', true, 'code', p.code, 'is_test', p.is_test, 'order', p.site_order,
    'done', coalesce((
      select jsonb_agg(k order by k) from (
        select case when f.walk_no is null then f.form_type else f.form_type || ':' || f.walk_no end as k
          from public.study_forms f where f.code = p.code and not f.superseded
        union
        select 'photos' from public.study_photo_answers a where a.code = p.code and not a.superseded
      ) s), '[]'::jsonb),
    'log', coalesce((select jsonb_agg(l.walk_no order by l.walk_no) from public.study_log l where l.code = p.code), '[]'::jsonb)
  ) from public.study_participants p where p.code = p_code
$$;

-- Look up a participant code. With p_create = true it registers a NEW code (only when the researcher confirms).
create or replace function public.study_open(p_key text, p_code text, p_order text default null, p_create boolean default false) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare c text := upper(trim(coalesce(p_code, ''))); n int; ord text;
begin
  perform public._study_auth(p_key);
  if c !~ '^[ST][0-9]{2}$' or substr(c, 2)::int = 0 then raise exception 'bad_code' using errcode = '22023'; end if;
  if not exists (select 1 from public.study_participants where code = c) then
    n := substr(c, 2)::int;
    ord := (array['RPL','RLP','PLR','LPR'])[((n - 1) % 4) + 1];
    if not p_create then
      return jsonb_build_object('exists', false, 'code', c, 'suggested_order', ord);
    end if;
    if p_order is not null then
      if p_order not in ('RPL','RLP','PRL','PLR','LRP','LPR') then raise exception 'bad_order' using errcode = '22023'; end if;
      ord := p_order;
    end if;
    insert into public.study_participants (code, is_test, site_order) values (c, left(c, 1) = 'T', ord);
  end if;
  return public._study_state(c);
end $$;

create or replace function public.study_submit_form(p_key text, p jsonb) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare c text := upper(trim(coalesce(p->>'code', ''))); ft text := p->>'form_type'; wn smallint := nullif(p->>'walk_no', '')::smallint;
        cid uuid := (p->>'client_id')::uuid; st text := nullif(p->>'site', ''); lg text := nullif(p->>'lang', '');
begin
  perform public._study_auth(p_key);
  if not exists (select 1 from public.study_participants where code = c) then raise exception 'unknown_code' using errcode = '22023'; end if;
  if ft not in ('enrolment','before','after','ds_pre','ds_post','memory') then raise exception 'bad_form' using errcode = '22023'; end if;
  if (ft in ('before','after','ds_pre','ds_post') and (wn is null or wn not between 1 and 3)) or (ft in ('enrolment','memory') and wn is not null) then
    raise exception 'bad_walk' using errcode = '22023';
  end if;
  if jsonb_typeof(p->'answers') <> 'object' then raise exception 'bad_answers' using errcode = '22023'; end if;
  if exists (select 1 from public.study_forms where client_id = cid) then return jsonb_build_object('ok', true, 'duplicate', true); end if;
  update public.study_forms set superseded = true where code = c and form_type = ft and walk_no is not distinct from wn and not superseded;
  insert into public.study_forms (client_id, code, form_type, walk_no, site, lang, started_at, answers)
  values (cid, c, ft, wn, st, lg, nullif(p->>'started_at', '')::timestamptz, p->'answers');
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.study_submit_photos(p_key text, p jsonb) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare c text := upper(trim(coalesce(p->>'code', ''))); bid uuid := (p->>'batch_id')::uuid;
begin
  perform public._study_auth(p_key);
  if not exists (select 1 from public.study_participants where code = c) then raise exception 'unknown_code' using errcode = '22023'; end if;
  if jsonb_typeof(p->'answers') <> 'array' or jsonb_array_length(p->'answers') = 0 then raise exception 'bad_answers' using errcode = '22023'; end if;
  if exists (select 1 from public.study_photo_answers where batch_id = bid) then return jsonb_build_object('ok', true, 'duplicate', true); end if;
  update public.study_photo_answers set superseded = true where code = c and not superseded;
  insert into public.study_photo_answers (batch_id, code, position, photo_id, answer, response_ms, lang)
  select bid, c, (e->>'position')::smallint, e->>'photo_id', e->>'answer', nullif(e->>'response_ms', '')::int, nullif(p->>'lang', '')
  from jsonb_array_elements(p->'answers') e;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.study_save_log(p_key text, p jsonb) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare c text := upper(trim(coalesce(p->>'code', ''))); wn smallint := (p->>'walk_no')::smallint;
begin
  perform public._study_auth(p_key);
  if not exists (select 1 from public.study_participants where code = c) then raise exception 'unknown_code' using errcode = '22023'; end if;
  if wn is null or wn not between 1 and 3 or jsonb_typeof(p->'data') <> 'object' then raise exception 'bad_log' using errcode = '22023'; end if;
  insert into public.study_log (code, walk_no, site, data, updated_at) values (c, wn, nullif(p->>'site', ''), p->'data', now())
  on conflict (code, walk_no) do update set data = excluded.data, site = excluded.site, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.study_get_log(p_key text, p_code text, p_walk int) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public._study_auth(p_key);
  return (select data from public.study_log where code = upper(trim(coalesce(p_code, ''))) and walk_no = p_walk);
end $$;

revoke all on function public._study_auth(text), public._study_state(text) from public, anon, authenticated;
revoke all on function public.study_check_key(text), public.study_open(text, text, text, boolean), public.study_submit_form(text, jsonb),
  public.study_submit_photos(text, jsonb), public.study_save_log(text, jsonb), public.study_get_log(text, text, int) from public;
grant execute on function public.study_check_key(text), public.study_open(text, text, text, boolean), public.study_submit_form(text, jsonb),
  public.study_submit_photos(text, jsonb), public.study_save_log(text, jsonb), public.study_get_log(text, text, int) to anon, authenticated;

-- Views are re-created from scratch on every run (their column lists can change).
drop view if exists public.v_study_enrolment, public.v_study_walks, public.v_study_photos, public.v_study_memory, public.v_study_status;

-- One row per participant: enrolment answers + PSS-4 total (items 2 and 3 reversed, 0-16).
create or replace view public.v_study_enrolment with (security_invoker = true) as
select p.code, p.is_test, p.site_order, f.submitted_at, f.lang,
  nullif(f.answers->>'age', '')::numeric as age,
  nullif(f.answers->>'gender', '') as gender,
  nullif(f.answers->>'med_hrbp', '') as med_hrbp,
  nullif(f.answers->>'activity_days', '') as activity_days,
  nullif(f.answers->>'smoking', '') as smoking,
  nullif(f.answers->>'freq_R', '') as freq_r,
  nullif(f.answers->>'freq_P', '') as freq_p,
  nullif(f.answers->>'freq_L', '') as freq_l,
  nullif(f.answers->>'pss1', '')::numeric as pss1,
  nullif(f.answers->>'pss2', '')::numeric as pss2,
  nullif(f.answers->>'pss3', '')::numeric as pss3,
  nullif(f.answers->>'pss4', '')::numeric as pss4,
  nullif(f.answers->>'pss1', '')::numeric + (4 - nullif(f.answers->>'pss2', '')::numeric) + (4 - nullif(f.answers->>'pss3', '')::numeric) + nullif(f.answers->>'pss4', '')::numeric as pss4_total
from public.study_participants p
join public.study_forms f on f.code = p.code and f.form_type = 'enrolment' and not f.superseded;

-- One row per participant and walk: before form, after form and the researcher log side by side, with scores.
-- Derived: d_* = after minus before; pa/na = I-PANAS-SF sums (5-25); ros_mean (1-7); PRS-11 dimension means and total (0-10).
create or replace view public.v_study_walks with (security_invoker = true) as
with b as (select code, walk_no, site, submitted_at, answers from public.study_forms where form_type = 'before' and not superseded),
     a as (select code, walk_no, site, submitted_at, answers from public.study_forms where form_type = 'after' and not superseded),
     l as (select code, walk_no, site, updated_at, data from public.study_log),
     dp as (select code, walk_no, answers from public.study_forms where form_type = 'ds_pre' and not superseded),
     dq as (select code, walk_no, answers from public.study_forms where form_type = 'ds_post' and not superseded),
     k as (select code, walk_no from b union select code, walk_no from a union select code, walk_no from l union select code, walk_no from dp union select code, walk_no from dq)
select k.code, p.is_test, p.site_order, k.walk_no, coalesce(b.site, a.site, l.site) as site,
  b.submitted_at as before_at, a.submitted_at as after_at, l.updated_at as log_at,
  nullif(b.answers->>'stress', '')::numeric as b_stress,
  nullif(b.answers->>'calm', '')::numeric as b_calm,
  nullif(b.answers->>'mood_upset', '')::numeric as b_mood_upset,
  nullif(b.answers->>'mood_alert', '')::numeric as b_mood_alert,
  nullif(b.answers->>'mood_nervous', '')::numeric as b_mood_nervous,
  nullif(b.answers->>'mood_determined', '')::numeric as b_mood_determined,
  nullif(b.answers->>'mood_hostile', '')::numeric as b_mood_hostile,
  nullif(b.answers->>'mood_inspired', '')::numeric as b_mood_inspired,
  nullif(b.answers->>'mood_afraid', '')::numeric as b_mood_afraid,
  nullif(b.answers->>'mood_attentive', '')::numeric as b_mood_attentive,
  nullif(b.answers->>'mood_ashamed', '')::numeric as b_mood_ashamed,
  nullif(b.answers->>'mood_active', '')::numeric as b_mood_active,
  nullif(a.answers->>'stress', '')::numeric as a_stress,
  nullif(a.answers->>'calm', '')::numeric as a_calm,
  nullif(a.answers->>'mood_upset', '')::numeric as a_mood_upset,
  nullif(a.answers->>'mood_alert', '')::numeric as a_mood_alert,
  nullif(a.answers->>'mood_nervous', '')::numeric as a_mood_nervous,
  nullif(a.answers->>'mood_determined', '')::numeric as a_mood_determined,
  nullif(a.answers->>'mood_hostile', '')::numeric as a_mood_hostile,
  nullif(a.answers->>'mood_inspired', '')::numeric as a_mood_inspired,
  nullif(a.answers->>'mood_afraid', '')::numeric as a_mood_afraid,
  nullif(a.answers->>'mood_attentive', '')::numeric as a_mood_attentive,
  nullif(a.answers->>'mood_ashamed', '')::numeric as a_mood_ashamed,
  nullif(a.answers->>'mood_active', '')::numeric as a_mood_active,
  nullif(a.answers->>'ros1', '')::numeric as a_ros1,
  nullif(a.answers->>'ros2', '')::numeric as a_ros2,
  nullif(a.answers->>'ros3', '')::numeric as a_ros3,
  nullif(a.answers->>'ros4', '')::numeric as a_ros4,
  nullif(a.answers->>'ros5', '')::numeric as a_ros5,
  nullif(a.answers->>'ros6', '')::numeric as a_ros6,
  nullif(a.answers->>'prs1', '')::numeric as a_prs1,
  nullif(a.answers->>'prs2', '')::numeric as a_prs2,
  nullif(a.answers->>'prs3', '')::numeric as a_prs3,
  nullif(a.answers->>'prs4', '')::numeric as a_prs4,
  nullif(a.answers->>'prs5', '')::numeric as a_prs5,
  nullif(a.answers->>'prs6', '')::numeric as a_prs6,
  nullif(a.answers->>'prs7', '')::numeric as a_prs7,
  nullif(a.answers->>'prs8', '')::numeric as a_prs8,
  nullif(a.answers->>'prs9', '')::numeric as a_prs9,
  nullif(a.answers->>'prs10', '')::numeric as a_prs10,
  nullif(a.answers->>'prs11', '')::numeric as a_prs11,
  nullif(a.answers->>'sound', '')::numeric as a_sound,
  nullif(a.answers->>'safety', '')::numeric as a_safety,
  nullif(a.answers->>'incident', '') as a_incident,
  nullif(a.answers->>'stress', '')::numeric - nullif(b.answers->>'stress', '')::numeric as d_stress,
  nullif(a.answers->>'calm', '')::numeric - nullif(b.answers->>'calm', '')::numeric as d_calm,
  (nullif(b.answers->>'mood_alert', '')::numeric + nullif(b.answers->>'mood_inspired', '')::numeric + nullif(b.answers->>'mood_determined', '')::numeric + nullif(b.answers->>'mood_attentive', '')::numeric + nullif(b.answers->>'mood_active', '')::numeric) as b_pa,
  (nullif(b.answers->>'mood_upset', '')::numeric + nullif(b.answers->>'mood_hostile', '')::numeric + nullif(b.answers->>'mood_ashamed', '')::numeric + nullif(b.answers->>'mood_nervous', '')::numeric + nullif(b.answers->>'mood_afraid', '')::numeric) as b_na,
  (nullif(a.answers->>'mood_alert', '')::numeric + nullif(a.answers->>'mood_inspired', '')::numeric + nullif(a.answers->>'mood_determined', '')::numeric + nullif(a.answers->>'mood_attentive', '')::numeric + nullif(a.answers->>'mood_active', '')::numeric) as a_pa,
  (nullif(a.answers->>'mood_upset', '')::numeric + nullif(a.answers->>'mood_hostile', '')::numeric + nullif(a.answers->>'mood_ashamed', '')::numeric + nullif(a.answers->>'mood_nervous', '')::numeric + nullif(a.answers->>'mood_afraid', '')::numeric) as a_na,
  (nullif(a.answers->>'mood_alert', '')::numeric + nullif(a.answers->>'mood_inspired', '')::numeric + nullif(a.answers->>'mood_determined', '')::numeric + nullif(a.answers->>'mood_attentive', '')::numeric + nullif(a.answers->>'mood_active', '')::numeric) - (nullif(b.answers->>'mood_alert', '')::numeric + nullif(b.answers->>'mood_inspired', '')::numeric + nullif(b.answers->>'mood_determined', '')::numeric + nullif(b.answers->>'mood_attentive', '')::numeric + nullif(b.answers->>'mood_active', '')::numeric) as d_pa,
  (nullif(a.answers->>'mood_upset', '')::numeric + nullif(a.answers->>'mood_hostile', '')::numeric + nullif(a.answers->>'mood_ashamed', '')::numeric + nullif(a.answers->>'mood_nervous', '')::numeric + nullif(a.answers->>'mood_afraid', '')::numeric) - (nullif(b.answers->>'mood_upset', '')::numeric + nullif(b.answers->>'mood_hostile', '')::numeric + nullif(b.answers->>'mood_ashamed', '')::numeric + nullif(b.answers->>'mood_nervous', '')::numeric + nullif(b.answers->>'mood_afraid', '')::numeric) as d_na,
  (nullif(a.answers->>'ros1', '')::numeric + nullif(a.answers->>'ros2', '')::numeric + nullif(a.answers->>'ros3', '')::numeric + nullif(a.answers->>'ros4', '')::numeric + nullif(a.answers->>'ros5', '')::numeric + nullif(a.answers->>'ros6', '')::numeric) / 6.0 as ros_mean,
  (nullif(a.answers->>'prs1', '')::numeric + nullif(a.answers->>'prs2', '')::numeric + nullif(a.answers->>'prs3', '')::numeric) / 3.0 as prs_fascination,
  (nullif(a.answers->>'prs4', '')::numeric + nullif(a.answers->>'prs5', '')::numeric + nullif(a.answers->>'prs6', '')::numeric) / 3.0 as prs_being_away,
  (nullif(a.answers->>'prs7', '')::numeric + nullif(a.answers->>'prs8', '')::numeric + nullif(a.answers->>'prs9', '')::numeric) / 3.0 as prs_coherence,
  (nullif(a.answers->>'prs10', '')::numeric + nullif(a.answers->>'prs11', '')::numeric) / 2.0 as prs_scope,
  (nullif(a.answers->>'prs1', '')::numeric + nullif(a.answers->>'prs2', '')::numeric + nullif(a.answers->>'prs3', '')::numeric + nullif(a.answers->>'prs4', '')::numeric + nullif(a.answers->>'prs5', '')::numeric + nullif(a.answers->>'prs6', '')::numeric + nullif(a.answers->>'prs7', '')::numeric + nullif(a.answers->>'prs8', '')::numeric + nullif(a.answers->>'prs9', '')::numeric + nullif(a.answers->>'prs10', '')::numeric + nullif(a.answers->>'prs11', '')::numeric) / 11.0 as prs_total,
  dp.answers->>'list' as ds_pre_list, nullif(dp.answers->>'span', '')::numeric as ds_pre_span, nullif(dp.answers->>'total', '')::numeric as ds_pre_total,
  dq.answers->>'list' as ds_post_list, nullif(dq.answers->>'span', '')::numeric as ds_post_span, nullif(dq.answers->>'total', '')::numeric as ds_post_total,
  nullif(dq.answers->>'span', '')::numeric - nullif(dp.answers->>'span', '')::numeric as d_ds_span,
  nullif(dq.answers->>'total', '')::numeric - nullif(dp.answers->>'total', '')::numeric as d_ds_total,
  nullif(l.data->>'date', '') as l_date,
  nullif(l.data->>'researcher', '') as l_researcher,
  nullif(l.data->>'assistant', '') as l_assistant,
  nullif(l.data->>'temp_c', '')::numeric as l_temp_c,
  nullif(l.data->>'humidity', '')::numeric as l_humidity,
  nullif(l.data->>'precip', '') as l_precip,
  nullif(l.data->>'traffic', '') as l_traffic,
  nullif(l.data->>'station', '') as l_station,
  nullif(l.data->>'noise_events', '') as l_noise_events,
  nullif(l.data->>'caffeine', '') as l_caffeine,
  nullif(l.data->>'tobacco', '') as l_tobacco,
  nullif(l.data->>'exercise', '') as l_exercise,
  nullif(l.data->>'unwell', '') as l_unwell,
  nullif(l.data->>'sleep_h', '')::numeric as l_sleep_h,
  nullif(l.data->>'new_med', '') as l_new_med,
  nullif(l.data->>'strap_id', '') as l_strap_id,
  nullif(l.data->>'bp_id', '') as l_bp_id,
  nullif(l.data->>'oximeter_id', '') as l_oximeter_id,
  nullif(l.data->>'hrv_file', '') as l_hrv_file,
  nullif(l.data->>'strava', '') as l_strava,
  nullif(l.data->>'t_base_start', '') as l_t_base_start,
  nullif(l.data->>'t_base_end', '') as l_t_base_end,
  nullif(l.data->>'t_pre_end', '') as l_t_pre_end,
  nullif(l.data->>'t_walk_start', '') as l_t_walk_start,
  nullif(l.data->>'t_walk_end', '') as l_t_walk_end,
  nullif(l.data->>'t_rest_start', '') as l_t_rest_start,
  nullif(l.data->>'t_rest_end', '') as l_t_rest_end,
  nullif(l.data->>'t_post_end', '') as l_t_post_end,
  nullif(l.data->>'pre1_sbp', '')::numeric as l_pre1_sbp,
  nullif(l.data->>'pre1_dbp', '')::numeric as l_pre1_dbp,
  nullif(l.data->>'pre1_pulse', '')::numeric as l_pre1_pulse,
  nullif(l.data->>'pre1_spo2', '')::numeric as l_pre1_spo2,
  nullif(l.data->>'pre1_spo2_pulse', '')::numeric as l_pre1_spo2_pulse,
  nullif(l.data->>'pre2_sbp', '')::numeric as l_pre2_sbp,
  nullif(l.data->>'pre2_dbp', '')::numeric as l_pre2_dbp,
  nullif(l.data->>'pre2_pulse', '')::numeric as l_pre2_pulse,
  nullif(l.data->>'post1_sbp', '')::numeric as l_post1_sbp,
  nullif(l.data->>'post1_dbp', '')::numeric as l_post1_dbp,
  nullif(l.data->>'post1_pulse', '')::numeric as l_post1_pulse,
  nullif(l.data->>'post1_spo2', '')::numeric as l_post1_spo2,
  nullif(l.data->>'post1_spo2_pulse', '')::numeric as l_post1_spo2_pulse,
  nullif(l.data->>'post2_sbp', '')::numeric as l_post2_sbp,
  nullif(l.data->>'post2_dbp', '')::numeric as l_post2_dbp,
  nullif(l.data->>'post2_pulse', '')::numeric as l_post2_pulse,
  nullif(l.data->>'dropouts', '') as l_dropouts,
  nullif(l.data->>'gps_ok', '') as l_gps_ok,
  nullif(l.data->>'stopped_early', '') as l_stopped_early,
  nullif(l.data->>'stopped_reason', '') as l_stopped_reason,
  nullif(l.data->>'incident', '') as l_incident,
  nullif(l.data->>'exported', '') as l_exported,
  nullif(l.data->>'exported_time', '') as l_exported_time,
  nullif(l.data->>'notes', '') as l_notes,
  nullif(l.data->>'deviations', '') as l_deviations,
  nullif(l.data->>'initials', '') as l_initials
from k
join public.study_participants p on p.code = k.code
left join b on b.code = k.code and b.walk_no = k.walk_no
left join a on a.code = k.code and a.walk_no = k.walk_no
left join l on l.code = k.code and l.walk_no = k.walk_no
left join dp on dp.code = k.code and dp.walk_no = k.walk_no
left join dq on dq.code = k.code and dq.walk_no = k.walk_no
order by k.code, k.walk_no;

-- One row per photo shown: what was answered, whether it was a route photo, and whether the answer was correct.
create or replace view public.v_study_photos with (security_invoker = true) as
select a.code, p.is_test, a.position, a.photo_id, k.site, k.is_route, a.answer, a.response_ms,
  (a.answer = 'passed') = k.is_route as correct, a.submitted_at
from public.study_photo_answers a
join public.study_participants p on p.code = a.code
left join public.study_photo_key k on k.photo_id = a.photo_id
where not a.superseded
order by a.code, a.position;

-- One row per participant: recognition scores (hits on route photos, false alarms on decoys) and the typed descriptions.
create or replace view public.v_study_memory with (security_invoker = true) as
with s as (
  select a.code,
    count(*) filter (where k.is_route) as route_items,
    count(*) filter (where k.is_route and a.answer = 'passed') as hits,
    count(*) filter (where not k.is_route) as decoy_items,
    count(*) filter (where not k.is_route and a.answer = 'passed') as false_alarms,
    count(*) filter (where k.is_route and k.site = 'R' and a.answer = 'passed') as hits_road,
    count(*) filter (where k.is_route and k.site = 'P' and a.answer = 'passed') as hits_park,
    count(*) filter (where k.is_route and k.site = 'L' and a.answer = 'passed') as hits_lakeside,
    round(avg(a.response_ms)) as mean_response_ms
  from public.study_photo_answers a join public.study_photo_key k on k.photo_id = a.photo_id
  where not a.superseded group by a.code)
select p.code, p.is_test, p.site_order, s.route_items, s.hits, s.decoy_items, s.false_alarms, s.hits - s.false_alarms as hits_minus_fa,
  s.hits_road, s.hits_park, s.hits_lakeside, s.mean_response_ms,
  m.answers->>'free_w1' as free_walk1, m.answers->>'free_w2' as free_walk2, m.answers->>'free_w3' as free_walk3
from public.study_participants p
left join s on s.code = p.code
left join public.study_forms m on m.code = p.code and m.form_type = 'memory' and not m.superseded
where s.code is not null or m.code is not null
order by p.code;

-- Quick progress check: what has been saved for each registered participant.
create or replace view public.v_study_status with (security_invoker = true) as
select p.code, p.is_test, p.site_order, p.created_at,
  exists (select 1 from public.study_forms f where f.code = p.code and f.form_type = 'enrolment' and not f.superseded) as enrolment,
  (select count(*) from public.study_forms f where f.code = p.code and f.form_type = 'before' and not f.superseded) as before_forms,
  (select count(*) from public.study_forms f where f.code = p.code and f.form_type = 'after' and not f.superseded) as after_forms,
  (select count(*) from public.study_forms f where f.code = p.code and f.form_type = 'ds_pre' and not f.superseded) as digit_pre,
  (select count(*) from public.study_forms f where f.code = p.code and f.form_type = 'ds_post' and not f.superseded) as digit_post,
  exists (select 1 from public.study_forms f where f.code = p.code and f.form_type = 'memory' and not f.superseded) as memory_text,
  exists (select 1 from public.study_photo_answers a where a.code = p.code and not a.superseded) as photo_test,
  (select count(*) from public.study_log l where l.code = p.code) as log_walks
from public.study_participants p order by p.code;

revoke all on public.v_study_enrolment, public.v_study_walks, public.v_study_photos, public.v_study_memory, public.v_study_status from anon, authenticated;

-- ================= LAST STEP: set your researcher key =================
-- 1) Choose a long key (for example four random words, 20+ characters). Do NOT reuse a password.
-- 2) Replace REPLACE-WITH-YOUR-KEY below with it, select ONLY the next two lines and Run.
-- 3) Type the same key once on the study page. To change the key later, run the same lines with a new key.
--
-- insert into public.study_config (id, key_hash) values (1, encode(sha256(convert_to('REPLACE-WITH-YOUR-KEY', 'utf8')), 'hex'))
-- on conflict (id) do update set key_hash = excluded.key_hash;
