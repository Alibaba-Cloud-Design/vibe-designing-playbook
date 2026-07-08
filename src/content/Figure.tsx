/**
 * <Figure> —— 全站统一的「描边图版」容器（需求6：所有架构图 / 示意图 / 插图套此框）。
 *
 * 一处定义、处处复用：发丝线细描边（--hairline，暖黑 12%）+ 直角 + 四角蓝图刻度 + 内 padding，
 * 精致收边。与 .prose 里的 pr-figure 同一视觉配方，但改用全局 token（不依赖 .prose 作用域），
 * 因此章扉页 / 引言区 / 正文外的任何位置都能直接套。
 *
 *   <Figure caption="Design I/O —— 设计能力从每道工序进入链路">
 *     <MyArchitectureSvg />
 *   </Figure>
 *
 * props：
 *   caption?  图注（含中文 → sans）；no? 图号（mono 靛蓝，如「图 1」）
 *   corners?  四角刻度，默认 true；false 则纯净发丝框
 *   bleed?    出血模式：去描边 / 去 padding，让整幅位图/满幅 SVG 自己贴边（如 design-io 架构图）
 */
import type { ReactNode } from "react";
import "./Figure.css";

export interface FigureProps {
  children: ReactNode;
  caption?: ReactNode;
  no?: ReactNode;
  corners?: boolean;
  bleed?: boolean;
  className?: string;
}

/* corners 默认关(2026-07 决议:全站图版不加四角刻度,只留发丝框) */
export function Figure({ children, caption, no, corners = false, bleed = false, className }: FigureProps) {
  return (
    <figure className={`fig${className ? " " + className : ""}`}>
      <div
        className={`fig-frame${corners && !bleed ? " fig-frame--ticks" : ""}${bleed ? " fig-frame--bleed" : ""}`}
      >
        <div className="fig-inner">{children}</div>
      </div>
      {caption && (
        <figcaption className="fig-cap">
          {no != null && <span className="fig-cap-no">{no}</span>}
          <span className="fig-cap-text">{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}
