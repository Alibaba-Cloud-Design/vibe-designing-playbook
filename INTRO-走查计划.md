# 入场动画走查计划 — 复刻 poetic.com（毫秒/像素级）

> 参考：https://poetic.com/ 页面入场动画。真值来自 2 个 agent 源码级逆向（读了 poetic 的 CSS `@keyframes` + JS bundle，互相印证）。
> 目标：机制、时序、缓动 1:1 复刻 poetic；**文字换「vibe designing playbook」**、**蓝色换我们品牌 #4337FF 衍生三档**、**拉幕揭示我们现有的深色封面**。

---

## 一、技术真值（poetic 权威规格，源码验证）

纯 CSS `@keyframes` 驱动，React 只做状态编排（4 状态机 + setTimeout + class 切换）。总时长 **≈ 2460ms**。SSR 进初始 HTML，`t=0` = 首次绘制（不是 hydration）。

### poetic 原始 keyframes（照抄机制，颜色/文字换成我们的）
```css
@keyframes intro-logo { 0%{opacity:0} 70%{opacity:1} 100%{opacity:1} }
@keyframes intro-bar {
  0%{opacity:0; transform:translateX(-56px)}
  12%{opacity:1}
  50%{opacity:1; transform:translateX(256px)}   /* 256 = 我们要改成「wordmark 渲染宽度」 */
  78%{opacity:1; transform:translateX(256px)}
  80%{opacity:0} 83%{opacity:0} 85%{opacity:1} 88%{opacity:1}
  90%{opacity:0} 93%{opacity:0} 95%{opacity:1} 98%{opacity:1}
  100%{opacity:0; transform:translateX(256px)}
}
@keyframes intro-cover-wipe { 0%{transform:translateX(0)} 100%{transform:translateX(100%)} }

.animate-intro-logo       { animation: 1s   linear                    0.5s 1 normal both intro-logo; }
.animate-intro-bar        { animation: 1s   cubic-bezier(0.4,0,0.2,1) 0.5s 1 normal both intro-bar; }
.animate-intro-cover-wipe { animation: 0.72s cubic-bezier(0.7,0,0.3,1) 0s  1 normal both intro-cover-wipe; will-change:transform; }
```

### 主时间线
```
0 ───── 500 ──────────────── 1500 ──────────────── 2460ms
│ 黑屏hold │  组装(logo+方块并发) │   四层拉幕 reveal    │
```

---

## 二、我们的适配决策（已定）

| 项 | poetic | 我们 |
|---|---|---|
| 入场文字 | POETIC（Suisse Intl 粗体，256×56，白） | **vibe designing playbook**（单行居中，白，粗 ~600-700，紧字距 ~-0.02em；用 Hanken Grotesk） |
| 方块色 | #221fc3 | **#4337FF**（品牌主色） |
| 拉幕三档 | #221fc3 / #4744e6 / #6c69ff | **#4337FF / #685CFF / #8D81FF**（深→浅） |
| 揭示目标 | 白底主页 #fdfdfc | **现有深色封面**（`.frame` 黑渐变 + 3D 书本，BlurReveal 幕下接手） |
| 黑屏底 | #000000 | #000000（不变） |

方块尺寸 = wordmark 的 cap-height（正方形）；`intro-bar` 里的 `256px` 位移量改成 **wordmark 实际渲染宽度**（方块从文字左侧扫到词尾右侧停靠）。

---

## 三、逐相位走查表（子 agent 按此自检）

**容差**：时间 ±16ms（1 帧@60fps）· 位置 ±2px · 颜色精确 hex · 缓动精确 cubic-bezier。

### P0 黑屏 hold · 0–500ms
- **参考真值**：纯黑 #000000 满屏，logo+方块 opacity 0（各 delay 0.5s）。
- **验收**：0–500ms 截图纯黑无内容。
- **走查**：冻帧 t=250ms 截图 → 应纯黑。

### P1 组装 · 500–1500ms（logo 淡入 + 方块横扫 + 闪烁，同一窗口并发）
- **logo**：`1s linear delay 0.5s`，opacity 0→1（keyframe 0%→70%→100%）。白色「vibe designing playbook」居中。
- **方块**：`1s cubic-bezier(0.4,0,0.2,1) delay 0.5s`，#4337FF：
  - 500–560ms 淡入（op 0→1）
  - 500–1000ms `translateX -[cap] → [wordmark宽]`：从文字左掠过字母 → 停靠词尾右（poetic 插值锚点：tx≈10px@560ms, 217px@800ms, 256px@1000ms 的等比缩放）
  - 1000–1280ms 停靠不动
  - 1280–1500ms **原地闪烁 3 次**（op 关/开：1300/1400/1500 关，1350/1450 开），结束关闭
- **验收**：① t=800ms 方块压在文字中段（读作 vibe designin▉…）② t=1200ms 方块停词尾右、文字全显 ③ t=1280–1500 方块闪 3 下收尾关闭。
- **走查**：冻帧 t=560/800/1000/1200/1350/1500ms 六帧，逐帧对照 poetic `p12-*` 参考帧的**位置比例 + opacity 节奏**。

### P2 拉幕 reveal · 1500–2460ms（4 层错峰滑走）
- 4 个全屏层 `translateX 0→100%`（向右滑出），`0.72s cubic-bezier(0.7,0,0.3,1)`，**错峰 80ms**。
- **z 序倒挂 + delay 递增**（顶层先走，逐层揭下一层）：

| 层 | 色 | z-index | delay | 起止 |
|---|---|---|---|---|
| 1（先走） | 黑 #000000 + wordmark | 104 | 0ms | 1500→2220 |
| 2 | **#4337FF** | 103 | 80ms | 1580→2300 |
| 3 | **#685CFF** | 102 | 160ms | 1660→2380 |
| 4（后走） | **#8D81FF** | 101 | 240ms | 1740→**2460** |
| 揭示 | 深色封面 | — | — | — |

- 中段视觉（左→右）：`深色封面 → #8D81FF → #685CFF → #4337FF → 黑+wordmark`。最浅色领跑揭示边，主色+文字收尾。
- **验收**：① 级联"追逐"感（不是一整块平推）② 最浅 #8D81FF 领跑左侧揭示边 ③ 2460ms 幕全清、露出深色封面。
- **走查**：冻帧 reveal 进度 0.25/0.5/0.75 三帧，对照 poetic `p3-c-t360-mid.png` 的**带宽比例（每带≈11%视口宽）+ 色序**。

### P3 交接 · reveal+260ms 起（幕下封面先动）
- **1760ms**（reveal+260）：封面入场（BlurReveal/TextScramble）在幕下**开始动**，与拉幕重叠 —— 幕拉开时页面已"活"。
- 2460ms：最后一层结束 → overlay 卸载 → 恢复滚动。
- **验收**：幕拉到一半时，露出的封面部分已在做 BlurReveal（不是死的静止封面）。
- **走查**：冻帧 reveal 进度 0.6，检查已露出区域的标题是否处于 blur 渐清中。

---

## 四、集成点 & 交接（写给实现 agent）

1. **overlay 组件**：新建 `IntroOverlay`，`fixed inset-0`，z-index 高于 Sidebar/一切（如 z-[200]）。挂在 `App.tsx` 最外层（`smooth-wrapper` 之外或之上）。
2. **t=0 锚点**：overlay 要尽早挂载（首帧），0.5s 黑屏靠 CSS delay 实现，不要用 JS 延迟挂载（否则时序漂移）。
3. **封面入场同步**：现有封面的 BlurReveal/TextScramble 现在是 mount 即播（enterDelay 120/420/680/920…）。**要改成等 intro 到 reveal+260ms（≈1760ms）才起**——否则封面在 overlay 下面提前播完、揭出来是静止的。用一个全局事件或状态：intro 进 reveal 相位时派发，封面监听后才启动入场。
4. **body 滚动锁**：intro 期间 `overflow:hidden`，done 后恢复。
5. **reduced-motion**：`prefers-reduced-motion` 下跳过百叶窗，改 0.45s 黑屏 fade-out 直接露封面（poetic 同款降级）。

---

## 五、终审 checklist（毫秒/像素级一致）

- [ ] 总时长 2460ms ±16ms
- [ ] P0 黑屏 500ms
- [ ] P1 logo `1s linear delay 0.5s`、方块 `1s cubic-bezier(0.4,0,0.2,1) delay 0.5s`
- [ ] 方块横扫轨迹 + 停靠 + 3 次闪烁节奏（80/83/85/88/90/93/95/98/100% 停位）
- [ ] P2 四层 `0.72s cubic-bezier(0.7,0,0.3,1)` 错峰 80ms、z 倒挂 delay 递增
- [ ] 三档蓝 #4337FF/#685CFF/#8D81FF 精确、色序对
- [ ] reveal+260ms 封面幕下先动
- [ ] 文字「vibe designing playbook」白色居中、尾随 #4337FF 方块
- [ ] reduced-motion 降级正常
- [ ] 逐相位冻帧与 poetic 参考帧并排：位置比例/opacity 节奏/色带宽度全对上
