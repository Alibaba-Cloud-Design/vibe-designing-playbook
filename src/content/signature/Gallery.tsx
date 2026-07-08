/**
 * 章节签名插画系统 —— 自检画廊（#signatures 路由）。
 * 上：章扉页大图 proof（大尺寸 + mono 编号 + 思源宋章名，验证 §2.5 章扉页用）。
 * 下：三屏目录卡（§2.7 卡规格：直角 / #101011 / 32 内距 / 标题→分隔条→描述→底部方图），
 *     同时是 §0.5-3 三屏目录的卡片预览。
 * 用于「截图核对每张图的构成 / 线宽 / 明暗二层 + draw-on 节奏对 polar」。
 */
import { Signature } from "./Signature";
import { SIGNATURES, VARIANT_ORDER } from "./variants";
import "./Gallery.css";

const no2 = (i: number) => String(i + 1).padStart(2, "0");

export function SignatureGallery() {
  return (
    <div className="siggal">
      <header className="siggal-top">
        <div className="siggal-kicker mono">ILLUSTRATION SYSTEM / §2.7</div>
        <h1 className="siggal-h1">章节签名插画系统</h1>
        <p className="siggal-lead">
          学 polar.sh 抽象几何线稿的视觉语言，做我方原创章节签名。
          全书六张同出一套：白细线 1.75px · 幽灵轨道 #3c3c3c + 亮白高亮二层 ·
          中心构图 · 触达半径 0.32 · canvas dt-rAF + 视口门控 · 无 glow。
        </p>
      </header>

      {/* 章扉页大图 proof */}
      <section className="siggal-openers">
        <div className="siggal-sec-label mono">章扉页大图 · CHAPTER OPENER</div>
        <div className="siggal-opener-row">
          {VARIANT_ORDER.map((v, i) => (
            <figure key={v} className="opener">
              <div className="opener-art">
                <Signature variant={v} />
              </div>
              <figcaption className="opener-cap">
                <span className="opener-no mono">{no2(i)}</span>
                <span className="opener-name">{SIGNATURES[v].label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 三屏目录卡 */}
      <section className="siggal-cards-sec">
        <div className="siggal-sec-label mono">三屏目录卡 · DIRECTORY GRID</div>
        <div className="siggal-cards">
          {VARIANT_ORDER.map((v, i) => {
            const meta = SIGNATURES[v];
            return (
              <article key={v} className="sigcard" tabIndex={0}>
                <div className="sigcard-head">
                  <span className="sigcard-no mono">{no2(i)} / {meta.en}</span>
                  <h3 className="sigcard-title">{meta.label}</h3>
                  <span className="sigcard-divider" />
                  <p className="sigcard-desc">{meta.desc}</p>
                </div>
                <div className="sigcard-art">
                  <Signature variant={v} />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
