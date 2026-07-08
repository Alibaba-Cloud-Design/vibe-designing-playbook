# Vibe Designing Playbook

阿里云设计中心出品的 vibe designing 白皮书站点。

**在线阅读**：https://alibaba-cloud-design.github.io/vibe-designing-playbook/

## 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
```

## 构建

```bash
npm run build      # 产物在 dist/
```

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages（见 `.github/workflows/deploy.yml`）。

## 技术

React 19 · Vite · GSAP (ScrollSmoother / ScrollTrigger) · Tailwind CSS

作者：ZhuYan · Ailin Yu · Zehui Jin
