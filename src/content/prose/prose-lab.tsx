import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import {
  Prose, P, Code, Dim, H2, H3, DualHead, SectionRule,
  Ul, Li, Ol, OLi, Table, CodeBlock, Quote, Figure, SpecList,
} from "./Prose";
import { Illustration } from "../Illustrations";
import { Signature } from "../signature/Signature";

/** 单个组件演示槽:mono 编号分节头 + data-shot(供逐组件截图) */
function Demo({ id, label, no, children }: { id: string; label: string; no: string; children: ReactNode }) {
  return (
    <div data-shot={id} style={{ marginBottom: 8 }}>
      <SectionRule label={label} no={no} />
      {children}
    </div>
  );
}

/** Prose 组件预览页 —— v2-dark 软深色技术文档骨架,逐组件核对 unmoth / x.com / polar 还原度 */
function Lab() {
  return (
    <Prose>
      {/* 页眉:同尺寸双色头 */}
      <DualHead
        kicker="Prose Kit / v2-dark"
        label="富文本组件库"
        title="软深色 · 技术文档骨架"
      />
      <P>
        全套 <Code>.pr-*</Code> 组件从 poolside 暖白翻到软深色,承载
        <strong>发丝线主分隔、亮度分层、靛蓝唯一强调</strong>的技术文档母题——
        <Dim>与真实手稿 ScrollArticle 共用同一套类。</Dim>
      </P>

      {/* ① 段落 + inline code + 强调 */}
      <Demo id="text" label="Paragraph · Inline" no="001">
        <P>
          让 AI 稳定产出符合规范的界面,第一步不是写更好的 prompt,而是换一个看待它的方式:
          把从 prompt 到页面的过程,看成一条可以逐段介入的链路。每个环节都由一份具体的能力接管——
          规划由 <Code>spec.md</Code> 接管,搭骨架由 <Code>design.md</Code> 接管。
        </P>
        <P>
          所有视觉值都走 <em>var(--*)</em> 引用,禁止字面量:代码里不允许出现
          <em>#fff</em>、<em>13px</em>、<em>200ms</em>,状态变体按公式从基础值派生。
        </P>
      </Demo>

      {/* ② 同尺寸双色头 */}
      <Demo id="dualhead" label="Dual-color Head" no="002">
        <DualHead label="链路上的每个环节" title="都是一个可注入能力的接口" />
      </Demo>

      {/* ③ 标题阶梯 */}
      <Demo id="headings" label="Headings" no="003">
        <H2>设计声明:什么样的设计是好的</H2>
        <P>它本身不生产任何界面,它定义的是,什么样的界面才算数。我们把它拆成五份,每份管一个层面的「好」。</P>
        <H3>spec —— 交互逻辑成不成立</H3>
        <P>spec 是一份交互设计规格,定义这个功能在交互层面该怎么成立:为谁做、解决什么、什么算验收通过。</P>
      </Demo>

      {/* ④ 无序 + mono 编号列表 */}
      <Demo id="lists" label="Lists · Bullet & Numbered" no="004">
        <Ul>
          <Li>规划环节可以塞进「这个功能该怎么定义、该覆盖哪些状态」。</Li>
          <Li>搭骨架环节可以塞进「该用什么布局、什么密度」。</Li>
          <Li>填充环节可以塞进「能用哪些组件、易混的怎么选」。</Li>
        </Ul>
        <Ol>
          <OLi>先决定主题:通用 cloudai 还是 data-agent。</OLi>
          <OLi>命中场景,再做布局级决策——这一步错,整个页面骨架都会走偏。</OLi>
          <OLi>选具体组件,报告决策,等确认再动手。</OLi>
        </Ol>
      </Demo>

      {/* ⑤ 发丝线表 */}
      <Demo id="table" label="Hairline Table" no="005">
        <Table
          head={["环节", "接管它的能力", "它在这一步约束什么"]}
          rows={[
            ["规划", <><em>spec.md</em>(交互设计规格)</>, "功能为谁做、覆盖哪些状态、什么算验收"],
            ["搭骨架", <><em>design.md</em>(视觉契约,含 token)</>, "布局、密度、颜色、间距怎么取值"],
            ["填充", <><em>components</em>(组件注册表)</>, "能用哪些组件、易混的怎么选"],
            ["评估", <><em>Evaluator</em>(评估器)</>, "按维度对照标准打分,决定达标还是回流"],
          ]}
        />
      </Demo>

      {/* ⑥ label→value 规格行(复用 §2.7 插画系统词汇) */}
      <Demo id="specs" label="Spec Rows · label → value" no="006">
        <SpecList
          specs={[
            { label: "载体", value: <>静态屏 <em>SVG 单帧</em> / 动效循环 <em>canvas 2D + rAF</em></> },
            { label: "触达半径", value: <><em>0.32 × 画框</em>,中心构图 + 放射对称</> },
            { label: "线", value: <>纯白 stroke、线宽 <em>1.5–2px</em>、平头端点、<em>fill:none</em></> },
            { label: "旋转", value: <><em>0.15–0.25 rad/s</em>(务必慢,一圈 25–42s)</> },
          ]}
        />
      </Demo>

      {/* ⑦ 代码块 */}
      <Demo id="code" label="Code Block" no="007">
        <CodeBlock>{`L1 定位与意图   一句话定义、目标用户、场景清单,以及「非目标」
L2 信息架构     空间区域怎么划分,内容按什么规则生长
L3 核心链路     走通这个功能要经过哪些状态,状态怎么流转
L4 组件功能细节 每个组件具体怎么表现
L5 边界条件     空、加载、错误、缺权限怎么办
L6 验收标准     满足哪些条件才算做对了`}</CodeBlock>
      </Demo>

      {/* ⑧ 引用 / 旁注 */}
      <Demo id="quote" label="Quote · Aside" no="008">
        <Quote>
          <strong>本节有意留到后面展开的部分:</strong>
          Evaluator 在这里只作为链路的一个环节出现,它如何构建见 3.3;
          token 注入与 critique 回流也只说明它们在链路上的位置。
        </Quote>
      </Demo>

      {/* ⑨ 蓝图图版:SVG 手稿插画 + 蓝图图注 */}
      <Demo id="figure-svg" label="Blueprint Figure · SVG" no="009">
        <Figure no="图 1" caption="Design I/O —— 设计能力是 Input,符合规范的产物是 Output">
          <Illustration kind="designio" />
        </Figure>
      </Demo>

      {/* ⑩ 复用 §2.7 章节签名插画系统作图注(canvas 动效) */}
      <Demo id="figure-signature" label="Blueprint Figure · §2.7 Signature" no="010">
        <Figure no="图 2" caption="设计工程 —— 同心环由内向外逐层描边,精密分层搭建">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Signature variant="engineering" size={300} />
          </div>
        </Figure>
      </Demo>
    </Prose>
  );
}

createRoot(document.getElementById("root")!).render(<Lab />);
