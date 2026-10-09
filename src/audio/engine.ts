import type { ToolId } from "../types";

/*
 * The whole sound world of the bench is synthesized — no samples.
 * Everything is quiet on purpose. Master sits well under 1.0.
 */
export class SoundEngine {
  muted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private matTeardown: (() => void) | null = null;
  private lastScrape = 0;

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.85;
    master.connect(ctx.destination);
    this.master = master;

    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;

    this.roomTone();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx && this.master)
      this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.15);
  }

  /* ------- faint workshop air ------- */
  private roomTone() {
    const ctx = this.ctx!;
    const m = this.master!;
    // brown-ish noise loop
    const len = 4 * ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.4;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 230;
    const g = ctx.createGain();
    g.gain.value = 0.02;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = ctx.createGain();
    lg.gain.value = 0.007;
    lfo.connect(lg);
    lg.connect(g.gain);
    src.connect(f);
    f.connect(g);
    g.connect(m);
    src.start();
    lfo.start();
    // high air
    const air = ctx.createBufferSource();
    air.buffer = this.noise!;
    air.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 5200;
    const ag = ctx.createGain();
    ag.gain.value = 0.003;
    air.connect(hp);
    hp.connect(ag);
    ag.connect(m);
    air.start();
  }

  private burst(
    type: BiquadFilterType,
    freq: number,
    q: number,
    gain: number,
    dur: number,
    freqEnd?: number,
    delay = 0,
  ) {
    const ctx = this.ctx;
    const m = this.master;
    if (!ctx || !m || !this.noise) return;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t0);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 10), t0 + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0004, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(m);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  private tone(
    type: OscillatorType,
    freq: number,
    gain: number,
    dur: number,
    delay = 0,
    freqEnd?: number,
  ) {
    const ctx = this.ctx;
    const m = this.master;
    if (!ctx || !m) return;
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0004, t0 + dur);
    o.connect(g);
    g.connect(m);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  /* hand moving across empty grain */
  scrape(v: number) {
    const t = performance.now();
    if (t - this.lastScrape < 110) return;
    this.lastScrape = t;
    const cl = Math.min(2400, Math.max(0, v));
    this.burst("bandpass", 380 + cl * 0.32, 1.2, Math.min(0.02, 0.004 + cl * 0.0000045), 0.16);
  }

  /* a tool lifting / landing */
  click(tool: ToolId | null, soft = false) {
    const k = soft ? 0.6 : 1;
    if (tool === "knife" || tool === "clamp") {
      this.burst("bandpass", 2400, 2, 0.05 * k, 0.06);
      this.tone("sine", tool === "knife" ? 880 : 620, 0.032 * k, 0.12);
    } else if (tool === "ruler" || tool === "magnifier") {
      this.burst("bandpass", 1900, 2, 0.042 * k, 0.05);
      this.tone("sine", 980, 0.028 * k, 0.1);
    } else {
      this.burst("bandpass", 1400, 1.4, 0.05 * k, 0.06);
      this.tone("sine", 420, 0.028 * k, 0.09);
    }
  }

  /* something faint found in the dark */
  reveal() {
    this.burst("bandpass", 3200, 3, 0.024, 0.12, 2200);
    this.tone("sine", 1320, 0.012, 0.4, 0.02);
  }

  whoosh(s: number) {
    this.burst("bandpass", 300, 1, 0.04 * Math.min(1, s), 0.38, 1100);
  }

  drawerSlide() {
    this.burst("bandpass", 520, 1.6, 0.045, 0.5, 240);
  }

  /* layout restructuring — tools landing in new places */
  settleSeq(n: number, drawers: boolean) {
    for (let i = 0; i < n; i++) {
      const d = i * (drawers ? 0.15 : 0.1) + Math.random() * 0.03;
      this.tone("sine", 95 + Math.random() * 40, 0.08, 0.28, d, 58);
      this.burst(
        "lowpass",
        Math.min(320, 180 + i * 30),
        1,
        0.045 + 0.012 * Math.random(),
        0.14,
        undefined,
        d,
      );
    }
    if (drawers) this.drawerSlide();
  }

  /* the index closes — the bench opens */
  solveChord() {
    const notes = [146.83, 293.66, 369.99, 440, 587.33, 739.99];
    notes.forEach((n, i) => {
      this.tone("sine", n, i === 0 ? 0.04 : 0.024, 2.6 - i * 0.2, i * 0.13);
      this.tone("sine", n * 2.001, 0.006, 1.6, i * 0.13 + 0.05);
    });
    this.burst("bandpass", 2400, 2, 0.02, 0.8, 1200, 0.4);
  }

  /* paper sliding — entering or leaving the catalogue */
  pageTurn() {
    this.burst("bandpass", 1900, 0.8, 0.032, 0.42, 520);
    this.burst("bandpass", 900, 0.9, 0.018, 0.3, 1500, 0.18);
  }

  /* quiet recognition — a remembered tool says hello */
  chime() {
    this.tone("sine", 587.33, 0.026, 1.4, 0);
    this.tone("sine", 880, 0.019, 1.6, 0.09);
    this.tone("sine", 1174.66, 0.011, 1.2, 0.18);
  }

  /* per-mark small voices */
  markVoice(tool: ToolId) {
    switch (tool) {
      case "pen":
        this.burst("bandpass", 2600, 1.2, 0.028, 0.14, 1800);
        break;
      case "knife":
        this.tone("triangle", 240 + Math.random() * 120, 0.02, 0.09);
        this.burst("lowpass", 300, 1, 0.03, 0.1);
        break;
      case "brush":
        this.burst("bandpass", 640, 0.8, 0.03, 0.3, 420);
        break;
      case "ruler":
        this.tone("sine", 1567, 0.018, 0.5);
        break;
      case "magnifier":
        this.reveal();
        break;
      case "clamp":
        this.burst("bandpass", 900, 4, 0.045, 0.05);
        this.tone("sine", 180, 0.02, 0.1, 0.02);
        break;
    }
  }

  /* ------- sustained material sound while lingering ------- */
  materialStart(tool: ToolId) {
    this.materialStop();
    const ctx = this.ctx;
    const m = this.master;
    if (!ctx || !m || !this.noise) return;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.connect(m);
    const nodes: AudioScheduledSourceNode[] = [];
    let interval = 0;

    const noiseIn = (type: BiquadFilterType, freq: number, q: number) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise!;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      src.connect(f);
      f.connect(g);
      src.start();
      nodes.push(src);
      return f;
    };
    const osc = (type: OscillatorType, freq: number) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      nodes.push(o);
      return o;
    };
    const modGain = (lfoFreq: number, depth: number) => {
      const l = osc("sine", lfoFreq);
      const lg = ctx.createGain();
      lg.gain.value = depth;
      l.connect(lg);
      lg.connect(g.gain);
      l.start();
    };

    switch (tool) {
      case "pen": {
        noiseIn("bandpass", 1900, 0.8);
        g.gain.setTargetAtTime(0.036, now, 0.5);
        modGain(7.3, 0.026);
        const t = osc("sine", 2400);
        const tg = ctx.createGain();
        tg.gain.value = 0.0025;
        t.connect(tg);
        tg.connect(g);
        t.start();
        break;
      }
      case "knife": {
        const f = noiseIn("lowpass", 170, 0.7);
        g.gain.setTargetAtTime(0.045, now, 0.6);
        const creak = osc("sawtooth", 52);
        const cg = ctx.createGain();
        cg.gain.value = 0.012;
        const cf = ctx.createBiquadFilter();
        cf.type = "lowpass";
        cf.frequency.value = 190;
        creak.connect(cf);
        cf.connect(cg);
        cg.connect(g);
        creak.start();
        void f;
        interval = window.setInterval(() => {
          this.tone("triangle", 280 + Math.random() * 320, 0.011, 0.05);
        }, 900 + Math.random() * 700);
        break;
      }
      case "brush": {
        noiseIn("bandpass", 760, 0.6);
        g.gain.setTargetAtTime(0.04, now, 0.7);
        modGain(0.45, 0.026);
        break;
      }
      case "ruler": {
        noiseIn("bandpass", 2600, 3);
        g.gain.setTargetAtTime(0.006, now, 0.5);
        interval = window.setInterval(() => {
          this.tone("sine", 1180, 0.02, 1.1);
          this.tone("sine", 1774, 0.009, 0.9, 0.04);
        }, 1600);
        break;
      }
      case "magnifier": {
        noiseIn("bandpass", 5200, 4);
        g.gain.setTargetAtTime(0.006, now, 0.6);
        const a = osc("sine", 2093);
        const ag = ctx.createGain();
        ag.gain.value = 0.008;
        a.connect(ag);
        ag.connect(g);
        a.start();
        const b = osc("sine", 2217);
        const bg = ctx.createGain();
        bg.gain.value = 0.005;
        b.connect(bg);
        bg.connect(g);
        b.start();
        break;
      }
      case "clamp": {
        noiseIn("lowpass", 140, 0.7);
        g.gain.setTargetAtTime(0.014, now, 0.5);
        interval = window.setInterval(() => {
          this.burst("bandpass", 880, 4, 0.04, 0.05);
          if (Math.random() < 0.4) this.tone("sine", 72, 0.018, 0.12, 0.03);
        }, 1150);
        break;
      }
    }

    this.matTeardown = () => {
      if (interval) window.clearInterval(interval);
      try {
        g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.18);
        window.setTimeout(() => {
          nodes.forEach((n) => {
            try {
              n.stop();
            } catch {
              /* already stopped */
            }
          });
          g.disconnect();
        }, 700);
      } catch {
        /* closed ctx */
      }
    };
  }

  materialStop() {
    if (this.matTeardown) {
      this.matTeardown();
      this.matTeardown = null;
    }
  }
}
