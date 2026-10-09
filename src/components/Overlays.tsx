import { motion, useMotionTemplate, type MotionValue } from "framer-motion";
import type { ToolId } from "../types";
import { SUBSURFACE, TOOLS } from "../lib/tools";
import ToolShape from "./ToolShape";

interface Props {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  lx: MotionValue<number>;
  ly: MotionValue<number>;
  ls: MotionValue<number>;
  rot: MotionValue<number>;
  activeId: ToolId | null;
  hoverId: ToolId | null;
  nativeHover: boolean;
  preview: boolean;
  veiled: boolean;
}

export default function Overlays(p: Props) {
  const wideT = useMotionTemplate`translate3d(${p.lx}px, ${p.ly}px, 0) translate(-50%, -50%) scale(${p.ls})`;
  const lensMask = useMotionTemplate`radial-gradient(circle 95px at ${p.mx}px ${p.my}px, rgba(0,0,0,1) 52%, transparent 100%)`;
  const heldT = useMotionTemplate`translate3d(${p.sx}px, ${p.sy}px, 0) translate(-50%, -62%) rotate(${p.rot}deg)`;
  const ringT = useMotionTemplate`translate3d(${p.sx}px, ${p.sy}px, 0) translate(-50%, -50%)`;
  const dotT = useMotionTemplate`translate3d(${p.mx}px, ${p.my}px, 0) translate(-50%, -50%)`;
  const activeDef = p.activeId ? TOOLS[p.activeId] : null;

  const handleSecretClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if ("nativeEvent" in e && e.nativeEvent) {
      (e.nativeEvent as Event).stopImmediatePropagation?.();
      (e.nativeEvent as Event).stopPropagation?.();
    }
    if (window.location.pathname.replace(/\/+$/, "") !== "/genesiz") {
      window.history.pushState(null, "", "/genesiz");
    }
    window.dispatchEvent(new CustomEvent("open-secret"));
  };

  return (
    <>
      <motion.div
        style={{ transform: wideT, position: "fixed", left: 0, top: 0, zIndex: 24, pointerEvents: "none", mixBlendMode: "screen" }}
      >
        <div
          style={{
            position: "absolute",
            left: -310,
            top: -310,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,196,130,0.10), rgba(255,196,130,0.045) 42%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -140,
            top: -140,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,206,146,0.11), transparent 68%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -52,
            top: -52,
            width: 104,
            height: 104,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,218,168,0.13), transparent 70%)",
          }}
        />
      </motion.div>

      {p.activeId === "magnifier" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 26,
            pointerEvents: "none",
            WebkitMaskImage: lensMask,
            maskImage: lensMask,
          }}
        >
          {SUBSURFACE.map((s, i) => (
            <div
              key={i}
              className="f-mono"
              data-native={s.secret ? "true" : undefined}
              onPointerDown={(e) => {
                if (s.secret) handleSecretClick(e);
              }}
              onClick={(e) => {
                if (s.secret) handleSecretClick(e);
              }}
              style={{
                position: "absolute",
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                transform: `translate(-50%,-50%) rotate(${s.r}deg)`,
                fontSize: s.secret ? 11 : 8.5,
                padding: s.secret ? "16px 24px" : undefined,
                margin: s.secret ? "-16px -24px" : undefined,
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
                color: s.secret ? "rgba(255, 214, 160, 0.95)" : "rgba(168, 205, 198, 0.55)",
                pointerEvents: s.secret ? "auto" : "none",
                cursor: s.secret ? "pointer" : "default",
                zIndex: s.secret ? 999 : undefined,
                userSelect: "none",
              }}
            >
              {s.t}
            </div>
          ))}
          <motion.div
            style={{
              transform: dotT,
              position: "fixed",
              left: 0,
              top: 0,
              width: 190,
              height: 190,
              borderRadius: 999,
              border: "1px solid rgba(168, 205, 198, 0.30)",
              boxShadow: "inset 0 0 40px rgba(168, 205, 198, 0.05)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}

      {p.preview && activeDef && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ transform: dotT, position: "fixed", left: 0, top: 26, zIndex: 27, pointerEvents: "none" }}
        >
          <motion.div
            animate={{ scale: [0.7, 1.35], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            style={{
              width: 30,
              height: 30,
              marginLeft: -15,
              marginTop: -15,
              borderRadius: 999,
              border: `1px solid ${activeDef.color}66`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -1.5,
              top: -1.5,
              width: 3,
              height: 3,
              borderRadius: 2,
              background: `${activeDef.color}aa`,
            }}
          />
        </motion.div>
      )}

      {activeDef && (
        <motion.div style={{ transform: heldT, position: "fixed", left: 0, top: 0, zIndex: 30, pointerEvents: "none" }}>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1.08 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                marginLeft: -30,
                marginTop: -30,
                filter: "drop-shadow(0 14px 10px rgba(0,0,0,0.5))",
              }}
            >
              <ToolShape id={activeDef.id} size={60} />
            </div>
            <div
              style={{
                position: "absolute",
                left: -70,
                top: -70,
                width: 140,
                height: 140,
                borderRadius: 999,
                background: `radial-gradient(circle, ${activeDef.color}1c, transparent 66%)`,
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {activeDef && (
        <motion.div
          style={{ transform: ringT, position: "fixed", left: 0, top: 30, zIndex: 29, pointerEvents: "none" }}
        >
          <div
            style={{
              width: 54,
              height: 14,
              marginLeft: -27,
              marginTop: -7,
              borderRadius: 999,
              background: "rgba(0,0,0,0.55)",
              filter: "blur(7px)",
            }}
          />
        </motion.div>
      )}

      {!p.activeId && (
        <>
          <motion.div
            style={{
              transform: ringT,
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 40,
              pointerEvents: "none",
              opacity: p.nativeHover ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <motion.div
              animate={{
                width: p.hoverId ? 30 : 16,
                height: p.hoverId ? 30 : 16,
                opacity: p.hoverId ? 0.85 : 0.45,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{
                marginLeft: p.hoverId ? -15 : -8,
                marginTop: p.hoverId ? -15 : -8,
                borderRadius: 999,
                border: "1px solid rgba(240, 214, 170, 0.9)",
              }}
            />
          </motion.div>
          <motion.div
            style={{
              transform: dotT,
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 40,
              width: 3,
              height: 3,
              marginLeft: -1.5,
              marginTop: -1.5,
              borderRadius: 2,
              background: "rgba(244, 222, 186, 0.95)",
              pointerEvents: "none",
              opacity: p.nativeHover ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          />
        </>
      )}
    </>
  );
}
