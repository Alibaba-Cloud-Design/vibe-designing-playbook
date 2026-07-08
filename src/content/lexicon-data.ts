// 设计提示词词典 —— 12 类 188 词（中英对照），从 articulation.html fullvocab 提取
export type LexEntry = { cat: string; en: string; cn: string; def: string; rule: string };
export const LEXICON: LexEntry[] = [
  {
    "cat": "01 · Typography 排版",
    "en": "Kerning",
    "cn": "字偶间距",
    "def": "手动调整两个特定字符之间的间距。区别于 tracking（整体均匀调整）。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Tracking",
    "cn": "字间距",
    "def": "整段/整词均匀的字母间距。大写标签几乎都需要加宽。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Leading",
    "cn": "行高/行距",
    "def": "行与行之间的垂直间距。太紧文字窒息，太松不成段落。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Optical kerning",
    "cn": "视觉字距",
    "def": "凭眼睛而非字体内置度量调整间距，消除某些字母对的尴尬缝隙。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Tabular nums",
    "cn": "等宽数字",
    "def": "每个数字同宽，列里数字变动仍对齐。价格、统计、刷新数据必用。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Type scale",
    "cn": "字号阶",
    "def": "按比例预设、彼此协调的一组字号，保持层级一致。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Weight",
    "cn": "字重",
    "def": "笔画粗细。Bold 用于 UI 强调；Italic 用于语义强调或引用，非 UI 层级。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "x-height",
    "cn": "x 字高",
    "def": "小写字母高度。高 x-height 同字号看起来更大。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Cap height",
    "cn": "大写字高",
    "def": "大写字母高度。与 x-height 共同决定字体的视觉大小。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Ligature",
    "cn": "连字",
    "def": "两字符合并成单一字形以避免碰撞，如 fi、fl。装饰性连字仅用于展示。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Font smoothing",
    "cn": "字体平滑",
    "def": "浏览器渲染字体边缘的方式。Mac 上 antialiased 更细更轻。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Text overflow",
    "cn": "文本溢出",
    "def": "文字超出容器的处理。省略号截断最常见，用单个 unicode 字符、不切词。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Hyphenation",
    "cn": "连字符断词",
    "def": "用连字符把词跨行折断。窄栏/两端对齐有用，最好交给浏览器自动。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Clamp",
    "cn": "流体字号",
    "def": "设最小/理想/最大值，字号随断点平滑缩放，无需逐断点声明。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Widow",
    "cn": "孤字",
    "def": "段落最后一行只剩一个词。text-wrap: balance 可自动修。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Orphan",
    "cn": "孤行",
    "def": "段落首行被孤零零留在新列/新页顶部。常手动修。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Font stack",
    "cn": "字体栈",
    "def": "浏览器依次尝试的字体列表。匹配良好的回退字体避免加载时布局抖动。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Line length",
    "cn": "行宽",
    "def": "一栏文字宽度。≈65 字符最舒服，太宽眼睛找不到下一行。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Variable font",
    "cn": "可变字体",
    "def": "单文件含一组字重/字宽等轴，可无抖动地动画字重、减少文件开销。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Superscript",
    "cn": "上标",
    "def": "脚注/指数的升高字符。HTML sup 默认太大、扰乱行距，应手动调。",
    "rule": ""
  },
  {
    "cat": "01 · Typography 排版",
    "en": "Subscript",
    "cn": "下标",
    "def": "公式/记号的降低字符。HTML sub 同样默认偏大、需手动调。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "sRGB",
    "cn": "标准色彩空间",
    "def": "多数屏幕几十年用的标准空间，所有 hex 都在此。色域有限。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "P3",
    "cn": "广色域",
    "def": "多数现代屏支持的更宽色域，绿/红更鲜艳，sRGB 达不到。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "OKLCH",
    "cn": "感知均匀色彩空间",
    "def": "与人眼亮度感知一致。同 lightness 两色看起来真的一样亮。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Alpha",
    "cn": "透明度",
    "def": "颜色的透明分量。alpha 边框向后退融进表面，solid hex 坐在上面。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Semantic token",
    "cn": "语义 token",
    "def": "按用途命名的颜色变量，--color-border-subtle 而非 hex。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Contrast ratio",
    "cn": "对比度",
    "def": "前景背景亮度差。WCAG 要求正文 4.5:1、大字/UI 组件 3:1。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Tinted neutral",
    "cn": "带色调中性灰",
    "def": "带轻微色相偏移的灰。纯 #808080 像占位符，tinted 才像选过的。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Saturation",
    "cn": "饱和度",
    "def": "颜色鲜艳/沉闷程度。暗色模式下满饱和品牌色会刺眼，退 20-30% 更稳。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Chroma",
    "cn": "彩度",
    "def": "OKLCH 里感知准确的饱和度。浅色调降 chroma（颜色还活），别降 opacity。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Gradient",
    "cn": "渐变",
    "def": "两色或多色过渡。HSL/sRGB 中点常发灰，在 OKLCH 里建保持鲜艳。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Opacity vs visibility",
    "cn": "透明 vs 隐藏",
    "def": "opacity:0 仍占空间、接收点击；visibility:hidden 去交互留空间。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Dark mode",
    "cn": "暗色模式",
    "def": "基于暗色表面。最亮的表面应在层级最上。亮色 token 很少能直接套用。",
    "rule": ""
  },
  {
    "cat": "02 · Color 色彩",
    "en": "Blending",
    "cn": "混合模式",
    "def": "图层与下层的交互。Multiply 变暗、Screen 变亮、Overlay 两者皆有。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Stroke weight",
    "cn": "描边粗细",
    "def": "图标线条粗细。细描边小尺寸消失、大尺寸显单薄，粗细要随尺寸缩放。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Optical centre",
    "cn": "视觉中心",
    "def": "看起来居中 vs 数学居中。播放按钮按坐标居中会偏左，往右挪才坐得住。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Filled vs outlined",
    "cn": "填充 vs 描边",
    "def": "两种风格传达状态。filled 常表选中/激活，outlined 表默认。混用要有系统。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Cap style",
    "cn": "线帽样式",
    "def": "描边端点方圆。多数 UI 里圆头更精致，方头可能显粗糙。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Pixel hinting",
    "cn": "像素微调",
    "def": "调整图标路径在小尺寸下对齐像素网格。全细节 logo 在 16px 不调会糊。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Icon library",
    "cn": "图标库",
    "def": "同尺寸/粗细/圆角绘制的一套图标。混用两套（即使相似）会累积错配。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Icon size system",
    "cn": "图标尺寸系统",
    "def": "图标呈现的预定尺寸（12/16/20/24/48），每档理想上单独绘制而非缩放。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Meaning collision",
    "cn": "语义冲突",
    "def": "同一图标在同产品里表两种动作（星=收藏又=评分），用户两个都学不会。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Contextual swap",
    "cn": "情境切换",
    "def": "描边↔填充切换表状态变化（激活/选中），约定需全产品一致才有效。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Breathing room",
    "cn": "呼吸间距",
    "def": "图标与标签之间的间距。6-8px 起步，是组件设计的一部分而非事后。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Unified weight",
    "cn": "统一权重",
    "def": "图标与周围文字视觉权重一致。细描边图标配粗体字像来自不同产品。",
    "rule": ""
  },
  {
    "cat": "03 · Iconography 图标",
    "en": "Metaphor accuracy",
    "cn": "隐喻准确度",
    "def": "图标是否真代表它该代表的。软盘=保存，随受众老化需审视。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Border radius",
    "cn": "圆角",
    "def": "内层圆角 = 外层 − padding。两层同值会出现可见缝隙。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Gap",
    "cn": "间隙",
    "def": "flex/grid 子元素间距，设在父上。不像 margin，末项后无残留空间。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Negative space",
    "cn": "负空间",
    "def": "元素周围与之间的留白，定义形状、制造呼吸、引导视线。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Flexbox",
    "cn": "弹性盒",
    "def": "行/列排列元素的 CSS 布局模型，控制方向、对齐、间距、伸缩。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Auto layout",
    "cn": "自动布局",
    "def": "Figma 版 flexbox：元素自动间距、随内容缩放、响应方向与对齐规则。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Layout shift",
    "cn": "布局抖动",
    "def": "加载时元素意外移动（图片弹入、字体替换）。预留空间 + 等高回退字体可避。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Overflow",
    "cn": "溢出",
    "def": "内容大于容器的处理。hidden 静默裁剪、scroll 加条、auto 按需。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Sticky positioning",
    "cn": "粘性定位",
    "def": "滚到阈值后固定。父级设 overflow:hidden 会静默破坏它。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Aspect ratio",
    "cn": "宽高比",
    "def": "宽高比例关系。给图片/嵌入设它，浏览器可预留空间防抖动。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Viewport units",
    "cn": "视口单位",
    "def": "相对窗口的单位。dvh 考虑移动浏览器 chrome，vh 全屏移动常溢出。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Safe area",
    "cn": "安全区",
    "def": "不被刘海/home 指示条遮挡的区域。固定底部元素需考虑它。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Max-width",
    "cn": "最大宽度",
    "def": "容器宽度上限。没有它，宽屏上文字行长到读不下去。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Breakpoint",
    "cn": "断点",
    "def": "布局切换的点。最好设在内容真正断裂处，而非假设的设备宽度。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Responsive",
    "cn": "响应式",
    "def": "适配不同屏幕的设计。流体布局 + 弹性图片 + 断点。Web 的基线期望。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Grid",
    "cn": "栅格",
    "def": "组织布局的列系统。12 列是惯例，简单布局 8 列常更好。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Asymmetry",
    "cn": "不对称",
    "def": "刻意不等的列/元素。制造张力与趣味。对称稳定但少有趣。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Baseline grid",
    "cn": "基线网格",
    "def": "基于正文行高的水平节奏。编辑排版有用，产品 UI 常过度。",
    "rule": ""
  },
  {
    "cat": "04 · Layout 布局",
    "en": "Z-index",
    "cn": "层叠顺序",
    "def": "同平面元素的堆叠序。弹窗/tooltip/下拉需显式 z-index 否则被裁。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Affordance",
    "cn": "可供性",
    "def": "告诉你怎么用的视觉信号。按钮看着可按，链接看着可点。缺了用户只能猜。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Hover state",
    "cn": "悬停态",
    "def": "光标移上的视觉变化，应通过光标变化或颜色确认可交互。仅颜色不够。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Focus state",
    "cn": "聚焦态",
    "def": "键盘聚焦的可见指示。删除它是无障碍失败，应换自定义样式而非删。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Active state",
    "cn": "按下态",
    "def": "元素被按下的视觉变化。没有它按钮显得无响应，小缩放/变色即可。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Disabled state",
    "cn": "禁用态",
    "def": "不可交互元素。仅靠 opacity 不可靠，用专门的 muted token 更可预测。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Cursor",
    "cn": "光标",
    "def": "指针图标信号元素行为。pointer=可点、default=静态、text=可选。错了破坏隐式契约。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Pointer events",
    "cn": "指针事件",
    "def": "元素能否接收鼠标/触摸。none 让元素可见但不可交互，适合装饰层。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Optimistic update",
    "cn": "乐观更新",
    "def": "服务器确认前先更新 UI，感觉即时，失败需回滚。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Debounce",
    "cn": "防抖",
    "def": "触发后延迟执行、每次触发重置。阻止搜索框每次按键都请求，300ms 常见。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Touch target",
    "cn": "触控目标",
    "def": "可点区域，最小 44×44px。视觉元素可比触控目标小。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Copy to clipboard",
    "cn": "复制到剪贴板",
    "def": "复制按钮需可见确认（勾一两秒），否则用户反复点以为失败。",
    "rule": ""
  },
  {
    "cat": "05 · Interaction 交互",
    "en": "Skip link",
    "cn": "跳过链接",
    "def": "视觉隐藏、聚焦时出现，跳到主内容。没它键盘用户每页都要 tab 过导航。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Easing",
    "cn": "缓动",
    "def": "动画加减速的速率。ease-out 减速入位自然，ease-in 起步慢显拖沓。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Ease-out",
    "cn": "缓出",
    "def": "快起慢落。多数 UI 过渡默认，用于入场。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Ease-in",
    "cn": "缓入",
    "def": "慢起快落。用于离场。用在入场会显得勉强。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Ease-in-out",
    "cn": "缓入缓出",
    "def": "慢-快-慢。适合屏内位移（开关、卡片滑动），简单进出场则过度。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Stagger",
    "cn": "错峰",
    "def": "列表项依次延迟，40ms 有陆续到达感，全部一起像闪一下。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Duration",
    "cn": "时长",
    "def": "hover ≈150ms 原生，400ms 像在思考，超 400ms 无反馈像坏了。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Transition property",
    "cn": "过渡属性",
    "def": "动画哪些属性。animate all 易误伤布局属性致卡顿，opacity+transform 是安全对。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Reduced motion",
    "cn": "减弱动效",
    "def": "用户偏好少动画。忽略会引发前庭不适。任何明显位移都要检查。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Skeleton shimmer",
    "cn": "骨架微光",
    "def": "扫过骨架屏的移动渐变暗示活动。应尊重 reduced motion。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Spring",
    "cn": "弹簧",
    "def": "基于物理弹簧的缓动，轻微过冲后稳定，比标准 ease-out 更鲜活。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Choreography",
    "cn": "编排",
    "def": "多元素同时动画的协调。各自乱动是噪音，好编排让眼睛知道看哪。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Enter vs exit asymmetry",
    "cn": "入出场不对称",
    "def": "入场是到达该减速、出场是离开该加速。反放入场当出场像倒着来。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Shared axis transition",
    "cn": "共享轴过渡",
    "def": "视图间导航的运动方向反映空间关系。前进向右、后退向左。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "Motion as feedback",
    "cn": "动效即反馈",
    "def": "按钮按下压缩、错误抖动、成功画勾——运动不是装饰，是响应。",
    "rule": ""
  },
  {
    "cat": "06 · Motion 动效",
    "en": "GPU compositing",
    "cn": "GPU 合成",
    "def": "opacity/transform 走 GPU、不触发布局重算。animate width/top 强制重排。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "WCAG",
    "cn": "无障碍指南",
    "def": "多数团队的对比度标准。AA 要求正文 4.5:1、大字/UI 组件 3:1。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "APCA",
    "cn": "感知对比算法",
    "def": "考虑字号字重的新对比模型，比 WCAG 更贴近真实，两者有时不一致。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "Screen reader",
    "cn": "屏幕阅读器",
    "def": "为盲/低视力用户朗读内容。按 DOM 顺序、标题结构、ARIA 角色导航。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "Tab order",
    "cn": "Tab 顺序",
    "def": "键盘聚焦的移动序列。应遵循阅读顺序，意外跳转常因 DOM 与视觉序不一致。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "Prefers color scheme",
    "cn": "配色偏好",
    "def": "检测系统主题偏好的媒体查询。尊重暗色模式的正确方式。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "aria-label",
    "cn": "无障碍名称",
    "def": "给无可见文字元素的可访问名。应描述动作而非元素类型（Search 而非 icon）。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "Focus trap",
    "cn": "焦点陷阱",
    "def": "把键盘焦点锁在打开的弹窗内，否则焦点会跑到背后页面。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "DOM order",
    "cn": "DOM 顺序",
    "def": "HTML 里元素的顺序。屏幕阅读器跟它走、非视觉序。CSS 重排会造成脱节。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "Semantic HTML",
    "cn": "语义化 HTML",
    "def": "用对元素。button 自带键盘/焦点/角色，div 扮按钮要手动补全这些。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "Label association",
    "cn": "标签关联",
    "def": "用 for/id 把 label 连到 input，否则点 label 不会聚焦字段。",
    "rule": ""
  },
  {
    "cat": "07 · Accessibility 无障碍",
    "en": "Color-only state",
    "cn": "仅颜色状态",
    "def": "仅靠颜色表状态。只用红边框表错误对色盲用户不可见，须配图标/文字。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Progressive disclosure",
    "cn": "渐进披露",
    "def": "每步只显示所需，深入再揭示复杂。反面是一页堆所有。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Navigation",
    "cn": "导航",
    "def": "在产品各区间移动的系统。标签应匹配用户说法、非内部术语。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Mental model",
    "cn": "心智模型",
    "def": "用户对运作方式的内在图景。好 IA 匹配它，不匹配用户会迷失并自责。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Hierarchy",
    "cn": "层级",
    "def": "元素按重要性排序。没有它一切竞争、无人胜出。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Empty state",
    "cn": "空状态",
    "def": "尚无内容时的视图。应解释为何并给下一步，「无数据」终结旅程。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Error state",
    "cn": "错误态",
    "def": "失败时显示什么。应说清出了什么错、给具体恢复方式。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Onboarding",
    "cn": "引导上手",
    "def": "向新用户介绍产品。最好立即交付价值，完成一个有意义动作比看完导览更易留存。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Confirmation dialog",
    "cn": "确认对话框",
    "def": "破坏性/不可逆动作前的提示。应说会失去什么，危险与安全动作视觉拉开。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Wayfinding",
    "cn": "寻路",
    "def": "帮用户理解「我在哪、怎么来的、能去哪」的信号系统（面包屑、激活态、标题、URL）。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Signpost",
    "cn": "路标",
    "def": "只为定位的 UI（区头、类别标签、步骤指示）。工作时隐形，缺了才被注意。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Labelling",
    "cn": "标签命名",
    "def": "导航/区头/类别用词。匹配用户词汇的被用，内部命名的被绕过。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Depth",
    "cn": "层级深度",
    "def": "到达内容需穿过的导航层数。3 层是上限，更深需更好寻路或扁平化。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Search as escape hatch",
    "cn": "搜索逃生口",
    "def": "用户因导航失败而求助搜索。该可浏览却高搜索量，是 IA 需改进的信号。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Content inventory",
    "cn": "内容清单",
    "def": "产品/站点所有内容的完整列表，重构前用以找缺口、重复、孤页。",
    "rule": ""
  },
  {
    "cat": "08 · Information Architecture 信息架构",
    "en": "Card sorting",
    "cn": "卡片分类",
    "def": "让用户把主题分成对他们有意义的类别的研究法，构建前验证 IA。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Microcopy",
    "cn": "微文案",
    "def": "标签、错误、占位符、tooltip 等短 UI 文本，对可信度影响极大。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "CTA",
    "cn": "行动召唤",
    "def": "主动作的标签。\"Save changes\" 比 \"Submit\" 更可信，拥有动作别道歉。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Error message",
    "cn": "错误信息",
    "def": "说清出错与修法。\"Invalid input\" 什么都没说，\"邮箱须含 @\" 说清一切。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Placeholder",
    "cn": "占位提示",
    "def": "输入框内提示，输入即消失。不能替代 label——需要提醒时它已不在。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Sentence case",
    "cn": "句首大写",
    "def": "只首词与专名大写。UI 标签默认。Title Case 读起来像法律文件。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Front-loading",
    "cn": "前置关键词",
    "def": "最重要的词放最前。\"Export ready\" 胜过冗长句，用户在扫读。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Inline error",
    "cn": "行内错误",
    "def": "紧挨出错字段的错误信息。顶部汇总让用户找，行内才明确。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Voice",
    "cn": "语调（一致）",
    "def": "所有文字背后一致的个性。正式/随意、技术/朴素，不随情境变。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Tone",
    "cn": "语气（情境）",
    "def": "voice 随情境的调整。引导时鼓励、设置中中性、危险动作旁谨慎。同 voice 不同 register。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Success message",
    "cn": "成功信息",
    "def": "动作完成的确认，常被忽略。应具体（\"Saved\" 非 \"Done\"）且简短。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Destructive language",
    "cn": "破坏性用词",
    "def": "不可撤销动作的文案（删除/移除/吊销）应明确，用 \"clear/reset\" 软化会误导。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Scannability",
    "cn": "可扫读性",
    "def": "为快速读而非细读写。短句、主动语态、关键信息在前。尊重用户注意力。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Truncation strategy",
    "cn": "截断策略",
    "def": "溢出时在哪、怎么截。词边界截优于切字符，标题/标签/描述各需自己的逻辑。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Contextual help",
    "cn": "情境帮助",
    "def": "在需要的时刻、紧挨它解释的对象旁的说明文字。一句话消除提问需求。",
    "rule": ""
  },
  {
    "cat": "09 · Copywriting 文案",
    "en": "Numeric formatting",
    "cn": "数字格式",
    "def": "界面里数字怎么写（1,000 vs 1000；$1.00 vs $1）。一致性比具体约定更重要。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Design system",
    "cn": "设计系统",
    "def": "共享的组件、token、模式、指南。最佳状态是活产品而非静态文档。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Source of truth",
    "cn": "真值来源",
    "def": "团队设计决策唯一依据。传统是 Figma，越来越多是代码库本身。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Variables",
    "cn": "变量",
    "def": "颜色/间距/字号等可复用、从一处更新的命名容器。可扩展系统的基础。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Tokens",
    "cn": "token",
    "def": "存为命名变量、设计工具与代码都能引用的设计决策。让系统跨平台可移植。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Visual language",
    "cn": "视觉语言",
    "def": "色/字/形/动/调的连贯决策集，让产品在每个触点都可辨识。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Artboard / Frame",
    "cn": "画板 / 框架",
    "def": "设计文件里代表屏/视图/组件的命名画布。Figma 的 frame 还定义裁剪与布局。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Prototype",
    "cn": "原型",
    "def": "构建前测试/沟通流程的交互模型。保真度应匹配要回答的问题。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Handoff",
    "cn": "交接",
    "def": "设计移交工程的时刻。做好=准确规格+共享 token+设计师可答疑。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Redline / annotation",
    "cn": "标注",
    "def": "加在设计上传达意图的测量与注释（间距、token、交互、边界）。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Moodboard",
    "cn": "情绪板",
    "def": "提交前探索/沟通方向的视觉参考集，对齐基调与审美。好的在论证。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "HiDPI / Retina",
    "cn": "高分屏",
    "def": "像素密度 2× 以上的屏。未准备的资产发糊，图标/图/边框需考虑 2×3×。",
    "rule": ""
  },
  {
    "cat": "10 · Tools 工具",
    "en": "Open Graph",
    "cn": "OG 元数据",
    "def": "控制链接分享预览（图/标题/描述）的元数据。常被忽视的第一印象。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "A/B test",
    "cn": "A/B 测试",
    "def": "两个变体同时运行比性能。用真实行为而非内部意见验证决策。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Heatmap",
    "cn": "热力图",
    "def": "用户点击/滚动位置的可视化。显示什么吸引注意、什么被忽略。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Session recording",
    "cn": "会话录制",
    "def": "单个用户会话的录像。精确显示哪里犹豫、困惑、放弃。比热力图更具体。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Funnel",
    "cn": "漏斗",
    "def": "用户走向转化目标的路径。任一步流失都是设计问题。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Conversion",
    "cn": "转化",
    "def": "访客采取目标动作的时刻。设计通过清晰、信任、减摩擦、CTA 质量影响它。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Bounce rate",
    "cn": "跳出率",
    "def": "无任何动作即离开的访客比例。关键页高跳出常指期望与所见不符。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Retention",
    "cn": "留存",
    "def": "首访后回来的用户数。强获取也可能差留存，留存更难更重要。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Churn",
    "cn": "流失",
    "def": "停止使用的用户。留存的反面。高流失=产品价值不足以留住人。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "NPS",
    "cn": "净推荐值",
    "def": "用户推荐意愿（0-10）。粗钝但广用，整体满意度的粗略信号。",
    "rule": ""
  },
  {
    "cat": "11 · Analysis 分析",
    "en": "Scroll depth",
    "cn": "滚动深度",
    "def": "用户实际读到页面多深。多数到不了底，折叠下方内容被看到的远少于假设。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Button",
    "cn": "按钮",
    "def": "主动作触发。需 default/hover/active/focus/disabled/loading 各态。一屏不超一个 primary。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Input",
    "cn": "输入框",
    "def": "文本录入。需上方持久 label 而非仅占位符，各态视觉区分。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Textarea",
    "cn": "多行输入",
    "def": "多行录入，需与单行同样的状态处理。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Select",
    "cn": "下拉选择",
    "def": "从列表选一项。原生可访问但难样式化，自定义需小心键盘与焦点。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Checkbox",
    "cn": "复选框",
    "def": "二元选择切换。点 label 应切换，不只点框。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Radio group",
    "cn": "单选组",
    "def": "恰选一项的一组选项。区别于可多选的复选框。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Switch",
    "cn": "开关",
    "def": "开/关切换，意味即时生效。用于无需保存的设置。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Slider",
    "cn": "滑块",
    "def": "在区间内选值。应拖动时实时更新而非仅松手时。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Modal / Dialog",
    "cn": "模态框",
    "def": "打断当前流程要求关注的覆盖层。焦点须困在内、背景对屏幕阅读器惰性。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Sheet",
    "cn": "侧拉面板",
    "def": "从屏幕边滑入的面板，移动端常用。同模态的焦点与关闭规则。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Drawer",
    "cn": "底部抽屉",
    "def": "从底部上拉的 sheet。移动端常替代 dialog。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Popover",
    "cn": "气泡卡",
    "def": "锚定元素、点击触发的小覆盖层，可含交互内容（区别于 tooltip）。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Tooltip",
    "cn": "提示框",
    "def": "悬停显示的解释小标签，不能含交互内容。要放链接用 popover。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Toast",
    "cn": "轻提示",
    "def": "自动消失的临时通知。时长应反映阅读时间而非固定 2 秒。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Badge",
    "cn": "徽标",
    "def": "附着在另一元素上的小标签，数字时表计数。带词时行为更像 tag。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Tag",
    "cn": "标签",
    "def": "给内容分类的标签，独立、可选、可移除。Badge 是附着的、信息性的——两者不同。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Accordion",
    "cn": "手风琴",
    "def": "可展开折叠的堆叠区块。适合 FAQ，不替代需横向对比的 tabs。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Tabs",
    "cn": "标签页",
    "def": "在同空间切换相关视图。适合按时间/类别筛同内容，非导航无关区。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Stepper",
    "cn": "步骤器",
    "def": "显示序列进度的多步流程。提前显示所有步骤设期望，隐藏制造焦虑。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Carousel",
    "cn": "轮播",
    "def": "横向滚动的一行项目。桌面端常是布局没解决的信号，首项获最多注意。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Navigation menu",
    "cn": "导航菜单",
    "def": "在主区块间移动的顶层/飞出结构。标签反映用户思维而非构建方式。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Sidebar",
    "cn": "侧边栏",
    "def": "锚定边缘的持久导航，仪表盘常用。频繁切区时好用。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Breadcrumb",
    "cn": "面包屑",
    "def": "显示层级位置的路径，让深层用户不靠浏览器返回也能回退。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Pagination",
    "cn": "分页",
    "def": "在多页内容间移动的控件。列表太长无法一次加载时用，无限滚动是另一权衡。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Skeleton",
    "cn": "骨架屏",
    "def": "加载时撑住内容形状的占位，稳定布局、暗示将来。列表/页加载优于 spinner。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Spinner",
    "cn": "加载转圈",
    "def": "不确定时长的加载指示。短动作级等待好用，页/列表加载用骨架屏更好。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Avatar",
    "cn": "头像",
    "def": "代表用户/实体的小图。图片失败时需回退（首字母或通用图标）。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Card",
    "cn": "卡片",
    "def": "分组相关内容的容器。内圆角应小于外、按 padding 算。整面做链接会让文字无法选。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Data table",
    "cn": "数据表",
    "def": "行列结构网格。数字应右对齐 + tabular-nums，正确对齐胜过斑马纹补偿。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Combobox",
    "cn": "组合框",
    "def": "输入时筛选下拉的输入框，兼具文本框的手感与 select 的约束。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Command menu",
    "cn": "命令面板",
    "def": "键盘触发的搜索式导航/执行界面，工具类产品里高级用户避鼠标用。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Progress",
    "cn": "进度条",
    "def": "显示确定进程完成度的条。时长未知时用 spinner。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Separator",
    "cn": "分隔线",
    "def": "项/区之间的视觉分隔。常在更好的间距能解决时被过度使用。",
    "rule": ""
  },
  {
    "cat": "12 · Components 组件",
    "en": "Empty state",
    "cn": "空状态",
    "def": "无内容时的视图。应解释为何并给首个动作，\"无结果\" 什么都没告诉用户。",
    "rule": ""
  }
];
