/**
 * <TopArt> —— 抽象几何顶图组件（引言卡片 / 章扉页顶部的线稿动画）。
 *
 *   <TopArt kind="orbit" />                 // 撑满容器（正方）
 *   <TopArt kind="figure8" size={280} />    // 固定尺寸
 *
 * 与 <Signature> 同引擎（kit 的 driveCanvas），只是母题换成透视椭圆族（orbits.ts）。
 * 一块 <canvas>，dt-rAF + IO 门控 + DPR + reduced-motion + 冻帧钩子全继承。
 */
import { useEffect, useRef } from "react";
import { driveCanvas } from "./kit";
import { TOP_ART, TOP_ART_META, type TopArtKind } from "./orbits";

export interface TopArtProps {
  kind: TopArtKind;
  size?: number;                 // 画框边长 px（正方，默认撑满容器）
  className?: string;
  ariaLabel?: string;
}

export function TopArt({ kind, size, className, ariaLabel }: TopArtProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return driveCanvas(canvas, TOP_ART[kind], false);
  }, [kind]);

  const style = size
    ? { width: size, height: size }
    : { width: "100%", aspectRatio: "1 / 1" as const };

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: "block", ...style }}
      role="img"
      aria-label={ariaLabel ?? TOP_ART_META[kind].label}
    />
  );
}
