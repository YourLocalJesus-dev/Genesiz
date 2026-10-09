import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Mark, Mode, ToolId, ToolState } from "../types";
import {
  BRUSH_COLORS,
  GLASS_DETAILS,
  KEY_ORDER,
  KNIFE_WORDS,
  MODE_META,
  PEN_LINES,
  ROMAN,
  SOCKET_VERBS,
  TOOLS,
  TOOL_IDS,
} from "../lib/tools";
import { lensOf, type Lens, type SectionId } from "../lib/lenses";
import ToolShape from "./ToolShape";

export interface Signals {
  scores: Record<"assembly" | "scattered" | "drawers", number>;
  dwell: Record<ToolId, number>;
  events: number;
  order: ToolId[];
  edges: Record<string, number>;
}

interface Props {
  tools: ToolState[];
  marks: Mark[];
  visits: number;
  mode: Mode;
  getSignals: () => Signals;
  onReturn: () => void;
  onLens: (id: ToolId | null) => void;
}

export default function CatalogSite({ tools, marks, visits, mode, getSignals, onReturn, onLens }: Props) {
  const sig = useMemo(getSignals, [getSignals]);
  const [lensId, setLensId] = useState<ToolId | null>(null);
  const L = lensOf(lensId);

  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const body = L.mono ? "f-mono" : "f-serif";

  const pick = (id: ToolId) => {
    const next = lensId === id ? null : id;
    setLensId(next);
    onLens(next);
    document.getElementById("cat-container")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const penLines = marks.filter((m) => m.type === "pen").map((m) => PEN_LINES[m.idx % PEN_LINES.length]);
  const knifeWords = marks.filter((m) => m.type === "knife").map((m) => KNIFE_WORDS[m.idx % KNIFE_WORDS.length]);
  const glassNotes = marks.filter((m) => m.type === "magnifier").map((m) => GLASS_DETAILS[m.idx % GLASS_DETAILS.length]);
  const measures = marks.filter((m) => m.type === "ruler").map((m) => Math.round(m.w * 1.4));
  const washes = marks.filter((m) => m.type === "brush").map((m) => BRUSH_COLORS[m.idx % BRUSH_COLORS.length]);
  const held = marks.filter((m) => m.type === "clamp").length;

  const usageOf = (id: ToolId) => tools.find((t) => t.id === id)?.usage ?? 0;
  const marksOf = (id: ToolId) => marks.filter((m) => m.type === id).length;
  const dwellOf = (id: ToolId) => Math.round((sig.dwell[id] ?? 0) / 1000);
  const maxDwell = Math.max(1, ...TOOL_IDS.map(dwellOf));
  const maxScore = Math.max(1, ...Object.values(sig.scores));

  const detailOf = (m: Mark): string => {
    switch (m.type) {
      case "pen": return `“${PEN_LINES[m.idx % PEN_LINES.length]}”`;
      case "knife": return `cut — “${KNIFE_WORDS[m.idx % KNIFE_WORDS.length]}”`;
      case "brush": return `wash ${BRUSH_COLORS[m.idx % BRUSH_COLORS.length]}`;
      case "ruler": return `${Math.round(m.w * 1.4)} mm`;
      case "magnifier": return GLASS_DETAILS[m.idx % GLASS_DETAILS.length];
      case "clamp": return "fixture set";
    }
  };

  const ledgerSource = lensId ? marks.filter((m) => m.type === lensId) : marks;
  const ledger = [...ledgerSource].reverse().slice(0, L.variant === "annotated" ? 8 : 18);
  const routes = Object.entries(sig.edges)
    .filter(([k]) => (lensId ? k.split("|").includes(lensId) : true))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const S = (n: number) => Math.round(n * L.gap);

  const SectionOrder = (
    <Section key="order" id="cat-order" n="The order" L={L}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${L.variant === "row" || L.variant === "annotated" ? 3 : 6}, 1fr)`, gap: 1, background: L.hair, border: `1px solid ${L.hair}` }}>
        {KEY_ORDER.map((id, i) => (
          <div key={id} style={{ background: L.paper, padding: "20px 12px", textAlign: "center" }}>
            <div className="f-mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: L.dim }}>{ROMAN[i]}</div>
            <div style={{ display: "flex", justifyContent: "center", margin: "14px 0 10px" }}>
              <ToolShape id={id} size={34} ink />
            </div>
            <div className={L.mono ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 11 : 17, letterSpacing: L.mono ? "0.14em" : undefined, textTransform: L.mono ? "uppercase" : "none" }}>
              {SOCKET_VERBS[i]}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  const SectionSpecimens = (
    <Section
      key="specimens"
      id="cat-specimens"
      n="Specimens"
      L={L}
      aside={
        <span className="f-mono" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: L.dim }}>
          {lensId ? "click again to release" : "click one to re-set this catalogue"}
        </span>
      }
    >
      <motion.div
        layout
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${L.cols}, 1fr)`,
          gap: L.framed || L.variant === "wash" ? 14 : 1,
          background: L.framed || L.variant === "wash" ? "transparent" : L.hair,
          border: L.framed || L.variant === "wash" ? "none" : `1px solid ${L.hair}`,
        }}
      >
        {TOOL_IDS.map((id, i) => (
          <SpecimenCell
            key={id}
            id={id}
            i={i}
            L={L}
            selected={lensId === id}
            onPick={() => pick(id)}
            usage={usageOf(id)}
            marks={marksOf(id)}
            dwell={dwellOf(id)}
          />
        ))}
      </motion.div>
    </Section>
  );

  const SectionNotes = (
    <Section key="notes" id="cat-notes" n="Field notes" L={L}>
      <div className="cat-two" style={{ display: "grid", gridTemplateColumns: `repeat(${L.notesCols}, 1fr)`, gap: S(48) }}>
        <div>
          {(!lensId || lensId === "pen") && (
            <>
              <NoteHead n="i" title="written in passing" L={L} />
              {penLines.length === 0 && <Empty L={L} />}
              {penLines.map((l, i) => (
                <div key={i} className={body === "f-mono" ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 12 : 20, lineHeight: 1.7, display: "flex", gap: 14 }}>
                  <span className="f-mono" style={{ fontSize: 9, color: L.dim, marginTop: 7 }}>{String(i + 1).padStart(2, "0")}</span>
                  {l}
                </div>
              ))}
              <div style={{ height: S(30) }} />
            </>
          )}
          {(!lensId || lensId === "knife") && (
            <>
              <NoteHead n="ii" title="beneath the cuts" L={L} />
              {knifeWords.length === 0 && <Empty L={L} />}
              {knifeWords.length > 0 && (
                <p className={body} style={{ fontSize: L.mono ? 13 : 21, lineHeight: 1.7 }}>
                  {knifeWords.join(" · ")}
                  <span style={{ color: L.dim }}>{knifeWords.length < 7 ? " …" : ""}</span>
                </p>
              )}
              <div style={{ height: S(30) }} />
            </>
          )}
          {(!lensId || lensId === "clamp") && (
            <>
              <NoteHead n="iii" title="held fast" L={L} />
              <p className={body} style={{ fontSize: L.mono ? 12 : 19, lineHeight: 1.7 }}>
                {held === 0 ? "nothing is being held. everything here may still drift." : `${held} fixture${held > 1 ? "s" : ""} set. The marks near them will not fade.`}
              </p>
            </>
          )}
        </div>
        <div>
          {(!lensId || lensId === "magnifier") && (
            <>
              <NoteHead n="iv" title="seen through the glass" L={L} />
              {glassNotes.length === 0 && <Empty L={L} />}
              {glassNotes.map((g, i) => (
                <div key={i} className="f-mono" style={{ fontSize: 11, lineHeight: 2.3, letterSpacing: "0.06em", display: "flex", gap: 12 }}>
                  <span style={{ color: L.accent }}>†</span>
                  {g}
                </div>
              ))}
              {lensId === "magnifier" && (
                <div className="f-mono" style={{ fontSize: 11, lineHeight: 2.3, letterSpacing: "0.06em", display: "flex", gap: 12 }}>
                  <span style={{ color: L.accent }}>†</span>
                  <button
                    data-native
                    onClick={() => {
                      if (window.location.pathname.replace(/\/+$/, "") !== "/genesiz") {
                        window.history.pushState(null, "", "/genesiz");
                      }
                      window.dispatchEvent(new CustomEvent("open-secret"));
                    }}
                    style={{ background: "none", border: "none", padding: 0, color: L.accent, cursor: "pointer", font: "inherit", opacity: 0.8 }}
                  >
                    /genesiz
                  </button>
                </div>
              )}
              <div style={{ height: S(30) }} />
            </>
          )}
          {(!lensId || lensId === "ruler") && (
            <>
              <NoteHead n="v" title="measured" L={L} />
              {measures.length === 0 && <Empty L={L} />}
              {measures.length > 0 && (
                <div className="f-mono" style={{ fontSize: 11, lineHeight: 2.3, letterSpacing: "0.08em" }}>
                  {measures.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${L.hair}` }}>
                      <span style={{ color: L.dim }}>measure {String(i + 1).padStart(2, "0")}</span>
                      <span>{m} mm</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ height: S(30) }} />
            </>
          )}
          {(!lensId || lensId === "brush") && (
            <>
              <NoteHead n="vi" title="pigments" L={L} />
              {washes.length === 0 && <Empty L={L} />}
              {washes.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {washes.map((c, i) => (
                    <div key={i} title={c} style={{ width: L.variant === "wash" ? 54 : 34, height: L.variant === "wash" ? 54 : 34, borderRadius: "46% 54% 58% 42% / 52% 44% 56% 48%", background: `radial-gradient(ellipse at 42% 46%, ${c}, ${c}bb)`, border: `1px solid ${L.hair}` }} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  );

  const SectionPattern = (
    <Section key="pattern" id="cat-pattern" n="Working pattern" L={L}>
      <div className="cat-two" style={{ display: "grid", gridTemplateColumns: `repeat(${L.notesCols}, 1fr)`, gap: S(48) }}>
        <div>
          <NoteHead n="i" title="what the bench scored" L={L} />
          {(Object.keys(sig.scores) as (keyof typeof sig.scores)[]).map((k) => {
            const v = sig.scores[k];
            const lead = v === maxScore && v > 0;
            return (
              <div key={k} style={{ marginBottom: 16 }}>
                <div className="f-mono" style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: lead ? L.ink : L.dim }}>{k}{lead ? " ✦" : ""}</span>
                  <span style={{ color: L.dim }}>{Math.round(v)}</span>
                </div>
                <div style={{ height: 8, background: L.hair }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(v / maxScore) * 100}%` }} transition={{ duration: 1.1, ease: "easeOut" }} style={{ height: "100%", background: lead ? L.accent : L.dim }} />
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <NoteHead n="ii" title="time given to each" L={L} />
          {TOOL_IDS.map((id) => (
            <div key={id} style={{ marginBottom: 12, opacity: lensId && lensId !== id ? 0.42 : 1, transition: "opacity .4s" }}>
              <div className="f-mono" style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 5, color: L.dim }}>
                <span>{TOOLS[id].name.replace("the ", "")}</span>
                <span>{dwellOf(id)}s</span>
              </div>
              <div style={{ height: 6, background: L.hair }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(dwellOf(id) / maxDwell) * 100}%` }} transition={{ duration: 1.1, ease: "easeOut" }} style={{ height: "100%", background: lensId === id ? L.accent : L.dim }} />
              </div>
            </div>
          ))}
          <div style={{ height: S(20) }} />
          <NoteHead n="iii" title={lensId ? "its routes" : "paths most travelled"} L={L} />
          {routes.length === 0 && <Empty L={L} />}
          {routes.map(([k, n]) => {
            const [a, b] = k.split("|") as [ToolId, ToolId];
            return (
              <div key={k} className="f-mono" style={{ fontSize: 10, letterSpacing: "0.08em", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${L.hair}`, padding: "7px 0" }}>
                <span>{TOOLS[a].name.replace("the ", "")} ⟷ {TOOLS[b].name.replace("the ", "")}</span>
                <span style={{ color: L.dim }}>{n}×</span>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );

  const SectionLedger = (
    <Section key="ledger" id="cat-ledger" n={lensId ? `${TOOLS[lensId].name} — ledger` : "Marks ledger"} L={L}>
      <div style={{ overflowX: "auto", border: `1px solid ${L.hair}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              {["nº", "specimen", "act", "detail", "position"].map((h) => (
                <th key={h} className="f-mono" style={{ textAlign: "left", fontSize: 8.5, letterSpacing: "0.24em", textTransform: "uppercase", color: L.dim, fontWeight: 400, padding: "12px 15px", borderBottom: `1px solid ${L.ink}`, whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ledger.length === 0 && (
              <tr>
                <td colSpan={5} className={body} style={{ padding: "20px 15px", fontSize: 17, color: L.dim }}>
                  — nothing recorded {lensId ? `for ${TOOLS[lensId].name}` : "yet"} —
                </td>
              </tr>
            )}
            {ledger.map((m, i) => {
              const vi = KEY_ORDER.indexOf(m.type);
              return (
                <tr key={m.id} className="cat-row" style={{ borderBottom: `1px solid ${L.hair}` }}>
                  <td className="f-mono" style={{ padding: "10px 15px", fontSize: 10, color: L.dim }}>{String(ledger.length - i).padStart(2, "0")}</td>
                  <td style={{ padding: "8px 15px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <ToolShape id={m.type} size={20} ink />
                      <span className={L.mono ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 11 : 16 }}>{TOOLS[m.type].name}</span>
                    </span>
                  </td>
                  <td className="f-mono" style={{ padding: "10px 15px", fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: L.dim }}>{vi >= 0 ? SOCKET_VERBS[vi] : "—"}</td>
                  <td className={L.mono ? "f-mono" : "f-serif"} style={{ padding: "10px 15px", fontSize: L.mono ? 11 : 16 }}>{detailOf(m)}</td>
                  <td className="f-mono" style={{ padding: "10px 15px", fontSize: 10, color: L.dim, whiteSpace: "nowrap" }}>x {(m.x * 100).toFixed(1)} · y {(m.y * 100).toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );

  const SECTIONS: Record<SectionId, React.ReactNode> = {
    order: SectionOrder,
    specimens: SectionSpecimens,
    notes: SectionNotes,
    pattern: SectionPattern,
    ledger: SectionLedger,
  };

  return (
    <motion.div
      data-native
      id="cat-container"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 26 }}
      transition={{ duration: 0.9, ease: [0.22, 0.9, 0.24, 1] }}
      className="absolute inset-0 cat-scroll"
      style={{
        zIndex: 80,
        overflowY: "auto",
        overscrollBehavior: "contain",
        background: L.paper,
        color: L.ink,
        cursor: "auto",
        transition: "background 0.9s ease, color 0.9s ease",
        minHeight: "100vh",
        height: "100%"
      }}
    >
      <div id="cat-top" />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: L.tint, transition: "background 0.9s ease" }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.05, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {L.rails && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.5 }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(50% - ${L.measure / 2}px)`, width: 1, background: L.hair }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: L.hair }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(50% + ${L.measure / 2}px)`, width: 1, background: L.hair }} />
        </div>
      )}

      <header style={{ position: "sticky", top: 0, zIndex: 5, background: `${L.paper}ee`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${L.ink}`, transition: "background 0.9s ease" }}>
        <div style={{ maxWidth: L.measure, margin: "0 auto", padding: "15px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, transition: "max-width 0.7s ease" }}>
          <div className="f-mono" style={{ fontSize: 9.5, letterSpacing: "0.3em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Workshop — Catalogue
          </div>
          <nav className="f-mono cat-nav" style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {L.order.map((s) => (
              <button
                key={s}
                onClick={() => {
                  const el = document.getElementById(`cat-${s}`);
                  const container = document.getElementById("cat-container");
                  if (el && container) {
                    const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 70;
                    container.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                className="cat-link"
                style={{ color: L.dim, background: "none", border: "none", padding: 0, cursor: "pointer", textTransform: "inherit", font: "inherit", letterSpacing: "inherit" }}
              >
                {s}
              </button>
            ))}
            <button onClick={onReturn} className="f-mono cat-return" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: L.ink, background: "transparent", border: `1px solid ${L.ink}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}>
              ← the bench
            </button>
          </nav>
        </div>
        <AnimatePresence>
          {lensId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", borderTop: `1px solid ${L.hair}`, background: `${L.accent}14` }}
            >
              <div style={{ maxWidth: L.measure, margin: "0 auto", padding: "9px 36px", display: "flex", alignItems: "center", gap: 14 }}>
                <ToolShape id={lensId} size={18} ink />
                <span className="f-mono" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  re-set as <strong style={{ color: L.accent }}>{L.title}</strong>
                </span>
                <span className={L.mono ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 10 : 14, color: L.dim, flex: 1 }}>
                  {L.blurb}
                </span>
                <button onClick={() => pick(lensId)} className="f-mono cat-link" style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: L.dim, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  release ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div style={{ maxWidth: L.measure, margin: "0 auto", padding: "0 36px 140px", position: "relative", transition: "max-width 0.7s ease" }}>
        
        <section style={{ padding: `${S(70)}px 0 ${S(52)}px` }}>
          <div className="f-mono" style={{ fontSize: 9.5, letterSpacing: "0.28em", textTransform: "uppercase", color: L.dim }}>
            Issued by the bench · {date}
          </div>
          <motion.h1
            key={L.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={L.heroItalic ? "f-serif italic" : L.mono ? "f-mono" : "f-serif"}
            style={{ fontSize: L.heroSize, lineHeight: 1.04, margin: "16px 0 0", fontWeight: 500, letterSpacing: L.mono ? "-0.01em" : "-0.01em" }}
          >
            {lensId ? L.title : `Arrangement nº ${visits}`}
          </motion.h1>
          <p className={body} style={{ fontSize: L.mono ? 13 : 21, lineHeight: 1.6, maxWidth: 560, marginTop: 22, color: L.dim }}>
            {lensId
              ? `${L.blurb} The same record, read through ${TOOLS[lensId].name}.`
              : `${MODE_META[mode].poem.charAt(0).toUpperCase()}${MODE_META[mode].poem.slice(1)} Every entry below is something your hands left behind.`}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 1, marginTop: S(34), background: L.hair, border: `1px solid ${L.hair}` }}>
            {(lensId
              ? ([
                  ["marks by this tool", String(marksOf(lensId))],
                  ["taken up", `${usageOf(lensId)}×`],
                  ["time given", `${dwellOf(lensId)}s`],
                  ["its act", SOCKET_VERBS[KEY_ORDER.indexOf(lensId)] ?? "—"],
                ] as [string, string][])
              : ([
                  ["marks recorded", String(marks.length)],
                  ["tool pickups", String(TOOL_IDS.reduce((s, id) => s + usageOf(id), 0))],
                  ["tracked events", String(sig.events)],
                  ["time at bench", `${TOOL_IDS.reduce((s, id) => s + dwellOf(id), 0)}s`],
                  ["arrangement", MODE_META[mode].label],
                ] as [string, string][])
            ).map(([k, v]) => (
              <div key={k} style={{ background: L.paper, padding: "15px 22px", flex: "1 1 150px" }}>
                <div className={L.mono ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 19 : 27 }}>{v}</div>
                <div className="f-mono" style={{ fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: L.dim, marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: L.hair }} />

        {L.order.map((s) => SECTIONS[s])}

        <div style={{ height: 1, background: L.hair }} />

        <section style={{ padding: `${S(56)}px 0 30px`, textAlign: "center" }}>
          <div className="f-mono" style={{ fontSize: 9.5, letterSpacing: "0.26em", color: L.dim, textTransform: "uppercase" }}>Colophon</div>
          <p className={L.mono ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 12 : 19, lineHeight: 1.8, maxWidth: 520, margin: "22px auto 0", color: L.dim }}>
            Set in Cormorant Garamond &amp; IBM Plex Mono. Arranged during visit {visits}, in the mode of {MODE_META[mode].label}
            {lensId ? `, read through ${TOOLS[lensId].name}` : ""}. Printed by the arrangement itself.
          </p>
          <button onClick={onReturn} className="f-mono cat-solid" style={{ marginTop: 38, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: L.paper, background: L.ink, border: `1px solid ${L.ink}`, borderRadius: 999, padding: "12px 26px", cursor: "pointer" }}>
            Return to the bench
          </button>
        </section>
      </div>
    </motion.div>
  );
}

function SpecimenCell({
  id, i, L, selected, onPick, usage, marks, dwell,
}: {
  id: ToolId; i: number; L: Lens; selected: boolean; onPick: () => void;
  usage: number; marks: number; dwell: number;
}) {
  const def = TOOLS[id];
  const stats = (
    <div className="f-mono" style={{ fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: L.dim, display: "flex", gap: 14, flexWrap: "wrap" }}>
      <span>{usage}× taken up</span><span>{marks} marks</span><span>{dwell}s</span>
    </div>
  );

  const shell: React.CSSProperties = {
    background: selected ? `${L.accent}1c` : L.paper,
    cursor: "pointer",
    position: "relative",
    textAlign: "left",
    border: L.framed ? `1px solid ${selected ? L.accent : L.hair}` : "none",
    outline: selected && !L.framed ? `1px solid ${L.accent}` : "none",
    transition: "background .45s ease, border-color .45s ease",
    width: "100%",
    font: "inherit",
    color: "inherit",
  };

  if (L.variant === "strip") {
    return (
      <button onClick={onPick} className="cat-card" style={{ ...shell, padding: "18px 8px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><ToolShape id={id} size={30} ink /></div>
        <div className="f-mono" style={{ fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 12 }}>{def.name.replace("the ", "")}</div>
        <div className="f-mono" style={{ fontSize: 8.5, color: L.dim, marginTop: 5 }}>{marks}</div>
      </button>
    );
  }

  if (L.variant === "row") {
    return (
      <button onClick={onPick} className="cat-card" style={{ ...shell, display: "flex", alignItems: "center", gap: 18, padding: "16px 18px", borderBottom: `1px solid ${L.hair}` }}>
        <span className="f-mono" style={{ fontSize: 9, color: L.dim, width: 22 }}>{ROMAN[i]}</span>
        <ToolShape id={id} size={28} ink />
        <span style={{ flex: 1 }}>
          <span className="f-serif italic" style={{ fontSize: 20, display: "block" }}>{def.name}</span>
          <span className="f-mono" style={{ fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: L.dim }}>{def.desc}</span>
        </span>
        <span className="f-mono" style={{ fontSize: 9, color: L.dim }}>{marks} marks</span>
      </button>
    );
  }

  if (L.variant === "wash") {
    const c = BRUSH_COLORS[i % BRUSH_COLORS.length];
    return (
      <button onClick={onPick} className="cat-card" style={{ ...shell, padding: "30px 28px", borderRadius: 3, overflow: "hidden", border: `1px solid ${selected ? L.accent : L.hair}` }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 190, height: 150, borderRadius: "46% 54% 58% 42% / 52% 44% 56% 48%", background: `radial-gradient(ellipse at 40% 45%, ${c}3a, transparent 70%)`, pointerEvents: "none" }} />
        <ToolShape id={id} size={46} ink />
        <div className="f-serif italic" style={{ fontSize: 30, marginTop: 20 }}>{def.name}</div>
        <div className="f-serif" style={{ fontSize: 17, color: L.dim, marginTop: 6 }}>{def.desc}</div>
        <div style={{ height: 16 }} />
        {stats}
      </button>
    );
  }

  if (L.variant === "plate") {
    return (
      <button onClick={onPick} className="cat-card" style={{ ...shell, padding: "22px 20px 18px" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: `repeating-linear-gradient(90deg, ${L.hair} 0 1px, transparent 1px 9px)` }} />
        <div className="f-mono" style={{ fontSize: 8.5, letterSpacing: "0.22em", color: L.dim, marginTop: 6 }}>
          {ROMAN[i]} · {String(i * 48 + 12).padStart(3, "0")} mm
        </div>
        <div style={{ margin: "16px 0 12px" }}><ToolShape id={id} size={40} ink /></div>
        <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>{def.name.replace("the ", "")}</div>
        <div style={{ height: 1, background: L.hair, margin: "12px 0 10px" }} />
        {stats}
      </button>
    );
  }

  if (L.variant === "annotated") {
    return (
      <button onClick={onPick} className="cat-card" style={{ ...shell, display: "flex", gap: 28, padding: "26px 24px", borderBottom: `1px solid ${L.hair}`, alignItems: "flex-start" }}>
        <ToolShape id={id} size={64} ink />
        <span style={{ flex: 1 }}>
          <span className="f-serif italic" style={{ fontSize: 28, display: "block" }}>{def.name}</span>
          <span className="f-serif" style={{ fontSize: 18, color: L.dim, display: "block", marginTop: 4 }}>{def.desc}</span>
          <span className="f-serif italic" style={{ fontSize: 16, display: "block", marginTop: 12 }}>“{def.firstUse}”</span>
          <span style={{ display: "block", height: 12 }} />
          {stats}
        </span>
        <span className="f-mono" style={{ fontSize: 9, color: L.accent, width: 74, lineHeight: 1.9 }}>
          † specimen {ROMAN[i]}<br />† {marks} marks<br />† {dwell}s held
        </span>
      </button>
    );
  }

  return (
    <button onClick={onPick} className="cat-card" style={{ ...shell, padding: "26px 24px 22px" }}>
      {L.framed && (
        <>
          {[[8, 8], ["calc(100% - 16px)", 8], [8, "calc(100% - 16px)"], ["calc(100% - 16px)", "calc(100% - 16px)"]].map((p, k) => (
            <span key={k} style={{ position: "absolute", left: p[0] as number, top: p[1] as number, width: 8, height: 8, borderTop: `1px solid ${L.accent}`, borderLeft: `1px solid ${L.accent}`, opacity: 0.5 }} />
          ))}
        </>
      )}
      <div className="f-mono" style={{ fontSize: 9, letterSpacing: "0.22em", color: L.dim }}>{ROMAN[i]} · SPECIMEN</div>
      <div style={{ margin: "20px 0 16px" }}><ToolShape id={id} size={48} ink /></div>
      <div className="f-serif italic" style={{ fontSize: 23 }}>{def.name}</div>
      <div className="f-mono" style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: L.dim, marginTop: 6 }}>{def.desc}</div>
      <div style={{ height: 1, background: L.hair, margin: "16px 0 12px" }} />
      {stats}
    </button>
  );
}

function Section({ id, n, L, children, aside }: { id: string; n: string; L: Lens; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: `${Math.round(56 * L.gap)}px 0 ${Math.round(26 * L.gap)}px`, scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: Math.round(34 * L.gap), flexWrap: "wrap" }}>
        <h2 className={L.mono ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 14 : 31, margin: 0, fontWeight: 500, letterSpacing: L.mono ? "0.16em" : undefined, textTransform: L.mono ? "uppercase" : "none" }}>
          {n}
        </h2>
        <div style={{ flex: 1, height: 1, background: L.hair, minWidth: 40 }} />
        {aside}
      </div>
      {children}
    </section>
  );
}

function NoteHead({ n, title, L }: { n: string; title: string; L: Lens }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "0 0 14px" }}>
      <span className="f-mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: L.dim, textTransform: "uppercase" }}>{n}.</span>
      <span className="f-mono" style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: L.hair }} />
    </div>
  );
}

function Empty({ L }: { L: Lens }) {
  return (
    <div className={L.mono ? "f-mono" : "f-serif italic"} style={{ fontSize: L.mono ? 11 : 17, color: L.dim, marginBottom: 8 }}>
      — nothing yet —
    </div>
  );
}
