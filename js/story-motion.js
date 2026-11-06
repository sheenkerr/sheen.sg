// Animated diagrams for three Nested stories and the PeerPrep panel on the homepage.
// Each story's art() is its finished frame. build(el, tl) creates a paused GSAP timeline that animates from its start
// state back to the markup's own styles; reverting a completed or cancelled timeline leaves the finished diagram.
// GSAP loads only once motion is allowed and a diagram nears the screen unseen after page load, or on Replay.
window.STORY_MOTION = (() => {
  const HOME = ['stripe', 'llm', 'formulas', 'peerprep'];
  const ICON = {
    tick: '<svg class="sm-ic" viewBox="0 0 16 16" aria-hidden="true"><path pathLength="1" d="M3.5 8.4l3 3 6-6.8"/></svg>',
    cross: '<svg class="sm-ic" viewBox="0 0 16 16" aria-hidden="true"><path pathLength="1" d="M5 5l6 6M11 5l-6 6"/></svg>',
    lock: '<svg class="sm-ic" viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="7.2" width="9" height="6.3" rx="1.6"/><path d="M5.6 7.2V5.6a2.4 2.4 0 0 1 4.8 0v1.6"/></svg>',
    link: '<svg class="sm-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.6 9.4l2.8-2.8M7.4 4.6l1-1a2.6 2.6 0 0 1 3.7 3.7l-1 1M8.6 11.4l-1 1a2.6 2.6 0 0 1-3.7-3.7l1-1"/></svg>',
  };
  const wire = (cls, v) => `<span class="sm-w${v ? ' sm-v' : ''} ${cls}"><i class="sm-l"></i><i class="sm-run"><i></i></i></span>`;
  const chars = s => [...s].map(c => c === 'y' ? '<i class="f-tok">y</i>' : `<i>${c === ' ' ? '&#160;' : c}</i>`).join('');
  // "rgb(0, 38, 69)" → "rgba(0, 38, 69, a)", for rings that fade out in the element's own ink
  const alpha = (rgb, a) => rgb.replace(/^rgba?\(([^,]+),([^,]+),([^,)]+).*$/, `rgba($1,$2,$3, ${a})`);
  const ring = (el, rgb, at, tl, spread = 10) => tl.fromTo(el, { boxShadow: `0 0 0 0 ${alpha(rgb, .55)}` },
    { boxShadow: `0 0 0 ${spread}px ${alpha(rgb, 0)}`, duration: .7, ease: 'power2.out', immediateRender: false }, at);

  const designs = {
    // ---------- Stripe billing: checkout, Stripe, the webhook back, billing, then test keys to live ----------
    // In a narrow region the steps turn back on themselves (css/story-motion.css): billing sits left of the webhook, and
    // the last wire runs right to left.
    stripe: {
      kind: 'story', title: 'Checkout to live keys',
      layout: el => String(el.querySelector('.s-bill').offsetLeft < el.querySelector('.s-hook').offsetLeft),
      art: () => `<div class="sm-art sm-stripe" data-sm="stripe" aria-hidden="true"><div class="sm-in">
        <span class="sm-n s-checkout"><b>Checkout</b><small>by price ID</small></span>${wire('s-w1')}
        <span class="sm-n s-stripe"><b>Stripe</b><small>sends an event</small></span>${wire('s-w2', true)}
        <span class="sm-mode"><span class="m-test">Test</span><span class="m-live">Live</span><i class="sm-knob"></i></span>
        <span class="sm-n s-hook"><b>Webhook</b></span>${wire('s-w3')}
        <span class="sm-n s-bill is-on"><b>Billing${ICON.tick}</b><small>subscription, wallet</small></span>
      </div></div>`,
      build(el, tl) {
        const $ = s => el.querySelector(s), ink = getComputedStyle(el).color;
        const wake = (n, at) => { tl.from(n, { '--on': 0, duration: .35 }, at); tl.from(n, { scale: .94, duration: .5, ease: 'back.out(2.2)' }, at); };
        // the line grows from its own origin, which the stylesheet puts on the right of a backward wire, as the dot runs it
        const send = (w, at, vertical, backward) => {
          const run = vertical ? 'yPercent' : 'xPercent';
          tl.from($(`${w} .sm-l`), { [vertical ? 'scaleY' : 'scaleX']: 0, duration: .5, ease: 'power1.inOut' }, at);
          tl.fromTo($(`${w} .sm-run`), { opacity: 1, [run]: 0 },
            { [run]: backward ? -100 : 100, duration: .5, ease: 'power1.inOut', immediateRender: false }, at);
          tl.to($(`${w} .sm-run`), { opacity: 0, duration: .12 }, at + .5);
        };
        wake($('.s-checkout'), .1); send('.s-w1', .45);
        wake($('.s-stripe'), .95); send('.s-w2', 1.3, true);
        wake($('.s-hook'), 1.8); send('.s-w3', 2.1, false, designs.stripe.layout(el) === 'true');
        wake($('.s-bill'), 2.6); tl.from($('.s-bill b .sm-ic path'), { strokeDashoffset: 1, duration: .35 }, 2.75);
        tl.from($('.s-bill small'), { opacity: 0, duration: .3 }, 2.8);
        // the switch slides across and the labels trade colours under it
        const test = $('.m-test'), live = $('.m-live'), on = getComputedStyle(live).color, off = getComputedStyle(test).color;
        tl.from($('.sm-knob'), { xPercent: -100, duration: .55, ease: 'power3.inOut' }, 3.15);
        tl.from(live, { color: off, duration: .3 }, 3.35);
        tl.from(test, { color: on, duration: .3 }, 3.35);
        ring($('.sm-mode'), ink, 3.65, tl, 8);
        return tl;
      },
    },

    // ---------- model fallback: the primary fails and the backup answers, with the badge Julia shows ----------
    llm: {
      kind: 'story', title: 'Backup model answering',
      art: () => `<div class="sm-art sm-llm" data-sm="llm" aria-hidden="true"><div class="sm-in">
        <i class="l-req"></i>
        <span class="l-rails"><i class="l-stub"></i><i class="l-rail up"></i><i class="l-rail down"></i><i class="l-rail up on"></i><i class="l-rail down on"></i></span>
        <span class="sm-n l-prim"><b>Primary</b><i class="l-x">${ICON.cross}</i></span>
        <span class="l-row"><span class="sm-n l-back is-on"><b>Backup</b></span><i class="l-badge"><i class="l-ring"></i></i><small class="l-say">answering</small></span>
      </div></div>`,
      build(el, tl) {
        const $ = s => el.querySelector(s), prim = $('.l-prim');
        tl.from($('.l-req'), { scale: 0, duration: .3, ease: 'back.out(2.2)' }, 0);
        tl.from($('.l-stub'), { scaleX: 0, duration: .2, ease: 'none' }, .2);
        // the call goes to the primary first
        tl.fromTo($('.l-rail.up.on'), { opacity: 1, clipPath: 'inset(100% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: .4, ease: 'power1.inOut', immediateRender: false }, .38);
        tl.fromTo(prim, { borderStyle: 'solid' }, { borderStyle: 'dashed', duration: 0 }, 1.0);
        tl.from($('.l-x'), { scale: 0, rotation: -60, duration: .35, ease: 'back.out(2.4)' }, 1.0);
        tl.to(prim, { keyframes: { x: [0, -3, 3, -2, 0] }, duration: .32, ease: 'none' }, 1.0);
        tl.to($('.l-rail.up.on'), { opacity: 0, duration: .3 }, 1.25);
        // and falls back to the backup
        tl.fromTo($('.l-rail.down.on'), { clipPath: 'inset(0% 100% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .45, ease: 'power1.inOut' }, 1.45);
        tl.from($('.l-back'), { '--on': 0, duration: .35 }, 1.85);
        tl.from($('.l-back'), { scale: .94, duration: .5, ease: 'back.out(2.2)' }, 1.85);
        tl.from($('.l-badge'), { scale: 0, duration: .3, ease: 'back.out(2.4)' }, 2.05);
        tl.from($('.l-say'), { opacity: 0, x: -4, duration: .3 }, 2.15);
        // the badge pulses twice, then rests
        tl.fromTo($('.l-ring'), { scale: 1, opacity: .75 }, { scale: 2.8, opacity: 0, duration: .65, repeat: 1, ease: 'power1.out', immediateRender: false }, 2.25);
        return tl;
      },
    },

    // ---------- formula references: the formula reads an attribute's Y-value, so deleting it is refused ----------
    formulas: {
      kind: 'story', title: 'A reference that holds',
      art: () => `<div class="sm-art sm-formulas" data-sm="formulas" aria-hidden="true"><div class="sm-in">
        <p class="f-row"><span class="f-eg">e.g.</span><code class="f-code">${chars('round(x / y)')}</code></p>
        <div class="f-row2"><span class="sm-n f-attr"><b>Pack size</b><code class="f-y">y = 12</code></span>
          <span class="f-act"><span class="f-del">Delete</span><span class="f-msg">${ICON.lock}Used by a formula</span></span></div>
      </div></div>`,
      build(el, tl) {
        const $ = s => el.querySelector(s), attr = $('.f-attr');
        tl.from($('.f-eg'), { opacity: 0, duration: .25 }, 0);
        tl.from(el.querySelectorAll('.f-code > i'), { opacity: 0, duration: .01, stagger: .055 }, .1);
        tl.from(attr, { opacity: 0, y: 6, duration: .35 }, .55);
        // y in the formula and the attribute's Y-value light up together
        tl.from([$('.f-tok'), $('.f-y')], { '--on': 0, duration: .3 }, .95);
        tl.to([$('.f-tok'), $('.f-y')], { keyframes: { scale: [1, 1.12, 1] }, duration: .35 }, .95);
        // an edit tries to delete the attribute; the check puts it back
        tl.fromTo($('.f-del'), { opacity: 1 }, { opacity: 0, duration: .2 }, 2.3);
        tl.to($('.f-del'), { keyframes: { scale: [1, .9, 1] }, duration: .25 }, 1.45);
        tl.to(attr, { keyframes: [
          { x: 14, opacity: .35, duration: .32, ease: 'power2.in' },
          { x: 0, opacity: 1, duration: .3, ease: 'back.out(1.6)' },
          { x: -3, duration: .06 }, { x: 3, duration: .06 }, { x: 0, duration: .06 },
        ] }, 1.6);
        tl.fromTo(attr, { boxShadow: '0 0 0 2px rgba(179, 38, 30, 1)' }, { boxShadow: '0 0 0 2px rgba(179, 38, 30, 0)', duration: .8, immediateRender: false }, 1.95);
        tl.from($('.f-msg'), { opacity: 0, x: -6, duration: .35 }, 2.35);
        return tl;
      },
    },

    // ---------- PeerPrep: services register with the gateway, a request goes through it, a WebSocket reconnects ----------
    // On the homepage this runs over the panel js/app.js already draws, adding only the status marks and a layer of dots.
    peerprep: {
      kind: 'panel', title: 'Only live services get calls',
      // the layout the dots' paths were worked out for: the panel's width and where its boxes sit
      layout: flow => [flow, ...flow.querySelectorAll('.node')].map(n => `${n.offsetLeft},${n.offsetTop},${n.offsetWidth}`).join(' '),
      augment(flow) {
        if (flow.querySelector('.pp-fx')) return flow;
        const [user, match, collab] = flow.querySelectorAll('.fork > .node');
        [user, match].forEach(n => n.insertAdjacentHTML('beforeend', '<i class="pp-live" aria-hidden="true"></i>'));
        collab.insertAdjacentHTML('beforeend', `<i class="pp-link" aria-hidden="true">${ICON.link}</i>`);
        flow.insertAdjacentHTML('beforeend', '<span class="pp-fx" aria-hidden="true"><i class="pp-dot"></i><i class="pp-dot"></i><i class="pp-dot"></i><i class="pp-dot"></i></span>');
        flow.classList.add('pp-flow');
        flow.dataset.sm = 'peerprep';
        return flow;
      },
      build(flow, tl) {
        const $ = s => flow.querySelector(s);
        const [browser, gate] = flow.querySelectorAll(':scope > .node'), [user, match, collab] = flow.querySelectorAll('.fork > .node');
        const [hb1, hb2, req, ws] = flow.querySelectorAll('.pp-dot'), ink = getComputedStyle(flow).color;
        // every position is read once, here, from layout offsets (which a scaled or lifted card doesn't change); the dots
        // then move by transform only
        const box = n => {
          let x = 0, y = 0;
          for (let e = n; e && e !== flow; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
          return { left: x, x: x + n.offsetWidth / 2, top: y, mid: y + n.offsetHeight / 2, bottom: y + n.offsetHeight };
        };
        const B = box(browser), G = box(gate), U = box(user), M = box(match), C = box(collab), bar = U.top - 9;
        // A narrow panel stacks the services (css/styles.css) and hangs each off one line down the left, the fork's
        // ::before, whose left is read here; a dot then meets a service at its left side rather than its top.
        // Each route takes .48s either way, so the gateway's rings land as the dots arrive.
        const fork = user.parentElement, stacked = match.offsetTop > user.offsetTop;
        const lane = stacked ? box(fork).left + parseFloat(getComputedStyle(fork, '::before').left) + .75 : G.x;
        const at = n => (stacked ? { x: n.left, y: n.mid } : { x: n.x, y: n.top });
        // up the drop, along the bar and up into the gateway; or the same in reverse, down to a service
        const up = n => (stacked ? [{ x: lane, y: n.mid, duration: .12 }, { x: lane, y: G.bottom, duration: .36 }]
          : [{ x: n.x, y: bar, duration: .14 }, { x: G.x, y: bar, duration: .22 }, { x: G.x, y: G.bottom, duration: .12 }]);
        const down = n => (stacked ? [{ x: lane, y: n.mid, duration: .36 }, { x: n.left, y: n.mid, duration: .12 }]
          : [{ x: G.x, y: bar, duration: .12 }, { x: n.x, y: bar, duration: .22 }, { x: n.x, y: n.top, duration: .14 }]);
        const trip = (dot, from, legs, at) => {
          tl.set(dot, { x: from.x, y: from.y, opacity: 1 }, at);
          tl.to(dot, { keyframes: legs, ease: 'power1.inOut' }, at);
          tl.to(dot, { opacity: 0, duration: .12 }, at + legs.reduce((s, l) => s + l.duration, 0));
        };
        const clear = { backgroundColor: 'rgba(255, 255, 255, 0)' };
        // the user and matching services start, register and send a heartbeat each
        tl.from(user, { ...clear, duration: .3 }, .1); tl.from(match, { ...clear, duration: .3 }, .3);
        tl.from($('.fork > .node:nth-child(1) .pp-live'), { scale: 0, duration: .3, ease: 'back.out(2.4)' }, .25);
        tl.from($('.fork > .node:nth-child(2) .pp-live'), { scale: 0, duration: .3, ease: 'back.out(2.4)' }, .45);
        trip(hb1, at(U), up(U), .55); ring(gate, ink, 1.05, tl);
        trip(hb2, at(M), up(M), .8); ring(gate, ink, 1.3, tl);
        // a signed-in request: the gateway checks its session and forwards it to a live service
        trip(req, { x: B.x, y: B.bottom }, [{ x: G.x, y: G.top, duration: .3 }], 1.65);
        tl.to(gate, { keyframes: { scale: [1, 1.035, 1] }, duration: .35 }, 1.95);
        trip(req, { x: lane, y: G.bottom }, down(M), 2.25);
        ring(match, ink, 2.73, tl, 6);
        // the collaboration service drops; the gateway reconnects the WebSocket
        tl.to(collab, { opacity: .38, duration: .2 }, 3.0);
        tl.to($('.pp-link'), { opacity: .15, rotation: -25, duration: .2 }, 3.0);
        trip(ws, { x: lane, y: G.bottom }, down(C), 3.45);
        tl.to(collab, { opacity: 1, duration: .25 }, 3.93);
        tl.to($('.pp-link'), { opacity: 1, rotation: 0, duration: .3, ease: 'back.out(2)' }, 3.93);
        ring(collab, ink, 3.95, tl, 6);
        return tl;
      },
    },
  };
  const art = id => designs[id].art();

  // ---------- players: autoplay once in view, pause off screen or in a hidden tab, replay on request ----------
  // A diagram autoplays only if its start frame was set up before any of it showed. One that was already on screen
  // finished (the first load, or GSAP still arriving) stays finished and offers Replay, so it never jumps back to start
  // in view, and the first visible card needs no GSAP at all.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let gsapLoad = null;
  const motionOn = () => !reduce.matches && typeof IntersectionObserver === 'function';
  function withGsap(fn) {
    if (window.gsap) return fn();
    gsapLoad ||= new Promise((ok, no) => {
      const s = document.createElement('script');
      s.src = 'js/vendor/gsap.min.js'; s.onload = () => (window.gsap ? ok() : no()); s.onerror = no;
      document.head.append(s);
    });
    // no GSAP means no motion: the last frame is already on the page
    gsapLoad.then(fn, () => {});
  }
  // the page's own files come first: GSAP for a start frame is only fetched once the page has loaded
  const afterLoad = fn => (document.readyState === 'complete' ? fn() : addEventListener('load', fn, { once: true }));
  const players = new Map();
  function player(stage, id, replay) {
    const def = designs[id];
    // vis: any of it on screen; inView: enough to play; played: run, or seen finished, so it won't autoplay again;
    // req: the Replay click waiting for GSAP, dropped if anything changes before it arrives
    const p = { stage, id, replay, played: false, near: false, vis: false, inView: false, tl: null, req: null };
    p.make = () => {
      if (p.tl) return p.tl;
      p.tl = def.build(stage, gsap.timeline({ paused: true, defaults: { duration: .4, ease: 'power2.out' } }));
      p.layout = def.layout?.(stage);
      p.tl.eventCallback('onComplete', () => queueMicrotask(() => { if (p.tl && p.tl.progress() === 1) p.stop(); }));
      return p.tl;
    };
    // back to the markup's own last frame, with nothing left running or inline
    p.stop = () => {
      if (p.tl) { p.tl.revert(); p.tl.kill(); p.tl = null; }
      p.req = null;
    };
    // set up the start frame while it's still off screen; on screen already, it has been seen finished
    p.arm = showsNow => {
      if (!motionOn() || p.played || p.tl) return;
      if (showsNow && !document.hidden) { p.played = true; return; }
      afterLoad(() => p.near && !p.played && withGsap(() => {
        if (!p.near || p.played || p.tl || !motionOn()) return;
        if (p.vis && !document.hidden) p.played = true; else p.make();
      }));
    };
    // GSAP is here and it can't be seen yet (it's only just been given a box): set up the start frame now, before it paints
    p.prime = () => { if (window.gsap && motionOn() && !p.played && !p.tl) p.make(); };
    p.disarm = () => { if (!p.played) p.stop(); };
    // autoplay, which never waits for GSAP: only a start frame set up earlier plays
    p.look = () => {
      if (!p.vis || document.hidden) return;
      if (!p.tl) { p.played = true; return; }
      if (!p.inView) return;
      if (!p.played) { p.played = true; p.tl.play(0); } else p.resume();
    };
    // Replay: from the start, now or once GSAP arrives, if it's still on screen and nothing has changed by then
    p.play = () => {
      if (!motionOn()) return p.stop();
      const req = p.req = {};
      withGsap(() => {
        if (p.req !== req || !motionOn() || document.hidden) return;
        // Focus or a click can scroll the button into view before IntersectionObserver catches up.
        // Check the actual box once for this explicit request, including after a delayed GSAP load.
        if (!onScreen(stage.getBoundingClientRect())) { p.req = null; return; }
        p.vis = true;
        p.stop(); p.make();
        p.played = true;
        p.tl.play(0);
      });
    };
    p.pause = () => { p.req = null; if (p.tl && !p.tl.paused()) p.tl.pause(); };
    p.resume = () => { if (p.tl && p.played && p.tl.paused() && p.tl.progress() < 1) p.tl.resume(); };
    replay?.addEventListener('click', () => p.play());
    players.set(stage, p);
    if (near) { near.observe(stage); seen.observe(stage); }
    applyMotion(p);
    return p;
  }
  // a diagram counts as in view when most of it shows, or it fills most of the window
  const showing = e => e.isIntersecting && (e.intersectionRatio >= .6 || (e.rootBounds && e.intersectionRect.height >= e.rootBounds.height * .6));
  // near runs before seen for the same frame, so it reads from the box whether any of the diagram is on screen yet.
  // A diagram with no area (a card behind Show all stories) can still be reported as intersecting the widened root; it
  // counts as neither near nor seen, so it neither fetches GSAP nor gets marked as already seen.
  const hasBox = r => r.width > 0 && r.height > 0;
  const onScreen = r => hasBox(r) && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  const near = typeof IntersectionObserver === 'function' && new IntersectionObserver(es => es.forEach(e => {
    const p = players.get(e.target); if (!p) return;
    p.near = e.isIntersecting && hasBox(e.boundingClientRect);
    if (p.near) p.arm(onScreen(e.boundingClientRect)); else p.disarm();
  }), { rootMargin: '240px 0px' });
  const seen = near && new IntersectionObserver(es => es.forEach(e => {
    const p = players.get(e.target); if (!p) return;
    p.vis = e.isIntersecting && hasBox(e.boundingClientRect);
    p.inView = p.vis && showing(e);
    if (p.vis) p.look(); else p.pause();
  }), { threshold: [0, .3, .6, 1] });
  // a diagram that came into view while the tab was hidden hasn't been seen, so it starts when the tab returns
  document.addEventListener('visibilitychange', () => players.forEach(p => (document.hidden ? p.pause() : p.look())));
  function applyMotion(p) {
    const on = motionOn();
    if (p.replay) p.replay.hidden = !on;
    if (!on) return p.stop();
    if (p.near) p.arm(p.vis);
    p.look();
  }
  if (reduce.addEventListener) reduce.addEventListener('change', () => players.forEach(applyMotion));
  // the PeerPrep dots follow measured positions and Stripe's last wire runs the way its layout sends it, so when those
  // change (a new width, or the font arriving) a run ends on its last frame. A phone's toolbar resizing the window on
  // scroll moves nothing, so it doesn't interrupt.
  let queued = false;
  const remeasure = () => {
    queued = false;
    players.forEach(p => {
      const layout = designs[p.id].layout;
      if (!layout || !p.tl || layout(p.stage) === p.layout) return;
      // a start frame that was waiting is set up again at once, still before it plays
      const was = p.played; p.stop(); p.played = was;
      if (!was) p.make();
    });
  };
  addEventListener('resize', () => { if (!queued) { queued = true; requestAnimationFrame(remeasure); } });
  document.fonts?.ready.then(remeasure);

  const replayBtn = label => `<button class="sm-replay" type="button" aria-label="Replay animation: ${label}" hidden><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.6M4.6 1.4v3h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;

  // ---------- the homepage: swap three story covers' drawings and animate the PeerPrep panel ----------
  // Runs once js/app.js has drawn the page and css/story-motion.css has arrived. A story card is a button, so its Replay
  // can't go inside it: the card moves into a cell with Replay stacked over its top-right corner, and the cell takes the
  // card's place in the grid.
  const stories = HOME.filter(id => designs[id].kind === 'story');
  function mountHome() {
    const titleOf = id => (window.ME?.experience.case_studies.find(s => s.id === id) || {}).title || id;
    stories.forEach(id => {
      const card = document.querySelector(`#storyList .story[data-id="${id}"]`), svg = card?.querySelector('.cover > svg.art');
      if (!svg) return;
      svg.insertAdjacentHTML('afterend', art(id)); svg.remove();
      const cell = document.createElement('div');
      cell.className = ['sm-cell', card.classList.contains('feat') && 'sm-feat', ...['s2', 'more'].filter(c => card.classList.contains(c))].filter(Boolean).join(' ');
      card.classList.remove('s2', 'more');
      card.replaceWith(cell);
      cell.append(card);
      cell.insertAdjacentHTML('beforeend', replayBtn(titleOf(id)));
      const r = cell.lastElementChild;
      r.style.color = getComputedStyle(card.querySelector('.cover')).color;
      player(card.querySelector('.sm-art'), id, r);
    });
    const pv = document.querySelector('.project-feature[data-project="peerprep"] .project-visual');
    if (pv) {
      pv.classList.add('sm-pp');
      const flow = designs.peerprep.augment(pv.querySelector('.flow'));
      pv.querySelector('.visual-head').insertAdjacentHTML('beforeend', replayBtn('PeerPrep gateway').replace('sm-replay', 'pv-replay').replace('</svg>', '</svg><span>Replay</span>'));
      player(flow, 'peerprep', pv.querySelector('.pv-replay'));
    }
    // the cards behind Show all stories have no box to watch until it opens, so their start frames are set up as it
    // opens, before they paint. This listener runs after js/app.js's own, so the grid is already open. GSAP is fetched
    // once the button is pointed at or focused; if it isn't here by the click, they show finished and offer Replay.
    const more = document.getElementById('moreStories');
    if (more) {
      const warm = () => { if (motionOn()) withGsap(() => {}); };
      ['pointerenter', 'touchstart', 'focus'].forEach(t => more.addEventListener(t, warm, { once: true, passive: true }));
      more.addEventListener('click', () => players.forEach(p => { if (p.stage.closest('.more') && p.stage.getClientRects().length) p.prime(); }));
    }
    // the story's own page shows the same diagram, finished, where its cover drawing would be; sm-cover lets a phone's
    // cover keep room for it above the title
    const reader = document.getElementById('reader');
    if (reader) new MutationObserver(() => {
      const t = reader.querySelector('#r-title')?.textContent, svg = reader.querySelector('.cover > svg.art');
      const id = stories.find(k => titleOf(k) === t);
      if (id && svg) { svg.parentNode.classList.add('sm-cover'); svg.insertAdjacentHTML('afterend', art(id)); svg.remove(); }
    }).observe(reader, { childList: true });
  }

  // The homepage loads this file async, straight after js/app.js, and asks for the mount with data-mount="home".
  // Its <head> fetches css/story-motion.css as a print stylesheet, which doesn't hold up the first
  // paint. Once it's here, it's switched on and the diagrams swapped in within one task, so nothing paints half-styled.
  // If it never arrives, the page keeps its original drawings.
  if (document.currentScript?.dataset.mount === 'home') {
    const css = document.querySelector('link[href$="css/story-motion.css"]');
    // A failed request can leave a sheet object whose rules cannot be read. Keep the original art then.
    const ready = () => { try { return !!css?.sheet?.cssRules.length; } catch { return false; } };
    const go = () => { if (ready()) { css.media = 'all'; mountHome(); } };
    if (ready()) go(); else css?.addEventListener('load', go, { once: true });
  }

  return { designs, art, player, replayBtn, motionOn, mountHome, players, HOME };
})();
