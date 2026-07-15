import { useState, useMemo } from "react";
import { LEXICON } from "./content/lexicon-data";
import { ArtLexicon } from "./content/signature/LinearArt";
import "./content/Article.css";
import "./content/Lexicon.css";
import "./ScrollLexicon.css";

/**
 * 设计提示词词典 —— 折进连续滚动的最后一屏(不再是独立页)。
 * 去掉独立页的左侧栏 + 返回按钮,保留版头 + 搜索 + 按分类分组的词条网格。
 * 整块挂 id="sec-appendix" 供导航滚动定位 + scroll-spy 高亮。
 */
export function ScrollLexicon() {
  const [q, setQ] = useState("");

  const cats = useMemo(() => {
    const seen: string[] = [];
    LEXICON.forEach((e) => { if (!seen.includes(e.cat)) seen.push(e.cat); });
    return seen;
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return LEXICON;
    return LEXICON.filter(
      (e) =>
        e.en.toLowerCase().includes(k) ||
        e.cn.includes(q.trim()) ||
        e.def.includes(q.trim())
    );
  }, [q]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof LEXICON> = {};
    filtered.forEach((e) => { (map[e.cat] ||= []).push(e); });
    return map;
  }, [filtered]);

  return (
    <section className="slx" id="sec-appendix">
      {/* 版头:标题 + 说明 + 搜索 + 同族插画面板(2026-07 决议:撤 CubeChain 统一家族语言) */}
      <header className="slx-hero">
        <div className="slx-hero-inner">
          <div className="ar-kicker sa-reveal">附录 · Lexicon</div>
          <h2 className="slx-hero-title sa-reveal">
            设计提示词词典，<br />188 词。
          </h2>
          <p className="slx-hero-lede sa-reveal">
            把抽象的审美语汇，翻译成 Agent 能执行的表达规则。
            一个词条 = 一个审美词 + 它对应的可执行约束。12 类，共 188 词，中英对照。
          </p>
          <input
            className="lex-search slx-search"
            type="search"
            name="lexicon-search"
            aria-label="搜索设计术语"
            autoComplete="off"
            placeholder="搜索术语 / Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {/* 章 hero 插画(与目录卡/章扉页同族) —— Linear 文章页式标题下面板 */}
          <div className="sa-spread-art slx-hero-art" aria-hidden="true">
            <ArtLexicon />
          </div>
        </div>
      </header>

      <div className="slx-body">
        {cats.map((c) => {
          const items = grouped[c];
          if (!items || !items.length) return null;
          return (
            <section key={c} className="lex-section sa-reveal">
              <h3 className="ar-h2 lex-cat">{c} <span className="lex-cat-n">{items.length}</span></h3>
              <div className="lex-grid">
                {items.map((e, i) => (
                  <div className="lex-entry" key={e.en + i}>
                    <div className="lex-term">
                      <span className="lex-en">{e.en}</span>
                      <span className="lex-cn">{e.cn}</span>
                    </div>
                    {e.def && <p className="lex-def">{e.def}</p>}
                    {e.rule && <p className="lex-rule">{e.rule}</p>}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {filtered.length === 0 && <p className="lex-empty" role="status">没有匹配「{q}」的术语。</p>}
      </div>
    </section>
  );
}
