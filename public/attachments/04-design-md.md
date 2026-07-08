# design.md

## 视觉意图

- CJK-first。
- 控制台密度优先。
- 品牌色克制使用。
- 中性色承载主要层级。

## 视觉角色

- `--brand`：主品牌和主 CTA。
- `--brand-surface`：选中行、软徽章、引用块。
- `--foreground-link`：正文链接。
- `--warning-high`：高风险状态。
- `--chart-1..12`：多系列图表。

## 执行约束

- 所有视觉值走 `var(--*)`。
- hover / active / selected 从基础 token 派生。
- 找不到 token 时记录到 `gaps.log`。
- 禁止直接写 hex、px、ms、cubic-bezier。
