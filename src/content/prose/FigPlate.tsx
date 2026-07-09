/**
 * FigPlate —— 手绘图版制式外壳（取自用户 arch-2 手稿的版式语言）：
 *   发丝卡框 + 四角选择手柄 + 左上 mono 编号章 + 图形区 + 底部标题栏(标题 + 灰副题)。
 * 配色走 --fp-* token(亮暗自适应,青点 #80EBFF 双主题通用)。
 *
 * 动效(克制,motion 原则:入场一次性 + 常驻极微):
 *   · 入场:主线稿描边生长(.fp-stroke, pathLength=1) → 青点弹入 → 常驻
 *   · 常驻:青点缓浮(.fp-dot) / 虚线缓流(.fp-dash)
 *   · 触发用 GSAP ScrollTrigger(ScrollSmoother 下原生 IO 不可靠),进入视口加 .is-in
 *   · prefers-reduced-motion:全部静止、直接呈现完整图形
 */
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./figplate.css";

gsap.registerPlugin(ScrollTrigger);

export function Plate({
  no,
  title,
  sub,
  children,
}: {
  no: string;
  title: string;
  sub: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 86%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
    });
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { window.clearTimeout(t); st.kill(); };
  }, []);

  return (
    <div className="fp" ref={ref}>
      {/* 四角选择手柄(手稿意象) */}
      <i className="fp-hd fp-hd--tl" aria-hidden="true" />
      <i className="fp-hd fp-hd--tr" aria-hidden="true" />
      <i className="fp-hd fp-hd--bl" aria-hidden="true" />
      <i className="fp-hd fp-hd--br" aria-hidden="true" />
      {/* 左上编号章 */}
      <span className="fp-no">{no}</span>
      {/* 图形区 */}
      <div className="fp-art">{children}</div>
      {/* 底部标题栏 */}
      <div className="fp-cap">
        <span className="fp-title">{title}</span>
        <span className="fp-sub">{sub}</span>
      </div>
    </div>
  );
}

/** 双联/多联图版行（手稿里 01/02 并排的排布） */
export function PlateRow({ children }: { children: ReactNode }) {
  return <div className="fp-row">{children}</div>;
}
