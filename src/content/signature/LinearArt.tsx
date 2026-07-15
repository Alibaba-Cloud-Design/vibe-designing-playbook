/**
 * LinearArt —— 目录卡 SVG 插画族（提取 Linear/X 蓝图语言，构图原创、语义换成我们的）。
 *
 * 家族规格（全族一致，"像一套图形"）：
 *   · 线宽：全部 1px + vector-effect:non-scaling-stroke —— 任意缩放下都是精确 1px 发丝线
 *   · 明度四档（token 化，亮暗主题自动翻转）：
 *       --la-line 主线 / --la-soft 弱线·虚线 / --la-node 实心节点 / --la-bright 亮点
 *   · 遮挡语言：图形叠到另一图形后面的弧段画虚线（Linear 原作的空间提示）
 *   · mono 小标签、虚点网格底、帧框、方向小箭头 —— 仪器叙事词汇
 *   · 五张：设计工程=三圆滚线(推进) / 动态交互=INTENT→FORM 网络 /
 *          自我进化=相切圆链(X hero 式,宽幅) / 结语=点阵显影(帧框+坐标) / 词典=词条行+垂线束
 */

import { useEffect, useRef, type ReactNode, type SVGProps } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "../../asset";

gsap.registerPlugin(ScrollTrigger);

const NS = { vectorEffect: "non-scaling-stroke" } as const;

/* 入场门:进入视口给 svg 加 .is-in(触发描边生长/淡入,见 Chapters.css);
   ScrollSmoother 下原生 IntersectionObserver 不可靠,统一走 ScrollTrigger。
   prefers-reduced-motion:直接完整呈现。 */
function LartSvg({ children, className, ...rest }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
    });
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { window.clearTimeout(t); st.kill(); };
  }, []);
  return (
    <svg ref={ref} className={className ? `lart ${className}` : "lart"} aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

/* 方向小箭头（沿圆周/轴线的三角标）—— 全族重点色(亮=蓝/暗=青绿) */
function Arrow({ x, y, a = 0, s = 5 }: { x: number; y: number; a?: number; s?: number }) {
  return (
    <path
      d={`M ${-s} ${-s * 0.62} L ${s * 0.9} 0 L ${-s} ${s * 0.62} Z`}
      transform={`translate(${x} ${y}) rotate(${a})`}
      fill="var(--la-accent)"
      stroke="none"
    />
  );
}

/* ============ 01 设计工程 · 虚线织带(多工序汇成一条链路) ============
   参考用户手稿:相位错开的正弦虚线束横贯画面织成网,一串节点沿单条链行进;
   线宽/明度/重点色严格走家族规格(1px 发丝线 + --la-line/--la-soft + --la-accent 节点) */
export function ArtEngineering() {
  /* 素材动图:十点上的九角/七角星回旋线(jing.library MRD5Z3Y602MS3)。
     原片深底白线红高亮 —— 主题适配走 CSS(Chapters.css .lart--img):
     暗色 screen 去黑底 + 红→青绿;亮色 invert+multiply 变黑线 + 红→品牌蓝 */
  return (
    <img
      className="lart lart--img"
      src={asset("/art/star-ten-points.gif")}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}

/* ============ 02 动态交互 · CONTEXT → INTENT → FORM ============ */
export function ArtInteraction() {
  return (
    <LartSvg viewBox="0 0 500 430" className="lart--interaction">
      <line x1={86} y1={215} x2={332} y2={215} fill="none" stroke="var(--la-soft)" strokeWidth={1} {...NS} />

      <g id="context">
        <circle cx={168} cy={215} r={82} fill="none" stroke="var(--la-line)" strokeWidth={1} strokeDasharray="1 5" strokeLinecap="round" {...NS} />
        <circle cx={168} cy={215} r={66} fill="none" stroke="var(--la-bright)" strokeWidth={0.65} opacity={0.3} {...NS} />
      </g>

      <g id="form">
        <rect x={250} y={133} width={164} height={164} fill="none" stroke="var(--la-frame)" strokeWidth={1} {...NS} />
        <circle cx={332} cy={215} r={82} fill="none" stroke="var(--la-line)" strokeWidth={1} {...NS} />
      </g>

      <g className="lart-label">
        <rect x={86} y={104} width={70} height={20} fill="var(--la-tagbg)" />
        <text x={121} y={118} textAnchor="middle">CONTEXT</text>
        <rect x={362} y={104} width={52} height={20} fill="var(--la-tagbg)" />
        <text x={388} y={118} textAnchor="middle">FORM</text>
      </g>

      <g id="intent">
        <circle className="lart-intent-point" cx={332} cy={215} r={5} fill="var(--la-bright)" />
        <g className="lart-label lart-interaction-intent">
          <text x={344} y={207}>INTENT</text>
        </g>
      </g>
    </LartSvg>
  );
}

/* ============ 03 自我进化 · 嵌套进化场（宽幅） ============ */
export function ArtEvolution() {
  const CY = 160;
  const circles = [
    { cx: 600, r: 118, opacity: 0.66 },
    { cx: 388, r: 103, opacity: 0.54 },
    { cx: 812, r: 103, opacity: 0.54 },
    { cx: 225, r: 70, opacity: 0.48 },
    { cx: 975, r: 70, opacity: 0.48 },
  ];
  return (
    <LartSvg viewBox="0 0 1200 320">
      <g fill="none" stroke="var(--la-line)" {...NS}>
        <ellipse cx={600} cy={CY} rx={500} ry={118} strokeWidth={1} opacity={0.38} />
        {circles.map(({ cx, r, opacity }) => (
          <circle key={cx} cx={cx} cy={CY} r={r} strokeWidth={1} opacity={opacity} />
        ))}
        <path d="M0 160 H584 M616 160 H1200" strokeWidth={1} opacity={0.48} />
        <path d="M600 0 V144 M600 176 V320" strokeWidth={1} opacity={0.48} />
      </g>

      <g fill="var(--la-bright)">
        <rect x={596} y={156} width={8} height={8} />
        <rect x={596} y={2} width={8} height={8} />
        <rect x={596} y={310} width={8} height={8} />
        <path d="M0 156 l4 4 -4 4 -4 -4 Z" />
        <path d="M1200 156 l4 4 -4 4 -4 -4 Z" />
      </g>

      <Arrow x={600} y={43} a={0} s={5.5} />
      <Arrow x={388} y={57} a={0} s={5} />
      <Arrow x={812} y={57} a={0} s={5} />
      <Arrow x={225} y={90} a={0} s={4.5} />
      <Arrow x={975} y={90} a={0} s={4.5} />
    </LartSvg>
  );
}

/* ============ 99 结语 · 平衡拓扑（三层结构逐层显影） ============ */
export function ArtOutro() {
  const nodes = [
    { cx: 150, cy: 48, r: 4 }, { cx: 350, cy: 48, r: 4 },
    { cx: 448, cy: 215, r: 4 }, { cx: 350, cy: 382, r: 4 },
    { cx: 150, cy: 382, r: 4 }, { cx: 52, cy: 215, r: 4 },
    { cx: 215, cy: 168, r: 5 }, { cx: 285, cy: 168, r: 5 },
    { cx: 304, cy: 224, r: 5 }, { cx: 216, cy: 256, r: 5 },
  ];
  return (
    <LartSvg viewBox="0 0 500 430" className="lart--outro">
      <g fill="none">
        <path className="lart-outro-outer" d="M150 48 L350 48 L448 215 L350 382 L150 382 L52 215 Z" stroke="var(--la-line)" strokeWidth={1} opacity={0.58} {...NS} />
        <path className="lart-outro-middle" d="M205 112 L295 112 L336 215 L292 306 L208 306 L164 215 Z" stroke="var(--la-line)" strokeWidth={1} opacity={0.52} {...NS} />
        <path className="lart-outro-core" d="M215 168 L285 168 L304 224 L274 278 L216 256 L196 210 Z" stroke="var(--la-line)" strokeWidth={1} opacity={0.68} {...NS} />
        <g className="lart-outro-links" stroke="var(--la-line)" strokeWidth={1} opacity={0.46} {...NS}>
          <path d="M150 48 L205 112 M350 48 L295 112 M448 215 L336 215 M350 382 L292 306 M150 382 L208 306 M52 215 L164 215" />
          <path d="M205 112 L215 168 M295 112 L285 168 M336 215 L304 224 M292 306 L274 278 M208 306 L216 256 M164 215 L196 210" />
          <path d="M150 48 L285 168 M350 48 L215 168 M448 215 L274 278 M350 382 L304 224 M150 382 L196 210 M52 215 L216 256" />
        </g>
      </g>
      <g className="lart-outro-node" fill="var(--la-bright)">
        {nodes.map(({ cx, cy, r }) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
      </g>
    </LartSvg>
  );
}

/* ============ A0 词典 · 词条行 + 扇形线束（词条向下展开成细目） ============
   线束语言对齐 MRBLWHN8KQRLB(多线汇入/散开的长弧)：一束线从行底成扇展开,端点圆点 */
export function ArtLexicon() {
  const wires = (x0: number, y0: number, n: number, spread: number, len: number) =>
    Array.from({ length: n }, (_, i) => {
      const dx = (i - (n - 1) / 2) * spread;
      const x1 = x0 + dx * 1.9;
      return (
        <g key={i}>
          <path
            d={`M ${x0 + dx * 0.3} ${y0} C ${x0 + dx * 0.5} ${y0 + len * 0.45}, ${x1} ${y0 + len * 0.5}, ${x1} ${y0 + len}`}
            fill="none"
            stroke="var(--la-soft)"
            strokeWidth={1}
            {...NS}
          />
          <circle cx={x1} cy={y0 + len} r={2.6} fill="var(--la-accent)" />
        </g>
      );
    });
  return (
    <LartSvg viewBox="0 0 500 430">
      {/* 虚点网格底 */}
      <g stroke="var(--la-grid)" strokeWidth={1}>
        {[88, 158, 228, 298, 368].map((y) => (
          <line key={y} x1={24} y1={y} x2={476} y2={y} strokeDasharray="1 9" {...NS} />
        ))}
      </g>
      {/* 词条行（左亮→右隐的渐变条） */}
      <defs>
        <linearGradient id="laBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--la-barhi)" />
          <stop offset="1" stopColor="var(--la-barlo)" />
        </linearGradient>
      </defs>
      <rect x={56} y={74} width={300} height={26} fill="url(#laBar)" />
      <rect x={128} y={168} width={316} height={26} fill="url(#laBar)" />
      <rect x={72} y={262} width={252} height={26} fill="url(#laBar)" />
      {/* 行首竖亮刻（词条把手） */}
      {[
        [56, 74], [128, 168], [72, 262],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={2.4} height={26} fill="var(--la-bright)" />
      ))}
      {/* 行下扇形线束 */}
      {wires(206, 100, 5, 11, 56)}
      {wires(300, 194, 7, 10, 62)}
      {wires(170, 288, 4, 12, 50)}
      {/* 一枚方块节点（词条锚,自条2垂线挂下） */}
      <rect x={404} y={300} width={22} height={22} fill="none" stroke="var(--la-line)" strokeWidth={1} {...NS} />
      <path d="M 415 262 v 38" stroke="var(--la-soft)" strokeWidth={1} fill="none" {...NS} />
    </LartSvg>
  );
}

export const LINEAR_ART: Record<string, () => ReturnType<typeof ArtEngineering>> = {
  ch1: ArtEngineering,
  ch2: ArtInteraction,
  ch3: ArtEvolution,
  outro: ArtOutro,
  lex: ArtLexicon,
};
