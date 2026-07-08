import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./StripeTransition.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * 黑→暖白 横条快门转场（无 pin 版）。
 *
 * 为什么不用 pin：pin 会把下方 .rs 用 transform 拖着移动，pin 释放前标题
 * 一直不在最终位置 → "条带铺满后满屏暖白、标题贴底慢慢升"的死区，无法靠调参消除。
 * 改为：转场层就一屏高(100vh)、不 pin。条带随它自身滚过视口的进度 scrub 生长，
 * 转场层正常滚走，.rs 紧随其后自然流式排布——标题位置不被任何 transform 扰动，
 * .rs 一滚到顶，标题就和固定导航齐平（导航+标题一起出现）。
 *
 * 5 根等高暖白横条 scaleY 0→1（自底向上），最底先动错峰覆盖；接缝 -1px/+1px 防缝。
 */
const STRIPES = 5;

export function StripeTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stripeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (stRef.current) return; // StrictMode 双挂载守卫，只建一次

    gsap.set(stripeRefs.current, { scaleY: 0, transformOrigin: "bottom" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        // 条带在转场层进入视口下缘(top bottom)就开始长 → 离开视口顶(bottom top)铺满。
        // 这样转场层一露头条带就生长，消除"转场屏开头纯黑等滚到顶"的死区。
        start: "top bottom",
        end: "bottom center",
        scrub: 0.5,
      },
      defaults: { ease: "none" },
    });

    // 条带覆盖，铺满落在 progress 1.0
    const DUR = 0.6;
    const EACH = (1 - DUR) / (STRIPES - 1);
    for (let e = 0; e < STRIPES; e++) {
      const s = EACH * (STRIPES - 1 - e); // 最底条先动
      tl.to(stripeRefs.current[e], { scaleY: 1, duration: DUR }, s);
    }
    stRef.current = tl.scrollTrigger ?? null;

    const refresh = () => ScrollTrigger.refresh();
    const t1 = setTimeout(refresh, 1200);
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      clearTimeout(t1);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <div className="stripe-transition" ref={rootRef}>
      <div className="stripe-pin">
        {/* 底层：延续引文黑底，条带在其上长出 */}
        <div className="stripe-bg" />
        {/* 5 根暖白横条 */}
        <div className="stripe-container">
          {Array.from({ length: STRIPES }).map((_, i) => (
            <div
              key={i}
              ref={(el) => { stripeRefs.current[i] = el; }}
              className="stripe-item"
              style={{
                marginTop: i > 0 ? "-1px" : undefined,
                paddingBottom: "1px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
