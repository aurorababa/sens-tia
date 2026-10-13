const fs = require("fs");
const L = (en, sq, tag = "span") => `<${tag} lang="en" data-l="en">${en}</${tag}><${tag} lang="sq" data-l="sq">${sq}</${tag}>`;
const P = (en, sq) => L(`<p>${en}</p>`, `<p>${sq}</p>`, "div").replace(/<div /g, '<div style="display:contents" ');
// block-level bilingual: wrap each language in a div
const B = (en, sq) => `<div lang="en" data-l="en">${en}</div><div lang="sq" data-l="sq">${sq}</div>`;

const head = (titleEn, titleSq, desc) => `<!doctype html>
<html lang="en" data-lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title data-en="${titleEn}" data-sq="${titleSq}">${titleEn}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#004F91">
<meta property="og:title" content="${titleEn}"><meta property="og:description" content="${desc}"><meta property="og:image" content="assets/img/share.png">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/roboto-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/style.css">
</head>`;

const header = (page) => `<body>
<a class="skip" href="#main">${L("Skip to main content", "Kalo te përmbajtja kryesore")}</a>
<header class="top">
 <div class="wrap">
  <div class="logos">
   <a href="index.html" aria-label="NEUAR, SENS-TIA home"><img src="assets/img/neuar.png" alt="NEUAR, Neuroscience for Urban Spaces and Architecture" width="140" height="48"></a>
   <img class="round" src="assets/img/ihre.png" alt="IHRE, Institute of Human Rights and Non-Formal Education" width="54" height="54">
   <img src="assets/img/efb.png" alt="EFB, European Fund for the Balkans" width="42" height="48">
  </div>
  <nav class="main" aria-label="${"Main"}">
   <a href="index.html#study">${L("The study", "Studimi")}</a>
   <a href="index.html#involves">${L("What it involves", "Çfarë përfshin")}</a>
   <a href="index.html#who">${L("Who we are", "Kush jemi")}</a>
   <a href="index.html#faq">${L("Questions", "Pyetje")}</a>
   <a class="btn" style="min-height:44px;padding:.4rem 1rem" href="screening.html"${page === "screening" ? ' aria-current="page"' : ""}>${L("Check eligibility", "Kontrollo përshtatshmërinë")}</a>
   <div class="lang" role="group" aria-label="Language / Gjuha"><button type="button" data-set="en" aria-pressed="true" lang="en">EN</button><button type="button" data-set="sq" aria-pressed="false" lang="sq">SQ</button></div>
  </nav>
 </div>
</header>`;

const footer = `<footer>
 <div class="wrap">
  <h2>${L("Contact", "Kontakt")}</h2>
  <p>${L("Questions about the study? Write or call us:", "Pyetje për studimin? Shkruani ose na telefononi:")}
   <a data-contact="CONTACT_EMAIL" href="#">[contact email]</a><span data-optional="CONTACT_PHONE"> · <a data-contact="CONTACT_PHONE" href="#">[phone]</a></span></p>
  <div class="logos" style="margin-top:20px">
   <img src="assets/img/neuar.png" alt="NEUAR" width="140" height="48">
   <img class="round" src="assets/img/ihre.png" alt="IHRE" width="56" height="56">
   <img src="assets/img/efb.png" alt="European Fund for the Balkans" width="50" height="56">
  </div>
  <small>${L(
   "SENS-TIA is a pilot field study run by NEUAR (Neuroscience for Urban Spaces and Architecture) with the Institute of Human Rights and Non-Formal Education (IHRE), funded by the European Fund for the Balkans (EFB). The content of this website is the sole responsibility of NEUAR and does not necessarily reflect the views of the funder. [Check the funder’s required wording.]",
   "SENS-TIA është një studim pilot në terren i zhvilluar nga NEUAR (Neuroscience for Urban Spaces and Architecture) me Institutin e të Drejtave të Njeriut dhe Arsimit Joformal (IHRE), i financuar nga Fondi Evropian për Ballkanin (EFB). Përmbajtja e kësaj faqeje është përgjegjësi vetëm e NEUAR dhe nuk pasqyron domosdoshmërisht qëndrimet e financuesit. [Kontrolloni formulimin e kërkuar nga financuesi.]")}</small>
  <small>${L("This study has not been reviewed by a research ethics committee. See “Your safety, privacy and rights” on the home page.", "Ky studim nuk është shqyrtuar nga një komitet etik kërkimor. Shihni “Siguria, privatësia dhe të drejtat tuaja” në faqen kryesore.")}</small>
 </div>
</footer>
<script src="assets/config.js"></script>
<script src="assets/app.js"></script>
</body></html>`;

/* ---------- original SVG illustrations ---------- */
const heroSvg = `<svg viewBox="0 0 520 420" role="img" aria-labelledby="ht hd" xmlns="http://www.w3.org/2000/svg">
<title id="ht">${"Illustration of the study design"}</title>
<desc id="hd">A walking route linking three places in Tirana: a road, a park and a lakeside path, with a heart-rate trace underneath.</desc>
<rect width="520" height="420" rx="22" fill="#fff" stroke="#C9D6E3"/>
<g fill="none" stroke="#DCE9F6" stroke-width="1"><path d="M0 70H520M0 140H520M0 210H520M0 280H520M0 350H520M80 0V420M160 0V420M240 0V420M320 0V420M400 0V420M480 0V420"/></g>
<path d="M60 230 C120 120 190 120 250 190 S380 300 450 150" fill="none" stroke="#004F91" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14"/>
<g>
 <circle cx="60" cy="230" r="30" fill="#004F91"/><text x="60" y="238" text-anchor="middle" font-family="Roboto,Arial" font-weight="700" font-size="22" fill="#fff">R</text>
 <circle cx="250" cy="190" r="30" fill="#0B6B3A"/><text x="250" y="198" text-anchor="middle" font-family="Roboto,Arial" font-weight="700" font-size="22" fill="#fff">P</text>
 <circle cx="450" cy="150" r="30" fill="#F68037"/><text x="450" y="158" text-anchor="middle" font-family="Roboto,Arial" font-weight="700" font-size="22" fill="#0A2F57">L</text>
</g>
<g font-family="Roboto,Arial" font-size="15" fill="#16222E" font-weight="500">
 <text x="60" y="282" text-anchor="middle">Road</text><text x="250" y="242" text-anchor="middle">Park</text><text x="450" y="112" text-anchor="middle">Lakeside</text>
</g>
<path d="M30 350 H120 l14 -34 l22 70 l20 -92 l18 56 l14 -22 H250 l14 -34 l22 70 l20 -92 l18 56 l14 -22 H490" fill="none" stroke="#F68037" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<text x="30" y="404" font-family="Roboto,Arial" font-size="14" fill="#4A5A6A">heart rate · blood pressure · oxygen · attention · mood</text>
</svg>`;
const icoRoad = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#DCE9F6"/><path d="M24 58 L28 6 M40 58 L36 6" stroke="#004F91" stroke-width="4" fill="none"/><path d="M32 12v8M32 28v8M32 44v8" stroke="#F68037" stroke-width="4" stroke-linecap="round"/></svg>`;
const icoPark = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#E7F5EC"/><circle cx="24" cy="26" r="11" fill="#0B6B3A"/><circle cx="40" cy="30" r="9" fill="#0B6B3A"/><rect x="22" y="34" width="4" height="16" fill="#0A2F57"/><rect x="38" y="36" width="4" height="14" fill="#0A2F57"/></svg>`;
const icoLake = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#FFF3EA"/><path d="M12 28c5-5 9 5 14 0s9 5 14 0 9 5 12 0M12 40c5-5 9 5 14 0s9 5 14 0 9 5 12 0M12 52c5-5 9 5 14 0s9 5 14 0 9 5 12 0" stroke="#004F91" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="46" cy="18" r="6" fill="#F68037"/></svg>`;
const icoHeart = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#DCE9F6"/><path d="M10 34h12l5-12 8 24 6-16h13" stroke="#004F91" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const icoBrain = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#DCE9F6"/><path d="M32 16c-6-5-16 0-14 8-5 3-3 11 2 12-1 7 7 11 12 7 5 4 13 0 12-7 5-1 7-9 2-12 2-8-8-13-14-8z" fill="none" stroke="#004F91" stroke-width="3.5"/><path d="M32 16v30" stroke="#F68037" stroke-width="3.5"/></svg>`;
const icoMood = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#FFF3EA"/><circle cx="32" cy="32" r="16" fill="none" stroke="#004F91" stroke-width="3.5"/><circle cx="26" cy="28" r="2.5" fill="#004F91"/><circle cx="38" cy="28" r="2.5" fill="#004F91"/><path d="M24 37c4 5 12 5 16 0" stroke="#F68037" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`;

fs.writeFileSync("assets/img/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#004F91"/><path d="M8 36h12l5-14 8 26 6-18h17" stroke="#F68037" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`);

/* ---------- INDEX ---------- */
const index = head("SENS-TIA: volunteers wanted in Tirana | NEUAR", "SENS-TIA: kërkohen vullnetarë në Tiranë | NEUAR",
  "A pilot field study in Tirana on how a busy road, a park and a lakeside path affect heart rate, blood pressure and mood. Volunteers aged 18 to 65 wanted.") + header("home") + `
<main id="main">
<section class="hero" aria-labelledby="h1">
 <div class="wrap grid">
  <div>
   <p class="eyebrow">${L("Volunteers wanted · Tirana", "Kërkohen vullnetarë · Tiranë")}</p>
   <h1 id="h1">${L("Does where you walk change how your body copes with stress?", "A ndryshon vendi ku ecni mënyrën si trupi juaj përballon stresin?")}</h1>
   <p class="lede">${L(
    "SENS-TIA is a pilot study by NEUAR. We invite adults to take part in six short, supervised walks and compare a busy road, a park and a lakeside path, measuring heart rate, blood pressure, attention and mood.",
    "SENS-TIA është një studim pilot i NEUAR. Ftojmë të rritur të marrin pjesë në gjashtë ecje të shkurtra me mbikëqyrje dhe të krahasojmë një rrugë me trafik, një park dhe një shteg buzë liqenit, duke matur ritmin e zemrës, tensionin, vëmendjen dhe humorin.")}</p>
   <ul class="facts">
    <li>${L("Adults 18–65", "Të rritur 18–65 vjeç")}</li><li>${L("6 sessions, about 1 hour", "6 seanca, rreth 1 orë")}</li><li>${L("15-minute walk", "Ecje 15 minutash")}</li><li>${L("Non-invasive · voluntary", "Jo-invazive · vullnetare")}</li>
   </ul>
   <div class="btns">
    <a class="btn accent" href="screening.html">${L("Check if you can take part", "Kontrolloni nëse mund të merrni pjesë")}</a>
    <a class="btn ghost" href="#involves">${L("What does it involve?", "Çfarë përfshin?")}</a>
   </div>
  </div>
  <div>${heroSvg}</div>
 </div>
</section>

<section id="study" aria-labelledby="h-study">
 <div class="wrap">
  <p class="eyebrow">${L("The study", "Studimi")}</p>
  <h2 id="h-study">${L("What we want to find out", "Çfarë duam të zbulojmë")}</h2>
  ${B(`<p>Cities shape how we feel, but we know little about how everyday places in Tirana affect the body in real time. SENS-TIA compares three places on the same type of short walk and asks whether the body and mind recover differently after a walk on a busy road, in the Grand Park or along the artificial lake.</p>`,
      `<p>Qytetet ndikojnë në mënyrën si ndihemi, por dimë pak se si vendet e përditshme në Tiranë ndikojnë në trup në kohë reale. SENS-TIA krahason tre vende me të njëjtin lloj ecjeje të shkurtër dhe pyet nëse trupi dhe mendja rimëkëmben ndryshe pas një ecjeje në një rrugë me trafik, në Parkun e Madh ose buzë liqenit artificial.</p>`)}
  <div class="cards">
   <div class="card">${icoHeart}<h3>${L("Body", "Trupi")}</h3><p>${L("Heart rate and its variability (chest strap), blood pressure and blood oxygen (fingertip sensor).", "Ritmi i zemrës dhe ndryshueshmëria e tij (rrip në gjoks), tensioni dhe oksigjeni në gjak (sensor në gisht).")}</p></div>
   <div class="card o">${icoBrain}<h3>${L("Attention and memory", "Vëmendja dhe kujtesa")}</h3><p>${L("A short number-repeating task and a few questions about what you remember from the walk.", "Një detyrë e shkurtër përsëritjeje numrash dhe disa pyetje për atë që kujtoni nga ecja.")}</p></div>
   <div class="card">${icoMood}<h3>${L("Stress and mood", "Stresi dhe humori")}</h3><p>${L("Short, established questionnaires about stress, calm and how restorative the place felt.", "Pyetësorë të shkurtër dhe të njohur për stresin, qetësinë dhe sa çlodhës ishte vendi.")}</p></div>
  </div>
 </div>
</section>

<section class="alt" id="places" aria-labelledby="h-places">
 <div class="wrap">
  <h2 id="h-places">${L("Three places, one type of walk", "Tre vende, një lloj ecjeje")}</h2>
  <div class="cards">
   <div class="card">${icoRoad}<h3>${L("Road corridor", "Korridori i rrugës")}</h3><p>${L("A busy street with traffic, crossings and noise.", "Një rrugë e ngarkuar me trafik, kalime këmbësorësh dhe zhurmë.")}</p></div>
   <div class="card">${icoPark}<h3>${L("Park", "Parku")}</h3><p>${L("Tree-lined paths in the Grand Park (Parku i Madh).", "Shtigje me pemë në Parkun e Madh.")}</p></div>
   <div class="card o">${icoLake}<h3>${L("Lakeside path", "Shtegu buzë liqenit")}</h3><p>${L("The path along the artificial lake, with open water views.", "Shtegu buzë liqenit artificial, me pamje të hapur drejt ujit.")}</p></div>
  </div>
 </div>
</section>

<section id="involves" aria-labelledby="h-inv">
 <div class="wrap">
  <p class="eyebrow">${L("Taking part", "Pjesëmarrja")}</p>
  <h2 id="h-inv">${L("What taking part involves", "Çfarë përfshin pjesëmarrja")}</h2>
  <ol class="steps">
   <li><div>${L("<strong>Check eligibility.</strong> Ten quick yes/no questions (about 3 minutes). We keep no health answers.", "<strong>Kontrolloni përshtatshmërinë.</strong> Dhjetë pyetje të shpejta po/jo (rreth 3 minuta). Nuk ruajmë asnjë përgjigje shëndetësore.")}</div></li>
   <li><div>${L("<strong>Read the information sheet and give consent.</strong> We send it at least 24 hours before your first session. You can ask questions.", "<strong>Lexoni fletën e informacionit dhe jepni pëlqimin.</strong> Ua dërgojmë të paktën 24 orë përpara seancës së parë. Mund të bëni pyetje.")}</div></li>
   <li><div>${L("<strong>Six sessions of about one hour</strong> over about 2–3 weeks, in pairs: a seated rest, short measurements, a <strong>15-minute walk</strong> with a researcher behind you, a rest, and short questionnaires.", "<strong>Gjashtë seanca prej rreth një ore</strong> gjatë rreth 2–3 javësh, në çifte: pushim i ulur, matje të shkurtra, një <strong>ecje 15 minutash</strong> me një studiues pas jush, pushim dhe pyetësorë të shkurtër.")}</div></li>
   <li><div>${L("<strong>Stay in control.</strong> You can stop at any moment, without giving a reason and without any consequence.", "<strong>Mbani kontrollin.</strong> Mund të ndaleni në çdo moment, pa dhënë arsye dhe pa asnjë pasojë.")}</div></li>
  </ol>
  <p style="margin-top:1.4rem">${L("Field dates: <strong data-fielddates>[dates to be confirmed]</strong>. Sessions run in daylight and are cancelled in bad weather.", "Datat në terren: <strong data-fielddates>[datat do të konfirmohen]</strong>. Seancat zhvillohen ditën dhe anulohen kur moti është i keq.")}</p>
  <div class="btns"><a class="btn" href="screening.html">${L("Check if you can take part", "Kontrolloni nëse mund të merrni pjesë")}</a></div>
 </div>
</section>

<section class="alt" id="who" aria-labelledby="h-who">
 <div class="wrap">
  <p class="eyebrow">${L("Who is behind SENS-TIA", "Kush qëndron pas SENS-TIA")}</p>
  <h2 id="h-who">${L("Organisers and funder", "Organizatorët dhe financuesi")}</h2>
  <div class="partners">
   <div class="partner"><img src="assets/img/neuar.png" alt="NEUAR" width="244" height="84">
    <h3>NEUAR</h3>
    <p>${L("Neuroscience for Urban Spaces and Architecture is a Tirana-based initiative linking neuroscience, urban design and public health. It designs and runs SENS-TIA and will publish the results.", "Neuroscience for Urban Spaces and Architecture është një nismë me bazë në Tiranë që lidh neuroshkencën, dizajnin urban dhe shëndetin publik. Ajo projekton dhe zhvillon SENS-TIA dhe do t’i publikojë rezultatet.")}</p></div>
   <div class="partner"><img class="round" src="assets/img/ihre.png" alt="IHRE" width="84" height="84">
    <h3>IHRE</h3>
    <p>${L("The Institute of Human Rights and Non-Formal Education hosts the grant and supports the project as a partner organisation. [Confirm the wording of IHRE’s role.]", "Instituti i të Drejtave të Njeriut dhe Arsimit Joformal pret grantin dhe mbështet projektin si organizatë partnere. [Konfirmoni formulimin e rolit të IHRE.]")}</p></div>
   <div class="partner"><img src="assets/img/efb.png" alt="European Fund for the Balkans" width="74" height="84">
    <h3>European Fund for the Balkans</h3>
    <p>${L("SENS-TIA is funded by a small grant from the European Fund for the Balkans (EFB), which supports civil-society initiatives in the Western Balkans. Funding covers the study; participation is voluntary.", "SENS-TIA financohet nga një grant i vogël i Fondit Evropian për Ballkanin (EFB), i cili mbështet nisma të shoqërisë civile në Ballkanin Perëndimor. Financimi mbulon studimin; pjesëmarrja është vullnetare.")}</p></div>
  </div>
 </div>
</section>

<section id="rights" aria-labelledby="h-rights">
 <div class="wrap">
  <p class="eyebrow">${L("Transparency", "Transparenca")}</p>
  <h2 id="h-rights">${L("Your safety, privacy and rights", "Siguria, privatësia dhe të drejtat tuaja")}</h2>
  <div class="notice">
   ${B(`<p><strong>Ethics review.</strong> SENS-TIA has <strong>not</strong> been reviewed by a research ethics committee. We say this openly. We follow the principles of the Declaration of Helsinki, use plain-language information and written consent, screen for safety, keep a researcher with you at all times and stop at any sign of discomfort. We are seeking independent advisory review, and any publication will state this limitation.</p>`,
       `<p><strong>Shqyrtimi etik.</strong> SENS-TIA <strong>nuk</strong> është shqyrtuar nga një komitet etik kërkimor. E themi hapur. Ndjekim parimet e Deklaratës së Helsinkit, përdorim informacion me gjuhë të thjeshtë dhe pëlqim me shkrim, bëjmë përzgjedhje për siguri, mbajmë një studiues me ju gjatë gjithë kohës dhe ndalojmë në çdo shenjë shqetësimi. Po kërkojmë shqyrtim këshillimor të pavarur dhe çdo publikim do ta shprehë këtë kufizim.</p>`)}
  </div>
  <div style="margin-top:1.4rem">
  <details><summary>${L("Who can take part, and who cannot?", "Kush mund të marrë pjesë dhe kush jo?")}</summary><div class="in">${B(`<p>Adults aged 18 to 65 who live, work or study in Tirana and can walk steadily for 15 minutes. We cannot include people with heart or breathing conditions, an implanted electronic device, medication that affects heart rate or blood pressure, or pregnancy. This is a safety rule, not a medical judgement.</p>`, `<p>Të rritur 18–65 vjeç që jetojnë, punojnë ose studiojnë në Tiranë dhe mund të ecin me ritëm të qëndrueshëm për 15 minuta. Nuk mund të përfshijmë persona me sëmundje të zemrës ose të frymëmarrjes, pajisje elektronike të implantuar, ilaçe që ndikojnë në ritmin e zemrës ose tensionin, ose shtatzëni. Është rregull sigurie, jo gjykim mjekësor.</p>`)}</div></details>
  <details><summary>${L("How is my data protected?", "Si mbrohen të dhënat e mia?")}</summary><div class="in">${B(`<p>Your measurements and answers carry a code, never your name. Your name and contact details are kept separately and only by the lead researcher. Data are stored in a secured database in the EU and used for research only. The GPS track records the walking route, not your home. We follow Albanian Law no. 124/2024 on personal data protection. You may ask to see or delete your data or withdraw at any time. [Data controller and contact: confirm.]</p>`, `<p>Matjet dhe përgjigjet tuaja mbajnë një kod, kurrë emrin tuaj. Emri dhe kontakti ruhen veçmas dhe vetëm nga studiuesja kryesore. Të dhënat ruhen në një bazë të dhënash të sigurt në BE dhe përdoren vetëm për kërkim. Gjurma GPS regjistron itinerarin e ecjes, jo shtëpinë tuaj. Ndjekim Ligjin nr. 124/2024 për mbrojtjen e të dhënave personale. Mund të kërkoni të shihni ose fshini të dhënat tuaja ose të tërhiqeni në çdo kohë. [Kontrolluesi i të dhënave dhe kontakti: konfirmoni.]</p>`)}</div></details>
  </div>
 </div>
</section>

<section class="alt" id="faq" aria-labelledby="h-faq">
 <div class="wrap">
  <h2 id="h-faq">${L("Frequently asked questions", "Pyetje të shpeshta")}</h2>
  <details><summary>${L("Is this a medical test?", "A është ky një test mjekësor?")}</summary><div class="in">${B("<p>No. We take research measurements and do not diagnose or give medical advice. If a reading is outside a safe range before a walk, we ask you to rest and may suggest you speak to a doctor.</p>", "<p>Jo. Marrim matje kërkimore dhe nuk bëjmë diagnozë as japim këshilla mjekësore. Nëse një matje është jashtë intervalit të sigurt para ecjes, ju kërkojmë të pushoni dhe mund të sugjerojmë të flisni me mjekun.</p>")}</div></details>
  <details><summary>${L("Why six sessions?", "Pse gjashtë seanca?")}</summary><div class="in">${B("<p>Each person walks each of the three places twice. Repeating the walks lets us compare places within the same person, which is more reliable with a small group.</p>", "<p>Çdo person ecën në secilin nga tre vendet dy herë. Përsëritja i lejon krahasimet brenda të njëjtit person, çka është më e besueshme me një grup të vogël.</p>")}</div></details>
  <details><summary>${L("Do I walk alone?", "A eci vetëm?")}</summary><div class="in">${B("<p>You come with another participant but walk separately, with a researcher a few metres behind you. You are never asked to go anywhere alone.</p>", "<p>Vini me një pjesëmarrës tjetër por ecni veçmas, me një studiues disa metra pas jush. Nuk ju kërkohet kurrë të shkoni diku vetëm.</p>")}</div></details>
  <details><summary>${L("What if the weather is bad?", "Çfarë ndodh nëse moti është i keq?")}</summary><div class="in">${B("<p>Sessions are postponed in heavy rain, storms, strong wind, extreme heat or high pollution. We reschedule with you.</p>", "<p>Seancat shtyhen në shi të fortë, stuhi, erë të fortë, nxehtësi ekstreme ose ndotje të lartë. E riplanifikojmë me ju.</p>")}</div></details>
  <details><summary>${L("Will I get paid?", "A do të paguhem?")}</summary><div class="in">${B("<p>[State here whether there is any compensation or thank-you gift.]</p>", "<p>[Shkruani këtu nëse ka kompensim ose dhuratë falënderimi.]</p>")}</div></details>
  <details><summary>${L("Will I see the results?", "A do t’i shoh rezultatet?")}</summary><div class="in">${B("<p>Yes. We plan a public summary and workshop. You may also ask for a plain-language summary of your own readings; this is never a diagnosis.</p>", "<p>Po. Planifikojmë një përmbledhje publike dhe një punëtori. Mund të kërkoni edhe një përmbledhje të thjeshtë të matjeve tuaja; kjo nuk është kurrë diagnozë.</p>")}</div></details>
 </div>
</section>

<section id="docs" aria-labelledby="h-docs">
 <div class="wrap">
  <h2 id="h-docs">${L("Documents to download", "Dokumente për shkarkim")}</h2>
  <p>${L("Read these before you decide. PDF files, English and Albanian.", "Lexojini përpara se të vendosni. Skedarë PDF, anglisht dhe shqip.")}</p>
  <div class="docs">
   <a class="doc" href="docs/SENS-TIA_Participant_Information_and_Consent.pdf"><strong>${L("Participant information and consent form", "Informacioni për pjesëmarrësin dhe formulari i pëlqimit")}</strong><span>PDF · EN / SQ</span></a>
   <a class="doc" href="docs/SENS-TIA_Call_for_Participants.pdf"><strong>${L("Call for participants (printable)", "Thirrje për pjesëmarrës (për printim)")}</strong><span>PDF · EN / SQ</span></a>
  </div>
 </div>
</section>
</main>` + footer;

/* ---------- SCREENING ---------- */
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
<section class="hero" style="padding-bottom:20px"><div class="wrap">
 <p class="eyebrow">${L("Step 1 of 3", "Hapi 1 nga 3")}</p>
 <h1>${L("Eligibility check", "Kontrolli i përshtatshmërisë")}</h1>
 <p class="lede">${L("Ten quick yes/no questions. It takes about 3 minutes. It is a safety check, not a medical examination. You do not need to explain any answer.", "Dhjetë pyetje të shpejta po/jo. Zgjat rreth 3 minuta. Është kontroll sigurie, jo ekzaminim mjekësor. Nuk keni nevojë të shpjegoni asnjë përgjigje.")}</p>
</div></section>
<section style="padding-top:20px"><div class="wrap formbox">
 <p class="testmode" id="testmode" hidden><strong>TEST MODE</strong> · The database is not connected yet. Nothing is saved.</p>
 <details open><summary>${L("Privacy notice (please read)", "Njoftimi i privatësisë (ju lutemi lexojeni)")}</summary><div class="in">${B(
 `<p><strong>Who:</strong> NEUAR, Tirana, [data controller details]. <strong>Why:</strong> to decide whether the walking study is safe and suitable for you, and to contact you if it is. <strong>What we keep:</strong> we do <em>not</em> keep your yes/no health answers, only “eligible” or “not eligible”. If you are eligible we also keep the name and contact details you give, your language and time preference, whether you smoke, and your availability. If you are not eligible we keep nothing about you.</p><p><strong>Where:</strong> a secured database in the EU (Supabase). <strong>How long:</strong> until the study ends, then deleted or anonymised [confirm]. <strong>Your rights:</strong> to access, correct or delete your data and to withdraw at any time, by writing to <a data-contact="CONTACT_EMAIL" href="#">[contact email]</a>. This study has not been reviewed by a research ethics committee.</p>`,
 `<p><strong>Kush:</strong> NEUAR, Tiranë, [të dhënat e kontrolluesit]. <strong>Pse:</strong> për të vendosur nëse studimi është i sigurt dhe i përshtatshëm për ju dhe për t’ju kontaktuar nëse është. <strong>Çfarë ruajmë:</strong> <em>nuk</em> i ruajmë përgjigjet po/jo për shëndetin, vetëm “i përshtatshëm” ose “jo i përshtatshëm”. Nëse jeni i përshtatshëm ruajmë edhe emrin dhe kontaktin që jepni, gjuhën dhe orarin e preferuar, nëse pini duhan dhe disponueshmërinë. Nëse nuk jeni i përshtatshëm nuk ruajmë asgjë për ju.</p><p><strong>Ku:</strong> një bazë të dhënash e sigurt në BE (Supabase). <strong>Sa kohë:</strong> deri në fund të studimit, pastaj fshihen ose anonimizohen [konfirmoni]. <strong>Të drejtat tuaja:</strong> të aksesoni, korrigjoni ose fshini të dhënat dhe të tërhiqeni në çdo kohë, duke shkruar te <a data-contact="CONTACT_EMAIL" href="#">[email kontakti]</a>. Ky studim nuk është shqyrtuar nga një komitet etik kërkimor.</p>`)}</div></details>
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
   <div class="field"><label class="l" for="email">${L("Email", "Email")}</label><span class="hint">${L("Email or phone is enough; both is better.", "Mjafton email ose telefon; të dyja është më mirë.")}</span><input type="email" id="email" name="email" autocomplete="email"></div>
   <div class="field"><label class="l" for="phone">${L("Phone (optional if you gave an email)", "Telefon (opsional nëse dhatë email)")}</label><input type="tel" id="phone" name="phone" autocomplete="tel"></div>
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
  ${B("<p>We will contact you within [2–3 days] with the participant information sheet and the consent form. Please read them carefully; you can ask us anything. Nothing starts until you have given consent.</p><p>If you do not hear from us, write to <a data-contact=\"CONTACT_EMAIL\" href=\"#\">[contact email]</a>.</p>", "<p>Do t’ju kontaktojmë brenda [2–3 ditësh] me fletën e informacionit dhe formularin e pëlqimit. Lexojini me kujdes; mund të na pyesni çfarëdo. Asgjë nuk fillon pa dhënë pëlqimin.</p><p>Nëse nuk merrni lajm nga ne, shkruani te <a data-contact=\"CONTACT_EMAIL\" href=\"#\">[email kontakti]</a>.</p>")}</div>
 <div class="result no" id="res-no" role="status"><h2>${L("Thank you for your interest", "Faleminderit për interesimin")}</h2>
  ${B("<p>Based on the study criteria we cannot include you in this particular study. This is not a medical judgement and does not mean anything is wrong. If you have any health concerns, please speak to your doctor. Follow NEUAR for the results and the public workshop.</p><p><a class=\"btn ghost\" href=\"index.html\">Back to the home page</a></p>", "<p>Bazuar në kriteret e studimit nuk mund t’ju përfshijmë në këtë studim. Nuk është gjykim mjekësor dhe nuk do të thotë se diçka nuk shkon. Nëse keni shqetësime shëndetësore, flisni me mjekun tuaj. Ndiqni NEUAR për rezultatet dhe punëtorinë publike.</p><p><a class=\"btn ghost\" href=\"index.html\">Kthehu në faqen kryesore</a></p>")}</div>
 <div class="result no" id="res-err" role="alert" style="border-color:var(--err);background:var(--err-bg)"><h2>${L("Something went wrong", "Diçka shkoi keq")}</h2>
  <p>${L("We could not save your details. Please try again, or write to us at", "Nuk arritëm t’i ruajmë të dhënat tuaja. Provoni përsëri ose na shkruani te")} <a data-contact="CONTACT_EMAIL" href="#">[contact email]</a>.</p><p><button class="btn" type="button" onclick="location.reload()">${L("Try again", "Provo përsëri")}</button></p></div>
</div></section>
</main>` + footer;

fs.writeFileSync("index.html", index);
fs.writeFileSync("screening.html", screening);
console.log("built");
