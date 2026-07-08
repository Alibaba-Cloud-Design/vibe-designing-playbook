import { useEffect, useState } from "react";
import "./GridOverlay.css";

/**
 * GridOverlay —— 全局分割网格（对标 unmoth 的浅灰线网）。
 *
 * 一张贯穿阅读区的浅灰竖线框：
 *   · --site-edge     页面外框 / 侧栏左缘
 *   · --main-left     导航 / 主内容边界（强线）
 *   · --content-left  正文 8 栅格起点（弱线）
 *   · --content-right 正文右边界
 * 区块横线从 --main-left 起，文字从 --content-left 起，复用 X business 的导航缓冲比例。
 * fixed 常驻、封面后淡入、pointer-events:none。
 * 层级在深底点阵之上、内容之下（透过透明的阅读区显现）。
 */
export function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 与侧栏同步：幕完全拉开、阅读壳(.rs)落位到视口上部(≤12%)才淡入，不赶在转场中出现
    const onScroll = () => {
      const rs = document.querySelector(".rs");
      setVisible(
        rs
          ? rs.getBoundingClientRect().top <= window.innerHeight * 0.12
          : window.scrollY > window.innerHeight * 2
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={"grid-overlay" + (visible ? " is-visible" : "")} aria-hidden="true">
      <span className="gl-line" style={{ left: "var(--site-edge)" }} />
      <span className="gl-line gl-line-strong" style={{ left: "var(--main-left)" }} />
      <span className="gl-line" style={{ left: "var(--content-left)" }} />
      <span className="gl-line" style={{ right: "var(--content-right)" }} />
    </div>
  );
}
