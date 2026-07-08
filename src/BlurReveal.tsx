import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { onCoverEnter } from "@/introSignal";

gsap.registerPlugin(SplitText);

/**
 * 逐字模糊浮现 —— 1:1 复刻 trionn.com 的 BlurTextReveal。
 *
 * 机制（逆向自 trionn 源码，三个参数是灵魂、不可改）：
 *  - SplitText 把标题拆成逐字符 span（chars）
 *  - 每字 filter:blur(12px)+autoAlpha:0 → blur(0)+autoAlpha:1
 *  - stagger { each:0.05, from:"random" }：随机顺序点亮（神韵来源，非从左到右）
 *  - 单字 duration:0.8 power2.out；父容器同步 0.5 power2.out
 *  - 无位移、无缩放，纯 blur + opacity
 *  - 尊重 prefers-reduced-motion：直接显示，不做动画
 */
interface BlurRevealProps {
  children: string;
  /** 入场起始延迟（ms），与小字解码错峰对齐 */
  delay?: number;
  className?: string;
}

export function BlurReveal({ children, delay = 0, className = "" }: BlurRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { autoAlpha: 1, filter: "blur(0px)" });
      return;
    }

    // 拆字 + 定初始隐藏态,时间线建好后先 paused,等 IntroOverlay 的封面入场信号再播。
    // （原本 mount 即播,会在 intro 幕下提前播完、揭出静止封面）
    let tl: gsap.core.Timeline | null = null;
    const ctx = gsap.context(() => {
      const split = new SplitText(el, { type: "chars,words,lines", smartWrap: true });
      gsap.set(split.chars, {
        autoAlpha: 0,
        filter: "blur(12px)",
        force3D: true,
        willChange: "filter, opacity",
      });

      tl = gsap.timeline({ paused: true });
      tl.to(el, { autoAlpha: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, 0)
        .to(
          split.chars,
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: { each: 0.05, from: "random" },
            ease: "power2.out",
          },
          0
        );
    }, el);

    // 收到信号后按原有 delay 错峰启动（delay 现在相对 reveal+260ms,不再相对 mount）
    let timer: number | undefined;
    const off = onCoverEnter(() => {
      timer = window.setTimeout(() => tl?.play(), delay);
    });

    return () => {
      off();
      if (timer) clearTimeout(timer);
      ctx.revert(); // 还原 SplitText 拆字 + 清动画
    };
  }, [children, delay]);

  return (
    <h1 ref={ref} className={className} style={{ visibility: "hidden" }}>
      {children}
    </h1>
  );
}
