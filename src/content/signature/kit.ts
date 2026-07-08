/**
 * 章节签名插画 —— 共享引擎（学 polar.sh 视觉语言，我方原创）。
 *
 * 一套「家族常量 + 缓动 + dt 帧率无关 rAF + IntersectionObserver 门控」引擎，
 * 六张章节签名插画（引言 / 设计工程 / 动态交互 / 自我进化 / 结语 / 词典）全部
 * 由它驱动，保证「多张图出自同一套语言」。
 *
 * 家族一致性（§2.7）：
 *   - 纯白 #fff stroke、线宽 1.75px、平头端点(butt)、fill:none（空心环）、无 glow/shadow。
 *   - 「幽灵轨道 #3c3c3c 全貌常显 + 亮白只描一段」二层：任何描边动画都套这招。
 *   - 触达半径 = 0.32 × 画框（体量一致、四周留白 ~36%，中心构图 + 放射对称）。
 *   - 慢：旋转 0.15–0.25 rad/s、描边 0.8–2.8s、循环 4–10s、dt-based 帧率无关。
 */

/* —— 家族常量（保多张图同出一套） —— */
export const FAMILY = {
  reach: 0.32,        // 触达半径 = 0.32 × 画框
  line: 1.75,         // 线宽 px（1.5–2 的正中）
  ghostRGB: [60, 60, 60] as const,   // #3c3c3c 幽灵轨道
  cap: "butt" as CanvasLineCap,      // 平头端点
};

/* —— 三缓动（精确值，§2.7 动效工具箱） —— */
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // 描边 / 流动
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3); // 填充
export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
/** 0→1 平滑台阶（两端导数为 0），用于脉冲淡入淡出 */
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * 主题调色（素材跟随亮/暗主题）：线稿明暗两端从 CSS 变量读——
 *   --sig-lo = 幽灵端 RGB 三元组(如 "60,60,60")，--sig-hi = 高亮端(如 "255,255,255")。
 * 亮色主题 lo=浅灰/hi=深墨（深线画在浅卡上），暗色反之；变量缺省回退暗色版。
 * data-theme 切换由 MutationObserver 捕获 → 重读变量 + epoch 递增（reduced 静帧也重绘）。
 */
const PAL = { lo: [60, 60, 60], hi: [255, 255, 255] };
export let PAL_EPOCH = 0;
const parseTriplet = (s: string, fb: readonly number[]) => {
  const m = s.trim().match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
  return m ? [+m[1], +m[2], +m[3]] : [...fb];
};
export function syncSigPalette() {
  if (typeof window === "undefined") return;
  const cs = getComputedStyle(document.documentElement);
  PAL.lo = parseTriplet(cs.getPropertyValue("--sig-lo"), [60, 60, 60]);
  PAL.hi = parseTriplet(cs.getPropertyValue("--sig-hi"), [255, 255, 255]);
  GHOST = `rgb(${PAL.lo.join(",")})`;
  WHITE = `rgb(${PAL.hi.join(",")})`;
  PAL_EPOCH++;
}
/** 灰阶：b∈[0,1] 从幽灵端线性插到高亮端（跟随主题的「明暗二层」轴）。 */
export const gray = (b: number, alpha = 1) => {
  const k = clamp01(b);
  const ch = (i: number) => Math.round(PAL.lo[i] + (PAL.hi[i] - PAL.lo[i]) * k);
  return `rgba(${ch(0)},${ch(1)},${ch(2)},${alpha})`;
};
export let GHOST = `rgb(60,60,60)`;
export let WHITE = `rgb(255,255,255)`;
if (typeof window !== "undefined") {
  syncSigPalette();
  new MutationObserver(syncSigPalette).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"],
  });
}

/* —— 画布基元（所有 draw 复用，保手法一致） —— */
export function ring(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  color: string, a0 = 0, a1 = Math.PI * 2,
) {
  if (r <= 0) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(x, y, r, a0, a1);
  ctx.stroke();
}
/**
 * 椭圆弧（rx≠ry，可绕中心旋转）——「轨道椭圆 / figure-8 / 放射节点」顶图族共用基元。
 * ring 只能画正圆；顶图族要的是透视/倾斜椭圆（3D 旋转的环在平面上的投影）。
 * ry→0 即「边缘对我」的一条线，故对极小 ry 仍安全绘制（调用方自行钳到 ≥0.6）。
 */
export function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, rx: number, ry: number, rot: number,
  color: string, a0 = 0, a1 = Math.PI * 2,
) {
  if (rx <= 0 || ry <= 0) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.ellipse(x, y, rx, ry, rot, a0, a1);
  ctx.stroke();
}
export function seg(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number, color: string,
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
export function dot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, color: string,
) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
/** 短箭头：从 (x,y) 沿 angle 画长 len 的杆 + 两笔箭头，butt 端点。 */
export function arrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, angle: number, len: number, color: string,
) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const bx = x - dx * len * 0.5, by = y - dy * len * 0.5; // 尾
  const tx = x + dx * len * 0.5, ty = y + dy * len * 0.5; // 头
  seg(ctx, bx, by, tx, ty, color);
  const h = len * 0.42, spread = 0.62; // 箭头两笔
  seg(ctx, tx, ty, tx - Math.cos(angle - spread) * h, ty - Math.sin(angle - spread) * h, color);
  seg(ctx, tx, ty, tx - Math.cos(angle + spread) * h, ty - Math.sin(angle + spread) * h, color);
}
/** 最短角差（把差归一到 [-π,π]），角度平滑用。 */
export const angleDiff = (target: number, cur: number) => {
  let d = (target - cur) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

/* —— 绘制环境：draw 函数拿到的一切 —— */
export interface DrawEnv {
  size: number;                       // 画框边长（CSS px，正方形）
  t: number;                          // 累计秒（dt 累加，帧率无关）
  dt: number;                         // 本帧秒
  cx: number; cy: number;             // 画框中心
  R: number;                          // 触达半径 = reach × size
  reduce: boolean;                    // 尊重 prefers-reduced-motion
  pointer: { x: number; y: number; active: boolean }; // 归一化 [0,1] 光标（跟随交互用）
  state: Record<string, unknown>;     // 每实例持久状态（跨帧，角度平滑等）
}
export type DrawFn = (ctx: CanvasRenderingContext2D, env: DrawEnv) => void;

/**
 * 引擎驱动：给一个 <canvas> 挂上 dt-rAF + IO 门控 + DPR + reduced-motion + 冻帧钩子。
 * 返回一个清理函数。冻帧：window.__SIG_T=number 强制时间，用于截图自检；
 * window.__SIG_POINTER={x,y} 模拟光标（VectorField 截图用）。
 */
export function driveCanvas(canvas: HTMLCanvasElement, draw: DrawFn, interactive = false) {
  const ctx = canvas.getContext("2d")!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const state: Record<string, unknown> = {};
  const pointer = { x: 0.5, y: 0.5, active: false };
  let cssSize = 0;
  let visible = false;
  let raf = 0, last = 0, t = 0;
  let drewStatic = false;
  let paintedEpoch = -1;               // 主题 epoch：切主题后 reduced 静帧也重绘

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    cssSize = rect.width || canvas.clientWidth || 0;
    canvas.width = Math.max(1, Math.round(cssSize * dpr));
    canvas.height = Math.max(1, Math.round(cssSize * dpr));
    drewStatic = false; // 尺寸变→reduced 需重绘
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const io = new IntersectionObserver(
    ([e]) => { visible = e.isIntersecting; },
    { threshold: 0.04 },
  );
  io.observe(canvas);

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / (r.width || 1);
    pointer.y = (e.clientY - r.top) / (r.height || 1);
    pointer.active = true;
  };
  const onLeave = () => { pointer.active = false; };
  if (interactive) {
    // 跟随全局光标（polar 的 vector field 跨整段跟随），离开画布区不停
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
  }

  const paint = (time: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 1 单位 = 1 CSS px；线宽即视觉线宽
    ctx.clearRect(0, 0, cssSize, cssSize);
    ctx.lineWidth = FAMILY.line;
    ctx.lineCap = FAMILY.cap;
    ctx.lineJoin = "round";
    // 截图冻帧钩子
    const frozen = (window as unknown as { __SIG_T?: number }).__SIG_T;
    const forcedPtr = (window as unknown as { __SIG_POINTER?: { x: number; y: number } }).__SIG_POINTER;
    if (forcedPtr) { pointer.x = forcedPtr.x; pointer.y = forcedPtr.y; pointer.active = true; }
    const tt = typeof frozen === "number" ? frozen : time;
    const R = FAMILY.reach * cssSize;
    draw(ctx, {
      size: cssSize, t: tt, dt: reduce ? 0 : Math.min(0.05, 1 / 60),
      cx: cssSize / 2, cy: cssSize / 2, R,
      reduce, pointer, state,
    });
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!last) last = now;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;          // 切回标签的大跳，钳制
    if (!visible) return;              // IO 门控：离开视口不推进、不绘
    if (reduce) {
      if (drewStatic && paintedEpoch === PAL_EPOCH) return; // reduced：静帧，但主题切换(epoch 变)要重绘
      drewStatic = true;
      paintedEpoch = PAL_EPOCH;
      paint(STATIC_T);
      return;
    }
    t += dt;
    // 把 dt 传进 env（用于角度平滑）：paint 里用固定值不够，这里覆盖
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);
    ctx.lineWidth = FAMILY.line;
    ctx.lineCap = FAMILY.cap;
    ctx.lineJoin = "round";
    const frozen = (window as unknown as { __SIG_T?: number }).__SIG_T;
    const forcedPtr = (window as unknown as { __SIG_POINTER?: { x: number; y: number } }).__SIG_POINTER;
    if (forcedPtr) { pointer.x = forcedPtr.x; pointer.y = forcedPtr.y; pointer.active = true; }
    const tt = typeof frozen === "number" ? frozen : t;
    const R = FAMILY.reach * cssSize;
    draw(ctx, {
      size: cssSize, t: tt, dt,
      cx: cssSize / 2, cy: cssSize / 2, R,
      reduce, pointer, state,
    });
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    if (interactive) {
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    }
  };
}

/** reduced-motion 静态帧取样时刻（各 variant 循环里挑一个「成型」相位）。 */
export const STATIC_T = 3.4;
