# GitHub Pages 发布修复设计

## 目标

恢复设计指南站点的正常发布，并统一 GitHub README 中的产品称呼。

## 已确认的问题

- GitHub Pages 当前从 `main / (root)` 直接发布源码，线上入口引用 `/src/main.tsx`，导致脚本请求返回 404、页面空白。
- `.github/workflows/pages.yml` 与 `.github/workflows/deploy.yml` 会在同一次推送中并发运行并互相取消。
- README 中有一处“实践白皮书”，需要改为“实践设计指南”。

## 最小改动

1. 保留 `.github/workflows/pages.yml`，因为它包含 `actions/configure-pages@v5` 和 `enablement: true`。
2. 删除重复的 `.github/workflows/deploy.yml`，消除并发部署竞争。
3. 在 GitHub Pages 设置中把发布源切换为 GitHub Actions，避免分支发布继续上传源码根目录。
4. 将 README 中唯一一处“实践白皮书”替换为“实践设计指南”，不改写其他内容。

## 验收标准

- 仓库只保留一份 Pages 工作流。
- README 不再包含“白皮书”，并包含“实践设计指南”。
- 本地以 `/vibe-designing-playbook/` 为 base 构建成功。
- GitHub Actions 构建与部署成功。
- 线上首页引用 `/vibe-designing-playbook/assets/` 下的构建产物，不再引用 `/src/main.tsx`。
- 真实浏览器中页面有正文，关键资源请求无 404。

## 边界

- 不修改站点功能、视觉样式或正文内容。
- 不修改当前未提交的 `package-lock.json`。
- 不处理与本次发布故障无关的代码。
