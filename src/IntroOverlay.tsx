import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fireCoverEnter } from "@/introSignal";
import "./IntroOverlay.css";

/**
 * IntroOverlay — 1:1 复刻 poetic.com 页面入场（毫秒/像素级）。
 *
 * 三相位（动画时钟锚定 overlay 首帧 t=0，靠 CSS animation-delay，不用 JS 延迟挂载）：
 *   P0  0–500ms    黑屏 hold
 *   P1  500–1500ms 组装：logo「vibe designing playbook」淡入 + #4337FF 方块横扫+3闪
 *   P2  1500–2460ms 四层拉幕：#4337FF/#685CFF/#8D81FF + 黑底 wordmark 层，错峰 80ms 向右滑出
 *
 * React 只做编排：测量 wordmark 宽度（喂方块横扫终点）、reveal+260ms 发封面入场信号、
 * 2460ms 卸载 overlay + 恢复滚动。reduced-motion 降级为 0.45s 黑屏 fade-out。
 */
const COVER_ENTER = 1760; // reveal(1500) + 260：封面在幕下先动
const TOTAL = 2460; // 总时长，最后一层结束 → 卸载

export function IntroOverlay() {
  const [done, setDone] = useState(false);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  const wrapRef = useRef<HTMLSpanElement>(null);

  // 测量 wordmark 渲染宽度 + cap-height，写成 CSS 变量喂方块横扫轨迹。
  // useLayoutEffect 在首帧绘制前跑，早于 0.5s 黑屏结束；再在 web 字体就绪后重测一次，
  // 避免首帧用 fallback 字体量出偏差（方块 ~1000ms 才到终点，来得及修正）。
  useLayoutEffect(() => {
    if (reduced) return;
    let alive = true;
    const measure = () => {
      const wrap = wrapRef.current;
      if (!alive || !wrap) return;
      const logo = wrap.querySelector<HTMLElement>(".intro-logo");
      if (!logo) return;
      const rect = logo.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(logo).fontSize);
      const sq = fontSize * 0.7; // cap-height 近似（Hanken Grotesk cap ≈ 0.7em）的正方形
      wrap.style.setProperty("--wm", `${rect.width}px`); // 横扫终点 = 词尾右
      wrap.style.setProperty("--sq", `${sq}px`);
      wrap.style.setProperty("--sq-top", `${(rect.height - sq) / 2}px`); // 方块垂直坐字身
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      alive = false;
    };
  }, [reduced]);

  // 编排 + body 滚动锁。
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const restore = () => {
      document.body.style.overflow = prevOverflow;
    };

    if (reduced) {
      // 降级：封面在 reduced 下本就直显，立即放行；0.45s 黑屏 fade-out 后卸载。
      fireCoverEnter();
      const t = window.setTimeout(() => {
        restore();
        setDone(true);
      }, 450);
      return () => {
        clearTimeout(t);
        restore();
      };
    }

    const tEnter = window.setTimeout(fireCoverEnter, COVER_ENTER);
    const tDone = window.setTimeout(() => {
      restore();
      setDone(true);
    }, TOTAL);
    return () => {
      clearTimeout(tEnter);
      clearTimeout(tDone);
      restore();
    };
  }, [reduced]);

  if (done) return null;

  if (reduced) {
    return <div className="intro-overlay intro-reduced" aria-hidden="true" />;
  }

  return (
    <div className="intro-overlay" aria-hidden="true">
      {/* 拉幕层：z 倒挂（层1顶→先走），最浅 #8D81FF 领跑揭示边、黑+wordmark 收尾 */}
      <div className="intro-layer intro-layer-4" />
      <div className="intro-layer intro-layer-3" />
      <div className="intro-layer intro-layer-2" />
      <div className="intro-layer intro-layer-1">
        <span className="intro-logo-wrap" ref={wrapRef}>
          <span className="intro-logo">vibe designing playbook</span>
          <span className="intro-square" />
        </span>
      </div>
    </div>
  );
}
