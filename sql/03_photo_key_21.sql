-- One-off: set the photo key to the 21-photo design (5 route photos + 2 decoys per site).
-- Run once after 02_study.sql, BEFORE you edit the key to match your real photos.
-- WARNING: this resets the whole key and refuses to run if photo answers already exist.
do $$ begin
  if exists (select 1 from public.study_photo_answers) then raise exception 'photo answers exist; edit study_photo_key by hand instead'; end if;
end $$;
delete from public.study_photo_key;
insert into public.study_photo_key (photo_id, site, is_route) values
  ('p01','R',true),('p02','R',true),('p03','R',true),('p04','R',true),('p05','R',true),
  ('p06','P',true),('p07','P',true),('p08','P',true),('p09','P',true),('p10','P',true),
  ('p11','L',true),('p12','L',true),('p13','L',true),('p14','L',true),('p15','L',true),
  ('p16','R',false),('p17','R',false),('p18','P',false),('p19','P',false),('p20','L',false),('p21','L',false);
