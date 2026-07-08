/**
 * <Signature> —— 章节签名插画组件（一图两用：小尺寸目录卡 / 大尺寸章扉页）。
 *
 *   <Signature variant="engineering" size={220} />      // 目录卡小图
 *   <Signature variant="interaction" size={520} />      // 章扉页大图（自动跟随光标）
 *
 * 内部一块 <canvas>，由 kit 的 driveCanvas 驱动（dt-rAF + IO 门控 + DPR + reduced-motion）。
 * 全书六张同出一套语言，供封面 / 三屏目录 / 章扉页复用。
 */
import { useEffect, useRef } from "react";
import { driveCanvas } from "./kit";
import { DRAW, INTERACTIVE, SIGNATURES, type Variant } from "./variants";

export interface SignatureProps {
  variant: Variant;
  size?: number;                 // 画框边长 px（正方，默认撑满容器）
  className?: string;
  ariaLabel?: string;
}

export function Signature({ variant, size, className, ariaLabel }: SignatureProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return driveCanvas(canvas, DRAW[variant], INTERACTIVE[variant]);
  }, [variant]);

  const style = size
    ? { width: size, height: size }
    : { width: "100%", aspectRatio: "1 / 1" as const };

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: "block", ...style }}
      role="img"
      aria-label={ariaLabel ?? SIGNATURES[variant].label}
    />
  );
}
