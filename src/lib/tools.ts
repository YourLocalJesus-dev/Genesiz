import type { Mode, ToolId, ToolState, VecN } from "../types";

export interface ToolDef {
  id: ToolId;
  name: string;
  desc: string;
  color: string; 
  firstUse: string; 
}

export const TOOLS: Record<ToolId, ToolDef> = {
  pen: {
    id: "pen",
    name: "the pen",
    desc: "writes what you almost said",
    color: "#e4cfa4",
    firstUse: "it writes what you almost said.",
  },
  knife: {
    id: "knife",
    name: "the knife",
    desc: "removes what isn't needed",
    color: "#d7dee4",
    firstUse: "what you remove is still the work.",
  },
  brush: {
    id: "brush",
    name: "the brush",
    desc: "marks what you feel",
    color: "#d9a08a",
    firstUse: "a mark you don't have to explain.",
  },
  ruler: {
    id: "ruler",
    name: "the ruler",
    desc: "gives edges to things",
    color: "#cdb287",
    firstUse: "an edge makes a decision.",
  },
  magnifier: {
    id: "magnifier",
    name: "the glass",
    desc: "shows what was already there",
    color: "#a9cdc7",
    firstUse: "nothing new — only noticed.",
  },
  clamp: {
    id: "clamp",
    name: "the clamp",
    desc: "holds what matters, still",
    color: "#c2b49d",
    firstUse: "held. it will not drift now.",
  },
};

export const TOOL_IDS: ToolId[] = ["pen", "knife", "brush", "ruler", "magnifier", "clamp"];

export const PARTNER: Record<ToolId, ToolId> = {
  pen: "brush",
  brush: "pen",
  knife: "ruler",
  ruler: "knife",
  magnifier: "clamp",
  clamp: "magnifier",
};

export const PEN_LINES = [
  "begin before you are ready.",
  "the surface remembers everything.",
  "a line is a decision that stayed.",
  "make it slowly enough to mean it.",
  "nothing here is wasted.",
  "the hand learns before the mind.",
  "leave room for the tool to speak.",
  "what you repeat becomes the work.",
  "attention is a kind of light.",
  "finish is just patience, twice.",
  "the dark is not empty.",
  "keep this one.",
  "measure, cut, mark, write, look, hold.",
];

export const KNIFE_WORDS = ["what", "you", "remove", "is", "still", "the", "work"];

export const GLASS_DETAILS = [
  "grain, running north",
  "a knot, sleeping",
  "someone was here before you",
  "dust of old decisions",
  "the bench was a tree, once",
  "scratches from a previous hand",
  "wax, from another winter",
  "a hairline crack, patient",
];

export const BRUSH_COLORS = ["#c9876a", "#9aa786", "#7f96a8", "#af8a9d", "#c2a06e"];

export const SUBSURFACE: { x: number; y: number; t: string; r: number; secret?: boolean }[] = (() => {
  const words = [
    "oak, felled 1962", "R 0.4", "old varnish", "sanded twice", "north →",
    "an iron nail", "grain at 45°", "a knot", "someone's 4:30", "beeswax",
    "beech?", "measure twice", "12.07", "scr. 118", "quiet", "84 rings",
    "dried nine years", "rest here", "oil + daylight", "patience", "cut list",
    "ash splinter", "kept", "mark no. 6", "winter batch", "end grain",
    "still drying", "tighter", "measure · cut · mark · write · look · hold",
  ];
  let s = 987654321;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const res: { x: number; y: number; t: string; r: number; secret?: boolean }[] = words.map((t, i) => ({
    x: 0.05 + rnd() * 0.9,
    y: 0.08 + rnd() * 0.84,
    t,
    r: (rnd() * 10 - 5) * (i % 3 === 0 ? 3 : 1),
  }));
  res.push({ x: 0.82, y: 0.18, t: "/genesiz", r: 12, secret: true });
  return res;
})();

export const MODE_META: Record<Mode, { label: string; poem: string }> = {
  empty: { label: "empty bench", poem: "nothing yet. search the dark." },
  assembly: { label: "assembly line", poem: "the bench found its order." },
  scattered: { label: "scattered paths", poem: "your paths stayed lit." },
  drawers: { label: "drawers & compartments", poem: "what you love stays open." },
  remembered: { label: "remembered setup", poem: "you left, and it waited." },
};

export const RAIL_Y = 0.44;
export const SLOT_A = 0.16;
export const SLOT_B = 0.84;

export const CAB_W = 210;
export const SLAB_H = 56;
export const DRAWER_H = 62;
export const SLOT_GAP = 56;

export const drawerSlotOffset = (slot: number) => (slot - 1) * SLOT_GAP;

export const slotPos = (i: number, n: number): VecN => ({
  x: n === 1 ? 0.5 : SLOT_A + ((SLOT_B - SLOT_A) * i) / (n - 1),
  y: RAIL_Y,
});

export const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const distPx = (a: VecN, b: VecN, vw: number, vh: number) =>
  Math.hypot((a.x - b.x) * vw, (a.y - b.y) * vh);

export const seeded = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const cabinetPos = (a: VecN, b: VecN): [VecN, VecN] => {
  const leftFirst = a.x <= b.x;
  let ax = clampN(a.x, leftFirst ? 0.2 : 0.54, leftFirst ? 0.46 : 0.8);
  let bx = clampN(b.x, leftFirst ? 0.54 : 0.2, leftFirst ? 0.8 : 0.46);
  if (Math.abs(ax - bx) < 0.2) {
    const mid = (ax + bx) / 2;
    ax = clampN(mid - 0.11, 0.18, 0.8);
    bx = clampN(mid + 0.11, 0.2, 0.82);
  }
  return [
    { x: ax, y: 0.6 },
    { x: bx, y: 0.6 },
  ];
};

export const START_POS: Record<ToolId, VecN> = {
  pen: { x: 0.5, y: 0.47 },
  knife: { x: 0.29, y: 0.4 },
  brush: { x: 0.69, y: 0.58 },
  ruler: { x: 0.56, y: 0.27 },
  magnifier: { x: 0.23, y: 0.68 },
  clamp: { x: 0.79, y: 0.38 },
};

export const START_ROT: Record<ToolId, number> = {
  pen: -42, knife: 38, brush: -58, ruler: -12, magnifier: 20, clamp: -8,
};

export const freshTools = (): ToolState[] =>
  TOOL_IDS.map((id) => ({
    id,
    pos: { ...START_POS[id] },
    rot: START_ROT[id],
    vis: id === "pen" ? "idle" : "hidden",
    usage: 0,
    dwellMs: 0,
    remembered: false,
    greeted: false,
    tuckedInto: null,
    drawerSlot: 0,
  }));

export const TABLE_Y = 0.15;
export const TABLE_GAP = 0.088;

export const SOCKETS: VecN[] = Array.from({ length: 6 }, (_, i) => ({
  x: 0.5 + (i - 2.5) * TABLE_GAP,
  y: TABLE_Y,
}));

export const KEY_ORDER: ToolId[] = ["ruler", "knife", "brush", "pen", "magnifier", "clamp"];
export const SOCKET_VERBS = ["measure", "cut", "mark", "write", "look", "hold"];
export const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export const ACCENT_INK: Record<ToolId, string> = {
  pen: "#9c7a3f",
  knife: "#5a6570",
  brush: "#a5664f",
  ruler: "#93793f",
  magnifier: "#4f7a72",
  clamp: "#7a6a50",
};
