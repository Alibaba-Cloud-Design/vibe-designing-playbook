import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexCss = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
const articleCss = readFileSync(
  new URL("../src/content/Article.css", import.meta.url),
  "utf8",
);
const accentConsumerSources = [
  "../src/index.css",
  "../src/Sidebar.css",
  "../src/App.css",
  "../src/IntroOverlay.tsx",
  "../src/content/prose/prose-tokens.css",
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));

function countPattern(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test("uses the approved light and dark accent values", () => {
  assert.equal(countPattern(indexCss, /--accent:\s*#3D77F3;/g), 2);
  assert.equal(countPattern(indexCss, /--accent:\s*#6A99FF;/g), 1);
  assert.equal(
    countPattern(indexCss, /--accent-bright:\s*var\(--accent\);/g),
    3,
  );
  assert.equal(countPattern(indexCss, /--la-accent:\s*var\(--accent\);/g), 3);
  assert.equal(countPattern(indexCss, /--accent-ink:\s*#08090A;/g), 3);
  assert.equal(countPattern(indexCss, /--la-accent-ink:\s*#08090A;/g), 3);
});

test("derives deep and soft accents from the active theme color", () => {
  assert.equal(
    countPattern(
      indexCss,
      /--accent-deep:\s*color-mix\(in srgb,\s*var\(--accent\),\s*#08090A 42%\);/g,
    ),
    3,
  );
  assert.equal(
    countPattern(
      indexCss,
      /--accent-soft:\s*color-mix\(in srgb,\s*var\(--accent\),\s*transparent 88%\);/g,
    ),
    2,
  );
  assert.equal(
    countPattern(
      indexCss,
      /--accent-soft:\s*color-mix\(in srgb,\s*var\(--accent\),\s*transparent 86%\);/g,
    ),
    1,
  );
});

test("removes previous purple and cyan primary accents", () => {
  for (const oldValue of [
    "#34429E",
    "#4E5DB8",
    "#20285F",
    "#4339FF",
    "#4337FF",
    "#685CFF",
    "#2A22B0",
    "color(display-p3 0.6745 0.8842 0.9367)",
  ]) {
    assert.equal(
      accentConsumerSources.some((source) => source.includes(oldValue)),
      false,
      oldValue,
    );
  }
});

test("uses theme tokens for selection and accent-backed text", () => {
  assert.match(indexCss, /::selection\s*\{[^}]*background:\s*var\(--la-accent\);/s);
  assert.match(indexCss, /::selection\s*\{[^}]*color:\s*var\(--la-accent-ink\);/s);
  assert.match(
    articleCss,
    /\.ar-toc-item:hover\s+\.ar-toc-title\s*\{[^}]*color:\s*var\(--accent-ink\);/s,
  );
});

test("keeps the independent hand-drawn dot token", () => {
  assert.equal(countPattern(indexCss, /--fp-dot:\s*#80EBFF;/g), 3);
});

test("routes sidebar emphasis through the shared theme tokens", () => {
  const sidebarCss = accentConsumerSources[1];
  assert.match(sidebarCss, /--sb-highlight-bg:\s*var\(--la-accent\);/);
  assert.match(sidebarCss, /--sb-highlight-ink:\s*var\(--la-accent-ink\);/);
  assert.doesNotMatch(sidebarCss, /:root\[data-theme="light"\]\s+\.sb/);
});

test("routes the cover cursor fill and glow through the theme accent", () => {
  const appCss = accentConsumerSources[2];
  assert.match(
    appCss,
    /\.cf-blue-measure,\s*\.cf-blue-overlay\s*\{[^}]*background:\s*var\(--accent-bright\);/s,
  );
  assert.match(
    appCss,
    /\.cf-blue-measure,\s*\.cf-blue-overlay\s*\{[^}]*filter:\s*drop-shadow\([^)]*var\(--accent-bright\)/s,
  );

  for (const oldValue of ["#b266ff", "#c62afb", "#7a5ef4", "#2996ff"]) {
    assert.equal(appCss.toLowerCase().includes(oldValue), false, oldValue);
  }
});
