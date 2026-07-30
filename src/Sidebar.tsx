import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PLAYBOOK_CHAPTERS } from "./content/generated/playbook";
import "./Sidebar.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * 全局常驻侧栏导航 —— 封面屏之后固定显示，整个阅读体验里一直在。
 * 目录按 playbook 仓库 TOC.md（三章版）。
 * 顶层条目显示英文(2026-07 决议,仅导航显示层映射,正文仍中文)。
 */
const NAV_EN: Record<string, string> = {
  ch1: "Design Engineering",
  ch2: "Dynamic Interaction",
  ch3: "Self-Evolution",
};
const TOC = [
  { id: "intro", no: "", title: "Introduction", children: [] },
  ...PLAYBOOK_CHAPTERS.map((chapter) => ({
    id: chapter.id,
    no: chapter.navNo,
    title: NAV_EN[chapter.id] ?? chapter.title,
    children: chapter.sections.map((section) => ({ id: section.id, title: section.title })),
  })),
  { id: "outro", no: "", title: "Closing", children: [] },
  { id: "appendix", no: "", title: "Lexicon", children: [] },
];

const THEMES = [
  { id: "auto", label: "跟随系统" },
  { id: "light", label: "亮色" },
  { id: "dark", label: "暗色" },
] as const;

type ThemeMode = (typeof THEMES)[number]["id"];

function readTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("playbook-theme");
  // 默认亮色（与现有默认外观一致）；dark token 块已补齐，若默认 dark 会连带翻黑全站
  return THEMES.some((item) => item.id === saved) ? (saved as ThemeMode) : "light";
}

const SCRAMBLE_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+-?";
const SCRAMBLE_FRAMES = 30;
const SCRAMBLE_FRAME_MS = 22;

type ScrambleGlyph = { value: string; scrambled: boolean };

function originalGlyphs(title: string): ScrambleGlyph[] {
  return Array.from(title, (value) => ({ value, scrambled: false }));
}

function scrambleGlyphs(title: string, frame: number): ScrambleGlyph[] {
  const characters = Array.from(title);
  const count = characters.filter((character) => character !== " ").length;
  const restoredCount = Math.floor((Math.min(frame, SCRAMBLE_FRAMES) / SCRAMBLE_FRAMES) * count);
  let characterIndex = 0;

  return characters.map((character) => {
    if (character === " ") return { value: character, scrambled: false };

    const restored = characterIndex < restoredCount;
    characterIndex += 1;
    return {
      value: restored
        ? character
        : SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)],
      scrambled: !restored,
    };
  });
}

function PrimaryNavButton({
  title,
  isActive,
  onClick,
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [glyphs, setGlyphs] = useState(() => originalGlyphs(title));
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startScramble = useCallback(() => {
    clearTimer();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGlyphs(originalGlyphs(title));
      return;
    }

    let frame = 0;
    setGlyphs(scrambleGlyphs(title, frame));
    timerRef.current = window.setInterval(() => {
      frame += 1;
      setGlyphs(frame >= SCRAMBLE_FRAMES ? originalGlyphs(title) : scrambleGlyphs(title, frame));
      if (frame >= SCRAMBLE_FRAMES) clearTimer();
    }, SCRAMBLE_FRAME_MS);
  }, [clearTimer, title]);

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <button
      className={"sb-item sb-chapter" + (isActive ? " is-active" : "")}
      onClick={onClick}
      onMouseEnter={startScramble}
      onFocus={startScramble}
    >
      <span className="sb-scramble" aria-label={title}>
        {glyphs.map((glyph, index) => (
          <span
            key={index}
            className={"sb-scramble-char" + (glyph.scrambled ? " is-scrambled" : "")}
            aria-hidden="true"
          >
            {glyph.value}
          </span>
        ))}
      </span>
    </button>
  );
}

export function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(readTheme);

  // 导航要等首屏完全滚出后再出现，避免和封面尾部的小字叠在一起。
  useEffect(() => {
    let raf = 0;
    const updateVisibility = () => {
      const frame = document.querySelector(".frame");
      const rs = document.querySelector(".rs");
      setVisible(
        frame
          ? window.scrollY >= frame.getBoundingClientRect().height + 32
          : rs
            ? rs.getBoundingClientRect().top <= 0
          : window.scrollY > window.innerHeight * 2
      );
    };
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    ScrollTrigger.addEventListener("scrollEnd", updateVisibility);
    ScrollTrigger.addEventListener("refresh", updateVisibility);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      ScrollTrigger.removeEventListener("scrollEnd", updateVisibility);
      ScrollTrigger.removeEventListener("refresh", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const apply = () => {
      const mode =
        theme === "auto"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          : theme;
      document.documentElement.dataset.theme = mode;
    };
    apply();
    document.documentElement.removeAttribute("data-lightness");
    window.localStorage.setItem("playbook-theme", theme);
    // auto：跟随系统实时切换
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (theme === "auto") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  /* 三格主题切换(桌面侧栏与移动顶栏共用同一份状态与标记) */
  const themeSwitch = (
    <div className="sb-theme-switch" role="radiogroup" aria-label="主题模式">
      {THEMES.map((item) => {
        const Icon = item.id === "auto" ? Monitor : item.id === "light" ? Sun : Moon;
        return (
          <button
            key={item.id}
            className={"sb-theme-btn" + (theme === item.id ? " is-active" : "")}
            type="button"
            role="radio"
            aria-checked={theme === item.id}
            aria-label={item.label}
            onClick={() => setTheme(item.id)}
          >
            <Icon aria-hidden="true" size={14} strokeWidth={1.33} />
          </button>
        );
      })}
    </div>
  );

  return (
    <>
    <aside className={"sb" + (visible ? " is-visible" : "")}>
      <div className="sb-brand">
        <span className="sb-brand-name">PLAYBOOK</span>
      </div>
      <nav className="sb-toc">
        {TOC.map((ch) => (
          <div key={ch.id} className={"sb-group" + (ch.children.length ? " has-children" : "")}>
            <PrimaryNavButton
              title={ch.title}
              // 父章高亮:自身命中,或它的某个子节正被 scroll-spy 选中
              isActive={active === ch.id || ch.children.some((c) => c.id === active)}
              onClick={() => onSelect(ch.id)}
            />
            {ch.children.length > 0 && (
              <div className="sb-children">
                {ch.children.map((c) => (
                  <button
                    key={c.id}
                    className={"sb-item sb-sub" + (active === c.id ? " is-active" : "")}
                    onClick={() => onSelect(c.id)}
                  >
                    <span className="sb-subno">{c.id}</span>
                    <span className="sb-title">{c.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      {themeSwitch}
    </aside>

    {/* 移动端顶栏(≤860,替代左侧栏)：品牌 + 章节横滑条 + 主题切换,复用同一份状态 */}
    <div className={"sbm" + (visible ? " is-visible" : "")}>
      <span className="sbm-brand">PLAYBOOK</span>
      <nav className="sbm-strip" aria-label="章节导航">
        {TOC.map((ch) => (
          <button
            key={ch.id}
            className={
              "sbm-item" +
              ((active === ch.id || ch.children.some((c) => c.id === active)) ? " is-active" : "")
            }
            onClick={() => onSelect(ch.id)}
          >
            {ch.title}
          </button>
        ))}
      </nav>
      {themeSwitch}
    </div>
    </>
  );
}
