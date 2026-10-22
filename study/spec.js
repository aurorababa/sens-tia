/* SENS-TIA online study forms: ONE source of truth for the page and for the database views.
   Wording follows document 04 (Questionnaire Booklet). Albanian = draft, needs native review.
   Works in the browser (window.SPEC) and in Node (module.exports) so the SQL views are generated from the same list. */
(function (root) {
  "use strict";
  function L(en, sq) { return { en: en, sq: sq }; }

  var SITES = { R: L("Road corridor", "Korridori rrugor"), P: L("Park", "Parku"), L: L("Lakeside path", "Shtegu buzë liqenit") };
  var ORDERS = ["RPL", "RLP", "PLR", "LPR"];            // suggested orders: road first or last, park and lakeside together
  var ALL_ORDERS = ["RPL", "RLP", "PRL", "PLR", "LRP", "LPR"];

  var MOOD_MODULE = true;                                 // I-PANAS-SF (optional module in document 04). Set false to remove it from both forms.

  /* ---------- option sets ---------- */
  var YN4 = [
    { v: "yes", t: L("Yes", "Po") }, { v: "no", t: L("No", "Jo") },
    { v: "not_sure", t: L("Not sure", "Nuk jam i/e sigurt") }, { v: "prefer_not", t: L("Prefer not to say", "Parapëlqej të mos them") }
  ];
  var FREQ = [
    { v: "never", t: L("Never", "Asnjëherë") }, { v: "few_year", t: L("A few times a year", "Disa herë në vit") },
    { v: "monthly", t: L("Monthly", "Çdo muaj") }, { v: "weekly", t: L("Weekly", "Çdo javë") },
    { v: "daily", t: L("Daily or almost daily", "Çdo ditë ose pothuajse çdo ditë") }
  ];
  var PSS_OPTS = [
    { v: 0, t: L("Never", "Asnjëherë") }, { v: 1, t: L("Almost never", "Pothuajse asnjëherë") },
    { v: 2, t: L("Sometimes", "Ndonjëherë") }, { v: 3, t: L("Fairly often", "Mjaft shpesh") }, { v: 4, t: L("Very often", "Shumë shpesh")}
  ];
  var MOOD_OPTS = [
    { v: 1, t: L("Very slightly or not at all", "Aspak ose shumë pak") }, { v: 2, t: L("A little", "Pak") },
    { v: 3, t: L("Moderately", "Mesatarisht") }, { v: 4, t: L("Quite a bit", "Mjaft") }, { v: 5, t: L("Extremely", "Jashtëzakonisht") }
  ];

  /* ---------- helpers that build field lists ---------- */
  function scale(id, label, min, max, lo, hi, extra) {
    var f = { id: id, type: "scale", min: min, max: max, label: label, lo: lo, hi: hi };
    if (extra) for (var k in extra) f[k] = extra[k];
    return f;
  }
  function choice(id, label, options, extra) {
    var f = { id: id, type: "choice", label: label, options: options };
    if (extra) for (var k in extra) f[k] = extra[k];
    return f;
  }
  function items(prefix, list, make) { return list.map(function (x, i) { return make(prefix + (i + 1), x, i); }); }

  var STRESS = scale("stress", L("How stressed do you feel right now?", "Sa i/e stresuar ndiheni tani?"), 0, 10,
    L("0 = not at all stressed", "0 = aspak i/e stresuar"), L("10 = extremely stressed", "10 = jashtëzakonisht i/e stresuar"));
  var CALM = scale("calm", L("How calm do you feel right now?", "Sa i/e qetë ndiheni tani?"), 0, 10,
    L("0 = not at all calm", "0 = aspak i/e qetë"), L("10 = extremely calm", "10 = jashtëzakonisht i/e qetë"));

  var MOOD_ITEMS = [
    ["upset", "Upset", "I/E mërzitur"], ["alert", "Alert", "I/E zgjuar (në gatishmëri)"], ["nervous", "Nervous", "Nervoz/e"],
    ["determined", "Determined", "I/E vendosur"], ["hostile", "Hostile", "Armiqësor/e"], ["inspired", "Inspired", "I/E frymëzuar"],
    ["afraid", "Afraid", "I/E frikësuar"], ["attentive", "Attentive", "I/E përqendruar"], ["ashamed", "Ashamed", "I/E turpëruar"], ["active", "Active", "Aktiv/e"]
  ];
  function moodSection() {
    return {
      title: L("Mood right now", "Humori tani"),
      intro: L("To what extent do you feel each of the following RIGHT NOW?", "Deri në çfarë mase ndiheni TANI në secilën nga mënyrat e mëposhtme?"),
      fields: MOOD_ITEMS.map(function (m) { return choice("mood_" + m[0], L(m[1], m[2]), MOOD_OPTS, { numeric: true, layout: "row", compact: true }); })
    };
  }

  var ROS = [
    ["I feel calmer after being here", "Ndihem më i qetë/e qetë pasi kam qenë këtu"],
    ["After visiting this place I always feel restored and relaxed", "Pasi vizitoj këtë vend ndihem gjithmonë i çlodhur/e çlodhur dhe i relaksuar/e relaksuar"],
    ["I get new enthusiasm and energy for my everyday routines from here", "Këtu marr entuziazëm dhe energji të re për rutinën time të përditshme"],
    ["My concentration and alertness clearly increase here", "Përqendrimi dhe vëmendja ime rriten dukshëm këtu"],
    ["I can forget everyday worries here", "Këtu mund t’i harroj shqetësimet e përditshme"],
    ["Visiting here is a way of clearing and clarifying my thoughts", "Të qenit këtu është një mënyrë për të pastruar dhe qartësuar mendimet e mia"]
  ];
  // Pasini et al. (2014), Appendix A, in the order printed there. SQ = draft forward translation.
  var PRS = [
    ["Places like that are fascinating", "Vende të tilla janë magjepsëse"],
    ["In places like this my attention is drawn to many interesting things", "Në vende si ky vëmendja ime tërhiqet nga shumë gjëra interesante"],
    ["In places like this it is hard to be bored", "Në vende si ky është e vështirë të mërzitesh"],
    ["Places like that are a refuge from nuisances", "Vende të tilla janë një strehë nga bezdisjet"],
    ["To get away from things that usually demand my attention I like to go to places like this", "Për t’u larguar nga gjërat që zakonisht kërkojnë vëmendjen time, më pëlqen të shkoj në vende si ky"],
    ["To stop thinking about the things that I must get done I like to go to places like this", "Për të reshtur së menduari për gjërat që duhet t’i bëj, më pëlqen të shkoj në vende si ky"],
    ["There is a clear order in the physical arrangement of places like this", "Në vende si ky ka një rregull të qartë në renditjen fizike të gjërave"],
    ["In places like this it is easy to see how things are organised", "Në vende si ky është e lehtë të shihet se si janë organizuar gjërat"],
    ["In places like this everything seems to have its proper place", "Në vende si ky gjithçka duket se është në vendin e vet"],
    ["That place is large enough to allow exploration in many directions", "Ai vend është mjaft i gjerë për të lejuar eksplorim në shumë drejtime"],
    ["In places like that there are few boundaries to limit my possibility for moving about", "Në vende si ai ka pak kufij që e kufizojnë mundësinë time për t’u lëvizur"]
  ];

  var FORMS = {};

  FORMS.enrol = {
    form_type: "enrolment",
    title: L("Enrolment questionnaire", "Pyetësori i regjistrimit"),
    intro: L("Please answer every question. Your answers are linked only to your participant code.", "Ju lutemi përgjigjuni të gjitha pyetjeve. Përgjigjet tuaja lidhen vetëm me kodin tuaj të pjesëmarrësit."),
    sections: [
      { title: L("About you", "Rreth jush"), fields: [
        { id: "age", type: "number", min: 18, max: 100, label: L("Age (years)", "Mosha (vjeç)") },
        choice("gender", L("Gender", "Gjinia"), [
          { v: "woman", t: L("Woman", "Grua") }, { v: "man", t: L("Man", "Burrë") },
          { v: "another", t: L("Another description", "Përshkrim tjetër") }, { v: "prefer_not", t: L("Prefer not to say", "Parapëlqej të mos them") }])
      ] },
      { title: L("Health and habits", "Shëndeti dhe zakonet"),
        intro: L("These questions help us interpret heart rate and blood pressure. Your answers are linked only to your participant code.",
                 "Këto pyetje na ndihmojnë të interpretojmë rrahjet e zemrës dhe tensionin e gjakut. Përgjigjet lidhen vetëm me kodin tuaj të pjesëmarrësit."),
        fields: [
          choice("med_hrbp", L("Do you regularly take any medication that can affect your heart rate or blood pressure?", "A merrni rregullisht ndonjë ilaç që mund të ndikojë në rrahjet e zemrës ose në tensionin e gjakut?"), YN4),
          choice("activity_days", L("On how many days in a typical week do you do physical activity that makes you breathe harder (for example brisk walking, running, cycling or sport)?",
                                    "Sa ditë në një javë tipike bëni aktivitet fizik që ju bën të merrni frymë më shpejt (p.sh. ecje e shpejtë, vrapim, çiklizëm ose sport)?"),
            [{ v: "0", t: L("0", "0") }, { v: "1-2", t: L("1–2", "1–2") }, { v: "3-4", t: L("3–4", "3–4") }, { v: "5+", t: L("5 or more", "5 ose më shumë") }], { layout: "row" }),
          choice("smoking", L("Do you smoke or vape?", "A pini duhan ose përdorni cigare elektronike?"), [
            { v: "never", t: L("No, never", "Jo, kurrë") }, { v: "former", t: L("Used to, not now", "Kam pirë, tani jo") },
            { v: "occasional", t: L("Occasionally", "Herë pas here") }, { v: "daily", t: L("Every day", "Çdo ditë") }], { layout: "row" })
        ] },
      { title: L("How often do you usually spend time in each of these places?", "Sa shpesh kaloni zakonisht kohë në secilin nga këto vende?"), fields: [
        choice("freq_R", L("Road corridor (Rruga e Kavajës / Unaza e Re)", "Korridori rrugor (Rruga e Kavajës / Unaza e Re)"), FREQ, { layout: "row" }),
        choice("freq_P", L("Park (Parku i Madh)", "Parku (Parku i Madh)"), FREQ, { layout: "row" }),
        choice("freq_L", L("Lakeside path (Liqeni Artificial)", "Shtegu buzë liqenit (Liqeni Artificial)"), FREQ, { layout: "row" })
      ] },
      { title: L("Stress over the last month", "Stresi gjatë muajit të fundit"),
        intro: L("The questions below ask about your feelings and thoughts during the last month. For each one, tick how often you felt or thought that way.",
                 "Pyetjet e mëposhtme ju pyesin për ndjenjat dhe mendimet tuaja gjatë muajit të fundit. Për secilën, shënoni sa shpesh keni ndier ose menduar në atë mënyrë."),
        fields: [
          choice("pss1", L("In the last month, how often have you felt that you were unable to control the important things in your life?", "Gjatë muajit të fundit, sa shpesh keni ndier se nuk mund t’i kontrolloni gjërat e rëndësishme në jetën tuaj?"), PSS_OPTS, { numeric: true, layout: "row" }),
          choice("pss2", L("In the last month, how often have you felt confident about your ability to handle your personal problems?", "Gjatë muajit të fundit, sa shpesh jeni ndier i/e sigurt në aftësinë tuaj për të përballuar problemet personale?"), PSS_OPTS, { numeric: true, layout: "row" }),
          choice("pss3", L("In the last month, how often have you felt that things were going your way?", "Gjatë muajit të fundit, sa shpesh keni ndier se gjërat po shkonin sipas dëshirës suaj?"), PSS_OPTS, { numeric: true, layout: "row" }),
          choice("pss4", L("In the last month, how often have you felt that difficulties were piling up so high that you could not overcome them?", "Gjatë muajit të fundit, sa shpesh keni ndier se vështirësitë po grumbulloheshin aq shumë sa nuk mund t’i kapërceni?"), PSS_OPTS, { numeric: true, layout: "row" })
        ] }
    ]
  };

  var NOW_INTRO = L("Please answer about how you feel RIGHT NOW. Choose one answer for each line.", "Ju lutemi përgjigjuni për atë si ndiheni TANI. Zgjidhni një përgjigje për çdo rresht.");

  FORMS.before = {
    form_type: "before",
    title: L("Before the walk", "Para ecjes"),
    intro: NOW_INTRO,
    sections: [{ title: null, fields: [STRESS, CALM] }].concat(MOOD_MODULE ? [moodSection()] : [])
  };

  FORMS.after = {
    form_type: "after",
    title: L("After the walk", "Pas ecjes"),
    intro: NOW_INTRO,
    sections: [
      { title: null, fields: [STRESS, CALM] }
    ].concat(MOOD_MODULE ? [moodSection()] : []).concat([
      { title: L("How you feel after being in this place (ROS-6)", "Si ndiheni pas qëndrimit në këtë vend (ROS-6)"),
        intro: L("Please think about the walk you have just taken. For each statement, choose the number that fits best (1 = not at all, 7 = totally).",
                 "Mendoni për ecjen që sapo bëtë. Për secilin pohim, zgjidhni numrin që përshtatet më mirë (1 = aspak, 7 = plotësisht)."),
        fields: items("ros", ROS, function (id, x) { return scale(id, L(x[0], x[1]), 1, 7, L("1 = not at all", "1 = aspak"), L("7 = totally", "7 = plotësisht"), { compact: true }); }) },
      { title: L("How you experienced this place (PRS-11)", "Si e përjetuat këtë vend (PRS-11)"),
        intro: L("How much does each statement apply to your experience of this place? Choose one number from 0 to 10 for each statement.",
                 "Sa i vlen secili pohim për përvojën tuaj në këtë vend? Zgjidhni një numër nga 0 në 10 për secilin pohim."),
        note: L("0 = not at all · 6 = rather much · 10 = completely", "0 = aspak · 6 = mjaft · 10 = plotësisht"),
        fields: items("prs", PRS, function (id, x) { return scale(id, L(x[0], x[1]), 0, 10, L("0 = not at all", "0 = aspak"), L("10 = completely", "10 = plotësisht"), { compact: true }); }) },
      { title: null, fields: [
        scale("sound", L("How pleasant did the sounds in this place feel?", "Sa të këndshme ishin tingujt në këtë vend?"), 0, 10, L("0 = very unpleasant", "0 = shumë të pakëndshme"), L("10 = very pleasant", "10 = shumë të këndshme")),
        scale("safety", L("How safe did you feel in this place?", "Sa i/e sigurt u ndjetë në këtë vend?"), 0, 10, L("0 = not at all safe", "0 = aspak i/e sigurt"), L("10 = completely safe", "10 = plotësisht i/e sigurt")),
        { id: "incident", type: "textarea", optional: true, label: L("Was there anything unusual (for example an incident, a strong smell or a very loud noise) that affected how you felt? If yes, please describe briefly:",
            "A ndodhi diçka e pazakontë (p.sh. incident, erë e fortë ose zhurmë shumë e lartë) që ndikoi në mënyrën si u ndjetë? Nëse po, përshkruajeni shkurt:") }
      ] }
    ])
  };

  FORMS.memory = {
    form_type: "memory",
    title: L("Memory of the walks", "Kujtesa e ecjeve"),
    intro: L("Researcher: ask the participant to describe each walk in their own words (what they passed, saw, heard and where they turned) and type what they say. Do not suggest anything.",
             "Studiuesi: i kërkon pjesëmarrësit të përshkruajë secilën ecje me fjalët e veta (çfarë kaloi, pa, dëgjoi dhe ku u kthye) dhe shkruan atë që thotë. Mos sugjeroni asgjë."),
    sections: [{ title: null, fields: [
      { id: "free_w1", type: "textarea", optional: true, label: L("Walk 1: {w1}", "Ecja 1: {w1}") },
      { id: "free_w2", type: "textarea", optional: true, label: L("Walk 2: {w2}", "Ecja 2: {w2}") },
      { id: "free_w3", type: "textarea", optional: true, label: L("Walk 3: {w3}", "Ecja 3: {w3}") }
    ] }]
  };

  /* ---------- photo recognition test (document 04 / SOP 11.3). 12 photos; which ones are route/decoy is stored ONLY in the database table study_photo_key. ---------- */
  var PHOTOS = [];
  for (var i = 1; i <= 12; i++) PHOTOS.push({ id: "p" + (i < 10 ? "0" : "") + i, file: "photos/p" + (i < 10 ? "0" : "") + i + ".jpg" });

  var PHOTO_TEXT = {
    intro: L("You will now see photos of places, one at a time. Some show places you passed during today's walks and some do not. For each photo, tell us whether you passed this place.",
             "Tani do të shihni foto vendesh, një nga një. Disa tregojnë vende që keni kaluar gjatë ecjeve të sotme dhe disa jo. Për secilën foto, na thoni nëse e keni kaluar këtë vend."),
    hint: L("If you are not sure, choose the answer that feels most likely.", "Nëse nuk jeni i/e sigurt, zgjidhni përgjigjen që ju duket më e mundshme."),
    question: L("Did you pass this place during today's walks?", "A e kaluat këtë vend gjatë ecjeve të sotme?"),
    yes: L("Yes, I passed it", "Po, e kalova"), no: L("No, I did not", "Jo, nuk e kalova"),
    start: L("Start", "Fillo")
  };

  /* ---------- researcher session log (document 06, section B). English only. Entered on the researcher's phone. ---------- */
  function yn(id, label) { return choice("" + id, label, [{ v: "Y", t: "Yes" }, { v: "N", t: "No" }], { layout: "row", plain: true }); }
  function num(id, label, min, max, step) { return { id: id, type: "number", label: label, min: min, max: max, step: step || 1, optional: true, plain: true, small: true }; }
  function tm(id, label) { return { id: id, type: "time", label: label, optional: true, plain: true, small: true }; }
  function tx(id, label) { return { id: id, type: "text", label: label, optional: true, plain: true }; }
  function bp(prefix, label, withSpo2) {
    var f = [num(prefix + "_sbp", label + " SBP (mmHg)", 60, 260), num(prefix + "_dbp", label + " DBP (mmHg)", 30, 160), num(prefix + "_pulse", label + " pulse (bpm)", 30, 220)];
    if (withSpo2) f.push(num(prefix + "_spo2", label + " SpO2 (%)", 70, 100), num(prefix + "_spo2_pulse", label + " pulse at SpO2 (bpm)", 30, 220));
    return f;
  }
  var LOG = { sections: [
    { title: "Session", fields: [
      { id: "date", type: "date", label: "Date", plain: true }, tx("researcher", "Researcher"), tx("assistant", "Assistant")] },
    { title: "Conditions", fields: [
      num("temp_c", "Temperature (°C)", -20, 50, 0.1), num("humidity", "Humidity (%)", 0, 100), 
      choice("precip", "Precipitation", [{ v: "none", t: "None" }, { v: "light", t: "Light" }, { v: "other", t: "Other" }], { layout: "row", plain: true, optional: true }),
      choice("traffic", "Traffic level", [{ v: "L", t: "Low" }, { v: "M", t: "Medium" }, { v: "H", t: "High" }], { layout: "row", plain: true, optional: true }),
      tx("station", "Nearest GreenAL station"), tx("noise_events", "Notable noise / events")] },
    { title: "Pre-session checklist", fields: [
      yn("caffeine", "Caffeine within the set window"), yn("tobacco", "Tobacco / vaping within the set window"), yn("exercise", "Vigorous exercise within the set window"),
      yn("unwell", "Feels unwell today"), num("sleep_h", "Hours slept last night", 0, 24, 0.5), yn("new_med", "New medication since last visit")] },
    { title: "Devices and clocks", fields: [
      tx("strap_id", "Strap ID"), tx("bp_id", "BP monitor ID"), tx("oximeter_id", "Oximeter ID"), tx("hrv_file", "HRV app / file name"), tx("strava", "Strava activity name")] },
    { title: "Timings (clock time)", fields: [
      tm("t_base_start", "Baseline rest start"), tm("t_base_end", "Baseline rest end"), tm("t_pre_end", "Pre-measures done"),
      tm("t_walk_start", "Walk start"), tm("t_walk_end", "Walk end"), tm("t_rest_start", "Post-walk rest start"), tm("t_rest_end", "Post-walk rest end"), tm("t_post_end", "Post-measures done")]  },
    { title: "Measurements (before the walk)", fields: bp("pre1", "PRE reading 1", true).concat(bp("pre2", "PRE reading 2", false)) },
    { title: "Measurements (after the walk)", fields: bp("post1", "POST reading 1", true).concat(bp("post2", "POST reading 2", false)) },
    { title: "Digit span", fields: [
      tx("ds_pre_set", "PRE list set"), num("ds_pre_longest", "PRE longest length passed", 0, 12), num("ds_pre_total", "PRE total sequences correct", 0, 24),
      tx("ds_post_set", "POST list set"), num("ds_post_longest", "POST longest length passed", 0, 12), num("ds_post_total", "POST total sequences correct", 0, 24)] },
    { title: "Quality and events", fields: [
      choice("dropouts", "Strap signal dropouts", [{ v: "none", t: "None" }, { v: "some", t: "Some" }, { v: "many", t: "Many" }], { layout: "row", plain: true, optional: true }),
      yn("gps_ok", "GPS OK"), yn("stopped_early", "Stopped early"), tx("stopped_reason", "If stopped early: reason"),
      yn("incident", "Incident / adverse event"), yn("exported", "Data exported and backed up"), tm("exported_time", "Export time"),
      { id: "notes", type: "textarea", label: "Notes", optional: true, plain: true },
      { id: "deviations", type: "textarea", label: "Deviations from the SOP (what happened, impact on data, action taken)", optional: true, plain: true },
      tx("initials", "Completed by (initials)")] }
  ] };
  // The yes/no checklist fields are not mandatory either
  LOG.sections.forEach(function (s) { s.fields.forEach(function (f) { if (f.plain) f.optional = true; }); });

  /* ---------- flat field list (used to generate the SQL views) ---------- */
  function flat(formKey) {
    var out = [];
    (formKey === "log" ? LOG : FORMS[formKey]).sections.forEach(function (s) {
      s.fields.forEach(function (f) {
        var numeric = f.type === "scale" || f.type === "number" || (f.type === "choice" && f.numeric);
        out.push({ id: f.id, kind: numeric ? "num" : (f.type === "time" ? "time" : (f.type === "date" ? "date" : "text")) });
      });
    });
    return out;
  }

  var SPEC = { L: L, SITES: SITES, ORDERS: ORDERS, ALL_ORDERS: ALL_ORDERS, MOOD_MODULE: MOOD_MODULE, FORMS: FORMS, PHOTOS: PHOTOS, PHOTO_TEXT: PHOTO_TEXT, LOG: LOG, flat: flat,
               MOOD_IDS: MOOD_ITEMS.map(function (m) { return "mood_" + m[0]; }) };
  if (typeof module !== "undefined" && module.exports) module.exports = SPEC; else root.SPEC = SPEC;
})(typeof window !== "undefined" ? window : this);
