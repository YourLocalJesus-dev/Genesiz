import { AnimatePresence, motion } from "framer-motion";
import type { Mode } from "../types";
import { MODE_META } from "../lib/tools";

interface Props {
  mode: Mode;
  visits: number;
  found: number;
  marks: number;
  hint: string | null;
  muted: boolean;
  onToggleMute: () => void;
  onReset: () => void;
  indexOpen: boolean;
  indexFilled: number;
  indexSolved: boolean;
  onEnterCatalogue?: () => void;
  onOpenReadme?: () => void;
}

export default function Hud(p: Props) {
  const meta = MODE_META[p.mode];
  return (
    <>
      <div className="absolute left-7 bottom-7 z-50" style={{ pointerEvents: "none" }}>
        <div className="f-serif italic" style={{ fontSize: 17, color: "rgba(226, 213, 192, 0.85)", letterSpacing: "0.02em" }}>
          the workshop
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={p.mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.7 }}
            className="f-mono"
            style={{ fontSize: 9, color: "rgba(205, 178, 135, 0.6)", letterSpacing: "0.26em", textTransform: "uppercase", marginTop: 9 }}
          >
            {meta.label}
          </motion.div>
        </AnimatePresence>
        <div className="f-serif italic" style={{ fontSize: 12.5, color: "rgba(164, 152, 133, 0.5)", marginTop: 4 }}>
          {meta.poem}
        </div>
        <div
          className="f-mono"
          style={{ fontSize: 8.5, color: "rgba(141, 132, 120, 0.42)", letterSpacing: "0.18em", marginTop: 10 }}
        >
          {p.found}/6 tools · {p.marks} marks · visit {p.visits}
          {p.indexOpen && !p.indexSolved ? ` · index ${p.indexFilled}/6` : ""}
        </div>
      </div>

      <div className="absolute left-0 right-0 bottom-9 z-50" style={{ pointerEvents: "none", textAlign: "center" }}>
        <AnimatePresence mode="wait">
          {p.hint && (
            <motion.div
              key={p.hint}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="f-serif italic"
              style={{ fontSize: 15.5, color: "rgba(230, 216, 192, 0.72)", letterSpacing: "0.02em" }}
            >
              {p.hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute right-7 bottom-7 z-50 flex items-center gap-5">
        {p.indexSolved && p.onEnterCatalogue && (
          <button
            data-native
            onClick={p.onEnterCatalogue}
            className="f-mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(226, 205, 168, 0.9)",
              background: "none",
              border: "1px solid rgba(226, 205, 168, 0.35)",
              borderRadius: 999,
              cursor: "pointer",
              padding: "4px 12px",
              transition: "all 0.4s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffdcab";
              e.currentTarget.style.borderColor = "rgba(255, 220, 171, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(226, 205, 168, 0.9)";
              e.currentTarget.style.borderColor = "rgba(226, 205, 168, 0.35)";
            }}
          >
            the catalogue →
          </button>
        )}
        {p.onOpenReadme && (
          <button
            data-native
            onClick={p.onOpenReadme}
            className="f-mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(164, 152, 133, 0.55)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              transition: "color 0.4s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226, 205, 168, 0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(164, 152, 133, 0.55)")}
          >
            readme.md
          </button>
        )}
        <button
          data-native
          onClick={p.onToggleMute}
          className="f-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(164, 152, 133, 0.55)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            transition: "color 0.4s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226, 205, 168, 0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(164, 152, 133, 0.55)")}
        >
          sound · {p.muted ? "off" : "on"}
        </button>
        <button
          data-native
          onClick={p.onReset}
          className="f-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(164, 152, 133, 0.55)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            transition: "color 0.4s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226, 205, 168, 0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(164, 152, 133, 0.55)")}
        >
          wipe the bench
        </button>
      </div>
    </>
  );
}
