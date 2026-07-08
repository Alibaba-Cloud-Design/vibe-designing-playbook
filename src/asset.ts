/**
 * 子路径部署兼容(GitHub Pages 等)：
 * 手稿/配置里的资源路径写作绝对形式("/gifs/x.gif")，本地开发时 base="/" 原样可用；
 * 部署到 https://<org>.github.io/<repo>/ 时 Vite base 变为 "/<repo>/"，
 * 由本函数在消费点统一拼接，数据层不必感知部署环境。
 */
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, "");
