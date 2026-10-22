/* SENS-TIA study page (researcher tablet + participant). ES5, no framework.
   Flow: key gate -> enter participant code -> sequenced dashboard -> forms / photo test / researcher log.
   Everything is sent through an outbox in localStorage, so a weak connection loses nothing. */
(function () {
  "use strict";
  var SPEC = window.SPEC, C = window.SENS || {};
  var BASE = (C.SUPABASE_URL || "").replace(/\/$/, "") + "/rest/v1/rpc/";
  var app = document.getElementById("app"), bar = document.getElementById("bar");
  var root = document.documentElement;
  var SK = { key: "sens-study-key", outbox: "sens-study-outbox", failed: "sens-study-failed", recent: "sens-study-recent", lang: "sens-lang" };

  /* ---------- tiny helpers ---------- */
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } return null; }
  function lsj(k, def) { var s = ls(k); if (!s) return def; try { return JSON.parse(s); } catch (e) { return def; } }
  function lang() { return root.getAttribute("lang") === "sq" ? "sq" : "en"; }
  function T(en, sq) { return lang() === "sq" ? sq : en; }
  function tx(x) { if (x === null || x === undefined) return ""; if (typeof x === "string") return x; return x[lang()] || x.en; }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag), k;
    if (attrs) for (k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c === null || c === undefined || c === false) return; e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function uuid() {
    var b = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var s = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return s.slice(0, 8) + "-" + s.slice(8, 12) + "-" + s.slice(12, 16) + "-" + s.slice(16, 20) + "-" + s.slice(20);
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function show(nodes) { app.innerHTML = ""; (nodes.nodeType ? [nodes] : nodes).forEach(function (n) { app.appendChild(n); }); window.scrollTo(0, 0); }
  function siteName(code) { return tx(SPEC.SITES[code]); }
  function walkSite(n) { return S.state && S.state.order ? S.state.order.charAt(n - 1) : ""; }

  /* ---------- state ---------- */
  var S = { key: ls(SK.key) || "", state: null, view: null, retryTimer: null, flushing: false, authBad: false };

  /* ---------- server calls ---------- */
  function call(fn, body) {
    return fetch(BASE + fn, {
      method: "POST",
      headers: (function () {
        var hd = { "Content-Type": "application/json", apikey: C.SUPABASE_ANON_KEY };
        if (C.SUPABASE_ANON_KEY && C.SUPABASE_ANON_KEY.indexOf("sb_") !== 0) hd.Authorization = "Bearer " + C.SUPABASE_ANON_KEY;
        return hd;
      })(),
      body: JSON.stringify(body)
    }).then(function (r) {
      if (r.ok) return r.json();
      return r.text().then(function (t) {
        var e = new Error("http " + r.status + " " + t.slice(0, 200));
        e.status = r.status; e.auth = (r.status === 401 || r.status === 403); e.validation = (r.status >= 400 && r.status < 500 && !e.auth && r.status !== 408 && r.status !== 429);
        throw e;
      });
    }, function (err) { err.net = true; throw err; });
  }

  /* ---------- outbox ---------- */
  function outbox() { return lsj(SK.outbox, []); }
  function setOutbox(a) { ls(SK.outbox, JSON.stringify(a)); }
  function failedList() { return lsj(SK.failed, []); }
  function enqueue(item) { var a = outbox(); a.push(item); setOutbox(a); flush(); paintBar(); }
  function pendingKeys(code) {
    var out = [];
    outbox().forEach(function (it) { if (it.code === code && it.doneKey) out.push(it.doneKey); });
    return out;
  }
  function flush() {
    if (S.flushing || S.authBad || !S.key) return;
    var a = outbox();
    if (!a.length) { paintBar(); return; }
    S.flushing = true; paintBar();
    var it = a[0];
    var body = { p_key: S.key, p: it.body };
    call(it.fn, body).then(function () {
      var cur = outbox().filter(function (x) { return x.id !== it.id; }); setOutbox(cur);
      S.flushing = false; flush();
    }, function (err) {
      S.flushing = false;
      if (err.auth) { S.authBad = true; paintBar(); return; }
      if (err.validation) {
        var f = failedList(); it.error = String(err.message); f.push(it); ls(SK.failed, JSON.stringify(f));
        setOutbox(outbox().filter(function (x) { return x.id !== it.id; })); flush(); return;
      }
      paintBar(); clearTimeout(S.retryTimer); S.retryTimer = setTimeout(flush, 15000);
    });
  }
  window.addEventListener("online", flush);

  /* ---------- status bar ---------- */
  function paintBar() {
    bar.innerHTML = "";
    var n = outbox().length, f = failedList().length, st;
    if (S.authBad) st = h("span", { class: "st bad", text: "Key not accepted. Items are kept on this device." });
    else if (f) st = h("span", { class: "st bad", text: f + " item(s) could not be saved" });
    else if (n) st = h("span", { class: "st wait", text: (S.flushing ? "Sending… " : "Waiting to send: ") + n });
    else st = h("span", { class: "st ok", text: "All saved" });
    var left = h("div", {}, [st]);
    if (S.state && S.state.exists) left.appendChild(h("span", { class: "who", text: "  ·  " + S.state.code + (S.state.is_test ? " (test)" : "") + "  ·  order " + S.state.order }));
    var right = h("div", { class: "row" });
    if (n || f || S.authBad) right.appendChild(h("button", { type: "button", text: "Details", onclick: viewOutbox }));
    if (S.key) {
      right.appendChild(h("button", { type: "button", text: "Participants", onclick: function () { S.state = null; viewHome(); } }));
    }
    bar.appendChild(left); bar.appendChild(right);
  }

  /* ---------- view: outbox details ---------- */
  function viewOutbox() {
    var kids = [h("h1", { text: "Unsent and failed items" })];
    var a = outbox(), f = failedList();
    kids.push(h("p", { class: "muted", text: "Nothing is lost while an item is on this list. Waiting items are sent automatically when the connection works." }));
    kids.push(h("div", { class: "card" }, [h("strong", { text: "Waiting: " + a.length }),
      h("div", { class: "row" }, [h("button", { type: "button", class: "sbtn", text: "Send now", onclick: function () { S.authBad = false; clearTimeout(S.retryTimer); flush(); setTimeout(viewOutbox, 900); } })])]));
    if (S.authBad) kids.push(h("div", { class: "errsum", text: "The key was not accepted (wrong key, or the key was changed). Re-enter the key, then press Send now." }),
      h("button", { type: "button", class: "sbtn sec", text: "Re-enter key", onclick: function () { S.key = ""; ls(SK.key, null); viewGate(); } }));
    if (f.length) {
      kids.push(h("h2", { text: "Failed (" + f.length + ")" }));
      f.forEach(function (it) { kids.push(h("div", { class: "failbox" }, [h("div", { text: it.code + " · " + it.fn + " · " + (it.doneKey || "") }), h("div", { class: "muted", text: it.error || "" }), h("pre", { text: JSON.stringify(it.body) })])); });
      kids.push(h("div", { class: "row" }, [
        h("button", { type: "button", class: "sbtn sec", text: "Retry failed", onclick: function () { setOutbox(outbox().concat(f)); ls(SK.failed, null); flush(); viewOutbox(); } }),
        h("button", { type: "button", class: "sbtn sec", text: "Clear failed list", onclick: function () { if (window.confirm("Remove the failed items from this device? Copy them first if you need them.")) { ls(SK.failed, null); viewOutbox(); } } })]));
    }
    kids.push(h("p", {}, [h("button", { type: "button", class: "sbtn link", text: "Back", onclick: function () { S.state ? viewDash() : viewHome(); } })]));
    show(kids); paintBar();
  }

  /* ---------- view: key gate ---------- */
  function viewGate(msg) {
    var inp = h("input", { class: "t", type: "password", id: "kin", autocomplete: "off", autocapitalize: "off", placeholder: "Researcher key" });
    var err = h("div", { class: "errsum", hidden: !msg, text: msg || "" });
    function go() {
      var k = inp.value.trim(); if (!k) return;
      go_btn.disabled = true;
      call("study_check_key", { p_key: k }).then(function (ok) {
        go_btn.disabled = false;
        if (ok === true) { S.key = k; ls(SK.key, k); S.authBad = false; viewHome(); flush(); }
        else { err.hidden = false; err.textContent = "Key not accepted."; }
      }, function (e) { go_btn.disabled = false; err.hidden = false; err.textContent = e.net ? "No connection. Check the internet and try again." : "Could not check the key (" + e.message + ")."; });
    }
    var go_btn = h("button", { type: "button", class: "sbtn big", text: "Continue", onclick: go });
    inp.addEventListener("keydown", function (e) { if (e.keyCode === 13) go(); });
    S.state = null;
    show([h("h1", { text: "SENS-TIA study forms" }), h("div", { class: "card" }, [
      h("p", { text: "Researcher key (typed once on this device):" }), err, inp, h("p", { class: "row" }, [go_btn])])]);
    paintBar();
  }

  /* ---------- view: home (enter code) ---------- */
  function viewHome() {
    S.state = null; S.view = "home";
    var inp = h("input", { class: "t code", id: "cin", maxlength: 3, autocomplete: "off", autocapitalize: "characters", placeholder: "S01", inputmode: "text" });
    var msg = h("div", { class: "errsum", hidden: true });
    var box = h("div");
    function open(code, create, order) {
      code = (code || inp.value).trim().toUpperCase();
      if (!/^[ST][0-9]{2}$/.test(code)) { msg.hidden = false; msg.textContent = "A code looks like S01 … S12 (or T01 for a test)."; return; }
      msg.hidden = true;
      call("study_open", { p_key: S.key, p_code: code, p_order: order || null, p_create: !!create }).then(function (r) {
        if (r.exists === false) return viewRegister(r);
        r.done = (r.done || []).slice(); r.log = (r.log || []).slice();
        S.state = r; remember(code); viewDash();
      }, function (e) { handleErr(e, msg); });
    }
    inp.addEventListener("keydown", function (e) { if (e.keyCode === 13) open(); });
    var rec = lsj(SK.recent, []);
    var chips = h("div", { class: "chips" }, rec.map(function (c) { return h("button", { type: "button", class: "chip", text: c, onclick: function () { open(c); } }); }));
    show([h("h1", { text: "Participant" }), h("div", { class: "card" }, [
      h("label", { for: "cin", text: "Participant code" }), msg, h("div", { class: "row" }, [inp, h("button", { type: "button", class: "sbtn big", text: "Open", onclick: function () { open(); } })]),
      rec.length ? h("p", { class: "muted", text: "Recent:" }) : null, rec.length ? chips : null, box]),
      h("p", { class: "muted", text: "The participant code is on the paper consent form. Names never go into this page." })]);
    paintBar();
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
  }
  function remember(code) { var r = lsj(SK.recent, []).filter(function (c) { return c !== code; }); r.unshift(code); ls(SK.recent, JSON.stringify(r.slice(0, 8))); }
  function handleErr(e, msgEl) {
    if (e.auth) { S.authBad = true; S.key = ""; ls(SK.key, null); viewGate("The key was not accepted. Enter it again."); return; }
    if (msgEl) { msgEl.hidden = false; msgEl.textContent = e.net ? "No connection. Check the internet and try again." : "Error: " + e.message; }
  }

  /* ---------- view: register new code ---------- */
  function viewRegister(r) {
    var sel = h("select", { class: "t", id: "ord" }, SPEC.ALL_ORDERS.map(function (o) {
      return h("option", { value: o, selected: o === r.suggested_order, text: o.split("").map(siteNameEn).join(" → ") + (SPEC.ORDERS.indexOf(o) >= 0 ? "" : "  (not in the standard set)") });
    }));
    var msg = h("div", { class: "errsum", hidden: true });
    show([h("h1", { text: "New code " + r.code }), h("div", { class: "card" }, [
      h("p", { text: "This code is not registered yet. Register it only when this person starts the experiment today." }),
      r.code.charAt(0) === "T" ? h("p", { class: "muted", text: "T-codes are test / pilot codes. They are flagged in the database and left out of the analysis." }) : null,
      h("label", { for: "ord", text: "Site order (suggested from the code):" }), sel, msg,
      h("p", { class: "row" }, [
        h("button", { type: "button", class: "sbtn big", text: "Register and start", onclick: function () {
          call("study_open", { p_key: S.key, p_code: r.code, p_order: sel.value, p_create: true }).then(function (st) { st.done = st.done || []; st.log = st.log || []; S.state = st; remember(r.code); viewDash(); }, function (e) { handleErr(e, msg); });
        } }),
        h("button", { type: "button", class: "sbtn sec", text: "Cancel", onclick: viewHome })])])]);
  }
  function siteNameEn(c) { return SPEC.SITES[c].en; }

  /* ---------- sequence ---------- */
  function steps() {
    var s = [{ key: "enrolment", form: "enrol", label: "Enrolment questionnaire", sub: "Once, at the start" }];
    for (var n = 1; n <= 3; n++) {
      var nm = siteNameEn(walkSite(n));
      s.push({ key: "before:" + n, form: "before", walk: n, label: "Walk " + n + " (" + nm + "): before the walk" });
      s.push({ key: "after:" + n, form: "after", walk: n, label: "Walk " + n + " (" + nm + "): after the walk", sub: "after the post-walk rest" });
    }
    s.push({ key: "memory", form: "memory", label: "Memory: describe the walks", sub: "End of the day, researcher types what the participant says" });
    s.push({ key: "photos", form: "photos", label: "Memory: photo test (12 photos)", sub: "End of the day, participant uses the tablet" });
    return s;
  }
  function doneSet() {
    var d = {}, st = S.state;
    (st.done || []).forEach(function (k) { d[k] = true; });
    pendingKeys(st.code).forEach(function (k) { d[k] = true; });
    return d;
  }

  /* ---------- view: dashboard ---------- */
  var unlockAll = false;
  function viewDash() {
    S.view = "dash";
    var st = S.state, d = doneSet(), list = steps(), next = null;
    list.forEach(function (s) { if (!next && !d[s.key]) next = s.key; });
    var ul = h("ul", { class: "steps" });
    list.forEach(function (s) {
      var isDone = !!d[s.key], isNext = s.key === next, ok = isNext || isDone || unlockAll;
      var cls = isDone ? "done" : (isNext ? "next" : "lock");
      var btns = [];
      if (isDone) btns.push(h("span", { class: "done", text: "✓ done" }));
      var b = h("button", { type: "button", class: "sbtn" + (isNext ? "" : " sec"), disabled: !(ok), text: isDone ? "Redo" : "Start", onclick: function () { openStep(s); } });
      btns.push(b);
      if (s.walk && s.form === "before") btns.push(null);
      ul.appendChild(h("li", { class: cls }, [h("div", { class: "lbl" }, [s.label, s.sub ? h("div", { class: "muted", text: s.sub }) : null]), h("div", { class: "row" }, btns)]));
    });
    var logs = h("ul", { class: "steps" });
    for (var n = 1; n <= 3; n++) (function (n) {
      var has = (st.log || []).indexOf(n) >= 0;
      logs.appendChild(h("li", {}, [h("div", { class: "lbl", text: "Walk " + n + " (" + siteNameEn(walkSite(n)) + "): session log" + (has ? "  ✓ saved" : "") }),
        h("button", { type: "button", class: "sbtn sec", text: has ? "Edit log" : "Open log", onclick: function () { viewLog(n); } })]));
    })(n);
    var chk = h("input", { type: "checkbox", id: "ua" }); chk.checked = unlockAll;
    chk.addEventListener("change", function () { unlockAll = chk.checked; viewDash(); });
    show([
      h("h1", {}, [st.code + " ", st.is_test ? h("span", { class: "badge test", text: "test" }) : null]),
      h("p", { class: "muted", text: "Site order: " + st.order.split("").map(siteNameEn).join(" → ") }),
      h("div", { class: "card" }, [h("h2", { text: "Questionnaires" }), ul,
        h("p", {}, [chk, " ", h("label", { for: "ua", text: "Allow any order (only to correct something)" })])]),
      h("div", { class: "card" }, [h("h2", { text: "Researcher session log (document 06 B)" }), logs]),
      h("p", {}, [h("button", { type: "button", class: "sbtn link", text: "Refresh from server", onclick: function () { refresh(); } })])
    ]);
    paintBar();
  }
  function refresh() {
    call("study_open", { p_key: S.key, p_code: S.state.code }).then(function (r) { r.done = r.done || []; r.log = r.log || []; S.state = r; viewDash(); }, function (e) { handleErr(e); });
  }
  function openStep(s) {
    if (s.form === "photos") return viewPhotos();
    viewForm(s);
  }

  /* ---------- forms ---------- */
  function fillTokens(str) {
    return str.replace(/\{w([123])\}/g, function (m, n) { return siteName(walkSite(+n)); });
  }
  function draftKey(code, key) { return "sens-draft:" + code + ":" + key; }

  function fieldNode(f, ans, plain, onChange) {
    var fs = h("fieldset", { class: "q", id: "q_" + f.id, "data-id": f.id });
    var lbl = fillTokens(tx(f.label));
    fs.appendChild(h("legend", {}, [lbl, f.optional && !plain ? h("span", { class: "muted", text: "  (" + T("optional", "opsionale") + ")" }) : null]));
    function set(v) { if (v === "" || v === null || v === undefined) delete ans[f.id]; else ans[f.id] = v; onChange(); }
    var cur = ans[f.id];
    if (f.type === "scale" || f.type === "choice") {
      var opts = [];
      if (f.type === "scale") { for (var v = f.min; v <= f.max; v++) opts.push({ v: v, t: String(v) }); }
      else opts = f.options;
      var cls = "pick-row" + (f.type === "choice" && f.layout !== "row" ? " col" : (f.type === "choice" ? " txt" : ""));
      var row = h("div", { class: cls }), name = "n_" + f.id;
      opts.forEach(function (o, i) {
        var id = "o_" + f.id + "_" + i, inp = h("input", { type: "radio", name: name, id: id, value: String(o.v) });
        if (cur !== undefined && String(cur) === String(o.v)) inp.checked = true;
        inp.addEventListener("change", function () { set(f.type === "scale" || f.numeric ? Number(o.v) : o.v); fs.classList.remove("invalid"); });
        row.appendChild(h("div", { class: "pick" }, [inp, h("label", { for: id, text: tx(o.t) })]));
      });
      fs.appendChild(row);
      if (f.type === "scale" && (f.lo || f.hi)) fs.appendChild(h("div", { class: "anch" }, [h("span", { text: tx(f.lo) }), h("span", { text: tx(f.hi) })]));
      if (f.compact) fs.classList.add("compact");
    } else if (f.type === "textarea") {
      var ta = h("textarea", { class: "t", rows: 4 }); ta.value = cur || "";
      ta.addEventListener("input", function () { set(ta.value); }); fs.appendChild(ta);
    } else {
      var type = f.type === "number" ? "number" : (f.type === "time" ? "time" : (f.type === "date" ? "date" : "text"));
      var inp2 = h("input", { class: "t", type: type, min: f.min, max: f.max, step: f.step || (f.type === "number" ? "any" : null), inputmode: f.type === "number" ? "decimal" : null });
      if (cur !== undefined) inp2.value = cur;
      inp2.addEventListener("input", function () { var val = inp2.value; set(f.type === "number" && val !== "" ? Number(val) : val); fs.classList.remove("invalid"); });
      fs.appendChild(inp2);
    }
    return fs;
  }
  function validate(spec, ans, container) {
    var bad = 0, first = null;
    spec.sections.forEach(function (s) { s.fields.forEach(function (f) {
      var v = ans[f.id], missing = (v === undefined || v === "" || v === null), invalid = false;
      if (!missing && f.type === "number" && (typeof v !== "number" || isNaN(v) || (f.min !== undefined && v < f.min) || (f.max !== undefined && v > f.max))) invalid = true;
      var node = container.querySelector("#q_" + f.id);
      var isBad = (missing && !f.optional) || invalid;
      if (node) node.classList.toggle("invalid", isBad);
      if (isBad) { bad++; if (!first) first = node; }
    }); });
    return { bad: bad, first: first };
  }
  function renderSpec(spec, ans, plain, onChange) {
    var out = [];
    spec.sections.forEach(function (s) {
      if (s.title) out.push(h("h2", { text: tx(s.title) }));
      if (s.intro) out.push(h("p", { class: "muted", text: tx(s.intro) }));
      if (s.note) out.push(h("div", { class: "note", text: tx(s.note) }));
      var grid = plain ? h("div", { class: "loggrid" }) : null;
      s.fields.forEach(function (f) {
        var node = fieldNode(f, ans, plain, onChange);
        if (grid) { if (f.type === "textarea" || (f.type === "choice" && f.options.length > 2)) node.classList.add("wide"); grid.appendChild(node); } else out.push(node);
      });
      if (grid) out.push(grid);
    });
    return out;
  }

  function viewForm(step) {
    S.view = "form"; S.currentStep = step;
    var spec = SPEC.FORMS[step.form], st = S.state, dk = draftKey(st.code, step.key);
    var ans = lsj(dk, {});
    var errBox = h("div", { class: "errsum", hidden: true });
    var holder = h("div");
    function save() { ls(dk, JSON.stringify(ans)); }
    function draw() {
      holder.innerHTML = "";
      renderSpec(spec, ans, false, save).forEach(function (n) { holder.appendChild(n); });
    }
    draw();
    var title = tx(spec.title) + (step.walk ? " – " + T("Walk ", "Ecja ") + step.walk + " (" + siteName(walkSite(step.walk)) + ")" : "");
    var submit = h("button", { type: "button", class: "sbtn big", text: T("Submit", "Dërgo"), onclick: function () {
      var v = validate(spec, ans, holder);
      if (v.bad) {
        errBox.hidden = false; errBox.textContent = T("Please answer the highlighted questions (" + v.bad + ").", "Ju lutemi përgjigjuni pyetjeve të theksuara (" + v.bad + ").");
        if (v.first) v.first.scrollIntoView({ block: "center" }); return;
      }
      var body = { client_id: uuid(), code: st.code, form_type: spec.form_type, lang: lang(), answers: ans };
      if (step.walk) { body.walk_no = step.walk; body.site = walkSite(step.walk); }
      enqueue({ id: body.client_id, fn: "study_submit_form", body: body, code: st.code, doneKey: step.key });
      ls(dk, null); if (st.done.indexOf(step.key) < 0) st.done.push(step.key);
      viewThanks(step);
    } });
    show([
      step.walk ? h("p", { class: "walkhead", text: T("Walk ", "Ecja ") + step.walk + " · " + st.code }) : h("p", { class: "walkhead", text: st.code }),
      h("h1", { text: tx(spec.title) + (step.walk ? " – " + siteName(walkSite(step.walk)) : "") }),
      spec.intro ? h("p", { text: tx(spec.intro) }) : null, errBox, holder,
      h("div", { class: "sticky-actions row" }, [submit, h("button", { type: "button", class: "sbtn sec", text: T("Back", "Kthehu"), onclick: viewDash })])
    ].filter(Boolean));
    document.title = title;
    paintBar();
  }

  function viewThanks(step) {
    S.view = "thanks";
    show([h("div", { class: "card center" }, [
      h("p", { class: "thanks", text: T("Thank you!", "Faleminderit!") }),
      h("p", { text: T("Please give the tablet back to the researcher.", "Ju lutemi ia ktheni tabletin studiuesit.") }),
      h("p", {}, [h("button", { type: "button", class: "sbtn big", text: "Researcher: continue", onclick: viewDash })])])]);
    paintBar();
  }

  /* ---------- photo test ---------- */
  function viewPhotos() {
    var st = S.state, ok = "sens-photo-order:" + st.code, ak = "sens-photo-ans:" + st.code;
    var order = lsj(ok, null);
    if (!order || order.length !== SPEC.PHOTOS.length) { order = shuffle(SPEC.PHOTOS).map(function (p) { return p.id; }); ls(ok, JSON.stringify(order)); }
    var given = lsj(ak, []);
    var files = {}; SPEC.PHOTOS.forEach(function (p) { files[p.id] = p.file; });
    var t0 = 0;
    function intro() {
      S.view = "photo-intro";
      show([h("div", { class: "card" }, [
        h("h1", { text: tx({ en: "Photo test", sq: "Testi me foto" }) }),
        h("p", { text: tx(SPEC.PHOTO_TEXT.intro) }), h("p", { class: "muted", text: tx(SPEC.PHOTO_TEXT.hint) }),
        h("p", { class: "row" }, [h("button", { type: "button", class: "sbtn big", text: tx(SPEC.PHOTO_TEXT.start), onclick: next }),
          h("button", { type: "button", class: "sbtn sec", text: T("Back", "Kthehu"), onclick: viewDash })])])]);
      paintBar();
    }
    function next() {
      var i = given.length;
      if (i >= order.length) return finish();
      S.view = "photo";
      var id = order[i], img = h("img", { class: "photo", alt: "", src: files[id] });
      var miss = h("p", { class: "errsum", hidden: true, text: "Photo file missing: " + files[id] });
      img.addEventListener("error", function () { miss.hidden = false; });
      if (i + 1 < order.length) { var pre = new Image(); pre.src = files[order[i + 1]]; }
      function answer(a) {
        var ms = Date.now() - t0; if (ms < 250) return; // ignore accidental double taps
        given.push({ position: i + 1, photo_id: id, answer: a, response_ms: ms }); ls(ak, JSON.stringify(given)); next();
      }
      show([h("div", { class: "prog" }, [h("i", { style: "width:" + Math.round(i / order.length * 100) + "%" })]),
        h("p", { class: "muted center", text: (i + 1) + " / " + order.length }),
        img, miss, h("p", { class: "center", text: tx(SPEC.PHOTO_TEXT.question) }),
        h("div", { class: "photo-actions" }, [
          h("button", { type: "button", class: "sbtn", text: tx(SPEC.PHOTO_TEXT.yes), onclick: function () { answer("passed"); } }),
          h("button", { type: "button", class: "sbtn", text: tx(SPEC.PHOTO_TEXT.no), onclick: function () { answer("not_passed"); } })])]);
      t0 = Date.now(); paintBar();
    }
    function finish() {
      var body = { batch_id: uuid(), code: st.code, lang: lang(), answers: given };
      enqueue({ id: body.batch_id, fn: "study_submit_photos", body: body, code: st.code, doneKey: "photos" });
      ls(ok, null); ls(ak, null); if (st.done.indexOf("photos") < 0) st.done.push("photos");
      S.view = "thanks";
      show([h("div", { class: "card center" }, [
        h("p", { class: "thanks", text: T("Thank you, that was the last part!", "Faleminderit, ky ishte pjesa e fundit!") }),
        h("p", { text: T("Please give the tablet back to the researcher.", "Ju lutemi ia ktheni tabletin studiuesit.") }),
        h("p", {}, [h("button", { type: "button", class: "sbtn big", text: "Researcher: continue", onclick: viewDash })])])]);
      paintBar();
    }
    if (given.length > 0 && given.length < order.length) next(); else intro();
  }

  /* ---------- researcher log ---------- */
  function viewLog(n) {
    S.view = "log";
    var st = S.state, site = walkSite(n);
    var ans = {}, errBox = h("div", { class: "errsum", hidden: true }), holder = h("div");
    var dk = draftKey(st.code, "log:" + n);
    function drawWith(data) {
      ans = data; holder.innerHTML = "";
      renderSpec(SPEC.LOG, ans, true, function () { ls(dk, JSON.stringify(ans)); }).forEach(function (x) { holder.appendChild(x); });
    }
    var draft = lsj(dk, null);
    holder.appendChild(h("p", { class: "muted", text: "Loading…" }));
    if (draft) drawWith(draft);
    else call("study_get_log", { p_key: S.key, p_code: st.code, p_walk: n }).then(function (d) {
      var data = d || {}; if (!data.date) data.date = new Date().toISOString().slice(0, 10); drawWith(data);
    }, function (e) { handleErr(e, errBox); drawWith({ date: new Date().toISOString().slice(0, 10) }); });
    var save = h("button", { type: "button", class: "sbtn big", text: "Save log", onclick: function () {
      var v = validate(SPEC.LOG, ans, holder);
      if (v.bad) { errBox.hidden = false; errBox.textContent = "Please check the highlighted fields (" + v.bad + ") – a value is outside its allowed range."; if (v.first) v.first.scrollIntoView({ block: "center" }); return; }
      var body = { code: st.code, walk_no: n, site: site, data: ans };
      enqueue({ id: uuid(), fn: "study_save_log", body: body, code: st.code });
      ls(dk, null); if (st.log.indexOf(n) < 0) st.log.push(n);
      viewDash();
    } });
    show([h("p", { class: "walkhead", text: st.code + " · walk " + n }), h("h1", { text: "Session log: " + siteNameEn(site) }),
      h("p", { class: "muted", text: "Fill in what applies. Fields can stay empty. You can come back and edit the log later." }), errBox, holder,
      h("div", { class: "sticky-actions row" }, [save, h("button", { type: "button", class: "sbtn sec", text: "Back", onclick: viewDash })])]);
    paintBar();
  }

  /* ---------- language switch ---------- */
  function setLang(l) {
    root.setAttribute("lang", l); root.setAttribute("data-lang", l); ls(SK.lang, l);
    Array.prototype.forEach.call(document.querySelectorAll(".lang button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set") === l ? "true" : "false"); });
  }
  Array.prototype.forEach.call(document.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () {
      setLang(b.getAttribute("data-set"));
      // redraw the current participant-facing screen in the new language, keeping answers
      if (S.view === "form" && S.currentStep) viewForm(S.currentStep);
      else if (S.view === "photo-intro") viewPhotos();
      else if (S.view === "thanks") viewThanks();
    });
  });

  /* ---------- start ---------- */
  var q = new URLSearchParams(location.search).get("lang");
  var l0 = (q === "sq" || q === "en") ? q : (ls(SK.lang) === "sq" ? "sq" : "en");
  setLang(l0);
  if (!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY || C.SUPABASE_ANON_KEY.indexOf("YOUR-") >= 0) {
    show([h("div", { class: "errsum", text: "assets/config.js is not filled in (Supabase URL and public key)." })]);
  } else if (!S.key) viewGate();
  else {
    // verify the stored key quietly, then go to the home view
    viewHome();
    call("study_check_key", { p_key: S.key }).then(function (ok) { if (ok !== true) { S.key = ""; ls(SK.key, null); viewGate("The stored key is no longer valid. Enter it again."); } else flush(); }, function () { /* offline: carry on */ });
  }
  paintBar();
  setInterval(function () { if (outbox().length && !S.flushing && !S.authBad) flush(); }, 15000);
})();
