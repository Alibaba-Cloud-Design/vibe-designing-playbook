import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 全部字体本地打包(2026-07 决议:替代 Google Fonts 外链;国内/离线环境渲染一致,标题不再回退系统宋体)
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/500.css'
import '@fontsource/noto-serif-sc/600.css'
import '@fontsource/noto-sans-sc/300.css'
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-sans-sc/700.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/hanken-grotesk/300.css'
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/500.css'
import '@fontsource/figtree/600.css'
import '@fontsource/chivo-mono/400.css'
import './index.css'
import App from './App.tsx'
import { SignatureGallery } from '@/content/signature/Gallery'
import { TopArtGallery } from '@/content/signature/TopArtGallery'

const savedTheme = window.localStorage.getItem('playbook-theme')
document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark'

// 自检路由（不干扰主站单页滚动）：
//   #signatures → 章节签名插画系统；#topart → 抽象几何顶图族
const hash = window.location.hash

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {hash === '#signatures' ? <SignatureGallery />
      : hash === '#topart' ? <TopArtGallery />
      : <App />}
  </StrictMode>,
)
