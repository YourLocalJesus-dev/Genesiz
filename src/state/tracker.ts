import type { Mode, Paradigm, ToolId } from "../types";
import { PARTNER, TOOL_IDS } from "../lib/tools";

const MIN_EVENTS = 12;
const MIN_TIME_MS = 45_000;
const COOLDOWN_MS = 40_000;
const ENTER_SCORE = 12;
const ENTER_LEAD = 4;
const REPLACE_LEAD = 8;

interface Pt {
  x: number;
  y: number;
}

export class Tracker {
  scores: Record<"assembly" | "scattered" | "drawers", number> = {
    assembly: 0,
    scattered: 0,
    drawers: 0,
  };
  events = 0;
  dwell: Record<ToolId, number> = {
    pen: 0,
    knife: 0,
    brush: 0,
    ruler: 0,
    magnifier: 0,
    clamp: 0,
  };

  private startT = performance.now();
  private lastEventT = this.startT;
  private lastEventPos: Pt | null = null;
  private lastModeChange = this.startT;
  private path = 0;
  private lastMove: Pt | null = null;
  private activations: { id: ToolId; t: number }[] = [];

  onMove(x: number, y: number) {
    if (this.lastMove) this.path += Math.hypot(x - this.lastMove.x, y - this.lastMove.y);
    this.lastMove = { x, y };
  }

  private consumeDirectness(to: Pt): number {
    const disp = this.lastEventPos ? Math.hypot(to.x - this.lastEventPos.x, to.y - this.lastEventPos.y) : 0;
    const p = this.path;
    this.path = 0;
    return Math.min(1, disp / Math.max(p, disp, 80));
  }

  activate(id: ToolId, x: number, y: number) {
    const t = performance.now();
    const dt = (t - this.lastEventT) / 1000;
    const jump = this.lastEventPos ? Math.hypot(x - this.lastEventPos.x, y - this.lastEventPos.y) : 0;
    const direct = this.consumeDirectness({ x, y });
    const prev = this.activations[this.activations.length - 1];
    const same = prev?.id === id;

    this.activations.push({ id, t });
    if (this.activations.length > 10) this.activations.shift();
    const recentUnique = new Set(this.activations.slice(-6)).size;
    const allUnique = new Set(this.activations.map((a) => a.id)).size;

    if (dt < 1.5) this.scores.scattered += 2;
    if (jump > 320) this.scores.scattered += 1.5;
    if (direct < 0.35 && jump > 200) this.scores.scattered += 1;
    if (recentUnique >= 4) this.scores.scattered += 2;

    if (dt > 3) this.scores.assembly += 2;
    else if (dt > 1.8) this.scores.assembly += 1;
    if (direct > 0.55) this.scores.assembly += 2;
    if (!same && recentUnique <= 3 && this.activations.length >= 4) this.scores.assembly += 1;

    if (same) this.scores.drawers += 2;
    if (allUnique === 1 && this.activations.length >= 4) this.scores.drawers += 2;

    this.events++;
    this.lastEventT = t;
    this.lastEventPos = { x, y };
  }

  settle() {
    this.events++;
    this.lastEventT = performance.now();
  }

  recordDwell(id: ToolId, ms: number) {
    this.dwell[id] += ms;
    if (ms > 3000) this.scores.drawers += 3;
    else if (ms > 1500) this.scores.assembly += 1;
  }

  focusedPair(usage: Record<ToolId, number>, allowed?: ToolId[]): [ToolId, ToolId] {
    const pool = allowed && allowed.length >= 2 ? allowed : TOOL_IDS;
    const score = (id: ToolId) => this.dwell[id] + (usage[id] ?? 0) * 1600;
    const ranked = [...pool].sort((a, b) => score(b) - score(a));
    const a = ranked[0];
    let b = score(ranked[1]) > 0 ? ranked[1] : PARTNER[a];
    if (!pool.includes(b) || b === a) b = ranked.find((id) => id !== a) ?? a;
    return [a, b];
  }

  decide(current: Mode): Paradigm | null {
    if (this.events < MIN_EVENTS) return null;
    const now = performance.now();
    if (now - this.startT < MIN_TIME_MS) return null;
    if (now - this.lastModeChange < COOLDOWN_MS) return null;

    const entries = (
      Object.entries(this.scores) as ["assembly" | "scattered" | "drawers", number][]
    ).sort((a, b) => b[1] - a[1]);
    const [best, second] = [entries[0], entries[1]];

    if (current === "empty" || current === "remembered") {
      if (best[1] >= ENTER_SCORE && best[1] - second[1] >= ENTER_LEAD) {
        this.lastModeChange = now;
        return best[0];
      }
      return null;
    }
    const curScore = this.scores[current as keyof Tracker["scores"]] ?? 0;
    if (best[0] !== current && best[1] >= curScore + REPLACE_LEAD) {
      this.lastModeChange = now;
      return best[0];
    }
    return null;
  }
}
