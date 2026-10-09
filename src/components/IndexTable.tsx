import { motion } from "framer-motion";
import type { ToolId } from "../types";
import { KEY_ORDER, ROMAN, SOCKETS, SOCKET_VERBS, TABLE_Y } from "../lib/tools";

interface Props {
  catalog: (ToolId | null)[];
  activeId: ToolId | null;
  solved: boolean;
  sockets?: { x: number; y: number }[];
}

export default function IndexTable({ catalog, activeId, solved, sockets = SOCKETS }: Props) {
  const first = sockets[0] ?? { x: 0.28, y: TABLE_Y };
  const last = sockets[5] ?? { x: 0.72, y: TABLE_Y };
  const pad = 0.046;

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 1.6, ease: "easeOut" }}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <div
        style={{
          position: "absolute",
          left: `${Math.max(1, (first.x - pad) * 100)}%`,
          width: `${Math.min(98, (last.x - first.x + pad * 2) * 100)}%`,
          top: `${(TABLE_Y - 0.062) * 100}%`,
          height: "12.8%",
          minHeight: 68,
          borderRadius: 10,
          border: "1px solid rgba(255, 214, 160, 0.05)",
          background: "rgba(255, 214, 160, 0.012)",
          boxShadow: "inset 0 1px 0 rgba(255,220,170,0.03), 0 1px 0 rgba(0,0,0,0.3)",
        }}
      />
      <div
        className="f-mono absolute"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          top: `calc(${TABLE_Y * 100}% - clamp(32px, 5.5vh, 42px))`,
          fontSize: "clamp(7px, 1.8vw, 8.5px)",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(205, 178, 135, 0.35)",
          whiteSpace: "nowrap",
        }}
      >
        the index
      </div>

      {sockets.map((s, i) => {
        const filled = catalog[i] !== null;
        const correct = filled && catalog[i] === KEY_ORDER[i];
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              width: "clamp(36px, 8.5vw, 54px)",
              height: "clamp(36px, 8.5vw, 54px)",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="f-mono"
              style={{
                position: "absolute",
                bottom: "calc(100% + clamp(4px, 1.2vw, 9px))",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "clamp(6.5px, 1.6vw, 8px)",
                letterSpacing: "0.2em",
                color: "rgba(226, 205, 168, 0.35)",
              }}
            >
              {ROMAN[i]}
            </div>
            <motion.div
              animate={{
                borderColor: filled
                  ? "rgba(255, 214, 160, 0.36)"
                  : activeId
                    ? "rgba(255, 214, 160, 0.22)"
                    : "rgba(255, 214, 160, 0.10)",
                boxShadow:
                  correct && solved
                    ? "0 0 24px rgba(255, 214, 160, 0.15), inset 0 0 14px rgba(255, 214, 160, 0.06)"
                    : "inset 0 0 10px rgba(0, 0, 0, 0.38)",
                scale: activeId && !filled ? 1.05 : 1,
              }}
              transition={{ duration: 0.6 }}
              style={{ width: "100%", height: "100%", borderRadius: 10, border: "1px solid rgba(255,214,160,0.10)" }}
            />
            <div
              className="f-mono"
              style={{
                position: "absolute",
                top: "calc(100% + clamp(4px, 1.2vw, 9px))",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "clamp(6.5px, 1.6vw, 8px)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: "rgba(164, 152, 133, 0.38)",
              }}
            >
              {SOCKET_VERBS[i]}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
