import { useEffect, useRef } from "react";
import "./EvolveSphere.css";

/**
 * 自我进化动画 —— 线框球「环一圈圈生长扩散」。
 *
 * 对标参考逐帧分析得出的真实机制(非旋转):环从一个种子点逐个长出、向外
 * 扩张累加,像年轮一层层叠上去 / 水波一圈圈荡开,长满成球后重置、再生长。
 * 隐喻贴「自我进化」:能力一轮轮迭代、向外生长,飞轮越转越大。
 *
 * 实现:N 个圆环 div,每个是球面上绕「种子极」的等极角小圆(半径=R·sinθ,
 * 深度=R·cosθ)。一个生长头 head 的极角随时间 0→π 扫过(带缓动:种子处慢、
 * 满球处停留 = 实测节奏),N 个环是它后面等距的拖尾,于是呈现「逐圈生长」。
 * 7.67s 一轮(实测周期)。尊重 reduced-motion。
 */

const R = 116;           // 球半径(px,适配格子)
const N = 16;            // 环数(越多越像满球)
const DUR = 7.67;        // 周期(秒,实测)
// 环间极角间距 = π/N:让 N 个环恰好均匀铺满极角 [0,π]。
// 于是头每推进一个 SPACING,环阵列整体平移一格、画面与上一刻完全一致 → 首尾无缝循环。
const SPACING = Math.PI / N;

export function EvolveSphere() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // 预创建 N 个环
    const rings: HTMLDivElement[] = [];
    for (let i = 0; i < N; i++) {
      const el = document.createElement("div");
      el.className = "evs-ring";
      // 末环(最新长出的一圈)= 靛蓝点睛,呼应 taste 收敛
      if (i === 0) el.classList.add("evs-ring--accent");
      stage.appendChild(el);
      rings.push(el);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 极角在 [0,π] 上「环绕」:每个环沿极角做传送带式循环——
    // 领先的环从远极(π)消失的同时,有环从种子极(0)冒出,首尾自然衔接、无跳变。
    function render(headPolar: number) {
      for (let i = 0; i < N; i++) {
        const el = rings[i];
        // wrap 到 [0,π):领先环退场即从 0 重新进场 → 整圈循环连续
        let polar = (headPolar - i * SPACING) % Math.PI;
        if (polar < 0) polar += Math.PI;
        const rr = Math.sin(polar) * R; // 圈半径
        const z = Math.cos(polar) * R; // 沿极轴(深度)位置
        const d = rr * 2;
        el.style.width = d + "px";
        el.style.height = d + "px";
        el.style.marginLeft = -d / 2 + "px";
        el.style.marginTop = -d / 2 + "px";
        el.style.transform = `translateZ(${z}px)`;
        // 两极附近(刚生/将灭)淡入淡出,让环绕衔接处看不出接缝
        let op = 1;
        if (polar < 0.34) op = polar / 0.34;
        else if (polar > Math.PI - 0.34) op = (Math.PI - polar) / 0.34;
        el.style.opacity = Math.max(0, Math.min(1, op)).toFixed(2);
      }
    }

    if (reduce) {
      // 降级:静态展示长到满球的一刻
      render(Math.PI * 0.96);
      return () => {
        rings.forEach((r) => r.remove());
      };
    }

    // 头匀速推进:配合环绕 wrap,首尾完全周期、无缝衔接。
    // 一轮 = 头走过一个完整的 SPACING 间隔(即下一个环接替当前位置),
    // 这样画面在一轮前后逐像素一致,真正首尾循环。
    let start: number | null = null;
    let raf = 0;
    function frame(ts: number) {
      if (start === null) start = ts;
      const t = ((ts - start) / 1000) % DUR; // 0..DUR
      // 头在一轮内推进一个 SPACING,使环阵列整体平移一格 → 周期画面
      render((t / DUR) * SPACING);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      rings.forEach((r) => r.remove());
    };
  }, []);

  return (
    <div className="evs" role="img" aria-label="自我进化:线框球的环一圈圈向外生长扩散,循环往复">
      <div className="evs-scene">
        <div className="evs-stage" ref={stageRef} />
      </div>
    </div>
  );
}
