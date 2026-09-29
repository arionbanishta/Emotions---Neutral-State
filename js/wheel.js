/* Emotion Wheel — builds the wheel model and draws it as SVG. */
(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const VIEW = 680;                    // viewBox size
  const RADII = [0, 120, 212, 334];    // core | middle ring | outer ring

  /* ---------- colour helpers ---------- */
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function mix(a, b, t) {
    const x = rgb(a), y = rgb(b);
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------- model ---------- */
  function buildModel(tree) {
    const list = [], byId = {}, leaves = [];

    function make(name, desc, depth, parent, color) {
      const n = { id: (parent ? parent.id + '/' : '') + slug(name), name, desc: desc || '', depth, parent, children: [] };
      n.family = parent ? parent.family : n;
      n.base = color || n.family.base;
      n.fill = depth === 0 ? mix(n.base, '#000000', 0.06) : depth === 1 ? mix(n.base, '#ffffff', 0.18) : n.base;
      n.pale = mix(n.base, '#ffffff', 0.72);
      n.ink = mix(n.base, '#1d2127', 0.55);
      if (parent) parent.children.push(n);
      list.push(n);
      byId[n.id] = n;
      return n;
    }

    tree.forEach(c => {
      const core = make(c.name, c.desc, 0, null, c.color);
      (c.children || []).forEach(m => {
        const mid = make(m[0], m[1], 1, core);
        (m[2] || []).forEach(l => leaves.push(make(l[0], l[1], 2, mid)));
      });
    });

    const step = 360 / leaves.length;
    leaves.forEach((l, i) => { l.a0 = i * step; l.a1 = (i + 1) * step; });
    [1, 0].forEach(d => list.filter(n => n.depth === d).forEach(n => {
      n.a0 = n.children[0].a0;
      n.a1 = n.children[n.children.length - 1].a1;
    }));

    return { list, byId };
  }

  /* ---------- geometry ---------- */
  const r2 = v => Math.round(v * 100) / 100;
  function pt(r, deg) {                           // 0° = 12 o'clock, clockwise
    const a = deg * Math.PI / 180;
    return [r2(r * Math.sin(a)), r2(-r * Math.cos(a))];
  }
  function arc(r0, r1, a0, a1) {
    const large = a1 - a0 > 180 ? 1 : 0;
    const [x1, y1] = pt(r1, a0), [x2, y2] = pt(r1, a1);
    if (r0 === 0) return `M0 0L${x1} ${y1}A${r1} ${r1} 0 ${large} 1 ${x2} ${y2}Z`;
    const [x3, y3] = pt(r0, a1), [x4, y4] = pt(r0, a0);
    return `M${x4} ${y4}L${x1} ${y1}A${r1} ${r1} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${r0} ${r0} 0 ${large} 0 ${x4} ${y4}Z`;
  }
  const mid = n => (n.a0 + n.a1) / 2;
  const labelRadius = n => n.depth === 0 ? 70 : (RADII[n.depth] + RADII[n.depth + 1]) / 2;

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  /* ---------- render ---------- */
  function render(svg, model, onSelect) {
    svg.setAttribute('viewBox', `${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`);
    const base = el('g', {}), top = el('g', {});
    const parts = {};

    model.list.forEach(n => {
      const path = n.parent ? `${n.parent.name}, ${n.name}` : n.name;
      const g = el('g', { class: `seg d${n.depth}`, tabindex: '0', role: 'button', 'aria-label': path, 'data-id': n.id });
      const p = el('path', { d: arc(RADII[n.depth], RADII[n.depth + 1], n.a0, n.a1), fill: n.fill });
      const m = mid(n), [x, y] = pt(labelRadius(n), m);
      const t = el('text', {
        class: 'lbl',
        transform: `translate(${x} ${y}) rotate(${r2(m < 180 ? m - 90 : m + 90)})`,
        'text-anchor': 'middle',
        'dominant-baseline': 'central'
      });
      t.textContent = n.name;
      g.append(p, t);
      g.addEventListener('click', () => onSelect(n.id));
      g.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(n.id); }
      });
      base.append(g);
      parts[n.id] = { g, p, t };
    });
    svg.append(base, top);

    let current = null;
    function select(id) {
      const n = model.byId[id];
      if (!n) return;
      if (current) {
        const c = parts[current.id];
        c.p.setAttribute('fill', current.fill);
        c.t.style.fill = '';
        c.g.style.transform = '';
        c.g.classList.remove('is-selected');
        c.g.removeAttribute('aria-pressed');
        base.append(c.g);
      }
      const s = parts[id];
      const hadFocus = document.activeElement === s.g;
      top.append(s.g);                              // draw on top of its neighbours
      if (hadFocus) s.g.focus({ preventScroll: true });
      s.p.setAttribute('fill', n.pale);
      s.t.style.fill = n.ink;
      s.g.classList.add('is-selected');
      s.g.setAttribute('aria-pressed', 'true');
      s.g.getBoundingClientRect();                  // let the lift animate after re-insert
      const [dx, dy] = pt(n.depth === 0 ? 8 : 6, mid(n));
      s.g.style.transform = `translate(${dx}px, ${dy}px)`;
      current = n;
    }

    return { select };
  }

  window.Wheel = { buildModel, render, mix };
})();
