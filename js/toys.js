// Two working miniatures of the Nested case studies, shared by the "live" iterations.
// This file builds the markup and runs it; each page styles the toy-* classes its own way.
window.TOYS = (() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, still ? 0 : ms));
  const hms = s => [s / 3600 | 0, (s / 60 | 0) % 60, s % 60].map(n => String(n).padStart(2, '0')).join(':');
  // keeps the last few lines; a page can ask for more with data-lines on the toy's root
  function logger(ol) {
    const keep = +ol.closest('[data-toy]')?.dataset.lines || 4;
    return line => {
      const li = document.createElement('li'); li.textContent = line; ol.append(li);
      while (ol.children.length > keep) ol.firstElementChild.remove();
    };
  }

  // The sign-up guard: more than three sign-ups from one IP in 24 hours pauses that IP for a day.
  function guard(root) {
    // a made-up visitor, so nobody reads the log as their own address
    const ip = 'demo-visitor', LIMIT = 3, DAY = 86400;
    root.innerHTML = `
      <div class="toy-meter" aria-hidden="true">${'<i></i>'.repeat(LIMIT)}<b class="toy-ttl" hidden></b></div>
      <p class="toy-state" aria-live="polite">No sign-ups yet today.</p>
      <ol class="toy-log" aria-hidden="true"><li>redis-cli, key signup:${ip}</li></ol>
      <div class="toy-actions"><button type="button" class="toy-go">Sign up</button><button type="button" class="toy-reset" hidden>Skip a day</button></div>`;
    const $ = s => root.querySelector(s), log = logger($('.toy-log')), slots = root.querySelectorAll('.toy-meter i');
    let n = 0, blockedAt = 0, timer = 0;
    function ttl() { $('.toy-ttl').textContent = hms(Math.max(DAY - Math.round((Date.now() - blockedAt) / 1000), 0)); }
    $('.toy-go').addEventListener('click', () => {
      if (blockedAt) {
        log(`EXISTS block:${ip} → 1`); log(`429, try again in ${$('.toy-ttl').textContent}`);
        $('.toy-state').textContent = `Still paused for this visitor.`;
        root.classList.remove('toy-bump'); void root.offsetWidth; root.classList.add('toy-bump');
        return;
      }
      n++;
      log(`INCR signup:${ip} → ${n}`);
      if (n <= LIMIT) {
        slots[n - 1].classList.add('on');
        log(`201 Created, account #${1040 + n}`);
        $('.toy-state').textContent = `${n} of ${LIMIT} sign-ups used today.`;
        if (n === LIMIT) $('.toy-go').textContent = 'Sign up again';
        return;
      }
      log(`SET block:${ip} EX ${DAY}`); log('429 Too Many Requests');
      blockedAt = Date.now(); ttl(); timer = setInterval(ttl, 1000);
      root.classList.add('toy-blocked'); $('.toy-ttl').hidden = false; $('.toy-reset').hidden = false;
      $('.toy-go').textContent = 'Try again';
      $('.toy-state').textContent = `Sign-up ${n}: paused for a day.`;
    });
    $('.toy-reset').addEventListener('click', () => {
      clearInterval(timer); n = 0; blockedAt = 0;
      slots.forEach(s => s.classList.remove('on'));
      root.classList.remove('toy-blocked'); $('.toy-ttl').hidden = true; $('.toy-reset').hidden = true;
      $('.toy-go').textContent = 'Sign up'; $('.toy-go').focus();
      log('24 hours later, both keys expired');
      $('.toy-state').textContent = `A day later, sign-ups are open.`;
    });
  }

  // Ship it: a push to master registers a new task definition and rolls through stage to prod.
  function ship(root) {
    const stages = ['local', 'master', 'stage', 'prod'];
    root.innerHTML = `
      <ol class="toy-stages" aria-hidden="true">${stages.map(s => `<li><i></i><span>${s}</span></li>`).join('')}</ol>
      <p class="toy-state" aria-live="polite">Nothing shipped yet this visit.</p>
      <ol class="toy-log" aria-hidden="true"><li>github actions, julia</li></ol>
      <div class="toy-actions"><button type="button" class="toy-go">Push to master</button></div>`;
    const $ = s => root.querySelector(s), log = logger($('.toy-log')), steps = root.querySelectorAll('.toy-stages li');
    let rev = 47, shipped = 0, busy = false;
    $('.toy-go').addEventListener('click', async () => {
      if (busy) return;
      busy = true; $('.toy-go').setAttribute('aria-disabled', 'true');
      const sha = Math.random().toString(16).slice(2, 9);
      steps.forEach(s => s.className = '');
      $('.toy-state').textContent = `Shipping ${sha}…`;
      const lines = [`git push origin master  ${sha}`, `docker build julia:${sha}`, `register task definition julia:${++rev}`, `prod healthy, ${sha} live`];
      for (let i = 0; i < stages.length; i++) {
        steps[i].className = 'run'; log(lines[i]);
        await wait(i ? 420 : 160);
        steps[i].className = 'on';
      }
      shipped++;
      $('.toy-state').textContent = `${sha} is live. ${shipped} ${shipped === 1 ? 'deploy' : 'deploys'} this visit, none by hand.`;
      $('.toy-go').textContent = 'Push again';
      busy = false; $('.toy-go').removeAttribute('aria-disabled');
    });
  }

  return { guard, ship };
})();
