export type ToolId = "pen" | "knife" | "brush" | "ruler" | "magnifier" | "clamp";

export type Paradigm = "empty" | "assembly" | "scattered" | "drawers";
export type Mode = Paradigm | "remembered";

export type Visibility = "hidden" | "ghost" | "idle";

export interface VecN {
  x: number; // normalized 0..1
  y: number;
}

export interface ToolState {
  id: ToolId;
  pos: VecN;
  rot: number; // resting rotation, degrees
  vis: Visibility;
  usage: number;
  dwellMs: number;
  remembered: boolean; // arrived from a previous visit
  greeted: boolean; // recognition chime already played this session
  tuckedInto: ToolId | null; // drawers mode: which cabinet holds it
  drawerSlot: number; // slot index inside the drawer
}

export interface Mark {
  id: number;
  type: ToolId;
  x: number; // normalized
  y: number;
  rot: number; // degrees
  idx: number; // content index
  w: number; // optional size (ruler width, brush blob)
  born: number; // timestamp ms
}

export interface Release {
  k: number;
  dx: number;
  dy: number;
}
