import type { ToolId } from "../types";
import { ACCENT_INK, TOOLS } from "../lib/tools";

export default function ToolShape({ id, size = 42, ink = false }: { id: ToolId; size?: number; ink?: boolean }) {
  const stroke = ink ? "#3b3125" : "#d9d0c3";
  const accent = ink ? ACCENT_INK[id] : TOOLS[id].color;
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ display: "block", overflow: "visible" }}
    >
      {id === "pen" && (
        <g transform="rotate(45 24 24)">
          <rect x="21.4" y="7" width="5.2" height="21" rx="2.6" {...common} />
          <path d="M21.4 25.5 h5.2" {...common} stroke={accent} strokeOpacity={0.7} />
          <path d="M21.6 28 L24 39.5 L26.4 28 Z" {...common} />
          <path d="M24 31.5 V36" {...common} strokeWidth={1.1} />
          <circle cx="24" cy="31" r="0.7" fill={accent} stroke="none" />
        </g>
      )}

      {id === "knife" && (
        <g transform="rotate(45 24 24)">
          <path
            d="M21 28 V14.5 C21 10 23.2 7 27 6 V28 Z"
            {...common}
          />
          <path d="M22.6 26 V14" {...common} strokeWidth={1} stroke={accent} strokeOpacity={0.65} />
          <path d="M21 28.5 h6" {...common} stroke={accent} strokeOpacity={0.6} />
          <rect x="19.8" y="29" width="8.4" height="13" rx="3.4" {...common} />
          <circle cx="24" cy="33.5" r="0.8" fill={stroke} stroke="none" fillOpacity={0.8} />
          <circle cx="24" cy="38" r="0.8" fill={stroke} stroke="none" fillOpacity={0.8} />
        </g>
      )}

      {id === "brush" && (
        <g transform="rotate(45 24 24)">
          <path
            d="M21.5 17.5 C21.5 12.5 23 8.5 24 6 C25 8.5 26.5 12.5 26.5 17.5 Z"
            {...common}
            fill={accent}
            fillOpacity={0.2}
          />
          <path d="M24 7 V15" {...common} strokeWidth={1} stroke={accent} strokeOpacity={0.6} />
          <rect x="20.6" y="17.5" width="6.8" height="8" rx="1.2" {...common} />
          <path d="M22.8 27.5 h2.4" {...common} strokeWidth={1} strokeOpacity={0.7} />
          <rect x="22.4" y="25.5" width="3.2" height="15" rx="1.6" {...common} />
        </g>
      )}

      {id === "ruler" && (
        <g transform="rotate(-24 24 24)">
          <rect x="8" y="19" width="32" height="9" rx="1.4" {...common} />
          <path
            d="M13 19 v3.4 M17 19 v2.4 M21 19 v3.4 M25 19 v2.4 M29 19 v3.4 M33 19 v2.4"
            {...common}
            strokeWidth={1.1}
            stroke={accent}
            strokeOpacity={0.75}
          />
          <circle cx="36.4" cy="23.5" r="1.1" {...common} strokeWidth={1.1} />
        </g>
      )}

      {id === "magnifier" && (
        <g>
          <circle cx="20" cy="20" r="11" {...common} />
          <circle cx="20" cy="20" r="7.5" {...common} strokeWidth={1} stroke={accent} strokeOpacity={0.45} />
          <path d="M15.2 17.2 A6.4 6.4 0 0 1 19.8 14.3" {...common} strokeWidth={1.2} strokeOpacity={0.85} />
          <path d="M28.4 28.4 L39 39" stroke={stroke} strokeWidth={3.2} strokeLinecap="round" />
          <path d="M28.4 28.4 L39 39" {...common} strokeWidth={1.2} stroke={accent} strokeOpacity={0.35} />
        </g>
      )}

      {id === "clamp" && (
        <g>
          <path
            d="M32 9.5 C20 9.5 12.5 16 12.5 24 S20 38.5 30 38.5"
            fill="none"
            stroke={stroke}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
          <path
            d="M32 9.5 C20 9.5 12.5 16 12.5 24 S20 38.5 30 38.5"
            {...common}
            strokeWidth={1.2}
          />
          <path d="M32 9.5 h7.5" {...common} />
          <circle cx="40" cy="9.5" r="1.6" {...common} fill={accent} fillOpacity={0.2} />
          <path d="M30 38.5 h8.5" {...common} />
          <path d="M38.5 38.5 V28.5" {...common} stroke={accent} strokeOpacity={0.8} />
          <path d="M34 28.5 h9" {...common} strokeWidth={1.3} />
          <circle cx="38.5" cy="24.6" r="1.5" {...common} fill={accent} fillOpacity={0.2} />
        </g>
      )}
    </svg>
  );
}
