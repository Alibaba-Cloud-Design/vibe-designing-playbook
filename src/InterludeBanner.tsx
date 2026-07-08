import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import "./InterludeBanner.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * 二屏·书介绍 收束引文 —— 复刻 trionn FadeOnScroll：逐字「上色点亮」跟随滚动进度。
 * v2-dark：初始近透明暗灰，随滚动逐字着色到全局 --ink。
 * 机制不动：GSAP SplitText(chars) + ScrollTrigger scrub（无位移、无透明度，纯 color 渐染）；
 *          本次仅换深色皮/颜色（红线：InterludeBanner 动画机制保留）。
 */
const QUOTE =
  "Engineering gives the agent real capability, interaction lets it catch intent in context, evolution keeps it leaping, pulled by taste.";

export function InterludeBanner() {
  const rootRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const quote = quoteRef.current;
    if (!root || !quote) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(quote, { color: "var(--ink)" });
      return;
    }

    const ctx = gsap.context(() => {
      const rootStyle = getComputedStyle(document.documentElement);
      const ink = rootStyle.getPropertyValue("--ink").trim() || "#DAD8D2";
      const faint = rootStyle.getPropertyValue("--ink-10").trim() || "rgba(218,216,210,0.12)";
      const split = new SplitText(quote, { type: "chars", charsClass: "ib-char" });
      // trionn FadeOnScroll：基色近透明暗灰 → 逐字着色到全局正文色，scrub 跟随滚动
      gsap.set(split.chars, { color: faint });
      gsap.to(split.chars, {
        color: ink,
        stagger: 0.03,
        ease: "none",
        scrollTrigger: {
          trigger: quote,
          start: "top 80%",
          end: "bottom 80%",   // 着色在引文滚到视口 80% 处就完成，不用看完再空滚一大段
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="ib" aria-label="核心主线">
      <p ref={quoteRef} className="ib-quote">{QUOTE}</p>
    </section>
  );
}
