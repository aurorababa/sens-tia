# SENS-TIA online study forms: setup (about 15 minutes)

Page address after upload: https://aurorababa.github.io/sens-tia/study/  (not linked from the public site, not indexed)

## 1. Database (Supabase)
1. Supabase > SQL Editor > New query. Paste the whole of `sql/02_study.sql`. Run. (Safe to run again.)
2. Choose a LONG researcher key (4 or more random words). In a new query run:
   `insert into public.study_config (id,key_hash) values (1, encode(sha256(convert_to('YOUR LONG KEY','utf8')),'hex')) on conflict (id) do update set key_hash = excluded.key_hash;`
   The key is stored only as a hash. You type it once on the tablet and once on your phone.
3. Check Project Settings > General that the region is in the EU (record it in document 10).

## 2. Photos (21: 5 route photos + 2 decoys per site)
1. In the SQL Editor run `sql/03_photo_key_21.sql` once (after 02_study.sql). It sets the key to 21 photos. Do this BEFORE editing the key, and not again after photo answers exist.
2. The real photos are already in `study/photos/p01.jpg … p21.jpg` (1600 × 900 px, location data removed). Only replace them if you change a photo, keeping the same name.
3. The key below matches the photos supplied:  p01–p05 Road route, p06–p10 Park route, p11–p15 Lakeside route, p16–p17 Road decoys, p18–p19 Park decoys, p20–p21 Lakeside decoys. If your photos are different, edit the table (Table Editor > study_photo_key: site and is_route per photo).
   Participants never see which is which. Photo order is random for each participant.

## 3. Upload
Unzip and upload the whole folder to GitHub as before (drag and drop). Open `/study/` and test with code T01.

## 4. On the day
- Tablet: open the page, enter the key once, type the participant code (S01–S12; T01… for tests). New code: confirm the suggested site order (S01/S05/S09 RPL, S02/S06/S10 RLP, S03/S07/S11 PLR, S04/S08/S12 LPR) and press Register.
- Follow the numbered list. The next step unlocks only after the previous one is saved. "Redo" replaces an entry (the old one is kept but ignored).
- Memory test at the end of the day: first the typed descriptions (you type what they say), then hand over the tablet for the photos.
- Session log (document 06 B): on your phone, open the same page, key, code, "Open log" for each walk.
- Top bar shows "All saved". With a poor connection items wait on the device and are sent automatically; do not clear the browser data until it says "All saved".

## 5. Getting the data into Excel
SQL Editor, run `select * from v_study_walks order by code, walk_no;`, then Download CSV. Same for `v_study_enrolment`, `v_study_memory`, `v_study_photos`, `v_study_status`. Test rows (T codes) have is_test = true; filter them out.
`v_study_walks` has before, after, differences and the researcher log side by side.

## Digit span (added)
The backward digit span is entered on the researcher's PHONE in the same study page, as a step after each before-walk and after-walk form. The page shows the digits and the correct answers, so never open it on the participant's tablet. After updating the files, run `sql/02_study.sql` again in the SQL Editor (it adds the new form types and re-creates the analysis views; your data stays). `v_study_walks` then has ds_pre_span, ds_pre_total, ds_post_span, ds_post_total and the differences.
