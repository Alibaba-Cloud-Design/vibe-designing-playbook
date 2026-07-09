import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const htmlPath = path.resolve(repoRoot, "../Genreport/for风哥/data-agent_v2_public.html");
const outPublic = path.resolve(__dirname, "../public/figures/fig-2-12-genreport.gif");
const outAsset = path.resolve(repoRoot, "assets/图2-12 GenReport.gif");
const frameDir = path.resolve(__dirname, "../.tmp/genreport-frames");

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const width = 1280;
const height = 720;
const fps = 8;
const frameDelay = 1000 / fps;

fs.rmSync(frameDir, { recursive: true, force: true });
fs.mkdirSync(frameDir, { recursive: true });
fs.mkdirSync(path.dirname(outPublic), { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--disable-web-security", "--allow-file-access-from-files"],
});
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
});

await page.goto(`file://${htmlPath}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2200);
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  document.body.style.scrollBehavior = "auto";
});

const frames = [];
async function snap(repeat = 1) {
  const png = await page.screenshot({ type: "png" });
  for (let i = 0; i < repeat; i += 1) frames.push(png);
}

async function tweenScroll(to, steps = 12, hold = 2) {
  const from = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const ease = 1 - Math.pow(1 - t, 3);
    const y = from + (to - from) * ease;
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await page.waitForTimeout(frameDelay);
    await snap();
  }
  if (hold) await snap(hold);
}

async function scrollToSelector(selector, offset = 96, steps = 14) {
  const y = await page.$eval(selector, (el, topOffset) => {
    const rect = el.getBoundingClientRect();
    return window.scrollY + rect.top - topOffset;
  }, offset);
  await tweenScroll(Math.max(0, y), steps, 2);
}

async function hoverCenter(selector, repeat = 8, dx = 0, dy = 0) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 8 });
  await page.waitForTimeout(160);
  await snap(repeat);
}

await page.evaluate(() => window.scrollTo(0, 0));
await snap(3);

// 1. Hover metric card.
await hoverCenter(".metric-card", 7);

// 2. Scroll down to the first chart group.
await scrollToSelector("#chart-industry-sales", 118, 14);

// 3. Hover chart and show tooltip.
const chartBox = await page.locator("#chart-industry-sales").boundingBox();
if (chartBox) {
  await page.mouse.move(chartBox.x + chartBox.width * 0.68, chartBox.y + chartBox.height * 0.34, { steps: 12 });
  await page.waitForTimeout(260);
  await snap(8);
}

// 4. Hold the tooltip in focus while slightly moving inside the chart.
if (chartBox) {
  for (const [px, py] of [[0.66, 0.36], [0.70, 0.34], [0.68, 0.32]]) {
    await page.mouse.move(chartBox.x + chartBox.width * px, chartBox.y + chartBox.height * py, { steps: 8 });
    await page.waitForTimeout(120);
    await snap(2);
  }
}

// 5. Continue to the complete-report ending area.
await scrollToSelector(".summary-grid", 88, 18);
await snap(4);
await scrollToSelector(".report-footer", 420, 10);
await snap(6);

await browser.close();

const gif = GIFEncoder();
for (const pngBuffer of frames) {
  const png = PNG.sync.read(pngBuffer);
  const rgba = new Uint8ClampedArray(png.data.buffer, png.data.byteOffset, png.data.byteLength);
  const palette = quantize(rgba, 256);
  const index = applyPalette(rgba, palette);
  gif.writeFrame(index, png.width, png.height, { palette, delay: frameDelay });
}
gif.finish();
const bytes = Buffer.from(gif.bytesView());
fs.writeFileSync(outPublic, bytes);
fs.writeFileSync(outAsset, bytes);

console.log(JSON.stringify({
  frames: frames.length,
  output: outPublic,
  asset: outAsset,
  size: bytes.length,
}, null, 2));
