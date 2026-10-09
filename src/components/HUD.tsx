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
      {/* Workshop info: Bottom-left */}
      <div className="absolute left-3.5 bottom-3.5 sm:left-7 sm:bottom-7 z-50 pointer-events-none max-w-[52vw] sm:max-w-none">
        <div className="f-serif italic text-sm sm:text-[17px] text-[rgba(226,213,192,0.85)] tracking-[0.02em]">
          the workshop
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={p.mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.7 }}
            className="f-mono text-[7.5px] sm:text-[9px] text-[rgba(205,178,135,0.6)] tracking-[0.2em] sm:tracking-[0.26em] uppercase mt-1 sm:mt-2 truncate"
          >
            {meta.label}
          </motion.div>
        </AnimatePresence>
        <div className="f-serif italic text-[11px] sm:text-[12.5px] text-[rgba(164,152,133,0.5)] mt-0.5 sm:mt-1 line-clamp-2">
          {meta.poem}
        </div>
        <div
          className="f-mono text-[7.5px] sm:text-[8.5px] text-[rgba(141,132,120,0.42)] tracking-[0.14em] sm:tracking-[0.18em] mt-1 sm:mt-2.5 whitespace-nowrap"
        >
          {p.found}/6 tools · {p.marks} marks · visit {p.visits}
          {p.indexOpen && !p.indexSolved ? ` · idx ${p.indexFilled}/6` : ""}
        </div>
      </div>

      {/* Hints: responsive positioning avoiding bottom edges */}
      <div className="absolute left-4 right-4 bottom-24 sm:bottom-12 md:bottom-9 z-50 pointer-events-none text-center">
        <AnimatePresence mode="wait">
          {p.hint && (
            <motion.div
              key={p.hint}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="f-serif italic text-xs sm:text-[15.5px] text-[rgba(230,216,192,0.85)] tracking-[0.02em] inline-block bg-[rgba(10,9,8,0.7)] sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none px-3.5 py-1 rounded-full max-w-[90vw]"
            >
              {p.hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls: top-right on mobile (<sm), bottom-right on desktop (sm+) */}
      <div className="absolute right-3.5 top-3.5 sm:top-auto sm:right-7 sm:bottom-7 z-50 flex flex-wrap items-center justify-end gap-2 sm:gap-5 max-w-[65vw] sm:max-w-none">
        {p.indexSolved && p.onEnterCatalogue && (
          <button
            data-native
            onClick={p.onEnterCatalogue}
            className="f-mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(226, 205, 168, 0.95)",
              background: "rgba(26, 21, 15, 0.7)",
              border: "1px solid rgba(226, 205, 168, 0.4)",
              borderRadius: 999,
              cursor: "pointer",
              padding: "5px 14px",
              boxShadow: "0 0 16px rgba(226, 205, 168, 0.15)",
              transition: "all 0.4s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffdcab";
              e.currentTarget.style.borderColor = "rgba(255, 220, 171, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(226, 205, 168, 0.95)";
              e.currentTarget.style.borderColor = "rgba(226, 205, 168, 0.4)";
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
              color: "rgba(164, 152, 133, 0.65)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              transition: "color 0.4s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226, 205, 168, 0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(164, 152, 133, 0.65)")}
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
            color: "rgba(164, 152, 133, 0.65)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 6px",
            transition: "color 0.4s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226, 205, 168, 0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(164, 152, 133, 0.65)")}
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
            color: "rgba(164, 152, 133, 0.65)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 6px",
            transition: "color 0.4s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(226, 205, 168, 0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(164, 152, 133, 0.65)")}
        >
          wipe the bench
        </button>
      </div>
    </>
  );
}
