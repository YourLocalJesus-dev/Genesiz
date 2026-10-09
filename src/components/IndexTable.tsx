import { motion } from "framer-motion";
import type { ToolId } from "../types";
import { KEY_ORDER, ROMAN, SOCKETS, SOCKET_VERBS, TABLE_Y } from "../lib/tools";

interface Props {
  catalog: (ToolId | null)[];
  activeId: ToolId | null;
  solved: boolean;
}

export default function IndexTable({ catalog, activeId, solved }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 1.6, ease: "easeOut" }}
      className="absolute"
      style={{ left: 0, right: 0, top: 0, bottom: 0, zIndex: 5, pointerEvents: "none" }}
    >
      {}
      <div
        style={{
          position: "absolute",
          left: `${(SOCKETS[0].x - 0.046) * 100}%`,
          width: `${(SOCKETS[5].x - SOCKETS[0].x + 0.092) * 100}%`,
          top: `${(TABLE_Y - 0.066) * 100}%`,
          height: "12.4%",
          borderRadius: 10,
          border: "1px solid rgba(255, 214, 160, 0.05)",
          background: "rgba(255, 214, 160, 0.012)",
          boxShadow: "inset 0 1px 0 rgba(255,220,170,0.03), 0 1px 0 rgba(0,0,0,0.3)",
        }}
      />
      <div
        className="f-mono absolute"
        style={{
          left: `${(SOCKETS[0].x - 0.046) * 100}%`,
          top: `${(TABLE_Y - 0.054) * 100}%`,
          paddingLeft: 16,
          fontSize: 8,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(205, 178, 135, 0.30)",
        }}
      >
        the index
      </div>

      {SOCKETS.map((s, i) => {
        const filled = catalog[i] !== null;
        const correct = filled && catalog[i] === KEY_ORDER[i];
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              width: 54,
              height: 54,
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              className="f-mono"
              style={{
                position: "absolute",
                bottom: "calc(100% + 10px)",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 8,
                letterSpacing: "0.2em",
                color: "rgba(226, 205, 168, 0.32)",
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
                top: "calc(100% + 10px)",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 8,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: "rgba(164, 152, 133, 0.36)",
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
