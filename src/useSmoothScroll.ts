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

    /* 移动端"读到一半白屏/弹回版头"的对症解:手机浏览器地址栏收放会触发一次 resize,
       ScrollTrigger 默认据此 refresh → smoother 内容 transform 重算并瞬间弹回 0(回版头)+
       重算空档白屏。ignoreMobileResize 让它忽略工具栏那点高度变化,只在真正横竖屏/尺寸
       变化时才 refresh。这是 GSAP 官方针对移动地址栏的开关。 */
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* 触屏设备(手机/平板):normalizeScroll 保留(抹平移动端滚动驱动);smoothTouch 默认关
       (触屏本就是原生手感)。安全的性能削减 = 关掉 effects(data-speed 视差),省每帧 transform。 */
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,             // 触屏 smoothTouch 默认关,此值只作用于桌面
      effects: !touch,         // 触屏关视差:省每帧 transform,不碰滚动机制
      normalizeScroll: true,   // 必须保留:抹平移动端地址栏跳动 + 统一滚动驱动
    });

    // 字体/布局 settle 后刷新,校正所有 trigger 的起止
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      clearTimeout(t);
      smoother.kill();
    };
  }, [enabled]);
}
