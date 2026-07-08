/**
 * Intro ↔ 封面 入场协调信号。
 *
 * 封面的 BlurReveal / TextScramble 原本 mount 即播，会在 IntroOverlay 底下提前播完，
 * 拉幕揭开时露出的是静止封面。改法：它们不再自播，改为等这个信号。
 * IntroOverlay 在拉幕相位 reveal+260ms（≈1760ms）调用 fireCoverEnter()，
 * 封面元素收到后才启动各自入场（并保留原有错峰 delay）。
 *
 * 用模块级单例（而非 window 事件）：既能通知已订阅者，也能让「信号已发」之后
 * 才挂载的组件（后续滚动出现的板块）立即启动，不必错过一次性事件。
 */
let entered = false;
const listeners = new Set<() => void>();

/** 拉幕相位触发：通知所有封面元素开始入场（幂等，只生效一次）。 */
export function fireCoverEnter(): void {
  if (entered) return;
  entered = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

/**
 * 订阅入场信号。若信号已发（如后续板块滚动时才挂载），立即回调。
 * 返回退订函数。
 */
export function onCoverEnter(cb: () => void): () => void {
  if (entered) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
