/**
 * 正文架构图（需求4 ④）—— 参考 tweakkit landing 的「节点 + 连线 + edge」SVG flow，
 * 但风格用 playbook 自己的：软深卡（--surface-1）+ 发丝线（--hairline）+ 暖灰线稿（--ink）
 * + 单一靛蓝强调（--accent-bright）+ mono 标签。全部套 P2 的 <Figure> 描边框。
 *
 * 由 ScrollArticle.routeBlockquote 对 🖼️ 起头的 blockquote 调 matchDiagram → DiagramFigure。
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Figure } from "../Figure";
import { Illustration } from "../Illustrations";
import { Plate } from "./FigPlate";
import { asset } from "../../asset";

const INK = "var(--ink)";
const DIM = "var(--ink-50)";
const FAINT = "var(--ink-30)";
const ACCENT = "var(--accent-bright)";
const CARD = "var(--surface-1)";
const CARD2 = "var(--surface-2)";
const LINE = "var(--hairline)";
const MONO = "'JetBrains Mono','Chivo Mono',monospace";
const SANS = "'PingFang SC','Noto Sans SC',sans-serif";

/* —— 共享图元 —— */
function Box({ x, y, w, h, fill = CARD, stroke = LINE, sw = 1 }: {
  x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} rx="8" fill={fill} stroke={stroke} strokeWidth={sw} />;
}
function TagText({ x, y, children, fill = DIM, size = 11, anchor = "middle", mono = true, upper = true }: {
  x: number; y: number; children: string; fill?: string; size?: number; anchor?: "start" | "middle" | "end"; mono?: boolean; upper?: boolean;
}) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor}
      fontFamily={mono ? MONO : SANS} letterSpacing={mono ? "1.2" : "0"}
      style={upper && mono ? ({ textTransform: "uppercase" } as React.CSSProperties) : undefined}>{children}</text>
  );
}
/** 箭头 edge：横向为主，尾端小箭头，靛蓝可选。 */
function Arrow({ x1, y1, x2, y2, accent = false, dashed = false }: {
  x1: number; y1: number; x2: number; y2: number; accent?: boolean; dashed?: boolean;
}) {
  const c = accent ? ACCENT : DIM;
  const a = 5; // arrow head
  const dir = x2 === x1 ? (y2 > y1 ? "down" : "up") : x2 > x1 ? "right" : "left";
  const head =
    dir === "right" ? `M${x2 - a} ${y2 - a}L${x2} ${y2}L${x2 - a} ${y2 + a}`
    : dir === "left" ? `M${x2 + a} ${y2 - a}L${x2} ${y2}L${x2 + a} ${y2 + a}`
    : dir === "down" ? `M${x2 - a} ${y2 - a}L${x2} ${y2}L${x2 + a} ${y2 - a}`
    : `M${x2 - a} ${y2 + a}L${x2} ${y2}L${x2 + a} ${y2 + a}`;
  return (
    <g stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dashed ? "2 5" : undefined} />
      <path d={head} />
    </g>
  );
}
function ElbowArrow({ points, accent = false, dashed = false }: {
  points: Array<[number, number]>; accent?: boolean; dashed?: boolean;
}) {
  const c = accent ? ACCENT : DIM;
  const end = points[points.length - 1];
  const prev = points[points.length - 2];
  const a = 5;
  const horizontal = Math.abs(end[0] - prev[0]) >= Math.abs(end[1] - prev[1]);
  const dir = horizontal ? (end[0] > prev[0] ? "right" : "left") : (end[1] > prev[1] ? "down" : "up");
  const head =
    dir === "right" ? `M${end[0] - a} ${end[1] - a}L${end[0]} ${end[1]}L${end[0] - a} ${end[1] + a}`
    : dir === "left" ? `M${end[0] + a} ${end[1] - a}L${end[0]} ${end[1]}L${end[0] + a} ${end[1] + a}`
    : dir === "down" ? `M${end[0] - a} ${end[1] - a}L${end[0]} ${end[1]}L${end[0] + a} ${end[1] - a}`
    : `M${end[0] - a} ${end[1] + a}L${end[0]} ${end[1]}L${end[0] + a} ${end[1] + a}`;
  return (
    <g stroke={c} strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} strokeDasharray={dashed ? "2 5" : undefined} />
      <path d={head} />
    </g>
  );
}
/** 小 pill 标签（软卡内的分类项）。 */
function Pill({ x, y, w, label, accent = false }: { x: number; y: number; w: number; label: string; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="26" rx="5" fill={accent ? "color-mix(in srgb, var(--accent-bright), transparent 86%)" : CARD2}
        stroke={accent ? "color-mix(in srgb, var(--accent-bright), transparent 55%)" : LINE} strokeWidth="1" />
      <text x={x + w / 2} y={y + 17} fontSize="12" fill={accent ? ACCENT : INK} textAnchor="middle" fontFamily={SANS}>{label}</text>
    </g>
  );
}

/* ① Agent 调度看板「问题版」—— 四处毛病各有归属（1.1）。 */
/* —— fp 手绘制式图元(arch-2 语言:发丝线/淡青染面/青点/虚线;配合 FigPlate 外壳) ——
   类名约定:.fp-stroke 主线稿(入场描边生长,需 pathLength=1) / .fp-dash 虚线(淡入+缓流)
            .fp-wash 染面(淡入) / .fp-dot 青点(弹入+缓浮) */
const FP_LINE = "var(--fp-line)";
const FP_DOT = "var(--fp-dot)";
const FP_WASH = "var(--fp-wash)";
const FP_INK = "var(--fp-ink)";
const FP_SUB = "var(--fp-sub)";
const FP_AMBER = "#F8B62D";              /* 手稿中的唯一警示色(问题侧) */

function FpBox({ x, y, w, h, wash = false, dashed = false }: {
  x: number; y: number; w: number; h: number; wash?: boolean; dashed?: boolean;
}) {
  return (
    <g>
      {wash && <rect className="fp-wash" x={x} y={y} width={w} height={h} fill={FP_WASH} />}
      <rect
        className={dashed ? "fp-dash" : "fp-stroke"}
        x={x} y={y} width={w} height={h} pathLength={1}
        fill="none" stroke={FP_LINE} strokeWidth="1"
        strokeDasharray={dashed ? "0.012 0.012" : undefined}
      />
    </g>
  );
}
function FpText({ x, y, children, size = 12, fill = FP_INK, mono = false, anchor = "middle" }: {
  x: number; y: number; children: string; size?: number; fill?: string; mono?: boolean; anchor?: "start" | "middle" | "end";
}) {
  return (
    <text className="fp-wash" x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor}
      fontFamily={mono ? MONO : SANS} letterSpacing={mono ? "1.1" : "0"}>{children}</text>
  );
}
function FpDot({ cx, cy, r = 4.5 }: { cx: number; cy: number; r?: number }) {
  return <circle className="fp-dot" cx={cx} cy={cy} r={r} fill={FP_DOT} />;
}
function FpArrow({ x1, y1, x2, y2, dashed = false }: {
  x1: number; y1: number; x2: number; y2: number; dashed?: boolean;
}) {
  const a = 4.5;
  const dir = x2 === x1 ? (y2 > y1 ? "down" : "up") : x2 > x1 ? "right" : "left";
  const head =
    dir === "right" ? `M${x2 - a} ${y2 - a}L${x2} ${y2}L${x2 - a} ${y2 + a}`
    : dir === "left" ? `M${x2 + a} ${y2 - a}L${x2} ${y2}L${x2 + a} ${y2 + a}`
    : dir === "down" ? `M${x2 - a} ${y2 - a}L${x2} ${y2}L${x2 + a} ${y2 - a}`
    : `M${x2 - a} ${y2 + a}L${x2} ${y2}L${x2 + a} ${y2 + a}`;
  return (
    <g stroke={FP_LINE} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line className={dashed ? "fp-dash" : "fp-stroke"} pathLength={1}
        x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dashed ? "0.03 0.03" : undefined} />
      <path className="fp-stroke" pathLength={1} d={head} />
    </g>
  );
}
function FpPill({ x, y, w, h = 26, label, wash = false }: {
  x: number; y: number; w: number; h?: number; label: string; wash?: boolean;
}) {
  return (
    <g>
      {wash && <rect className="fp-wash" x={x} y={y} width={w} height={h} fill={FP_WASH} />}
      <rect className="fp-stroke" pathLength={1} x={x} y={y} width={w} height={h}
        fill="none" stroke={FP_LINE} strokeWidth="1" />
      <FpText x={x + w / 2} y={y + h / 2 + 4.5}>{label}</FpText>
    </g>
  );
}

/* ① Agent 调度看板「问题版」—— 四处毛病各有归属（1.1）。 */
function ProblemBoard() {
  /* 2026-07 重画:tweak 式层次感 —— 底层中性 UI 骨架屏(直角/发丝线/无色),
     四个发现的问题各成一条悬浮标注(白面直角 + 柔投影 + 主题色方块),压在对应区域上。
     灰阶三层:骨架底 4% 墨(浅而不脏) → 行块 8% 墨 → 浮标纯白/亮面 + 重投影。 */
  const PB_BASE = "color-mix(in srgb, var(--ink), transparent 96%)";
  const PB_ROW = "color-mix(in srgb, var(--ink), transparent 92%)";
  const chip = (x: number, y: number, w: number, h = 40) => (
    <rect x={x} y={y} width={w} height={h} fill="var(--pb-chip)" stroke="var(--hairline-bold)" strokeWidth="1" filter="url(#pb-lift)" />
  );
  const mark = (x: number, y: number) => (
    <rect x={x} y={y} width={6} height={6} fill="var(--la-accent)" />
  );
  return (
    <svg viewBox="0 0 700 360" width="100%" role="img" aria-label="Agent 调度看板问题版：四处毛病浮标">
      <defs>
        <filter id="pb-lift" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#0F1114" floodOpacity="0.18" />
        </filter>
        <linearGradient id="pb-ai" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B7CE6" stopOpacity="0.55" /><stop offset="1" stopColor="#6DA0E6" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* —— 底层:UI 骨架屏(全直角,中性灰,退后一层) —— */}
      <rect x={24} y={24} width={652} height={292} fill={PB_BASE} stroke={LINE} strokeWidth="1" />
      <line x1={24} y1={60} x2={676} y2={60} stroke={LINE} strokeWidth="1" />
      <circle cx={44} cy={42} r="3.5" fill={FAINT} /><circle cx={57} cy={42} r="3.5" fill={FAINT} /><circle cx={70} cy={42} r="3.5" fill={FAINT} />
      <TagText x={96} y={46} anchor="start" fill={DIM}>AGENT SCHEDULER</TagText>

      {/* 左列:任务行骨架(灰点+灰条,不着色 —— 颜色问题由浮标承担) */}
      {[0, 1, 2, 3].map((i) => {
        const y = 84 + i * 38;
        return (
          <g key={i}>
            <rect x={44} y={y} width={170} height={26} fill={PB_ROW} stroke={LINE} />
            <circle cx={58} cy={y + 13} r="3.5" fill={FAINT} />
            <rect x={72} y={y + 10} width={98} height={6} fill={FAINT} opacity="0.55" />
          </g>
        );
      })}

      {/* 中区:空态(虚线框) */}
      <rect x={236} y={84} width={210} height={146} fill="transparent" stroke={LINE} strokeDasharray="3 5" />
      <line x1={316} y1={154} x2={366} y2={154} stroke={FAINT} strokeWidth="1.2" />

      {/* 中下:失败行骨架 */}
      <rect x={236} y={252} width={210} height={44} fill={PB_ROW} stroke={LINE} />
      <circle cx={254} cy={274} r="3.5" fill={FAINT} />
      <rect x={268} y={270} width={84} height={7} fill={FAINT} opacity="0.55" />

      {/* 右列:趋势卡骨架(AI 味渐变仍在底层——它就是被指认的问题现场) */}
      <rect x={470} y={84} width={186} height={146} fill="url(#pb-ai)" stroke={LINE} />
      <rect x={488} y={102} width={64} height={8} fill="#fff" opacity="0.55" />
      <rect x={488} y={186} width={144} height={6} fill="#fff" opacity="0.4" />
      <rect x={488} y={200} width={112} height={6} fill="#fff" opacity="0.4" />

      {/* —— 浮层:四条问题标注(直角白面+柔投影,压在骨架之上) —— */}
      {/* 01 状态色乱 —— 压在任务列右上,附三粒冲突色点作证据 */}
      {chip(118, 96, 176)}
      {mark(132, 113)}
      <TagText x={148} y={121} anchor="start" fill={INK} size={12} mono={false} upper={false}>状态色乱</TagText>
      <circle cx={244} cy={116} r="4" fill="#B5514E" />
      <circle cx={260} cy={116} r="4" fill="#C98A2B" />
      <circle cx={276} cy={116} r="4" fill="#5E8C6A" />

      {/* 02 空态白屏 —— 压在中区空态上 */}
      {chip(280, 140, 128)}
      {mark(294, 157)}
      <TagText x={310} y={165} anchor="start" fill={INK} size={12} mono={false} upper={false}>空态白屏</TagText>

      {/* 03 失败无重试 —— 压在失败行上,附虚线幽灵按钮 */}
      {chip(262, 238, 208, 44)}
      {mark(276, 257)}
      <TagText x={292} y={265} anchor="start" fill={INK} size={12} mono={false} upper={false}>失败无重试</TagText>
      <rect x={388} y={248} width={66} height={24} fill="transparent" stroke={FAINT} strokeDasharray="2 4" />
      <TagText x={421} y={264} fill={FAINT} size={10}>无重试</TagText>

      {/* 04 AI 味 —— 压在渐变卡上,附渐变小样作证据 */}
      {chip(506, 128, 152, 44)}
      {mark(520, 147)}
      <TagText x={536} y={155} anchor="start" fill={INK} size={12} mono={false} upper={false}>AI 味渐变</TagText>
      <rect x={614} y={140} width={30} height={20} fill="url(#pb-ai)" stroke={LINE} />
    </svg>
  );
}

/* ② 生成失败现场 → 六份声明 + 两份契约（1.2）。 */
function SinkFlow() {
  /* fp 手绘制式(2026-07):发丝线 + 失败现场虚线框 + 契约侧淡青染面 + 青点点缀 */
  const symptoms = ["空态白屏", "状态色乱", "Badge×Tag", "hardcode 色值", "骨架选错"];
  const decls = ["spec", "domain", "craft", "design.md", "components", "template"];
  return (
    <svg viewBox="0 0 700 356" width="100%" role="img" aria-label="生成失败现场沉淀成声明与契约">
      {/* 上：生成失败现场(虚线框 = 尚未被约束的混沌区) */}
      <FpBox x={20} y={16} w={660} h={92} dashed />
      <FpText x={40} y={40} anchor="start" size={11} mono fill={FP_SUB}>生成失败现场</FpText>
      {symptoms.map((s, i) => <FpPill key={s} x={40 + i * 126} y={54} w={112} label={s} />)}

      {/* 沉淀 edge + 交汇青点 */}
      <FpArrow x1={350} y1={112} x2={350} y2={150} />
      <FpDot cx={350} cy={131} r={4} />
      <FpText x={366} y={136} anchor="start" size={11} fill={FP_SUB}>沉淀成能力</FpText>

      {/* 下左：六份设计声明(实线框) */}
      <FpBox x={20} y={158} w={468} h={182} />
      <FpText x={40} y={182} anchor="start" size={11} mono fill={FP_SUB}>设计声明 · 6</FpText>
      {decls.map((d, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        return <FpPill key={d} x={40 + col * 144} y={200 + row * 54} w={130} label={d} />;
      })}

      {/* 下右：两份执行契约(淡青染面 = 已成为可执行能力) */}
      <FpBox x={504} y={158} w={176} h={182} wash />
      <FpText x={524} y={182} anchor="start" size={11} mono fill={FP_SUB}>执行契约 · 2</FpText>
      <FpPill x={524} y={200} w={136} label="skill" wash />
      <FpPill x={524} y={254} w={136} label="evaluator" wash />
      <FpDot cx={660} cy={200} r={4.5} />
      {/* 声明 → 契约 连接(虚线过渡 + 接点青点) */}
      <FpArrow x1={488} y1={249} x2={504} y2={249} dashed />
      <FpDot cx={496} cy={238} r={3.5} />
    </svg>
  );
}

/* ③ spec 六层：抽象 → 具体，底层为验收（1.2）。 */
function SpecStack() {
  const rows = [
    ["L1", "定位与意图", "功能是什么、为谁做、到哪为止"],
    ["L2", "信息架构", "屏幕分区，各区承载什么"],
    ["L3", "核心链路", "经过哪些状态，怎么流转"],
    ["L4", "组件功能细节", "每个组件各状态如何表现"],
    ["L5", "边界条件", "空 / 加载 / 错误 / 权限"],
    ["L6", "验收标准", "满足哪些条件才算做对"],
  ];
  const x0 = 96, w = 512, h = 44, gap = 8, y0 = 20;
  return (
    /* fp 手绘制式(2026-07):发丝行框,末层验收淡青染面 + 青点收梢;左轴发丝箭头 */
    <svg viewBox="0 0 700 340" width="100%" role="img" aria-label="spec 六层框架">
      <FpArrow x1={54} y1={44} x2={54} y2={296} />
      <FpText x={54} y={30} size={11} mono fill={FP_SUB}>抽象</FpText>
      <FpText x={54} y={318} size={11} mono fill={FP_SUB}>具体</FpText>
      {rows.map(([tag, name, desc], i) => {
        const y = y0 + i * (h + gap);
        const last = i === rows.length - 1;
        return (
          <g key={tag}>
            {last && <rect className="fp-wash" x={x0} y={y} width={w} height={h} fill={FP_WASH} />}
            <rect className="fp-stroke" pathLength={1} x={x0} y={y} width={w} height={h}
              fill="none" stroke={FP_LINE} strokeWidth="1" />
            <FpText x={x0 + 18} y={y + 28} anchor="start" size={12} mono fill={FP_SUB}>{tag}</FpText>
            <FpText x={x0 + 58} y={y + 28} anchor="start" size={13.5}>{name}</FpText>
            <FpText x={x0 + w - 16} y={y + 28} anchor="end" size={11.5} fill={FP_SUB}>{desc}</FpText>
          </g>
        );
      })}
      <FpDot cx={x0 + w} cy={y0 + 5 * (h + gap) + h / 2} r={4.5} />
      <FpDot cx={x0} cy={y0 + h / 2} r={3.5} />
    </svg>
  );
}

/* ④ 同一张首页：AI 默认套路 vs CloudAI 规则（1.2）。 */
function BeforeAfter() {
  /* fp 手绘制式(2026-07):双页线框对照;AI 侧琥珀虚线警示(手稿唯一警示色),规则侧淡青染面+青点 */
  const Page = ({ x, ai }: { x: number; ai: boolean }) => (
    <g>
      <FpBox x={x} y={24} w={300} h={268} />
      {/* header:AI 侧琥珀虚线(渐变大白卡的"味") / 规则侧发丝 + 染面 */}
      {ai ? (
        <rect className="fp-dash" pathLength={1} x={x + 1} y={25} width={298} height="46"
          fill="none" stroke={FP_AMBER} strokeWidth="1" strokeDasharray="0.014 0.014" />
      ) : (
        <rect className="fp-wash" x={x + 1} y={25} width={298} height="46" fill={FP_WASH} />
      )}
      <rect className="fp-wash" x={x + 20} y={42} width={ai ? 120 : 84} height="9" fill={ai ? FP_AMBER : FP_INK} opacity={ai ? 0.5 : 0.75} />
      {/* 内容卡 ×3 */}
      {[0, 1, 2].map((i) => {
        const cx = x + 20 + i * 90;
        return (
          <g key={i}>
            {ai && <rect className="fp-wash" x={cx} y={92} width={44} height="7" fill={FP_SUB} opacity="0.4" />}
            <rect className="fp-stroke" pathLength={1} x={cx} y={ai ? 106 : 92} width={76} height={ai ? 96 : 82}
              fill="none" stroke={FP_LINE} strokeWidth="1" />
            {!ai && i === 0 && <rect className="fp-wash" x={cx + 12} y={104} width={30} height="7" fill={FP_DOT} />}
            {!ai && <rect className="fp-wash" x={cx + 12} y={i === 0 ? 120 : 108} width={52} height="6" fill={FP_SUB} opacity="0.4" />}
          </g>
        );
      })}
      {/* button:AI 侧胶囊琥珀虚线 / 规则侧直角染面 */}
      {ai ? (
        <rect className="fp-dash" pathLength={1} x={x + 20} y={232} width={96} height="28" rx="14"
          fill="none" stroke={FP_AMBER} strokeWidth="1" strokeDasharray="0.02 0.02" />
      ) : (
        <g>
          <rect className="fp-wash" x={x + 20} y={232} width={88} height="28" fill={FP_WASH} />
          <rect className="fp-stroke" pathLength={1} x={x + 20} y={232} width={88} height="28"
            fill="none" stroke={FP_LINE} strokeWidth="1" />
        </g>
      )}
      <FpText x={x + 150} y={284} size={11} mono fill={FP_SUB}>{ai ? "AI 默认套路" : "CLOUDAI 规则"}</FpText>
      {!ai && <FpDot cx={x + 300} cy={24} r={4.5} />}
      {!ai && <FpDot cx={x + 108} cy={246} r={3.5} />}
    </g>
  );
  return (
    <svg viewBox="0 0 700 312" width="100%" role="img" aria-label="AI 默认套路对比 CloudAI 规则">
      <Page x={20} ai />
      <FpArrow x1={334} y1={158} x2={366} y2={158} />
      <FpDot cx={350} cy={146} r={3.5} />
      <Page x={380} ai={false} />
    </svg>
  );
}

/* ⑤ Figma 增强链路：主链路分出 Figma 支路，再回写 IDE（1.3 Demo 2）。 */
function FigmaBranch() {
  const nodes = [
    [70, "理解 / 规划"],
    [250, "信息架构"],
    [430, "视觉规格"],
    [610, "prototype"],
  ] as const;
  const y = 60;
  return (
    /* fp 手绘制式(2026-07):主链路发丝节点;Figma 支路淡青染面 + 虚线往返 + 青点接头 */
    <svg viewBox="0 0 700 220" width="100%" role="img" aria-label="Figma 增强链路">
      {nodes.map(([cx, label], i) => (
        <g key={label}>
          <FpPill x={cx - 58} y={y - 20} w={116} h={40} label={label} />
          {i < nodes.length - 1 && <FpArrow x1={cx + 60} y1={y} x2={nodes[i + 1][0] - 60} y2={y} />}
        </g>
      ))}
      {/* Figma 支路：从视觉规格向下，回到 prototype */}
      <FpArrow x1={430} y1={82} x2={430} y2={132} dashed />
      <FpDot cx={430} cy={82} r={4} />
      <FpPill x={360} y={132} w={140} h={44} label="Figma MCP" wash />
      <path className="fp-dash" pathLength={1} d="M500 154 H600 V80" fill="none"
        stroke={FP_LINE} strokeWidth="1" strokeDasharray="0.03 0.03" strokeLinecap="round" />
      <path className="fp-stroke" pathLength={1} d="M595 90 L600 80 L605 90" fill="none"
        stroke={FP_LINE} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <FpDot cx={600} cy={80} r={4} />
      <FpText x={430} y={200} size={10.5} mono fill={FP_SUB}>复杂设计场景的补充能力</FpText>
    </svg>
  );
}

/* ⑥ 交互起点从「操作」变成「意图」（2.1）。 */
function NodeDot({ x, y, accent = false }: { x: number; y: number; accent?: boolean }) {
  return <circle cx={x} cy={y} r="3.5" fill={accent ? ACCENT : CARD} stroke={accent ? ACCENT : DIM} strokeWidth="1.2" />;
}

function ThinPanel({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="0" fill="transparent" stroke={LINE} />
      {label && <TagText x={x + 14} y={y + 20} anchor="start" fill={DIM} size={10}>{label}</TagText>}
    </g>
  );
}

function LedgerRow({ x, y, w, label, value, accent = false }: {
  x: number; y: number; w: number; label: string; value: string; accent?: boolean;
}) {
  return (
    <g>
      <line x1={x} y1={y + 26} x2={x + w} y2={y + 26} stroke={LINE} />
      <text x={x} y={y + 17} fontSize="12" fill={accent ? ACCENT : INK} fontFamily={SANS}>{label}</text>
      <text x={x + w} y={y + 17} fontSize="11" fill={DIM} textAnchor="end" fontFamily={MONO} letterSpacing="0.6">{value}</text>
    </g>
  );
}

function AgentLoopBlueprint() {
  return (
    <svg viewBox="0 0 700 312" width="100%" role="img" aria-label="Agent Experience Loop">
      <ThinPanel x={34} y={28} w={632} h={236} label="AGENT EXPERIENCE LOOP" />
      <ellipse cx={350} cy={146} rx={220} ry={80} fill="none" stroke={DIM} strokeWidth="1.2" />
      <path d="M230 80 C304 42 420 42 494 80" fill="none" stroke={ACCENT} strokeWidth="1.4" />
      <path d="M470 226 C396 270 304 270 230 226" fill="none" stroke={ACCENT} strokeWidth="1.4" />
      <path d="M486 75 l12 5 -12 5" fill="none" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M214 231 l-12 -5 12 -5" fill="none" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

      <g>
        <circle cx={170} cy={146} r="40" fill={CARD} stroke={LINE} />
        <path d="M158 152 h24 M163 143 a8 8 0 1 1 14 0" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
        <text x={170} y={210} fontSize="14" fill={INK} textAnchor="middle" fontFamily={SANS}>User</text>
        <TagText x={170} y={232} fill={DIM} size={10}>GOALS / CONTEXT</TagText>
      </g>
      <g>
        <circle cx={530} cy={146} r="40" fill="color-mix(in srgb, var(--accent-bright), transparent 88%)" stroke="color-mix(in srgb, var(--accent-bright), transparent 45%)" />
        <rect x={512} y={132} width={36} height={28} rx="6" fill="none" stroke={ACCENT} strokeWidth="1.6" />
        <line x1={522} y1={126} x2={538} y2={126} stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
        <line x1={530} y1={126} x2={530} y2={132} stroke={ACCENT} strokeWidth="1.6" />
        <circle cx={524} cy={146} r="2" fill={ACCENT} /><circle cx={536} cy={146} r="2" fill={ACCENT} />
        <text x={530} y={210} fontSize="14" fill={ACCENT} textAnchor="middle" fontFamily={SANS}>Agent</text>
        <TagText x={530} y={232} fill={DIM} size={10}>ACTION / OUTPUT</TagText>
      </g>
      <TagText x={350} y={74} fill={ACCENT} size={12}>INTENTION-DRIVEN</TagText>
      <TagText x={350} y={254} fill={ACCENT} size={12}>RESULT PRESENTATION</TagText>
      <text x={350} y={151} fontSize="12" fill={FAINT} textAnchor="middle" fontFamily={MONO} letterSpacing="1.2">human-in-the-AI-loop</text>
    </svg>
  );
}

function ProcessTransparencyBlueprint() {
  const phases = [
    ["01", "Planning", ["User input parsing", "Execution plan"]],
    ["02", "Execution", ["Current task", "Reasoning process", "Execution process", "Intermediate result"]],
    ["03", "Summarization", ["Task summary", "Design decision", "Reflection", "Suggestions"]],
  ] as const;
  const colors = [ACCENT, "color-mix(in srgb, var(--accent-bright), transparent 35%)", DIM, FAINT];
  return (
    <svg viewBox="0 0 700 330" width="100%" role="img" aria-label="Agent 过程透明度分层">
      <ThinPanel x={24} y={18} w={652} h={274} label="PROCESS TRANSPARENCY" />
      <line x1={142} y1={44} x2={142} y2={276} stroke={LINE} />
      {phases.map(([no, name, comps], row) => {
        const y = 58 + row * 78;
        return (
          <g key={name}>
            {row > 0 && <line x1={42} y1={y - 22} x2={654} y2={y - 22} stroke={LINE} />}
            <TagText x={54} y={y} anchor="start" fill={FAINT} size={10}>{no}</TagText>
            <text x={54} y={y + 24} fontSize="16" fill={INK} fontFamily={SANS}>{name}</text>
            {comps.map((c, i) => {
              const w = row === 0 ? 132 : row === 1 ? 104 : 112;
              const x = 174 + i * (w + 22);
              return (
                <g key={c}>
                  <rect x={x} y={y - 16} width={w} height="38" rx="0" fill={CARD} stroke={LINE} />
                  <rect x={x} y={y - 16} width={w} height="3" fill={colors[Math.min(i, colors.length - 1)]} />
                  <text x={x + w / 2} y={y + 7} fontSize="10.5" fill={i === 0 ? INK : DIM} textAnchor="middle" fontFamily={SANS}>{c}</text>
                </g>
              );
            })}
          </g>
        );
      })}
      <g transform="translate(44 306)">
        {["Essential", "High", "Medium", "Low"].map((l, i) => (
          <g key={l} transform={`translate(${i * 122} 0)`}>
            <rect width="10" height="10" fill={colors[i]} />
            <text x="18" y="10" fontSize="10.5" fill={DIM} fontFamily={MONO} letterSpacing="0.6">{l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function AgentFlowBlueprint() {
  const steps = ["表达目标", "补齐上下文", "过程协作", "证据呈现", "结果评估", "修正方向"];
  return (
    <svg viewBox="0 0 700 236" width="100%" role="img" aria-label="Agent Experience Loop 流转图">
      <ThinPanel x={30} y={28} w={640} h={166} label="INTENT FLOW" />
      {steps.map((step, i) => {
        const x = 76 + i * 108;
        return (
          <g key={step}>
            <NodeDot x={x} y={112} accent={i === 0 || i === 5} />
            <line x1={x - 38} y1={112} x2={x - 8} y2={112} stroke={i === 0 ? "transparent" : DIM} strokeDasharray="2 5" />
            <line x1={x + 8} y1={112} x2={x + 38} y2={112} stroke={i === steps.length - 1 ? "transparent" : DIM} strokeDasharray="2 5" />
            <text x={x} y={86} fontSize="11" fill={i === 0 || i === 5 ? ACCENT : INK} textAnchor="middle" fontFamily={SANS}>{step}</text>
            <TagText x={x} y={148} fill={FAINT} size={9}>{String(i + 1).padStart(2, "0")}</TagText>
          </g>
        );
      })}
      <path d="M614 132 C548 206 154 206 86 132" fill="none" stroke={ACCENT} strokeWidth="1.2" strokeDasharray="2 6" />
      <path d="M92 132 l-9 1 5 8" fill="none" stroke={ACCENT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <TagText x={350} y={210} fill={ACCENT} size={10}>CONTINUOUS FEEDBACK</TagText>
    </svg>
  );
}

function GenUIStructureBlueprint() {
  const inputs = [
    ["数据", "DATA", 120],
    ["组件", "COMPONENTS", 286],
    ["场景", "SCENE", 452],
    ["规则", "SCHEMA", 536],
  ] as const;
  return (
    <svg viewBox="0 0 700 390" width="100%" role="img" aria-label="GenUI 结构图">
      <ThinPanel x={88} y={76} w={524} h={166} label="A2UI RENDERER" />
      <line x1={350} y1={48} x2={350} y2={76} stroke={DIM} />
      <path d="M345 54 L350 48 L355 54" fill="none" stroke={DIM} strokeWidth="1.2" />
      <rect x={246} y={18} width={208} height="38" rx="0" fill="transparent" stroke={LINE} />
      <text x={350} y={43} fontSize="15" fill={INK} textAnchor="middle" fontFamily={SANS}>用户 / USER</text>
      <line x1={350} y1={242} x2={350} y2={276} stroke={DIM} />
      <path d="M345 270 L350 276 L355 270" fill="none" stroke={DIM} strokeWidth="1.2" />
      {inputs.map(([cn, en, x], i) => (
        <g key={en}>
          <rect x={x - 70} y={288 + (i > 1 ? 46 : 0)} width={140} height="40" rx="0" fill="transparent" stroke={LINE} />
          <text x={x} y={313 + (i > 1 ? 46 : 0)} fontSize="14" fill={INK} textAnchor="middle" fontFamily={SANS}>{cn}</text>
          <TagText x={x} y={344 + (i > 1 ? 46 : 0)} fill={DIM} size={9}>{en}</TagText>
        </g>
      ))}
      <TagText x={350} y={162} fill={ACCENT} size={12}>REAL-TIME EXPERIENCE COMPOSITION</TagText>
      <line x1={190} y1={360} x2={510} y2={360} stroke={LINE} strokeDasharray="2 6" />
    </svg>
  );
}

function GenUIDecisionBlueprint() {
  const rows = [
    ["任务路径会变化", "否", "稳定页面"],
    ["需要用户判断", "是", "A2UI / FlexCard"],
    ["结果需要沉淀", "是", "GenReport"],
    ["组件与规则可约束", "是", "进入 GenUI"],
  ];
  return (
    <svg viewBox="0 0 700 260" width="100%" role="img" aria-label="GenUI 决策树">
      <ThinPanel x={44} y={26} w={612} h={190} label="GENUI DECISION" />
      {rows.map(([q, ans, out], i) => {
        const y = 62 + i * 38;
        return (
          <g key={q}>
            <LedgerRow x={78} y={y} w={250} label={q} value={ans} accent={i === rows.length - 1} />
            <line x1={342} y1={y + 13} x2={408} y2={y + 13} stroke={DIM} strokeDasharray="2 5" />
            <rect x={424} y={y - 4} width={166} height="24" rx="0"
              fill={i === rows.length - 1 ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : "transparent"}
              stroke={i === rows.length - 1 ? "color-mix(in srgb, var(--accent-bright), transparent 55%)" : LINE} />
            <text x={507} y={y + 12} fontSize="11" fill={i === rows.length - 1 ? ACCENT : INK} textAnchor="middle" fontFamily={SANS}>{out}</text>
          </g>
        );
      })}
      <TagText x={350} y={238} fill={DIM} size={10}>ONLY GENERATE WHERE THE TASK CHANGES</TagText>
    </svg>
  );
}

function GenUITwoMechanismsBlueprint() {
  return (
    <svg viewBox="0 0 700 360" width="100%" role="img" aria-label="GenUI 两类机制">
      <rect x="0" y="0" width="700" height="360" fill="var(--surface-1)" />
      <rect x="28" y="34" width="644" height="256" fill="none" stroke={LINE} />
      <text x="48" y="62" fontSize="10" fill={DIM} fontFamily={MONO} letterSpacing="1.4">GENUI OUTPUT FORMS</text>
      <line x1="350" y1="80" x2="350" y2="274" stroke={LINE} />

      <text x="184" y="96" fontSize="18" fill={INK} textAnchor="middle" fontFamily={SANS}>过程协作</text>
      <TagText x={184} y={120} fill={DIM} size={10}>PROCESS UI</TagText>
      <text x="516" y="96" fontSize="18" fill={INK} textAnchor="middle" fontFamily={SANS}>结果产物</text>
      <TagText x={516} y={120} fill={DIM} size={10}>ARTIFACT UI</TagText>

      <g aria-label="对话中的 FlexCard">
        <rect x={78} y={146} width={214} height={92} fill="transparent" stroke={LINE} strokeDasharray="2 6" />
        <circle cx={100} cy={170} r="5" fill={ACCENT} opacity="0.8" />
        <rect x={116} y={164} width={118} height="8" rx="4" fill={FAINT} />
        <rect x={116} y={190} width={152} height="30" fill={CARD} stroke="color-mix(in srgb, var(--accent-bright), transparent 56%)" />
        <rect x={132} y={202} width={58} height="6" rx="3" fill={DIM} opacity="0.55" />
        <rect x={208} y={198} width={42} height="14" fill="color-mix(in srgb, var(--accent-bright), transparent 24%)" />
        <path d="M116 258 C148 274 220 274 252 258" fill="none" stroke={ACCENT} strokeWidth="1.1" strokeDasharray="2 6" />
        <TagText x={184} y={286} fill={ACCENT} size={10}>A2UI / FLEXCARD</TagText>
      </g>

      <g aria-label="生成报告">
        <rect x={420} y={136} width={192} height={124} fill={CARD} stroke={LINE} />
        <rect x={444} y={160} width={78} height="7" rx="3.5" fill={DIM} />
        <rect x={444} y={178} width={126} height="5" rx="2.5" fill={FAINT} />
        <rect x={444} y={202} width={38} height={26} fill="transparent" stroke={LINE} />
        <rect x={500} y={202} width={38} height={26} fill="transparent" stroke={LINE} />
        <rect x={556} y={202} width={38} height={26} fill="transparent" stroke={LINE} />
        <polyline points="444,246 476,238 508,248 548,226 594,240" fill="none" stroke={ACCENT} strokeWidth="1.3" />
        <TagText x={516} y={286} fill={ACCENT} size={10}>GENREPORT</TagText>
      </g>

      <TagText x={184} y={326} fill={DIM} size={10}>SERVE COLLABORATION</TagText>
      <TagText x={516} y={326} fill={DIM} size={10}>SERVE EVALUATION</TagText>
    </svg>
  );
}

function A2UIContractBlueprint() {
  const layers = ["Agent 可声明", "结构化 UI 描述", "客户端约束", "用户界面"];
  return (
    <svg viewBox="0 0 700 250" width="100%" role="img" aria-label="A2UI 契约分层">
      <ThinPanel x={42} y={36} w={616} h={150} label="A2UI CONTRACT" />
      {layers.map((l, i) => {
        const x = 82 + i * 152;
        return (
          <g key={l}>
            <rect x={x} y={86} width={112} height="54" rx="0"
              fill={i === 1 ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : CARD}
              stroke={i === 1 ? "color-mix(in srgb, var(--accent-bright), transparent 50%)" : LINE} />
            <text x={x + 56} y={116} fontSize="12" fill={i === 1 ? ACCENT : INK} textAnchor="middle" fontFamily={SANS}>{l}</text>
            {i < layers.length - 1 && <Arrow x1={x + 116} y1={113} x2={x + 146} y2={113} accent={i === 0} />}
          </g>
        );
      })}
      <TagText x={140} y={166} fill={DIM} size={9}>INTENT / DATA / ACTION</TagText>
      <TagText x={292} y={166} fill={ACCENT} size={9}>CONTRACT</TagText>
      <TagText x={444} y={166} fill={DIM} size={9}>TOKEN / A11Y / FALLBACK</TagText>
      <TagText x={596} y={166} fill={DIM} size={9}>FLEXCARD</TagText>
    </svg>
  );
}

function A2UIRuntimeBlueprint() {
  return (
    <svg viewBox="0 0 700 360" width="100%" role="img" aria-label="A2UI 运行机制">
      <ThinPanel x={48} y={70} w={604} h={176} label="A2UI RENDERER" />

      <rect x={252} y={24} width={196} height="42" fill="transparent" stroke={LINE} />
      <text x={350} y={51} fontSize="15" fill={INK} textAnchor="middle" fontFamily={SANS}>用户 / USER</text>
      <Arrow x1={350} y1={66} x2={350} y2={106} dashed />
      <TagText x={382} y={96} fill={DIM} size={9}>INTENT</TagText>

      <rect x={102} y={132} width={156} height="62" fill={CARD} stroke={LINE} />
      <text x={180} y={158} fontSize="13" fill={INK} textAnchor="middle" fontFamily={SANS}>Agent</text>
      <TagText x={180} y={178} fill={DIM} size={9}>DECLARE UI</TagText>

      <rect x={282} y={132} width={136} height="62"
        fill="color-mix(in srgb, var(--accent-bright), transparent 91%)"
        stroke="color-mix(in srgb, var(--accent-bright), transparent 54%)" />
      <text x={350} y={157} fontSize="13" fill={ACCENT} textAnchor="middle" fontFamily={SANS}>A2UI 契约</text>
      <TagText x={350} y={178} fill={ACCENT} size={9}>DECLARE · ACT</TagText>

      <rect x={442} y={132} width={156} height="62" fill={CARD} stroke={LINE} />
      <text x={520} y={158} fontSize="13" fill={INK} textAnchor="middle" fontFamily={SANS}>客户端 UI</text>
      <TagText x={520} y={178} fill={DIM} size={9}>RENDER CARD</TagText>

      <Arrow x1={258} y1={163} x2={282} y2={163} accent />
      <Arrow x1={418} y1={163} x2={442} y2={163} accent />
      <path d="M520 194 V222 H180 V194" fill="none" stroke={DIM} strokeWidth="1.15" strokeDasharray="2 6" />
      <path d="M185 201 L180 194 L175 201" fill="none" stroke={DIM} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <TagText x={350} y={222} fill={DIM} size={9}>RETURN USER ACTION</TagText>

      <line x1={350} y1={246} x2={350} y2={272} stroke={LINE} />
      <rect x={100} y={272} width={142} height="44" fill="transparent" stroke={LINE} />
      <rect x={268} y={272} width={164} height="44" fill="transparent" stroke={LINE} />
      <rect x={458} y={272} width={142} height="44" fill="transparent" stroke={LINE} />
      <text x={171} y={299} fontSize="12" fill={INK} textAnchor="middle" fontFamily={SANS}>数据 / DATA</text>
      <text x={350} y={299} fontSize="11.2" fill={INK} textAnchor="middle" fontFamily={SANS}>组件 / COMPONENTS</text>
      <text x={529} y={299} fontSize="12" fill={INK} textAnchor="middle" fontFamily={SANS}>规则 / SCHEMA</text>
      <TagText x={350} y={344} fill={ACCENT} size={10}>STRUCTURED UI DESCRIPTION</TagText>
    </svg>
  );
}

function A2UIMessageMapBlueprint() {
  const rows = [
    ["intent", "卡片意图", "diagnose_instance"],
    ["status", "任务状态", "needs_confirmation"],
    ["title", "标题", "实例运行异常"],
    ["summary", "异常摘要", "CPU 109.89% / 会话 80"],
    ["content", "主体内容", "SQL 与执行计划"],
    ["actions", "用户动作", "查看详情 / 异常诊断"],
    ["behavior", "执行规则", "确认前暂停"],
  ];

  return (
    <div
      role="img"
      aria-label="A2UI 消息到 FlexCard"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 0.95fr) 30px minmax(0, 1.35fr)",
        alignItems: "center",
        gap: 18,
        padding: "18px 10px",
      }}
    >
      <div
        style={{
          border: `1px solid ${LINE}`,
          background: "color-mix(in srgb, var(--surface-1), transparent 12%)",
          padding: "18px 18px 16px",
          minHeight: 316,
        }}
      >
        <div style={{ color: DIM, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em" }}>A2UI MESSAGE</div>
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gap: 9,
          }}
        >
          {rows.map(([field, label, value]) => (
            <div
              key={field}
              style={{
                display: "grid",
                gridTemplateColumns: "76px minmax(0, 1fr)",
                rowGap: 2,
                columnGap: 10,
                padding: "8px 0",
                borderBottom: `1px solid ${LINE}`,
              }}
            >
              <div style={{ color: ACCENT, fontFamily: MONO, fontSize: 12 }}>{field}</div>
              <div style={{ color: INK, fontFamily: SANS, fontSize: 12, fontWeight: 600 }}>{label}</div>
              <div />
              <div style={{ color: DIM, fontFamily: MONO, fontSize: 10.5, whiteSpace: "normal", lineHeight: 1.45 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 30 120" width="30" height="120" aria-hidden="true">
        <path d="M2 60H24" fill="none" stroke={ACCENT} strokeWidth="1.4" strokeDasharray="2 5" />
        <path d="M21 53L28 60L21 67" fill="none" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div
        style={{
          border: `1px solid ${LINE}`,
          background: "var(--surface-1)",
          padding: 12,
        }}
      >
        <div style={{ margin: "0 0 10px 0" }}>
          <div style={{ color: DIM, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em" }}>RENDERED FLEXCARD</div>
        </div>
        <img
          src="/figures/fig-2-8-flexcard.png"
          alt="FlexCard 实例运行异常卡片"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
        />
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          textAlign: "center",
          color: DIM,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.18em",
          marginTop: -4,
        }}
      >
        STRUCTURED MESSAGE · CONTROLLED RENDERING
      </div>
    </div>
  );
}

function CaseFlowBlueprint() {
  const nodes = [
    ["OmniBox", "意图表达", 110],
    ["Agent", "理解并推进", 270],
    ["FlexCard", "过程协作", 430],
    ["GenReport", "结果评估", 590],
  ] as const;
  return (
    <svg viewBox="0 0 700 220" width="100%" role="img" aria-label="OmniBox FlexCard GenReport 任务链路">
      <ThinPanel x={28} y={42} w={644} h={112} label="AGENTIC PRODUCT FLOW" />
      {nodes.map(([name, sub, x], i) => (
        <g key={name}>
          <NodeDot x={x} y={98} accent={i === 0 || i === nodes.length - 1} />
          <text x={x} y={78} fontSize="13" fill={i === 0 || i === nodes.length - 1 ? ACCENT : INK} textAnchor="middle" fontFamily={MONO}>{name}</text>
          <text x={x} y={128} fontSize="11" fill={DIM} textAnchor="middle" fontFamily={SANS}>{sub}</text>
          {i < nodes.length - 1 && <line x1={x + 12} y1={98} x2={nodes[i + 1][2] - 12} y2={98} stroke={DIM} strokeDasharray="2 6" />}
        </g>
      ))}
      <path d="M430 154 C388 190 310 190 270 154" fill="none" stroke={ACCENT} strokeWidth="1.2" strokeDasharray="2 5" />
      <TagText x={350} y={198} fill={DIM} size={10}>USER DECISION RETURNS TO AGENT CONTEXT</TagText>
    </svg>
  );
}

function OmniBoxStructureBlueprint() {
  const chips = ["自然语言目标", "数据范围", "知识库", "指标对象", "历史上下文"];
  return (
    <svg viewBox="0 0 700 230" width="100%" role="img" aria-label="OmniBox 输入结构">
      <ThinPanel x={52} y={38} w={596} h={134} label="OMNIBOX" />
      <rect x={86} y={72} width={370} height="8" rx="4" fill={FAINT} />
      <rect x={86} y={92} width={260} height="8" rx="4" fill={FAINT} />
      {chips.map((c, i) => {
        const x = 86 + (i % 3) * 168;
        const y = 124 + Math.floor(i / 3) * 36;
        return (
          <g key={c}>
            <rect x={x} y={y} width={142} height="24" rx="0" fill={i === 0 ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : "transparent"} stroke={i === 0 ? "color-mix(in srgb, var(--accent-bright), transparent 55%)" : LINE} />
            <text x={x + 71} y={y + 16} fontSize="10.5" fill={i === 0 ? ACCENT : INK} textAnchor="middle" fontFamily={SANS}>{c}</text>
          </g>
        );
      })}
      <Arrow x1={546} y1={104} x2={616} y2={104} accent />
      <TagText x={582} y={134} fill={ACCENT} size={9}>TASK CONTEXT</TagText>
    </svg>
  );
}

function FlexCardDecisionBlueprint() {
  return (
    <svg viewBox="0 0 700 260" width="100%" role="img" aria-label="FlexCard 决策卡">
      <ThinPanel x={46} y={40} w={284} h={158} label="ANALYSIS DIRECTION" />
      <ThinPanel x={370} y={40} w={284} h={158} label="AUTHORIZATION" />
      {["按产业拆解", "按品牌拆解", "按门店拆解"].map((t, i) => (
        <g key={t}>
          <rect x={78} y={78 + i * 32} width={210} height="23" rx="0" fill={i === 0 ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : "transparent"} stroke={i === 0 ? "color-mix(in srgb, var(--accent-bright), transparent 55%)" : LINE} />
          <text x={96} y={94 + i * 32} fontSize="10.5" fill={i === 0 ? ACCENT : INK} fontFamily={SANS}>{t}</text>
        </g>
      ))}
      <circle cx={402} cy={92} r="8" fill="none" stroke="#C98A2B" strokeWidth="1.3" />
      <line x1={402} y1={87} x2={402} y2={94} stroke="#C98A2B" strokeWidth="1.3" strokeLinecap="round" />
      <rect x={424} y={84} width={178} height="8" rx="4" fill={FAINT} />
      <rect x={424} y={106} width={134} height="8" rx="4" fill={FAINT} />
      <rect x={424} y={144} width={72} height="26" rx="0" fill={ACCENT} opacity="0.86" />
      <rect x={512} y={144} width={72} height="26" rx="0" fill="transparent" stroke={LINE} />
      <TagText x={350} y={230} fill={DIM} size={10}>USER CONFIRMATION BEFORE AGENT CONTINUES</TagText>
    </svg>
  );
}

function GenReportArtifactBlueprint() {
  return (
    <svg viewBox="0 0 700 340" width="100%" role="img" aria-label="GenReport Artifact">
      <ThinPanel x={116} y={26} w={468} h={268} label="GENREPORT ARTIFACT" />
      <rect x={154} y={62} width={210} height="14" rx="0" fill={INK} opacity="0.8" />
      <rect x={154} y={92} width={142} height="7" rx="3.5" fill={FAINT} />
      <line x1={154} y1={118} x2={546} y2={118} stroke={LINE} />
      {["指标概览", "核心洞察", "风险总结"].map((t, i) => (
        <g key={t}>
          <rect x={154 + i * 132} y={140} width={110} height="54" rx="0" fill={i === 1 ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : CARD} stroke={i === 1 ? "color-mix(in srgb, var(--accent-bright), transparent 55%)" : LINE} />
          <text x={209 + i * 132} y={172} fontSize="11" fill={i === 1 ? ACCENT : INK} textAnchor="middle" fontFamily={SANS}>{t}</text>
        </g>
      ))}
      <rect x={154} y={216} width={392} height="44" rx="0" fill="transparent" stroke={LINE} />
      <polyline points="178,246 226,232 272,240 326,220 378,236 436,224 520,244" fill="none" stroke={ACCENT} strokeWidth="1.3" />
      <TagText x={350} y={318} fill={DIM} size={10}>SAVE · SHARE · CONTINUE TRACKING</TagText>
    </svg>
  );
}

/* ⑥ 交互起点从「操作」变成「意图」（2.1）。 */
function IntentShift() {
  const gui = ["页面", "菜单", "表单", "按钮"];
  const intent = ["目标", "上下文", "判断", "下一步界面"];
  const Col = ({ x, title, items, accent }: { x: number; title: string; items: string[]; accent?: boolean }) => (
    <g>
      <Box x={x} y={16} w={272} h={188} stroke={accent ? "color-mix(in srgb, var(--accent-bright), transparent 55%)" : LINE} />
      <TagText x={x + 20} y={40} anchor="start" fill={accent ? ACCENT : DIM}>{title}</TagText>
      {items.map((it, i) => <Pill key={it} x={x + 20} y={58 + i * 34} w={232} label={it} accent={accent} />)}
    </g>
  );
  return (
    <svg viewBox="0 0 700 220" width="100%" role="img" aria-label="GUI 指令与用户意图对比">
      <Col x={20} title="GUI · 指令" items={gui} />
      <Arrow x1={304} y1={110} x2={396} y2={110} accent />
      <TagText x={350} y={98} fill={ACCENT} size={10}>起点变了</TagText>
      <Col x={408} title="意图 · INTENT" items={intent} accent />
    </svg>
  );
}

/* ⑦ A2UI 闭环：声明意图 → 契约 → 渲染 → 动作回传（2.2）。 */
function A2UILoop() {
  const nodes = [
    { x: 60, y: 40, w: 200, label: "Agent 声明界面意图" },
    { x: 440, y: 40, w: 200, label: "A2UI 契约" },
    { x: 440, y: 190, w: 200, label: "客户端渲染" },
    { x: 60, y: 190, w: 200, label: "用户动作回传" },
  ];
  return (
    <svg viewBox="0 0 700 280" width="100%" role="img" aria-label="A2UI 运行闭环">
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x} y={n.y} width={n.w} height={48} rx="8"
            fill={i === 1 ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : CARD}
            stroke={i === 1 ? "color-mix(in srgb, var(--accent-bright), transparent 50%)" : LINE} />
          <text x={n.x + n.w / 2} y={n.y + 29} fontSize="13.5" fill={i === 1 ? ACCENT : INK} textAnchor="middle" fontFamily={SANS}>{n.label}</text>
        </g>
      ))}
      <Arrow x1={260} y1={64} x2={440} y2={64} />
      <Arrow x1={540} y1={88} x2={540} y2={190} />
      <Arrow x1={440} y1={214} x2={260} y2={214} />
      <Arrow x1={160} y1={190} x2={160} y2={88} accent />
      <TagText x={350} y={58} fill={DIM} size={10}>声明</TagText>
      <TagText x={556} y={143} anchor="start" fill={DIM} size={10}>渲染</TagText>
      <TagText x={350} y={234} fill={DIM} size={10}>动作</TagText>
      <TagText x={144} y={143} anchor="end" fill={ACCENT} size={10}>回传</TagText>
    </svg>
  );
}

/* ⑧ 生成式 UI 的边界：稳定页面仍在，运行时界面只覆盖任务变化处（2.3）。 */
function GenUIBoundary() {
  return (
    <svg viewBox="0 0 700 260" width="100%" role="img" aria-label="生成式 UI 的边界">
      {/* 左：稳定页面（预先设计） */}
      <Box x={20} y={20} w={300} h={200} />
      <rect x={40} y={40} width={120} height="12" rx="6" fill={FAINT} />
      {[0, 1, 2].map((i) => <rect key={i} x={40} y={74 + i * 40} width={260} height="26" rx="6" fill={CARD2} stroke={LINE} />)}
      <TagText x={170} y={208} fill={DIM} size={10}>稳定页面 · 预先设计</TagText>

      <Arrow x1={334} y1={120} x2={366} y2={120} />

      {/* 右：同一页面，仅任务变化处由运行时界面接管（靛蓝） */}
      <Box x={380} y={20} w={300} h={200} />
      <rect x={400} y={40} width={120} height="12" rx="6" fill={FAINT} />
      <rect x={400} y={74} width={260} height="26" rx="6" fill={CARD2} stroke={LINE} />
      <rect x={400} y={114} width={260} height="66" rx="8"
        fill="color-mix(in srgb, var(--accent-bright), transparent 88%)"
        stroke="color-mix(in srgb, var(--accent-bright), transparent 50%)" strokeDasharray="3 4" />
      <text x={530} y={151} fontSize="12" fill={ACCENT} textAnchor="middle" fontFamily={SANS}>运行时界面</text>
      <TagText x={530} y={208} fill={ACCENT} size={10}>围绕任务组织</TagText>
    </svg>
  );
}

/* ⑨ OmniBox → FlexCard → GenReport：输入 / 交互 / 输出（2.4）。 */
function CaseFlow() {
  const nodes = [
    { x: 110, label: "OmniBox", tag: "输入" },
    { x: 350, label: "FlexCard", tag: "交互" },
    { x: 590, label: "GenReport", tag: "输出" },
  ] as const;
  const y = 70;
  return (
    <svg viewBox="0 0 700 160" width="100%" role="img" aria-label="OmniBox 到 FlexCard 到 GenReport 流程">
      {nodes.map((n, i) => (
        <g key={n.label}>
          <rect x={n.x - 80} y={y - 26} width={160} height={52} rx="9" fill={CARD} stroke={LINE} />
          <text x={n.x} y={y + 5} fontSize="15" fill={INK} textAnchor="middle" fontFamily={MONO} letterSpacing="0.5">{n.label}</text>
          <TagText x={n.x} y={y + 52} fill={ACCENT} size={11}>{n.tag}</TagText>
          {i < nodes.length - 1 && <Arrow x1={n.x + 82} y1={y} x2={nodes[i + 1].x - 82} y2={y} accent />}
        </g>
      ))}
    </svg>
  );
}

/* ⑩ OmniBox 输入态：自然语言 + 结构化引用 + 上下文材料同框（2.4）。 */
function OmniBoxShot() {
  return (
    <svg viewBox="0 0 700 190" width="100%" role="img" aria-label="OmniBox 输入态">
      <Box x={40} y={30} w={620} h={130} />
      <rect x={40} y={30} width={620} height="4" fill="none" />
      {/* 输入文本 */}
      <rect x={64} y={56} width={360} height="9" rx="4.5" fill={FAINT} />
      <rect x={64} y={74} width={240} height="9" rx="4.5" fill={FAINT} />
      {/* 三类材料 chip */}
      <g>
        <rect x={64} y={108} width={132} height="30" rx="15" fill={CARD2} stroke={LINE} />
        <circle cx={82} cy={123} r="4" fill={ACCENT} />
        <text x={98} y={127} fontSize="12" fill={INK} fontFamily={SANS}>自然语言</text>
      </g>
      <g>
        <rect x={208} y={108} width={150} height="30" rx="15" fill="color-mix(in srgb, var(--accent-bright), transparent 88%)" stroke="color-mix(in srgb, var(--accent-bright), transparent 55%)" />
        <text x={226} y={127} fontSize="12" fill={ACCENT} fontFamily={MONO}>@ 结构化引用</text>
      </g>
      <g>
        <rect x={370} y={108} width={140} height="30" rx="15" fill={CARD2} stroke={LINE} />
        <rect x={386} y={116} width={12} height="14" rx="2" fill="none" stroke={DIM} strokeWidth="1.2" />
        <text x={410} y={127} fontSize="12" fill={INK} fontFamily={SANS}>上下文材料</text>
      </g>
      {/* 发送 */}
      <rect x={584} y={104} width={52} height="38" rx="8" fill={ACCENT} />
      <path d="M604 123 h14 M613 116 l7 7 -7 7" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ⑪ FlexCard 示例：方案选择 / 风险确认 / 状态监控（2.4）。 */
function FlexCardShot() {
  const cards: [string, "choice" | "risk" | "status"][] = [["方案选择", "choice"], ["风险确认", "risk"], ["状态监控", "status"]];
  return (
    <svg viewBox="0 0 700 210" width="100%" role="img" aria-label="FlexCard 三种状态示例">
      {cards.map(([label, kind], i) => {
        const x = 20 + i * 226;
        return (
          <g key={label}>
            <Box x={x} y={20} w={206} h={170} />
            <TagText x={x + 18} y={44} anchor="start" fill={DIM}>{label}</TagText>
            <rect x={x + 18} y={58} width={140} height="8" rx="4" fill={FAINT} />
            {kind === "choice" && [0, 1].map((r) => (
              <rect key={r} x={x + 18} y={82 + r * 34} width={170} height="26" rx="6"
                fill={r === 0 ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : CARD2}
                stroke={r === 0 ? "color-mix(in srgb, var(--accent-bright), transparent 55%)" : LINE} />
            ))}
            {kind === "risk" && (<>
              <circle cx={x + 28} cy={96} r="7" fill="none" stroke="#C98A2B" strokeWidth="1.6" />
              <path d={`M${x + 28} 92 v5 M${x + 28} 100 v0.5`} stroke="#C98A2B" strokeWidth="1.6" strokeLinecap="round" />
              <rect x={x + 44} y={90} width={130} height="8" rx="4" fill={FAINT} />
              <rect x={x + 18} y={132} width={80} height="30" rx="6" fill={ACCENT} />
              <rect x={x + 106} y={132} width={80} height="30" rx="6" fill="none" stroke={LINE} />
            </>)}
            {kind === "status" && [0, 1, 2].map((r) => (
              <g key={r}>
                <circle cx={x + 26} cy={92 + r * 30} r="4" fill={["#5E8C6A", "var(--accent-bright)", "#C98A2B"][r]} />
                <rect x={x + 40} y={88 + r * 30} width={140} height="8" rx="4" fill={FAINT} />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ⑫ GenReport 成品页：对话结果凝结成可阅读的交付物（2.4）。 */
function GenReportShot() {
  return (
    <svg viewBox="0 0 700 300" width="100%" role="img" aria-label="GenReport 成品报告页">
      <Box x={140} y={16} w={420} h={268} />
      <rect x={170} y={44} width={220} height="16" rx="4" fill={INK} opacity="0.82" />
      <rect x={170} y={70} width={140} height="9" rx="4.5" fill={FAINT} />
      <line x1={170} y1={96} x2={530} y2={96} stroke={LINE} />
      {/* 正文段 */}
      {[0, 1, 2].map((i) => <rect key={i} x={170} y={112 + i * 16} width={i === 2 ? 260 : 360} height="8" rx="4" fill={FAINT} />)}
      {/* 图表块（靛蓝） */}
      <rect x={170} y={178} width={360} height="80" rx="8" fill={CARD2} stroke={LINE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={190 + i * 64} y={238 - (i % 3) * 22 - 14} width={30} height={(i % 3) * 22 + 14} rx="2"
          fill={i === 2 ? ACCENT : "color-mix(in srgb, var(--accent-bright), transparent 55%)"} />
      ))}
      <TagText x={350} y={276} fill={DIM} size={10}>GENREPORT · 可阅读交付物</TagText>
    </svg>
  );
}

/* 媒体井：skill 演示 gif / mp4（需求5 在正文内的落位），保持描边图版气质。
   .mp4 走 <video> 静音循环自播(等同 gif 观感,体积小一个量级),角标随类型显示 GIF/MP4。 */
function MediaWell({ gif, alt }: { gif?: string; alt: string }) {
  if (!gif) {
    return (
      <div className="pr-media pr-media--empty" role="img" aria-label={alt}>
        <span className="pr-media-tag">GIF</span>
      </div>
    );
  }
  const isVideo = gif.endsWith(".mp4");
  return (
    <div className="pr-media">
      {isVideo ? (
        <video
          className="pr-media-img"
          src={asset(gif)}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-label={alt}
        />
      ) : (
        <img className="pr-media-img" src={asset(gif)} alt={alt} loading="lazy" decoding="async" />
      )}
      <span className="pr-media-tag">{isVideo ? "MP4" : "GIF"}</span>
    </div>
  );
}

/* —— 路由：把 🖼️ 占位文本映射到具体图版 —— */
export type DiagramSpec =
  | { render: "svg"; which:
      | "problem-board" | "sink-flow" | "spec-stack" | "before-after" | "skill-section" | "figma-branch" | "designio"
      | "agent-loop" | "process-transparency" | "agent-flow" | "genui-structure" | "genui-decision" | "genui-mechanisms"
      | "a2ui-contract" | "a2ui-runtime" | "a2ui-message-map" | "case-flow-v2" | "omnibox-structure" | "flexcard-decision" | "genreport-artifact"
      | "intent-shift" | "a2ui-loop" | "genui-boundary" | "case-flow" | "omnibox-shot" | "flexcard-shot" | "genreport-shot";
      caption: string; no?: string;
      /* fp 手绘图版制式外壳(第一章):有 plate 则用 Plate 渲染,标题栏替代外部图注 */
      plate?: { no: string; title: string; sub: string } }
  | { render: "themed"; light: string; dark: string; w: number; h: number; caption: string; no?: string }
  | { render: "image"; light: string; dark: string; caption: string; no?: string; wide?: boolean }
  | { render: "media"; gif?: string; caption: string; no?: string };

export function matchDiagram(raw: string): DiagramSpec {
  const t = raw;
  const has = (...ks: string[]) => ks.every((k) => t.includes(k));
  // 架构 / 示意图
  if (has("调度看板", "问题版")) return { render: "svg", which: "problem-board", caption: "Agent 调度看板「问题版」：四处毛病各有归属",
    plate: { no: "01", title: "问题版看板", sub: "四处毛病 · 各有归属" } };
  if (has("六份声明") || has("横向链路", "生成失败") || t.includes("问题如何沉淀"))
    return { render: "svg", which: "sink-flow", caption: "生成失败现场，沉淀成六份设计声明与两份执行契约",
      plate: { no: "01", title: "问题沉淀", sub: "六份声明 · 两份契约" } };
  if (has("六层") && (t.includes("金字塔") || t.includes("楼层")))
    return { render: "svg", which: "spec-stack", caption: "spec 六层：从定位与意图到验收，自抽象到具体",
      plate: { no: "02", title: "spec 六层", sub: "自抽象 · 到具体" } };
  if (t.includes("CloudAI 首页") || has("左侧是 AI"))
    return { render: "svg", which: "before-after", caption: "同一张首页：AI 默认套路 vs. CloudAI 规则",
      plate: { no: "03", title: "同一张首页", sub: "AI 默认套路 · CloudAI 规则" } };
  if (t.includes("剖面图"))
    return { render: "svg", which: "skill-section", caption: "cloudai-picker 剖面：触发 / 流程 / 按需引用 / 沉淀的坑",
      plate: { no: "01", title: "skill 剖面", sub: "触发 · 流程 · 细节 · 沉淀" } };
  if (has("Demo 2") || has("Figma 支路"))
    return { render: "svg", which: "figma-branch", caption: "Figma 增强链路：主链路分出 Figma 支路，再回写 IDE",
      plate: { no: "02", title: "Figma 支路", sub: "主链路分支 · 回写 IDE" } };
  // GIF / Demo 演示 —— 正文内 skill 演示
  if (has("六层 spec")) return { render: "media", gif: "/gifs/01-visual-spec.gif", no: "DEMO", caption: "规划阶段：把需求定义成结构化 spec 与视觉规格" };
  if (has("模版库") || t.includes("cloudai-picker` 从")) return { render: "media", gif: "/gifs/02-picker.gif", no: "DEMO", caption: "cloudai-picker 从模版库选出调度看板骨架" };
  if (has("variant", "变体")) return { render: "media", gif: "/gifs/03-variant.gif", no: "DEMO", caption: "variant 在画布上展开三种信息架构变体" };
  if (has("槽位被填满")) return { render: "media", gif: "/gifs/06-components.gif", no: "DEMO", caption: "组件语义分槽：状态 Badge、风险 RiskBadge、资源 Tag，敏感字段默认脱敏" };
  if (has("空态", "骨架屏")) return { render: "media", gif: "/gifs/07-states.gif", no: "DEMO", caption: "同一看板补齐五个非理想状态，每个都标注回到哪份声明" };
  if (has("evaluator", "逐项检查")) return { render: "media", gif: "/gifs/05b-report.gif", no: "DEMO", caption: "evaluator 逐项检查并回流到对应声明" };
  if (has("Demo 1")) return { render: "media", gif: "/videos/case1-main-chain.mp4", no: "DEMO", caption: "主链路演示：一句话逐步生成可交付页面" };
  if (has("增强链路实录")) return { render: "media", gif: "/videos/case2-figma-branch.mp4", no: "DEMO", caption: "Figma 增强链路演示：主链路接入 Figma MCP，确认后回写 IDE" };
  // 第二章：Agent Experience Loop / GenUI / A2UI / 案例链路
  if (/图\s*2-1[：:]/.test(t) || has("Agent Experience Loop", "用户表达意图"))
    return { render: "image", light: "/figures/fig-2-1-light.svg", dark: "/figures/fig-2-1-dark.svg", no: "2-1", caption: "Agent Experience Loop 示意图" };
  if (/图\s*2-2[：:]/.test(t) || has("过程透明度", "CSCW"))
    return { render: "image", light: "/figures/fig-2-2-light-16x9.png", dark: "/figures/fig-2-2-dark-16x9.png", no: "2-2", caption: "Agent 过程透明度分层。来源：Exploring the Impact of Process Transparency on User Experience in AI Design Agents, ACM CSCW 2025." };
  if (/图\s*2-3[：:]/.test(t) || has("Agent Experience Loop", "流转图"))
    return { render: "svg", which: "agent-flow", no: "2-3", caption: "Agent Experience Loop 流转图" };
  if (/图\s*2-4[：:]/.test(t) || has("GenUI 结构图"))
    return { render: "image", light: "/figures/fig-2-4-light.gif", dark: "/figures/fig-2-4-dark.gif", no: "2-4", caption: "GenUI 结构图" };
  if (/图\s*2-5[：:]/.test(t) || has("GenUI 决策树"))
    return { render: "image", light: "/figures/fig-2-5-light.svg", dark: "/figures/fig-2-5-dark.svg", no: "2-5", caption: "GenUI 决策树" };
  if (/图\s*2-6[：:]/.test(t) || has("A2UI 契约分层"))
    return { render: "svg", which: "a2ui-contract", no: "2-6", caption: "A2UI 契约分层" };
  if (/图\s*2-7[：:]/.test(t) || has("A2UI 运行机制"))
    return { render: "svg", which: "a2ui-runtime", no: "2-7", caption: "A2UI 运行机制" };
  if (/图\s*2-8[：:]/.test(t) || has("A2UI 消息", "FlexCard"))
    return { render: "image", light: "/figures/fig-2-8-light.png", dark: "/figures/fig-2-8-dark.png", no: "2-8", caption: "A2UI 消息到 FlexCard 的渲染示意" };
  if (/图\s*2-9[：:]/.test(t) || has("OmniBox", "FlexCard", "GenReport", "任务链路"))
    return { render: "svg", which: "case-flow-v2", no: "2-9", caption: "OmniBox、FlexCard 与 GenReport 的任务链路" };
  if (/图\s*2-10[：:]/.test(t) || has("OmniBox", "输入结构"))
    return { render: "image", light: "/figures/fig-2-10-omnibox.gif", dark: "/figures/fig-2-10-omnibox.gif", no: "2-10", caption: "OmniBox 输入结构图" };
  if (/图\s*2-11[：:]/.test(t) || has("FlexCard", "决策卡"))
    return { render: "image", light: "/figures/fig-2-11-flexcard.gif", dark: "/figures/fig-2-11-flexcard.gif", no: "2-11", caption: "FlexCard 决策卡示意" };
  if (/图\s*2-12[：:]/.test(t) || has("GenReport", "报告页面"))
    return { render: "image", light: "/figures/fig-2-12-genreport.gif", dark: "/figures/fig-2-12-genreport.gif", no: "2-12", caption: "GenReport 报告页面示意" };
  if (has("GUI 指令", "用户意图") || t.includes("页面 / 菜单"))
    return { render: "svg", which: "intent-shift", no: "A / B", caption: "交互起点变了：从 GUI 操作到用户意图" };
  if (t.includes("A2UI") || has("客户端渲染", "回传"))
    return { render: "svg", which: "a2ui-loop", no: "FLOW", caption: "A2UI 闭环：声明界面意图 → 契约 → 客户端渲染 → 动作回传" };
  if (t.includes("生成式 UI") && (t.includes("边界") || t.includes("围绕任务")))
    return { render: "svg", which: "genui-boundary", no: "A / B", caption: "生成式 UI 的边界：稳定页面仍在，运行时界面只覆盖任务变化处" };
  if (has("OmniBox", "FlexCard", "GenReport") && (t.includes("横向流程") || t.includes("流程图")))
    return { render: "svg", which: "case-flow", no: "FLOW", caption: "OmniBox → FlexCard → GenReport：输入 / 交互 / 输出" };
  if (has("OmniBox", "输入态"))
    return { render: "svg", which: "omnibox-shot", no: "FIG", caption: "OmniBox：自然语言、结构化引用与上下文材料同框进入" };
  if (t.includes("FlexCard") && (t.includes("示例") || t.includes("一组")))
    return { render: "svg", which: "flexcard-shot", no: "FIG", caption: "FlexCard：方案选择 / 风险确认 / 状态监控" };
  if (has("GenReport", "成品页"))
    return { render: "svg", which: "genreport-shot", no: "FIG", caption: "GenReport：对话结果凝结成可阅读的交付物" };
  // 1.1 正文内引用的 Design I/O 线性流程图 —— 用户手绘素材(亮/暗各一份),落在「上图」处
  if (t.includes("Design I/O"))
    return {
      render: "themed",
      light: "/figures/arch-1-light.svg",
      dark: "/figures/arch-1-dark.png",
      w: 2794, h: 946,           /* 固有比例:预留高度,懒加载零位移 */
      no: "FLOW",
      caption: "Design I/O —— 设计能力从每一道工序进入链路",
    };
  // 1.1 正文内引用的 Design I/O 线性流程图（与章首 lead 同图，落在「上图」处）
  if (t.includes("Design I/O"))
    return { render: "svg", which: "designio", no: "FLOW", caption: "Design I/O —— 设计能力从每一道工序进入链路" };
  // 兜底：取 emoji 后首句做 caption 的干净媒体井
  const cap = raw.replace(/^🖼️/u, "").replace(/^[^:：]*[:：]/, "").replace(/\s+/g, " ").trim().slice(0, 40);
  return { render: "media", no: "DEMO", caption: cap || "演示" };
}

export function DiagramFigure({ spec, caption, no }: { spec: DiagramSpec; caption?: string; no?: string }) {
  const cap = caption ?? spec.caption;
  const fno = no ?? spec.no;
  if (spec.render === "media") {
    return (
      <Figure className="sa-reveal" caption={cap} no={fno} bleed>
        <MediaWell gif={spec.gif} alt={cap} />
      </Figure>
    );
  }
  if (spec.render === "image") {
    return <ZoomableImageFigure light={spec.light} dark={spec.dark} caption={cap} no={fno} wide={spec.wide} />;
  }
  if (spec.render === "themed") {
    /* 主题双图:亮显 light、暗显 dark;bleed = 无外框(素材自带留白) */
    return (
      <Figure className="sa-reveal" caption={cap} no={fno} bleed>
        <img className="fig-themed fig-themed--light" src={asset(spec.light)} alt={cap} width={spec.w} height={spec.h} loading="lazy" decoding="async" />
        <img className="fig-themed fig-themed--dark" src={asset(spec.dark)} alt={cap} width={spec.w} height={spec.h} loading="lazy" decoding="async" />
      </Figure>
    );
  }
  const svg = (() => {
    switch (spec.which) {
      case "problem-board": return <ProblemBoard />;
      case "sink-flow": return <SinkFlow />;
      case "spec-stack": return <SpecStack />;
      case "before-after": return <BeforeAfter />;
      case "figma-branch": return <FigmaBranch />;
      case "skill-section": return <Illustration kind="skill-anatomy" />;
      case "designio": return <Illustration kind="designio" />;
      case "agent-loop": return <AgentLoopBlueprint />;
      case "process-transparency": return <ProcessTransparencyBlueprint />;
      case "agent-flow": return <AgentFlowBlueprint />;
      case "genui-structure": return <GenUIStructureBlueprint />;
      case "genui-decision": return <GenUIDecisionBlueprint />;
      case "genui-mechanisms": return <GenUITwoMechanismsBlueprint />;
      case "a2ui-contract": return <A2UIContractBlueprint />;
      case "a2ui-runtime": return <A2UIRuntimeBlueprint />;
      case "a2ui-message-map": return <A2UIMessageMapBlueprint />;
      case "case-flow-v2": return <CaseFlowBlueprint />;
      case "omnibox-structure": return <OmniBoxStructureBlueprint />;
      case "flexcard-decision": return <FlexCardDecisionBlueprint />;
      case "genreport-artifact": return <GenReportArtifactBlueprint />;
      case "intent-shift": return <IntentShift />;
      case "a2ui-loop": return <A2UILoop />;
      case "genui-boundary": return <GenUIBoundary />;
      case "case-flow": return <CaseFlow />;
      case "omnibox-shot": return <OmniBoxShot />;
      case "flexcard-shot": return <FlexCardShot />;
      case "genreport-shot": return <GenReportShot />;
    }
  })();
  /* 第一章 fp 图版:Plate 外壳自带编号章 + 标题栏,替代外部图注 */
  if (spec.render === "svg" && spec.plate) {
    return (
      <div className="fp-wrap sa-reveal">
        <Plate no={spec.plate.no} title={spec.plate.title} sub={spec.plate.sub}>
          {svg}
        </Plate>
      </div>
    );
  }
  return <Figure className="sa-reveal" caption={cap} no={fno}>{svg}</Figure>;
}

function ZoomableImageFigure({ light, dark, caption, no, wide = false }: { light: string; dark: string; caption: string; no?: string; wide?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("is-figure-zoom-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("is-figure-zoom-open");
    };
  }, [open]);

  const imagePair = (
    <span className="theme-image-art">
      <img className="theme-image-art__img theme-image-art__img--light" src={light} alt={caption} loading="lazy" decoding="async" />
      <img className="theme-image-art__img theme-image-art__img--dark" src={dark} alt={caption} loading="lazy" decoding="async" />
    </span>
  );

  return (
    <>
      <Figure className={`sa-reveal fig-image-${String(no).replace(".", "-")}${wide ? " pr-figure--wide" : ""}`} caption={caption} no={no}>
        <button className="theme-image-zoom-trigger" type="button" onClick={() => setOpen(true)} aria-label={`放大查看：${caption}`}>
          {imagePair}
        </button>
      </Figure>
      {open && createPortal(
        <button className="theme-image-lightbox" type="button" onClick={() => setOpen(false)} aria-label="关闭放大图片">
          <span className="theme-image-lightbox__frame">{imagePair}</span>
        </button>,
        document.body,
      )}
    </>
  );
}
