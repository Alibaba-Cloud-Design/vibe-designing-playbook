import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/Sidebar";
import { GridOverlay } from "@/GridOverlay";
import { ReadingShell } from "@/ReadingShell";
import { Chapters } from "@/Chapters";
import { ScrollArticle } from "@/ScrollArticle";
import { ScrollLexicon } from "@/ScrollLexicon";
import { Footer } from "@/Footer";
import { useScrollReveal } from "@/useScrollReveal";
import { useSmoothScroll } from "@/useSmoothScroll";
import { useTitleReveal } from "@/useTitleReveal";
import { useScrollSpy } from "@/useScrollSpy";
import "./App.css";

const CURSOR_GLYPHS = "+>^*&x>-~>/=".split("");

function CoverCursor() {
  const [phase, setPhase] = useState<"underscore" | "scramble">("underscore");
  const [visible, setVisible] = useState(true);
  const [glyph, setGlyph] = useState("_");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("underscore");
      setVisible(true);
      setGlyph("_");
      return;
    }

    let blinkTimer = 0;
    let scrambleTimer = 0;
    let scrambleStartTimer = 0;
    let loopTimer = 0;

    const clearTimers = () => {
      window.clearInterval(blinkTimer);
      window.clearInterval(scrambleTimer);
      window.clearTimeout(scrambleStartTimer);
      window.clearTimeout(loopTimer);
      blinkTimer = 0;
      scrambleTimer = 0;
      scrambleStartTimer = 0;
      loopTimer = 0;
    };

    const startLoop = () => {
      setPhase("underscore");
      setVisible(true);
      setGlyph("_");

      blinkTimer = window.setInterval(() => {
        setVisible((current) => !current);
      }, 500);

      scrambleStartTimer = window.setTimeout(() => {
        window.clearInterval(blinkTimer);
        blinkTimer = 0;
        setPhase("scramble");
        setVisible(true);

        scrambleTimer = window.setInterval(() => {
          const index = Math.floor(CURSOR_GLYPHS.length * Math.random());
          setGlyph(CURSOR_GLYPHS[index] ?? "_");
        }, 33);

        loopTimer = window.setTimeout(() => {
          window.clearInterval(scrambleTimer);
          scrambleTimer = 0;
          startLoop();
        }, 1000);
      }, 5000);
    };

    startLoop();
    return clearTimers;
  }, []);

  return (
    <span
      className={`cf-blue ${phase === "underscore" && !visible ? "is-hidden" : ""}`}
      data-phase={phase}
      aria-hidden="true"
    >
      <span className="cf-blue-measure">_</span>
      {phase === "scramble" ? <span className="cf-blue-overlay">{glyph}</span> : null}
    </span>
  );
}

/**
 * 整站单页连续滚动 —— 封面 → 引言 → 三章 → 正文 → 词典,全程一条 scroll。
 * 不再有独立页切换;导航点击=滚动到对应板块,scroll-spy 高亮当前板块。
 */
export default function App() {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // 先建丝滑滚动容器,再挂逐块显现/标题揭开/scroll-spy(顺序保证与 ScrollTrigger 协同)
  useSmoothScroll(true);
  useScrollReveal(true);
  useTitleReveal(true);
  const active = useScrollSpy();

  // 导航点击 → 平滑滚动到对应板块(由 useScrollSpy 暴露的 scrollToSection 处理)
  const handleSelect = (id: string) => {
    window.dispatchEvent(new CustomEvent("nav-scroll-to", { detail: id }));
  };

  useEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage) return;
    const mq = window.matchMedia("(max-width:760px)");
    let coverIntroTimer = 0;
    const playCoverIntro = () => {
      stage.classList.remove("atr-enter");
      void stage.offsetWidth;
      coverIntroTimer = window.setTimeout(() => {
        stage.classList.add("atr-enter");
      }, 120);
    };
    const fit = () => {
      if (mq.matches) {
        stage.style.transform = "none";
        return;
      }
      stage.style.transform = `scale(${frame.clientWidth / 1600})`;
    };
    fit();
    playCoverIntro();
    window.addEventListener("resize", fit);
    window.addEventListener("pageshow", playCoverIntro);

    return () => {
      window.clearTimeout(coverIntroTimer);
      window.removeEventListener("resize", fit);
      window.removeEventListener("pageshow", playCoverIntro);
    };
  }, []);

  return (
    <>
    {/* 跳转链接:键盘/读屏用户跳过导航直达正文(视觉隐藏,聚焦时浮现) */}
    <a className="skip-link" href="#sec-intro">跳到正文</a>

    {/* 全局常驻侧栏（封面后显示）—— 放在 smooth-content 外,固定定位不被平滑变换影响 */}
    <Sidebar active={active} onSelect={handleSelect} />
    <GridOverlay />

    {/* ScrollSmoother 要求的结构：wrapper > content,丝滑惯性滚动在此容器内 */}
    <div id="smooth-wrapper">
    <div id="smooth-content">

    {/* 首屏：参考 ART+TECH Report 的蓝紫圆角线框结构，内容替换为白皮书 */}
    <div className="frame" ref={frameRef}>
      <div className="stage" ref={stageRef}>
        <div className="cover-card cover-fig">
          {/* 淡网格线（竖 28 / 621 / 1572 · 横 32 / 402 / 542 / 683 / 823） */}
          <div className="cf-grid" aria-hidden="true">
            <span className="cf-vline" style={{ left: 28 }} />
            <span className="cf-vline" style={{ left: 621 }} />
            <span className="cf-vline" style={{ left: 1572 }} />
            <span className="cf-hline" style={{ top: 32 }} />
            <span className="cf-hline" style={{ top: 402 }} />
            <span className="cf-hline" style={{ top: 542 }} />
            <span className="cf-hline" style={{ top: 683 }} />
            <span className="cf-hline" style={{ top: 823 }} />
          </div>

          {/* 左上角标 · serif「Not Design / But Future ■」 */}
          <div className="cf-cornermark" aria-label="Not Design But Future">
            <span>Not Design</span>
            <span>
              But Future
              <i className="cf-sq" />
            </span>
          </div>

          {/* mono 眉标 */}
          <p className="cf-year">2026</p>
          <p className="cf-tags">
            Engineering, Interaction,
            <br />
            And Evolution.
          </p>

          {/* 巨字标 · Vibe / Designing(斜体) / Playbook */}
          <div className="cf-wordmark" aria-label="Vibe Designing Playbook">
            <span className="cf-w cf-w-vibe">Vibe</span>
            <span className="cf-w cf-w-designing">Designing</span>
            <span className="cf-w cf-w-playbook">Playbook</span>
          </div>

          {/* 靛蓝小色块（Playbook 后，Figma 209:56） */}
          <CoverCursor />
        </div>
      </div>
    </div>

    {/* 二屏 · 目录：Content 标题 + 卡片阵列(2026-07 决议:英文引言撤,标题接替) */}
    <Chapters />

    {/* 三屏 · 书介绍：引言正文（左标题·右正文） */}
    <ReadingShell />

    {/* 第四屏起：连续滚动长文（接在三章下面，一路往下滚出正文） */}
    <ScrollArticle />

    {/* 最后一屏：设计提示词词典（折进连续滚动，保留搜索） */}
    <ScrollLexicon />

    {/* 收尾：巨型近隐形字标页脚（P10） */}
    <Footer />

    </div>{/* #smooth-content */}
    </div>{/* #smooth-wrapper */}
    </>
  );
}
