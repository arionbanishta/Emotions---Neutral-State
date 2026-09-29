/* Emotion Wheel — background audio.
   Everything is generated live with the Web Audio API, so there are no
   licensing questions. If an emotion's content has audio.src, that file is
   played for "Nature sound" instead. */
(() => {
  'use strict';

  let ctx = null, master = null, current = null, currentKey = '', ducked = false;
  const buffers = {};
  const LEVEL = 0.9, DUCKED = 0.2;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = ducked ? DUCKED : LEVEL;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  /* ---------- building blocks ---------- */

  // 8 s of stereo noise whose head is cross-faded with its tail, so it loops without a click.
  function noiseBuffer(kind) {
    if (buffers[kind]) return buffers[kind];
    const sr = ctx.sampleRate, len = sr * 8, fade = Math.floor(sr * 0.5);
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === 'brown') {
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.5;
        } else {                                   // pink (Paul Kellet)
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
          b2 = 0.969 * b2 + w * 0.153852;    b3 = 0.8665 * b3 + w * 0.3104856;
          b4 = 0.55 * b4 + w * 0.5329522;    b5 = -0.7616 * b5 - w * 0.016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
          b6 = w * 0.115926;
        }
      }
      for (let i = 0; i < fade; i++) {
        const t = i / fade;
        d[i] = d[i] * t + d[len - fade + i] * (1 - t);
      }
    }
    buffers[kind] = { buf, loopEnd: (len - fade) / sr };
    return buffers[kind];
  }

  function noise(kind) {
    const { buf, loopEnd } = noiseBuffer(kind);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.loopEnd = loopEnd;
    return src;
  }

  function filter(type, freq, q) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    if (q) f.Q.value = q;
    return f;
  }

  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }

  function lfo(freq, depth, param) {
    const o = ctx.createOscillator(), g = gain(depth);
    o.frequency.value = freq;
    o.connect(g); g.connect(param); o.start();
    return o;
  }

  // A small echo "room" so chirps and bells don't sound dry.
  function room(dest, time, feedback, wet) {
    const input = gain(1), delay = ctx.createDelay(1), fb = gain(feedback), lp = filter('lowpass', 2400), w = gain(wet);
    delay.delayTime.value = time;
    input.connect(dest);
    input.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay);
    lp.connect(w); w.connect(dest);
    return input;
  }

  // Wraps a voice: fades in now, fades out and cleans up on stop().
  function voice(build) {
    const out = gain(0), t = ctx.currentTime, live = { alive: true, timers: [], sources: [] };
    out.connect(master);
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(1, t + 2.5);
    build(out, live);
    return {
      stop() {
        live.alive = false;
        live.timers.forEach(clearTimeout);
        const now = ctx.currentTime;
        out.gain.cancelScheduledValues(now);
        out.gain.setValueAtTime(out.gain.value, now);
        out.gain.linearRampToValueAtTime(0, now + 1);
        setTimeout(() => {
          live.sources.forEach(s => { try { s.stop(); } catch (e) { /* already stopped */ } });
          out.disconnect();
        }, 1200);
      }
    };
  }

  function every(live, fn, min, max) {
    const tick = () => {
      if (!live.alive) return;
      fn();
      live.timers.push(setTimeout(tick, min + Math.random() * (max - min)));
    };
    live.timers.push(setTimeout(tick, min));
  }

  /* ---------- sounds ---------- */

  function brown(out, live) {
    const src = noise('brown'), lp = filter('lowpass', 700), g = gain(0.9);
    src.connect(lp); lp.connect(g); g.connect(out);
    src.start();
    live.sources.push(src);
  }

  function chirp(dest) {
    let t = ctx.currentTime + 0.05;
    const base = 2400 + Math.random() * 2200, count = 2 + Math.floor(Math.random() * 4);
    const bus = gain(0.5 + Math.random() * 0.5);
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.6 - 0.8;
      bus.connect(pan); pan.connect(dest);
    } else {
      bus.connect(dest);
    }
    for (let i = 0; i < count; i++) {
      const dur = 0.05 + Math.random() * 0.07, f = base * (0.9 + Math.random() * 0.25);
      const o = ctx.createOscillator(), g = gain(0);
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * (1.15 + Math.random() * 0.3), t + dur * 0.4);
      o.frequency.exponentialRampToValueAtTime(f * 0.8, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(bus);
      o.start(t); o.stop(t + dur + 0.02);
      t += dur + 0.03 + Math.random() * 0.08;
    }
  }

  // Soft, slow major-key pad with pentatonic bells (I – V – vi – IV).
  const CHORDS = [[261.63, 329.63, 392.0], [196.0, 246.94, 293.66], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63]];
  const BELLS = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

  function melody(out, live) {
    const padBus = filter('lowpass', 1100);
    padBus.connect(out);
    const bells = room(out, 0.33, 0.35, 0.4);
    let step = 0;

    every(live, () => {
      const chord = CHORDS[step++ % CHORDS.length], t = ctx.currentTime + 0.05, len = 9;
      chord.forEach(f => [-5, 5].forEach(cents => {
        const o = ctx.createOscillator(), g = gain(0);
        o.type = 'triangle';
        o.frequency.value = f / 2;
        o.detune.value = cents;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.022, t + 3);
        g.gain.setValueAtTime(0.022, t + len - 1);
        g.gain.linearRampToValueAtTime(0, t + len + 1.5);
        o.connect(g); g.connect(padBus);
        o.start(t); o.stop(t + len + 1.6);
      }));
    }, 8000, 8000);

    every(live, () => {
      const f = BELLS[Math.floor(Math.random() * BELLS.length)], t = ctx.currentTime + 0.02;
      [[1, 0.05], [2, 0.012], [3, 0.004]].forEach(([mult, peak]) => {
        const o = ctx.createOscillator(), g = gain(0);
        o.frequency.value = f * mult;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8 / mult);
        o.connect(g); g.connect(bells);
        o.start(t); o.stop(t + 3);
      });
    }, 900, 2600);
  }

  function nature(music) {
    return (out, live) => {
      // running water
      const water = noise('pink'), bp = filter('bandpass', 1100, 0.6), wg = gain(music ? 0.1 : 0.16);
      water.connect(bp); bp.connect(wg); wg.connect(out);
      // breeze
      const wind = noise('brown'), wl = filter('lowpass', 380), windG = gain(0.22);
      wind.connect(wl); wl.connect(windG); windG.connect(out);
      water.start(); wind.start();
      live.sources.push(water, wind, lfo(0.06, 350, bp.frequency), lfo(0.11, 0.04, wg.gain), lfo(0.035, 0.14, windG.gain));

      const birds = room(out, 0.19, 0.25, 0.35);
      every(live, () => chirp(birds), 2500, 8500);

      if (music) melody(out, live);
    };
  }

  function file(src, fallback) {
    const a = new Audio(src);
    let alive = true, v = 0;
    a.loop = true;
    a.volume = 0;
    a.play().catch(() => {});
    const fadeIn = setInterval(() => {
      v = Math.min(1, v + 0.05);
      a.volume = v * (ducked ? DUCKED : 1);
      if (v >= 1) clearInterval(fadeIn);
    }, 80);
    a.addEventListener('error', () => {
      if (!alive) return;
      console.warn('[audio] could not load ' + src + ' — using the generated nature sound instead.');
      clearInterval(fadeIn);
      if (current === handle) current = fallback();
    });
    const handle = {
      el: a,
      stop() {
        alive = false;
        clearInterval(fadeIn);
        const out = setInterval(() => {
          const next = a.volume - 0.08;
          if (next <= 0) { clearInterval(out); a.pause(); a.removeAttribute('src'); a.load(); }
          else a.volume = next;
        }, 60);
      }
    };
    return handle;
  }

  /* ---------- public ---------- */

  // mode: 'nature' | 'brown' | 'silence';  opts: { src, music }
  function play(mode, opts = {}) {
    const key = mode === 'nature' ? `nature|${opts.src || ''}|${opts.music ? 1 : 0}` : mode;
    if (key === currentKey) return;
    currentKey = key;
    if (current) { current.stop(); current = null; }
    if (mode === 'silence') return;
    if (!ensure()) return;
    if (mode === 'brown') current = voice(brown);
    else if (opts.src) current = file(opts.src, () => voice(nature(opts.music)));
    else current = voice(nature(opts.music));
  }

  // Lower the background while a video is playing.
  function duck(on) {
    ducked = on;
    if (master) master.gain.setTargetAtTime(on ? DUCKED : LEVEL, ctx.currentTime, 0.3);
    if (current && current.el) current.el.volume = on ? DUCKED : 1;
  }

  window.Soundscape = { play, duck };
})();
