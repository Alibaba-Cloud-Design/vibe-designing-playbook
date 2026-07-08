import { useEffect, useRef } from "react";

/**
 * 书封正面 —— 1:1 还原 Figma node 3:273（画布 2100×3046）
 * 内部全用绝对 px（照搬 Figma 坐标），外层 JS 按书面实宽/2100 等比 scale。
 * 用 absolute inset 撑破 PerspectiveBook 的 p-[12%] 留白，让黑底出血铺满整个书面。
 */
export function BookCover() {
  const fitRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = fitRef.current;
    const stage = stageRef.current;
    if (!fit || !stage) return;
    const apply = () => {
      // 3-273 比例 2100:3046(0.69) 与 PerspectiveBook 书面(0.817) 不一致。
      // 用 cover 策略：scale = max(宽比, 高比)，让 3-273 铺满书面（宽对齐，
      // 上下略溢出被裁——3-273 上下边是黑底+留白，裁掉无碍），并水平居中。
      const r = fit.getBoundingClientRect();
      const s = Math.min(r.width / 2100, r.height / 3046);
      stage.style.transform = `translate(-50%,-50%) scale(${s})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(fit);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="book-cover-fit" ref={fitRef}>
      <div className="book-cover-stage" ref={stageRef}>
        {/* 黑底 */}
        <div className="bc-bg" />

        {/* 涡旋图形 Group121 */}
        <img className="bc-swirl" src="/cover/swirl-3273.svg" alt="" aria-hidden />

        {/* 巨型标题 416px，两行 */}
        <h1 className="bc-title">
          Vibe Designing<br />Playbook
        </h1>

        {/* 副标题（右对齐）：第一行 Vibe Designing；第二行 = 渐变条 + 设计指南 */}
        <div className="bc-sub">
          <div className="bc-sub-en">Vibe Designing</div>
          <div className="bc-sub-cn">
            <span className="bc-sub-bar" />
            <span>设计指南</span>
          </div>
        </div>

        {/* 底部：ACD 标 + 出品 */}
        <img className="bc-acd" src="/cover/acd-logo.png" alt="ACD" />
        <div className="bc-imprint">阿里云设计中心出品</div>
      </div>
    </div>
  );
}
