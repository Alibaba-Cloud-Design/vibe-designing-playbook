import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * P10 · 收尾页脚 —— 巨型近隐形字标（对标 unmoth-07-footer-wordmark）。
 * 上：克制的 colophon + 作者双列(2026-07 决议:撤账本编号头与跳转列,加作者板块)。
 * 下：超大「vibe designing playbook」以近 --bg 的 ghost 灰渲染（几乎看不见）
 *     + 虚线制图框 + 网格辅助线 + mono 比例标注；滚入视口时左→右擦入揭示。
 */

const AUTHORS = ["ZhuYan", "Ailin Yu", "Zehui Jin"];

// —— 制图图几何（viewBox 1240 × 700；三行居中堆叠字标，对标 unmoth 居中填满框）——
const VB_W = 1240;
const VB_H = 700;
const FRAME = { x: 84, y: 40, x2: 1204, y2: 616 };     // 虚线制图框
const WORD_CX = (84 + 1204) / 2;                        // 字标中轴（居中）
const FS = 220;                                         // 字标字号
const BASELINES = [204, 410, 616];                      // 三行基线（gap 206；末行落在框底）
// 竖向网格辅助线（frame 内几条 + 边）
const V_GUIDES = [210, 470, 700, 940, 1120];
// 底部 Y 比例标注（呼应 unmoth：XYZ / 1Y / 1.75Y / 0.59Y…）
const BOTTOM_LABELS = [
  { x: FRAME.x, t: "XYZ" },
  { x: 210, t: "1Y" },
  { x: 470, t: "1.75Y" },
  { x: 940, t: "2.4Y" },
  { x: 1120, t: "0.59Y" },
];
// 左轴 X 高度标注（line1 的 ascender / x-height 两条横辅助线）
const H_ASCENDER = 52;   // line1 ascender 横线
const H_XHEIGHT = 108;   // line1 x-height 横线

// 角标 tick（L 形），legLen 腿长
function CornerTick({ x, y, dx, dy, len = 14 }: { x: number; y: number; dx: number; dy: number; len?: number }) {
  return (
    <>
      <line className="fwm-tick" x1={x} y1={y} x2={x + dx * len} y2={y} />
      <line className="fwm-tick" x1={x} y1={y} x2={x} y2={y + dy * len} />
    </>
  );
}

export function Footer() {
  const wrapRef = useRef<HTMLDivElement>(null);

  // 字标「左→右擦入」揭示 —— 用 GSAP ScrollTrigger（与 ScrollSmoother 集成，
  // 全站 sa-reveal/scroll-spy 同一引擎；原生 IntersectionObserver 在 transform 滚动下不触发）。
  // 呼应侧栏蓝块 / 横条转场的擦入语言。reduced-motion 直接显示全貌。
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const proxy = { p: 100 };
    gsap.set(el, { clipPath: "inset(0 100% 0 0)" });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      once: true,
      onEnter: () =>
        gsap.to(proxy, {
          p: 0,
          duration: 1.15,
          ease: "power3.out",
          onUpdate: () => gsap.set(el, { clipPath: `inset(0 ${proxy.p}% 0 0)` }),
        }),
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(t); st.kill(); };
  }, []);

  return (
    <footer className="ft">
      {/* —— meta：colophon(无编号头) + 作者 双列 —— */}
      <div className="ft-meta sa-reveal">
        <div className="ft-col">
          <div className="ft-list">
            <span className="ft-line">阿里云设计中心出品</span>
            <span className="ft-line-mono">2026 · Intent becomes form.</span>
          </div>
        </div>
        <div className="ft-col">
          <div className="ft-col-head"><span>作者 / Authors</span></div>
          <div className="ft-list">
            {AUTHORS.map((name) => (
              <span key={name} className="ft-line">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* —— 巨型近隐形字标（ghost fill + dashed 蓝图轮廓 + 制图框 + 比例标注）—— */}
      <div ref={wrapRef} className="ft-wm-wrap">
        <svg className="ft-wordmark" viewBox={`0 0 ${VB_W} ${VB_H}`} role="img"
             aria-label="Vibe Designing Playbook" preserveAspectRatio="xMidYMid meet">
          {/* 竖向网格辅助线（frame 内）*/}
          {V_GUIDES.map((x) => (
            <line key={"v" + x} className="fwm-grid" x1={x} y1={FRAME.y} x2={x} y2={FRAME.y2} />
          ))}
          {/* 两条横向高度辅助线（line1 ascender / x-height）*/}
          <line className="fwm-grid" x1={FRAME.x} y1={H_ASCENDER} x2={FRAME.x2} y2={H_ASCENDER} />
          <line className="fwm-grid" x1={FRAME.x} y1={H_XHEIGHT} x2={FRAME.x2} y2={H_XHEIGHT} />
          {/* 各行基线（thin）*/}
          {BASELINES.map((y) => (
            <line key={"b" + y} className="fwm-base" x1={FRAME.x} y1={y} x2={FRAME.x2} y2={y} />
          ))}
          {/* 虚线制图框 + 四角 tick */}
          <rect className="fwm-frame" x={FRAME.x} y={FRAME.y}
                width={FRAME.x2 - FRAME.x} height={FRAME.y2 - FRAME.y} />
          <CornerTick x={FRAME.x} y={FRAME.y} dx={1} dy={1} />
          <CornerTick x={FRAME.x2} y={FRAME.y} dx={-1} dy={1} />
          <CornerTick x={FRAME.x} y={FRAME.y2} dx={1} dy={-1} />
          <CornerTick x={FRAME.x2} y={FRAME.y2} dx={-1} dy={-1} />

          {/* 巨型字标：三行居中（ghost fill + dashed 轮廓）*/}
          <text className="fwm-word" x={WORD_CX} y={BASELINES[0]} fontSize={FS} textAnchor="middle">vibe</text>
          <text className="fwm-word" x={WORD_CX} y={BASELINES[1]} fontSize={FS} textAnchor="middle">designing</text>
          <text className="fwm-word" x={WORD_CX} y={BASELINES[2]} fontSize={FS} textAnchor="middle">playbook</text>

          {/* 左轴 X 高度标注 */}
          <text className="fwm-label fwm-label-x" x={FRAME.x - 12} y={H_ASCENDER + 5}>0.4X</text>
          <text className="fwm-label fwm-label-x" x={FRAME.x - 12} y={H_XHEIGHT + 5}>1X</text>
          {/* 底部 Y 比例标注 */}
          {BOTTOM_LABELS.map((l) => (
            <text key={l.t} className="fwm-label" x={l.x + 6} y={FRAME.y2 + 30} textAnchor="start">{l.t}</text>
          ))}
        </svg>
      </div>
    </footer>
  );
}
