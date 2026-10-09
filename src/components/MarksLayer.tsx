import { useEffect, useState } from "react";
import type { Mark } from "../types";
import { BRUSH_COLORS, GLASS_DETAILS, KNIFE_WORDS, PEN_LINES, seeded } from "../lib/tools";

const DIM_AGE = 75_000;
const HOLD_R = 150;

function PenMark({ m, op }: { m: Mark; op: number }) {
  return (
    <div
      className="mark-in f-serif italic"
      style={{
        position: "absolute",
        left: `${m.x * 100}%`,
        top: `${m.y * 100}%`,
        ["--rot" as string]: `${m.rot}deg`,
        ["--op" as string]: op,
        fontSize: 15,
        color: "rgba(236, 221, 196, 0.82)",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        textShadow: "0 0 14px rgba(255, 210, 150, 0.10)",
      }}
    >
      {PEN_LINES[m.idx % PEN_LINES.length]}
    </div>
  );
}

function KnifeMark({ m, op }: { m: Mark; op: number }) {
  return (
    <div
      className="mark-in"
      style={{
        position: "absolute",
        left: `${m.x * 100}%`,
        top: `${m.y * 100}%`,
        ["--rot" as string]: `${m.rot}deg`,
        ["--op" as string]: op,
        width: 124,
        height: 26,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 12,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.95) 18%, rgba(0,0,0,0.95) 82%, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 14,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255, 206, 150, 0.30) 30%, rgba(255, 206, 150, 0.30) 70%, transparent)",
        }}
      />
      <div
        className="f-mono"
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 8,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "rgba(222, 192, 150, 0.5)",
        }}
      >
        {KNIFE_WORDS[m.idx % KNIFE_WORDS.length]}
      </div>
    </div>
  );
}

function BrushMark({ m, op }: { m: Mark; op: number }) {
  const c = BRUSH_COLORS[m.idx % BRUSH_COLORS.length];
  const s = 64 + (m.w % 40);
  return (
    <div
      className="mark-in"
      style={{
        position: "absolute",
        left: `${m.x * 100}%`,
        top: `${m.y * 100}%`,
        ["--rot" as string]: `${m.rot}deg`,
        ["--op" as string]: op * 0.85,
        width: s,
        height: s * 0.72,
        borderRadius: "46% 54% 58% 42% / 52% 44% 56% 48%",
        background: `radial-gradient(ellipse at 42% 46%, ${c}52, ${c}26 55%, transparent 76%)`,
        filter: "blur(1.2px)",
        mixBlendMode: "screen",
      }}
    />
  );
}

function RulerMark({ m, op }: { m: Mark; op: number }) {
  const w = m.w;
  return (
    <div
      className="mark-in"
      style={{
        position: "absolute",
        left: `${m.x * 100}%`,
        top: `${m.y * 100}%`,
        ["--rot" as string]: "0deg",
        ["--op" as string]: op,
        width: w,
        height: 16,
        transform: "translate(-50%,-50%)",
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 7, height: 1, background: "rgba(224, 205, 168, 0.45)" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 7,
          background: "repeating-linear-gradient(90deg, rgba(224,205,168,0.6) 0 1px, transparent 1px 9px)",
        }}
      />
      <div style={{ position: "absolute", left: -1, top: 0, bottom: 4, width: 1, background: "rgba(224,205,168,0.55)" }} />
      <div style={{ position: "absolute", right: -1, top: 0, bottom: 4, width: 1, background: "rgba(224,205,168,0.55)" }} />
      <div
        className="f-mono"
        style={{ position: "absolute", right: 0, top: 9, fontSize: 8, color: "rgba(224, 205, 168, 0.5)", letterSpacing: "0.12em" }}
      >
        {Math.round(w * 1.4)} mm
      </div>
    </div>
  );
}

function GlassMark({ m, op }: { m: Mark; op: number }) {
  const rnd = seeded(m.id * 7919);
  const dots = Array.from({ length: 6 }, (_, i) => ({
    x: (rnd() - 0.5) * 44,
    y: (rnd() - 0.5) * 30,
    r: 0.6 + rnd() * 1.1,
    key: i,
  }));
  return (
    <div
      className="mark-in"
      style={{
        position: "absolute",
        left: `${m.x * 100}%`,
        top: `${m.y * 100}%`,
        ["--rot" as string]: "0deg",
        ["--op" as string]: op,
        width: 130,
        height: 60,
      }}
    >
      {dots.map((d) => (
        <div
          key={d.key}
          style={{
            position: "absolute",
            left: 65 + d.x,
            top: 24 + d.y,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: 2,
            background: "rgba(169, 205, 199, 0.5)",
            boxShadow: "0 0 4px rgba(169,205,199,0.5)",
          }}
        />
      ))}
      <div
        className="f-mono"
        style={{
          position: "absolute",
          top: 42,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 8.5,
          color: "rgba(169, 205, 199, 0.62)",
          letterSpacing: "0.1em",
        }}
      >
        {GLASS_DETAILS[m.idx % GLASS_DETAILS.length]}
      </div>
    </div>
  );
}

function ClampMark({ m, op }: { m: Mark; op: number }) {
  return (
    <div
      className="mark-in"
      style={{
        position: "absolute",
        left: `${m.x * 100}%`,
        top: `${m.y * 100}%`,
        ["--rot" as string]: "0deg",
        ["--op" as string]: op,
        width: 60,
        height: 44,
      }}
    >
      <div
        className="clamp-pulse"
        style={{
          position: "absolute",
          left: "50%",
          top: 14,
          width: 26,
          height: 26,
          marginLeft: -13,
          borderRadius: 999,
          border: "1px solid rgba(194, 180, 157, 0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 14,
          width: 24,
          height: 24,
          transform: "translate(-50%, -50%)",
          borderRadius: 999,
          border: "1.4px solid rgba(194, 180, 157, 0.85)",
          boxShadow: "0 0 10px rgba(194, 180, 157, 0.18), inset 0 0 6px rgba(0,0,0,0.6)",
        }}
      />
      <div style={{ position: "absolute", left: "50%", top: 14, width: 1.4, height: 9, background: "rgba(194,180,157,0.8)", transform: "translate(-50%,-50%) rotate(38deg)" }} />
      <div
        className="f-mono"
        style={{ position: "absolute", top: 30, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "rgba(194, 180, 157, 0.45)", letterSpacing: "0.3em", textTransform: "uppercase" }}
      >
        held
      </div>
    </div>
  );
}

export default function MarksLayer({ marks, vw, vh }: { marks: Mark[]; vw: number; vh: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 20_000);
    return () => window.clearInterval(t);
  }, []);

  const clamps = marks.filter((m) => m.type === "clamp");
  const isHeld = (m: Mark) =>
    clamps.some((c) => c.id !== m.id && Math.hypot((c.x - m.x) * vw, (c.y - m.y) * vh) < HOLD_R);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: "none", zIndex: 3 }}>
      {marks.map((m) => {
        const held = isHeld(m);
        const aged = now - m.born > DIM_AGE;
        const op = held ? 1 : aged ? 0.5 : 1;
        const key = `${m.id}`;
        switch (m.type) {
          case "pen":
            return <PenMark key={key} m={m} op={op} />;
          case "knife":
            return <KnifeMark key={key} m={m} op={op} />;
          case "brush":
            return <BrushMark key={key} m={m} op={op} />;
          case "ruler":
            return <RulerMark key={key} m={m} op={op} />;
          case "magnifier":
            return <GlassMark key={key} m={m} op={op} />;
          case "clamp":
            return <ClampMark key={key} m={m} op={op} />;
        }
      })}
    </div>
  );
}
