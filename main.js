/* =========================================================================
   Ghostprocess — comportement du site
   Ce fichier est partagé par toutes les pages ; chaque bloc vérifie que
   les éléments existent avant d'agir. Les réglages sont dans config.js.
   ========================================================================= */
(function () {
  "use strict";

  const CFG = Object.assign(
    { WEBHOOK_URL: "", WHATSAPP_NUMBER: "", WHATSAPP_MESSAGE: "", EMAIL: "contact@ghostprocess.net", PILOT_SEATS_LEFT: 3, FORM_TIMEOUT_MS: 15000 },
    window.GP_CONFIG || {}
  );
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = document.documentElement;
  const waNumber = String(CFG.WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const waLink = (text) => "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text || CFG.WHATSAPP_MESSAGE || "");

  /* ---------- Intro d'ouverture : retirée à la fin, ou plus tôt sur clic / touche ---------- */
  const intro = $("#intro");
  if (intro && root.classList.contains("intro-on")) {
    const end = () => root.classList.add("intro-done");
    setTimeout(end, 7400);
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) => window.addEventListener(ev, end, { once: true, passive: true }));
  }

  /* ---------- Année du pied de page ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Thème clair / sombre ---------- */
  const themeBtn = $("#themeBtn");
  if (themeBtn) {
    const current = () => root.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    const paint = () => {
      const t = current();
      themeBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-${t === "light" ? "sun" : "moon"}"/></svg>`;
      themeBtn.setAttribute("aria-label", t === "light" ? "Passer au thème sombre" : "Passer au thème clair");
    };
    paint();
    themeBtn.addEventListener("click", () => {
      const next = current() === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("gp-theme", next); } catch (e) { /* stockage indisponible : on garde le thème pour cette visite */ }
      paint();
    });
  }

  /* ---------- Menu mobile ---------- */
  const menuBtn = $("#menuBtn"), drawer = $("#drawer");
  if (menuBtn && drawer) {
    const setOpen = (open) => {
      drawer.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      menuBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-${open ? "close" : "menu"}"/></svg>`;
    };
    setOpen(false);
    menuBtn.addEventListener("click", () => setOpen(drawer.hidden));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) { setOpen(false); menuBtn.focus(); } });
    matchMedia("(min-width: 1061px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Barre compacte au défilement ----------
     Un repère invisible de 24 px est placé en haut de page : quand il sort de l'écran,
     <html> reçoit .nav-compact (le CSS fait le reste). Aucun calcul à chaque défilement. */
  const header = $(".top");
  if (header && "IntersectionObserver" in window) {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;";
    document.body.prepend(sentinel);
    new IntersectionObserver(([en]) => root.classList.toggle("nav-compact", !en.isIntersecting)).observe(sentinel);
  }

  /* ---------- Lien actif dans le menu selon la section visible ---------- */
  const navLinks = $$('nav.main a[href^="#"], #drawer a[href^="#"]:not(.nav-cta)');
  if (navLinks.length && "IntersectionObserver" in window) {
    const ids = [...new Set(navLinks.map((a) => a.getAttribute("href").slice(1)))];
    const mark = (id) => navLinks.forEach((a) => {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) mark(en.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    // En haut de page (zone d'accueil), aucun lien n'est actif
    const hero = $(".hero");
    if (hero) new IntersectionObserver(([en]) => { if (en.isIntersecting) mark(""); }, { rootMargin: "-45% 0px -50% 0px" }).observe(hero);
  }

  /* ---------- Apparition douce des blocs ---------- */
  const reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Bouton « Retour en haut » ---------- */
  const toTop = $("#toTop");
  if (toTop) {
    const SHOW_AFTER = 500; // pixels défilés avant d'afficher le bouton
    let ticking = false;
    const update = () => { toTop.classList.toggle("show", window.scrollY > SHOW_AFTER); ticking = false; };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    toTop.addEventListener("click", () => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      // Le focus clavier revient au logo, en haut de page
      const brand = $(".brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- Téléphone de démonstration : notifications (contenu dans demos.js) ----------
     Une notification arrive toutes les 2,4 s, les 4 plus récentes restent affichées.
     Pause automatique quand le téléphone n'est pas visible, quand l'onglet est en arrière-plan,
     au survol / focus, ou avec le bouton « Pause ». Mouvement réduit : liste fixe, sans défilement. */
  const notifList = $("#notifs");
  const NOTIFS = window.GP_NOTIFS || [];
  if (notifList && NOTIFS.length) {
    const clockEl = $("#notifClock"), dateEl = $("#notifDate"), toggle = $("#notifToggle"), phoneEl = $("#notifPhone");
    const ghost = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9.4 3 5 7.8 5 14v14.5l3.6-2.6 3.7 2.6 3.7-2.6 3.7 2.6 3.7-2.6 3.6 2.6V14C27 7.8 22.6 3 16 3z" fill="#0c110d"/></svg>';
    const escN = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const item = ([time, app, text], fresh) => `<li class="notif${fresh ? " new" : ""}"><span class="ic">${ghost}</span><div><div class="t"><b>${escN(app)}</b><span>${escN(time)}</span></div><p>${escN(text)}</p></div></li>`;
    if (dateEl) dateEl.textContent = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Tunis" }).format(new Date());

    // Carte flottante à côté du téléphone : la dernière notification, en grand
    const floatEl = $("#notifFloat");
    const showFloat = ([time, app, text], animate) => {
      if (!floatEl) return;
      floatEl.innerHTML = `<span class="ic">${ghost}</span><div><b>${escN(app)}</b><small>${escN(time)} · à l'instant</small><p>${escN(text)}</p></div>`;
      if (animate) { floatEl.classList.remove("pop"); void floatEl.offsetWidth; floatEl.classList.add("pop"); }
    };

    const VISIBLE = 4, EVERY = 2400;
    let k = 0, timer = 0, userPaused = false, hovered = false, onScreen = true;
    const push = () => {
      const n = NOTIFS[k % NOTIFS.length];
      if (k % NOTIFS.length === 0) notifList.innerHTML = "";        // nouvelle « journée »
      [...notifList.children].forEach((c) => { c.classList.remove("new"); c.classList.add("old"); });
      notifList.insertAdjacentHTML("afterbegin", item(n, true));
      while (notifList.children.length > VISIBLE) notifList.lastElementChild.remove();
      if (clockEl) clockEl.textContent = n[0];
      showFloat(n, true);
      k++;
    };
    const running = () => !userPaused && !hovered && onScreen && !document.hidden;
    const sync = () => {
      if (running() && !timer) timer = setInterval(push, EVERY);
      else if (!running() && timer) { clearInterval(timer); timer = 0; }
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      notifList.innerHTML = NOTIFS.slice(0, VISIBLE).reverse().map((n) => item(n, false)).join("");
      if (clockEl) clockEl.textContent = NOTIFS[VISIBLE - 1][0];
      showFloat(NOTIFS[VISIBLE - 1], false);
      if (toggle) toggle.hidden = true;
    } else {
      push();
      if (phoneEl) {
        phoneEl.addEventListener("mouseenter", () => { hovered = true; sync(); });
        phoneEl.addEventListener("mouseleave", () => { hovered = false; sync(); });
      }
      if (toggle) toggle.addEventListener("click", () => {
        userPaused = !userPaused;
        toggle.textContent = userPaused ? "Lecture" : "Pause";
        toggle.setAttribute("aria-pressed", String(userPaused));
        sync();
      });
      document.addEventListener("visibilitychange", sync);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; sync(); }).observe(notifList);
      }
      sync();
    }
  }

  /* ---------- Avant / après : cartes vertes pilotées par le défilement ----------
     Les cartes orange restent fixes. Chaque carte verte a une progression --p (0 → 1) :
       0 = position de départ, sous l'orange qu'elle chevauche à peine ;
       1 = montée sur l'orange, qu'elle cache (seule l'étiquette « Problème » dépasse).
     --p suit directement le défilement : on descend, la verte monte et recouvre ;
     on remonte, elle redescend et l'orange réapparaît. Lissage léger via requestAnimationFrame.
     « Rejouer » ramène toutes les cartes vertes au départ, puis l'animation reprend
     à partir de la position actuelle : il suffit de continuer à faire défiler. */
  const pbSection = $("#avant-apres");
  const pbPairs = $$(".pair");
  if (pbSection && pbPairs.length) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const pbReplay = $("#pbReplay");
    const pbActions = $("#pbActions");
    const ease = (x) => x * x * (3 - 2 * x);
    const clamp = (x) => Math.min(1, Math.max(0, x));
    const cards = pbPairs.map((el) => ({ el, problem: $(".problem", el), solution: $(".solution", el), cur: 0, shift: 0 }));
    let raf = 0, listening = false, io = null;

    // Distance que la verte parcourt vers le haut : jusqu'à juste sous l'étiquette « Problème »,
    // sans jamais laisser dépasser le bas de la carte orange
    const measure = () => cards.forEach((c) => {
      c.solution.style.minHeight = "";
      const H = c.problem.offsetHeight;
      const gap = c.solution.offsetTop - c.problem.offsetTop;           // haut de la verte au repos
      const label = $(".plabel", c.problem), title = $("h3", c.problem);
      // la verte s'arrête juste sous l'étiquette et cache entièrement le titre
      const peek = title ? title.offsetTop - 2 : (label ? label.offsetTop + label.offsetHeight + 3 : 36);
      // la verte doit être assez haute pour cacher aussi le bas de l'orange une fois montée
      const need = Math.ceil(H - peek + 4);
      if (c.solution.offsetHeight < need) c.solution.style.minHeight = need + "px";
      const G = c.solution.offsetHeight;
      const travel = Math.max(0, Math.min(gap - peek, G - (H - gap) - 2));
      c.el.style.setProperty("--travel", travel.toFixed(1) + "px");
    });
    const apply = (c) => c.el.style.setProperty("--p", c.cur.toFixed(4));

    // Avancement brut d'une paire (0 quand elle entre en bas de l'écran, 1 vers le tiers haut).
    // La colonne de droite est légèrement en retard : effet de cascade.
    const raw = (c, i, vh) => {
      const lag = window.innerWidth > 760 && i % 2 === 1 ? vh * 0.08 : 0;
      const start = vh * 0.9 - lag, end = vh * 0.32 - lag;
      return (start - c.el.getBoundingClientRect().top) / (start - end);
    };

    const tick = () => {
      raf = 0;
      if (!pbSection.isConnected) { destroy(); return; }
      const vh = window.innerHeight;
      let moving = false;
      cards.forEach((c, i) => {
        const r = raw(c, i, vh);
        if (c.shift && r <= 0) c.shift = 0;                     // après « Rejouer », retour au mode normal en haut
        const target = ease(clamp(r - c.shift));
        const d = target - c.cur;
        c.cur = Math.abs(d) < 0.002 ? target : c.cur + d * 0.2;
        if (c.cur !== target) moving = true;
        apply(c);
      });
      if (moving) raf = requestAnimationFrame(tick);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onResize = () => { measure(); schedule(); };
    const startListening = () => { if (!listening) { listening = true; window.addEventListener("scroll", schedule, { passive: true }); schedule(); } };
    const stopListening = () => { if (listening) { listening = false; window.removeEventListener("scroll", schedule); } };

    // Rejouer : la position actuelle devient le nouveau point de départ de chaque paire.
    // Les cartes vertes redescendent en douceur à leur position initiale, puis remontent
    // à nouveau sur les orange au fil du défilement. Plusieurs clics de suite : même résultat.
    const onReplay = () => {
      const vh = window.innerHeight;
      cards.forEach((c, i) => { c.shift = Math.max(0, raw(c, i, vh)); });
      schedule();
    };

    function destroy() {
      stopListening();
      if (io) { io.disconnect(); io = null; }
      window.removeEventListener("resize", onResize);
      if (pbReplay) pbReplay.removeEventListener("click", onReplay);
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    const enable = () => {
      if (pbActions) pbActions.hidden = false;
      measure();
      window.addEventListener("resize", onResize);
      if (pbReplay) pbReplay.addEventListener("click", onReplay);
      if ("IntersectionObserver" in window) {                   // n'écouter le défilement que près de la section
        io = new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? startListening() : stopListening())), { rootMargin: "200px 0px" });
        io.observe(pbSection);
      } else startListening();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
    };
    const disable = () => {                                      // mouvement réduit : composition fixe et lisible
      destroy();
      cards.forEach((c) => { c.cur = 0; c.shift = 0; apply(c); });
      if (pbActions) pbActions.hidden = true;
    };
    reduce.matches ? disable() : enable();
    reduce.addEventListener("change", (ev) => (ev.matches ? disable() : enable()));
  }

  /* ---------- Solutions : apparition progressive des cartes ----------
     Chaque enfant d'un bloc .stagger reçoit son rang (--i) ; l'animation est
     déclenchée une seule fois par l'observateur des .reveal ci-dessus. */
  $$(".stagger").forEach((el) => [...el.children].forEach((c, i) => c.style.setProperty("--i", i)));

  /* ---------- Solutions : schéma animé (contenu dans flows.js) ---------- */
  const flowPanel = $("#flow-panel");
  const FLOWS = window.GP_FLOWS || {};
  const flowTabs = $$(".flow-tab[data-flow]");
  if (flowPanel && flowTabs.length && Object.keys(FLOWS).length) {
    const stepsBox = $(".flow-steps", flowPanel);
    const titleEl = $(".flow-title", flowPanel);
    const cta = $("#flowCta");
    const cards = $$(".svc[data-flow]");
    const openers = $$("[data-flow-open]");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    // Relance l'animation : on retire .play, on force le recalcul, on la remet
    const play = () => {
      flowPanel.classList.remove("play");
      void flowPanel.offsetWidth;
      if (!reduceMotion.matches) flowPanel.classList.add("play");
      flowPanel.classList.add("played");
    };

    const select = (key, animate) => {
      const f = FLOWS[key];
      if (!f) return;
      flowTabs.forEach((t) => {
        const on = t.dataset.flow === key;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (on) flowPanel.setAttribute("aria-labelledby", t.id);
      });
      cards.forEach((c) => c.classList.toggle("is-selected", c.dataset.flow === key));
      openers.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.flowOpen === key)));
      titleEl.textContent = f.title;
      stepsBox.innerHTML = f.steps.map((s, k) =>
        (k ? `<span class="fconn" style="--k:${k - 1}" aria-hidden="true"></span>` : "") +
        `<div class="fstep${k === f.steps.length - 1 ? " last" : ""}" role="listitem" style="--k:${k}">` +
          `<span class="fi"><svg class="icon" aria-hidden="true"><use href="#i-${esc(s.icon)}"/></svg></span>` +
          `<span class="num" aria-hidden="true">0${k + 1}</span><b>${esc(s.title)}</b><small>${esc(s.text)}</small>` +
        `</div>`).join("");
      if (cta) { cta.dataset.besoin = f.besoin; cta.textContent = f.cta; }
      if (animate) play();
    };

    // Onglets : clic et flèches gauche/droite
    flowTabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t.dataset.flow, true));
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const n = flowTabs[(i + (e.key === "ArrowRight" ? 1 : flowTabs.length - 1)) % flowTabs.length];
        n.focus();
        select(n.dataset.flow, true);
      });
    });

    // Bouton « Voir le fonctionnement » d'une carte : affiche le schéma, le ramène à l'écran si besoin
    const flowBox = $("#flow");
    openers.forEach((b) => b.addEventListener("click", () => {
      select(b.dataset.flowOpen, true);
      const r = flowBox.getBoundingClientRect();
      const headerH = ($(".top") || {}).offsetHeight || 0;
      if (r.top < headerH || r.bottom > window.innerHeight) {
        flowBox.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      }
      const tab = $(`.flow-tab[data-flow="${b.dataset.flowOpen}"]`);
      if (tab) tab.focus({ preventScroll: true });
    }));

    const replayBtn = $("#flowReplay");
    if (replayBtn) replayBtn.addEventListener("click", play);

    // Première lecture : quand le schéma devient visible, une seule fois
    select(flowTabs[0].dataset.flow, false);
    if ("IntersectionObserver" in window && !reduceMotion.matches) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { if (!flowPanel.classList.contains("played")) play(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(flowPanel);
    } else {
      flowPanel.classList.add("played");
    }
  }

  /* ---------- Méthode en cycle ----------
     Les étapes sont lues dans la liste .journey (le contenu de référence, qui reste
     affiché si JavaScript est désactivé), puis placées sur un cercle.
     Survol, clic ou clavier = l'étape s'active ; sinon le cycle avance seul quand il est visible.
     Un arc se dessine de l'étape précédente vers l'étape active. */
  const cycle = $("#cycle");
  const journey = $("#methode .journey");
  if (cycle && journey) {
    const steps = $$(".jstep", journey).map((li) => ({ title: ($("h3", li) || {}).textContent || "", desc: ($("p", li) || {}).textContent || "" }));
    const ICONS = ["chat", "pen", "tool", "check", "send", "chart"];
    const n = steps.length;
    const R = 40;                                            // rayon du cercle (unités du viewBox 0-100)
    const ang = (i) => (-90 + (360 / n) * i) * Math.PI / 180;
    const pt = (i) => [50 + R * Math.cos(ang(i)), 50 + R * Math.sin(ang(i))];
    const arc = $(".ring-arc", cycle), center = $("#cycleCenter"), numEl = $("#cycleNum"), titleEl = $("#cycleTitle"), descEl = $("#cycleDesc");
    const descM = $("#cycleDescM"), note = $("#cycleNote");
    const reduceC = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = steps.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cnode";
      const [x, y] = pt(i);
      b.style.left = x + "%"; b.style.top = y + "%";
      b.setAttribute("aria-label", `Étape ${i + 1} sur ${n} : ${s.title}`);
      b.innerHTML = `<span class="dot"><svg class="icon" aria-hidden="true"><use href="#i-${ICONS[i] || "check"}"/></svg></span><span class="lbl" aria-hidden="true">${s.title}</span>`;
      cycle.appendChild(b);
      return b;
    });

    let cur = -1, swapTimer = 0;
    const setActive = (i, byUser) => {
      if (i === cur) return;
      const prev = cur < 0 ? (i - 1 + n) % n : cur;
      cur = i;
      nodes.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
      // arc de l'étape précédente vers l'étape active, toujours dans le sens du cycle
      const [x1, y1] = pt(prev), [x2, y2] = pt(i);
      const span = ((i - prev + n) % n) * (360 / n);
      arc.setAttribute("d", span === 0 ? "" : `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`);
      if (!reduceC) { arc.classList.remove("draw"); void arc.getBoundingClientRect(); arc.classList.add("draw"); }
      // texte du centre : fondu flou, puis nouveau contenu
      center.setAttribute("aria-live", byUser ? "polite" : "off");
      const write = () => {
        numEl.textContent = `Étape ${String(i + 1).padStart(2, "0")}`;
        titleEl.textContent = steps[i].title;
        descEl.textContent = steps[i].desc;
        if (descM) descM.textContent = steps[i].desc;
        center.classList.remove("out"); if (descM) descM.classList.remove("out");
      };
      clearTimeout(swapTimer);
      if (reduceC) write();
      else { center.classList.add("out"); if (descM) descM.classList.add("out"); swapTimer = setTimeout(write, 200); }
    };

    nodes.forEach((b, i) => {
      b.addEventListener("mouseenter", () => setActive(i, true));
      b.addEventListener("focus", () => setActive(i, true));
      b.addEventListener("click", () => setActive(i, true));
      b.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        nodes[(i + d + n) % n].focus();
      });
    });

    journey.classList.add("is-cycle");
    cycle.hidden = false;
    if (descM) descM.hidden = false;
    if (note) note.hidden = false;
    setActive(0, false);

    // Avance automatique quand le cycle est visible et que personne ne l'utilise
    if (!reduceC) {
      let timer = 0, visible = false, engaged = false;
      const sync = () => {
        const run = visible && !engaged && !document.hidden;
        if (run && !timer) timer = setInterval(() => setActive((cur + 1) % n, false), 3200);
        else if (!run && timer) { clearInterval(timer); timer = 0; }
      };
      cycle.addEventListener("mouseenter", () => { engaged = true; sync(); });
      cycle.addEventListener("mouseleave", () => { engaged = false; sync(); });
      cycle.addEventListener("focusin", () => { engaged = true; sync(); });
      cycle.addEventListener("focusout", (e) => { if (!cycle.contains(e.relatedTarget)) { engaged = false; sync(); } });
      document.addEventListener("visibilitychange", sync);
      if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }, { threshold: 0.4 }).observe(cycle);
    }
  }

  /* ---------- Pourquoi : languettes détachables ----------
     Survol, clic ou clavier sur une languette = elle se détache et son explication s'affiche. */
  const strips = $$(".tab-strip");
  if (strips.length) {
    const pick = (b) => {
      strips.forEach((x) => { const on = x === b; x.classList.toggle("torn", on); x.setAttribute("aria-pressed", String(on)); });
      $$(".tear-desc").forEach((d) => d.classList.toggle("on", d.id === b.getAttribute("aria-controls")));
    };
    strips.forEach((b) => {
      b.addEventListener("click", () => pick(b));
      b.addEventListener("mouseenter", () => { if (!b.classList.contains("torn")) pick(b); });
      b.addEventListener("focus", () => pick(b));
    });
  }

  /* ---------- Pied de page : « Copier le lien » ---------- */
  const fmCopy = $("#fmCopy");
  if (fmCopy) fmCopy.addEventListener("click", () => {
    const lbl = $(".fm-lbl", fmCopy), url = location.href.split("#")[0];
    const done = () => { lbl.textContent = "Copié !"; setTimeout(() => (lbl.textContent = "Copier le lien"), 1500); };
    const manual = () => window.prompt("Copiez le lien :", url);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done).catch(manual); else manual();
  });

  /* ---------- Filtres des cas d'usage ---------- */
  const filters = $$(".filter[data-f]");
  const cases = $$(".case[data-s]");
  filters.forEach((f) => f.addEventListener("click", () => {
    filters.forEach((x) => x.setAttribute("aria-pressed", String(x === f)));
    cases.forEach((c) => { c.hidden = !(f.dataset.f === "all" || c.dataset.s.split(" ").includes(f.dataset.f)); });
  }));

  /* ---------- Places du programme pilote (PILOT_SEATS_LEFT dans config.js) ---------- */
  {
    const left = Math.max(0, Math.min(3, Number(CFG.PILOT_SEATS_LEFT)));
    $$(".seat").forEach((s, i) => {
      const taken = i >= left;
      s.classList.toggle("taken", taken);
      s.lastChild.textContent = taken ? "place prise" : "place libre";
    });
    $$("[data-seats-num]").forEach((el) => (el.textContent = left));
    $$("[data-seats-left]").forEach((el) => (el.textContent = left === 0 ? "Complet pour le moment" : `${left} place${left > 1 ? "s" : ""} disponible${left > 1 ? "s" : ""}`));
  }

  /* ---------- Pré-sélection du besoin depuis un bouton ---------- */
  const besoin = $("#f-besoin");
  $$("[data-besoin]").forEach((a) => a.addEventListener("click", () => { if (besoin) besoin.value = a.dataset.besoin; }));

  /* ---------- Liens WhatsApp & e-mail ---------- */
  $$("[data-wa]").forEach((a) => {
    if (waNumber) {
      a.href = waLink(a.dataset.wa || "");
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.href = "#contact";
      a.removeAttribute("target");
    }
  });
  $$("[data-wa-number]").forEach((el) => { el.textContent = waNumber ? "+" + waNumber.replace(/^216(\d{2})(\d{3})(\d{3})$/, "216 $1 $2 $3") : "bientôt disponible"; });
  $$("[data-email]").forEach((el) => {
    el.textContent = CFG.EMAIL;
    if (el.tagName === "A") el.href = "mailto:" + CFG.EMAIL;
  });

  /* ---------- Boutons « Copier » ---------- */
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const el = document.getElementById(b.dataset.copy);
    if (!el) return;
    const txt = el.textContent.trim();
    const done = () => { b.textContent = "Copié"; setTimeout(() => (b.textContent = "Copier"), 1500); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done).catch(select);
    else select();
  }));

  /* ---------- Formulaire → webhook n8n ---------- */
  const form = $("#contactForm");
  if (form) {
    const status = $("#f-status"), submit = $("#f-submit"), label = submit.textContent;
    const startedAt = Date.now();
    const show = (html, ok) => { status.hidden = false; status.className = "status " + (ok ? "ok" : "err"); status.innerHTML = html; };
    const fallback = (data) => {
      const lines = [CFG.WHATSAPP_MESSAGE, data.nom && "Nom : " + data.nom, data.entreprise && "Entreprise : " + data.entreprise, data.besoin && "Besoin : " + data.besoin, data.message].filter(Boolean).join("\n");
      const wa = waNumber ? `<a href="${waLink(lines)}" target="_blank" rel="noopener">écrivez-nous sur WhatsApp</a> ou ` : "écrivez-nous ";
      return `${wa}à <a href="mailto:${CFG.EMAIL}?subject=${encodeURIComponent("Demande d'appel découverte")}&body=${encodeURIComponent(lines)}">${CFG.EMAIL}</a>`;
    };
    // Marque les champs invalides au fil de la saisie
    $$("input, select, textarea", form).forEach((f) => f.addEventListener("blur", () => { if (f.required) f.setAttribute("aria-invalid", String(!f.checkValidity())); }));

    // Paramètres de campagne (?utm_source=instagram…) mémorisés avec la demande
    const params = new URLSearchParams(location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign"].map((k) => params.get(k)).filter(Boolean).join(" / ");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      $$("[required]", form).forEach((f) => f.setAttribute("aria-invalid", String(!f.checkValidity())));
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const data = Object.fromEntries(new FormData(form).entries());
      // Anti-spam : champ caché rempli ou envoi en moins de 3 secondes = robot
      if (data.site_web || Date.now() - startedAt < 3000) { form.reset(); show("Merci ! Nous vous recontactons sous 24 h ouvrées.", true); return; }
      delete data.site_web;
      data.consentement = data.consentement ? "oui" : "non";
      data.envoye_le = new Date().toISOString();
      data.page = location.href.split("?")[0];
      data.source = utm || document.referrer || "direct";

      if (!CFG.WEBHOOK_URL) { show("Le formulaire n'est pas encore relié. En attendant, " + fallback(data) + ".", false); return; }

      submit.disabled = true;
      submit.textContent = "Envoi…";
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), CFG.FORM_TIMEOUT_MS);
      try {
        const res = await fetch(CFG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: ctrl.signal });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        $$("[aria-invalid]", form).forEach((f) => f.removeAttribute("aria-invalid"));
        show("Merci ! Votre demande est bien reçue. Nous vous contactons sous 24 h ouvrées pour fixer l'appel.", true);
      } catch (err) {
        console.warn("[Ghostprocess] Envoi du formulaire impossible :", err);
        show("L'envoi n'a pas abouti. Réessayez, ou " + fallback(data) + ".", false);
      } finally {
        clearTimeout(timer);
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  }
})();
