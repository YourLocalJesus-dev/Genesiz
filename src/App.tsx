import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkshop } from "./state/useWorkshop";
import { RAIL_Y, SLOT_A, SLOT_B, TOOL_IDS, slotPos } from "./lib/tools";
import ToolNode from "./components/ToolNode";
import MarksLayer from "./components/MarksLayer";
import Cabinets from "./components/Cabinets";
import PathsLayer from "./components/PathsLayer";
import Overlays from "./components/Overlays";
import Hud from "./components/HUD";
import IndexTable from "./components/IndexTable";
import CatalogSite from "./components/CatalogSite";
import CatalogueDoor from "./components/CatalogueDoor";
import DustMotes from "./components/DustMotes";

export default function App() {
  const w = useWorkshop();
  const activeTool = w.tools.find((t) => t.id === w.activeId) ?? null;
  const resting = w.tools.filter((t) => !t.tuckedInto || activeTool?.id === t.id);

  const [secretOpen, setSecretOpen] = useState(false);
  useEffect(() => {
    const handle = () => setSecretOpen(true);
    window.addEventListener("open-secret", handle);
    return () => window.removeEventListener("open-secret", handle);
  }, []);

  if (secretOpen) {
    return (
      <div className="fixed inset-0 select-none" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0908", color: "#e2d5c1", zIndex: 9999 }}>
        <div className="f-serif italic" style={{ fontSize: 220, lineHeight: 1, textShadow: "0 0 40px rgba(226, 213, 193, 0.2)" }}>G</div>
        <div className="f-mono" style={{ fontSize: 14, letterSpacing: "0.4em", textTransform: "uppercase", marginTop: 40, color: "rgba(226, 213, 193, 0.5)" }}>yay the mods found it</div>
        <button
          className="f-mono"
          data-native
          onPointerDown={(e) => {
            e.stopPropagation();
            setSecretOpen(false);
          }}
          style={{ marginTop: 80, padding: "12px 24px", border: "1px solid rgba(226, 213, 193, 0.3)", borderRadius: 999, background: "none", color: "inherit", cursor: "pointer", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          return to bench
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: "#0a0908", cursor: "none", touchAction: "none" }}
    >
      {/* the bench itself */}
      <div className="bench-surface" style={{ zIndex: 0 }} />

      {/* assembly rail */}
      {w.assemblyLike && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6 }}
          className="rail-line"
          style={{
            left: `${SLOT_A * 100 - 3}%`,
            width: `${(SLOT_B - SLOT_A) * 100 + 6}%`,
            top: `${RAIL_Y * 100}%`,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {TOOL_IDS.map((_, i) => {
            const p = slotPos(i, TOOL_IDS.length);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${((p.x - SLOT_A + 0.03) / (SLOT_B - SLOT_A + 0.06)) * 100}%`,
                  top: -2.5,
                  width: 1,
                  height: 6,
                  background: "rgba(210, 185, 145, 0.28)",
                }}
              />
            );
          })}
        </motion.div>
      )}

      {/* glowing paths between tools */}
      {w.scatteredLike && <PathsLayer edges={w.edges} tools={w.tools} hoverId={w.hoverId} />}

      {/* the index — six sockets, one old order */}
      <AnimatePresence>
        {w.tableOpen && w.view === "bench" && (
          <IndexTable catalog={w.catalog} activeId={w.activeId} solved={w.solved} />
        )}
      </AnimatePresence>

      {/* everything you've made so far */}
      <MarksLayer marks={w.marks} vw={w.vw} vh={w.vh} />

      {/* drawers & compartments */}
      {w.drawersLike && (
        <Cabinets
          foci={w.focused}
          tools={w.tools}
          open={w.openCab}
          activeId={w.activeId}
          hoverId={w.hoverId}
        />
      )}

      {/* sockets — where the held tool lives */}
      {activeTool && (
        <div
          className="tool-pos"
          style={{
            left: `${activeTool.pos.x * 100}%`,
            top: `${activeTool.pos.y * 100}%`,
            zIndex: 9,
            pointerEvents: "none",
          }}
        >
          <div style={{ transform: "translate(-50%, -50%)", width: 46, height: 46 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: 46,
                height: 46,
                borderRadius: 8,
                border: "1px dashed rgba(226, 205, 168, 0.16)",
              }}
            />
          </div>
        </div>
      )}

      {/* resting tools */}
      <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: "none" }}>
        {resting.map((t) => (
          <ToolNode
            key={t.id}
            t={t}
            hover={w.hoverId === t.id && w.activeId !== t.id}
            suppressed={w.activeId === t.id}
            left={`${t.pos.x * 100}%`}
            top={`${t.pos.y * 100}%`}
            release={w.releases[t.id] ?? null}
          />
        ))}
      </div>

      {/* light, lens, hand, cursor */}
      <Overlays
        mx={w.mv.mx}
        my={w.mv.my}
        sx={w.mv.sx}
        sy={w.mv.sy}
        lx={w.mv.lx}
        ly={w.mv.ly}
        ls={w.mv.ls}
        rot={w.mv.rot}
        activeId={w.activeId}
        hoverId={w.hoverId}
        nativeHover={w.nativeHover}
        preview={w.preview}
        veiled={w.veiled}
      />

      {/* dust in the air */}
      <DustMotes />

      {/* the bench rests when you do */}
      <motion.div
        animate={{ opacity: w.idle && w.view === "bench" ? 1 : 0 }}
        transition={{ duration: 2.4, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          zIndex: 41,
          pointerEvents: "none",
          background: "radial-gradient(120% 95% at 50% 46%, transparent 24%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* atmosphere above everything */}
      <div className="vignette" style={{ zIndex: 42 }} />
      <div className="grain" style={{ zIndex: 43 }} />

      {/* solved — the door to the catalogue */}
      <AnimatePresence>
        {w.solved && w.view === "bench" && !w.veiled && (
          <CatalogueDoor key="catalogue-door" visits={w.visits} onEnter={w.enterSite} />
        )}
      </AnimatePresence>

      <Hud
        mode={w.mode}
        visits={w.visits}
        found={w.found}
        marks={w.marks.length}
        hint={w.hint}
        muted={w.muted}
        onToggleMute={w.toggleMute}
        onReset={w.resetBench}
        indexOpen={w.tableOpen}
        indexFilled={w.indexFilled}
        indexSolved={w.solved}
      />

      {/* the catalogue — an entirely other website, issued by the bench */}
      <AnimatePresence>
        {w.view === "site" && (
          <CatalogSite
            key="catalogue"
            tools={w.tools}
            marks={w.marks}
            visits={w.visits}
            mode={w.mode}
            getSignals={w.getSignals}
            onReturn={w.exitSite}
            onLens={w.sampleTool}
          />
        )}
      </AnimatePresence>

      {/* the first breath */}
      <AnimatePresence>
        {w.veiled && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.6, ease: "easeInOut" } }}
            className="absolute inset-0"
            style={{ zIndex: 60, background: "rgba(7, 6, 5, 0.96)", pointerEvents: "none" }}
          >
            <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
                className="f-serif italic"
                style={{ fontSize: 40, color: "rgba(232, 219, 197, 0.92)", letterSpacing: "0.01em" }}
              >
                the workshop
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 1.4 }}
                className="f-mono"
                style={{
                  fontSize: 9.5,
                  color: "rgba(164, 152, 133, 0.6)",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  marginTop: 16,
                }}
              >
                a quiet bench that arranges itself around how you work
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.75, 0.3, 0.75] }}
                transition={{ duration: 3.6, delay: 2.6, repeat: Infinity, repeatType: "mirror" }}
                className="f-serif italic"
                style={{ fontSize: 14, color: "rgba(205, 178, 135, 0.7)", marginTop: 34 }}
              >
                move, to begin
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
