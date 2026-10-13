(function () {
  "use strict";
  var C = window.SENS || {};
  var root = document.documentElement;

  /* ---------- language ---------- */
  function getLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "sq" || q === "en") return q;
    try { var s = localStorage.getItem("sens-lang"); if (s === "sq" || s === "en") return s; } catch (e) {}
    return (navigator.language || "").toLowerCase().indexOf("sq") === 0 ? "sq" : "en";
  }
  function setLang(l) {
    root.setAttribute("data-lang", l); root.setAttribute("lang", l);
    try { localStorage.setItem("sens-lang", l); } catch (e) {}
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.set === l ? "true" : "false"); });
    var t = document.querySelector("title[data-" + l + "]"); if (t) document.title = t.getAttribute("data-" + l);
  }
  document.querySelectorAll(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.set); }); });
  setLang(getLang());

  /* ---------- contact placeholders ---------- */
  document.querySelectorAll("[data-contact]").forEach(function (el) {
    var v = C[el.dataset.contact];
    if (v) { el.textContent = v; if (el.tagName === "A") el.href = (el.dataset.contact === "CONTACT_EMAIL" ? "mailto:" : "tel:") + v.replace(/\s/g, ""); }
  });
  document.querySelectorAll("[data-optional]").forEach(function (el) { if (!C[el.dataset.optional]) el.hidden = true; });
  var fd = document.querySelector("[data-fielddates]"); if (fd && C.FIELD_DATES) fd.textContent = C.FIELD_DATES;

  /* ---------- screening form ---------- */
  var form = document.getElementById("screen");
  if (!form) return;
  var configured = C.SUPABASE_URL && C.SUPABASE_URL.indexOf("YOUR-") === -1 && C.SUPABASE_ANON_KEY && C.SUPABASE_ANON_KEY.indexOf("YOUR-") === -1;
  if (!configured) { var tm = document.getElementById("testmode"); if (tm) tm.hidden = false; }

  var step1 = document.getElementById("step1"), step2 = document.getElementById("step2");
  var sum = document.getElementById("summary"), sumList = document.getElementById("summary-list");
  var resOk = document.getElementById("res-ok"), resNo = document.getElementById("res-no"), resErr = document.getElementById("res-err");
  var answers = {};

  function T(en, sq) { return root.getAttribute("lang") === "sq" ? sq : en; }
  function fail(items) {
    sumList.innerHTML = "";
    items.forEach(function (it) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = "#" + it.id; a.textContent = it.msg;
      a.addEventListener("click", function (e) { e.preventDefault(); var el = document.getElementById(it.focus || it.id); if (el) el.focus(); });
      li.appendChild(a); sumList.appendChild(li);
    });
    sum.classList.add("on"); sum.focus();
  }
  function clearErrors() { sum.classList.remove("on"); form.querySelectorAll(".invalid").forEach(function (e) { e.classList.remove("invalid"); }); }

  function computeEligible(a) {
    for (var i = 1; i <= 10; i++) { var v = a["q" + i]; if (i <= 3 && v !== "yes") return false; if (i >= 4 && v !== "no") return false; }
    return true;
  }
  function rpc(payload) {
    if (!configured) return new Promise(function (r) { setTimeout(function () { r(computeEligible(payload.answers) ? "eligible" : "not_eligible"); }, 400); });
    return fetch(C.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/rpc/submit_screening", {
      method: "POST",
      headers: (function () {
        var h = { "Content-Type": "application/json", apikey: C.SUPABASE_ANON_KEY };
        if (C.SUPABASE_ANON_KEY.indexOf("sb_") !== 0) h.Authorization = "Bearer " + C.SUPABASE_ANON_KEY; /* legacy JWT anon key */
        return h;
      })(),
      body: JSON.stringify({ p: payload })
    }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
  }
  function show(el) { [resOk, resNo, resErr].forEach(function (x) { x.classList.remove("on"); }); if (el) { el.classList.add("on"); el.setAttribute("tabindex", "-1"); el.focus(); el.scrollIntoView({ block: "center" }); } }

  document.getElementById("go1").addEventListener("click", function () {
    clearErrors(); var bad = [];
    var consent = document.getElementById("consent");
    if (!consent.checked) { consent.closest(".check").classList.add("invalid"); bad.push({ id: "consent", msg: T("Please tick the box to agree to the privacy notice.", "Ju lutemi shënoni kutinë për të pranuar njoftimin e privatësisë.") }); }
    for (var i = 1; i <= 10; i++) {
      var sel = form.querySelector('input[name="q' + i + '"]:checked');
      if (!sel) { var fs = document.getElementById("fq" + i); fs.classList.add("invalid"); bad.push({ id: "fq" + i, focus: "q" + i + "y", msg: T("Question ", "Pyetja ") + i + T(": please choose Yes or No.", ": ju lutemi zgjidhni Po ose Jo.") }); }
      else answers["q" + i] = sel.value;
    }
    if (bad.length) { fail(bad); return; }
    document.getElementById("go1").disabled = true;
    if (computeEligible(answers)) {
      step2.hidden = false; step2.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("name").focus({ preventScroll: true });
      document.getElementById("go1").disabled = false;
    } else {
      step2.hidden = true;
      rpc({ answers: answers, consent: "true", consent_version: C.CONSENT_VERSION, website: document.getElementById("website").value })
        .then(function () { show(resNo); }).catch(function () { show(resNo); }); /* neutral message even if saving fails */
      document.getElementById("go1").disabled = false;
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault(); clearErrors(); var bad = [];
    var name = document.getElementById("name"), email = document.getElementById("email"), phone = document.getElementById("phone");
    if (!name.value.trim()) { name.closest(".field").classList.add("invalid"); bad.push({ id: "name", msg: T("Please enter your name.", "Ju lutemi shkruani emrin tuaj.") }); }
    if (!email.value.trim() && !phone.value.trim()) { email.closest(".field").classList.add("invalid"); bad.push({ id: "email", msg: T("Please give an email address or a phone number.", "Ju lutemi jepni një email ose një numër telefoni.") }); }
    else if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.closest(".field").classList.add("invalid"); bad.push({ id: "email", msg: T("This email address does not look right.", "Ky email nuk duket i saktë.") }); }
    if (!document.getElementById("contactok").checked) { document.getElementById("contactok").closest(".check").classList.add("invalid"); bad.push({ id: "contactok", msg: T("Please tick the box so we may contact you.", "Ju lutemi shënoni kutinë që të mund t’ju kontaktojmë.") }); }
    if (bad.length) { fail(bad); return; }
    var btn = document.getElementById("send"); btn.disabled = true;
    var avail = Array.prototype.map.call(form.querySelectorAll('input[name="avail"]:checked'), function (x) { return x.value; }).join(", ");
    var extra = document.getElementById("availnote").value.trim();
    rpc({
      answers: answers, consent: "true", consent_version: C.CONSENT_VERSION, website: document.getElementById("website").value,
      name: name.value.trim(), email: email.value.trim(), phone: phone.value.trim(),
      language: form.language.value, time_pref: form.time_pref.value, smoker: (form.querySelector('input[name="smoker"]:checked') || {}).value || "",
      availability: (avail + (extra ? " | " + extra : "")).slice(0, 400)
    }).then(function (o) {
      if (o === "eligible") { form.hidden = true; show(resOk); } else { form.hidden = true; show(resNo); }
    }).catch(function () { btn.disabled = false; show(resErr); });
  });
})();
