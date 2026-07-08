/**
 * 抽象几何「顶图族」——引言卡片 / 章扉页顶部的抽象线稿动画（对照 behance「Second Kind」）。
 *
 * 与 §2.7 六张章节签名同出一套引擎（kit：dt-rAF + IO 门控 + DPR + reduced-motion + 冻帧钩子），
 * 只是把「同心正圆」的语言换成「透视椭圆」，覆盖 behance 参考里的三种母题：
 *
 *   轨道椭圆 orbit    → 竖轴上层叠的水平椭圆环（3D 呼吸 + 微摆），亮波沿栈上行 —— 旋转的线圈/环面
 *   无限环   figure8  → 一束近水平的倾斜椭圆过中心叠成蝴蝶结/∞，相位开合 + 绕行卫星 —— 交叠飞轮
 *   放射节点 radial   → 中央透视轨道环 + 点线放射到不等长节点 + 环上卫星 —— 原子/星系节点图
 *
 * 家族一致性沿用 §2.7：纯白 1.75px、butt、fill:none；「幽灵点线全貌 + 亮白只描一段」二层；
 * 中心构图、慢速（旋转 0.2–0.25 rad/s，循环数秒）、dt 帧率无关、无 glow。
 * 幽灵层用点线（setLineDash）呼应参考里的虚线轨道，save/restore 保证虚线不外泄到下一帧。
 */
import {
  type DrawFn,
  ellipse, seg, dot, gray, GHOST, clamp01,
} from "./kit";

const TAU = Math.PI * 2;

/** 顶图族触达半径：比签名（0.32）更满，读作横展的 banner 插画。 */
const REACH = 0.4;

/** 在点线态下画一段（save/restore 保证 dash 不泄漏到后续基元 / 下一帧）。 */
function dashed(ctx: CanvasRenderingContext2D, pattern: number[], cb: () => void) {
  ctx.save();
  ctx.setLineDash(pattern);
  cb();
  ctx.restore();
}

/* ① 轨道椭圆 —— 竖轴 + 层叠水平椭圆环织成纺锤，3D 呼吸开合、整体微摆、亮波上行。
   纺锤 silhouette：中段椭圆宽、上下收窄（rx 随高度 cos 分布），层间紧凑相叠成织纹。 */
export const drawOrbit: DrawFn = (ctx, { t, cx, cy, size, reduce }) => {
  const R = size * REACH;
  const spin = reduce ? 1.2 : t * 0.25;
  const N = 6;
  const spanY = R * 0.62;       // 竖向半高（收紧 → 环相叠成纺锤织纹）
  const poleY = spanY + R * 0.18;

  // 幽灵：竖轴（中心留隙）
  const gap = R * 0.1;
  seg(ctx, cx, cy - poleY, cx, cy - gap, GHOST);
  seg(ctx, cx, cy + gap, cx, cy + poleY, GHOST);

  for (let i = 0; i < N; i++) {
    const f = i / (N - 1) - 0.5;              // -0.5 → 0.5
    const yy = cy + f * 2 * spanY;
    const rx = R * (0.7 + 0.5 * Math.cos(f * Math.PI));   // 纺锤：中宽(1.2R)端窄(0.7R)
    // 温和整体呼吸（恒为张开的椭圆，绝不塌成边缘线）+ 逐层微错相
    const ry = R * 0.24 * (0.82 + 0.18 * Math.sin(spin + i * 0.4));
    const rot = Math.sin(spin + i * 0.6) * 0.08;          // 逐层微扭 → 相邻环交叠成织纹
    const sway = Math.sin(spin * 0.8 + i * 0.85) * R * 0.045;

    // 幽灵点线全貌（常显）
    dashed(ctx, [1.5, 6], () => ellipse(ctx, cx + sway, yy, rx, ry, rot, GHOST));
    // 亮白波：随高度 + 时间的行进正弦，逐环点亮成流动感
    const b = reduce
      ? (i === 2 ? 1 : 0.22)
      : 0.24 + 0.76 * (0.5 + 0.5 * Math.sin(t * 0.9 - i * 1.15));
    if (b > 0.03) ellipse(ctx, cx + sway, yy, rx, ry, rot, gray(1, b));
    // 右缘节点（灰）—— 随各环右极形成纺锤轮廓
    dot(ctx, cx + sway + rx * Math.cos(rot), yy + rx * Math.sin(rot), R * 0.02, gray(0.35));
  }

  // 竖轴两极亮点
  dot(ctx, cx, cy - poleY, R * 0.028, gray(1));
  dot(ctx, cx, cy + poleY, R * 0.028, gray(1));
};

/* ② 无限环 —— 一束近水平倾斜椭圆过中心叠成蝴蝶结/∞，相位开合 + 绕行卫星。 */
export const drawFigure8: DrawFn = (ctx, { t, cx, cy, size, reduce }) => {
  const R = size * REACH;
  const spin = reduce ? 0.6 : t * 0.22;
  const M = 4;
  const rx = R * 1.16;
  const ryMax = R * 0.44;

  // 幽灵横轴（中心留隙）
  const gap = R * 0.12;
  seg(ctx, cx - R * 1.28, cy, cx - gap, cy, GHOST);
  seg(ctx, cx + gap, cy, cx + R * 1.28, cy, GHOST);

  const rotOf = (k: number) => (k - (M - 1) / 2) * 0.42 + Math.sin(spin + k) * 0.12;
  const ryOf = (k: number) => Math.max(0.6, ryMax * (0.34 + 0.66 * Math.abs(Math.cos(spin + k * 0.9))));

  for (let k = 0; k < M; k++) {
    const rot = rotOf(k);
    const ry = ryOf(k);
    dashed(ctx, [1.5, 6], () => ellipse(ctx, cx, cy, rx, ry, rot, GHOST));   // 幽灵点线
    const b = reduce ? 0.7 : 0.3 + 0.7 * clamp01(Math.abs(Math.cos(spin + k * 0.9)));
    ellipse(ctx, cx, cy, rx, ry, rot, gray(1, b * 0.92));                    // 亮层（相位开时亮）
  }

  // 中心结点
  dot(ctx, cx, cy, R * 0.038, gray(1));

  // 绕行卫星：沿 k=0 那条椭圆走，带一小段拖尾
  const rot0 = rotOf(0), ry0 = ryOf(0);
  const c = Math.cos(rot0), s = Math.sin(rot0);
  const sa = reduce ? 1.0 : t * 0.6;
  for (let j = 0; j < 4; j++) {
    const th = sa - j * 0.16;
    const ex = rx * Math.cos(th), ey = ry0 * Math.sin(th);
    dot(ctx, cx + ex * c - ey * s, cy + ex * s + ey * c, R * 0.03 * (1 - j * 0.2), gray(1, 1 - j * 0.24));
  }
};

/* ③ 放射节点 —— 中央透视轨道环 + 点线放射到不等长节点 + 环上卫星。 */
export const drawRadial: DrawFn = (ctx, { t, cx, cy, size, reduce }) => {
  const R = size * REACH;
  const spin = reduce ? 0.5 : t * 0.2;
  const rot = spin * 0.6;
  const rx = R * 0.8;
  const ry = Math.max(0.6, R * 0.34 * (0.42 + 0.58 * Math.abs(Math.cos(spin))));  // 3D 呼吸

  // 放射点线 + 端点（在环之下先画，节点落在环外）
  const K = 8;
  for (let i = 0; i < K; i++) {
    const a = spin * 0.4 + i * (TAU / K);
    const len = R * (0.82 + 0.42 * (((i * 7) % 5) / 5));   // 不等长
    const ca = Math.cos(a), sa2 = Math.sin(a);
    const x0 = cx + ca * R * 0.16, y0 = cy + sa2 * R * 0.16;
    const ex = cx + ca * len, ey = cy + sa2 * len;
    dashed(ctx, [1.5, 5], () => seg(ctx, x0, y0, ex, ey, gray(0.5)));
    dot(ctx, ex, ey, R * 0.022, gray(0.55));
  }

  // 中央轨道环：幽灵全貌 + 亮白
  dashed(ctx, [1.5, 6], () => ellipse(ctx, cx, cy, rx, ry, rot, GHOST));
  ellipse(ctx, cx, cy, rx, ry, rot, gray(1, 0.92));

  // 中心 + 环上卫星
  dot(ctx, cx, cy, R * 0.032, gray(1));
  const c = Math.cos(rot), s = Math.sin(rot);
  const sat = reduce ? 0.8 : t * 0.7;
  const px = rx * Math.cos(sat), py = ry * Math.sin(sat);
  dot(ctx, cx + px * c - py * s, cy + px * s + py * c, R * 0.03, gray(1));
};

/* —— 顶图族注册表 —— */
import { drawFrame3D } from "./solid3d";

export type TopArtKind = "orbit" | "figure8" | "radial" | "frame";

export const TOP_ART: Record<TopArtKind, DrawFn> = {
  orbit: drawOrbit,
  figure8: drawFigure8,
  radial: drawRadial,
  frame: drawFrame3D,
};

export const TOP_ART_ORDER: TopArtKind[] = ["orbit", "figure8", "radial", "frame"];

/** 顶图族元信息（名称 / 英文 / 一句描述），供卡片与自检画廊复用。 */
export const TOP_ART_META: Record<TopArtKind, { label: string; en: string; desc: string }> = {
  orbit: {
    label: "轨道椭圆", en: "Orbit",
    desc: "竖轴上层叠的水平椭圆环，3D 呼吸开合、亮波上行——旋转的线圈。",
  },
  figure8: {
    label: "无限环", en: "Figure-8",
    desc: "一束近水平椭圆过中心叠成蝴蝶结/∞，相位开合、卫星绕行——交叠飞轮。",
  },
  frame: {
    label: "契约框", en: "Frame",
    desc: "3D 线框立方(执行契约)内含八面体(生成物)，轨道携 token 卫星——可控生成。",
  },
  radial: {
    label: "放射节点", en: "Radial",
    desc: "中央透视轨道环 + 点线放射到不等长节点——原子/星系节点图。",
  },
};
