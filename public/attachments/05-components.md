# components

## Agent 调度看板组件语义

| 信息 | 语义 | 组件 |
| --- | --- | --- |
| 运行中 | 任务运行状态 | Badge |
| 失败 | 任务运行状态 | Badge |
| 高危 | 风险等级 | RiskBadge |
| ECS | 资源类型 | Tag |
| 生产环境 | 业务分类 | Tag |
| 查看日志 | 行内操作 | Button / Link |
| 重试 | 恢复动作 | Button |

## 易混边界

- Badge 表达状态、计数、风险。
- Tag 表达分类、类型、环境。
- Drawer 承载复杂详情。
- Dialog 承载需要用户确认的中断动作。
