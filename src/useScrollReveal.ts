import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * 逐块滚动显现 —— 给带 .sa-reveal 类的元素接 GSAP:
 * 进入视口下缘时,从「透明 + 下移 28px」淡入上滑到位,只播一次。
 * 用 ScrollTrigger.batch 批处理,性能比每元素一个 trigger 好得多。
 *
 * 传入一个 ready 依赖(如内容是否挂载),内容变了会重建。
 */
export function useScrollReveal(ready: unknown = true) {
  useEffect(() => {
    const els = gsap.utils.toArray<HTMLElement>(".sa-reveal:not(.is-in)");
    if (!els.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const triggers = ScrollTrigger.batch(els, {
      start: "top 88%",          // 元素顶进到视口 88% 处即触发
      once: true,
      onEnter: (batch) =>
        gsap.fromTo(batch, {
          opacity: 0,
          y: 28,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.08,         // 同批元素错峰,像一行行落位
          immediateRender: false,
          onStart: () => batch.forEach((el) => (el as HTMLElement).classList.add("is-in")),
        }),
    });

    // 字体/布局settle后刷新触发点
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(t);
      triggers.forEach((tr) => tr.kill());
    };
  }, [ready]);
}
