import { motion } from "framer-motion";
import type { Release, ToolState } from "../types";
import { TOOLS } from "../lib/tools";
import ToolShape from "./ToolShape";

interface Props {
  t: ToolState;
  hover: boolean;
  suppressed: boolean; 
  small?: boolean; 
  left: string;
  top: string;
  release: Release | null;
}

export default function ToolNode({ t, hover, suppressed, small, left, top, release }: Props) {
  const def = TOOLS[t.id];
  const ghost = t.vis === "ghost";
  const targetOpacity = suppressed ? 0 : t.vis === "hidden" ? 0 : ghost ? 0.17 : 1;
  const box = small ? 40 : 48;

  return (
    <div
      className={small ? "absolute" : "tool-pos"}
      style={{
        left,
        top,
        width: 0,
        height: 0,
        zIndex: ghost ? 1 : 2,
        pointerEvents: "none",
      }}
    >
      {}
      <motion.div
        key={release ? release.k : 0}
        initial={release ? { x: release.dx, y: release.dy, scale: 1.06 } : false}
        animate={{ x: 0, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 105, damping: 15, mass: 0.9 }}
      >
        {}
        <div style={{ width: box, height: box, transform: "translate(-50%, -50%)", position: "relative" }}>
          {}
          <div style={{ position: "absolute", left: "50%", top: "100%", transform: "translate(-50%, -2px)" }}>
            <motion.div
              animate={{
                opacity: ghost || suppressed ? 0 : hover ? 0.55 : 0.3,
                scale: hover ? 1.35 : 1,
              }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              style={{
                width: 40,
                height: 11,
                borderRadius: 999,
                background: "rgba(0,0,0,0.75)",
                filter: "blur(5px)",
              }}
            />
          </div>

          {}
          <motion.div
            className="halo"
            animate={{ opacity: hover && !ghost ? 1 : 0, scale: hover ? 1.15 : 0.85 }}
            transition={{ duration: 0.5 }}
          />

          {}
          <motion.div
            animate={{
              opacity: targetOpacity,
              y: hover && !ghost ? -9 : 0,
              scale: hover && !ghost ? 1.07 : 1,
              rotate: t.rot,
              filter: ghost ? "blur(1.6px)" : "blur(0px)",
            }}
            transition={{ type: "spring", stiffness: 170, damping: 17 }}
            style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <div
              className={!hover && !ghost && !suppressed && !small ? "breathe" : undefined}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ToolShape id={t.id} size={small ? 34 : 42} />
            </div>
          </motion.div>

          {}
          <div
            className="absolute"
            style={{ top: box + 4, left: "50%", transform: "translateX(-50%)", width: 190, textAlign: "center" }}
          >
            <motion.div
              animate={{ opacity: hover && !ghost && !suppressed ? 1 : 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="f-serif italic" style={{ fontSize: 14, color: "#e2d6c1", letterSpacing: "0.02em" }}>
                {def.name}
              </div>
              <div
                className="f-mono"
                style={{
                  fontSize: 8,
                  color: "#7d7466",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                {def.desc}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
