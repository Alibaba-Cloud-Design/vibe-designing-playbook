/**
 * 六张章节签名插画的 draw 函数（概念 → 几何，§2.7 方案）。
 * 全部复用 kit 的基元 + 家族常量 + 缓动，共用「幽灵轨道 + 亮白高亮」二层，
 * 中心构图、触达半径 0.32、慢速、无 glow。皆从图元库重组，不新发明。
 *
 *   引言 introduction  → 单同心环 + 罗盘准星，环自顶顺时针「描出」再淡出（最简开场）
 *   设计工程 engineering → 同心环由内向外逐层描边（ConcentricDraw，精密分层搭建）
 *   动态交互 interaction → 4×4 箭头阵列跟随光标（VectorField，界面随意图而生）
 *   自我进化 evolution   → 自相似递归栈每层 ×0.62 + 绕行卫星（OrbitingSpheres，迭代生长）
 *   结语 conclusion     → 箭头绕环循环 + 三里程碑点（CycleArrow，散开·评判·收敛 飞轮）
 *   词典 lexicon        → 2×2 图元字表逐格点亮（CreditArc，翻检词条）
 */
import {
  type DrawFn,
  ring, seg, dot, arrow, gray, angleDiff,
  GHOST, easeInOutCubic, easeOutCubic, clamp01, smoothstep,
} from "./kit";

const TAU = Math.PI * 2;
const TOP = -Math.PI / 2; // 十二点方向为起笔点

/* ① 引言 —— 单同心环 + 罗盘准星。环自顶顺时针描出→满→淡出，循环。 */
export const drawIntroduction: DrawFn = (ctx, { t, cx, cy, R, reduce }) => {
  // 幽灵层：准星（长十字，中心留隙）+ 单环 + 四向短刻度
  const gap = R * 0.16;
  seg(ctx, cx - R * 1.02, cy, cx - gap, cy, GHOST);
  seg(ctx, cx + gap, cy, cx + R * 1.02, cy, GHOST);
  seg(ctx, cx, cy - R * 1.02, cx, cy - gap, GHOST);
  seg(ctx, cx, cy + gap, cx, cy + R * 1.02, GHOST);
  ring(ctx, cx, cy, R, GHOST);
  for (let i = 0; i < 4; i++) {
    const a = TOP + i * (TAU / 4);
    const r0 = R * 0.9, r1 = R * 1.1;
    seg(ctx, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0,
      cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, GHOST);
  }

  // 高亮层：环自顶描出 → 保持 → 淡出（描边 easeInOutCubic）
  const T = 5.6;
  const p = reduce ? 0.55 : (t % T) / T; // reduced：停在「满环」相位
  let alpha = 1, drawn = 1;
  if (p < 0.42) drawn = easeInOutCubic(p / 0.42);          // 描出
  else if (p < 0.74) { drawn = 1; alpha = 1; }              // 保持
  else { drawn = 1; alpha = 1 - easeOutCubic((p - 0.74) / 0.26); } // 淡出
  if (drawn > 0.001 && alpha > 0.001) {
    ring(ctx, cx, cy, R, gray(1, alpha), TOP, TOP + drawn * TAU);
    // 中心亮准星（随环一起显）
    const g2 = R * 0.13;
    const c = gray(1, alpha * 0.9);
    seg(ctx, cx - g2 * 1.9, cy, cx - g2 * 0.5, cy, c);
    seg(ctx, cx + g2 * 0.5, cy, cx + g2 * 1.9, cy, c);
    seg(ctx, cx, cy - g2 * 1.9, cx, cy - g2 * 0.5, c);
    seg(ctx, cx, cy + g2 * 0.5, cx, cy + g2 * 1.9, c);
    // 描出的笔尖亮点
    if (!reduce && p < 0.42) {
      const a = TOP + drawn * TAU;
      dot(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * 0.028, gray(1, alpha));
    }
  }
};

/* ② 设计工程 —— 5 层同心环由内向外逐层描边（精密分层搭建）。 */
export const drawEngineering: DrawFn = (ctx, { t, cx, cy, R, reduce }) => {
  const N = 5;
  const radii = Array.from({ length: N }, (_, i) => R * (i + 1) / N);
  // 幽灵层：全部同心环常显
  for (const r of radii) ring(ctx, cx, cy, r, GHOST);

  const T = 6.0;          // 循环（4–10s 内）
  const st = 0.22;        // 层间错峰（§2.7 精确值 0.12–0.25s）
  const dd = 0.9;         // 单层描出时长（§2.7 0.8–2.8s）
  const lastEnd = (N - 1) * st + dd; // 1.78s：内→外级联绽放
  const holdEnd = lastEnd + 1.6;     // 满靶保持到 3.38s
  const fadeDur = 1.3;
  const phase = reduce ? holdEnd - 0.2 : t % T; // reduced：停在满靶
  // 全局淡出（描完保持后整组淡出，留幽灵）
  let gAlpha = 1;
  if (phase > holdEnd) gAlpha = 1 - easeOutCubic(clamp01((phase - holdEnd) / fadeDur));
  if (gAlpha <= 0.001) return;

  for (let i = 0; i < N; i++) {
    const local = clamp01((phase - i * st) / dd);
    if (local <= 0.001) continue;
    const drawn = easeInOutCubic(local);
    ring(ctx, cx, cy, radii[i], gray(1, gAlpha), TOP, TOP + drawn * TAU);
  }
  // 全部描完后中心亮点收口
  if (phase >= lastEnd) dot(ctx, cx, cy, R * 0.03, gray(1, gAlpha));
};

/* ③ 动态交互 —— 4×4 箭头跟随光标；无光标时慢速涡旋。 */
export const drawInteraction: DrawFn = (ctx, { t, dt, cx, cy, R, pointer, state, reduce }) => {
  ring(ctx, cx, cy, R, GHOST); // 幽灵边界盘

  const a = R * 0.65;               // 网格半展（角点 √2·a ≈ 0.92R，落在环内）
  const cols = [-1, -1 / 3, 1 / 3, 1];
  const cell = (2 * a) / 3;
  const len = cell * 0.5;
  // 每实例持久角度（平滑跟随）
  let ang = state.iAng as number[] | undefined;
  if (!ang) { ang = state.iAng = new Array(16).fill(0); }

  // 光标映射到画布像素
  const px = pointer.x * (cx * 2), py = pointer.y * (cy * 2);
  const smooth = reduce ? 1 : 1 - Math.exp(-dt * 6); // 帧率无关平滑

  let k = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++, k++) {
      const gx = cx + cols[c] * a, gy = cy + cols[r] * a;
      let target: number, bright: number;
      if (pointer.active) {
        target = Math.atan2(py - gy, px - gx);
        const d = Math.hypot(px - gx, py - gy);
        bright = clamp01(1 - d / (R * 1.7));
        bright = 0.16 + 0.84 * bright;
      } else {
        // 环流涡旋：切向 + 整体慢转
        target = Math.atan2(gy - cy, gx - cx) + Math.PI / 2 + t * 0.18;
        bright = 0.42 + 0.12 * Math.sin(t * 0.6 + k * 0.5);
      }
      ang[k] += angleDiff(target, ang[k]) * smooth;
      arrow(ctx, gx, gy, ang[k], len, gray(bright));
    }
  }
};

/* ④ 自我进化 —— 自相似递归栈（每层 ×0.62、内切前一环、缓慢旋绕）+ 绕行卫星。 */
export const drawEvolution: DrawFn = (ctx, { t, cx, cy, R, reduce }) => {
  const spin = reduce ? 0.8 : t * 0.2;   // 慢速旋绕（0.2 rad/s）
  const levels = 6;
  let x = cx, y = cy, r = R;
  // 先画幽灵全貌
  const centers: Array<[number, number, number]> = [];
  for (let k = 0; k < levels; k++) {
    centers.push([x, y, r]);
    ring(ctx, x, y, r, GHOST);
    const nr = r * 0.62;
    const phi = spin + k * 2.4;           // 每层推进 2.4rad → 卷成螺旋
    x += Math.cos(phi) * (r - nr);        // 内切前一环
    y += Math.sin(phi) * (r - nr);
    r = nr;
  }
  // 高亮：最内两层亮白（收敛的内核）+ 外环一段描出
  const inner = centers[levels - 1], inner2 = centers[levels - 2];
  ring(ctx, inner2[0], inner2[1], inner2[2], gray(0.75));
  ring(ctx, inner[0], inner[1], inner[2], gray(1));
  dot(ctx, inner[0], inner[1], Math.max(1.4, inner[2] * 0.5), gray(1)); // 内核实心

  // 外环高亮一段随旋绕移动（幽灵上叠亮弧）
  const arcHead = TOP + (reduce ? 1.2 : t * 0.5);
  ring(ctx, cx, cy, R, gray(1, 0.9), arcHead - 0.55, arcHead);

  // 卫星：在外环上绕行的亮点 + 短拖尾
  const sa = TOP + (reduce ? 2.2 : t * 0.55);
  for (let i = 0; i < 5; i++) {
    const aa = sa - i * 0.06;
    dot(ctx, cx + Math.cos(aa) * R, cy + Math.sin(aa) * R, R * 0.03 * (1 - i * 0.16), gray(1, 1 - i * 0.2));
  }
};

/* ⑤ 结语 —— 箭头绕外环循环 + 三里程碑点（散开·评判·收敛 飞轮）。 */
export const drawConclusion: DrawFn = (ctx, { t, cx, cy, R, reduce }) => {
  const rIn = R * 0.5;
  ring(ctx, cx, cy, R, GHOST);   // 外环（幽灵）
  ring(ctx, cx, cy, rIn, GHOST); // 内环（幽灵）

  const T = 7.6;
  const p = reduce ? 0.16 : (t % T) / T;
  const head = TOP + p * TAU;    // 箭头头位置（顺时针）

  // 三里程碑点（12 / 4 / 8 点方向）：常态幽灵小环，箭头经过时闪亮
  const marks = [TOP, TOP + TAU / 3, TOP + 2 * TAU / 3];
  for (const m of marks) {
    const mx = cx + Math.cos(m) * R, my = cy + Math.sin(m) * R;
    const near = smoothstep(0.34, 0, Math.abs(angleDiff(head, m)));
    ring(ctx, mx, my, R * 0.055, gray(0.15 + 0.85 * near));
    if (near > 0.2) dot(ctx, mx, my, R * 0.03 * near, gray(1, near));
  }

  // 拖尾亮弧（沿弧渐隐）+ 头部切向箭头
  const trail = 0.95, segN = 16;
  for (let i = 0; i < segN; i++) {
    const a0 = head - trail * (i + 1) / segN;
    const a1 = head - trail * i / segN;
    ring(ctx, cx, cy, R, gray(1, (1 - i / segN) * 0.95), a0, a1);
  }
  const hx = cx + Math.cos(head) * R, hy = cy + Math.sin(head) * R;
  const tang = head + Math.PI / 2; // 顺时针切线方向
  arrow(ctx, hx, hy, tang, R * 0.24, gray(1));
};

/* ⑥ 词典 —— 2×2 图元字表（环 / 十字 / 叉 / 星），逐格扫过点亮。 */
export const drawLexicon: DrawFn = (ctx, { t, cx, cy, R, reduce }) => {
  const g = R * 0.52;            // 格心偏移
  const gr = R * 0.34;           // 单格图元触达
  const cells: Array<[number, number]> = [
    [cx - g, cy - g], [cx + g, cy - g],
    [cx - g, cy + g], [cx + g, cy + g],
  ];
  const T = 5.4;
  const phase = reduce ? 0 : (t % T) / T;

  const drawGlyph = (i: number, x: number, y: number, col: string) => {
    if (i === 0) {                       // 环
      ring(ctx, x, y, gr, col);
    } else if (i === 1) {                // 十字 +
      seg(ctx, x - gr, y, x + gr, y, col);
      seg(ctx, x, y - gr, x, y + gr, col);
    } else if (i === 2) {                // 叉 ×
      const d = gr * 0.72;
      seg(ctx, x - d, y - d, x + d, y + d, col);
      seg(ctx, x - d, y + d, x + d, y - d, col);
    } else {                             // 星（六辐）
      for (let s = 0; s < 6; s++) {
        const a = s * (TAU / 6);
        seg(ctx, x, y, x + Math.cos(a) * gr, y + Math.sin(a) * gr, col);
      }
    }
  };

  for (let i = 0; i < 4; i++) {
    const [x, y] = cells[i];
    drawGlyph(i, x, y, GHOST);                       // 幽灵底
    // 扫描点亮：每格中心相位 (i+0.5)/4，脉冲淡入淡出
    const ci = (i + 0.5) / 4;
    let d = Math.abs(phase - ci);
    d = Math.min(d, 1 - d);                           // 环形距离
    const b = reduce ? 0.7 : smoothstep(0.22, 0, d);
    if (b > 0.02) drawGlyph(i, x, y, gray(1, b));
  }
};

/* —— variant 注册表 —— */
export type Variant =
  | "introduction" | "engineering" | "interaction"
  | "evolution" | "conclusion" | "lexicon";

export const DRAW: Record<Variant, DrawFn> = {
  introduction: drawIntroduction,
  engineering: drawEngineering,
  interaction: drawInteraction,
  evolution: drawEvolution,
  conclusion: drawConclusion,
  lexicon: drawLexicon,
};

/** 哪些 variant 需要跟随光标（交互态）。 */
export const INTERACTIVE: Record<Variant, boolean> = {
  introduction: false, engineering: false, interaction: true,
  evolution: false, conclusion: false, lexicon: false,
};

/** 六张签名插画的元信息（名称 / 一句描述 / 章节归属），供目录与画廊复用。 */
export const SIGNATURES: Record<Variant, { label: string; en: string; desc: string; chapter: string }> = {
  introduction: {
    label: "引言", en: "Introduction",
    desc: "单同心环 + 罗盘准星，自顶描出——最简开场，先立坐标。",
    chapter: "引言",
  },
  engineering: {
    label: "设计工程", en: "Engineering",
    desc: "同心环由内向外逐层描边——精密分层，把能力一圈圈搭起来。",
    chapter: "设计工程",
  },
  interaction: {
    label: "动态交互", en: "Interaction",
    desc: "4×4 箭头阵列跟随光标——界面随意图而生，场景里接住指向。",
    chapter: "动态交互",
  },
  evolution: {
    label: "自我进化", en: "Evolution",
    desc: "自相似递归栈每层 ×0.62 + 绕行卫星——迭代生长，飞轮向内收敛。",
    chapter: "自我进化",
  },
  conclusion: {
    label: "结语", en: "Conclusion",
    desc: "箭头绕环循环 + 三里程碑——散开·评判·收敛，飞轮不停。",
    chapter: "结语",
  },
  lexicon: {
    label: "设计提示词词典", en: "Lexicon",
    desc: "2×2 图元字表逐格点亮——一套可复用的词条，翻检取用。",
    chapter: "设计提示词词典",
  },
};

export const VARIANT_ORDER: Variant[] = [
  "introduction", "engineering", "interaction", "evolution", "conclusion", "lexicon",
];
