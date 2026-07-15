import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * 大标题随滚动按「行」揭开 —— 给 .sa-title-reveal 的标题:
 * 用 SplitText 拆成行,初始每行下移+透明,进入视口时逐行上滑揭开(像掀开)。
 * 用「行」而非「逐字」,中英文混排更稳、更克制。
 *
 * 注意:SplitText 会改写内部 DOM,所以这些标题不再叠加 .sa-reveal(避免双重动画)。
 */
export function useTitleReveal(ready: unknown = true) {
  useEffect(() => {
    const titles = gsap.utils.toArray<HTMLElement>(".sa-title-reveal");
    if (!titles.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      titles.forEach((t) => (t.style.opacity = "1"));
      return;
    }

    const splits: SplitText[] = [];
    const triggers: ScrollTrigger[] = [];

    titles.forEach((title) => {
      const split = new SplitText(title, { type: "lines", linesClass: "sa-line" });
      splits.push(split);
      gsap.set(split.lines, { yPercent: 110, opacity: 0 });
      title.style.opacity = "1"; // 容器显形,行自身控制可见

      const tr = ScrollTrigger.create({
        trigger: title,
        start: "top 86%",
        once: true,
        onEnter: () =>
          gsap.to(split.lines, {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
          }),
      });
      triggers.push(tr);
    });

    const t = setTimeout(() => ScrollTrigger.refresh(), 350);

    return () => {
      clearTimeout(t);
      triggers.forEach((tr) => tr.kill());
      splits.forEach((s) => s.revert());
    };
  }, [ready]);
}
