/**
 * 正文架构图（需求4 ④）—— 参考 tweakkit landing 的「节点 + 连线 + edge」SVG flow，
 * 但风格用 playbook 自己的：软深卡（--surface-1）+ 发丝线（--hairline）+ 暖灰线稿（--ink）
 * + 单一靛蓝强调（--accent-bright）+ mono 标签。全部套 P2 的 <Figure> 描边框。
 *
 * 由 ScrollArticle.routeBlockquote 对 🖼️ 起头的 blockquote 调 matchDiagram → DiagramFigure。
 */
import { Figure } from "../Figure";
import { Illustration } from "../Illustrations";
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
  const symptoms = ["空态白屏", "状态色乱", "Badge×Tag", "hardcode 色值", "骨架选错"];
  const decls = ["spec", "domain", "craft", "design.md", "components", "template"];
  return (
    <svg viewBox="0 0 700 356" width="100%" role="img" aria-label="生成失败现场沉淀成声明与契约">
      {/* 上：生成失败现场 */}
      <Box x={20} y={16} w={660} h={92} />
      <TagText x={40} y={40} anchor="start" fill={DIM}>生成失败现场</TagText>
      {symptoms.map((s, i) => <Pill key={s} x={40 + i * 126} y={58} w={112} label={s} />)}

      {/* 沉淀 edge */}
      <Arrow x1={350} y1={112} x2={350} y2={150} accent />
      <TagText x={366} y={137} anchor="start" fill={ACCENT} size={10}>沉淀成能力</TagText>

      {/* 下左：六份设计声明 */}
      <Box x={20} y={158} w={468} h={182} />
      <TagText x={40} y={182} anchor="start" fill={DIM}>设计声明 · 6</TagText>
      {decls.map((d, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        return <Pill key={d} x={40 + col * 144} y={200 + row * 54} w={130} label={d} />;
      })}

      {/* 下右：两份执行契约（靛蓝） */}
      <Box x={504} y={158} w={176} h={182} stroke="color-mix(in srgb, var(--accent-bright), transparent 60%)" />
      <TagText x={524} y={182} anchor="start" fill={ACCENT}>执行契约 · 2</TagText>
      <Pill x={524} y={200} w={136} label="skill" accent />
      <Pill x={524} y={254} w={136} label="evaluator" accent />
      {/* 声明 → 契约 连接 */}
      <Arrow x1={488} y1={249} x2={504} y2={249} dashed />
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
    <svg viewBox="0 0 700 340" width="100%" role="img" aria-label="spec 六层框架">
      {/* 左轴：抽象 → 具体 */}
      <Arrow x1={54} y1={30} x2={54} y2={310} />
      <text x={40} y={175} fontSize="11" fill={DIM} textAnchor="middle" fontFamily={MONO}
        transform="rotate(-90 40 175)" letterSpacing="1.5">抽象 → 具体</text>
      {rows.map(([tag, name, desc], i) => {
        const y = y0 + i * (h + gap);
        const last = i === rows.length - 1;
        return (
          <g key={tag}>
            <rect x={x0} y={y} width={w} height={h} rx="7"
              fill={last ? "color-mix(in srgb, var(--accent-bright), transparent 88%)" : CARD}
              stroke={last ? "color-mix(in srgb, var(--accent-bright), transparent 50%)" : LINE} />
            <text x={x0 + 18} y={y + 27} fontSize="13" fill={last ? ACCENT : ACCENT} fontFamily={MONO} letterSpacing="1">{tag}</text>
            <text x={x0 + 58} y={y + 27} fontSize="14" fill={INK} fontFamily={SANS}>{name}</text>
            <text x={x0 + w - 16} y={y + 27} fontSize="11.5" fill={DIM} fontFamily={SANS} textAnchor="end">{desc}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ④ 同一张首页：AI 默认套路 vs CloudAI 规则（1.2）。 */
function BeforeAfter() {
  const Page = ({ x, ai }: { x: number; ai: boolean }) => (
    <g>
      <Box x={x} y={24} w={300} h={268} />
      {/* header */}
      {ai ? (
        <>
          <defs>
            <linearGradient id="ba-hd" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8B7CE6" stopOpacity="0.55" /><stop offset="1" stopColor="#6DA0E6" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <rect x={x} y={24} width={300} height="48" rx="8" fill="url(#ba-hd)" />
        </>
      ) : (
        <rect x={x} y={24} width={300} height="48" rx="8" fill={CARD2} stroke={LINE} />
      )}
      <rect x={x + 20} y={42} width={ai ? 120 : 84} height="10" rx="5" fill={ai ? "#fff" : INK} opacity={ai ? 0.65 : 0.85} />
      {/* eyebrows + cards */}
      {[0, 1, 2].map((i) => {
        const cx = x + 20 + i * 90;
        return (
          <g key={i}>
            {ai && <rect x={cx} y={92} width={44} height="7" rx="3.5" fill={FAINT} />}
            <rect x={cx} y={ai ? 106 : 92} width={76} height={ai ? 96 : 82} rx="7"
              fill={ai ? "color-mix(in srgb, #8B7CE6, transparent 88%)" : CARD}
              stroke={ai ? "color-mix(in srgb, #8B7CE6, transparent 70%)" : LINE} />
            {!ai && i === 0 && <rect x={cx + 12} y={104} width={30} height="7" rx="3.5" fill={ACCENT} />}
            {!ai && <rect x={cx + 12} y={i === 0 ? 120 : 108} width={52} height="6" rx="3" fill={FAINT} />}
          </g>
        );
      })}
      {/* button */}
      <rect x={x + 20} y={232} width={ai ? 96 : 88} height="28" rx={ai ? 14 : 6}
        fill={ai ? "color-mix(in srgb, #8B7CE6, transparent 40%)" : ACCENT} opacity={ai ? 1 : 0.92}
        style={ai ? ({ filter: "drop-shadow(0 0 6px rgba(139,124,230,0.6))" } as React.CSSProperties) : undefined} />
      <TagText x={x + 150} y={284} fill={ai ? DIM : ACCENT} size={11}>{ai ? "AI 默认套路" : "CLOUDAI 规则"}</TagText>
    </g>
  );
  return (
    <svg viewBox="0 0 700 312" width="100%" role="img" aria-label="AI 默认套路对比 CloudAI 规则">
      <Page x={20} ai />
      <Arrow x1={334} y1={158} x2={366} y2={158} accent />
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
    <svg viewBox="0 0 700 220" width="100%" role="img" aria-label="Figma 增强链路">
      {/* 主链路 */}
      {nodes.map(([cx, label], i) => (
        <g key={label}>
          <rect x={cx - 58} y={y - 20} width={116} height={40} rx="8" fill={CARD} stroke={LINE} />
          <text x={cx} y={y + 5} fontSize="13" fill={INK} textAnchor="middle" fontFamily={SANS}>{label}</text>
          {i < nodes.length - 1 && <Arrow x1={cx + 60} y1={y} x2={nodes[i + 1][0] - 60} y2={y} />}
        </g>
      ))}
      {/* Figma 支路：从视觉规格向下，回到 prototype */}
      <Arrow x1={430} y1={82} x2={430} y2={132} accent dashed />
      <rect x={360} y={132} width={140} height={44} rx="8"
        fill="color-mix(in srgb, var(--accent-bright), transparent 88%)"
        stroke="color-mix(in srgb, var(--accent-bright), transparent 50%)" />
      <text x={430} y={158} fontSize="13" fill={ACCENT} textAnchor="middle" fontFamily={SANS}>Figma MCP</text>
      <path d={`M500 154 H600 V80`} fill="none" stroke={ACCENT} strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
      <path d="M595 90 L600 80 L605 90" fill="none" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <TagText x={430} y={200} fill={DIM} size={10}>复杂设计场景的补充能力</TagText>
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

/* 媒体井：skill 演示 gif（需求5 在正文内的落位），保持描边图版气质。 */
function MediaWell({ gif, alt }: { gif?: string; alt: string }) {
  if (!gif) {
    return (
      <div className="pr-media pr-media--empty" role="img" aria-label={alt}>
        <span className="pr-media-tag">GIF</span>
      </div>
    );
  }
  return (
    <div className="pr-media">
      <img className="pr-media-img" src={asset(gif)} alt={alt} loading="lazy" decoding="async" />
      <span className="pr-media-tag">GIF</span>
    </div>
  );
}

/* —— 路由：把 🖼️ 占位文本映射到具体图版 —— */
export type DiagramSpec =
  | { render: "svg"; which:
      | "problem-board" | "sink-flow" | "spec-stack" | "before-after" | "skill-section" | "figma-branch" | "designio"
      | "intent-shift" | "a2ui-loop" | "genui-boundary" | "case-flow" | "omnibox-shot" | "flexcard-shot" | "genreport-shot";
      caption: string; no?: string }
  | { render: "media"; gif?: string; caption: string; no?: string }
  | { render: "themed"; light: string; dark: string; w: number; h: number; caption: string; no?: string };

export function matchDiagram(raw: string): DiagramSpec {
  const t = raw;
  const has = (...ks: string[]) => ks.every((k) => t.includes(k));
  // 架构 / 示意图
  if (has("调度看板", "问题版")) return { render: "svg", which: "problem-board", no: "FIG", caption: "Agent 调度看板「问题版」：四处毛病各有归属" };
  if (has("六份声明") || has("横向链路", "生成失败") || t.includes("问题如何沉淀"))
    return { render: "svg", which: "sink-flow", no: "FLOW", caption: "生成失败现场，沉淀成六份设计声明与两份执行契约" };
  if (has("六层") && (t.includes("金字塔") || t.includes("楼层")))
    return { render: "svg", which: "spec-stack", no: "SPEC", caption: "spec 六层：从定位与意图到验收，自抽象到具体" };
  if (t.includes("CloudAI 首页") || has("左侧是 AI"))
    return { render: "svg", which: "before-after", no: "A / B", caption: "同一张首页：AI 默认套路 vs. CloudAI 规则" };
  if (t.includes("剖面图"))
    return { render: "svg", which: "skill-section", no: "SKILL", caption: "cloudai-picker 剖面：触发 / 流程 / 按需引用 / 沉淀的坑" };
  if (has("Demo 2") || has("Figma 支路"))
    return { render: "svg", which: "figma-branch", no: "FLOW", caption: "Figma 增强链路：主链路分出 Figma 支路，再回写 IDE" };
  // GIF / Demo 演示 —— 正文内 skill 演示
  if (has("六层 spec")) return { render: "media", gif: "/gifs/01-visual-spec.gif", no: "DEMO", caption: "规划阶段：把需求定义成结构化 spec 与视觉规格" };
  if (has("模版库") || t.includes("cloudai-picker` 从")) return { render: "media", gif: "/gifs/02-picker.gif", no: "DEMO", caption: "cloudai-picker 从模版库选出调度看板骨架" };
  if (has("variant", "变体")) return { render: "media", gif: "/gifs/03-variant.gif", no: "DEMO", caption: "variant 在画布上展开三种信息架构变体" };
  if (has("槽位被填满")) return { render: "media", gif: "/gifs/cloudai-components.gif", no: "DEMO", caption: "槽位被填满：状态 Badge、风险 RiskBadge、资源 Tag" };
  if (has("空态", "骨架屏")) return { render: "media", gif: "/gifs/04c-check.gif", no: "DEMO", caption: "逐一补齐空态、加载、失败重试、权限与批量态" };
  if (has("evaluator", "逐项检查")) return { render: "media", gif: "/gifs/05b-report.gif", no: "DEMO", caption: "evaluator 逐项检查并回流到对应声明" };
  if (has("Demo 1")) return { render: "media", gif: "/gifs/04b-page.gif", no: "DEMO", caption: "主链路演示：一句话逐步生成可交付页面" };
  // 第二章：交互起点 / A2UI 机制 / 生成式 UI 边界 / 案例流程 + 三张形态
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
      case "intent-shift": return <IntentShift />;
      case "a2ui-loop": return <A2UILoop />;
      case "genui-boundary": return <GenUIBoundary />;
      case "case-flow": return <CaseFlow />;
      case "omnibox-shot": return <OmniBoxShot />;
      case "flexcard-shot": return <FlexCardShot />;
      case "genreport-shot": return <GenReportShot />;
    }
  })();
  return <Figure className="sa-reveal" caption={cap} no={fno}>{svg}</Figure>;
}
