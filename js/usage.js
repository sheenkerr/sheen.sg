// ---------- token usage: data/usage.json, made by tools/usage/export_usage.py ----------
// Every figure is an aggregate of Claude Code, Codex and Antigravity together. Labels come from the file, so they go in as text.
(function () {
  const $ = id => document.getElementById(id);
  const section = $('tokens');
  const NS = 'http://www.w3.org/2000/svg';
  const CATS = [['all', 'All tokens'], ['uncachedInput', 'Uncached input'], ['cacheRead', 'Cache reads'], ['cacheWrite', 'Cache writes'], ['output', 'Output']];
  const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 });
  const short = n => compact.format(n);
  const exact = n => n.toLocaleString('en');
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  // dates are already Singapore days, so they're written from the string; MONTHS is app.js's, which says Sep, not Sept
  const month = day => MONTHS[Number(day.slice(5, 7)) - 1];
  const dayName = day => `${Number(day.slice(8, 10))} ${month(day)} ${day.slice(0, 4)}`;
  // each tool's mark, as T3 Code shows it: Claude's in its orange, OpenAI's for Codex in the text colour of each mode
  const LOGOS = { claude: ['images/brands/claude.svg', ''], codex: ['images/brands/openai.svg', ' ink'], antigravity: ['images/brands/antigravity.png', ''] };
  const logo = id => LOGOS[id]
    ? el('img', { class: `tool-logo${LOGOS[id][1]}`, src: LOGOS[id][0], width: 14, height: 14, alt: '' })
    : el('i', { class: 'key', 'aria-hidden': 'true' });
  const el = (tag, attrs = {}, text) => {
    const e = tag in { svg: 1, g: 1, rect: 1, path: 1, line: 1, text: 1 } ? document.createElementNS(NS, tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    return e;
  };
  // a pill switch like the section tabs; a radio group, so the arrow keys move between options
  function seg(host, options, value, onPick) {
    host.replaceChildren(...options.map(([v, label]) => {
      const b = el('button', { type: 'button', role: 'radio', 'aria-checked': v === value, tabindex: v === value ? 0 : -1 }, label);
      b.addEventListener('click', () => pick(v));
      b.addEventListener('keydown', e => {
        const i = options.findIndex(o => o[0] === v), step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        pick(options[(i + step + options.length) % options.length][0]);
        host.querySelector('[aria-checked="true"]').focus();
      });
      return b;
    }));
    function pick(v) {
      [...host.children].forEach((b, i) => { const on = options[i][0] === v; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
      onPick(v);
    }
    return pick;
  }

  fetch('data/usage.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(show).catch(() => {
    section.querySelectorAll(':scope > :not(.usage-head)').forEach(e => e.remove());
    section.append(el('p', { class: 'usage-empty' }, 'The usage figures couldn’t be loaded just now.'));
    // the pill keeps its generic label from index.html and still links to the section
    $('burn').title = 'The token usage figures couldn’t be loaded just now.';
  });

  function show(data) {
    const cats = data.categories, tools = data.tools, t = data.totals;
    const since = dayName(data.firstDay);
    // updatedAt is written in Singapore time, e.g. 2026-11-02T14:15+08:00; only its day is shown
    const updated = data.updatedAt.slice(0, 10);
    $('usageUpdated').replaceChildren('Updated ', el('time', { datetime: updated }, dayName(updated)), '.');

    // ---------- the pill beside the greeting: every token of the last 30 days ----------
    // index.html shows it from the first paint with a label of about the same width, so the count replaces that label
    // without moving the line; the exact count and its days go in the title
    const last30 = data.daily.slice(-30);
    const recent = last30.reduce((sum, day) => sum + tools.reduce((a, tool) => a + day[tool.id].reduce((x, y) => x + y, 0), 0), 0);
    const burn = $('burn');
    $('burnText').replaceChildren(el('b', {}, short(recent)), ' tokens', el('span', { 'aria-hidden': 'true' }, ' · past 30d'), el('span', { class: 'sr' }, ' in the past 30 days'));
    if (last30.length) burn.title = `${exact(recent)} tokens from ${dayName(last30[0].day)} to ${dayName(last30[last30.length - 1].day)}. See them by day.`;


    // ---------- the daily chart ----------
    // T3's 7, 30 and 90 day windows, plus everything recorded; a window only shows when there's more history than it covers
    // `only` is the tool picked in the legend, or null for every tool
    let metric = 'all', range = 0, only = null;
    const valueOf = (day, tool) => metric === 'all' ? day[tool].reduce((a, b) => a + b, 0) : day[tool][cats.indexOf(metric)];
    const used = day => tools.some(tool => day[tool.id].some(Boolean));
    const inUse = list => tools.filter(tool => list.some(d => d[tool.id].some(Boolean)));
    const counted = list => inUse(list).filter(tool => !only || tool.id === only);
    // a period starts on its first day with any usage, so the chart never opens on an empty stretch; the start doesn't
    // move when the token type changes
    function days() {
      const list = range ? data.daily.slice(-range) : data.daily, first = list.findIndex(used);
      return first > 0 && list.length - first > 1 ? list.slice(first) : list;
    }
    const pickMetric = seg($('usageMetric'), CATS, metric, v => { metric = v; figures(); draw(); });
    $('usageRange').hidden = false;
    const pickRange = seg($('usageRange'), [...[7, 30, 90].filter(n => data.daily.length > n).map(n => [n, `${n} days`]), [0, 'All']], range, v => {
      range = v;
      // a picked tool that wasn't used in the new period would leave nothing to draw
      if (only && !inUse(days()).some(tool => tool.id === only)) only = null;
      figures(); draw();
    });

    // ---------- the figures above the chart: the period's total, then each kind of token and its share ----------
    // They add up the same days and tools as the chart. The token type picked for the chart is the big figure; pressing
    // a figure picks its type for the chart too.
    const share = (n, of) => { const s = of ? n / of * 100 : 0; return `${s < 1 && s > 0 ? s.toFixed(1) : Math.round(s)}%`; };
    function figures() {
      const list = range ? data.daily.slice(-range) : data.daily, which = counted(list);
      const sums = cats.map((_, i) => list.reduce((sum, day) => sum + which.reduce((a, tool) => a + day[tool.id][i], 0), 0));
      const total = sums.reduce((a, b) => a + b, 0);
      const period = `${only ? `${which[0].name}, ` : ''}${range ? `last ${range} days` : `since ${since}`}`;
      const chosen = metric === 'all' ? total : sums[cats.indexOf(metric)];
      const name = CATS.find(c => c[0] === metric)[1];
      const tile = (cls, value, label, note, type) => {
        const b = el('button', { class: cls, type: 'button', 'aria-pressed': type === metric, title: `${exact(value)} tokens` });
        b.append(el('span', { class: 'usage-label' }, label), el('b', {}, short(value)), el('span', { class: 'usage-note' }, note));
        b.addEventListener('click', () => pickMetric(type));
        return b;
      };
      $('usageFigures').replaceChildren(
        tile('usage-total', chosen, `${metric === 'all' ? 'Total' : name}, ${period}`, metric === 'all' ? 'tokens' : `tokens, ${share(chosen, total)} of all`, 'all'),
        ...cats.map((c, i) => tile('usage-tile', sums[i], CATS.find(x => x[0] === c)[1], `${share(sums[i], total)} of all`, c)));
    }
    figures();

    // The chart is T3 Code's usage chart (github.com/pingdotgg/t3code, apps/web/src/components/usage/UsageProviderChart.tsx),
    // ported from React: each tool is its own smoothed line from zero with a faint fill, a crosshair follows the pointer,
    // and the y labels sit beside the plot in HTML so they stay sharp while the plot stretches to fit.
    //
    // MIT License. Copyright (c) 2026 T3 Tools Inc.
    // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
    // documentation files (the "Software"), to deal in the Software without restriction, including without limitation
    // the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
    // permit persons to whom the Software is furnished to do so, subject to the following conditions:
    // The above copyright notice and this permission notice shall be included in all copies or substantial portions of
    // the Software.
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
    // THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    // TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.
    const VIEW_WIDTH = 960, VIEW_HEIGHT = 260, PLOT_TOP = 8, TICK_COUNT = 4;
    const plot = $('usagePlot'), tip = $('usageTip');
    let columns = [], periods = [], stepX = 0, crosshair = null, active = -1;
    const dailyDetails = section.querySelector('.usage-days');
    dailyDetails.addEventListener('toggle', () => { if (dailyDetails.open) table(); });

    function monotoneTangents(points) {
      const count = points.length;
      if (count < 2) return [0];
      const slopes = [];
      for (let i = 0; i < count - 1; i++) {
        const dx = points[i + 1].x - points[i].x, dy = points[i + 1].y - points[i].y;
        slopes.push(dx === 0 ? 0 : dy / dx);
      }
      const tangents = Array(count).fill(0);
      tangents[0] = slopes[0];
      tangents[count - 1] = slopes[count - 2];
      for (let i = 1; i < count - 1; i++) {
        tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
      }
      for (let i = 0; i < count - 1; i++) {
        const slope = slopes[i];
        if (slope === 0) { tangents[i] = 0; tangents[i + 1] = 0; continue; }
        const a = tangents[i] / slope, b = tangents[i + 1] / slope, magnitude = a * a + b * b;
        if (magnitude > 9) {
          const scale = 3 / Math.sqrt(magnitude);
          tangents[i] = scale * a * slope;
          tangents[i + 1] = scale * b * slope;
        }
      }
      return tangents;
    }
    function curvePath(points) {
      if (points.length < 2) return '';
      const tangents = monotoneTangents(points), f = n => n.toFixed(2);
      let path = `M${f(points[0].x)},${f(points[0].y)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const from = points[i], to = points[i + 1], dx = to.x - from.x;
        path += ` C${f(from.x + dx / 3)},${f(from.y + tangents[i] * dx / 3)} ${f(to.x - dx / 3)},${f(to.y - tangents[i + 1] * dx / 3)} ${f(to.x)},${f(to.y)}`;
      }
      return path;
    }
    function niceScale(peak, count) {
      if (peak <= 0) return { max: 0, ticks: [0] };
      const rawStep = peak / count, magnitude = 10 ** Math.floor(Math.log10(rawStep)), normalized = rawStep / magnitude;
      const step = (normalized > 5 ? 10 : normalized > 2 ? 5 : normalized > 1 ? 2 : 1) * magnitude;
      const max = Math.ceil(peak / step) * step, ticks = [];
      for (let value = 0; value <= max + step * 1e-6; value += step) ticks.push(value);
      return { max, ticks };
    }
    // T3's formatTokens and formatDayShort
    const trim = v => v.toFixed(Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2).replace(/\.0+$/, '');
    const formatTokens = v => v >= 1e12 ? `${trim(v / 1e12)}T` : v >= 1e9 ? `${trim(v / 1e9)}B` : v >= 1e6 ? `${trim(v / 1e6)}M` : v >= 1e3 ? `${trim(v / 1e3)}K` : exact(Math.round(v));
    const formatDayShort = day => `${month(day)} ${Number(day.slice(8, 10))}`;

    function draw() {
      const list = days();
      // as in T3, only the tools used in the period are drawn, listed and counted. Each one in the legend is a button
      // that shows only that tool; pressing it again shows them all.
      const shown = counted(list);
      $('usageLegend').replaceChildren(...inUse(list).map((x, i) => {
        const li = el('li'), b = el('button', { type: 'button', 'aria-pressed': x.id === only, title: x.id === only ? 'Show every tool' : `Show only ${x.name}` });
        b.append(logo(x.id), x.name);
        // the legend is rebuilt in the same order, so focus goes back to the same place
        b.addEventListener('click', () => { only = only === x.id ? null : x.id; figures(); draw(); $('usageLegend').children[i].firstChild.focus(); });
        li.append(b);
        return li;
      }));
      $('usageDaysCount').textContent = plural(list.filter(d => shown.some(tool => d[tool.id].some(Boolean))).length, 'day');
      periods = list.map(d => d.day);
      columns = list.map(d => {
        const bands = shown.map(tool => ({ tool, value: valueOf(d, tool.id) }));
        return { bands, total: bands.reduce((sum, band) => sum + band.value, 0) };
      });
      // Layered series each start at zero; summing peaks would waste plot height.
      const peak = columns.reduce((max, c) => c.bands.reduce((inner, band) => Math.max(inner, band.value), max), 0);
      const scale = niceScale(peak, TICK_COUNT);
      const toY = value => scale.max === 0 ? VIEW_HEIGHT : VIEW_HEIGHT - value / scale.max * (VIEW_HEIGHT - PLOT_TOP);
      stepX = periods.length < 2 ? 0 : VIEW_WIDTH / (periods.length - 1);

      $('usageY').replaceChildren(...scale.ticks.map(tick => {
        const label = el('span', {}, tick === 0 ? '0' : formatTokens(tick));
        label.style.top = `${toY(tick) / VIEW_HEIGHT * 100}%`;
        return label;
      }));
      const middle = periods[Math.floor(periods.length / 2)];
      $('usageX').replaceChildren(...[periods[0], middle, periods.at(-1)].map(p => el('span', {}, p ? formatDayShort(p) : '')));

      const metricName = CATS.find(c => c[0] === metric)[1].toLowerCase();
      const svg = el('svg', { viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`, preserveAspectRatio: 'none', role: 'img',
        'aria-label': `Daily ${metricName} ${only ? `for ${shown[0].name}` : 'by tool'}, ${dayName(periods[0])} to ${dayName(periods.at(-1))}. Use the arrow keys to read each day; the figures are also in the Daily figures table.` });
      scale.ticks.forEach(tick => svg.append(el('line', { class: 'grid', x1: 0, x2: VIEW_WIDTH, y1: toY(tick), y2: toY(tick), 'vector-effect': 'non-scaling-stroke' })));
      const paths = shown.map((tool, slot) => {
        const line = curvePath(columns.map((c, i) => ({ x: i * stepX, y: toY(c.bands[slot].value) })));
        return { tool, line, total: columns.reduce((sum, c) => sum + c.bands[slot].value, 0),
          area: line && `${line} L${VIEW_WIDTH},${VIEW_HEIGHT} L0,${VIEW_HEIGHT} Z` };
      }).sort((a, b) => b.total - a.total);
      paths.forEach(p => svg.append(el('path', { class: `area ${p.tool.id}`, d: p.area })));
      paths.forEach(p => svg.append(el('path', { class: `curve ${p.tool.id}`, d: p.line, 'vector-effect': 'non-scaling-stroke' })));
      crosshair = el('line', { class: 'crosshair', y1: PLOT_TOP, y2: VIEW_HEIGHT, 'vector-effect': 'non-scaling-stroke', visibility: 'hidden' });
      svg.append(crosshair);
      plot.replaceChildren(svg, tip);
      select(-1);
      // The exact figures can grow for years; build their rows only while the table is open.
      if (dailyDetails.open) table();
      else $('usageDays').replaceChildren();
    }
    function select(i, at) {
      const changed = active !== i;
      active = i;
      if (i < 0) { tip.hidden = true; crosshair.setAttribute('visibility', 'hidden'); return; }
      crosshair.setAttribute('x1', i * stepX);
      crosshair.setAttribute('x2', i * stepX);
      crosshair.setAttribute('visibility', 'visible');
      const column = columns[i];
      const row = (label, value, key) => {
        const r = el('div', { class: 'tip-row' }), name = el('span');
        if (key) name.append(logo(key));
        name.append(label);
        r.append(name, el('b', {}, formatTokens(value)));
        return r;
      };
      const total = row('Total', column.total);
      total.classList.add('tip-total');
      if (changed) tip.replaceChildren(el('div', { class: 'tip-day' }, formatDayShort(periods[i])),
        ...column.bands.map(band => row(band.tool.name, band.value, band.tool.id)), total);
      tip.hidden = false;
      // beside the pointer, flipped to stay inside the plot; from the keyboard, beside the crosshair at the top
      const gap = 12, w = tip.offsetWidth, h = tip.offsetHeight, pw = plot.clientWidth, ph = plot.clientHeight;
      const { x, y } = at || { x: periods.length < 2 ? 0 : i / (periods.length - 1) * pw, y: 0 };
      const left = x + gap + w <= pw ? x + gap : x - gap - w, top = y + gap + h <= ph ? y + gap : y - gap - h;
      tip.style.left = `${Math.min(Math.max(0, left), Math.max(0, pw - w))}px`;
      tip.style.top = `${Math.min(Math.max(0, top), Math.max(0, ph - h))}px`;
    }
    function selectAtPointer(e) {
      const bounds = plot.getBoundingClientRect();
      if (!periods.length || !bounds.width) return;
      const x = Math.min(bounds.width, Math.max(0, e.clientX - bounds.left)), y = Math.min(bounds.height, Math.max(0, e.clientY - bounds.top));
      select(Math.min(periods.length - 1, Math.max(0, Math.round(x / bounds.width * (periods.length - 1)))), { x, y });
    }
    plot.addEventListener('pointermove', selectAtPointer);
    plot.addEventListener('click', selectAtPointer);
    plot.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') select(-1); });
    plot.addEventListener('keydown', e => {
      const n = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[e.key];
      if (e.key === 'Escape') return select(-1);
      if (n === undefined) return;
      e.preventDefault();
      select(e.key === 'Home' ? 0 : Math.max(0, Math.min(periods.length - 1, active < 0 ? periods.length - 1 : active + n)));
    });
    plot.addEventListener('blur', () => select(-1));
    function table() {
      const shown = counted(days());
      const list = days().filter(d => shown.some(tool => d[tool.id].some(Boolean))).reverse();
      const tbl = el('table'), head = el('tr');
      ['Day', ...shown.map(x => x.name), 'Total'].forEach(h => head.append(el('th', { scope: 'col' }, h)));
      tbl.append(el('caption', { class: 'sr' }, `${CATS.find(c => c[0] === metric)[1]} on each day with usage`), el('thead'), el('tbody'));
      tbl.tHead.append(head);
      list.forEach(d => {
        const tr = el('tr'), vals = shown.map(x => valueOf(d, x.id));
        tr.append(el('th', { scope: 'row' }, dayName(d.day)), ...[...vals, vals.reduce((a, b) => a + b, 0)].map(v => el('td', {}, exact(v))));
        tbl.tBodies[0].append(tr);
      });
      $('usageDays').replaceChildren(list.length ? tbl : el('p', { class: 'usage-note' }, 'No usage in this period.'));
    }
    draw();

    // The pill links to the section like the Tokens tab, and sets the chart to its same days, all tools and all tokens,
    // so the total there matches the pill.
    burn.addEventListener('click', () => {
      only = null;
      pickMetric('all');
      pickRange(data.daily.length > 30 ? 30 : 0);
    });

    // ---------- by model, all time ----------
    const tbl = el('table', { class: 'usage-models' }), head = el('tr');
    ['Model', 'Tool', ...cats.map(c => CATS.find(x => x[0] === c)[1]), 'Total'].forEach(h => head.append(el('th', { scope: 'col' }, h)));
    tbl.append(el('caption', { class: 'sr' }, `Tokens by model since ${since}`), el('thead'), el('tbody'), el('tfoot'));
    tbl.tHead.append(head);
    const cell = n => el('td', { title: `${exact(n)} tokens` }, short(n));
    data.models.forEach(m => {
      const tr = el('tr'), tool = el('td'), toolInfo = tools.find(x => x.name === m.tool);
      tool.append(logo(toolInfo ? toolInfo.id : ''), m.tool);
      tr.append(el('th', { scope: 'row' }, m.model), tool, ...[...cats, 'total'].map(c => cell(m[c])));
      tbl.tBodies[0].append(tr);
    });
    const foot = el('tr');
    foot.append(el('th', { scope: 'row' }, 'All models'), el('td'), ...[...cats, 'total'].map(c => cell(t[c])));
    tbl.tFoot.append(foot);
    $('usageModels').replaceChildren(tbl);
    $('usageModelsCount').textContent = plural(data.models.length, 'model');
  }
})();
