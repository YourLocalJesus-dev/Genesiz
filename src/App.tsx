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
import ReadmeModal from "./components/ReadmeModal";

export default function App() {
  const w = useWorkshop();
  const activeTool = w.tools.find((t) => t.id === w.activeId) ?? null;
  const resting = w.tools.filter((t) => !t.tuckedInto || activeTool?.id === t.id);

  const [secretOpen, setSecretOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);

  useEffect(() => {
    const syncRoute = () => {
      const p = window.location.pathname.replace(/\/+$/, "");
      if (p === "/genesiz" || window.location.hash === "#genesiz") {
        setSecretOpen(true);
      }
    };
    syncRoute();
    const handle = () => {
      setSecretOpen(true);
      if (window.location.pathname.replace(/\/+$/, "") !== "/genesiz") {
        window.history.pushState(null, "", "/genesiz");
      }
    };
    window.addEventListener("open-secret", handle);
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("open-secret", handle);
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && readmeOpen) {
        setReadmeOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [readmeOpen]);

  const closeSecret = () => {
    setSecretOpen(false);
    if (window.location.pathname.replace(/\/+$/, "") === "/genesiz") {
      window.history.pushState(null, "", "/");
    }
  };

  if (secretOpen) {
    return (
      <div className="fixed inset-0 select-none px-6" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0908", color: "#e2d5c1", zIndex: 9999 }}>
        <div className="f-serif italic" style={{ fontSize: "clamp(100px, 25vw, 220px)", lineHeight: 1, textShadow: "0 0 40px rgba(226, 213, 193, 0.2)" }}>G</div>
        <div className="f-mono text-center" style={{ fontSize: "clamp(10px, 2.5vw, 14px)", letterSpacing: "clamp(0.2em, 0.5vw, 0.4em)", textTransform: "uppercase", marginTop: "clamp(20px, 4vh, 40px)", color: "rgba(226, 213, 193, 0.5)" }}>yay the mods found it</div>
        <button
          className="f-mono"
          data-native
          onPointerDown={(e) => {
            e.stopPropagation();
            closeSecret();
          }}
          onClick={(e) => {
            e.stopPropagation();
            closeSecret();
          }}
          style={{ marginTop: "clamp(40px, 8vh, 80px)", padding: "12px 24px", border: "1px solid rgba(226, 213, 193, 0.3)", borderRadius: 999, background: "none", color: "inherit", cursor: "pointer", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}
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
      <div className="bench-surface" style={{ zIndex: 0 }} />

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

      {w.scatteredLike && !w.solved && <PathsLayer edges={w.edges} tools={w.tools} hoverId={w.hoverId} />}

      <AnimatePresence>
        {w.tableOpen && w.view === "bench" && (
          <IndexTable catalog={w.catalog} activeId={w.activeId} solved={w.solved} sockets={w.sockets} />
        )}
      </AnimatePresence>

      <MarksLayer marks={w.marks} vw={w.vw} vh={w.vh} />

      {w.drawersLike && (
        <Cabinets
          foci={w.focused}
          tools={w.tools}
          open={w.openCab}
          activeId={w.activeId}
          hoverId={w.hoverId}
        />
      )}

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

      <DustMotes />

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

      <div className="vignette" style={{ zIndex: 42 }} />
      <div className="grain" style={{ zIndex: 43 }} />

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
        onEnterCatalogue={w.enterSite}
        onOpenReadme={() => setReadmeOpen(true)}
      />

      <AnimatePresence>
        {readmeOpen && <ReadmeModal onClose={() => setReadmeOpen(false)} />}
      </AnimatePresence>

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

      <AnimatePresence>
        {w.veiled && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
            className="absolute inset-0 cursor-pointer"
            style={{ zIndex: 60, background: "rgba(7, 6, 5, 0.94)" }}
            onClick={w.unveil}
            onPointerDown={w.unveil}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-4 w-full max-w-lg select-none">
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="f-serif italic text-3xl sm:text-[40px] text-[rgba(232,219,197,0.92)] tracking-[0.01em]"
              >
                the workshop
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="f-mono text-[9px] sm:text-[9.5px] text-[rgba(164,152,133,0.6)] tracking-[0.25em] sm:tracking-[0.3em] uppercase mt-3 sm:mt-4"
              >
                a quiet bench that arranges itself around how you work
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.85, 0.35, 0.85] }}
                transition={{ duration: 2.8, delay: 0.8, repeat: Infinity, repeatType: "mirror" }}
                className="f-serif italic text-sm text-[rgba(205,178,135,0.7)] mt-6 sm:mt-8"
              >
                move or tap, to begin
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
