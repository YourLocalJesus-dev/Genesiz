import type { ToolId } from "../types";

export type SpecimenVariant = "card" | "row" | "strip" | "wash" | "plate" | "annotated" | "box";
export type SectionId = "order" | "specimens" | "notes" | "pattern" | "ledger";

export interface Lens {
  key: string;
  title: string; 
  blurb: string;
  paper: string;
  ink: string;
  hair: string;
  dim: string;
  accent: string;
  tint: string; 
  measure: number; 
  heroSize: number;
  heroItalic: boolean;
  variant: SpecimenVariant;
  cols: number; 
  notesCols: number;
  gap: number; 
  order: SectionId[];
  mono: boolean; 
  rails: boolean; 
  framed: boolean; 
}

const BASE: Lens = {
  key: "none",
  title: "The full catalogue",
  blurb: "Every section, in the order the bench prints them.",
  paper: "#efe7d3",
  ink: "#2e2618",
  hair: "rgba(46, 38, 24, 0.16)",
  dim: "rgba(46, 38, 24, 0.55)",
  accent: "#9c7a3f",
  tint: "transparent",
  measure: 1060,
  heroSize: 76,
  heroItalic: true,
  variant: "card",
  cols: 3,
  notesCols: 2,
  gap: 1,
  order: ["order", "specimens", "notes", "pattern", "ledger"],
  mono: false,
  rails: false,
  framed: false,
};

export const LENSES: Record<ToolId, Lens> = {
  
  pen: {
    ...BASE,
    key: "pen",
    title: "The manuscript",
    blurb: "Set as one narrow column, to be read rather than scanned.",
    paper: "#f3ece0",
    ink: "#2b2418",
    hair: "rgba(43, 36, 24, 0.14)",
    dim: "rgba(43, 36, 24, 0.5)",
    accent: "#9c7a3f",
    tint: "radial-gradient(90% 60% at 50% 0%, rgba(156,122,63,0.07), transparent 70%)",
    measure: 640,
    heroSize: 60,
    variant: "row",
    cols: 1,
    notesCols: 1,
    gap: 1.25,
    order: ["notes", "specimens", "order", "ledger", "pattern"],
  },

  knife: {
    ...BASE,
    key: "knife",
    title: "The cut",
    blurb: "Everything unnecessary removed. What is left is the record.",
    paper: "#e9e7e2",
    ink: "#15171a",
    hair: "rgba(21, 23, 26, 0.22)",
    dim: "rgba(21, 23, 26, 0.5)",
    accent: "#5a6570",
    tint: "transparent",
    measure: 980,
    heroSize: 54,
    heroItalic: false,
    variant: "strip",
    cols: 6,
    notesCols: 2,
    gap: 0.7,
    order: ["specimens", "ledger", "pattern", "order", "notes"],
    mono: true,
  },

  brush: {
    ...BASE,
    key: "brush",
    title: "The wash",
    blurb: "Loose and wide. Colour leads; the words follow.",
    paper: "#f2e8dd",
    ink: "#36281f",
    hair: "rgba(54, 40, 31, 0.14)",
    dim: "rgba(54, 40, 31, 0.5)",
    accent: "#a5664f",
    tint: "radial-gradient(70% 50% at 18% 8%, rgba(165,102,79,0.16), transparent 62%), radial-gradient(60% 46% at 86% 36%, rgba(146,122,86,0.13), transparent 64%)",
    measure: 1140,
    heroSize: 88,
    variant: "wash",
    cols: 2,
    notesCols: 2,
    gap: 1.4,
    order: ["notes", "specimens", "pattern", "order", "ledger"],
  },

  ruler: {
    ...BASE,
    key: "ruler",
    title: "The plate",
    blurb: "Everything aligned to one grid and measured against it.",
    paper: "#eceadf",
    ink: "#262a21",
    hair: "rgba(38, 42, 33, 0.18)",
    dim: "rgba(38, 42, 33, 0.52)",
    accent: "#93793f",
    tint: "transparent",
    measure: 1060,
    heroSize: 58,
    heroItalic: false,
    variant: "plate",
    cols: 3,
    notesCols: 2,
    gap: 0.9,
    order: ["order", "specimens", "pattern", "ledger", "notes"],
    mono: true,
    rails: true,
  },

  magnifier: {
    ...BASE,
    key: "magnifier",
    title: "The annotated edition",
    blurb: "Fewer entries, each one enlarged and footnoted.",
    paper: "#e8eeea",
    ink: "#1f2b28",
    hair: "rgba(31, 43, 40, 0.16)",
    dim: "rgba(31, 43, 40, 0.5)",
    accent: "#4f7a72",
    tint: "radial-gradient(60% 44% at 78% 6%, rgba(79,122,114,0.14), transparent 66%)",
    measure: 900,
    heroSize: 66,
    variant: "annotated",
    cols: 1,
    notesCols: 1,
    gap: 1.3,
    order: ["notes", "ledger", "specimens", "order", "pattern"],
  },

  clamp: {
    ...BASE,
    key: "clamp",
    title: "The compartments",
    blurb: "Each thing framed and held in its own box.",
    paper: "#ede8dc",
    ink: "#2b2a22",
    hair: "rgba(43, 42, 34, 0.2)",
    dim: "rgba(43, 42, 34, 0.5)",
    accent: "#7a6a50",
    tint: "transparent",
    measure: 1020,
    heroSize: 56,
    heroItalic: false,
    variant: "box",
    cols: 3,
    notesCols: 2,
    gap: 0.85,
    order: ["specimens", "order", "notes", "ledger", "pattern"],
    framed: true,
  },
};

export const NO_LENS = BASE;
export const lensOf = (id: ToolId | null): Lens => (id ? LENSES[id] : BASE);
