import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IntroSkeleton } from "./content/IntroSkeleton";
import "./ReadingShell.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * 二屏 · 书介绍（引言）—— v2-dark（对标 unmoth + x.com/advertising）。
 * 皮：软深底 + 三声部（思源宋标题 / 思源黑正文 / mono 编号标签）+ 编号分节头
 *    + 纵向「标题 · 正文」+ 双色词强调（亮键词 / 灰陈述，不加粗不变色）。
 * 入场接入 ScrollTrigger，和全站 ScrollSmoother 共用一套滚动时钟，避免二屏显影延迟。
 * 目录已抽到全局 Sidebar，本组件只负责内容区（给固定侧栏让出左侧空间）。
 */
export function ReadingShell() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reveal = () => el.classList.add("rs-in");
    const fallbackTimer = window.setTimeout(reveal, 700);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: reveal,
      });
      ScrollTrigger.refresh();
    }, el);

    return () => {
      window.clearTimeout(fallbackTimer);
      ctx.revert();
    };
  }, []);

  return (
    <section className="rs" id="sec-intro" ref={sectionRef}>
      {/* 编号分节头：发丝线 + 左 mono 标签 + 右 mono 编号（账本式分节，跨内容满宽） */}
      <div className="rs-sechead rs-reveal">
        <span className="rs-sechead-label">
          <span className="rs-sechead-cn">引言</span>
          <span className="rs-sechead-en">/ Introduction</span>
        </span>
        <span className="rs-sechead-no">000</span>
      </div>

      {/* 标题区：思源宋大标题（双色词强调）；三行导语已撤(2026-07 决议),正文直接上提 */}
      <header className="rs-hero rs-reveal">
        <h1 className="rs-hero-title">
          <span>设计，正在成为</span>
          <span className="rs-dim">智能体的语言。</span>
        </h1>
      </header>

      <div className="rs-visual rs-reveal" aria-hidden="true">
        <IntroSkeleton />
      </div>

      {/* 正文区：引言 4 段连贯论述。首句不放大,与正文同字体同字号(2026-07 决议)。 */}
      <div className="rs-body rs-reveal">
        <div className="rs-lead">
          <p>AI 并非不懂设计，而是它的创造力常常被倾向所掩盖。</p>
          <p className="rs-lead-copy">
            <span>当需求含糊时，模型倾向于收敛到训练数据中最高频、最稳妥的那一类结果：</span>
            <span>统一的无衬线字体、浅色背景配紫色渐变、四平八稳的布局。</span>
            <span>这类结果通用、安全，而这恰恰是它流于平庸的根源。</span>
          </p>
          <p className="rs-lead-copy rs-lead-copy--term">
            <span>技术领域将这一现象称为「分布收敛」——</span>
            <span>模型在采样时偏向多数，而多数往往等同于平均。</span>
          </p>
        </div>
        <p>
          真正的问题不在于模型不够强大。它所见过的设计远多于任何一位设计师，本就具备极致的理解力，只是被「向平均靠拢」的惯性所遮蔽。设计师需要做的，不是等待一个更智能的模型，而是把专业的设计能力明确地建立起来、注入给它，让它在具体的业务语境里，知道什么样的设计才称得上好，并沉淀为机制，稳定生产。
        </p>
        <p>
          作为一支长期服务 Agentic 云产品的设计团队，我们将实践经验拆为三层，构成本书的三章。第一层是设计工程：把设计能力工程化地建立起来，包括判断「什么是好」的设计声明、规定「怎么做对」的执行契约，以及把它们封装成可调度的能力。第二层是动态交互：界面不再是预先画死的页面，而是随用户的真实意图在场景中生成。第三层是自我进化：让产物被持续评估、被打回重做，在 taste 的牵引下自己不断突破模型设计能力上限。
        </p>
        <p>
          贯穿这三层的，是一个常被略过的事实：能把「什么是好」讲清楚的，始终是人，而不是模型。模型可以学会执行判断、复用判断、规模化地应用判断，但判断本身，得先由一个真正懂设计的人立起来——这正是这套方法由设计团队而非工程团队提出的原因。我们相信，教会 AI 做设计的，从来不是更强的模型，而是更好的设计师。
        </p>
      </div>
    </section>
  );
}
