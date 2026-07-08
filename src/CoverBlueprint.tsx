import { useEffect, useRef, useState } from "react";
import { onCoverEnter } from "@/introSignal";
import "./CoverBlueprint.css";

/**
 * CoverBlueprint —— 首屏线性框内填充图。
 *
 * 参考 Poolside 的克制界面感：浅框承载主图，框内用线描填充形成
 * 一个被系统绘制出来的折面场域。全程黑白灰，不用彩色渐变。
 */
const VW = 1000;
const VH = 320;
const CX = 500;
const CY = 160;

const HATCH_LINES = Array.from({ length: 18 }, (_, i) => ({
  x1: 160 + i * 42,
  y1: 284,
  x2: 70 + i * 42,
  y2: 36,
  d: 0.44 + i * 0.025,
}));

export function CoverBlueprint() {
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const off = onCoverEnter(() => rootRef.current?.classList.add("enter"));
    return off;
  }, []);

  return (
    <svg
      ref={rootRef}
      className={`cbp${reduced ? " enter reduced" : ""}`}
      viewBox={`0 0 ${VW} ${VH}`}
      role="img"
      aria-label="Vibe Designing Playbook — 线性框内填充图"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id="cbp-fold-clip">
          <path d="M86 238 L278 72 L500 164 L722 72 L914 238 L500 276 Z" />
        </clipPath>
      </defs>

      <g className="cbp-frame-text" fontFamily="'JetBrains Mono', ui-monospace, monospace">
        <text x="34" y="34">FRAME / 01</text>
        <text x="966" y="34" textAnchor="end">LINEAR FILL</text>
      </g>

      <g className="cbp-grid" fill="none">
        <path className="cbp-line cbp-axis" d="M34 276H966" pathLength={1} />
        <path className="cbp-line cbp-axis" d="M500 42V286" pathLength={1} />
      </g>

      <g className="cbp-hatch" clipPath="url(#cbp-fold-clip)">
        {HATCH_LINES.map((line, i) => (
          <line
            key={i}
            className="cbp-hatch-line"
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            pathLength={1}
            style={{ ["--d" as string]: `${line.d}s` }}
          />
        ))}
      </g>

      <g className="cbp-fold" fill="none">
        <path className="cbp-line cbp-line-primary" d="M86 238 L278 72 L500 164 L722 72 L914 238" pathLength={1} />
        <path className="cbp-line cbp-line-secondary" d="M86 238 L500 276 L914 238" pathLength={1} />
        <path className="cbp-line cbp-line-tertiary" d="M278 72 L500 276 L722 72" pathLength={1} />
        <path className="cbp-line cbp-line-tertiary" d="M500 164 L500 276" pathLength={1} />
      </g>

      <g className="cbp-precision" fill="none">
        <path d="M34 64H126M874 64H966M34 252H126M874 252H966" />
        <path d="M34 64V110M966 64V110M34 206V252M966 206V252" />
      </g>

      <g className="cbp-anchor">
        <rect className="cbp-anchor-plate" x={CX - 22} y={CY - 22} width="44" height="44" rx="1" />
        <rect className="cbp-anchor-core" x={CX - 6} y={CY - 6} width="12" height="12" rx="1" />
      </g>

      <g className="cbp-callout" fontFamily="'JetBrains Mono', ui-monospace, monospace">
        <text x="500" y="306" textAnchor="middle">TASTE-LED OUTPUT / DRAWN IN FRAME</text>
      </g>
    </svg>
  );
}
