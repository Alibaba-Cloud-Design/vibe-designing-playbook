import { useState, useRef, useEffect, useCallback } from "react";
import { onCoverEnter } from "@/introSignal";

/**
 * 文字乱码解码 —— 字符随机滚动后逐字定格成原文。
 * 改造自社区 text-scramble 组件，适配封面 mono 小字：
 *  - 不强加字号/颜色，完全继承父级（封面的 12px Chivo Mono / 发丝白）
 *  - 去掉原组件的橙色 primary 高亮、下划线、glow（与安静知识感调性不符）
 *  - 入场自动解码一次（enterDelay 错峰）；hover 再次触发
 *  - 单一 runRef 持有当前运行轮次：新一轮开始即作废旧轮，避免 StrictMode
 *    双挂载下两个 interval 互相覆盖 ref、旧 interval 清不掉而无限滚动
 *  - 尊重 prefers-reduced-motion：直接显示原文，不滚动
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface TextScrambleProps {
  text: string;
  /** 入场解码的起始延迟（ms），用于多条小字错峰入场 */
  enterDelay?: number;
  className?: string;
}

export function TextScramble({ text, enterDelay = 0, className = "" }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  // 解码开始前保持隐藏：入场信号后按 enterDelay 错峰启动,启动前若露出会看到静态原文闪一下
  //（reduced-motion 例外——直接显形）。解码一开始即显形,让文字「解码浮现」而非「先静后跳」。
  const [revealed, setRevealed] = useState(prefersReducedMotion);
  // 当前运行轮次的 id。每次 scramble 自增并捕获，旧轮发现 id 变了就自杀
  const runRef = useRef(0);

  const scramble = useCallback(() => {
    setRevealed(true); // 解码启动即显形
    if (prefersReducedMotion()) {
      setDisplayText(text);
      return;
    }
    const myRun = ++runRef.current; // 作废一切之前的轮次
    let frame = 0;
    const duration = Math.max(text.length * 2, 14);

    const id = setInterval(() => {
      // 已被新一轮（或 unmount）取代 → 立即停止，不再写状态
      if (myRun !== runRef.current) {
        clearInterval(id);
        return;
      }
      frame++;
      const revealed = Math.floor((frame / duration) * text.length);
      setDisplayText(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealed) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      if (frame >= duration) {
        clearInterval(id);
        setDisplayText(text); // 强制定格成原文
      }
    }, 30);
  }, [text]);

  // 入场：原本 mount 即解码，会在 IntroOverlay 幕下提前跑完、揭出静止封面。
  // 改为等封面入场信号（IntroOverlay 在 reveal+260ms 派发），再按 enterDelay 错峰解码
  // （enterDelay 现相对信号时刻）。信号已发时 onCoverEnter 立即回调。
  // cleanup 自增 runRef → 让正在跑的 interval 下一帧自杀（解决 StrictMode 双挂载）
  useEffect(() => {
    let t: number | undefined;
    const off = onCoverEnter(() => {
      t = window.setTimeout(scramble, enterDelay);
    });
    return () => {
      off();
      if (t) clearTimeout(t);
      runRef.current++; // 作废当前轮次，使 interval 自停
    };
  }, [scramble, enterDelay]);

  return (
    <span
      className={className}
      onMouseEnter={scramble}
      style={{ cursor: "default", visibility: revealed ? "visible" : "hidden" }}
    >
      {displayText}
    </span>
  );
}
