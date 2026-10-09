import { useEffect, useMemo, useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import type { Mark, Mode, Paradigm, Release, ToolId, ToolState, VecN } from "../types";
import {
  CAB_W,
  DRAWER_H,
  KEY_ORDER,
  MODE_META,
  PARTNER,
  SLAB_H,
  SOCKETS,
  START_POS,
  START_ROT,
  TOOLS,
  TOOL_IDS,
  cabinetPos,
  clampN,
  drawerSlotOffset,
  freshTools,
  getSockets,
  slotPos,
} from "../lib/tools";
import { Tracker } from "./tracker";
import { SoundEngine } from "../audio/engine";

const KEY = "the-workshop.v2";
const HOVER_R = 36;
const REVEAL_R = 240;
const DISCOVER_R = 96;
const MARK_CAP = 90;

interface StoredTool {
  pos: VecN;
  rot: number;
  usage: number;
  dwellMs: number;
  tuckedInto: ToolId | null;
  drawerSlot: number;
}
interface Stored {
  v: number;
  visits: number;
  mode: Paradigm;
  tools: Partial<Record<ToolId, StoredTool>>;
  marks: Mark[];
  edges: Record<string, number>;
  order: ToolId[];
  focused: ToolId[];
  muted: boolean;
  catalog?: (ToolId | null)[];
  solved?: boolean;
}

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Stored;
    if (p && p.v === 2 && p.tools) return p;
    return null;
  } catch {
    return null;
  }
}

export function useWorkshop() {
  
  const stored = useMemo(loadStored, []);
  const visits = useMemo(() => (stored ? stored.visits + 1 : 1), [stored]);

  const trackerRef = useRef<Tracker | null>(null);
  if (!trackerRef.current) {
    const tr = new Tracker();
    if (stored) TOOL_IDS.forEach((id) => (tr.dwell[id] = stored.tools[id]?.dwellMs ?? 0));
    trackerRef.current = tr;
  }
  const soundRef = useRef<SoundEngine | null>(null);
  if (!soundRef.current) {
    const s = new SoundEngine();
    s.muted = stored?.muted ?? false;
    soundRef.current = s;
  }
  const tracker = trackerRef.current;
  const sound = soundRef.current;

  const [vp, setVp] = useState({ vw: window.innerWidth, vh: window.innerHeight });
  const { vw, vh } = vp;

  const [tools, setTools] = useState<ToolState[]>(() => {
    if (!stored) return freshTools();
    return TOOL_IDS.map((id) => {
      const s = stored.tools[id];
      const catIdx = stored.catalog ? stored.catalog.indexOf(id) : -1;
      const pos = catIdx >= 0 ? { ...SOCKETS[catIdx] } : s?.pos ? { ...s.pos } : { ...START_POS[id] };
      const rot = catIdx >= 0 ? 0 : s?.rot ?? START_ROT[id];
      return {
        id,
        pos,
        rot,
        vis: "idle" as const,
        usage: s?.usage ?? 0,
        dwellMs: s?.dwellMs ?? 0,
        remembered: true,
        greeted: false,
        tuckedInto: catIdx >= 0 ? null : s?.tuckedInto ?? null,
        drawerSlot: catIdx >= 0 ? 0 : s?.drawerSlot ?? 0,
      };
    });
  });
  const [mode, setMode] = useState<Mode>(stored ? "remembered" : "empty");
  const [base] = useState<Paradigm>(stored?.mode ?? "empty");
  const [marks, setMarks] = useState<Mark[]>(() => stored?.marks?.filter((m) => m && TOOL_IDS.includes(m.type)) ?? []);
  const [edges, setEdges] = useState<Record<string, number>>(() => stored?.edges ?? {});
  const [order, setOrder] = useState<ToolId[]>(() => stored?.order?.filter((t) => TOOL_IDS.includes(t)) ?? []);
  const [focused, setFocused] = useState<ToolId[]>(() => stored?.focused ?? []);
  const [catalog, setCatalog] = useState<(ToolId | null)[]>(() => {
    const c = stored?.catalog;
    if (Array.isArray(c) && c.length === 6) return c.map((v) => (v && TOOL_IDS.includes(v) ? v : null));
    return [null, null, null, null, null, null];
  });
  const [solved, setSolved] = useState<boolean>(stored?.solved ?? false);
  const [view, setView] = useState<"bench" | "site">("bench");
  const [activeId, setActiveId] = useState<ToolId | null>(null);
  const [hoverId, setHoverId] = useState<ToolId | null>(null);
  const [openCab, setOpenCab] = useState<ToolId | null>(null);
  const [preview, setPreview] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [veiled, setVeiled] = useState(true);
  const [muted, setMuted] = useState(stored?.muted ?? false);
  const [nativeHover, setNativeHover] = useState(false);
  const [idle, setIdle] = useState(false);

  const mx = useMotionValue(vw / 2);
  const my = useMotionValue(vh / 2);
  const sx = useSpring(mx, { stiffness: 520, damping: 42 });
  const sy = useSpring(my, { stiffness: 520, damping: 42 });
  const lx = useSpring(mx, { stiffness: 62, damping: 19 });
  const ly = useSpring(my, { stiffness: 62, damping: 19 });
  const lsTarget = useMotionValue(1);
  const ls = useSpring(lsTarget, { stiffness: 90, damping: 20 });
  const rotTarget = useMotionValue(0);
  const rot = useSpring(rotTarget, { stiffness: 110, damping: 13 });

  const releasesRef = useRef<Record<string, Release>>({});
  const releaseK = useRef(0);
  const counters = useRef<Record<ToolId, number>>({
    pen: 0, knife: 0, brush: 0, ruler: 0, magnifier: 0, clamp: 0,
  });
  const markId = useRef(0);
  useMemo(() => {
    if (stored?.marks) {
      stored.marks.forEach((m) => {
        counters.current[m.type]++;
        if (m.id > markId.current) markId.current = m.id;
      });
    }
  }, [stored]);
  const pressRef = useRef<{ x: number; y: number; t: number; using: boolean; lastTick: number } | null>(null);
  const pressTimer = useRef<number | null>(null);
  const previewTimer = useRef<number | null>(null);
  const hintTimer = useRef<number | null>(null);
  const hoverStart = useRef<{ id: ToolId; t: number } | null>(null);
  const activatedAt = useRef(0);
  const lastActivated = useRef<ToolId | null>(null);
  const lastMove = useRef<{ x: number; y: number; t: number } | null>(null);
  const veilSamples = useRef(0);
  const flags = useRef<Record<string, boolean>>({});
  const lastWrong = useRef(0);

  const assemblyLike = mode === "assembly" || (mode === "remembered" && base === "assembly");
  const scatteredLike = mode === "scattered" || (mode === "remembered" && base === "scattered");
  const drawersLike = mode === "drawers" || (mode === "remembered" && base === "drawers");
  const found = tools.filter((t) => t.vis !== "hidden").length;
  const tableOpen = found === 6;
  const indexFilled = catalog.filter(Boolean).length;

  const pct = (x: number, y: number): VecN => ({
    x: clampN(x / Math.max(vw, 1), 0.02, 0.98),
    y: clampN(y / Math.max(vh, 1), 0.02, 0.98),
  });

  const sockets = useMemo(() => getSockets(vw), [vw]);

  const socketHit = (x: number, y: number): number => {
    let hit = -1;
    let best = Infinity;
    const socs = getSockets(vw);
    const hitR = vw < 640 ? 36 : 48;
    socs.forEach((s, i) => {
      const d = Math.hypot(x - s.x * vw, y - s.y * vh);
      if (d < hitR && d < best) {
        best = d;
        hit = i;
      }
    });
    return hit;
  };

  const slotOrder = (ts: ToolState[]): ToolId[] => {
    const known = order.filter((id) => ts.some((t) => t.id === id));
    const missing = TOOL_IDS.filter((id) => !known.includes(id));
    return [...known, ...missing];
  };

  const whisper = (text: string, holdMs = 4600) => {
    setHint(text);
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), holdMs);
  };
  const whisperOnce = (key: string, text: string, holdMs = 4600) => {
    if (flags.current[key]) return;
    flags.current[key] = true;
    whisper(text, holdMs);
  };

  const solve = () => {
    setSolved(true);
    sound.solveChord();
    whisper("yes — that is the old order.", 5200);
    lsTarget.set(1.8);
    window.setTimeout(() => lsTarget.set(1), 1200);
    window.setTimeout(() => {
      sound.pageTurn();
      setView("site");
    }, 2100);
  };
  const enterSite = () => {
    sound.unlock();
    sound.pageTurn();
    setView("site");
  };
  const exitSite = () => {
    sound.pageTurn();
    setView("bench");
  };

  const pickables = (ts: ToolState[], isTouch = false): { id: ToolId; px: number; py: number; r: number }[] => {
    const out: { id: ToolId; px: number; py: number; r: number }[] = [];
    const baseR = isTouch || vw < 640 ? 46 : HOVER_R;
    ts.forEach((t) => {
      if (t.id === activeId || t.vis === "hidden") return;
      if (t.tuckedInto && drawersLike) {
        if (openCab !== t.tuckedInto) return;
        const seat = ts.find((s) => s.id === t.tuckedInto);
        if (!seat) return;
        out.push({
          id: t.id,
          px: seat.pos.x * vw + drawerSlotOffset(t.drawerSlot),
          py: seat.pos.y * vh - SLAB_H / 2 + SLAB_H + 3 + DRAWER_H / 2 - 4,
          r: isTouch ? 38 : 30,
        });
      } else {
        out.push({ id: t.id, px: t.pos.x * vw, py: t.pos.y * vh, r: baseR });
      }
    });
    return out;
  };

  const cabinetAt = (ts: ToolState[], x: number, y: number): ToolId | null => {
    if (!drawersLike) return null;
    for (const f of focused) {
      const seat = ts.find((t) => t.id === f);
      if (!seat) continue;
      const cx = seat.pos.x * vw;
      const top = seat.pos.y * vh - SLAB_H / 2;
      const height = SLAB_H + (openCab === f ? DRAWER_H + 14 : 10);
      if (Math.abs(x - cx) < CAB_W / 2 + 8 && y > top - 30 && y < top + height) return f;
    }
    return null;
  };

  const applyParadigm = (p: Paradigm, ts: ToolState[], foci?: [ToolId, ToolId]): ToolState[] => {
    if (p === "assembly") {
      const so = slotOrder(ts);
      return ts.map((t) => {
        if (t.id === activeId || catalog.includes(t.id)) return { ...t, vis: "idle" as const };
        const i = so.indexOf(t.id);
        return { ...t, vis: "idle" as const, pos: slotPos(i, so.length), rot: 0, tuckedInto: null };
      });
    }
    if (p === "scattered") {
      const W = vw || 1440;
      const H = vh || 900;
      const pts = ts.map((t) => ({
        id: t.id,
        px: t.pos.x * W,
        py: t.pos.y * H,
        active: t.id === activeId || catalog.includes(t.id),
      }));
      for (let k = 0; k < 70; k++) {
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const a = pts[i];
            const b = pts[j];
            const dx = b.px - a.px;
            const dy = b.py - a.py;
            const d = Math.max(Math.hypot(dx, dy), 1);
            const MIN = 175;
            if (d < MIN) {
              const push = (MIN - d) / 2;
              const ux = dx / d;
              const uy = dy / d;
              if (!a.active) {
                a.px -= ux * push;
                a.py -= uy * push;
              }
              if (!b.active) {
                b.px += ux * push;
                b.py += uy * push;
              }
            }
          }
        }
        pts.forEach((pt) => {
          pt.px = clampN(pt.px, 90, W - 90);
          pt.py = clampN(pt.py, 178, H - 180);
        });
      }
      return ts.map((t) => {
        const pt = pts.find((pp) => pp.id === t.id)!;
        return { ...t, vis: "idle" as const, pos: { x: pt.px / W, y: pt.py / H }, tuckedInto: null };
      });
    }
    if (p === "drawers") {
      const usage = Object.fromEntries(ts.map((t) => [t.id, t.usage])) as Record<ToolId, number>;
      const allowed = ts.filter((t) => !catalog.includes(t.id)).map((t) => t.id);
      const f = foci ?? tracker.focusedPair(usage, allowed);
      const a = ts.find((t) => t.id === f[0]) ?? ts[0];
      const b = ts.find((t) => t.id === f[1]) ?? ts[1];
      const [ca, cb] = cabinetPos(a.pos, b.pos);
      const cabOf = new Map<ToolId, VecN>([
        [f[0], ca],
        [f[1], cb],
      ]);
      const counts: Record<string, number> = { [f[0]]: 0, [f[1]]: 0 };
      const assign = (id: ToolId): ToolId => {
        if (PARTNER[id] === f[0]) return f[0];
        if (PARTNER[id] === f[1]) return f[1];
        return counts[f[0]] <= counts[f[1]] ? f[0] : f[1];
      };
      return ts.map((t) => {
        if (t.id === activeId || catalog.includes(t.id)) return { ...t, vis: "idle" as const };
        if (t.id === f[0] || t.id === f[1]) {
          return { ...t, vis: "idle" as const, pos: { ...(cabOf.get(t.id) as VecN) }, rot: 0, tuckedInto: null };
        }
        const c = assign(t.id);
        const slotIdx = counts[c]++;
        return {
          ...t,
          vis: "idle" as const,
          pos: { ...(cabOf.get(c) as VecN) },
          rot: START_ROT[t.id] * 0.4,
          tuckedInto: c,
          drawerSlot: slotIdx,
        };
      });
    }
    return ts.map((t) => (t.id === activeId ? t : { ...t }));
  };

  const maybeEvolve = () => {
    const next = tracker.decide(mode);
    if (!next) return;
    setMode(next);
    if (next === "drawers") {
      const usage = Object.fromEntries(tools.map((t) => [t.id, t.usage])) as Record<ToolId, number>;
      const allowed = tools.filter((t) => !catalog.includes(t.id)).map((t) => t.id);
      const f = tracker.focusedPair(usage, allowed);
      setFocused(f);
      setTools((ts) => applyParadigm(next, ts, f));
    } else {
      setTools((ts) => applyParadigm(next, ts));
    }
    const n = tools.filter((t) => t.vis !== "hidden").length || 6;
    sound.settleSeq(Math.min(n, 6), next === "drawers");
    if (next === "scattered") sound.whoosh(1);
    whisper(MODE_META[next].poem, 6000);
  };

  const maybeEvolveRef = useRef(maybeEvolve);
  maybeEvolveRef.current = maybeEvolve;
  useEffect(() => {
    const t = window.setInterval(() => maybeEvolveRef.current(), 4000);
    return () => window.clearInterval(t);
    
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      const last = lastMove.current?.t ?? 0;
      const quiet = performance.now() - last > 11000;
      setIdle((was) => {
        if (quiet && !was && !veiled) return true;
        if (!quiet && was) return false;
        return was;
      });
    }, 1200);
    return () => window.clearInterval(t);
  }, [veiled]);

  useEffect(() => {
    if (tableOpen && !flags.current["table-open"]) {
      flags.current["table-open"] = true;
      window.setTimeout(
        () => whisper("an index surfaces — six sockets, one old order. the pen remembers it. so does the glass.", 8200),
        1600,
      );
    }
    
  }, [tableOpen]);

  const putdown = (id: ToolId, at: VecN, silent = false) => {
    const now = performance.now();
    const dwell = now - activatedAt.current;
    tracker.recordDwell(id, dwell);
    tracker.settle();

    let target = at;
    let rotV = clampN(rotTarget.get(), -8, 8);

    let seatedHere = false;
    const soc = tableOpen ? socketHit(mx.get(), my.get()) : -1;
    if (soc >= 0) {
      seatedHere = true;
      rotV = 0;
      target = { ...sockets[soc] };
      const occ = catalog[soc];
      const nc = [...catalog];
      const cur = nc.indexOf(id);
      if (cur >= 0) nc[cur] = null;
      if (occ && occ !== id) {
        
        releasesRef.current[occ] = { k: ++releaseK.current, dx: 0, dy: -0.115 * vh };
        const outPos = { x: sockets[soc].x, y: sockets[soc].y + 0.115 };
        setTools((ts) => ts.map((t) => (t.id === occ ? { ...t, pos: outPos, rot: START_ROT[occ] * 0.6 } : t)));
      }
      nc[soc] = id;
      setCatalog(nc);
      if (!solved && nc.every(Boolean)) {
        const ok = KEY_ORDER.every((k, i) => nc[i] === k);
        if (ok) {
          window.setTimeout(() => solve(), 250);
        } else {
          const t = Date.now();
          if (t - lastWrong.current > 4200) {
            lastWrong.current = t;
            whisper("not quite — the bench keeps its own order.", 4200);
          }
        }
      }
    } else {
      const cur = catalog.indexOf(id);
      if (cur >= 0) {
        const nc = [...catalog];
        nc[cur] = null;
        setCatalog(nc);
      }
    }

    if (!seatedHere && assemblyLike) {
      const so = slotOrder(tools);
      target = slotPos(so.indexOf(id), so.length);
      rotV = 0;
    } else if (!seatedHere && drawersLike && focused.includes(id)) {
      const seat = tools.find((t) => t.id === id);
      if (seat) {
        target = { ...seat.pos };
        rotV = 0;
      }
    }
    target = { x: clampN(target.x, 0.055, 0.945), y: clampN(target.y, 0.1, 0.86) };

    releasesRef.current[id] = {
      k: ++releaseK.current,
      dx: mx.get() - target.x * vw,
      dy: my.get() - target.y * vh,
    };
    setTools((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, pos: target, rot: rotV, tuckedInto: null, dwellMs: t.dwellMs + dwell }
          : t,
      ),
    );
    setActiveId(null);
    setPreview(false);
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    rotTarget.set(0);
    sound.materialStop();
    if (!silent) sound.settleSeq(1, false);
    lastActivated.current = id;
    maybeEvolve();
  };

  const activate = (id: ToolId) => {
    if (activeId === id) return;
    if (activeId) putdown(activeId, pct(mx.get(), my.get()), true);
    tracker.activate(id, mx.get(), my.get());
    const prev = lastActivated.current;
    if (prev && prev !== id) {
      const key = [prev, id].sort().join("|");
      setEdges((e) => ({ ...e, [key]: (e[key] ?? 0) + 1 }));
    }
    if (!order.includes(id)) setOrder((o) => [...o, id]);
    {
      const cur = catalog.indexOf(id);
      if (cur >= 0) {
        const nc = [...catalog];
        nc[cur] = null;
        setCatalog(nc);
      }
    }
    setTools((ts) =>
      ts.map((t) => (t.id === id ? { ...t, vis: "idle" as const, usage: t.usage + 1 } : t)),
    );
    setActiveId(id);
    setPreview(false);
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    hoverStart.current = null;
    activatedAt.current = performance.now();
    sound.click(id);
    lastActivated.current = id;
    whisperOnce("first-active", "press and linger, to use it. click, to set it down.", 6000);
    maybeEvolve();
  };

  const doUse = () => {
    const tool = activeId;
    if (!tool) return;
    counters.current[tool]++;
    const idx = counters.current[tool] - 1;
    const id = ++markId.current;
    const px = mx.get() + (Math.random() - 0.5) * 8;
    const py = my.get() + (Math.random() - 0.5) * 6 + 4;
    const at = pct(px, py);
    let r = 0;
    let w = 0;
    switch (tool) {
      case "pen":
        r = Math.random() * 5 - 2.5;
        break;
      case "knife":
        r = -16 + Math.random() * 10;
        break;
      case "brush":
        r = Math.random() * 180;
        w = 40 + Math.random() * 40;
        break;
      case "ruler":
        w = 84 + Math.random() * 72;
        break;
      default:
        break;
    }
    setMarks((ms) => [...ms, { id, type: tool, x: at.x, y: at.y, rot: r, idx, w, born: Date.now() }].slice(-MARK_CAP));
    sound.markVoice(tool);
    whisperOnce(`mark-${tool}`, TOOLS[tool].firstUse, 5200);
  };

  const beginPress = (x: number, y: number) => {
    pressRef.current = { x, y, t: performance.now(), using: false, lastTick: 0 };
    if (pressTimer.current) window.clearInterval(pressTimer.current);
    pressTimer.current = window.setInterval(() => {
      const pr = pressRef.current;
      const tool = activeId;
      if (!pr || !tool) return;
      const cx = mx.get();
      const cy = my.get();
      const moved = Math.hypot(cx - pr.x, cy - pr.y);
      const now = performance.now();
      if (moved > 16) {
        pr.x = cx;
        pr.y = cy;
        pr.t = now;
        if (pr.using) {
          pr.using = false;
          sound.materialStop();
        }
        return;
      }
      if (now - pr.t > 520) {
        if (!pr.using) {
          pr.using = true;
          pr.lastTick = now;
          sound.materialStart(tool);
          doUse();
        } else if (now - pr.lastTick >= 1400) {
          pr.lastTick = now;
          doUse();
        }
      }
    }, 120);
  };

  const endPress = () => {
    if (pressTimer.current) {
      window.clearInterval(pressTimer.current);
      pressTimer.current = null;
    }
    const pr = pressRef.current;
    pressRef.current = null;
    if (!pr) return;
    if (pr.using) {
      sound.materialStop();
      return;
    }
    const now = performance.now();
    const moved = Math.hypot(mx.get() - pr.x, my.get() - pr.y);
    if (activeId && now - pr.t < 520 && moved < 14) putdown(activeId, pct(mx.get(), my.get()));
  };

  const toolsRef = useRef(tools);
  toolsRef.current = tools;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const hoverIdRef = useRef(hoverId);
  hoverIdRef.current = hoverId;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const openCabRef = useRef(openCab);
  openCabRef.current = openCab;
  const veiledRef = useRef(veiled);
  veiledRef.current = veiled;
  const viewRef = useRef(view);
  viewRef.current = view;
  const vpRef = useRef(vp);
  vpRef.current = vp;
  const putdownRef = useRef(putdown);
  putdownRef.current = putdown;
  const activateRef = useRef(activate);
  activateRef.current = activate;
  const beginPressRef = useRef(beginPress);
  beginPressRef.current = beginPress;
  const endPressRef = useRef(endPress);
  endPressRef.current = endPress;
  const exitSiteRef = useRef(exitSite);
  exitSiteRef.current = exitSite;
  const toggleMuteRef = useRef(toggleMute);
  toggleMuteRef.current = toggleMute;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      mx.set(x);
      my.set(y);
      tracker.onMove(x, y);

      const currentTools = toolsRef.current;
      const currentActiveId = activeIdRef.current;
      const currentMode = modeRef.current;
      const currentVw = vpRef.current.vw;
      const currentVh = vpRef.current.vh;

      if (veiledRef.current) {
        veilSamples.current++;
        if (veilSamples.current > 2) {
          setVeiled(false);
          whisperOnce(
            "start",
            stored
              ? solved
                ? "welcome back. the catalogue waits at the top of the bench."
                : "welcome back. everything is where you left it."
              : "move slowly. search the dark.",
            5200,
          );
        }
      }

      const el = e.target as HTMLElement | null;
      const isNative = !!(el && el.closest && el.closest("[data-native]"));
      setNativeHover(isNative);
      if (isNative) {
        lsTarget.set(0.9);
        return;
      }

      const lm = lastMove.current;
      const speed = lm ? Math.hypot(x - lm.x, y - lm.y) : 0;
      lastMove.current = { x, y, t: performance.now() };

      const cab = cabinetAt(currentTools, x, y);
      if (cab !== openCabRef.current) {
        if (cab) sound.drawerSlide();
        setOpenCab(cab);
      }

      let cand: ToolId | null = null;
      let best = Infinity;
      const isTouch = e.pointerType === "touch";
      pickables(currentTools, isTouch).forEach((p) => {
        const d = Math.hypot(x - p.px, y - p.py);
        if (d < p.r && d < best) {
          best = d;
          cand = p.id;
        }
      });
      if (cand !== hoverIdRef.current) {
        if (hoverStart.current && !currentActiveId)
          tracker.recordDwell(hoverStart.current.id, performance.now() - hoverStart.current.t);
        hoverStart.current = cand && !currentActiveId ? { id: cand, t: performance.now() } : null;
        setHoverId(cand);
        if (cand && !currentActiveId) sound.click(cand, true);
        if (cand) {
          const t = currentTools.find((tt) => tt.id === cand);
          if (t && t.remembered && !t.greeted) {
            sound.chime();
            setTools((ts) => ts.map((tt) => (tt.id === t.id ? { ...tt, greeted: true } : tt)));
          }
        }
      }

      if (currentMode === "empty" && !currentActiveId) {
        const foundIds: ToolId[] = [];
        let touched = false;
        const next = currentTools.map((t) => {
          if (t.vis === "idle") return t;
          const d = Math.hypot(x - t.pos.x * currentVw, y - t.pos.y * currentVh);
          if (d < DISCOVER_R) {
            if (t.vis !== "idle") {
              touched = true;
              foundIds.push(t.id);
              return { ...t, vis: "idle" as const };
            }
          } else if (d < REVEAL_R) {
            if (t.vis !== "ghost") {
              touched = true;
              return { ...t, vis: "ghost" as const };
            }
          }
          return t;
        });
        if (touched) setTools(next);
        const d0 = foundIds[0] as ToolId | undefined;
        if (d0) {
          sound.reveal();
          whisperOnce(`discover-${d0}`, `found — ${TOOLS[d0].name}. ${TOOLS[d0].desc}.`, 5200);
        } else if (touched && foundIds.length === 0) {
          whisperOnce("ghost", "something waits here.", 3400);
        }
      }

      if (!cand && speed > 5) sound.scrape(speed);

      if (currentActiveId && lm) rotTarget.set(clampN((x - lm.x) * 0.55, -13, 13));

      lsTarget.set(
        cand ? 0.82 : currentActiveId ? 1.06 : currentMode === "empty" && speed > 4 ? 1.32 : 1,
      );

      if (previewTimer.current) window.clearTimeout(previewTimer.current);
      if (currentActiveId && !pressRef.current) {
        setPreview(false);
        previewTimer.current = window.setTimeout(() => {
          if (activeIdRef.current && !pressRef.current) setPreview(true);
        }, 1300);
      } else if (!currentActiveId) {
        setPreview(false);
      }
    };

    const onDown = (e: PointerEvent) => {
      sound.unlock();
      const el = e.target as HTMLElement | null;
      if (el && el.closest && el.closest("[data-native]")) return;
      if (veiledRef.current) {
        veilSamples.current = 99;
        setVeiled(false);
        whisperOnce("start", stored ? "welcome back. everything is where you left it." : "move slowly. search the dark.", 5200);
      }
      const x = e.clientX;
      const y = e.clientY;
      const currentTools = toolsRef.current;
      const currentActiveId = activeIdRef.current;
      let cand: ToolId | null = null;
      let best = Infinity;
      const isTouch = e.pointerType === "touch";
      const extraHit = isTouch ? 12 : 6;
      pickables(currentTools, isTouch).forEach((p) => {
        const d = Math.hypot(x - p.px, y - p.py);
        if (d < p.r + extraHit && d < best) {
          best = d;
          cand = p.id;
        }
      });
      if (cand) {
        activateRef.current(cand);
        return;
      }
      if (currentActiveId) {
        setPreview(false);
        beginPressRef.current(x, y);
      }
    };

    const onUp = () => endPressRef.current();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewRef.current === "site") exitSiteRef.current();
        else if (activeIdRef.current) putdownRef.current(activeIdRef.current, pct(mx.get(), my.get()));
      }
      if (e.key === "m" || e.key === "M") toggleMuteRef.current();
    };

    const onResize = () => {
      const newVp = { vw: window.innerWidth, vh: window.innerHeight };
      vpRef.current = newVp;
      setVp(newVp);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("blur", onUp);
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const payload: Stored = {
          v: 2,
          visits,
          mode: mode === "remembered" ? base : (mode as Paradigm),
          tools: Object.fromEntries(
            tools.map((tt) => [
              tt.id,
              {
                pos: tt.pos,
                rot: tt.rot,
                usage: tt.usage,
                dwellMs: tt.dwellMs,
                tuckedInto: tt.tuckedInto,
                drawerSlot: tt.drawerSlot,
              },
            ]),
          ) as Record<ToolId, StoredTool>,
          marks: marks.slice(-80),
          edges,
          order,
          focused,
          muted,
          catalog,
          solved,
        };
        localStorage.setItem(KEY, JSON.stringify(payload));
      } catch {
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [tools, marks, mode, edges, order, focused, muted, catalog, solved, visits, base]);

  const toggleMute = () => {
    sound.unlock();
    setMuted((m) => {
      sound.setMuted(!m);
      return !m;
    });
  };
  const resetBench = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
    }
    window.location.reload();
  };

  const sampleTool = (id: ToolId | null) => {
    sound.unlock();
    sound.pageTurn();
    if (id) sound.markVoice(id);
  };

  const getSignals = () => ({
    scores: { ...tracker.scores },
    dwell: { ...tracker.dwell },
    events: tracker.events,
    order: [...order],
    edges: { ...edges },
  });

  return {
    vw,
    vh,
    sockets,
    mode,
    base,
    tools,
    marks,
    edges,
    focused,
    activeId,
    hoverId,
    openCab,
    preview,
    hint,
    veiled,
    muted,
    nativeHover,
    visits,
    found,
    assemblyLike,
    scatteredLike,
    drawersLike,
    catalog,
    solved,
    view,
    tableOpen,
    indexFilled,
    idle,
    enterSite,
    exitSite,
    getSignals,
    sampleTool,
    releases: releasesRef.current,
    mv: { mx, my, sx, sy, lx, ly, ls, rot },
    toggleMute,
    resetBench,
  };
}
