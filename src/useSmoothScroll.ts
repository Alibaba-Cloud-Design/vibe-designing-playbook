import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * 丝滑惯性滚动 —— ScrollSmoother 包裹 #smooth-wrapper>#smooth-content,
 * 给整页滚动加阻尼/惯性,松手后顺滑减速。与 ScrollTrigger(转场 pin、逐块 reveal)
 * 自动协同:smoother 接管滚动,trigger 照常按虚拟滚动位置触发。
 *
 * 仅在主滚动页(enabled)启用;词典/独立视图不挂。reduced-motion 时跳过(用原生滚动)。
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!document.getElementById("smooth-wrapper")) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,            // 惯性阻尼强度(秒);越大越"飘",1~1.5 较稳
      effects: true,          // 开启 data-speed/data-lag 视差(给第4步用)
      normalizeScroll: true,  // 抹平移动端地址栏跳动 + 统一滚动驱动
    });

    // 字体/布局 settle 后刷新,校正所有 trigger 的起止
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      clearTimeout(t);
      smoother.kill();
    };
  }, [enabled]);
}
