# GitHub Pages Publishing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让设计指南站点只通过 GitHub Actions 发布构建产物，并把 README 中的“白皮书”统一为“设计指南”。

**Architecture:** 保留包含 `configure-pages` 的唯一工作流，删除旧工作流以消除并发部署竞争；GitHub Pages 发布源切换为 Actions。README 只做一次精确替换，不改动其他文案。

**Tech Stack:** GitHub Actions、GitHub Pages、Vite、React、Shell 验证命令

---

### Task 1: 建立会失败的回归检查

**Files:**
- Inspect: `.github/workflows/pages.yml`
- Inspect: `.github/workflows/deploy.yml`
- Inspect: `README.md:11`

- [ ] **Step 1: 运行当前状态检查**

```bash
workflow_count=$(find .github/workflows -maxdepth 1 -type f -name '*.yml' | wc -l | tr -d ' ')
test "$workflow_count" = "1" && ! rg -n '白皮书' README.md && rg -n '实践设计指南' README.md
```

Expected: FAIL；当前有 2 份工作流，README 仍包含“实践白皮书”。

### Task 2: 实施最小文件修改

**Files:**
- Delete: `.github/workflows/deploy.yml`
- Modify: `README.md:11`

- [ ] **Step 1: 删除重复工作流**

删除 `.github/workflows/deploy.yml`，保留含 `actions/configure-pages@v5` 和 `enablement: true` 的 `.github/workflows/pages.yml`。

- [ ] **Step 2: 精确替换 README 文案**

将：

```markdown
一份关于「设计如何进入 AI 生成系统」的实践白皮书 · 阿里云设计中心 出品
```

改为：

```markdown
一份关于「设计如何进入 AI 生成系统」的实践设计指南 · 阿里云设计中心 出品
```

- [ ] **Step 3: 复跑回归检查**

```bash
workflow_count=$(find .github/workflows -maxdepth 1 -type f -name '*.yml' | wc -l | tr -d ' ')
test "$workflow_count" = "1" && ! rg -n '白皮书' README.md && rg -n '实践设计指南' README.md
```

Expected: PASS；工作流数量为 1，旧称呼为 0，新称呼为 1。

### Task 3: 验证构建产物

**Files:**
- Verify: `.github/workflows/pages.yml`
- Verify generated output: `dist/index.html`

- [ ] **Step 1: 运行代码检查**

```bash
npm run lint
```

Expected: exit 0；允许保留基线中已经存在的 8 条 warning，不新增 error。

- [ ] **Step 2: 使用 GitHub Pages 子路径构建**

```bash
npm run build -- --base=/vibe-designing-playbook/
```

Expected: exit 0，并生成 `dist/index.html`。

- [ ] **Step 3: 检查入口引用的是构建产物**

```bash
rg -n '/vibe-designing-playbook/assets/' dist/index.html
if rg -n '/src/main\.tsx' dist/index.html; then exit 1; fi
```

Expected: 第一条命令命中 assets；第二条检查无命中并返回成功。

- [ ] **Step 4: 检查提交差异**

```bash
git diff --check
git diff -- README.md .github/workflows/deploy.yml
```

Expected: 无空白错误；业务改动只有 README 一行替换和旧工作流删除。

### Task 4: 提交文件修改

**Files:**
- Commit: `README.md`
- Commit deletion: `.github/workflows/deploy.yml`

- [ ] **Step 1: 创建最小提交**

```bash
git add README.md .github/workflows/deploy.yml
git commit -m "fix: 修复 GitHub Pages 发布并统一设计指南称呼"
```

Expected: 提交只包含上述两个文件。

### Task 5: 切换 GitHub Pages 发布源并上线

**External setting:**
- Modify: `https://github.com/Alibaba-Cloud-Design/vibe-designing-playbook/settings/pages`

- [ ] **Step 1: 切换发布源**

在 GitHub Pages 设置中将 Source 从 `Deploy from a branch` 切换为 `GitHub Actions`。

Expected: 设置页显示发布源为 GitHub Actions，不再显示 `main / (root)` 分支选择器。

- [ ] **Step 2: 合并隔离分支并推送 main**

回到主工作目录 `/Users/retyako/Desktop/WORKS/80.Cloud AI/vibe-designing-playbook` 执行：

```bash
git merge --ff-only codex/fix-github-pages
git push origin main
```

Expected: 远端 `main` 更新，触发且只触发 `.github/workflows/pages.yml`。

- [ ] **Step 3: 等待 Actions 完成**

读取最新 `Deploy to GitHub Pages` 运行，确认 build 与 deploy 都为 `success`。

Expected: 最新提交对应的工作流结论为 `success`，没有重复或取消的第二份自定义工作流。

### Task 6: 线上验收

**URL:**
- Verify: `https://alibaba-cloud-design.github.io/vibe-designing-playbook/`

- [ ] **Step 1: 检查线上 HTML**

```bash
curl -sS -L https://alibaba-cloud-design.github.io/vibe-designing-playbook/ -o /tmp/vibe-designing-playbook.html
rg -n '/vibe-designing-playbook/assets/' /tmp/vibe-designing-playbook.html
if rg -n '/src/main\.tsx' /tmp/vibe-designing-playbook.html; then exit 1; fi
```

Expected: 页面引用构建后的 assets，且不再引用源码入口。

- [ ] **Step 2: 真实浏览器验收**

使用后台浏览器标签打开线上地址，确认 `#root` 有内容、正文可见，并检查资源请求没有 404；完成后关闭该标签。

Expected: 页面不再空白，主要内容成功渲染。
