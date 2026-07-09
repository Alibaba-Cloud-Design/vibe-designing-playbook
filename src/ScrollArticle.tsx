import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lexer, marked, parser, Parser, type Token, type Tokens } from "marked";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { PLAYBOOK_CHAPTERS, PLAYBOOK_OUTRO, type PlaybookSection } from "./content/generated/playbook";
import { Illustration } from "./content/Illustrations";
import type { FigureKind } from "./content/chapter1";
import {
  parseStep, StepLabel,
  parseAttachments, AttachmentGroup,
  GlossaryCard, CompareCard,
} from "./content/prose/blocks";
import { DiagramFigure, matchDiagram } from "./content/prose/diagrams";
import { LINEAR_ART } from "./content/signature/LinearArt";
import "./content/prose/prose-tokens.css";
import "./content/prose/Prose.css";
import { asset } from "./asset";
import "./ScrollArticle.css";

gsap.registerPlugin(ScrollTrigger);

const MARKED_OPTIONS = { gfm: true, breaks: false };

/* 第三章 evaluator 配图:手稿 markdown 图链 → public/figures/fig-3-x-{light,dark}.svg */
const FIG3 = new Set(["3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "3-7"]);

const SECTION_FIGURES: Partial<
  Record<string, { kind?: FigureKind; img?: { light: string; dark: string; w?: number; h?: number }; caption: string }>
> = {
  /* 1.1 不设章首引导图(2026-07 决议:开篇先文字);架构图落在正文「配图:Design I/O」挂点,见 diagrams.tsx */
  /* 1.2 用户手绘架构图-2(2026-07):亮暗双 SVG 随主题切换;w/h=固有比例预留高度 */
  "1.2": {
    img: { light: "/figures/arch-2-light.svg", dark: "/figures/arch-2-dark.svg", w: 2248, h: 894 },
    caption: "设计声明定义什么是好，执行契约规定怎么做出来。",
  },
  "1.3": { kind: "skill-anatomy", caption: "Skill 把触发时机、判断流程和经验细节封装成可调度能力。" },
};

function inlineHtml(token: { tokens?: Token[]; text: string }) {
  if (token.tokens?.length) return Parser.parseInline(token.tokens, MARKED_OPTIONS);
  return marked.parseInline(token.text, { ...MARKED_OPTIONS, async: false });
}

function blockHtml(tokens: Token[]) {
  return parser(tokens, MARKED_OPTIONS);
}

function markdownTokens(markdown: string) {
  let skippedTitle = false;
  return lexer(markdown, MARKED_OPTIONS).filter((token) => {
    if (!skippedTitle && token.type === "heading" && token.depth === 1) {
      skippedTitle = true;
      return false;
    }
    return token.type !== "space";
  });
}

function normalizeCodeLanguage(lang?: string) {
  if (!lang) return "text";
  const raw = lang.trim().toLowerCase();
  if (raw === "js") return "javascript";
  if (raw === "ts") return "typescript";
  if (raw === "tsx" || raw === "jsx" || raw === "json" || raw === "css" || raw === "html") return raw;
  return raw;
}

function renderTable(token: Tokens.Table, key: string) {
  return (
    <div key={key} className="pr-table-wrap sa-reveal">
      <table className="pr-table">
        <thead>
          <tr>
            {token.header.map((cell, i) => (
              <th key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(cell) }} />
            ))}
          </tr>
        </thead>
        <tbody>
          {token.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} dangerouslySetInnerHTML={{ __html: inlineHtml(cell) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderList(token: Tokens.List, key: string) {
  const Tag = token.ordered ? "ol" : "ul";
  return (
    <Tag key={key} className={token.ordered ? "pr-ol sa-reveal" : "pr-ul sa-reveal"}>
      {token.items.map((item, i) => (
        <li
          key={i}
          className={token.ordered ? "pr-ol-li" : "pr-li"}
          dangerouslySetInnerHTML={{ __html: marked.parseInline(item.text, { ...MARKED_OPTIONS, async: false }) }}
        />
      ))}
    </Tag>
  );
}

/* 把正文里指向 manuscript/attachments/*.md 的相对链接，改写成 public 下可直接下载的绝对链接。 */
function rewriteAttachmentLinks(html: string) {
  return html.replace(/href="([^"]*attachments\/[^"]+\.md)"/g, (_m, href: string) => {
    const abs = asset(String(href).replace(/^.*attachments\//, "/attachments/"));
    return `href="${abs}" download`;
  });
}

/* blockquote 路由：按约定 emoji 起头，把「原始占位」升级成设计过的富块。 */
function routeBlockquote(quote: Tokens.Blockquote, key: string) {
  const raw = (quote.text ?? "").trim();
  const first = (quote.tokens?.[0] as Tokens.Paragraph | undefined)?.text?.trim() ?? raw;

  // 🖼️ / 配图占位 / 配图建议 / 架构图 / 示意图 / 对比图 → 描边框内的图版（真实 SVG 图或媒体井）
  if (/^(🖼️|配图|架构图|示意图|对比图)/u.test(raw)) {
    const d = matchDiagram(raw);
    return <DiagramFigure key={key} spec={d} caption={d.caption} no={d.no} />;
  }
  // 🧩 调用能力 / 📄 阶段产出 → 可下载附件卡
  if (raw.startsWith("🧩") || raw.startsWith("📄")) {
    return <AttachmentGroup key={key} rows={parseAttachments(raw)} />;
  }
  // 📇 术语｜释义 → 设计词条卡
  if (raw.startsWith("📇")) {
    const head = first.replace(/^📇\s*/u, "").replace(/\*\*/g, "").trim();
    const [termRaw, ...enParts] = head.split("｜");
    const term = enParts.length ? termRaw.trim() : head;
    const en = enParts.length ? enParts.join("｜").trim() : undefined;
    const bodyHtml = rewriteAttachmentLinks(blockHtml((quote.tokens ?? []).slice(1)));
    return <GlossaryCard key={key} term={term} en={en} body={<span dangerouslySetInnerHTML={{ __html: bodyHtml }} />} />;
  }
  // 🃏 对照卡 / 案例卡 / 分层卡 / 示例卡 → 对照卡容器（内表格沿用 pr-table）
  if (raw.startsWith("🃏")) {
    const caption = first.replace(/^🃏\s*/u, "").replace(/[:：]\s*$/, "").trim();
    const inner = (quote.tokens ?? []).slice(1).map((t, j) => {
      if (t.type === "table") return renderTable(t as Tokens.Table, `${key}-t${j}`);
      if (t.type === "paragraph")
        return <p key={`${key}-p${j}`} className="pr-p" dangerouslySetInnerHTML={{ __html: inlineHtml(t as Tokens.Paragraph) }} />;
      return null;
    });
    return <CompareCard key={key} caption={caption}>{inner}</CompareCard>;
  }
  return <blockquote key={key} className="pr-quote sa-reveal" dangerouslySetInnerHTML={{ __html: rewriteAttachmentLinks(blockHtml(quote.tokens)) }} />;
}


/* —— 右侧小章节索引（poolside blog 式右栏 sticky 目录）——
   从本节 markdown 抽 h2 级标题（跳过「第X步」步骤名），锚 id 与 renderMarkdown 一致。 */
function extractToc(markdown: string, anchorPrefix: string) {
  const items: { id: string; label: string }[] = [];
  markdownTokens(markdown).forEach((token, i) => {
    if (token.type !== "heading") return;
    const heading = token as Tokens.Heading;
    if (heading.depth > 2) return;
    if (parseStep(heading.text)) return;
    /* 去掉「一、二、…」中文序号(右栏已有 1.X.X 编号);「接下来」已由关联卡替代,不进索引 */
    const label = heading.text
      .replace(/\*\*|`|__/g, "")
      .replace(/^[一二三四五六七八九十]+、\s*/, "")
      .trim();
    if (label && label !== "接下来") items.push({ id: `${anchorPrefix}-h${i}`, label });
  });
  return items;
}

/* —— 「接下来」→ 关联板块预告卡(2026-07,参考 poolside NEXT IN SERIES) ——
   双发丝框 + 居中 mono 眉标 + 衬线标题(目标板块名) + ↓;整卡可点,走 nav-scroll-to。 */
function nextTarget(sectionId: string): { nav: string; kicker: string; title: string } | null {
  if (sectionId === "outro")
    return { nav: "appendix", kicker: "NEXT · LEXICON", title: "设计提示词词典" };
  const flat = PLAYBOOK_CHAPTERS.flatMap((ch) => ch.sections.map((s) => ({ s, ch })));
  const i = flat.findIndex((f) => f.s.id === sectionId);
  if (i === -1) return null;
  const nxt = flat[i + 1];
  if (!nxt) return { nav: "outro", kicker: "NEXT · CLOSING", title: PLAYBOOK_OUTRO.title };
  if (nxt.ch.id !== flat[i].ch.id)
    return { nav: nxt.ch.id, kicker: `NEXT · CHAPTER ${nxt.ch.no}`, title: nxt.ch.title };
  return { nav: nxt.s.id, kicker: `NEXT · ${nxt.s.id}`, title: nxt.s.title };
}

function NextTeaser({ sectionId }: { sectionId: string }) {
  const target = nextTarget(sectionId);
  if (!target) return null;
  return (
    <button
      type="button"
      className="nx sa-reveal"
      onClick={() => window.dispatchEvent(new CustomEvent("nav-scroll-to", { detail: target.nav }))}
    >
      <span className="nx-kicker">{target.kicker}</span>
      <span className="nx-title">{target.title}</span>
      <span className="nx-arrow" aria-hidden="true">↓</span>
    </button>
  );
}

function SectionToc({ items, no }: { items: { id: string; label: string }[]; no: string }) {
  const [activeId, setActiveId] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const markerRef = useRef<HTMLSpanElement>(null);

  // ScrollSmoother 会 transform 内容层；目录 portal 到 body 后，fixed 才是真正的视口固定。
  useEffect(() => {
    const section = markerRef.current?.closest(".sa-section") as HTMLElement | null;
    if (!section) return;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top+=120",
      end: "bottom top+=260",
      onEnter: () => setIsVisible(true),
      onEnterBack: () => setIsVisible(true),
      onLeave: () => setIsVisible(false),
      onLeaveBack: () => setIsVisible(false),
    });
    return () => st.kill();
  }, [items]);

  useEffect(() => {
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActiveId(en.target.id);
      },
      { rootMargin: "-18% 0px -72% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(el, true, "top 140px");
    else {
      const top = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <span className="sa-toc-marker" ref={markerRef} aria-hidden="true" />
      {createPortal(
        <nav className={"sa-toc" + (isVisible ? " is-visible" : "")} aria-label="本节小节索引">
          <div className="sa-toc-inner">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={"sa-toc-item" + (activeId === it.id ? " is-active" : "")}
            onClick={() => go(it.id)}
          >
            <span className="sa-toc-no">{no}.{i + 1}</span>
            {it.label}
          </button>
        ))}
          </div>
        </nav>,
        document.body,
      )}
    </>
  );
}

function renderMarkdown(markdown: string, anchorPrefix?: string) {
  /* 尾部「接下来」块不直排(2026-07 决议:由 NextTeaser 关联卡替代;手稿原文保留) */
  let tokens = markdownTokens(markdown);
  const cut = tokens.findIndex(
    (t) => t.type === "heading" && (t as Tokens.Heading).depth <= 2 && (t as Tokens.Heading).text.trim() === "接下来",
  );
  if (cut !== -1) tokens = tokens.slice(0, cut);
  /* 图 3-x:图片段落后紧跟的重复图注段落不直排(图注已由图版渲染);只跳"与 alt 全等"的行 */
  const skipIdx = new Set<number>();
  const norm = (t: string) => t.replace(/[–—]/g, "-").replace(/\s+/g, "").trim();
  tokens.forEach((tk, idx) => {
    if (tk.type !== "paragraph") return;
    const pt = tk as Tokens.Paragraph;
    const solo = pt.tokens?.length === 1 && pt.tokens[0].type === "image" ? (pt.tokens[0] as Tokens.Image) : null;
    if (!solo || !/图\s*3-\d+/.test(solo.text ?? "")) return;
    const nxt = tokens[idx + 1];
    if (nxt?.type === "paragraph" && norm((nxt as Tokens.Paragraph).text ?? "") === norm(solo.text ?? "")) skipIdx.add(idx + 1);
  });
  return tokens.map((token, i) => {
    if (skipIdx.has(i)) return null;
    const key = `${token.type}-${i}`;

    switch (token.type) {
      case "heading": {
        const heading = token as Tokens.Heading;
        // 「第X步:…」→ 靛蓝块 + 近黑块步骤名（poolside 章节感）
        const step = heading.depth <= 2 ? parseStep(heading.text) : null;
        if (step) return <StepLabel key={key} {...step} />;
        const className = heading.depth <= 2 ? "pr-h2 sa-reveal" : "pr-h3 sa-reveal";
        const Tag = heading.depth <= 2 ? "h2" : "h3";
        const anchorId = anchorPrefix && heading.depth <= 2 ? `${anchorPrefix}-h${i}` : undefined;
        return <Tag key={key} id={anchorId} className={className} dangerouslySetInnerHTML={{ __html: inlineHtml(heading) }} />;
      }
      case "paragraph": {
        const paragraph = token as Tokens.Paragraph;
        /* 第三章手稿用 ![图 3-x 标题](…/evaluator-xxx.png) 直插图片:
           拦截"整段只有一张图"的段落,升级成 ch2 同款可缩放亮暗双主题图版(素材 fig-3-x-light/dark.svg) */
        const solo = paragraph.tokens?.length === 1 && paragraph.tokens[0].type === "image"
          ? (paragraph.tokens[0] as Tokens.Image) : null;
        if (solo) {
          const m = /图\s*(3-\d+)/.exec(solo.text ?? "");
          const no = m?.[1];
          if (no && FIG3.has(no)) {
            const caption = (solo.text ?? "").replace(/^图\s*3-\d+\s*/, "").trim();
            return (
              <DiagramFigure key={key} no={no}
                spec={{ render: "image", light: `/figures/fig-${no}-light.svg`, dark: `/figures/fig-${no}-dark.svg`, caption }} />
            );
          }
        }
        return <p key={key} className="pr-p sa-reveal" dangerouslySetInnerHTML={{ __html: rewriteAttachmentLinks(inlineHtml(paragraph)) }} />;
      }
      case "blockquote":
        return routeBlockquote(token as Tokens.Blockquote, key);
      case "code": {
        const code = token as Tokens.Code;
        const lang = normalizeCodeLanguage(code.lang);
        /* useInlineStyles=false:只输出 token 类名,配色由 Prose.css 的站内墨阶接管
           (行内主题色会带来红橙语法色,且暗色模式不翻转) */
        return (
          <div key={key} className="pr-code sa-reveal" data-lang={lang}>
            <SyntaxHighlighter
              language={lang}
              useInlineStyles={false}
              PreTag="div"
              CodeTag="code"
              wrapLongLines={false}
              customStyle={{ margin: 0, padding: 0, background: "transparent" }}
              codeTagProps={{ className: "pr-code-inner" }}
            >
              {code.text}
            </SyntaxHighlighter>
          </div>
        );
      }
      case "list":
        return renderList(token as Tokens.List, key);
      case "table":
        return renderTable(token as Tokens.Table, key);
      case "hr":
        return <hr key={key} className="pr-hr" />;
      case "html": {
        const html = token as Tokens.HTML;
        return <div key={key} className="pr-html sa-reveal" dangerouslySetInnerHTML={{ __html: html.text }} />;
      }
      default:
        return null;
    }
  });
}

/* 章扉副题 = 章节英文名(2026-07 决议:替换原中文副题句;与侧栏/目录卡英文一致) */
const CHAPTER_EN: Record<string, string> = {
  ch1: "Design Engineering",
  ch2: "Dynamic Interaction",
  ch3: "Self-Evolution",
  outro: "Closing",
};

interface SpreadData {
  id: string;
  title: string;
  lede: string;
  kicker: string;
  metaRight: string;
}

/* 一屏章扉：mono 眉标 + 收敛思源宋标题 + 灰副题 + 灰导语（左），内容匹配的 gif 配图（右·错落下移）。
   借 X business/advertising 的「一屏一主语 + 非对称错落 + 描边图版」，字号收敛，留白节奏。 */
function SpreadPlate({ data, outro = false }: { data: SpreadData; outro?: boolean }) {
  const HeroArt = LINEAR_ART[data.id];
  return (
    <section
      className={`sa-chapter-spread${outro ? " sa-chapter-spread--outro" : ""}`}
      id={`sec-${data.id}`}
      data-chapter={data.id}
    >
      <div className="sa-spread-line" aria-hidden="true" />
      <div className="sa-spread-meta sa-spread-reveal">
        <span className="sa-spread-kicker">
          <i className="sa-spread-kicker-sq" aria-hidden="true" />
          {data.kicker}
        </span>
        <span className="sa-spread-meta-right">{data.metaRight}</span>
      </div>

      <div className="sa-spread-body">
        <div className="sa-spread-lead">
          <h2 className="sa-spread-title sa-title-reveal">
            {data.title}
            <span className="sa-spread-title-sub">{CHAPTER_EN[data.id]}</span>
          </h2>
          <p className="sa-spread-lede sa-spread-reveal">{data.lede}</p>
        </div>

        {HeroArt && (
          <figure className="sa-spread-figure sa-spread-reveal">
            <div className="sa-spread-figure-frame">
              {/* 井内为 LinearArt 同族插画，.lart 绝对定位铺满井(无角标/无注记,纯净面板) */}
              <div className="sa-spread-figure-well">
                <HeroArt />
              </div>
            </div>
          </figure>
        )}
      </div>
    </section>
  );
}

function ChapterSpread({ chapter }: { chapter: (typeof PLAYBOOK_CHAPTERS)[number] }) {
  return (
    <SpreadPlate
      data={{
        id: chapter.id,
        title: chapter.title,
        lede: chapter.lede,
        kicker: `CHAPTER ${chapter.no}`,
        metaRight: `${chapter.navNo} · ${chapter.sections.length.toString().padStart(2, "0")} sections`,
      }}
    />
  );
}

function SectionFigure({ section }: { section: PlaybookSection }) {
  const figure = SECTION_FIGURES[section.id];
  if (!figure) return null;

  return (
    <figure className="pr-figure pr-figure--lead sa-reveal">
      {/* 图片型插图不要外框(2026-07 决议:素材自带留白,发丝框冗余) */}
      <div className={"pr-figure-frame" + (figure.img ? " pr-figure-frame--bare" : "")} data-speed="0.96">
        {figure.img ? (
          /* 主题双图:亮显 light、暗显 dark(CSS 按 data-theme 切换) */
          <>
            <img className="fig-themed fig-themed--light" src={asset(figure.img.light)} alt="" width={figure.img.w} height={figure.img.h} loading="lazy" decoding="async" />
            <img className="fig-themed fig-themed--dark" src={asset(figure.img.dark)} alt="" width={figure.img.w} height={figure.img.h} loading="lazy" decoding="async" />
          </>
        ) : (
          <Illustration kind={figure.kind!} />
        )}
      </div>
      <figcaption className="pr-figcap">{figure.caption}</figcaption>
    </figure>
  );
}

function ArticleSection({ section, chapterTitle }: { section: PlaybookSection; chapterTitle: string }) {
  const anchorPrefix = `sec-${section.id}`;
  const toc = extractToc(section.markdown, anchorPrefix);
  return (
    <section className="sa-section" id={`sec-${section.id}`}>
      <div className="sa-section-line" aria-hidden="true" />
      {toc.length >= 2 && <SectionToc items={toc} no={section.id} />}
      <header className="sa-sechead">
        <div className="ar-kicker sa-reveal">
          <span className="ar-kicker-no">{section.no}</span>
          <span>{chapterTitle}</span>
        </div>
        <h2 className="sa-sectitle sa-title-reveal">{section.title}</h2>
      </header>
      <div className="sa-body prose">
        <SectionFigure section={section} />
        {renderMarkdown(section.markdown, anchorPrefix)}
        <NextTeaser sectionId={section.id} />
      </div>
    </section>
  );
}

function OutroSection() {
  return (
    <>
      <SpreadPlate
        outro
        data={{
          id: "outro",
          title: PLAYBOOK_OUTRO.title,
          lede: PLAYBOOK_OUTRO.lede,
          kicker: "CLOSING",
          metaRight: "END · closing note",
        }}
      />
      <section className="sa-section sa-section--outro">
        <div className="sa-section-line" aria-hidden="true" />
        <header className="sa-sechead">
          <div className="ar-kicker sa-reveal">
            <span className="ar-kicker-no">99</span>
            <span>Closing</span>
          </div>
          <h2 className="sa-sectitle sa-title-reveal">{PLAYBOOK_OUTRO.title}</h2>
        </header>
        <div className="sa-body prose">
          {renderMarkdown(PLAYBOOK_OUTRO.markdown)}
          <NextTeaser sectionId="outro" />
        </div>
      </section>
    </>
  );
}

export function ScrollArticle() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(".sa-spread-line, .sa-section-line", { scaleX: 1 });
        gsap.set(".sa-spread-reveal", { opacity: 1, y: 0, filter: "blur(0px)" });
        return;
      }

      gsap.utils.toArray<HTMLElement>(".sa-chapter-spread").forEach((spread) => {
        const line = spread.querySelector(".sa-spread-line");
        const reveal = spread.querySelectorAll(".sa-spread-reveal");

        gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: spread,
            start: "top 72%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        tl.to(line, { scaleX: 1, duration: 0.82 })
          .fromTo(reveal, {
            opacity: 0,
            y: 28,
            filter: "blur(10px)",
          }, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.72,
            stagger: 0.08,
            immediateRender: false,
          }, "-=0.42");
      });

      gsap.utils.toArray<HTMLElement>(".sa-section").forEach((section) => {
        const line = section.querySelector(".sa-section-line");
        gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(line, {
          scaleX: 1,
          duration: 0.72,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });
      });
    });

    const t = window.setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <div className="sa">
      {PLAYBOOK_CHAPTERS.map((chapter) => (
        <div className="sa-chapter" key={chapter.id}>
          <ChapterSpread chapter={chapter} />
          {chapter.sections.map((section) => (
            <ArticleSection key={section.id} section={section} chapterTitle={chapter.title} />
          ))}
        </div>
      ))}
      <OutroSection />
    </div>
  );
}
