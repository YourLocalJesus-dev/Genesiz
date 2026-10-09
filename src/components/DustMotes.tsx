import { useMemo } from "react";
import { seeded } from "../lib/tools";

export default function DustMotes({ count = 26 }: { count?: number }) {
  const motes = useMemo(() => {
    const rnd = seeded(20260413);
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      left: rnd() * 100,
      top: rnd() * 100,
      size: 1 + rnd() * 2.2,
      dur: 26 + rnd() * 38,
      delay: -rnd() * 50,
      drift: (rnd() * 2 - 1) * 60,
      rise: -(50 + rnd() * 120),
      op: 0.12 + rnd() * 0.3,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 23, pointerEvents: "none", mixBlendMode: "screen" }}>
      {motes.map((m) => (
        <span
          key={m.key}
          className="mote"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            opacity: m.op,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            ["--dx" as string]: `${m.drift}px`,
            ["--dy" as string]: `${m.rise}px`,
          }}
        />
      ))}
    </div>
  );
}
