import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
