export type ToolId = "pen" | "knife" | "brush" | "ruler" | "magnifier" | "clamp";

export type Paradigm = "empty" | "assembly" | "scattered" | "drawers";
export type Mode = Paradigm | "remembered";

export type Visibility = "hidden" | "ghost" | "idle";

export interface VecN {
  x: number; 
  y: number;
}

export interface ToolState {
  id: ToolId;
  pos: VecN;
  rot: number; 
  vis: Visibility;
  usage: number;
  dwellMs: number;
  remembered: boolean; 
  greeted: boolean; 
  tuckedInto: ToolId | null; 
  drawerSlot: number; 
}

export interface Mark {
  id: number;
  type: ToolId;
  x: number; 
  y: number;
  rot: number; 
  idx: number; 
  w: number; 
  born: number; 
}

export interface Release {
  k: number;
  dx: number;
  dy: number;
}
