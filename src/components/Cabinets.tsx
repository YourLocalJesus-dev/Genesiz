import { motion } from "framer-motion";
import type { ToolId, ToolState } from "../types";
import { CAB_W, DRAWER_H, SLAB_H, TOOLS, drawerSlotOffset } from "../lib/tools";
import ToolNode from "./ToolNode";

interface Props {
  foci: ToolId[];
  tools: ToolState[];
  open: ToolId | null;
  activeId: ToolId | null;
  hoverId: ToolId | null;
}

export default function Cabinets({ foci, tools, open, activeId, hoverId }: Props) {
  return (
    <>
      {foci.map((focus) => {
        const seat = tools.find((t) => t.id === focus);
        if (!seat) return null;
        const tucked = tools.filter((t) => t.tuckedInto === focus);
        const isOpen = open === focus;
        const def = TOOLS[focus];
        return (
          <div
            key={focus}
            className="tool-pos"
            style={{
              left: `${seat.pos.x * 100}%`,
              top: `${seat.pos.y * 100}%`,
              width: CAB_W,
              transform: `translate(-50%, ${-SLAB_H / 2}px)`,
              zIndex: 4,
              pointerEvents: "none",
            }}
          >
            
            <div
              style={{
                position: "relative",
                height: SLAB_H,
                borderRadius: 7,
                background:
                  "linear-gradient(180deg, rgba(64,50,36,0.55), rgba(30,24,18,0.7) 60%, rgba(16,13,10,0.85))",
                border: "1px solid rgba(255, 214, 160, 0.10)",
                boxShadow:
                  "0 18px 34px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,220,170,0.08)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: 5,
                  border: "1px solid rgba(255, 214, 160, 0.05)",
                }}
              />
              
              <div
                className="f-mono"
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 6,
                  fontSize: 8,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "rgba(226, 205, 168, 0.34)",
                }}
              >
                {def.name.replace("the ", "")} · kept here
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  width: 26,
                  height: 1,
                  background: "rgba(226, 205, 168, 0.14)",
                }}
              />
            </div>
            
            <motion.div
              animate={{ height: isOpen ? DRAWER_H + 10 : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 17 }}
              style={{ overflow: "visible", position: "relative", marginTop: 3, marginLeft: 14, marginRight: 14 }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: DRAWER_H,
                  borderRadius: "0 0 6px 6px",
                  background: "linear-gradient(180deg, rgba(12,10,8,0.92), rgba(22,18,14,0.9))",
                  border: "1px solid rgba(255, 214, 160, 0.08)",
                  borderTop: "none",
                  boxShadow: "inset 0 8px 16px rgba(0,0,0,0.6), 0 14px 26px rgba(0,0,0,0.45)",
                }}
              />
              
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: DRAWER_H - 9,
                  transform: "translateX(-50%)",
                  width: 30,
                  height: 3,
                  borderRadius: 2,
                  background: "rgba(205, 178, 135, 0.4)",
                }}
              />
              {tucked.map((t) => (
                <ToolNode
                  key={t.id}
                  t={t}
                  small
                  hover={hoverId === t.id && activeId !== t.id}
                  suppressed={activeId === t.id}
                  left={`${CAB_W / 2 - 14 + drawerSlotOffset(t.drawerSlot)}px`}
                  top={`${DRAWER_H / 2 - 4}px`}
                  release={null}
                />
              ))}
              {tucked.length === 0 && (
                <div
                  className="f-serif italic"
                  style={{
                    position: "absolute",
                    top: 22,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 12,
                    color: "rgba(180, 165, 140, 0.3)",
                  }}
                >
                  empty, for now
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </>
  );
}
