import type { ReactNode } from "react";
import "./prose-tokens.css";
import "./Prose.css";

/**
 * prose 组件库 · v2-dark —— 软深色「技术文档」富文本骨架。
 * 对标 unmoth / x.com/advertising / polar.sh:发丝线主分隔、亮度分层、靛蓝唯一强调、
 * mono 承载编号 / 标签 / 图注、蓝图图版。规格见 REDESIGN-走查计划 §1 / §2 / §2.7。
 * 用法:内容包一层 <Prose>,里面用 <P>/<H2>/<Ul>/<Table>/<Code>/<Quote>/<Figure> 等。
 * .pr-* 类同时供 ScrollArticle(真实手稿)复用。
 */

/* ---------- 容器:提供 token 作用域 + 阅读栏宽 ---------- */
export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`prose ${className}`}>{children}</div>;
}

/* ---------- 段落 ---------- */
export function P({ children }: { children: ReactNode }) {
  return <p className="pr-p">{children}</p>;
}

/* ---------- inline code(深色芯片:抬升底 + 发丝边 + mono) ---------- */
export function Code({ children }: { children: ReactNode }) {
  return <code className="pr-inline-code">{children}</code>;
}

/* ---------- 双色词强调(§2#3:句中次要词压灰) ---------- */
export function Dim({ children }: { children: ReactNode }) {
  return <span className="pr-dim">{children}</span>;
}

/* ---------- 标题阶梯 H1/H2/H3(sans 声部,靠字号 / 字重分层) ---------- */
export function H1({ children, id }: { children: ReactNode; id?: string }) {
  return <h1 id={id} className="pr-h1">{children}</h1>;
}
export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return <h2 id={id} className="pr-h2">{children}</h2>;
}
export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return <h3 id={id} className="pr-h3">{children}</h3>;
}

/* ---------- 同尺寸双色区块头(§2#2:两行同字号,亮行=标签 / 灰行=真标题) ---------- */
export function DualHead({ label, title, kicker }: { label: ReactNode; title: ReactNode; kicker?: ReactNode }) {
  return (
    <div className="pr-dualhead">
      {kicker && <span className="pr-dualhead-kicker">{kicker}</span>}
      <span className="pr-dualhead-a">{label}</span>
      <span className="pr-dualhead-b">{title}</span>
    </div>
  );
}

/* ---------- 编号分节头(§2#1:发丝线 + 左 mono 标签 + 右 mono 编号) ---------- */
export function SectionRule({ label, no }: { label: ReactNode; no?: ReactNode }) {
  return (
    <div className="pr-rule">
      <span className="pr-rule-label">{label}</span>
      {no != null && <span className="pr-rule-no">{no}</span>}
    </div>
  );
}

/* ---------- 无序列表(靛蓝方块 bullet) ---------- */
export function Ul({ children }: { children: ReactNode }) {
  return <ul className="pr-ul">{children}</ul>;
}
export function Li({ children }: { children: ReactNode }) {
  return <li className="pr-li">{children}</li>;
}

/* ---------- mono 编号列表(零填充 mono 序号 in 靛蓝,CSS counter) ---------- */
export function Ol({ children }: { children: ReactNode }) {
  return <ol className="pr-ol">{children}</ol>;
}
export function OLi({ children }: { children: ReactNode }) {
  return <li className="pr-ol-li">{children}</li>;
}

/* ---------- 发丝线表(表头 2px 白线 + 行 1px 发丝线,深底,全左) ---------- */
export function Table({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="pr-table-wrap">
      <table className="pr-table">
        <thead><tr>{head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 代码块(深色抬升底 + 发丝边 + 靛蓝左脊) ---------- */
export function CodeBlock({ children }: { children: ReactNode }) {
  return <pre className="pr-code"><code>{children}</code></pre>;
}

/* ---------- 引用 / 旁注(2px 发丝线左脊 + 缩进,压灰) ---------- */
export function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="pr-quote">{children}</blockquote>;
}

/* ---------- 蓝图图版(发丝框 + 四角刻度 + mono 蓝图图注;可显式给图号) ----------
 * caption 只给字符串 → 前置靛蓝引导刻度(与文章 renderBlock 一致);
 * 另给 no(如「图 1」)→ 结构化蓝图图号 + 说明。 */
export function Figure({ children, caption, no }: { children: ReactNode; caption?: ReactNode; no?: ReactNode }) {
  return (
    <figure className="pr-figure">
      <div className="pr-figure-frame">
        <div className="pr-figure-inner">{children}</div>
      </div>
      {caption && (
        <figcaption className="pr-figcap">
          {no != null && <span className="pr-figcap-no">{no}</span>}
          <span className="pr-figcap-text">{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}

/* ---------- label→value 规格行(§2#4:mono 标签 → 值 + 发丝线,账本式) ---------- */
export function SpecList({ specs }: { specs: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <ul className="pr-specs">
      {specs.map((s, i) => (
        <li className="pr-spec" key={i}>
          <div className="pr-spec-label">{s.label}</div>
          <div className="pr-spec-value">{s.value}</div>
        </li>
      ))}
    </ul>
  );
}
