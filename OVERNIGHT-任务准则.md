# 过夜自动改造任务准则（2026-07 · 用户 7 项需求）

> host：http://localhost:5173/　工程：playbook/visuals/cover-app/
> 红线（凌驾一切）：**给了参考就 1:1 高质量还原，不偷懒、不选容易路径**。每阶段**自己设计检查机制、自己 review**：Playwright + 真实 Chrome 冻帧截图 → 与参考并排对照 → 不达标就改 → 循环到位。用户明早验收。
> 真实 Chrome：`~/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/'Google Chrome for Testing.app'/Contents/MacOS/'Google Chrome for Testing'`。dev server 应在 5173（curl 确认，没有则 `npm run dev &`）。
> 保 motion 不许弄坏：poetic 入场 / 侧栏擦入 hover / 标题模糊渐现 / 横条转场 / 滚动渐显 / 全局网格(GridOverlay 116/316/右) / 间距系统(--space-*/--inset 铁律：字不压线，从结构线 inset 20px)。

参考截图/资产目录：`/private/tmp/claude-502/-Users-retyako-Desktop-WORKS-80-Cloud-AI/0933c673-41d5-40cd-9564-664aa2aa2ade/scratchpad/`

---

## 需求 1 · 首屏封面 → 实现 Figma 设计（1:1）
- **Figma**：file `jTWdl1Aca0LQnkpn6bSmUR` node `209-42`。用 figma-remote MCP `get_design_context` / `get_screenshot`(fileKey+nodeId) 拉精确规格（字体/字号/色/坐标）。截图存 `scratchpad/figma-cover-209-42.png`。
- **设计要点**（截图逆向）：黑底 + 排版式 serif 巨字标「**Vibe**(罗马正) / **Designing**(斜体，最大最亮) / **Playbook**(罗马正)」左下角起 + 「Playbook」后接**靛蓝小色块**；左上「Not Design / But Future」serif + 小方块；mono 小标签「2026」「ENGINEERING, INTERACTION, AND EVOLUTION.」；右上主题 toggle；**淡网格线**（竖 x28/x540 + 横）。
- 替掉现在的相切圆蓝图封面（CoverBlueprint）。poetic 入场保留、揭示这个新封面。
- **验收**：冻帧截图与 Figma 209-42 逐元素对位（字体/位置/色/网格）；字标斜体/罗马混排正确；靛蓝块到位。

## 需求 2 · 引言页 → 图形卡片 + 右→左滚动划入
- **参考动画**：`scratchpad/behance-frames.png`（源 GIF：`/Users/retyako/Desktop/trans/TeamFile/jing.library/images/MR96QB5HKWFNE.info/Second Kind  Behance.gif`）。
- **卡片形制**：深色圆角卡；**顶部一组抽象几何线稿动画**（轨道椭圆/figure-8 无限环/放射节点，白细线，缓慢旋转morph）；下方 serif 标题 + 灰 sans 描述。
- **抽象图形复用**：`src/content/signature/`（kit.ts 图元 + variants.ts）已有这套 polar 几何语言，直接生成卡片顶图；内容换成我们的（引言/设计工程/动态交互/自我进化/结语/词典 各一卡）。
- **动效**：滚动时卡片**横向右→左划入**（scroll 驱动，GSAP/transform，非布局属性；错峰）。
- **验收**：冻帧对照 behance-frames 的卡片构成（几何顶图+serif题+灰描述）；滚动划入右→左顺滑；几何动画在动。

## 需求 3 · 章节标题 → 杂志感章扉页（参考 X 版式）
- **参考**：business.x.com/advertising 版式（`scratchpad/xads-*.png`：xads-03 双色区块头、xads-01/04 hero）。
- **问题**：现在章节标题**太大、设计糟**。用 X 规则**深度细化**：标题收小、错落有致、留白节奏。
- **每章一屏杂志感标题引入**：如「设计工程 · 可控的高质量生成」配 **gif**（见需求 5）+ 非对称错落版式（mono 编号/眉标 + 收敛的思源宋标题 + 灰副题 + 图）。
- **验收**：标题字号明显收小、版式错落有杂志感；每章有独立标题屏 + 配图；对照 X 双色头/留白规则。

## 需求 4 · 正文内容(最新) + 板块设计
- **内容**：读 `playbook/manuscript/` **当前全部 .md**（非 git，当前即最新）：`00-引言` `01-设计工程/{1.1,1.2,1.3}` `02-动态交互/{2.1-2.4}` `03-自我进化/{3.1-3.3}` `99-结语` `A0-附录-设计提示词词典`。详细转写进正文数据（现 `src/content/chapter1.ts` 只有第一章；补齐二、三章 + 结语 + 附录）。
- **附件块**：点击可下载 + hover 特殊设计（如描边亮起/图标位移/下载态）。
- **实操步骤（如 1.3 第一步/第二步）**：参考 poolside 文章章节设计——**蓝色色块 + 黑色色块**打造有趣高质量的步骤名（step 标签 = 靛蓝#4337FF/#685CFF 块 + 近黑块拼接）。
- **架构图**：正文缺架构图处，用**我们之前 tweak 官网架构图**的感觉补（参考 `~/Tools/tweakkit/landing/index.html` 的 SVG flow 图：节点+连线+edge），**风格用 playbook 自己的**（深色线稿/靛蓝强调/发丝线）。
- **验收**：三章+结语+附录内容齐全无占位；附件可点下载+hover 生效；步骤名蓝/黑块；架构图到位。

## 需求 5 · 插图
- **能自己画的自己画**（用 signature 引擎/SVG 线稿，playbook 风）。
- **skill 的 gif** 用之前汇报做的：`/Users/retyako/Desktop/WORKS/80.Cloud AI/agenticux-recording/media/`（`01-visual-spec` `02-picker` `03-variant` `04a-number` `05a-walkthrough` `05b-report`.gif）+ `素材/cloudai组件.gif`。按内容匹配放进对应章节/章扉页（拷进 public/ 引用）。
- **验收**：该配图处都有图；gif 正常播放；风格统一。

## 需求 6 · 所有架构图放进描边边框容器（精致）
- 每张架构图/示意图外套一个**描边边框的容器**（发丝线/暖黑细描边、直角或小圆角、内 padding），精致收边。统一成一个 `<Figure>`/frame 组件。
- **验收**：全站架构图/示意图都在描边框内，边距一致、精致。

## 需求 7 · 自动跑 + 自检 + 自 review
- 顺序分阶段跑（依赖：内容/插图 → 卡片/章扉页/正文块 → 边框统一 → 终审）。
- **每阶段自检**：截图冻帧 → 对照本准则的参考 → 不达标改到位。
- **终审**：全站从首屏滚到底逐屏冻帧核对 7 项；保 motion 全在；列未达标项供晨审。

---

## 阶段顺序（workflow）
1. **封面**（需求1，Figma 1:1）
2. **插图/资产**（需求5+6：signature 卡片顶图族 + 拷 gif 进 public + 建统一描边 Figure 容器）
3. **引言卡片**（需求2：卡片 + 右→左划入）
4. **章扉页**（需求3：X 杂志感章标 + gif）
5. **正文内容+板块**（需求4：拉最新内容转写 + 附件/步骤蓝黑块/架构图）
6. **架构图边框统一**（需求6 收口全站）
7. **终审自 review**（需求7）
