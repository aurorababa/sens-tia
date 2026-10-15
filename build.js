const fs = require("fs");
const L = (en, sq, tag = "span") => `<${tag} lang="en" data-l="en">${en}</${tag}><${tag} lang="sq" data-l="sq">${sq}</${tag}>`;
const B = (en, sq) => `<div lang="en" data-l="en">${en}</div><div lang="sq" data-l="sq">${sq}</div>`;
const LAW = "https://idp.al/wp-content/uploads/2025/04/Law-no.124-2024-DP.pdf";

const head = (titleEn, titleSq, desc) => `<!doctype html>
<html lang="en" data-lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title data-en="${titleEn}" data-sq="${titleSq}">${titleEn}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0A2F57">
<meta property="og:type" content="website">
<meta property="og:title" content="${titleEn}"><meta property="og:description" content="${desc}"><meta property="og:image" content="assets/img/share.png">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/style.css">
</head>`;

const header = (page) => `<body>
<a class="skip" href="#main">${L("Skip to main content", "Kalo te përmbajtja kryesore")}</a>
<header class="top">
 <div class="wrap">
  <div class="logos">
   <a href="index.html" aria-label="NEUAR, SENS-TIA home"><img src="assets/img/neuar.png" alt="NEUAR, Neuroscience for Urban Spaces and Architecture" width="134" height="46"></a>
   <img class="round" src="assets/img/ihre.png" alt="IHRE, Institute of Human Rights and Non-Formal Education" width="52" height="52">
   <img src="assets/img/efb.png" alt="EFB, European Fund for the Balkans" width="41" height="46">
  </div>
  <nav class="main" aria-label="Main">
   <a href="index.html#aims">${L("Aims", "Qëllimet")}</a>
   <a href="index.html#involves">${L("What it involves", "Çfarë përfshin")}</a>
   <a href="index.html#team">${L("Team", "Ekipi")}</a>
   <a href="index.html#faq">${L("Questions", "Pyetje")}</a>
   <a class="btn" style="min-height:44px;padding:.4rem 1rem" href="screening.html"${page === "screening" ? ' aria-current="page"' : ""}>${L("Check eligibility", "Kontrollo përshtatshmërinë")}</a>
   <div class="lang" role="group" aria-label="Language / Gjuha"><button type="button" data-set="en" aria-pressed="true" lang="en">EN</button><button type="button" data-set="sq" aria-pressed="false" lang="sq">SQ</button></div>
  </nav>
 </div>
</header>`;

const footer = `<footer>
 <div class="wrap">
  <div class="fgrid">
   <div>
    <h2>${L("Contact the research team", "Kontakti me ekipin kërkimor")}</h2>
    <div class="contacts">
     <div><b>Aurora Baba</b><span>${L("Lead researcher, NEUAR", "Studiuesja kryesore, NEUAR")}</span><a href="mailto:aurora.baba@neuar.org">aurora.baba@neuar.org</a></div>
     <div><b>Andela Malaj</b><span>${L("Medical researcher, NEUAR", "Studiuese mjekësore, NEUAR")}</span><a href="mailto:andela.malaj@neuar.com">andela.malaj@neuar.com</a></div>
    </div>
   </div>
   <div>
    <div class="logos">
     <img src="assets/img/neuar.png" alt="NEUAR" width="134" height="54">
     <img class="round" src="assets/img/ihre.png" alt="IHRE" width="54" height="54">
     <img src="assets/img/efb.png" alt="European Fund for the Balkans" width="48" height="54">
    </div>
    <small>${L(
     "SENS-TIA is a pilot field study run by NEUAR (Neuroscience for Urban Spaces and Architecture), funded by the European Fund for the Balkans (EFB) and hosted with the Institute of Human Rights and Non-Formal Education (IHRE). The content of this website is the sole responsibility of NEUAR and does not necessarily reflect the views of the funder.",
     "SENS-TIA është një studim pilot në terren i zhvilluar nga NEUAR (Neuroscience for Urban Spaces and Architecture), i financuar nga Fondi Evropian për Ballkanin (EFB) dhe i pritur me Institutin e të Drejtave të Njeriut dhe Arsimit Joformal (IHRE). Përmbajtja e kësaj faqeje është përgjegjësi vetëm e NEUAR dhe nuk pasqyron domosdoshmërisht qëndrimet e financuesit.")}</small>
   </div>
  </div>
 </div>
</footer>
<script src="assets/config.js"></script>
<script src="assets/app.js"></script>
</body></html>`;

/* ---------- original SVG illustrations ---------- */
const heroSvg = `<svg class="art" viewBox="0 0 520 420" role="img" aria-labelledby="ht hd" xmlns="http://www.w3.org/2000/svg">
<title id="ht">${"Illustration of the study design"}</title>
<desc id="hd">A walking route linking three places in Tirana: a road, a park and a lakeside path, with a heart-rate trace underneath.</desc>
<rect width="520" height="420" rx="22" fill="#fff" stroke="#C9D6E3"/>
<g fill="none" stroke="#DCE9F6" stroke-width="1"><path d="M0 70H520M0 140H520M0 210H520M0 280H520M0 350H520M80 0V420M160 0V420M240 0V420M320 0V420M400 0V420M480 0V420"/></g>
<path d="M60 230 C120 120 190 120 250 190 S380 300 450 150" fill="none" stroke="#004F91" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14"/>
<g>
 <circle cx="60" cy="230" r="30" fill="#004F91"/><text x="60" y="238" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="22" fill="#fff">R</text>
 <circle cx="250" cy="190" r="30" fill="#0B6B3A"/><text x="250" y="198" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="22" fill="#fff">P</text>
 <circle cx="450" cy="150" r="30" fill="#F68037"/><text x="450" y="158" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="22" fill="#0A2F57">L</text>
</g>
<g font-family="Arial,Helvetica,sans-serif" font-size="15" fill="#16222E" font-weight="500">
 <text x="60" y="282" text-anchor="middle">Road</text><text x="250" y="242" text-anchor="middle">Park</text><text x="450" y="112" text-anchor="middle">Lakeside</text>
</g>
<path d="M30 350 H120 l14 -34 l22 70 l20 -92 l18 56 l14 -22 H250 l14 -34 l22 70 l20 -92 l18 56 l14 -22 H490" fill="none" stroke="#F68037" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<text x="30" y="404" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#4A5A6A">heart rate · blood pressure · oxygen · attention · mood</text>
</svg>`;
const icoRoad = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#DCE9F6"/><path d="M24 58 L28 6 M40 58 L36 6" stroke="#004F91" stroke-width="4" fill="none"/><path d="M32 12v8M32 28v8M32 44v8" stroke="#F68037" stroke-width="4" stroke-linecap="round"/></svg>`;
const icoPark = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#E7F5EC"/><circle cx="24" cy="26" r="11" fill="#0B6B3A"/><circle cx="40" cy="30" r="9" fill="#0B6B3A"/><rect x="22" y="34" width="4" height="16" fill="#0A2F57"/><rect x="38" y="36" width="4" height="14" fill="#0A2F57"/></svg>`;
const icoLake = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#FFF3EA"/><path d="M12 28c5-5 9 5 14 0s9 5 14 0 9 5 12 0M12 40c5-5 9 5 14 0s9 5 14 0 9 5 12 0M12 52c5-5 9 5 14 0s9 5 14 0 9 5 12 0" stroke="#004F91" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="46" cy="18" r="6" fill="#F68037"/></svg>`;
const icoHeart = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#DCE9F6"/><path d="M10 34h12l5-12 8 24 6-16h13" stroke="#004F91" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const icoBrain = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#DCE9F6"/><path d="M32 16c-6-5-16 0-14 8-5 3-3 11 2 12-1 7 7 11 12 7 5 4 13 0 12-7 5-1 7-9 2-12 2-8-8-13-14-8z" fill="none" stroke="#004F91" stroke-width="3.5"/><path d="M32 16v30" stroke="#F68037" stroke-width="3.5"/></svg>`;
const icoMood = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#FFF3EA"/><circle cx="32" cy="32" r="16" fill="none" stroke="#004F91" stroke-width="3.5"/><circle cx="26" cy="28" r="2.5" fill="#004F91"/><circle cx="38" cy="28" r="2.5" fill="#004F91"/><path d="M24 37c4 5 12 5 16 0" stroke="#F68037" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`;

fs.writeFileSync("assets/img/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#004F91"/><path d="M8 36h12l5-14 8 26 6-18h17" stroke="#F68037" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`);



/* ---------- extra icons for place tiles (white line art) ---------- */
const bigRoad = `<svg viewBox="0 0 110 110" aria-hidden="true"><path d="M40 108 L50 6 M72 108 L62 6" stroke="#fff" stroke-opacity=".35" stroke-width="7" fill="none"/><path d="M56 14v14M56 42v14M56 70v14" stroke="#F68037" stroke-width="6" stroke-linecap="round"/></svg>`;
const bigPark = `<svg viewBox="0 0 110 110" aria-hidden="true"><circle cx="46" cy="42" r="26" fill="#fff" fill-opacity=".28"/><circle cx="76" cy="52" r="20" fill="#fff" fill-opacity=".2"/><rect x="43" y="60" width="6" height="40" fill="#fff" fill-opacity=".35"/><rect x="73" y="66" width="5" height="34" fill="#fff" fill-opacity=".3"/></svg>`;
const bigLake = `<svg viewBox="0 0 110 110" aria-hidden="true"><path d="M8 46c10-9 18 9 28 0s18 9 28 0 18 9 28 0M8 66c10-9 18 9 28 0s18 9 28 0 18 9 28 0M8 86c10-9 18 9 28 0s18 9 28 0 18 9 28 0" stroke="#fff" stroke-opacity=".4" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="84" cy="22" r="11" fill="#F68037"/></svg>`;

/* ---------- INDEX ---------- */
const index = head("SENS-TIA: participants wanted in Tirana | NEUAR", "SENS-TIA: kërkohen pjesëmarrës në Tiranë | NEUAR",
  "Paid participants aged 18 to 65 wanted for SENS-TIA, a pilot study in Tirana on how a busy road, a park and a lakeside path affect heart rate, blood pressure and mood.") + header("home") + `
<main id="main">
<section class="hero" aria-labelledby="h1">
 <div class="wrap grid">
  <div>
   <p class="eyebrow">${L("Paid participants wanted · Tirana", "Kërkohen pjesëmarrës me pagesë · Tiranë")}</p>
   <h1 id="h1">${L("Does the city influence our health? Does the environment influence our health unconsciously?", "A ndikon qyteti në shëndetin tonë? A ndikon mjedisi në shëndetin tonë pa e vënë re?")}</h1>
   <p class="lede">${L(
    "SENS-TIA is a pilot study by NEUAR and, to our knowledge, the first of its kind in Albania. Take part in six short, supervised walks along a busy road, in a park and by a lake while we measure heart rate, blood pressure, attention and mood.",
    "SENS-TIA është një studim pilot i NEUAR dhe, sa dimë ne, i pari i këtij lloji në Shqipëri. Merrni pjesë në gjashtë ecje të shkurtra me mbikëqyrje, në një rrugë me trafik, në park dhe buzë liqenit, ndërsa matim ritmin e zemrës, tensionin, vëmendjen dhe humorin.")}</p>
   <ul class="chips">
    <li class="pay">${L("€15 + a coffee", "15 € + një kafe")}</li><li>${L("Adults 18–65", "Të rritur 18–65 vjeç")}</li><li>${L("6 sessions, about 1 hour", "6 seanca, rreth 1 orë")}</li><li>${L("Non-invasive", "Jo-invazive")}</li>
   </ul>
   <div class="btns">
    <a class="btn accent" href="screening.html">${L("Check if you can take part", "Kontrolloni nëse mund të merrni pjesë")}</a>
    <a class="btn ghost" href="#aims">${L("Read about the study", "Lexoni për studimin")}</a>
   </div>
  </div>
  <div>${heroSvg}</div>
 </div>
</section>

<div class="statband"><div class="wrap"><div class="stats" role="list">
 <div class="stat" role="listitem"><b>12</b><span>${L("participants", "pjesëmarrës")}</span></div>
 <div class="stat" role="listitem"><b>6</b><span>${L("walks each", "ecje secili")}</span></div>
 <div class="stat" role="listitem"><b>15′</b><span>${L("per walk", "për ecje")}</span></div>
 <div class="stat" role="listitem"><b>3</b><span>${L("places in Tirana", "vende në Tiranë")}</span></div>
</div></div></div>

<section id="aims" aria-labelledby="h-aims">
 <div class="wrap two">
  <div>
   <p class="eyebrow">${L("The research", "Kërkimi")}</p>
   <h2 id="h-aims">${L("Why this study?", "Pse ky studim?")}</h2>
   ${B(`<p>We spend most of our lives in cities, yet the streets, parks and waterfronts around us may affect our bodies in ways we never notice: how fast the heart beats, how well we recover from stress, how well we concentrate. Neuroarchitecture studies these links between the built environment, the brain and the body.</p><p>SENS-TIA asks a simple question: <strong>does the kind of place we walk through change how our body and mind respond?</strong> We compare a busy road, a park and a lakeside path in Tirana, using the same short walk and the same measurements for everyone.</p>`,
       `<p>Ne e kalojmë pjesën më të madhe të jetës në qytete, megjithatë rrugët, parqet dhe bregu i ujit rreth nesh mund të ndikojnë në trupin tonë në mënyra që nuk i vëmë re: sa shpejt rreh zemra, sa mirë rimëkëmbemi nga stresi, sa mirë përqendrohemi. Neuroarkitektura studion këto lidhje mes mjedisit të ndërtuar, trurit dhe trupit.</p><p>SENS-TIA parashtron një pyetje të thjeshtë: <strong>a e ndryshon lloji i vendit ku ecim mënyrën si përgjigjen trupi dhe mendja?</strong> Krahasojmë një rrugë me trafik, një park dhe një shteg buzë liqenit në Tiranë, me të njëjtën ecje të shkurtër dhe të njëjtat matje për këdo.</p>`)}
   <div class="callout" style="margin-top:1rem"><span class="tag">${L("First in Albania", "I pari në Shqipëri")}</span>
    ${B(`<p>To our knowledge, SENS-TIA is the first field study in Albania to record how people’s bodies respond, in real time, as they walk through different everyday places in the city. It is a small pilot: it tests the method and gives first local evidence to guide larger studies and healthier urban design.</p>`,
        `<p>Sa dimë ne, SENS-TIA është studimi i parë në terren në Shqipëri që regjistron si përgjigjet trupi i njerëzve, në kohë reale, ndërsa ecin nëpër vende të ndryshme të përditshme të qytetit. Është një pilot i vogël: teston metodën dhe jep dëshmi të para lokale për të udhëhequr studime më të mëdha dhe dizajn urban më të shëndetshëm.</p>`)}
   </div>
  </div>
  <div>
   <h3 style="margin-top:.4rem">${L("Our aims", "Qëllimet tona")}</h3>
   <ol class="aims">
    <li><div>${L("<b>Measure the body’s response.</b> Record heart rate and its variability, blood pressure and blood oxygen in each place.", "<b>Të masim përgjigjen e trupit.</b> Të regjistrojmë ritmin e zemrës dhe ndryshueshmërinë e tij, tensionin dhe oksigjenin në gjak në çdo vend.")}</div></li>
    <li><div>${L("<b>Compare recovery.</b> See whether the body calms down differently after a walk on a road, in a park or by the lake.", "<b>Të krahasojmë rimëkëmbjen.</b> Të shohim nëse trupi qetësohet ndryshe pas një ecjeje në rrugë, në park ose buzë liqenit.")}</div></li>
    <li><div>${L("<b>Look at attention and memory.</b> Test concentration and what people remember of the walk.", "<b>Të shohim vëmendjen dhe kujtesën.</b> Të testojmë përqendrimin dhe çfarë kujtojnë njerëzit nga ecja.")}</div></li>
    <li><div>${L("<b>Build local evidence.</b> Give architects, planners and health professionals in Tirana a first evidence base.", "<b>Të ndërtojmë dëshmi lokale.</b> Të ofrojmë një bazë të parë dëshmish për arkitektët, planifikuesit dhe profesionistët e shëndetit në Tiranë.")}</div></li>
   </ol>
  </div>
 </div>
 <div class="wrap">
  <div class="cards">
   <div class="card">${icoHeart}<h3>${L("Body", "Trupi")}</h3><p>${L("Heart rate and its variability (chest strap), blood pressure and blood oxygen (fingertip sensor).", "Ritmi i zemrës dhe ndryshueshmëria e tij (rrip në gjoks), tensioni dhe oksigjeni në gjak (sensor në gisht).")}</p></div>
   <div class="card o">${icoBrain}<h3>${L("Attention and memory", "Vëmendja dhe kujtesa")}</h3><p>${L("A short number-repeating task and a few questions about what you remember from the walk.", "Një detyrë e shkurtër përsëritjeje numrash dhe disa pyetje për atë që kujtoni nga ecja.")}</p></div>
   <div class="card g">${icoMood}<h3>${L("Stress and mood", "Stresi dhe humori")}</h3><p>${L("Short, established questionnaires about stress, calm and how restorative the place felt.", "Pyetësorë të shkurtër dhe të njohur për stresin, qetësinë dhe sa çlodhës ishte vendi.")}</p></div>
  </div>
 </div>
</section>

<section class="alt" id="places" aria-labelledby="h-places">
 <div class="wrap">
  <h2 id="h-places">${L("Three places, one type of walk", "Tre vende, një lloj ecjeje")}</h2>
  <div class="places">
   <div class="place p-road">${bigRoad}<h3>${L("Road corridor", "Korridori i rrugës")}</h3><p>${L("A busy street with traffic, crossings and noise.", "Një rrugë e ngarkuar me trafik, kalime këmbësorësh dhe zhurmë.")}</p></div>
   <div class="place p-park">${bigPark}<h3>${L("Park", "Parku")}</h3><p>${L("Tree-lined paths in the Grand Park (Parku i Madh).", "Shtigje me pemë në Parkun e Madh.")}</p></div>
   <div class="place p-lake">${bigLake}<h3>${L("Lakeside path", "Shtegu buzë liqenit")}</h3><p>${L("The path along the artificial lake, with open water views.", "Shtegu buzë liqenit artificial, me pamje të hapur drejt ujit.")}</p></div>
  </div>
 </div>
</section>

<section id="involves" aria-labelledby="h-inv">
 <div class="wrap">
  <p class="eyebrow">${L("Taking part", "Pjesëmarrja")}</p>
  <h2 id="h-inv">${L("What taking part involves", "Çfarë përfshin pjesëmarrja")}</h2>
  <ol class="steps">
   <li><div>${L("<strong>Check eligibility.</strong> Ten quick yes/no questions (about 3 minutes). We keep no health answers.", "<strong>Kontrolloni përshtatshmërinë.</strong> Dhjetë pyetje të shpejta po/jo (rreth 3 minuta). Nuk ruajmë asnjë përgjigje shëndetësore.")}</div></li>
   <li><div>${L("<strong>Read the information sheet and give consent.</strong> We email it to you and confirm your time slots. You can ask us anything first.", "<strong>Lexoni fletën e informacionit dhe jepni pëlqimin.</strong> Ju e dërgojmë me email dhe konfirmojmë orarin tuaj. Mund të na pyesni çfarëdo më parë.")}</div></li>
   <li><div>${L("<strong>Six sessions of about one hour</strong> over 2–3 weeks, in pairs: a seated rest, short measurements, a <strong>15-minute walk</strong> with a researcher behind you, a rest, and short questionnaires.", "<strong>Gjashtë seanca prej rreth një ore</strong> gjatë 2–3 javësh, në çifte: pushim i ulur, matje të shkurtra, një <strong>ecje 15 minutash</strong> me një studiues pas jush, pushim dhe pyetësorë të shkurtër.")}</div></li>
   <li><div>${L("<strong>Paid, and in control.</strong> You receive €15 for travel and subsistence across all your sessions, plus a coffee on us after the final walk when you fill in the last questionnaire. You sign a receipt. You can stop at any moment without giving a reason.", "<strong>Me pagesë dhe me kontroll.</strong> Merrni 15 € për udhëtim dhe ushqim për të gjitha seancat, plus një kafe nga ne pas shëtitjes së fundit, kur plotësoni pyetësorin e fundit. Nënshkruani një faturë. Mund të ndaleni në çdo moment pa dhënë arsye.")}</div></li>
  </ol>
  <p style="margin-top:1rem"><span data-fielddates>${L("Dates are agreed individually with each participant.", "Datat dakordësohen individualisht me çdo pjesëmarrës.")}</span> ${L("Sessions run in daylight and are rescheduled in bad weather.", "Seancat zhvillohen ditën dhe riplanifikohen kur moti është i keq.")}</p>
  <div class="btns"><a class="btn" href="screening.html">${L("Check if you can take part", "Kontrolloni nëse mund të merrni pjesë")}</a></div>
 </div>
</section>

<section class="alt" id="who" aria-labelledby="h-who">
 <div class="wrap">
  <p class="eyebrow">${L("Who is behind SENS-TIA", "Kush qëndron pas SENS-TIA")}</p>
  <h2 id="h-who">${L("Organisations", "Organizatat")}</h2>
  <div class="partners">
   <div class="partner"><div class="lg"><img src="assets/img/neuar.png" alt="NEUAR" width="204" height="70"></div>
    <h3>NEUAR</h3>
    <p>${L("Neuroscience for Urban Spaces and Architecture is a Tirana-based initiative focused on neuroarchitecture: research on how built environments shape the brain, body and wellbeing, and how this knowledge can guide the design of healthier cities.", "Neuroscience for Urban Spaces and Architecture është një nismë me bazë në Tiranë që fokusohet te neuroarkitektura: kërkim mbi mënyrën si mjediset e ndërtuara formësojnë trurin, trupin dhe mirëqenien, dhe si ky njohuri mund të udhëheqë dizajnin e qyteteve më të shëndetshme.")}</p>
    <p><a href="https://www.neuar.org" rel="noopener">www.neuar.org</a></p></div>
   <div class="partner"><div class="lg"><img class="round" src="assets/img/ihre.png" alt="IHRE" width="70" height="70"></div>
    <h3>IHRE</h3>
    <p>${L("The Institute of Human Rights and Non-Formal Education is a non-profit, non-partisan organisation in Tirana. Its mission is to raise awareness of, promote and develop human rights, mainly among young people, through research, training, seminars, workshops and projects.", "Instituti i të Drejtave të Njeriut dhe Arsimit Joformal është një organizatë jofitimprurëse dhe jopartiake në Tiranë. Misioni i tij është të ngrejë ndërgjegjësimin, të promovojë dhe të zhvillojë të drejtat e njeriut, kryesisht te të rinjtë, përmes kërkimit, trajnimeve, seminareve, punëtorive dhe projekteve.")}</p>
    <p><a href="https://ihrealbania.org/index.php/identity/" rel="noopener">ihrealbania.org</a></p></div>
   <div class="partner"><div class="lg"><img src="assets/img/efb.png" alt="European Fund for the Balkans" width="62" height="70"></div>
    <h3>European Fund for the Balkans</h3>
    <p>${L("SENS-TIA is funded by a small grant from the European Fund for the Balkans (EFB), which supports civil-society initiatives in the Western Balkans.", "SENS-TIA financohet nga një grant i vogël i Fondit Evropian për Ballkanin (EFB), i cili mbështet nisma të shoqërisë civile në Ballkanin Perëndimor.")}</p>
    <p><a href="https://www.balkanfund.org" rel="noopener">www.balkanfund.org</a></p></div>
  </div>
 </div>
</section>

<section id="team" aria-labelledby="h-team">
 <div class="wrap">
  <p class="eyebrow">${L("Research team", "Ekipi kërkimor")}</p>
  <h2 id="h-team">${L("Who you will meet", "Kë do të takoni")}</h2>
  <div class="team">
   <div class="person"><div class="avatar" aria-hidden="true">AB</div><div>
    <h3>Aurora Baba</h3><p class="role">${L("Lead researcher · Co-founder of NEUAR", "Studiuesja kryesore · Bashkëthemeluese e NEUAR")}</p>
    <p>${L("Architect and project manager with 14+ years in the built environment; Degree from UCL in Social Cognition (Chevening Scholar).", "Arkitekte dhe menaxhere projektesh me mbi 14 vjet përvojë në mjedisin e ndërtuar. Ka përfunduar studime në UCL në Njohjen Shoqërore (Social Cognition) si bursiste Chevening.")}</p>
    <p><a href="mailto:aurora.baba@neuar.org">aurora.baba@neuar.org</a></p></div></div>
   <div class="person"><div class="avatar" aria-hidden="true">AM</div><div>
    <h3>Andela Malaj</h3><p class="role">${L("Medical researcher · Co-founder of NEUAR", "Studiuese mjekësore · Bashkëthemeluese e NEUAR")}</p>
    <p>${L("Medical doctor at Vivantes in Berlin, with a public health background (King’s College London). Oversees participant safety and health screening.", "Mjeke në spitalin Vivantes në Berlin, me formim në shëndetin publik (King’s College London). Mbikëqyr sigurinë e pjesëmarrësve dhe përzgjedhjen shëndetësore.")}</p>
    <p><a href="mailto:andela.malaj@neuar.com">andela.malaj@neuar.com</a></p></div></div>
  </div>
 </div>
</section>

<section class="alt" id="rights" aria-labelledby="h-rights">
 <div class="wrap">
  <p class="eyebrow">${L("Transparency", "Transparenca")}</p>
  <h2 id="h-rights">${L("Your safety, privacy and rights", "Siguria, privatësia dhe të drejtat tuaja")}</h2>
  <div class="two" style="grid-template-columns:1fr 1fr">
   <div class="notice">
    ${B(`<p>We follow the principles of the Declaration of Helsinki, use plain-language information and written consent, screen for safety, keep a researcher with you at all times and stop at any sign of discomfort.</p>`,
        `<p>Ndjekim parimet e Deklaratës së Helsinkit, përdorim informacion me gjuhë të thjeshtë dhe pëlqim me shkrim, bëjmë përzgjedhje për siguri, mbajmë një studiues me ju gjatë gjithë kohës dhe ndalojmë në çdo shenjë shqetësimi.</p>`)}
   </div>
   <div class="infocard">
    <h3>${L("Your data", "Të dhënat tuaja")}</h3>
    ${B(`<p>Your data is processed in accordance with Albanian <a href="${LAW}" rel="noopener">Law no. 124/2024 “On Personal Data Protection”</a>. It is used <strong>solely for this research</strong>, and you can <strong>withdraw at any time</strong>.</p>`,
        `<p>Të dhënat tuaja përpunohen në përputhje me <a href="${LAW}" rel="noopener">Ligjin shqiptar nr. 124/2024 “Për mbrojtjen e të dhënave personale”</a>. Ato përdoren <strong>vetëm për këtë kërkim</strong> dhe mund të <strong>tërhiqeni në çdo kohë</strong>.</p>`)}
   </div>
  </div>
  <details style="margin-top:14px"><summary>${L("Who can take part, and who cannot?", "Kush mund të marrë pjesë dhe kush jo?")}</summary><div class="in">${B(`<p>Adults aged 18 to 65 who live, work or study in Tirana and can walk steadily for 15 minutes. We cannot include people with heart or breathing conditions, an implanted electronic device, medication that affects heart rate or blood pressure, or pregnancy. This is a safety rule, not a medical judgement.</p>`, `<p>Të rritur 18–65 vjeç që jetojnë, punojnë ose studiojnë në Tiranë dhe mund të ecin me ritëm të qëndrueshëm për 15 minuta. Nuk mund të përfshijmë persona me sëmundje të zemrës ose të frymëmarrjes, pajisje elektronike të implantuar, ilaçe që ndikojnë në ritmin e zemrës ose tensionin, ose shtatzëni. Është rregull sigurie, jo gjykim mjekësor.</p>`)}</div></details>
 </div>
</section>

<section id="faq" aria-labelledby="h-faq">
 <div class="wrap">
  <h2 id="h-faq">${L("Frequently asked questions", "Pyetje të shpeshta")}</h2>
  <div class="faqgrid">
  <div>
  <details><summary>${L("Will I be paid?", "A do të paguhem?")}</summary><div class="in">${B("<p>Yes. You receive €15 for travel and subsistence for the whole study (not per walk), plus a coffee after the final walk when you complete the last questionnaire. You sign a receipt each time you are paid, which allows the funder to see that the money reached participants.</p>", "<p>Po. Merrni 15 € për udhëtim dhe ushqim për gjithë studimin (jo për çdo shëtitje), plus një kafe pas shëtitjes së fundit, kur plotësoni pyetësorin e fundit. Nënshkruani një faturë sa herë që paguheni, çka i lejon financuesit të shohë se paratë kanë arritur te pjesëmarrësit.</p>")}</div></details>
  <details><summary>${L("Is this a medical test?", "A është ky një test mjekësor?")}</summary><div class="in">${B("<p>No. We take research measurements and do not diagnose or give medical advice. If a reading is outside a safe range before a walk, we ask you to rest and may suggest you speak to a doctor.</p>", "<p>Jo. Marrim matje kërkimore dhe nuk bëjmë diagnozë as japim këshilla mjekësore. Nëse një matje është jashtë intervalit të sigurt para ecjes, ju kërkojmë të pushoni dhe mund të sugjerojmë të flisni me mjekun.</p>")}</div></details>
  <details><summary>${L("Why six sessions?", "Pse gjashtë seanca?")}</summary><div class="in">${B("<p>Each person walks each of the three places twice. Repeating the walks lets us compare places within the same person, which is more reliable with a small group.</p>", "<p>Çdo person ecën në secilin nga tre vendet dy herë. Përsëritja i lejon krahasimet brenda të njëjtit person, çka është më e besueshme me një grup të vogël.</p>")}</div></details>
  </div><div>
  <details><summary>${L("Do I walk alone?", "A eci vetëm?")}</summary><div class="in">${B("<p>You come with another participant but walk separately, with a researcher a few metres behind you. You are never asked to go anywhere alone.</p>", "<p>Vini me një pjesëmarrës tjetër por ecni veçmas, me një studiues disa metra pas jush. Nuk ju kërkohet kurrë të shkoni diku vetëm.</p>")}</div></details>
  <details><summary>${L("What if the weather is bad?", "Çfarë ndodh nëse moti është i keq?")}</summary><div class="in">${B("<p>Sessions are postponed in heavy rain, storms, strong wind, extreme heat or high pollution. We reschedule with you.</p>", "<p>Seancat shtyhen në shi të fortë, stuhi, erë të fortë, nxehtësi ekstreme ose ndotje të lartë. E riplanifikojmë me ju.</p>")}</div></details>
  <details><summary>${L("Will I see the results?", "A do t’i shoh rezultatet?")}</summary><div class="in">${B("<p>Yes. We plan a public summary and workshop. You may also ask for a plain-language summary of your own readings; this is never a diagnosis.</p>", "<p>Po. Planifikojmë një përmbledhje publike dhe një punëtori. Mund të kërkoni edhe një përmbledhje të thjeshtë të matjeve tuaja; kjo nuk është kurrë diagnozë.</p>")}</div></details>
  </div></div>
 </div>
</section>

<section class="alt" id="docs" aria-labelledby="h-docs">
 <div class="wrap">
  <h2 id="h-docs">${L("Documents to download", "Dokumente për shkarkim")}</h2>
  <p>${L("Read these before you decide. PDF files, English and Albanian.", "Lexojini përpara se të vendosni. Skedarë PDF, anglisht dhe shqip.")}</p>
  <div class="docs">
   <a class="doc" href="docs/SENS-TIA_Participant_Information_and_Consent.pdf"><i>PDF</i><div><strong>${L("Participant information and consent form", "Informacioni për pjesëmarrësin dhe formulari i pëlqimit")}</strong><span>EN / SQ</span></div></a>
   <a class="doc" href="docs/SENS-TIA_Call_for_Participants.pdf"><i>PDF</i><div><strong>${L("Call for participants (printable)", "Thirrje për pjesëmarrës (për printim)")}</strong><span>EN / SQ</span></div></a>
  </div>
 </div>
</section>

<div class="cta"><div class="wrap">
 <div><h2>${L("Ready to take part?", "Gati për të marrë pjesë?")}</h2><p>${L("The eligibility check takes about 3 minutes.", "Kontrolli i përshtatshmërisë zgjat rreth 3 minuta.")}</p></div>
 <a class="btn accent" href="screening.html">${L("Check if you can take part", "Kontrolloni nëse mund të merrni pjesë")}</a>
</div></div>
</main>` + footer;

const QS = [
 ["Are you aged between 18 and 65?", "A jeni mes 18 dhe 65 vjeç?"],
 ["Do you live, work or study in Tirana (or regularly spend time there)?", "A jetoni, punoni ose studioni në Tiranë (ose kaloni rregullisht kohë aty)?"],
 ["Can you walk at a steady pace for 15 minutes without stopping?", "A mund të ecni me ritëm të qëndrueshëm për 15 minuta pa u ndalur?"],
 ["Has a doctor ever told you that you have a heart condition, an irregular heartbeat (arrhythmia), or high blood pressure that is not well controlled?", "A ju ka thënë ndonjëherë mjeku se keni sëmundje të zemrës, aritmi (rrahje të parregullta të zemrës) ose tension të lartë të gjakut që nuk kontrollohet mirë?"],
 ["Do you have a diagnosed respiratory condition (for example asthma or COPD)?", "A keni një gjendje të diagnostikuar të frymëmarrjes (p.sh. astmë ose BPOK)?"],
 ["Do you have a pacemaker or another implanted electronic medical device?", "A keni stimulues kardiak (pacemaker) ose pajisje tjetër elektronike mjekësore të implantuar?"],
 ["Do you regularly take medication that affects heart rate or blood pressure (for example beta-blockers or blood-pressure tablets)? If unsure, ask your doctor or pharmacist.", "A merrni rregullisht ilaçe që ndikojnë në ritmin e zemrës ose në tension (p.sh. beta-bllokues ose tableta për tension)? Nëse nuk jeni të sigurt, pyesni mjekun ose farmacistin."],
 ["Are you currently pregnant, or might you be?", "A jeni shtatzënë aktualisht, ose mund të jeni?"],
 ["Do you feel chest pain, dizziness or faintness when you do physical activity?", "A ndieni dhimbje në gjoks, marramendje ose humbje ndjenjash gjatë aktivitetit fizik?"],
 ["Has a doctor advised you not to do moderate physical activity such as brisk walking?", "A ju ka këshilluar mjeku të mos bëni aktivitet fizik të moderuar, si ecja e shpejtë?"],
];
const radios = QS.map((q, i) => `<fieldset class="q" id="fq${i + 1}"><legend><span class="n">${i + 1}.</span>${L(q[0], q[1])}</legend>
 <div class="opts"><div class="opt"><input type="radio" id="q${i + 1}y" name="q${i + 1}" value="yes" required><label for="q${i + 1}y">${L("Yes", "Po")}</label></div>
 <div class="opt"><input type="radio" id="q${i + 1}n" name="q${i + 1}" value="no"><label for="q${i + 1}n">${L("No", "Jo")}</label></div></div></fieldset>`).join("\n");


const screening = head("Check eligibility | SENS-TIA", "Kontrolloni përshtatshmërinë | SENS-TIA", "A short, private eligibility check for the SENS-TIA walking study in Tirana.") + header("screening") + `
<main id="main">
<section class="pagehero"><div class="wrap">
 <p class="eyebrow">${L("Step 1 of 3", "Hapi 1 nga 3")}</p>
 <h1>${L("Eligibility check", "Kontrolli i përshtatshmërisë")}</h1>
 <p class="lede">${L("Ten quick yes/no questions. It takes about 3 minutes. It is a safety check, not a medical examination. You do not need to explain any answer.", "Dhjetë pyetje të shpejta po/jo. Zgjat rreth 3 minuta. Është kontroll sigurie, jo ekzaminim mjekësor. Nuk keni nevojë të shpjegoni asnjë përgjigje.")}</p>
</div></section>
<section style="padding:28px 0 56px"><div class="wrap formbox">
 <p class="testmode" id="testmode" hidden><strong>TEST MODE</strong> · The database is not connected yet. Nothing is saved.</p>
 <details open><summary>${L("Privacy notice (please read)", "Njoftimi i privatësisë (ju lutemi lexojeni)")}</summary><div class="in">${B(
 `<p>Your data is processed in accordance with Albanian law, <a href="${LAW}" target="_blank" rel="noopener">Law no. 124/2024 “On Personal Data Protection”</a>. It is used solely for this research, and you can withdraw at any time by writing to <a data-contact="CONTACT_EMAIL" href="#">[contact email]</a>.</p><p><strong>What we keep:</strong> we do <em>not</em> keep your yes/no health answers, only “eligible” or “not eligible”. If you are eligible we also keep the name and contact details you give, your language and time preference, whether you smoke, and your availability. If you are not eligible we keep nothing about you. Data is stored in a secured database in the EU.</p>`,
 `<p>Të dhënat tuaja përpunohen sipas ligjit shqiptar, <a href="${LAW}" target="_blank" rel="noopener">Ligji nr. 124/2024 “Për mbrojtjen e të dhënave personale”</a>. Ato përdoren vetëm për këtë kërkim dhe mund të tërhiqeni në çdo kohë duke shkruar te <a data-contact="CONTACT_EMAIL" href="#">[email kontakti]</a>.</p><p><strong>Çfarë ruajmë:</strong> <em>nuk</em> i ruajmë përgjigjet po/jo për shëndetin, vetëm “i përshtatshëm” ose “jo i përshtatshëm”. Nëse jeni i përshtatshëm ruajmë edhe emrin dhe kontaktin që jepni, gjuhën dhe orarin e preferuar, nëse pini duhan dhe disponueshmërinë. Nëse nuk jeni i përshtatshëm nuk ruajmë asgjë për ju. Të dhënat ruhen në një bazë të sigurt në BE.</p>`)}</div></details>
 <div class="summary" id="summary" role="alert" tabindex="-1"><strong>${L("Please fix the following:", "Ju lutemi korrigjoni sa vijon:")}</strong><ul id="summary-list"></ul></div>
 <form id="screen" novalidate autocomplete="on">
  <div class="hp" aria-hidden="true"><label>Website<input type="text" id="website" name="website" tabindex="-1" autocomplete="off"></label></div>
  <div class="check"><input type="checkbox" id="consent"><label for="consent">${L("I have read the privacy notice and I agree that my answers are used for this eligibility check.", "I kam lexuar njoftimin e privatësisë dhe jam dakord që përgjigjet e mia përdoren për këtë kontroll përshtatshmërie.")}</label></div>
  <div id="step1"><h2 style="margin-top:1.4rem">${L("Your answers", "Përgjigjet tuaja")}</h2>
  ${radios}
  <p>${L("If you are worried about your health or any answer, please speak to your doctor.", "Nëse jeni të shqetësuar për shëndetin tuaj ose për ndonjë përgjigje, flisni me mjekun tuaj.")}</p>
  <button type="button" class="btn" id="go1">${L("See my result", "Shiko rezultatin tim")}</button></div>

  <div id="step2" hidden>
   <hr style="border:0;border-top:1px solid var(--line);margin:2rem 0">
   <p class="eyebrow">${L("Step 2 of 3", "Hapi 2 nga 3")}</p>
   <h2>${L("Good news: you may be eligible", "Lajm i mirë: mund të jeni i përshtatshëm")}</h2>
   <p>${L("Please leave your details so we can send you the information sheet and consent form. You are not committing to anything yet.", "Ju lutemi lini të dhënat tuaja që t’ju dërgojmë fletën e informacionit dhe formularin e pëlqimit. Nuk keni marrë ende asnjë angazhim.")}</p>
   <div class="field"><label class="l" for="name">${L("Your name", "Emri juaj")}</label><input type="text" id="name" name="name" autocomplete="name"></div>
   <div class="field"><label class="l" for="email">${L("Email", "Email")}</label><span class="hint">${L("We will write to you at this address to confirm your time slots.", "Do t’ju shkruajmë në këtë adresë për të konfirmuar orarin tuaj.")}</span><input type="email" id="email" name="email" autocomplete="email"></div>
   <div class="field"><label class="l" for="phone">${L("Phone (optional)", "Telefon (opsional)")}</label><input type="tel" id="phone" name="phone" autocomplete="tel"></div>
   <div class="field"><label class="l" for="language">${L("Language for materials and instructions", "Gjuha e materialeve dhe udhëzimeve")}</label><select id="language" name="language"><option value="sq">Shqip</option><option value="en">English</option></select></div>
   <div class="field"><label class="l" for="time_pref">${L("Which time of day suits you best?", "Cila pjesë e ditës ju përshtatet më mirë?")}</label><select id="time_pref" name="time_pref"><option value="morning">${L("Morning", "Mëngjes")}</option><option value="midday">${L("Midday", "Mesditë")}</option><option value="afternoon">${L("Afternoon", "Pasdite")}</option></select></div>
   <fieldset class="q"><legend>${L("Do you currently smoke (including vaping)? For information only; it does not exclude you.", "A pini duhan aktualisht (përfshirë cigaren elektronike)? Vetëm për informim; nuk ju përjashton.")}</legend>
    <div class="opts"><div class="opt"><input type="radio" id="smy" name="smoker" value="yes"><label for="smy">${L("Yes", "Po")}</label></div><div class="opt"><input type="radio" id="smn" name="smoker" value="no"><label for="smn">${L("No", "Jo")}</label></div></div></fieldset>
   <fieldset class="q"><legend>${L("Which days can you usually attend? (tick any)", "Cilat ditë mund të vini zakonisht? (shënoni cilat të doni)")}</legend>
    <div class="opts">${[["Mon-Fri", "Mon–Fri", "Hën–Pre"], ["Sat", "Sat", "Sht"], ["Sun", "Sun", "Die"]].map((d, i) => `<div class="opt"><input type="checkbox" id="av${i}" name="avail" value="${d[0]}"><label for="av${i}">${L(d[1], d[2])}</label></div>`).join("")}</div></fieldset>
   <div class="field"><label class="l" for="availnote">${L("Anything else about your availability (optional)", "Diçka tjetër për disponueshmërinë (opsionale)")}</label><input type="text" id="availnote" maxlength="200"></div>
   <div class="check"><input type="checkbox" id="contactok"><label for="contactok">${L("I agree that NEUAR may contact me about this study using the details above.", "Jam dakord që NEUAR të më kontaktojë për këtë studim me të dhënat e mësipërme.")}</label></div>
   <button type="submit" class="btn accent" id="send">${L("Send my details", "Dërgo të dhënat e mia")}</button>
  </div>
 </form>

 <div class="result ok" id="res-ok" role="status"><h2>${L("Thank you, you may be eligible", "Faleminderit, mund të jeni i përshtatshëm")}</h2>
  ${B("<p>We will email you shortly to confirm your time slots and to send the participant information sheet and consent form. Please check your spam folder. Read the documents carefully; you can ask us anything. Nothing starts until you have given consent.</p><p>Questions? Write to <a data-contact=\"CONTACT_EMAIL\" href=\"#\">[contact email]</a>.</p>", "<p>Së shpejti do t’ju shkruajmë me email për të konfirmuar orarin tuaj dhe për t’ju dërguar fletën e informacionit dhe formularin e pëlqimit. Kontrolloni edhe dosjen e spamit. Lexojini dokumentet me kujdes; mund të na pyesni çfarëdo. Asgjë nuk fillon pa dhënë pëlqimin.</p><p>Pyetje? Shkruani te <a data-contact=\"CONTACT_EMAIL\" href=\"#\">[email kontakti]</a>.</p>")}</div>
 <div class="result no" id="res-no" role="status"><h2>${L("Thank you for your interest", "Faleminderit për interesimin")}</h2>
  ${B("<p>Based on the study criteria we cannot include you in this particular study. This is not a medical judgement and does not mean anything is wrong. If you have any health concerns, please speak to your doctor. Follow NEUAR for the results and the public workshop.</p><p><a class=\"btn ghost\" href=\"index.html\">Back to the home page</a></p>", "<p>Bazuar në kriteret e studimit nuk mund t’ju përfshijmë në këtë studim. Nuk është gjykim mjekësor dhe nuk do të thotë se diçka nuk shkon. Nëse keni shqetësime shëndetësore, flisni me mjekun tuaj. Ndiqni NEUAR për rezultatet dhe punëtorinë publike.</p><p><a class=\"btn ghost\" href=\"index.html\">Kthehu në faqen kryesore</a></p>")}</div>
 <div class="result no" id="res-err" role="alert" style="border-color:var(--err);background:var(--err-bg)"><h2>${L("Something went wrong", "Diçka shkoi keq")}</h2>
  <p>${L("We could not save your details. Please try again, or write to us at", "Nuk arritëm t’i ruajmë të dhënat tuaja. Provoni përsëri ose na shkruani te")} <a data-contact="CONTACT_EMAIL" href="#">[contact email]</a>.</p><p><button class="btn" type="button" onclick="location.reload()">${L("Try again", "Provo përsëri")}</button></p></div>
</div></section>
</main>` + footer;

fs.writeFileSync("index.html", index);
fs.writeFileSync("screening.html", screening);
console.log("built");
