import { motion } from "framer-motion";
import { useState } from "react";

/*
 * Not a button — a brass plate screwed into the bench.
 * Thin rules run out from it into the dark on both sides.
 */
export default function CatalogueDoor({ visits, onEnter }: { visits: number; onEnter: () => void }) {
  const [hot, setHot] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      className="absolute"
      style={{
        left: "50%",
        top: "31%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* rule, running left */}
      <motion.div
        animate={{ opacity: hot ? 0.55 : 0.22, width: hot ? 150 : 110 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(226, 205, 168, 0.9))",
          pointerEvents: "none",
        }}
      />

      <motion.button
        data-native
        onClick={onEnter}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        animate={{
          borderColor: hot ? "rgba(255, 220, 170, 0.5)" : "rgba(255, 214, 160, 0.2)",
          boxShadow: hot
            ? "0 10px 32px rgba(0,0,0,0.5), 0 0 34px rgba(255, 200, 140, 0.12), inset 0 1px 0 rgba(255, 232, 196, 0.22)"
            : "0 6px 18px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255, 232, 196, 0.10)",
          y: hot ? -2 : 0,
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "13px 26px 13px 19px",
          margin: "0 14px",
          borderRadius: 4,
          border: "1px solid rgba(255,214,160,0.2)",
          background:
            "linear-gradient(180deg, rgba(86, 68, 46, 0.5), rgba(44, 35, 25, 0.62) 55%, rgba(26, 21, 15, 0.7))",
          cursor: "pointer",
        }}
      >
        {/* corner screws */}
        {[
          { l: 6, t: 6 },
          { l: "calc(100% - 9px)", t: 6 },
          { l: 6, t: "calc(100% - 9px)" },
          { l: "calc(100% - 9px)", t: "calc(100% - 9px)" },
        ].map((s, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: s.l,
              top: s.t,
              width: 3,
              height: 3,
              borderRadius: 99,
              background: "rgba(226, 205, 168, 0.3)",
            }}
          />
        ))}

        {/* wax seal */}
        <span style={{ position: "relative", width: 22, height: 22, flex: "0 0 22px" }}>
          <motion.span
            animate={{ scale: hot ? [1, 1.7] : 1, opacity: hot ? [0.5, 0] : 0 }}
            transition={hot ? { duration: 1.8, repeat: Infinity, ease: "easeOut" } : { duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 99,
              border: "1px solid rgba(255, 206, 150, 0.7)",
            }}
          />
          <motion.span
            animate={{
              background: hot
                ? "radial-gradient(circle at 36% 32%, #ffdcab, #c98a4e 70%)"
                : "radial-gradient(circle at 36% 32%, #e0c190, #9c6f41 70%)",
            }}
            transition={{ duration: 0.45 }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 99,
              boxShadow: "inset 0 -1px 3px rgba(0,0,0,0.5), 0 0 12px rgba(255, 190, 120, 0.22)",
            }}
          />
          <span
            className="f-serif italic"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "rgba(40, 28, 16, 0.75)",
            }}
          >
            w
          </span>
        </span>

        <span style={{ textAlign: "left", lineHeight: 1.25 }}>
          <motion.span
            animate={{
              color: hot ? "rgba(255, 234, 202, 0.98)" : "rgba(226, 205, 168, 0.8)",
              letterSpacing: hot ? "0.34em" : "0.28em",
            }}
            transition={{ duration: 0.45 }}
            className="f-mono"
            style={{ display: "block", fontSize: 9, textTransform: "uppercase" }}
          >
            the catalogue
          </motion.span>
          <span
            className="f-serif italic"
            style={{ display: "block", fontSize: 12.5, color: "rgba(176, 161, 136, 0.72)", marginTop: 3 }}
          >
            issue nº {visits} — press to open
          </span>
        </span>

        <motion.span
          animate={{ x: hot ? 4 : 0, opacity: hot ? 1 : 0.45 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="f-mono"
          style={{ fontSize: 13, color: "rgba(240, 219, 184, 0.9)" }}
        >
          →
        </motion.span>
      </motion.button>

      {/* rule, running right */}
      <motion.div
        animate={{ opacity: hot ? 0.55 : 0.22, width: hot ? 150 : 110 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          height: 1,
          background: "linear-gradient(90deg, rgba(226, 205, 168, 0.9), transparent)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
