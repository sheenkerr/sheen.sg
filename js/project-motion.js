// FlowFox's deploy and Virtual Vault's soak test, played in their project panels with the Web Animations API.
// Each panel's markup in js/app.js is its last frame. Every tween runs from its first keyframe to the element's own style
// and fills only backwards, so stopping at any moment, reduced motion, or a browser without the API all leave the finished
// diagram in place. A panel's wires and shoppers are drawn in as it nears the screen; it plays once when it comes into view,
// pauses while it's off screen or the tab is hidden, and replays on request.
(() => {
  const $ = (s, el) => el.querySelector(s);
  const $$ = (s, el) => [...el.querySelectorAll(s)];
  const panels = $$('.project-visual[data-pv]', document);
  if (!panels.length) return;
  const canAnimate = typeof document.body.animate === 'function' && typeof KeyframeEffect === 'function' && typeof Animation === 'function';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOn = () => canAnimate && !reduce.matches;
  const EASE = { out: 'cubic-bezier(.22, 1, .36, 1)', inOut: 'cubic-bezier(.65, 0, .35, 1)', back: 'cubic-bezier(.34, 1.56, .64, 1)' };
  const pad = n => String(n).padStart(2, '0');
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  // seeded, so the shoppers flicker the same way every time
  function rng(seed) {
    return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  // one run of a panel: its tweens, and how long it lasts
  function timeline() {
    const T = { anims: [], end: 0 };
    T.to = (el, keyframes, at, duration, easing = EASE.out, opts = {}) => {
      const a = el.animate(keyframes, { delay: at, duration, easing, fill: 'backwards', ...opts });
      T.anims.push(a);
      T.end = Math.max(T.end, at + duration * (opts.iterations || 1));
      return a;
    };
    // from the given values to the element's own style
    T.from = (el, props, at, duration, easing, opts) => T.to(el, [{ offset: 0, ...props }], at, duration, easing, opts);
    return T;
  }

  // ---------- push to live: FlowFox's deploy ----------
  const NODES = ['push', 'diff', 'api1', 'api2', 'fe1', 'fe2', 'live'];
  const EDGES = [['push', 'diff'], ['diff', 'api1'], ['diff', 'fe1'], ['api1', 'api2'], ['fe1', 'fe2'], ['api2', 'live'], ['fe2', 'live']]
    .map(e => e.map(n => NODES.indexOf(n)));
  // [packet, edge, start, duration]: the API's image build is the slow lane, so the frontend arrives first and waits
  const LEGS = [[0, 0, 300, 450], [0, 1, 950, 450], [1, 2, 950, 450], [0, 3, 1550, 900], [1, 4, 1550, 450], [1, 6, 2150, 500], [0, 5, 2650, 480]];
  const ARRIVE = 3130;
  // each wire is sampled by distance once per layout, so a packet's path is worked out here and never read back from the page
  const SAMPLES = 24, LEG_FRAMES = 12;
  function sampleCubic(c) {
    const pts = [], len = [0];
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES, u = 1 - t, a = u * u * u, b = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t;
      pts.push([a * c[0] + b * c[2] + d * c[4] + e * c[6], a * c[1] + b * c[3] + d * c[5] + e * c[7]]);
      if (i) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts, len, total: len[SAMPLES] };
  }
  function pointAt(s, f) {
    const want = f * s.total;
    let i = 1;
    while (i < SAMPLES && s.len[i] < want) i++;
    const a = s.pts[i - 1], b = s.pts[i], span = s.len[i] - s.len[i - 1], k = span ? clamp((want - s.len[i - 1]) / span, 0, 1) : 0;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  // a packet's whole trip as one tween: hidden until its first leg, eased along each leg, waiting at the step where a leg
  // ends and starting the next from the far side of it
  function packetFrames(k, wires) {
    const kf = [], legs = LEGS.filter(l => l[0] === k);
    const at = (t, [x, y], opacity = 1) => kf.push({ offset: t / ARRIVE, opacity, transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` });
    let last = pointAt(wires[legs[0][1]], 0);
    at(0, last, 0);
    legs.forEach(([, e, start, dur], j) => {
      at(start, last, j ? 1 : 0);
      for (let i = 0; i <= LEG_FRAMES; i++) at(start + dur * i / LEG_FRAMES, last = pointAt(wires[e], easeInOut(i / LEG_FRAMES)));
    });
    at(ARRIVE, last);
    return kf;
  }
  const deploy = {
    setup(stage) {
      const svg = $('.pv-wires', stage);
      svg.innerHTML = EDGES.map(() => '<path class="pv-wire"/>').join('') + EDGES.map(() => '<path class="pv-wire-on" pathLength="1"/>').join('') +
        '<circle class="pv-packet" r="5"/><circle class="pv-packet" r="5"/>';
      const nodes = NODES.map(n => $(`[data-n="${n}"]`, stage));
      return { svg, nodes, base: $$('.pv-wire', svg), on: $$('.pv-wire-on', svg), packets: $$('.pv-packet', svg), tick: $('.pv-tick path', stage) };
    },
    // all reads for a layout, before any writes
    measure(stage, st) {
      return { w: stage.clientWidth, h: stage.clientHeight, boxes: st.nodes.map(el => [el.offsetLeft, el.offsetTop, el.offsetLeft + el.offsetWidth, el.offsetTop + el.offsetHeight]) };
    },
    // wires join each step to the next, across when the next sits beside it and down when it sits below
    apply(stage, st, m) {
      const key = [m.w, m.h, ...m.boxes.flat()].join();
      if (key === st.key) return;
      st.key = key;
      const curves = EDGES.map(([from, to]) => {
        const [al, at, ar, ab] = m.boxes[from], [bl, bt, br, bb] = m.boxes[to];
        if (bl >= ar - 2) {
          const y1 = (at + ab) / 2, y2 = (bt + bb) / 2, x = (ar + bl) / 2;
          return [ar, y1, x, y1, x, y2, bl, y2];
        }
        const x1 = (al + ar) / 2, x2 = (bl + br) / 2, y = (ab + bt) / 2;
        return [x1, ab, x1, y, x2, y, x2, bt];
      });
      st.svg.setAttribute('viewBox', `0 0 ${m.w} ${m.h}`);
      curves.forEach((c, i) => {
        const d = `M${c[0]} ${c[1]}C${c[2]} ${c[3]} ${c[4]} ${c[5]} ${c[6]} ${c[7]}`;
        st.base[i].setAttribute('d', d);
        st.on[i].setAttribute('d', d);
      });
      st.wires = curves.map(sampleCubic);
      // a resize mid-run moves the packets onto the new wires
      st.trips?.forEach((a, k) => a.effect.setKeyframes(packetFrames(k, st.wires)));
    },
    build(stage, T, st) {
      const node = n => st.nodes[NODES.indexOf(n)], ink = getComputedStyle(stage).color;
      // a step waits as an outline, and fills when the work reaches it
      const done = (n, at) => T.from(node(n), { backgroundColor: 'rgba(255, 255, 255, 0)', borderColor: ink, transform: 'scale(.95)' }, at, 440, EASE.back);
      LEGS.forEach(([, e, at, dur]) => T.from(st.on[e], { strokeDashoffset: '1' }, at, dur, EASE.inOut));
      done('push', 0); done('diff', 750); done('api1', 1400); done('fe1', 1400); done('fe2', 2000); done('api2', 2450);
      T.from(node('live'), { backgroundColor: 'rgba(255, 255, 255, 0)', color: ink, borderColor: ink, transform: 'scale(.94)' }, ARRIVE, 520, EASE.back);
      T.to(node('live'), [{ boxShadow: `0 0 0 0 ${ink}` }, { boxShadow: '0 0 0 16px rgba(0, 0, 0, 0)' }], ARRIVE + 80, 900);
      T.from(st.tick, { strokeDashoffset: '1' }, ARRIVE + 260, 420);
      st.trips = st.packets.map((dot, k) => T.to(dot, packetFrames(k, st.wires), 0, ARRIVE, 'linear'));
    },
    rest(stage, st) { st.trips = null; },
  };

  // ---------- fourteen hours: Virtual Vault's soak test ----------
  const SOAK_START = 350, SOAK = 4200, SOAK_AT = 4.5 / 14;
  // the shoppers whose order history starts timing out; they turn amber in three waves after 4½ hours
  const LATE = new Set([3, 11, 17, 24, 29, 36, 42, 48, 53, 57, 64, 68, 71, 79, 85, 88, 93, 97]);
  // the hundred shoppers flicker in eight groups scattered across the grid, so a run is a few dozen tweens rather than a
  // hundred and more
  const FLICKS = 8, WAVES = 3;
  const soak = {
    setup(stage) {
      const r = rng(1404), groups = Array.from({ length: FLICKS }, () => ({ dots: '', late: Array(WAVES).fill('') }));
      for (let i = 0; i < 100; i++) {
        const g = groups[r() * FLICKS | 0], dot = `<circle cx="${i % 10 * 10 + 5}" cy="${(i / 10 | 0) * 10 + 5}" r="3.5"/>`;
        if (LATE.has(i)) g.late[r() * WAVES | 0] += dot; else g.dots += dot;
      }
      $('.pv-crowd', stage).innerHTML = groups.map(g => `<g>${g.dots}${g.late.map((dots, w) => dots && `<g class="pv-late" data-w="${w}">${dots}</g>`).join('')}</g>`).join('');
      return { clock: $('.pv-clock', stage), gb: $('.pv-gb', stage) };
    },
    build(stage, T, st) {
      const r = rng(1404), at = SOAK_START + SOAK * SOAK_AT, ink = getComputedStyle(stage).color;
      T.from($('.pv-sweep', stage), { transform: 'none' }, SOAK_START, SOAK, 'linear');
      T.from($('.pv-mark', stage), { transform: 'translate(-50%, -50%) scale(0)' }, at, 520, EASE.back);
      T.from($('.pv-drop', stage), { transform: 'scaleY(0)' }, at + 160, 380);
      T.from($('.pv-event', stage), { opacity: 0, transform: 'translateY(8px)' }, at + 100, 460);
      // every shopper keeps clicking; after 4½ hours some of them start getting timeouts
      $$('.pv-crowd > g', stage).forEach(g => {
        const dur = 240 + r() * 520, n = Math.max(1, Math.floor(SOAK / dur)) | 1;
        T.to(g, [{ opacity: .3 }, { opacity: 1 }], SOAK_START + r() * 260, dur, 'ease-in-out', { iterations: n, direction: 'alternate' });
      });
      $$('.pv-late', stage).forEach(g => T.from(g, { fill: ink }, at + (+g.dataset.w + r() * .5) * SOAK * .18, 300));
      // the counters change text only when the shown value does
      let clock = '', gb = '';
      return t => {
        const f = clamp((t - SOAK_START) / SOAK, 0, 1), mins = Math.round(f * 168) * 5;
        const c = `${pad(mins / 60 | 0)}h ${pad(mins % 60)}m`, g = `${(0.1 + 2 * f).toFixed(1)} GB`;
        if (c !== clock) st.clock.textContent = clock = c;
        if (g !== gb) st.gb.textContent = gb = g;
      };
    },
    rest(stage, st) { st.clock.textContent = '14h 00m'; st.gb.textContent = '2.1 GB'; },
  };

  // ---------- players: one per panel ----------
  const DEFS = { deploy, soak };
  function player(panel, def) {
    const stage = $('.pv-deploy, .pv-soak', panel), replay = $('.pv-replay', panel);
    let run = null, raf = 0;
    const p = { panel, def, stage, replay, state: null, played: false };
    // the wires and shoppers are made once, as the panel nears the screen or first plays
    p.prepare = () => {
      if (p.state) return;
      p.state = def.setup(stage) || {};
      if (def.measure) def.apply(stage, p.state, def.measure(stage, p.state));
    };
    // a frame callback reads the run's clock, so pausing the tweens pauses the counters with them
    function tick() {
      raf = 0;
      if (!run) return;
      run.frame(run.clock.currentTime ?? 0);
      if (run.clock.playState === 'finished') p.stop();
      else if (run.clock.playState === 'running') raf = requestAnimationFrame(tick);
    }
    // back to the last frame, which is the markup's own state
    p.stop = () => {
      if (raf) cancelAnimationFrame(raf), raf = 0;
      if (!run) return;
      run.anims.forEach(a => a.cancel());
      run.clock.cancel();
      run = null;
      def.rest?.(stage, p.state);
    };
    p.play = () => {
      p.stop();
      if (!motionOn()) return;
      p.prepare();
      p.played = true;
      const T = timeline();
      const frame = def.build(stage, T, p.state);
      const clock = new Animation(new KeyframeEffect(null, null, { duration: T.end }), document.timeline);
      clock.play();
      run = { anims: T.anims, clock, frame };
      // the end doesn't wait on a frame callback, which a browser may hold back
      clock.finished.then(() => { if (run && run.clock === clock) p.stop(); }, () => {});
      if (frame) tick();
    };
    p.pause = () => {
      if (!run || run.clock.playState !== 'running') return;
      run.anims.forEach(a => a.playState === 'running' && a.pause());
      run.clock.pause();
      if (raf) cancelAnimationFrame(raf), raf = 0;
    };
    // only tweens that were paused carry on; play() on a finished one would start it again
    p.resume = () => {
      if (!run || run.clock.playState !== 'paused') return;
      run.anims.forEach(a => a.playState === 'paused' && a.play());
      run.clock.play();
      if (run.frame && !raf) raf = requestAnimationFrame(tick);
    };
    replay.addEventListener('click', () => p.play());
    return p;
  }
  const players = panels.filter(el => DEFS[el.dataset.pv]).map(el => player(el, DEFS[el.dataset.pv]));
  const of = el => players.find(p => p.panel === el);

  const inView = new Set();
  if (typeof IntersectionObserver === 'function') {
    const near = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { of(e.target).prepare(); near.unobserve(e.target); }
    }), { rootMargin: '400px 0px' });
    const seen = new IntersectionObserver(entries => entries.forEach(e => {
      const p = of(e.target);
      if (e.isIntersecting && e.intersectionRatio >= .4) {
        inView.add(p);
        if (document.hidden) return;
        if (!p.played) p.play(); else p.resume();
      } else if (!e.isIntersecting) {
        inView.delete(p);
        p.pause();
      }
    }), { threshold: [0, .4] });
    players.forEach(p => { near.observe(p.panel); seen.observe(p.panel); });
  } else players.forEach(p => p.prepare());
  // a panel that came into view while the tab was hidden hasn't played yet, so it starts now
  document.addEventListener('visibilitychange', () => players.forEach(p => {
    if (document.hidden) p.pause();
    else if (inView.has(p)) p.played ? p.resume() : p.play();
  }));

  // the wires follow the steps when the page is resized or the font arrives: every panel is measured, then every panel drawn
  let queued = false;
  function relayout() {
    queued = false;
    const due = players.filter(p => p.state && p.def.measure);
    const sizes = due.map(p => p.def.measure(p.stage, p.state));
    due.forEach((p, i) => p.def.apply(p.stage, p.state, sizes[i]));
  }
  addEventListener('resize', () => { if (!queued) { queued = true; requestAnimationFrame(relayout); } });
  document.fonts?.ready.then(relayout);

  // motion follows the system setting as it changes: turning it off ends a run on its last frame and hides Replay
  function applyMotion() {
    const on = motionOn();
    players.forEach(p => {
      p.replay.hidden = !on;
      if (!on) p.stop();
      else if (!p.played && inView.has(p) && !document.hidden) p.play();
    });
  }
  if (reduce.addEventListener) reduce.addEventListener('change', applyMotion); else reduce.addListener?.(applyMotion);
  applyMotion();
})();
