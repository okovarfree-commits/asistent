(() => {
  'use strict';

  const { ELEMENTS, MERIDIANS, POINTS, CONCEPTS } = window.AKU;
  const NS = 'http://www.w3.org/2000/svg';

  // Celá kreslicí plocha: dvě postavy 300 × 720 vedle sebe.
  const FIG_W = 300;
  const OFF = { f: 10, b: 330 };
  const VB = { w: 640, h: 800 }; // dole místo pro legendu
  const PRESETS = {
    both: { x: 0, y: 0, w: 640, h: 800 },
    f: { x: OFF.f - 20, y: 0, w: 340, h: 800 },
    b: { x: OFF.b - 20, y: 0, w: 340, h: 800 },
  };
  const MIN_W = 40;
  const BASE_R = 5; // poloměr bodu v neškálovaných jednotkách

  const $ = (sel) => document.querySelector(sel);
  const byId = new Map(POINTS.map((p) => [p.id, p]));
  const codeOf = (p) => p.code && p.code !== 'EX' ? p.code : p.id;
  const elOf = (p) => MERIDIANS[p.mer].el;
  const colorOf = (p) => `var(--el-${elOf(p)})`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const norm = (s) => String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // Předpočítaný text pro fulltextové hledání.
  for (const p of POINTS) {
    p._ind = p.ind.map(norm);
    p._all = norm([p.id, p.code || '', p.pin, p.cz, MERIDIANS[p.mer].name, p.eff, p.ind.join(' '), p.loc].join(' '));
  }

  const state = {
    view: { ...PRESETS.both },
    preset: 'both',
    sel: null,
    highlight: null, // Set id bodů z výsledků
    element: null, // filtr prvku
    matchedInd: null, // normalizované kmeny pro zvýraznění indikací v detailu
    tab: 'need',
  };

  // ───────────────────────── SVG postava
  const svg = $('#body');
  const mk = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };

  // Levá polovina obrysu od krku po rozkrok; pravá se dopočítá zrcadlením.
  const HALF_START = [138, 94];
  const HALF = [
    ['L', 137, 118],
    ['C', 128, 126, 108, 128, 96, 133],
    ['C', 82, 139, 76, 152, 76, 168],
    ['C', 72, 200, 68, 240, 68, 280],
    ['C', 66, 320, 62, 355, 62, 386],
    ['C', 56, 396, 50, 410, 50, 424],
    ['C', 50, 432, 56, 435, 59, 428],
    ['C', 61, 422, 62, 416, 64, 412],
    ['C', 62, 428, 60, 446, 63, 460],
    ['C', 66, 470, 76, 472, 81, 466],
    ['C', 86, 456, 88, 440, 87, 420],
    ['C', 87, 405, 86, 395, 85, 388],
    ['C', 88, 355, 92, 320, 94, 282],
    ['C', 96, 250, 100, 220, 102, 196],
    ['C', 104, 230, 110, 262, 112, 286],
    ['C', 112, 306, 102, 324, 100, 345],
    ['C', 96, 395, 98, 460, 104, 510],
    ['C', 106, 524, 106, 534, 105, 546],
    ['C', 101, 585, 106, 625, 110, 652],
    ['C', 110, 662, 106, 672, 103, 684],
    ['C', 101, 694, 104, 702, 112, 702],
    ['L', 134, 702],
    ['C', 140, 702, 141, 694, 139, 684],
    ['C', 137, 674, 134, 664, 134, 654],
    ['C', 134, 625, 136, 590, 137, 560],
    ['C', 138, 545, 138, 530, 137, 520],
    ['C', 140, 470, 146, 420, 148, 392],
    ['C', 149, 387, 150, 385, 150, 385],
  ];

  function outlinePath() {
    const mx = (x) => FIG_W - x;
    let d = `M${HALF_START.join(' ')}`;
    const starts = [HALF_START];
    for (const s of HALF) {
      d += s[0] === 'L' ? ` L${s[1]} ${s[2]}` : ` C${s.slice(1).join(' ')}`;
      starts.push(s.slice(-2));
    }
    for (let i = HALF.length - 1; i >= 0; i--) {
      const s = HALF[i];
      const [sx, sy] = starts[i];
      d += s[0] === 'L'
        ? ` L${mx(sx)} ${sy}`
        : ` C${mx(s[3])} ${s[4]} ${mx(s[1])} ${s[2]} ${mx(sx)} ${sy}`;
    }
    return d + ' Z';
  }

  // Detaily kreslené na levé polovině a zrcadlené (true) nebo jen jednou (false).
  const DETAILS = {
    f: [
      ['line', 'M131 49 Q137 45 144 48', true],
      ['line', 'M133 57 Q137 54.5 141 57', true],
      ['line', 'M146 71 Q150 74 154 71', false],
      ['line', 'M150 58 L148.5 69', false],
      ['line', 'M143 85 Q150 88.5 157 85', false],
      ['line', 'M140 126 Q122 129 101 136', true],
      ['line', 'M104 186 Q120 214 146 206', true],
      ['dot', 122, 199, 1.6, true],
      ['dot', 150, 290, 1.8, false],
      ['line', 'M112 330 Q130 360 147 380', true],
      ['line', 'M114 513 Q121 508 128 513 Q130 523 121 532 Q112 523 114 513', true],
    ],
    b: [
      ['line', 'M136 97 Q150 101 164 97', false],
      ['dash', 'M150 112 L150 340', false],
      ['line', 'M128 148 Q108 144 99 158 Q112 198 126 232 Q133 190 128 148', true],
      ['line', 'M150 345 L150 386', false],
      ['line', 'M108 390 Q128 400 147 391', true],
      ['line', 'M112 523 Q121 527 130 523', true],
      ['line', 'M114 690 Q122 698 130 690', true],
    ],
  };
  // Trny obratlů C7–L5 pro orientaci bodů na zádech.
  const SPINE = [126, 135, 146.5, 158, 169.5, 181, 192.5, 204, 215.5, 227, 238.5, 250, 261.5, 273, 284.5, 296, 307.5, 319];

  function drawFigure(v) {
    const g = mk('g', { transform: `translate(${OFF[v]} 0)` }, svg);
    mk('ellipse', { cx: 117, cy: 64, rx: 5.5, ry: 10, class: 'fig-skin' }, g);
    mk('ellipse', { cx: 183, cy: 64, rx: 5.5, ry: 10, class: 'fig-skin' }, g);
    mk('path', { d: outlinePath(), class: 'fig-skin' }, g);
    mk('ellipse', { cx: 150, cy: 60, rx: 31, ry: 40, class: 'fig-skin' }, g);

    const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${FIG_W - x} ${y}`);
    for (const item of DETAILS[v]) {
      if (item[0] === 'dot') {
        const [, x, y, r, both] = item;
        mk('circle', { cx: x, cy: y, r, class: 'fig-dot' }, g);
        if (both) mk('circle', { cx: FIG_W - x, cy: y, r, class: 'fig-dot' }, g);
      } else {
        const [kind, d, both] = item;
        mk('path', { d, class: `fig-${kind}` }, g);
        if (both) mk('path', { d: mirror(d), class: `fig-${kind}` }, g);
      }
    }
    if (v === 'b') {
      for (const y of SPINE) mk('circle', { cx: 150, cy: y, r: 1.3, class: 'fig-dot' }, g);
    }
    const label = mk('text', { x: 150, y: 740, class: 'fig-label' }, g);
    label.textContent = v === 'f' ? 'ZEPŘEDU' : 'ZEZADU';
  }

  drawFigure('f');
  drawFigure('b');

  // Body
  const ptLayer = mk('g', { class: 'pts' }, svg);
  const ptNodes = []; // { g, id, x, y, v }
  for (const p of POINTS) {
    for (const pos of p.pos) {
      const xs = p.bi ? [pos.x, FIG_W - pos.x] : [pos.x];
      xs.forEach((x, i) => {
        const ax = OFF[pos.v] + x;
        const g = mk('g', { class: 'pt', 'data-id': p.id, style: `--c:${colorOf(p)}` }, ptLayer);
        mk('circle', { class: 'hit', r: BASE_R * 2.2 }, g);
        mk('circle', { class: 'ring', r: BASE_R * 1.5 }, g);
        mk('circle', { class: 'dot', r: BASE_R }, g);
        const labelled = !p.bi || i === 1;
        if (labelled) {
          const t = mk('text', { class: 'lbl', x: BASE_R * 1.7, y: 0 }, g);
          t.textContent = codeOf(p);
        }
        ptNodes.push({ g, id: p.id, x: ax, y: pos.y, v: pos.v, labelled });
      });
    }
  }

  // ───────────────────────── Zoom a posun
  const stage = $('#stage');

  function pxPerUnit() {
    const m = svg.getScreenCTM();
    return m ? m.a : 1;
  }

  function clampView(v) {
    const w = Math.min(Math.max(v.w, MIN_W), VB.w * 1.15);
    const h = w * (VB.h / VB.w);
    const x = Math.min(Math.max(v.x, -w * 0.5), VB.w - w * 0.5);
    const y = Math.min(Math.max(v.y, -h * 0.5), VB.h - h * 0.5);
    return { x, y, w, h };
  }

  function applyView() {
    const v = state.view;
    svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    const ppu = pxPerUnit();
    const zoom = PRESETS.both.w / v.w;
    const rpx = 4 + 1.6 * Math.log2(Math.max(zoom, 1));
    const s = rpx / ppu / BASE_R;
    for (const n of ptNodes) n.g.setAttribute('transform', `translate(${n.x} ${n.y}) scale(${s.toFixed(4)})`);
    svg.classList.toggle('show-labels', ppu > 3.4);
  }

  let anim = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateTo(target, ms = 420) {
    target = clampView(target);
    if (anim) cancelAnimationFrame(anim);
    if (reduceMotion) { state.view = target; applyView(); return; }
    const from = { ...state.view };
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      // Interpolace v logaritmu šířky působí při zoomu přirozeněji.
      const w = Math.exp(Math.log(from.w) + (Math.log(target.w) - Math.log(from.w)) * e);
      const cx = from.x + from.w / 2 + ((target.x + target.w / 2) - (from.x + from.w / 2)) * e;
      const cy = from.y + from.h / 2 + ((target.y + target.h / 2) - (from.y + from.h / 2)) * e;
      const h = w * (VB.h / VB.w);
      state.view = { x: cx - w / 2, y: cy - h / 2, w, h };
      applyView();
      anim = k < 1 ? requestAnimationFrame(step) : null;
    };
    anim = requestAnimationFrame(step);
  }

  function toUser(clientX, clientY) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const r = pt.matrixTransform(m.inverse());
    return { x: r.x, y: r.y };
  }

  function zoomAt(clientX, clientY, factor) {
    const p = toUser(clientX, clientY);
    const v = state.view;
    const w = Math.min(Math.max(v.w / factor, MIN_W), VB.w * 1.15);
    const f = v.w / w;
    state.view = clampView({ x: p.x - (p.x - v.x) / f, y: p.y - (p.y - v.y) / f, w });
    setPreset(null);
    applyView();
  }

  function zoomCenter(factor) {
    const r = svg.getBoundingClientRect();
    const v = state.view;
    const c = toUser(r.left + r.width / 2, r.top + r.height / 2);
    const w = v.w / factor;
    const h = w * (VB.h / VB.w);
    setPreset(null);
    animateTo({ x: c.x - w / 2, y: c.y - h / 2, w }, 260);
  }

  function setPreset(name) {
    state.preset = name;
    document.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === name)));
  }

  function goPreset(name) {
    setPreset(name);
    animateTo({ ...PRESETS[name] });
  }

  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(e.clientX, e.clientY, Math.exp(-dy * 0.0016));
  }, { passive: false });

  // Ukazatele: jeden = posun, dva = pinch zoom, krátké klepnutí = výběr bodu.
  const pointers = new Map();
  let gesture = null;
  svg.addEventListener('pointerdown', (e) => {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    svg.setPointerCapture(e.pointerId);
    if (pointers.size === 1) {
      const target = e.target.closest('.pt');
      gesture = { type: 'pan', startX: e.clientX, startY: e.clientY, moved: false, target: target && target.dataset.id };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      gesture = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), moved: true };
    }
  });
  svg.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev || !gesture) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    if (gesture.type === 'pan' && pointers.size === 1) {
      if (!gesture.moved && Math.hypot(cur.x - gesture.startX, cur.y - gesture.startY) < 6) return;
      if (!gesture.moved) { gesture.moved = true; svg.classList.add('dragging'); hideTip(); }
      const ppu = pxPerUnit();
      state.view = clampView({ ...state.view, x: state.view.x - (cur.x - prev.x) / ppu, y: state.view.y - (cur.y - prev.y) / ppu });
      setPreset(null);
      applyView();
    } else if (gesture.type === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (gesture.dist > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, dist / gesture.dist);
      gesture.dist = dist;
    }
  });
  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (gesture && gesture.type === 'pan' && !gesture.moved && gesture.target && e.type === 'pointerup') {
      select(gesture.target, { focus: false });
    }
    if (pointers.size === 0) { gesture = null; svg.classList.remove('dragging'); }
    else if (pointers.size === 1) {
      const [p] = pointers.values();
      gesture = { type: 'pan', startX: p.x, startY: p.y, moved: true };
    }
  };
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);

  // Bublina s názvem při najetí myší
  const tip = $('#tip');
  function hideTip() { tip.hidden = true; }
  svg.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse' || (gesture && gesture.moved)) return;
    const g = e.target.closest('.pt');
    if (!g) return;
    const p = byId.get(g.dataset.id);
    const r = g.querySelector('.dot').getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    tip.innerHTML = `<b>${esc(codeOf(p))}</b>${esc(p.pin)} · ${esc(p.cz)}`;
    tip.style.left = `${r.left + r.width / 2 - sr.left}px`;
    tip.style.top = `${r.top - sr.top}px`;
    tip.hidden = false;
  });
  svg.addEventListener('pointerout', (e) => { if (e.target.closest('.pt')) hideTip(); });

  document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => goPreset(b.dataset.preset)));
  $('#zoom-in').addEventListener('click', () => zoomCenter(1.6));
  $('#zoom-out').addEventListener('click', () => zoomCenter(1 / 1.6));

  function focusPoint(id) {
    const nodes = ptNodes.filter((n) => n.id === id);
    if (!nodes.length) return;
    const n = nodes.find((x) => x.labelled) || nodes[0];
    const w = Math.min(state.view.w, 130);
    const h = w * (VB.h / VB.w);
    setPreset(null);
    animateTo({ x: n.x - w / 2, y: n.y - h / 2, w });
  }

  // ───────────────────────── Zvýraznění bodů
  function paint() {
    for (const n of ptNodes) {
      const p = byId.get(n.id);
      const offEl = state.element && elOf(p) !== state.element;
      const offHl = state.highlight && !state.highlight.has(n.id);
      n.g.classList.toggle('dim', Boolean(offEl || offHl) && n.id !== state.sel);
      n.g.classList.toggle('hl', Boolean(state.highlight && state.highlight.has(n.id)));
      n.g.classList.toggle('sel', n.id === state.sel);
    }
    // vybraný bod navrch
    for (const n of ptNodes) if (n.id === state.sel) ptLayer.appendChild(n.g);
  }

  // Legenda / filtr prvků
  const legend = $('#legend');
  for (const [key, e] of Object.entries(ELEMENTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = e.name;
    b.title = e.hint;
    b.style.setProperty('--c', `var(--el-${key})`);
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      state.element = state.element === key ? null : key;
      legend.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b && state.element === key)));
      legend.classList.toggle('filtering', Boolean(state.element));
      paint();
    });
    legend.appendChild(b);
  }

  // ───────────────────────── Doporučení podle potíže
  const STOP = new Set('a i o u v ve na do se si mi me mne mam mas je jsou by bych aby abych chci chtel chtela potrebuji potrebuju neco nejaky nejake ktery ktere jaky jake co jak proti pro pri od po za bod body bodu bodem pomoc pomoz pomuze pomaha pomahat problem problemy potize potiz bolest bolesti boli bolet bolavy bolava moc hodne casto porad stale porad trochu docela nemuzu nemohu muzu mohu ten ta to tak take taky uz jeste kdyz protoze ale nebo mit dny dnes vecer rano noc noci den'.split(' '));

  function analyze(text) {
    const q = norm(text);
    const tokens = q.split(' ').filter((t) => t.length >= 2);
    const padded = ` ${q} `;
    const used = new Set();
    const best = new Map();
    const hitConcept = (c, w) => best.set(c, Math.max(best.get(c) || 0, w));
    const keysOf = (c) => c.keys.map((key) => (Array.isArray(key) ? key : [key, 1]));

    // Nejdřív fráze („v krku“, „točí se mi hlava“) – jejich slova už pak nepočítáme jinam.
    const phraseWords = new Set();
    for (const c of CONCEPTS) {
      for (const [k, w] of keysOf(c)) {
        if (!k.includes(' ') || !padded.includes(` ${k}`)) continue;
        hitConcept(c, w);
        for (const t of tokens) if (k.split(' ').some((x) => t.startsWith(x))) phraseWords.add(t);
      }
    }
    phraseWords.forEach((t) => used.add(t));
    for (const c of CONCEPTS) {
      for (const [k, w] of keysOf(c)) {
        if (k.includes(' ')) continue;
        for (const t of tokens) {
          if (phraseWords.has(t)) continue;
          if (t.startsWith(k) || (t.length >= 4 && k.startsWith(t))) { hitConcept(c, w); used.add(t); }
        }
      }
    }
    const concepts = CONCEPTS.filter((c) => best.has(c)).map((c) => ({ c, w: best.get(c) }));

    const scores = new Map();
    const add = (id, val, why) => {
      const s = scores.get(id) || { score: 0, why: [] };
      s.score += val;
      if (why && !s.why.includes(why)) s.why.push(why);
      scores.set(id, s);
    };
    for (const { c, w } of concepts) {
      for (const [id, weight] of Object.entries(c.pts)) add(id, weight * w, c.label);
    }

    // Slova, která nepatří k žádné známé potíži, dohledáme v indikacích bodů.
    const free = tokens.filter((t) => !used.has(t) && t.length >= 4 && !STOP.has(t));
    for (const t of free) {
      for (const p of POINTS) {
        const ind = p.ind.find((_, i) => p._ind[i].split(' ').some((word) => word.startsWith(t)));
        if (ind) add(p.id, 1.2, ind);
      }
    }

    const preg = tokens.some((t) => t.startsWith('tehot') || t.startsWith('gravid'));
    let ranked = [...scores.entries()]
      .map(([id, s]) => ({ p: byId.get(id), ...s }))
      .filter((r) => r.p)
      .sort((a, b) => b.score - a.score || a.p.id.localeCompare(b.p.id));
    let excluded = [];
    if (preg) {
      excluded = ranked.filter((r) => r.p.warn && /těhotenství/i.test(r.p.warn));
      ranked = ranked.filter((r) => !excluded.includes(r));
    }
    // Kmeny slov z dotazu – v detailu bodu podle nich zvýrazníme odpovídající indikace.
    const stems = [...used, ...free];
    return { concepts, ranked: ranked.slice(0, 9), excluded, preg, stems, q };
  }

  const QUICK = ['Bolest hlavy', 'Nespavost', 'Nevolnost', 'Stres', 'Bolest zad', 'Ztuhlá šíje', 'Nachlazení', 'Menstruační bolesti', 'Únava', 'Zácpa', 'Ucpaný nos', 'Bolest zubů'];

  const needInput = $('#need-input');
  const needOut = $('#need-results');
  const chipsBox = $('#need-chips');
  for (const label of QUICK) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = label;
    b.addEventListener('click', () => {
      needInput.value = label;
      runNeed(true);
    });
    chipsBox.appendChild(b);
  }

  const HOWTO = `
    <div class="howto">
      <h3>Jak bod masírovat</h3>
      <p>Najděte citlivé místo – bod bývá v jemné jamce a při tlaku mírně brní nebo tupě bolí. Tlačte bříškem palce 1–3 minuty, stálým tlakem nebo malými kroužky, a klidně dýchejte. Párové body ošetřete na obou stranách těla.</p>
    </div>`;

  function introHTML() {
    return `
      <p class="note">Popište potíž vlastními slovy, třeba <strong>„nemůžu usnout a jsem ve stresu“</strong>, nebo vyberte častou potíž výše. Atlas vybere vhodné body a ukáže je na těle.</p>
      ${HOWTO}`;
  }

  function rowHTML(r, i) {
    const p = r.p;
    const why = esc(r.why.length ? `Pomáhá na: ${r.why.slice(0, 3).join(', ')}` : p.eff)
      + (p.warn ? ' <span class="flag">· má upozornění</span>' : '');
    return `<li><button type="button" class="row" data-open="${esc(p.id)}">
      <span class="code" style="--c:${colorOf(p)}">${esc(codeOf(p))}</span>
      <span><span class="name">${esc(p.pin)} <i>· ${esc(p.cz)}</i></span><span class="why">${why}</span></span>
      <span class="rank">${i ? `${i}.` : ''}</span>
    </button></li>`;
  }

  let lastNeed = null;
  function runNeed(focusFirst) {
    const text = needInput.value.trim();
    chipsBox.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', norm(c.textContent) === norm(text)));
    if (!text) {
      lastNeed = null;
      needOut.innerHTML = introHTML();
      setHighlight(null);
      return;
    }
    const res = analyze(text);
    lastNeed = res;
    state.matchedInd = res.stems;
    if (!res.ranked.length && res.preg) {
      needOut.innerHTML = `<p class="banner"><strong>Těhotenství:</strong> některé body (LI4, SP6, GB21, BL60, body na podbřišku) se v těhotenství nepoužívají. Napište ještě, s čím chcete pomoct – třeba <em>nevolnost</em> nebo <em>bolest zad</em> – a vyberu jen bezpečnější body.</p>`;
      setHighlight(null);
      return;
    }
    if (!res.ranked.length) {
      needOut.innerHTML = `<p class="note">K <strong>„${esc(text)}“</strong> jsem žádný bod nenašel. Zkuste potíž popsat jinými slovy – například <em>bolest kolene</em>, <em>pálení žáhy</em> nebo <em>hučení v uších</em>.</p>`;
      setHighlight(null);
      return;
    }
    const recog = res.concepts.length
      ? `<div class="recog">Rozpoznáno: ${res.concepts.map(({ c }) => `<span class="tag">${esc(c.label)}</span>`).join('')}</div>`
      : '';
    const preg = res.preg
      ? `<p class="banner"><strong>Těhotenství:</strong> body, které mohou vyvolat stahy dělohy, jsem z výsledků vyřadil${res.excluded.length ? ` (${res.excluded.map((r) => esc(codeOf(r.p))).join(', ')})` : ''}. Akupresuru v těhotenství konzultujte s porodní asistentkou nebo lékařem.</p>`
      : '';
    needOut.innerHTML = `${recog}${preg}
      <ol class="list">${res.ranked.map((r, i) => rowHTML(r, i + 1)).join('')}</ol>
      ${HOWTO}`;
    setHighlight(res.ranked.map((r) => r.p.id));
    if (focusFirst) fitHighlight();
  }

  let needTimer = 0;
  needInput.addEventListener('input', () => {
    clearTimeout(needTimer);
    needTimer = setTimeout(() => runNeed(false), 280);
  });
  needInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runNeed(true); }
  });
  $('#need-form').addEventListener('submit', (e) => { e.preventDefault(); runNeed(true); });

  function setHighlight(ids) {
    state.highlight = ids && ids.length ? new Set(ids) : null;
    paint();
  }

  // Přiblíží pohled tak, aby byly vidět všechny zvýrazněné body.
  function fitHighlight() {
    if (!state.highlight) return;
    const nodes = ptNodes.filter((n) => state.highlight.has(n.id));
    if (!nodes.length) return;
    const views = new Set(nodes.map((n) => n.v));
    if (views.size === 2) { goPreset(isNarrow() ? 'f' : 'both'); return; }
    goPreset([...views][0]);
  }

  // ───────────────────────── Hledání bodu
  const findInput = $('#find-input');
  const findOut = $('#find-results');

  function browseHTML() {
    const groups = Object.keys(MERIDIANS).map((m) => {
      const pts = POINTS.filter((p) => p.mer === m);
      const el = ELEMENTS[MERIDIANS[m].el];
      return `<h3 class="group-title">${esc(MERIDIANS[m].name)} <small>${esc(el.name)} · ${pts.length}</small></h3>
        <ul class="list">${pts.map((p) => rowHTML({ p, why: [] }, 0)).join('')}</ul>`;
    });
    return `<p class="note">Všech ${POINTS.length} bodů podle drah. Hledat můžete kód (<strong>ST36</strong>), čínský název (<strong>Zusanli</strong>), český překlad, dráhu nebo účinek.</p>${groups.join('')}`;
  }

  function runFind() {
    const q = norm(findInput.value);
    if (!q) { findOut.innerHTML = browseHTML(); setHighlight(null); return; }
    const tokens = q.split(' ');
    const qc = q.replace(/ /g, '');
    const res = [];
    for (const p of POINTS) {
      const code = norm(codeOf(p)).replace(/ /g, '');
      let score = 0;
      if (code === qc || norm(p.id) === qc) score += 100;
      else if (code.startsWith(qc)) score += 40;
      if (!tokens.every((t) => p._all.includes(t)) && score === 0) continue;
      const pin = norm(p.pin), cz = norm(p.cz), mer = norm(MERIDIANS[p.mer].name);
      for (const t of tokens) {
        if (pin.startsWith(t)) score += 30;
        if (cz.includes(t)) score += 20;
        if (mer.includes(t)) score += 12;
        if (p._ind.some((i) => i.includes(t))) score += 10;
        score += 1;
      }
      res.push({ p, score });
    }
    res.sort((a, b) => b.score - a.score);
    state.matchedInd = tokens;
    if (!res.length) {
      findOut.innerHTML = `<p class="note">Nic neodpovídá <strong>„${esc(findInput.value)}“</strong>. Zkuste kód jako LI4, název dráhy nebo účinek.</p>`;
      setHighlight(null);
      return;
    }
    findOut.innerHTML = `<p class="note">${res.length === 1 ? 'Nalezen 1 bod' : `Nalezeno bodů: ${res.length}`}</p>
      <ul class="list">${res.map((r) => {
        const hits = r.p.ind.filter((_, i) => tokens.some((t) => r.p._ind[i].includes(t)));
        return rowHTML({ p: r.p, why: hits }, 0);
      }).join('')}</ul>`;
    setHighlight(res.map((r) => r.p.id));
  }
  findInput.addEventListener('input', runFind);
  findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = findOut.querySelector('[data-open]');
      if (first) select(first.dataset.open, { focus: true });
    }
  });

  // ───────────────────────── Detail bodu
  const detail = $('#detail');
  const panes = { need: $('#pane-need'), find: $('#pane-find') };
  const panelBody = $('#panel-body');

  function detailHTML(p) {
    const mer = MERIDIANS[p.mer];
    const el = ELEMENTS[mer.el];
    const stems = state.matchedInd || [];
    const ind = p.ind.map((x, i) => {
      const hit = stems.some((t) => t.length >= 3 && p._ind[i].split(' ').some((w) => w.startsWith(t) || (t.length >= 4 && t.startsWith(w) && w.length >= 4)));
      return `<li${hit ? ' class="hit"' : ''}>${esc(x)}</li>`;
    }).join('');
    const sib = POINTS.filter((x) => x.mer === p.mer)
      .map((x) => `<button type="button" class="chip${x.id === p.id ? ' on' : ''}" data-open="${esc(x.id)}">${esc(codeOf(x))}</button>`).join('');
    const views = [...new Set(p.pos.map((x) => x.v))].map((v) => (v === 'f' ? 'zepředu' : 'zezadu')).join(' a ');
    return `
      <button type="button" class="back" data-back>← Zpět na seznam</button>
      <div class="d-head" style="--c:${colorOf(p)}">
        <span class="code">${esc(codeOf(p))}</span>
        <h2>${esc(p.pin)}</h2>
        <p class="cz">${esc(p.cz)}</p>
      </div>
      <p class="d-mer" style="--c:${colorOf(p)}">Dráha <b>${esc(mer.name)}</b> · prvek ${esc(el.name)} · ${p.bi ? 'párový bod (obě strany těla)' : 'nepárový bod na střední čáře'} · na obrázku ${views}</p>
      <p class="d-eff">${esc(p.eff)}</p>
      ${p.warn ? `<p class="banner"><strong>Pozor:</strong> ${esc(p.warn)}</p>` : ''}
      <div class="d-sec">
        <h3>Kde ho najdu</h3>
        <p>${esc(p.loc)}</p>
        ${/cun/.test(p.loc) ? `<dl class="cun">
          <dt>1 cun</dt><dd>šířka vašeho palce v nejširším místě</dd>
          <dt>1,5 cun</dt><dd>ukazováček a prostředníček u sebe</dd>
          <dt>3 cun</dt><dd>čtyři prsty u sebe (bez palce)</dd>
        </dl>` : ''}
      </div>
      <div class="d-sec">
        <h3>Na co pomáhá</h3>
        <ul class="ind">${ind}</ul>
      </div>
      ${p.tip ? `<div class="d-sec"><h3>Tip</h3><p>${esc(p.tip)}</p></div>` : ''}
      <div class="d-sec">
        <h3>Další body dráhy ${esc(mer.name)}</h3>
        <div class="siblings">${sib}</div>
      </div>
      ${HOWTO}`;
  }

  function showPane() {
    detail.hidden = true;
    panes.need.hidden = state.tab !== 'need';
    panes.find.hidden = state.tab !== 'find';
  }

  let scrollBefore = 0;
  function select(id, { focus = true } = {}) {
    const p = byId.get(id);
    if (!p) return;
    if (detail.hidden) scrollBefore = panelBody.scrollTop;
    state.sel = id;
    detail.innerHTML = detailHTML(p);
    detail.hidden = false;
    panes.need.hidden = true;
    panes.find.hidden = true;
    panelBody.scrollTop = 0;
    paint();
    if (focus) focusPoint(id);
    try { history.replaceState(null, '', `#${id}`); } catch (_) { /* rámeček může historii zakázat */ }
  }

  function closeDetail() {
    state.sel = null;
    showPane();
    paint();
    panelBody.scrollTop = scrollBefore;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) { /* viz výše */ }
  }

  // Delegované kliknutí na položky seznamů
  panelBody.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open]');
    if (open) { select(open.dataset.open, { focus: true }); return; }
    if (e.target.closest('[data-back]')) closeDetail();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.sel) closeDetail();
  });

  // Záložky
  const tabs = { need: $('#tab-need'), find: $('#tab-find') };
  function setTab(name) {
    state.tab = name;
    for (const [k, b] of Object.entries(tabs)) b.setAttribute('aria-selected', String(k === name));
    state.sel = null;
    showPane();
    if (name === 'need') runNeed(false); else runFind();
  }
  tabs.need.addEventListener('click', () => setTab('need'));
  tabs.find.addEventListener('click', () => { setTab('find'); findInput.focus({ preventScroll: true }); });

  // ───────────────────────── Start
  const isNarrow = () => stage.clientWidth / Math.max(stage.clientHeight, 1) < 0.75;
  $('#brand-sub').textContent = `${POINTS.length} bodů na 14 drahách · akupresura`;
  runNeed(false);
  findOut.innerHTML = browseHTML();
  setPreset(isNarrow() ? 'f' : 'both');
  state.view = clampView({ ...PRESETS[state.preset] });
  applyView();
  paint();

  new ResizeObserver(() => applyView()).observe(stage);

  const fromHash = decodeURIComponent((location.hash || '').slice(1));
  if (fromHash) {
    const p = byId.get(fromHash) || POINTS.find((x) => norm(codeOf(x)) === norm(fromHash));
    if (p) select(p.id, { focus: true });
  }

  if ('serviceWorker' in navigator && /^https:|^http:\/\/localhost/.test(location.href) && !window.AKU_NO_SW) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline režim je jen bonus */ });
  }
})();
