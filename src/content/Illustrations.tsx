/**
 * 第一章插画 —— 几何线条语言（P2 深色化：暖白纸张 → 软深底）:
 *   深卡抬升面、暖灰细线(1~1.75)、单一靛蓝强调、等距/正交几何、留白克制。
 * 每幅对应正文一个概念,作为 <Figure> 内嵌。P9 再升级为原生蓝图线稿 + draw-on 动画。
 */
import type { FigureKind } from "./chapter1";
import designIoDarkUrl from "../assets/design-io-architecture.svg";
import designIoLightUrl from "../assets/design-io-architecture-light.svg";

const INK = "var(--ink)";                    // 线条/字:暖灰白(深底线稿)
const DIM = "var(--ink-50)";                 // 次级:mono 标签/图注
const ACCENT = "var(--accent-bright)";       // 统一靛蓝强调
// 「软卡片 + 迷你实物 + 点线连接 + mono 标签」语言（深色版）
const CARD = "var(--surface-1)";             // 卡片抬升面(深)
const CARD_LINE = "var(--hairline)";         // 卡片发丝描边
const MONO = "'JetBrains Mono','Chivo Mono',monospace";

/** 一张软卡片(圆角暖灰) */
function Card({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label?: string }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={CARD} stroke={CARD_LINE} strokeWidth="1" />
      {label && (
        <text x={x + w / 2} y={y + 26} fontSize="11" fill={DIM} textAnchor="middle"
          fontFamily={MONO} letterSpacing="1.5" style={{ textTransform: "uppercase" } as any}>{label}</text>
      )}
    </>
  );
}

/** 点线连接(横/竖) */
function Dots({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM} strokeWidth="1.5" strokeDasharray="1.5 7" strokeLinecap="round" />;
}

/** ① Design I/O —— 使用白皮书正式架构图资源，暗/亮主题各走对应版本。 */
function DesignIO() {
  return (
    <span className="design-io-art">
      <img className="design-io-art__img design-io-art__img--dark" src={designIoDarkUrl} alt="Design I/O 架构图" loading="lazy" decoding="async" />
      <img className="design-io-art__img design-io-art__img--light" src={designIoLightUrl} alt="Design I/O 架构图" loading="lazy" decoding="async" />
    </span>
  );
}

/** ② 两类能力 —— 两张软卡片:声明(标靶,给方向) vs 契约(求解路径,给路径) */
function TwoClasses() {
  const cw = 268, ch = 168, y = 16;
  const xL = 40, xR = 700 - 40 - cw;
  const cL = { cx: xL + cw / 2, cy: y + ch / 2 - 6 };
  const cR = { cx: xR + cw / 2, cy: y + ch / 2 - 6 };
  return (
    <svg viewBox="0 0 700 264" width="100%" role="img" aria-label="设计声明与执行契约">
      {/* 左:设计声明 = 标靶 */}
      <Card x={xL} y={y} w={cw} h={ch} label="设计声明" />
      {[40, 28, 16].map((r, i) => (
        <circle key={r} cx={cL.cx} cy={cL.cy} r={r} fill="none" stroke={i === 2 ? ACCENT : INK} strokeWidth="1.5" />
      ))}
      <circle cx={cL.cx} cy={cL.cy} r="5" fill={ACCENT} />
      <text x={cL.cx} y={y + ch + 30} fontSize="13" fill={DIM} textAnchor="middle" fontFamily="'PingFang SC',sans-serif">什么是好 · 给方向</text>

      {/* 中:互补点线 */}
      <Dots x1={xL + cw} y1={y + ch / 2} x2={xR} y2={y + ch / 2} />

      {/* 右:执行契约 = 求解阶梯路径 */}
      <Card x={xR} y={y} w={cw} h={ch} label="执行契约" />
      {(() => { const bx = cR.cx - 52, by = cR.cy + 32; return (
        <g>
          <polyline points={`${bx},${by} ${bx + 26},${by} ${bx + 26},${by - 26} ${bx + 52},${by - 26} ${bx + 52},${by - 52} ${bx + 78},${by - 52} ${bx + 104},${by - 64}`}
            fill="none" stroke={INK} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={bx + 104} cy={by - 64} r="5" fill={ACCENT} />
        </g>
      ); })()}
      <text x={cR.cx} y={y + ch + 30} fontSize="13" fill={DIM} textAnchor="middle" fontFamily="'PingFang SC',sans-serif">怎么做出 · 给路径</text>
    </svg>
  );
}

/** ③ skill 解剖 —— poolside 软卡片 2×2 网格:每格一个 mono 标签 + 迷你实物 + 点线连接 */
function SkillAnatomy() {
  // 网格几何:卡片 232×148,水平间隙 64,垂直间隙 40
  const cw = 232, ch = 148, gx = 64, gy = 40;
  const x0 = 70, y0 = 16;
  const col = (c: number) => x0 + c * (cw + gx);
  const row = (r: number) => y0 + r * (ch + gy);
  const cellCenter = (c: number, r: number) => ({ cx: col(c) + cw / 2, cy: row(r) + ch / 2 + 8 });
  return (
    <svg viewBox="0 0 700 392" width="100%" role="img" aria-label="一个 skill 的四个组成部分">
      {/* 点线连接(横/竖,串起四格) */}
      <Dots x1={col(0) + cw} y1={row(0) + ch / 2} x2={col(1)} y2={row(0) + ch / 2} />
      <Dots x1={col(0) + cw} y1={row(1) + ch / 2} x2={col(1)} y2={row(1) + ch / 2} />
      <Dots x1={col(0) + cw / 2} y1={row(0) + ch} x2={col(0) + cw / 2} y2={row(1)} />
      <Dots x1={col(1) + cw / 2} y1={row(0) + ch} x2={col(1) + cw / 2} y2={row(1)} />

      {/* 左上：触发时机 —— 一道"信号脉冲" + 光标 */}
      <Card x={col(0)} y={row(0)} w={cw} h={ch} label="触发时机" />
      {(() => { const { cx, cy } = cellCenter(0, 0); return (
        <g>
          <polyline points={`${cx - 46},${cy} ${cx - 22},${cy} ${cx - 10},${cy - 20} ${cx + 6},${cy + 18} ${cx + 18},${cy} ${cx + 42},${cy}`}
            fill="none" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <rect x={cx + 34} y={cy - 8} width="3" height="16" fill={ACCENT} />
        </g>
      ); })()}

      {/* 右上：判断流程 —— 三步流程节点 */}
      <Card x={col(1)} y={row(0)} w={cw} h={ch} label="判断流程" />
      {(() => { const { cx, cy } = cellCenter(1, 0); const xs = [cx - 40, cx, cx + 40]; return (
        <g>
          <line x1={xs[0]} y1={cy} x2={xs[2]} y2={cy} stroke={INK} strokeWidth="1.5" />
          {xs.map((x, i) => <circle key={i} cx={x} cy={cy} r="6" fill={i === 2 ? ACCENT : CARD} stroke={i === 2 ? ACCENT : INK} strokeWidth="1.5" />)}
        </g>
      ); })()}

      {/* 左下：按需细节 —— 叠放的文档(主文件 + 按需引用) */}
      <Card x={col(0)} y={row(1)} w={cw} h={ch} label="按需细节" />
      {(() => { const { cx, cy } = cellCenter(0, 1); return (
        <g stroke={INK} strokeWidth="1.5" fill={CARD}>
          <rect x={cx - 34} y={cy - 18} width="46" height="40" rx="3" />
          <rect x={cx - 22} y={cy - 26} width="46" height="40" rx="3" fill={CARD} />
          <rect x={cx - 10} y={cy - 34} width="46" height="40" rx="3" fill="var(--surface-2)" />
          <line x1={cx} y1={cy - 24} x2={cx + 26} y2={cy - 24} strokeWidth="1.2" />
          <line x1={cx} y1={cy - 16} x2={cx + 26} y2={cy - 16} strokeWidth="1.2" />
        </g>
      ); })()}

      {/* 右下：沉淀的坑 —— 勾掉的清单(踩过的坑只犯一次) */}
      <Card x={col(1)} y={row(1)} w={cw} h={ch} label="沉淀的坑" />
      {(() => { const { cx, cy } = cellCenter(1, 1); const rows = [-16, 0, 16]; return (
        <g>
          {rows.map((dy, i) => (
            <g key={i}>
              <rect x={cx - 36} y={cy + dy - 6} width="12" height="12" rx="2" fill={i === 0 ? ACCENT : CARD} stroke={i === 0 ? ACCENT : INK} strokeWidth="1.5" />
              {i === 0 && <path d={`M${cx - 33} ${cy + dy} l2.5 2.5 l4 -5`} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
              <line x1={cx - 16} y1={cy + dy} x2={cx + 36} y2={cy + dy} stroke={INK} strokeWidth="1.5" opacity={i === 0 ? 0.35 : 1} />
            </g>
          ))}
        </g>
      ); })()}
    </svg>
  );
}

/**
 * 版头大几何 —— 等距 3D 立方堆叠(用户提供的 "full-stack deployment" 图形)。
 * 直接采用用户给的原始 path(逐块 6 段),painter 顺序原样保留以保证遮挡正确。
 * P2 深色化:深面 + 暖灰半透描边(隐藏边同色系)。
 */
export function HeroGeometry() {
  const S = "var(--ink-50)", FILL = "var(--surface-1)";
  // 每块立方 = [底心x, 顶面中心y]。等距:半宽71、顶菱形半高41、体高246(同原图)
  const cubes = [
    [382, 155], [453, 196], [524, 237],
    [311, 237], [382, 278], [453, 319],
    [240, 360], [311, 401], [382, 442],
  ];
  const W = 71, T = 41, BH = 246;
  return (
    <svg width="100%" viewBox="150 100 460 480" fill="none" role="img" aria-label="版头几何:等距立方堆叠">
      {cubes.map(([x, y], i) => {
        const yTop = y - T, yBot = y + BH, yFront = y + T, yFrontBot = y + T + BH;
        return (
          <g key={i} strokeLinejoin="round">
            {/* 体:纸面 + 实线六边轮廓 */}
            <path d={`M${x} ${yTop}L${x + W} ${y}V${yBot}L${x} ${yFrontBot}L${x - W} ${yBot}V${y}L${x} ${yTop}Z`} fill={FILL} stroke={S} />
            {/* 顶面菱形 */}
            <path d={`M${x} ${yTop}L${x + W} ${y}L${x} ${yFront}L${x - W} ${y}Z`} stroke={S} />
            {/* 前竖棱 */}
            <path d={`M${x} ${yFront}V${yFrontBot}`} stroke={S} />
          </g>
        );
      })}
    </svg>
  );
}

const MAP: Record<FigureKind, () => React.ReactElement> = {
  designio: DesignIO,
  "two-classes": TwoClasses,
  "skill-anatomy": SkillAnatomy,
  interfaces: DesignIO, // 备用，当前未用到
};

export function Illustration({ kind }: { kind: FigureKind }) {
  const C = MAP[kind];
  return <C />;
}
