# cloudai-picker skill

## 触发条件

写 CloudAI / Data Agent / AI 原生数据服务 / 阿里云相关页面之前必读。

## 五步工作流

1. 判断主题：CloudAI 默认主题或 data-agent。
2. 命中场景：列表、看板、详情、设置、编辑器、Agent 管理。
3. 选择骨架：从 template 中选择页面结构。
4. 选择组件：读取 components，避免易混组件误用。
5. 报告决策：说明选择的 template、组件和风险点。

## 关键原则

- 不凭直觉选模版。
- 不把 sample / playground 当生产骨架。
- 不 hardcode `#636AF1`。
- CloudAI 与 data-agent 同名模版要按结构区分。
