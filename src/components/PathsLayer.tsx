import type { ToolId, ToolState } from "../types";

interface Props {
  edges: Record<string, number>;
  tools: ToolState[];
  hoverId: ToolId | null;
}

export default function PathsLayer({ edges, tools, hoverId }: Props) {
  const byId = new Map(tools.map((t) => [t.id, t]));
  let curveIdx = 0;

  return (
    <svg
      className="absolute inset-0"
      style={{ zIndex: 2, pointerEvents: "none" }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {Object.entries(edges).map(([key, count]) => {
        const [a, b] = key.split("|") as [ToolId, ToolId];
        const ta = byId.get(a);
        const tb = byId.get(b);
        if (!ta || !tb || ta.vis === "hidden" || tb.vis === "hidden") return null;
        const x1 = ta.pos.x * 100;
        const y1 = ta.pos.y * 100;
        const x2 = tb.pos.x * 100;
        const y2 = tb.pos.y * 100;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.max(Math.hypot(dx, dy), 1);
        const bend = (curveIdx++ % 2 === 0 ? 1 : -1) * (2.4 + (curveIdx % 3));
        const cx = mx + (-dy / len) * bend;
        const cy = my + (dx / len) * bend;
        const lit = hoverId === a || hoverId === b;
        const base = Math.min(0.16, 0.045 + count * 0.028);
        return (
          <g key={key}>
            <path
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              fill="none"
              stroke={`rgba(238, 208, 158, ${lit ? Math.min(0.4, base + 0.18) : base})`}
              strokeWidth={lit ? 1.4 : 1}
              vectorEffect="non-scaling-stroke"
              className="path-drift"
              style={{ transition: "stroke 0.6s ease" }}
            />
            <circle cx={x1} cy={y1} r={0.45} fill={`rgba(238,208,158,${lit ? 0.5 : 0.14})`} style={{ transition: "fill 0.6s ease" }} />
            <circle cx={x2} cy={y2} r={0.45} fill={`rgba(238,208,158,${lit ? 0.5 : 0.14})`} style={{ transition: "fill 0.6s ease" }} />
          </g>
        );
      })}
    </svg>
  );
}
