import { useEffect, useRef } from "react";
import "./CubeChain.css";

type CubeChainProps = {
  className?: string;
  background?: string;
  duration?: number;
  fit?: "cover" | "contain";
};

const FRAME_SIZE = 1000;
const FRAME_COUNT = 300;
const FRAME_FPS = 60;
const ATLAS_COLUMNS = 5;
const FRAMES_PER_ATLAS = 20;
const ATLAS_COUNT = Math.ceil(FRAME_COUNT / FRAMES_PER_ATLAS);
const DEFAULT_DURATION = FRAME_COUNT / FRAME_FPS;
const PREFETCH_AHEAD = 3;
const KEEP_BEHIND = 1;
const KEEP_AHEAD = 4;
const ATLAS_VERSION = "1000-small-v1";
const MAX_CANVAS_PIXELS = 1_400_000;
const DRAW_INTERVAL = 1000 / 30;
const atlasUrl = (index: number) => `/animations/cube-atlas-${index}.png?v=${ATLAS_VERSION}`;
type AtlasImage = ImageBitmap | HTMLImageElement;

function isTransparent(color: string) {
  return color === "transparent" || color === "rgba(0,0,0,0)" || color === "rgba(0, 0, 0, 0)";
}

function closeAtlas(image: AtlasImage) {
  if ("close" in image) image.close();
}

async function loadAtlas(src: string): Promise<AtlasImage> {
  if ("createImageBitmap" in window) {
    const response = await fetch(src);
    if (!response.ok) throw new Error(`Failed to load ${src}`);
    return createImageBitmap(await response.blob());
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      void image
        .decode()
        .catch(() => undefined)
        .then(() => resolve(image));
    };
    image.onerror = reject;
    image.src = src;
  });
}

export function CubeChain({
  className,
  background = "#FBFAF6",
  duration = DEFAULT_DURATION,
  fit = "cover",
}: CubeChainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let cancelled = false;
    let renderMotionChange: (() => void) | undefined;
    let isCanvasVisible = true;
    let lastDraw = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atlasCache = new Map<number, AtlasImage>();
    const atlasRequests = new Map<number, Promise<AtlasImage>>();
    let activeAtlasIndex = 0;
    let canvasMetrics = {
      height: 1,
      placementSize: 1,
      placementX: 0,
      placementY: 0,
      width: 1,
    };

    const normalizeAtlasIndex = (index: number) => (index + ATLAS_COUNT) % ATLAS_COUNT;

    const shouldKeepAtlas = (cachedIndex: number, centerIndex: number) => {
      const ahead = (cachedIndex - centerIndex + ATLAS_COUNT) % ATLAS_COUNT;
      const behind = (centerIndex - cachedIndex + ATLAS_COUNT) % ATLAS_COUNT;
      return ahead <= KEEP_AHEAD || behind <= KEEP_BEHIND;
    };

    const pruneAtlasCache = (centerIndex: number) => {
      for (const [cachedIndex, image] of atlasCache) {
        if (!shouldKeepAtlas(cachedIndex, centerIndex)) {
          closeAtlas(image);
          atlasCache.delete(cachedIndex);
        }
      }
    };

    const syncCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const nativeDpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssPixels = Math.max(1, rect.width * rect.height);
      const cappedDpr = Math.sqrt(MAX_CANVAS_PIXELS / cssPixels);
      const dpr = Math.max(1, Math.min(nativeDpr, cappedDpr));
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const cssScale =
        fit === "contain"
          ? Math.min(rect.width / FRAME_SIZE, rect.height / FRAME_SIZE)
          : Math.max(rect.width / FRAME_SIZE, rect.height / FRAME_SIZE);
      const placementSize = FRAME_SIZE * cssScale * dpr;
      canvasMetrics = {
        height,
        placementSize,
        placementX: (width - placementSize) / 2,
        placementY: (height - placementSize) / 2,
        width,
      };
    };

    const requestAtlas = (index: number) => {
      const normalizedIndex = normalizeAtlasIndex(index);
      const cached = atlasCache.get(normalizedIndex);
      if (cached) return Promise.resolve(cached);

      const pending = atlasRequests.get(normalizedIndex);
      if (pending) return pending;

      const request = loadAtlas(atlasUrl(normalizedIndex)).then((image) => {
        atlasRequests.delete(normalizedIndex);
        if (cancelled) {
          closeAtlas(image);
          return image;
        }

        atlasCache.set(normalizedIndex, image);
        pruneAtlasCache(activeAtlasIndex);
        return image;
      });
      atlasRequests.set(normalizedIndex, request);
      return request;
    };

    const queueAtlases = (atlasIndex: number) => {
      for (let offset = 0; offset <= PREFETCH_AHEAD; offset += 1) {
        void requestAtlas(atlasIndex + offset);
      }
    };

    const draw = (frameIndex: number) => {
      const atlasIndex = Math.floor(frameIndex / FRAMES_PER_ATLAS);
      activeAtlasIndex = atlasIndex;
      queueAtlases(atlasIndex);
      pruneAtlasCache(atlasIndex);

      const atlas = atlasCache.get(atlasIndex);
      if (!atlas) {
        return;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (isTransparent(background)) {
        ctx.clearRect(0, 0, canvasMetrics.width, canvasMetrics.height);
      } else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvasMetrics.width, canvasMetrics.height);
      }

      const localFrameIndex = frameIndex % FRAMES_PER_ATLAS;
      const sx = (localFrameIndex % ATLAS_COLUMNS) * FRAME_SIZE;
      const sy = Math.floor(localFrameIndex / ATLAS_COLUMNS) * FRAME_SIZE;

      ctx.drawImage(
        atlas,
        sx,
        sy,
        FRAME_SIZE,
        FRAME_SIZE,
        canvasMetrics.placementX,
        canvasMetrics.placementY,
        canvasMetrics.placementSize,
        canvasMetrics.placementSize,
      );
    };

    syncCanvasSize();

    Promise.all(Array.from({ length: PREFETCH_AHEAD + 1 }, (_, index) => requestAtlas(index))).then(() => {
      if (cancelled) return;

      const frameDuration = Math.max(0.001, duration) * 1000;
      const start = performance.now();

      const tick = (now: number) => {
        if (isCanvasVisible && now - lastDraw >= DRAW_INTERVAL) {
          const progress = ((now - start) % frameDuration) / frameDuration;
          const frameIndex = Math.floor(progress * FRAME_COUNT) % FRAME_COUNT;
          draw(frameIndex);
          lastDraw = now;
        }
        frameId = window.requestAnimationFrame(tick);
      };

      const render = () => {
        window.cancelAnimationFrame(frameId);
        syncCanvasSize();
        draw(0);
        lastDraw = performance.now();
        if (motionQuery.matches) {
          return;
        } else {
          frameId = window.requestAnimationFrame(tick);
        }
      };
      renderMotionChange = render;

      resizeObserver = new ResizeObserver(render);
      resizeObserver.observe(canvas);
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isCanvasVisible = Boolean(entry?.isIntersecting);
        },
        { rootMargin: "160px" },
      );
      intersectionObserver.observe(canvas);
      motionQuery.addEventListener("change", render);
      render();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      for (const image of atlasCache.values()) closeAtlas(image);
      atlasCache.clear();
      if (renderMotionChange) motionQuery.removeEventListener("change", renderMotionChange);
    };
  }, [background, duration, fit]);

  return (
    <div className={["cc-wrap", className].filter(Boolean).join(" ")} aria-hidden>
      <canvas className="cc-canvas" ref={canvasRef} />
    </div>
  );
}
