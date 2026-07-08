/**
 * 抽象几何顶图族 —— 自检画廊（#topart 路由，不干扰主站单页滚动）。
 * 复刻 behance「Second Kind」深卡形制：顶部几何线稿动画 + 思源宋标题 + 灰 sans 描述，
 * 供「截图冻帧核对每种母题的构成 / 线宽 / 明暗二层 + morph 节奏对 behance 参考」。
 * 大图 proof 一排（章扉页用尺寸）+ 深卡网格（引言卡片用形制）。
 */
import { TopArt } from "./TopArt";
import { TOP_ART_META, TOP_ART_ORDER } from "./orbits";
import { Figure } from "../Figure";
import "./TopArtGallery.css";

/** 示意架构图（节点 + 点线连接 + 靛蓝强调），仅用于核对 <Figure> 描边框套图效果。 */
function SampleFlow() {
  const INK = "var(--ink)", DIM = "var(--ink-50)", ACC = "var(--accent-bright)";
  const cards: Array<[number, string]> = [[40, "输入"], [300, "调度"], [560, "产物"]];
  return (
    <svg viewBox="0 0 720 200" width="100%" role="img" aria-label="示意架构图">
      {cards.map(([x], i) =>
        i < 2 ? (
          <line key={`l${i}`} x1={x + 120} y1={100} x2={cards[i + 1][0]} y2={100}
            stroke={DIM} strokeWidth="1.5" strokeDasharray="1.5 7" strokeLinecap="round" />
        ) : null
      )}
      {cards.map(([x, label], i) => (
        <g key={i}>
          <rect x={x} y={56} width={120} height={88} rx="10"
            fill="var(--surface-1)" stroke="var(--hairline)" strokeWidth="1" />
          <circle cx={x + 60} cy={100} r="16" fill="none" stroke={i === 2 ? ACC : INK} strokeWidth="1.5" />
          <circle cx={x + 60} cy={100} r="5" fill={i === 2 ? ACC : "transparent"} stroke={INK} strokeWidth="1.5" />
          <text x={x + 60} y={172} fontSize="13" fill={DIM} textAnchor="middle"
            fontFamily="var(--font-sans)">{label}</text>
        </g>
      ))}
    </svg>
  );
}

const no2 = (i: number) => String(i + 1).padStart(2, "0");

/** 卡片示例文案（占位，仅为核对形制；真实内容由后续阶段填） */
const SAMPLE: Record<string, { title: string; body: string }> = {
  orbit: { title: "引言", body: "AI 不是替换设计师，而是把设计变成一件可被工程化调度的事。" },
  figure8: { title: "动态交互", body: "界面随意图而生，运行时把数据、规则与组件即时装配成体验。" },
  radial: { title: "自我进化", body: "散开、评判、收敛——飞轮每转一圈，能力就向内沉淀一层。" },
};

export function TopArtGallery() {
  return (
    <div className="tagal">
      <header className="tagal-top">
        <div className="tagal-kicker mono">TOP ILLUSTRATION FAMILY / behance ref</div>
        <h1 className="tagal-h1">抽象几何顶图族</h1>
        <p className="tagal-lead">
          引言卡片 / 章扉页顶部的抽象线稿动画。与章节签名同引擎，母题换成透视椭圆：
          轨道椭圆 · 无限环 · 放射节点。白细线 1.75px · 幽灵点线全貌 + 亮白高亮二层 ·
          3D 呼吸开合 + 慢速旋转 morph · 无 glow。
        </p>
      </header>

      {/* 大图 proof（章扉页用尺寸，深底） */}
      <section className="tagal-openers">
        <div className="tagal-sec-label mono">章扉页大图 · CHAPTER OPENER</div>
        <div className="tagal-opener-row">
          {TOP_ART_ORDER.map((k, i) => (
            <figure key={k} className="taopener">
              <div className="taopener-art">
                <TopArt kind={k} />
              </div>
              <figcaption className="taopener-cap">
                <span className="taopener-no mono">{no2(i)}</span>
                <span className="taopener-name">{TOP_ART_META[k].label}</span>
                <span className="taopener-en mono">{TOP_ART_META[k].en}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 深卡（引言卡片用形制，对照 behance） */}
      <section className="tagal-cards-sec">
        <div className="tagal-sec-label mono">引言卡片形制 · behance CARD</div>
        <div className="tagal-cards">
          {TOP_ART_ORDER.map((k) => {
            const s = SAMPLE[k];
            return (
              <article key={k} className="tacard">
                <div className="tacard-art">
                  <TopArt kind={k} />
                </div>
                <div className="tacard-body">
                  <h3 className="tacard-title">{s.title}</h3>
                  <p className="tacard-desc">{s.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 统一描边图版 <Figure>（需求6）—— 核对发丝框 + 四角刻度 + 图注 */}
      <section className="tagal-figs-sec">
        <div className="tagal-sec-label mono">统一描边图版 · &lt;Figure&gt;</div>
        <div className="tagal-figs">
          <Figure no="图 1" caption="默认：发丝线细描边 + 四角蓝图刻度 + 内 padding，精致收边。">
            <SampleFlow />
          </Figure>
          <Figure caption="出血模式（bleed）：满幅图自己贴边，去框去 padding。" bleed>
            <SampleFlow />
          </Figure>
        </div>
      </section>
    </div>
  );
}
