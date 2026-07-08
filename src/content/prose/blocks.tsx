/**
 * 正文富块（需求4 · 板块设计）—— 把手稿里以约定 emoji 起头的 blockquote / 特殊标题，
 * 从「原始占位」升级成有设计的板块。全部走全站 token（--ink / --accent / --hairline …），
 * 深浅主题自适应。由 ScrollArticle.renderMarkdown 的 router 调用。
 *
 *   第X步:…            → <StepLabel>     靛蓝块 + 近黑块拼接的步骤名（poolside 章节感）
 *   🧩 调用能力 / 📄 阶段产出 → <AttachmentGroup> 可点下载的附件卡（hover 描边亮 / 图标位移 / 下载态）
 *   📇 术语｜Term        → <GlossaryCard>  设计词条定义卡
 *   🃏 对照卡 + 表        → <CompareCard>   双栏并置对照卡
 *   🖼️ 架构图 / 配图 / GIF → 见 diagrams.tsx 的 DiagramFigure（在 <Figure> 描边框内）
 */
import type { ReactNode } from "react";
import { asset } from "../../asset";
import "./blocks.css";

/* ---------- 步骤名（靛蓝块 + 近黑块）---------- */
const CN_NUM: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

/** 从「第一步:理解/规划」拆出序号 + 中文步签 + 步骤名。识别不到返回 null。 */
export function parseStep(text: string): { no: string; cn: string; title: string } | null {
  const m = /^第([一二三四五六七八九十]+)步\s*[:：]\s*(.+)$/.exec(text.trim());
  if (!m) return null;
  const n = CN_NUM[m[1]] ?? 0;
  return { no: String(n).padStart(2, "0"), cn: `第${m[1]}步`, title: m[2].trim() };
}

export function StepLabel({ no, cn, title, id }: { no: string; cn: string; title: string; id?: string }) {
  return (
    <div className="pr-step sa-reveal" id={id}>
      <span className="pr-step-tag" aria-hidden="true">
        <span className="pr-step-no">{no}</span>
        <span className="pr-step-cn">{cn}</span>
      </span>
      <h2 className="pr-step-title">{title}</h2>
    </div>
  );
}

/* ---------- 附件卡（可下载 + hover 特殊态）---------- */
type Att = { name: string; href: string; file: string };
type AttRow = { kind: "call" | "output"; label: string; atts: Att[]; plain?: string };

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** 把附件 blockquote 的原始文本解析成若干行（🧩 调用能力 / 📄 阶段产出）。 */
export function parseAttachments(raw: string): AttRow[] {
  const rows: AttRow[] = [];
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const kind = t.startsWith("🧩") ? "call" : t.startsWith("📄") ? "output" : null;
    if (!kind) continue;
    const body = t.replace(/^🧩|^📄/u, "").trim();
    const [labelRaw, ...restParts] = body.split(/[:：]/);
    const rest = restParts.join(":");
    const label = labelRaw.replace(/[（(]占位样式[)）]/g, "").trim();
    const atts: Att[] = [];
    let mm: RegExpExecArray | null;
    LINK_RE.lastIndex = 0;
    while ((mm = LINK_RE.exec(rest))) {
      const href = asset(mm[2].replace(/^.*attachments\//, "/attachments/"));
      atts.push({ name: mm[1].trim(), href, file: href.split("/").pop() || mm[1] });
    }
    const plain = atts.length ? undefined : rest.replace(/[（(]占位样式[)）]/g, "").trim();
    rows.push({ kind, label, atts, plain });
  }
  return rows;
}

function SkillGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8z" />
    </svg>
  );
}
function DocGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h8l4 4v14a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3z" />
      <path d="M14 3v4h4M8.5 12h7M8.5 15.5h7M8.5 8.5h3" />
    </svg>
  );
}
function DownGlyph() {
  return (
    <svg className="pr-att-dl" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function AttachmentGroup({ rows }: { rows: AttRow[] }) {
  return (
    <div className="pr-att sa-reveal">
      {rows.map((row, i) => (
        <div className={`pr-att-row pr-att-row--${row.kind}`} key={i}>
          <span className="pr-att-role">
            <i className="pr-att-role-mk" aria-hidden="true" />
            {row.label}
          </span>
          <div className="pr-att-cards">
            {row.atts.map((a, j) => (
              <a className="pr-att-card" key={j} href={a.href} download={a.file} data-kind={row.kind}>
                <span className="pr-att-ico">{row.kind === "call" ? <SkillGlyph /> : <DocGlyph />}</span>
                <span className="pr-att-meta">
                  <span className="pr-att-name">{a.name}</span>
                  <span className="pr-att-file">{a.file}</span>
                </span>
                <span className="pr-att-act">
                  <span className="pr-att-hint">下载</span>
                  <DownGlyph />
                </span>
              </a>
            ))}
            {row.plain && <span className="pr-att-plain">{row.plain}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 设计词条卡（📇 Term｜释义）---------- */
export function GlossaryCard({ term, en, body }: { term: string; en?: string; body: ReactNode }) {
  return (
    <aside className="pr-gloss sa-reveal">
      <div className="pr-gloss-head">
        <span className="pr-gloss-mk" aria-hidden="true">◆</span>
        <span className="pr-gloss-term">{term}</span>
        {en && <span className="pr-gloss-en">{en}</span>}
      </div>
      <div className="pr-gloss-body">{body}</div>
    </aside>
  );
}

/* ---------- 对照卡（🃏 双栏并置）容器；内部表格沿用 pr-table ---------- */
export function CompareCard({ caption, children }: { caption: string; children: ReactNode }) {
  /* 注记行已撤(2026-07 决议:表格自足);caption 降级为无障碍标签 */
  return (
    <aside className="pr-compare sa-reveal" aria-label={caption}>
      <div className="pr-compare-body">{children}</div>
    </aside>
  );
}
