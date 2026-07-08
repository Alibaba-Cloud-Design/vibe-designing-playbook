# evaluator-rubric.md

## 检查维度

| 检查项 | 回到哪份声明 |
| --- | --- |
| 是否覆盖空态、加载态、错误态、权限态 | `spec.md` |
| 风险色、敏感字段、危险操作是否符合领域规则 | `domain.md` |
| 是否有 AI Slop、无意义动效、层级平均化 | `craft.md` |
| 是否 hardcode 色值、字号、动效时长 | `design.md` |
| Badge / Tag、Dialog / Drawer 是否误用 | `components` |
| 页面骨架是否匹配场景 | `template` |

## 回流格式

```text
issue:
  描述具体问题
source:
  回到哪份声明
fix:
  下一轮应修改什么
```
