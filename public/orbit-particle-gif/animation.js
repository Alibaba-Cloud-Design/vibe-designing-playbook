import { frameAt } from "./timeline.js";

const canvas = document.querySelector("#orbit");
const context = canvas.getContext("2d", { alpha: false });
const atlas = new Image();
const frameSize = 600;
const columns = 10;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let startTime = performance.now();
let lastFrame = -1;

function draw(frameIndex) {
  const sourceX = (frameIndex % columns) * frameSize;
  const sourceY = Math.floor(frameIndex / columns) * frameSize;
  context.drawImage(
    atlas,
    sourceX,
    sourceY,
    frameSize,
    frameSize,
    0,
    0,
    frameSize,
    frameSize,
  );
  lastFrame = frameIndex;
}

function tick(now) {
  const frameIndex = reduceMotion.matches ? 0 : frameAt(now - startTime);
  if (frameIndex !== lastFrame) draw(frameIndex);
  requestAnimationFrame(tick);
}

function restart() {
  startTime = performance.now();
  lastFrame = -1;
}

reduceMotion.addEventListener("change", restart);
atlas.addEventListener("load", () => requestAnimationFrame(tick));
atlas.src = "./star-ten-points-atlas.png";
