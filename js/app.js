/* Emotion Wheel — page wiring: selection, side panel, search, version (F/M), audio. */
(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const CONTENT = window.CONTENT || {};
  const model = Wheel.buildModel(window.EMOTIONS);

  const store = {
    get(k) { try { return localStorage.getItem('emotion-wheel.' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('emotion-wheel.' + k, v); } catch (e) { /* private mode */ } }
  };

  const state = {
    id: null,
    gender: store.get('gender') === 'f' ? 'f' : 'm',
    audio: 'silence'
  };

  /* ---------- wheel ---------- */
  // Clicking the selected emotion again returns to the neutral state.
  const view = Wheel.render($('#wheel'), model, id => (state.id === id ? clear() : select(id)));

  function select(id) {
    if (!model.byId[id] || state.id === id) return;
    state.id = id;
    view.select(id);
    renderPanel();
    syncAudio();
    setHash(id);
  }

  // Neutral state: nothing selected, no sound, empty side panel.
  function clear() {
    if (!state.id) return;
    state.id = null;
    view.clear();
    setAudio('silence');
    renderPanel();
    setHash('');
  }

  function setHash(id) {
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); }
    catch (e) { /* file:// in some browsers */ }
  }

  /* ---------- content lookup ---------- */
  // Walks up from the emotion to its parents until a value is found.
  function resolve(node, field) {
    for (let n = node; n; n = n.parent) {
      const c = CONTENT[n.id];
      if (!c) continue;
      const variant = c[state.gender] || {};
      const value = variant[field] != null ? variant[field] : c[field];
      if (value != null && value !== '') return { value, from: n };
    }
    return { value: null, from: null };
  }

  /* ---------- side panel ---------- */
  const FACES = {
    happy: '<path d="M8 10.6q1.2-1.5 2.4 0M13.6 10.6q1.2-1.5 2.4 0"/><path d="M8.2 14q3.8 3.6 7.6 0"/>',
    sad: '<path stroke-width="2.2" d="M9.2 10.4h.01M14.8 10.4h.01"/><path d="M8.8 16.6q3.2-2.8 6.4 0"/>',
    angry: '<path d="M7.6 8.4l2.8 1.2M16.4 8.4l-2.8 1.2"/><path stroke-width="2.2" d="M9.4 11.4h.01M14.6 11.4h.01"/><path d="M9 16q3-1.6 6 0"/>',
    fearful: '<path d="M7.8 8.4q1.4-1 2.8-.2M16.2 8.4q-1.4-1-2.8-.2"/><circle cx="9.2" cy="11" r="1.1"/><circle cx="14.8" cy="11" r="1.1"/><ellipse cx="12" cy="16" rx="1.5" ry="1.8"/>',
    disgusted: '<path d="M7.9 10.6h2.6M13.5 10.6h2.6"/><path d="M8.4 15.6q.9-1 1.8 0t1.8 0t1.8 0t1.8 0"/>',
    surprised: '<path d="M8 7.8q1.3-.8 2.6 0M13.4 7.8q1.3-.8 2.6 0"/><circle cx="9.3" cy="10.8" r="1.1"/><circle cx="14.7" cy="10.8" r="1.1"/><circle cx="12" cy="15.8" r="2"/>',
    bad: '<path stroke-width="2.2" d="M9.2 10.4h.01M14.8 10.4h.01"/><path d="M9 15.6h6"/>'
  };

  function face(n) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11.5" fill="${n.fill}"/>` +
      `<g fill="none" stroke="${Wheel.mix(n.base, '#1d2127', 0.7)}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">` +
      (FACES[n.family.id] || FACES.bad) + '</g></svg>';
  }

  function fromTag(tag, res, n) {
    const show = res.from && res.from !== n;
    tag.hidden = !show;
    if (show) tag.textContent = 'From ' + res.from.name;
  }

  function renderPanel() {
    const n = model.byId[state.id];
    const side = $('#side');
    side.hidden = !n;
    if (!n) { renderVideo(null); return; }        // also stops a playing video
    side.classList.remove('is-entering');
    void side.offsetWidth;                        // restart the fade-in
    side.classList.add('is-entering');
    side.style.setProperty('--accent', n.fill);
    side.style.setProperty('--accent-soft', Wheel.mix(n.base, '#ffffff', 0.9));
    side.style.setProperty('--accent-ink', n.ink);

    $('#face').innerHTML = face(n);
    $('#emotion-name').textContent = n.name;
    $('#emotion-desc').textContent = n.desc;

    // Breadcrumb: Happy › Content › Joyful
    const crumbs = $('#crumbs');
    crumbs.innerHTML = '';
    const chain = [];
    for (let p = n.parent; p; p = p.parent) chain.unshift(p);
    crumbs.hidden = !chain.length;
    chain.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = p.name;
      b.addEventListener('click', () => select(p.id));
      const sep = document.createElement('span');
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '›';
      crumbs.append(b, sep);
    });
    const here = document.createElement('span');
    here.className = 'here';
    here.textContent = n.name;
    crumbs.append(here);

    // Insight
    const ins = resolve(n, 'insight');
    fromTag($('#insight-from'), ins, n);
    $('#insight-quote').hidden = !ins.value;
    $('#insight-empty').hidden = !!ins.value;
    if (ins.value) {
      $('#quote-text').textContent = ins.value.quote;
      $('#quote-author').textContent = ins.value.author ? '— ' + ins.value.author : '';
    } else {
      $('#insight-empty').textContent = `An insight for ${n.name} is coming soon.`;
    }

    // Formula
    const formula = resolve(n, 'formula');
    const fBox = $('#formula');
    fBox.textContent = formula.value || 'Coming soon';
    fBox.classList.toggle('is-empty', !formula.value);

    // Regulate / learn more
    const reg = resolve(n, 'regulate');
    $('#regulate-text').textContent = reg.value || `A short guide on moving from ${n.name.toLowerCase()} back to 0.`;
    const video = resolve(n, 'video');
    fromTag($('#video-from'), video, n);
    renderVideo(video.value);
  }

  /* ---------- video ---------- */
  let shownVideo;
  function renderVideo(value) {
    const src = value && (typeof value === 'string' ? value : value.src);
    if (src === shownVideo) return;
    shownVideo = src;
    const box = $('#video');
    box.innerHTML = '';
    Soundscape.duck(false);
    if (!src) { box.append(videoPlaceholder('Video coming soon', 'The author is recording a short guide for this state.')); return; }

    const v = document.createElement('video');
    v.src = src;
    v.controls = true;
    v.playsInline = true;
    v.preload = 'metadata';
    if (value.poster) v.poster = value.poster;
    v.addEventListener('error', () => {
      box.innerHTML = '';
      box.append(videoPlaceholder('Video not found', src));
    });
    v.addEventListener('play', () => Soundscape.duck(true));
    v.addEventListener('pause', () => Soundscape.duck(false));
    v.addEventListener('ended', () => Soundscape.duck(false));
    box.append(v);
  }

  function videoPlaceholder(title, note) {
    const d = document.createElement('div');
    d.className = 'video-empty';
    d.innerHTML = '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 7.5v9l7.5-4.5z"/></svg></span><strong></strong><small></small>';
    d.querySelector('strong').textContent = title;
    d.querySelector('small').textContent = note;
    return d;
  }

  /* ---------- audio ---------- */
  function syncAudio() {
    let opts = {};
    if (state.audio === 'nature' && state.id) {
      const a = resolve(model.byId[state.id], 'audio').value || {};
      opts = { src: a.src || null, music: !!a.music };
    }
    Soundscape.play(state.audio, opts);
  }

  function setAudio(mode) {
    state.audio = mode;
    document.querySelectorAll('.audio-opt').forEach(b => b.setAttribute('aria-checked', String(b.dataset.audio === mode)));
    syncAudio();
  }

  document.querySelectorAll('.audio-opt').forEach(btn => {
    btn.addEventListener('click', () => setAudio(btn.dataset.audio));
  });

  /* ---------- F / M version ---------- */
  function renderGender() {
    document.querySelectorAll('[data-gender]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.gender === state.gender)));
  }
  document.querySelectorAll('[data-gender]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.gender === btn.dataset.gender) return;
      state.gender = btn.dataset.gender;
      store.set('gender', state.gender);
      renderGender();
      renderPanel();
      syncAudio();
    });
  });

  /* ---------- search ---------- */
  const input = $('#search'), results = $('#search-results');
  let hits = [], active = -1;

  function pathOf(n) {
    const names = [];
    for (let p = n.parent; p; p = p.parent) names.unshift(p.name);
    return names.join(' › ');
  }

  function drawResults() {
    results.innerHTML = '';
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (!hits.length) {
      const li = document.createElement('li');
      li.className = 'none';
      li.textContent = 'No matching emotion';
      results.append(li);
      input.removeAttribute('aria-activedescendant');
      return;
    }
    hits.forEach((n, i) => {
      const li = document.createElement('li');
      li.id = 'hit-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      li.innerHTML = '<span class="dot"></span><span class="name"></span><span class="path"></span>';
      li.querySelector('.dot').style.background = n.fill;
      li.querySelector('.name').textContent = n.name;
      li.querySelector('.path').textContent = pathOf(n);
      li.addEventListener('mousedown', e => { e.preventDefault(); pick(n); });
      li.addEventListener('mousemove', () => { if (active !== i) { active = i; drawResults(); } });
      results.append(li);
    });
    input.setAttribute('aria-activedescendant', 'hit-' + active);
  }

  function closeResults() {
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    hits = [];
    active = -1;
  }

  function pick(n) {
    select(n.id);
    input.value = '';
    closeResults();
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { closeResults(); return; }
    hits = model.list
      .filter(n => n.name.toLowerCase().includes(q))
      .sort((a, b) => (b.name.toLowerCase().startsWith(q) - a.name.toLowerCase().startsWith(q)) || a.depth - b.depth)
      .slice(0, 8);
    active = hits.length ? 0 : -1;
    drawResults();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; closeResults(); return; }
    if (!hits.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % hits.length; drawResults(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + hits.length) % hits.length; drawResults(); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(hits[active]); }
  });
  input.addEventListener('blur', closeResults);

  /* ---------- analyze (coming later) ---------- */
  const toast = $('#toast');
  let toastTimer;
  $('#analyze').addEventListener('click', () => {
    toast.textContent = 'Situation analysis is coming soon.';
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  });

  /* ---------- start ---------- */
  // Opens in the neutral state unless the link points at an emotion.
  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (model.byId[id]) select(id); else clear();
  }
  renderGender();
  renderPanel();
  fromHash();
  window.addEventListener('hashchange', fromHash);

  // Escape anywhere (outside the search box) returns to neutral.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && e.target !== input) clear();
  });
})();
