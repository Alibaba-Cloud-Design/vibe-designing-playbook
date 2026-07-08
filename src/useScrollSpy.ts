import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { PLAYBOOK_CHAPTERS } from "./content/generated/playbook";

gsap.registerPlugin(ScrollTrigger);

/**
 * 导航 scroll-spy + 点击滚动 —— 单页连续滚动的导航联动:
 *  ① 监听各板块(#sec-*)进出视口,返回「当前所在板块」的 TOC id,供侧栏高亮;
 *  ② 监听 "nav-scroll-to" 事件,把点击的导航项平滑滚动到对应板块。
 *
 * TOC id ↔ 锚点映射:
 *   intro→#sec-intro · ch1/1.1/1.2/1.3→#sec-ch1/#sec-1.1.. · appendix→#sec-appendix
 * 1.1/1.2/1.3 命中时,父章 ch1 也算选中(侧栏父子同时高亮由 active 前缀判断)。
 */

// TOC id → 锚点元素 id
const SECTION_ANCHORS = Object.fromEntries(
  PLAYBOOK_CHAPTERS.flatMap((chapter) => [
    [chapter.id, `sec-${chapter.id}`],
    ...chapter.sections.map((section) => [section.id, `sec-${section.id}`]),
  ]),
);

const ANCHOR: Record<string, string> = {
  intro: "sec-intro",
  ...SECTION_ANCHORS,
  outro: "sec-outro",
  appendix: "sec-appendix",
};
// 自上而下的板块顺序(用于判断「当前所在」)
const ORDER = [
  "intro",
  ...PLAYBOOK_CHAPTERS.flatMap((chapter) => [chapter.id, ...chapter.sections.map((section) => section.id)]),
  "outro",
  "appendix",
];

export function useScrollSpy(): string {
  const [active, setActive] = useState("intro");

  useEffect(() => {
    // 点击导航 → 平滑滚动到板块。
    // 落点校正:平滑滚动途中,沿途懒加载图片会把页面撑高,点击瞬间算出的目标位置随之过期,
    // 导致"点了没到对应章节"。滚动结束后复查两次,偏差超过 24px 就再滚一小段补正;
    // 用户一旦手动滚动(滚轮/触摸)立即放弃校正,不与人抢滚动条。
    let settleTimers: number[] = [];
    const cancelSettle = () => { settleTimers.forEach(clearTimeout); settleTimers = []; };
    window.addEventListener("wheel", cancelSettle, { passive: true });
    window.addEventListener("touchstart", cancelSettle, { passive: true });

    const onNav = (e: Event) => {
      const id = (e as CustomEvent).detail as string;
      const anchorId = ANCHOR[id];
      if (!anchorId) return;
      const el = document.getElementById(anchorId);
      if (!el) return;
      cancelSettle();
      const smoother = ScrollSmoother.get();
      if (smoother) {
        // 平滑滚动到板块顶,留 80px 余量(避开顶部)
        smoother.scrollTo(el, true, "top 80px");
        // 落点校正只做一次、且瞬时贴齐(不二次滑动,避免"页面自己又滑了一段"的怪动画);
        // 只有沿途懒加载把落点顶偏超过 32px 才触发
        const fix = () => {
          if (Math.abs(el.getBoundingClientRect().top - 80) > 32) {
            smoother.scrollTo(el, false, "top 80px");
          }
        };
        settleTimers = [window.setTimeout(fix, 1300)];
      } else {
        // 兜底:无 smoother(降级/未就绪)时用原生滚动到元素绝对偏移
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };
    window.addEventListener("nav-scroll-to", onNav);

    // scroll-spy:每个板块一个 trigger,记录其覆盖视口中线的状态
    const triggers: ScrollTrigger[] = [];
    ORDER.forEach((id) => {
      const el = document.getElementById(ANCHOR[id]);
      if (!el) return;
      const tr = ScrollTrigger.create({
        trigger: el,
        start: "top center",   // 板块顶过视口中线 → 进入
        end: "bottom center",  // 板块底过视口中线 → 离开
        onToggle: (self) => { if (self.isActive) setActive(id); },
      });
      triggers.push(tr);
    });

    const t = setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      clearTimeout(t);
      cancelSettle();
      window.removeEventListener("wheel", cancelSettle);
      window.removeEventListener("touchstart", cancelSettle);
      window.removeEventListener("nav-scroll-to", onNav);
      triggers.forEach((tr) => tr.kill());
    };
  }, []);

  return active;
}
