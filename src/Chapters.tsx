import { LINEAR_ART } from "./content/signature/LinearArt";
import "./Chapters.css";

/**
 * 引言页 · 全书板块导览 —— 对照 business.x.com/advertising
 * 「Find the right format / Built to drive results」板块的错落格布局：
 * 每项 = 左侧图形面板(LinearArt SVG 插画族) + 右侧文字列(编号顶对齐、标题+描述居中)；
 * 两项一行与宽幅一行交替(01/02 → 03 宽 → 99/A0)。
 * 无滚动动画(静态排布)；面板底色/线稿明度随全站亮暗主题(--art-card-* / --la-*)。
 */

interface DeckCard {
  id: string;
  no: string;
  en: string;
  title: string;
  desc: string;
  lay: "a" | "b" | "wide";
}

/** 五个板块 —— 插画见 LinearArt.tsx(id 对应)。 */
const DECK: DeckCard[] = [
  {
    id: "ch1", no: "01", en: "Design Engineering",
    lay: "a", title: "设计工程",
    desc: "把设计判断、执行规范与生成流程放进同一条链路，让 AI 的产出稳定接近明确的质量标准。",
  },
  {
    id: "ch2", no: "02", en: "Dynamic Interaction",
    lay: "b", title: "动态交互",
    desc: "界面不再预先画死，而是随用户真实意图在场景中即时生成——先想清任务，再决定此刻该出现什么。",
  },
  {
    id: "ch3", no: "03", en: "Self-Evolution",
    lay: "wide", title: "自我进化",
    desc: "本章讲飞轮：前两章解决「能做出来」，这一章解决「越做越好，而且不靠人盯」。",
  },
  {
    id: "outro", no: "99", en: "Closing",
    lay: "a", title: "结语",
    desc: "把「什么是好的设计」这件原本只存在于直觉里的事，一点点变得明确、可表达、可传递。",
  },
  {
    id: "lex", no: "A0", en: "Lexicon",
    lay: "b", title: "词典",
    desc: "12 类 188 个审美词条，把「高级」「克制」这类抽象词，翻译成 Agent 能执行的表达规则。",
  },
];

export function Chapters() {
  return (
    <section className="deck" id="sec-contents" aria-label="全书板块导览">
      {/* 目录标题：大衬线 Content + 灰色苹方 目录(基线对齐)，下接内容区分割线 */}
      <header className="deck-head">
        <h2 className="deck-title">
          Content
          <span className="deck-title-cn">目录</span>
        </h2>
      </header>
      <div className="deck-headline" aria-hidden="true" />
      <div className="fmt-grid">
        {DECK.map((card) => {
          const Art = LINEAR_ART[card.id];
          return (
            <article
              className={`fmt-item fmt-item--${card.lay}`}
              key={card.id}
            >
              <div className="fmt-panel">
                <Art />
              </div>
              <div className="fmt-info">
                <span className="fmt-no">{card.no}</span>
                <div className="fmt-text">
                  <h3 className="fmt-title">{card.title}</h3>
                  <p className="fmt-desc">{card.desc}</p>
                  <span className="fmt-en">{card.en}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
