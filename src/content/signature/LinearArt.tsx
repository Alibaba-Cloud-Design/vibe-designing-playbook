/**
 * LinearArt —— 目录卡 SVG 插画族（提取 Linear/X 蓝图语言，构图原创、语义换成我们的）。
 *
 * 家族规格（全族一致，"像一套图形"）：
 *   · 线宽：全部 1px + vector-effect:non-scaling-stroke —— 任意缩放下都是精确 1px 发丝线
 *   · 明度四档（token 化，亮暗主题自动翻转）：
 *       --la-line 主线 / --la-soft 弱线·虚线 / --la-node 实心节点 / --la-bright 亮点
 *   · 遮挡语言：图形叠到另一图形后面的弧段画虚线（Linear 原作的空间提示）
 *   · mono 小标签、虚点网格底、帧框、方向小箭头 —— 仪器叙事词汇
 *   · 五张：设计工程=三圆滚线(推进) / 动态交互=INTENT→FORM 网络 /
 *          自我进化=相切圆链(X hero 式,宽幅) / 结语=点阵显影(帧框+坐标) / 词典=词条行+垂线束
 */

const NS = { vectorEffect: "non-scaling-stroke" } as const;

/* 方向小箭头（沿圆周/轴线的三角标）—— 全族重点色(亮=蓝/暗=青绿) */
function Arrow({ x, y, a = 0, s = 5 }: { x: number; y: number; a?: number; s?: number }) {
  return (
    <path
      d={`M ${-s} ${-s * 0.62} L ${s * 0.9} 0 L ${-s} ${s * 0.62} Z`}
      transform={`translate(${x} ${y}) rotate(${a})`}
      fill="var(--la-accent)"
      stroke="none"
    />
  );
}

/* 圆弧采样成 polyline 点串（避开 SVG A 指令的 flag 歧义） */
const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 48) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

/* 圆 A 被圆 B 遮住的弧段角度区间 [入, 出]（A 上朝向 B 的那段） */
function hiddenArc(
  ax: number, ay: number, ra: number,
  bx: number, by: number, rb: number,
): [number, number] {
  const dx = bx - ax, dy = by - ay;
  const d = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  const alpha = Math.acos((d * d + ra * ra - rb * rb) / (2 * d * ra));
  return [base - alpha, base + alpha];
}

/* 带遮挡的圆：被 occluder 挡住的弧段虚线，其余实线 */
function OccludedCircle({ c, o }: { c: [number, number, number]; o: [number, number, number] }) {
  const [h0, h1] = hiddenArc(c[0], c[1], c[2], o[0], o[1], o[2]);
  return (
    <>
      <polyline
        points={arcPts(c[0], c[1], c[2], h1, h0 + Math.PI * 2)}
        fill="none" stroke="var(--la-line)" strokeWidth={1} {...NS}
      />
      <polyline
        points={arcPts(c[0], c[1], c[2], h0, h1, 24)}
        fill="none" stroke="var(--la-soft)" strokeWidth={1} strokeDasharray="3 5" {...NS}
      />
    </>
  );
}

/* ============ 01 设计工程 · 三圆滚线(链路上的推进) ============ */
export function ArtEngineering() {
  // 基线 y=340；圆1(小)/圆3(中)与大圆相交,被挡弧段虚线 —— 参考的核心空间语言
  const c1: [number, number, number] = [124, 278, 62];
  const c2: [number, number, number] = [278, 222, 118];
  const c3: [number, number, number] = [424, 294, 46];
  return (
    <svg className="lart" viewBox="0 0 500 430" aria-hidden="true">
      {/* 基线（起点圆点 → 终点小箭头）—— 起点重点色 */}
      <circle cx={40} cy={340} r={3.2} fill="var(--la-accent)" />
      <line x1={48} y1={340} x2={462} y2={340} stroke="var(--la-line)" strokeWidth={1} {...NS} />
      <Arrow x={462} y={340} a={0} s={4.5} />
      {/* 大圆在前(整圆实线)；小/中圆被它遮住的弧段自动转虚线 */}
      <OccludedCircle c={c1} o={c2} />
      <circle cx={c2[0]} cy={c2[1]} r={c2[2]} fill="none" stroke="var(--la-line)" strokeWidth={1} {...NS} />
      <OccludedCircle c={c3} o={c2} />
      {/* 圆顶方向箭头(滚动方向) */}
      <Arrow x={124} y={216} a={12} />
      <Arrow x={278} y={104} a={10} />
      <Arrow x={424} y={248} a={14} s={4} />
      {/* 基线上的接触小箭头 */}
      <Arrow x={186} y={340} a={0} s={3.6} />
      <Arrow x={396} y={340} a={0} s={3.6} />
    </svg>
  );
}

/* ============ 02 动态交互 · INTENT → FORM 网络 ============ */
export function ArtInteraction() {
  // 左簇(意图,散) 4 节点 → 右簇(界面,聚) 6 节点；两个发丝帧框斜错
  const L: [number, number][] = [[96, 300], [172, 160], [206, 246], [268, 282]];
  const R: [number, number][] = [[312, 176], [388, 118], [352, 232], [432, 196], [406, 300], [462, 258]];
  const lEdges: [number, number][][] = [
    [L[0], L[1]], [L[0], L[2]], [L[1], L[2]], [L[2], L[3]], [L[0], L[3]],
  ];
  const rEdges: [number, number][][] = [
    [R[0], R[1]], [R[0], R[2]], [R[1], R[3]], [R[2], R[3]], [R[2], R[4]],
    [R[3], R[5]], [R[4], R[5]], [R[0], R[3]], [R[2], R[5]],
  ];
  const bridge: [number, number][][] = [[L[1], R[0]], [L[3], R[2]]];
  return (
    <svg className="lart" viewBox="0 0 500 430" aria-hidden="true">
      {/* 虚点网格底(横+竖双向,严格对称:竖线中轴 x=250、横线中轴 y=215) */}
      <g stroke="var(--la-grid)" strokeWidth={1}>
        {[75, 145, 215, 285, 355].map((y) => (
          <line key={`h${y}`} x1={24} y1={y} x2={476} y2={y} strokeDasharray="1 9" {...NS} />
        ))}
        {[70, 142, 214, 286, 358, 430].map((x) => (
          <line key={`v${x}`} x1={x} y1={40} x2={x} y2={390} strokeDasharray="1 9" {...NS} />
        ))}
      </g>
      {/* 图形主体整体居中：原坐标系质心(266,216) → 平移到画幅中心(250,215) */}
      <g transform="translate(-16,-1)">
        {/* 帧框 + mono 标签：INTENT(左下) / FORM(右上) */}
        <rect x={56} y={196} width={236} height={160} fill="none" stroke="var(--la-frame)" strokeWidth={1} {...NS} />
        <rect x={288} y={84} width={188} height={236} fill="none" stroke="var(--la-frame)" strokeWidth={1} {...NS} />
        <g className="lart-label">
          <rect x={56} y={186} width={54} height={15} fill="var(--la-tagbg)" stroke="var(--la-frame)" strokeWidth={1} {...NS} />
          <text x={83} y={197} textAnchor="middle">INTENT</text>
          <rect x={438} y={76} width={38} height={15} fill="var(--la-tagbg)" stroke="var(--la-frame)" strokeWidth={1} {...NS} />
          <text x={457} y={87} textAnchor="middle">FORM</text>
        </g>
        {/* 连线（弱） + 跨簇桥（主线） */}
        <g stroke="var(--la-line)" strokeWidth={1} opacity={0.8}>
          {lEdges.map(([a, b], i) => <line key={`l${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...NS} />)}
          {rEdges.map(([a, b], i) => <line key={`r${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...NS} />)}
        </g>
        {/* 跨簇桥(意图→界面)走重点色 —— 本卡无箭头,以桥线承担色彩重音 */}
        <g stroke="var(--la-accent)" strokeWidth={1}>
          {bridge.map(([a, b], i) => <line key={`b${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...NS} />)}
        </g>
        {/* 节点（实心灰圆,尺寸对齐参考的节点/画幅比） */}
        {[...L, ...R].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} fill="var(--la-node)" stroke="none" />
        ))}
      </g>
    </svg>
  );
}

/* ============ 03 自我进化 · 相切圆链（X hero 式 · 宽幅） ============ */
export function ArtEvolution() {
  // 中心锚点 → 左右镜像逐个相切的圆(小→大)；横轴贯穿 + 端部刻度簇 + 竖轴
  const CY = 160;
  // 精确相切链：r 42/62/96,圆心 = 上一圆右缘 + 本圆半径
  const chain = [
    { cx: 642, r: 42 },   // 600+42
    { cx: 746, r: 62 },   // 684+62
    { cx: 904, r: 96 },   // 808+96
  ];
  return (
    <svg className="lart" viewBox="0 0 1200 320" aria-hidden="true">
      {/* 横轴 + 端部刻度簇 */}
      <line x1={30} y1={CY} x2={1170} y2={CY} stroke="var(--la-line)" strokeWidth={1} {...NS} />
      <g stroke="var(--la-line)" strokeWidth={1}>
        {[132, 144, 156, 1044, 1056, 1068].map((x) => (
          <line key={x} x1={x} y1={CY - 5} x2={x} y2={CY + 5} {...NS} />
        ))}
      </g>
      {/* 竖轴（中心贯穿 + 上下双刻度） */}
      <line x1={600} y1={16} x2={600} y2={304} stroke="var(--la-soft)" strokeWidth={1} {...NS} />
      <g stroke="var(--la-line)" strokeWidth={1}>
        {[52, 60, 260, 268].map((y) => (
          <line key={y} x1={594} y1={y} x2={606} y2={y} {...NS} />
        ))}
      </g>
      {/* 相切圆链（镜像）—— 进化的代际放大 */}
      {chain.flatMap(({ cx, r }, i) =>
        [1, -1].map((s) => (
          <circle
            key={`${i}${s}`}
            cx={600 + s * (cx - 600)}
            cy={CY}
            r={r}
            fill="none"
            stroke="var(--la-line)"
            strokeWidth={1}
            {...NS}
          />
        )),
      )}
      {/* 圆顶方向箭头（各代旋转方向左右交替） */}
      <Arrow x={642} y={CY - 42} a={8} s={4} />
      <Arrow x={558} y={CY - 42} a={-8} s={4} />
      <Arrow x={746} y={CY - 62} a={8} s={4} />
      <Arrow x={454} y={CY - 62} a={-8} s={4} />
      <Arrow x={904} y={CY - 96} a={8} s={4.5} />
      <Arrow x={296} y={CY - 96} a={-8} s={4.5} />
    </svg>
  );
}

/* ============ 99 结语 · 流线绕节点（平行流被"讲清楚的判断"重新组织） ============
   语言对齐参考：满幅平行横线(左起点圆点/右终点箭头)；圆节点坐在某几条线上,
   邻近的线以衰减的位移场柔和绕行；过圆心的线 节点前虚线/节点后实线,圆缘两粒切点。 */
export function ArtOutro() {
  const X0 = 40, X1 = 460;
  const LINES = Array.from({ length: 15 }, (_, i) => 61 + i * 22);
  const NODES = [
    { cx: 170, cy: LINES[3], r: 21 },
    { cx: 318, cy: LINES[7], r: 30 },
    { cx: 128, cy: LINES[11], r: 18 },
  ];
  /* 位移场：距圆心 |dy| 越近偏折越大,超出影响半径归零;方向背离圆心 */
  const linePath = (y0: number) => {
    let d = `M ${X0} ${y0}`;
    const bumps = NODES
      .map((n) => {
        const dy = y0 - n.cy;
        const disp = Math.max(0, (n.r + 34 - Math.abs(dy)) * 0.55);
        return { ...n, dy, disp };
      })
      .filter((b) => Math.abs(b.dy) > 0.5 && b.disp > 0.5)
      .sort((a, b) => a.cx - b.cx);
    for (const b of bumps) {
      const ty = y0 + Math.sign(b.dy) * b.disp;      // 鼓起顶点 y(背离圆心)
      const w = b.r * 2 + 10;                        // 单侧影响宽度
      d += ` L ${b.cx - w} ${y0}`;
      d += ` C ${b.cx - w * 0.45} ${y0}, ${b.cx - b.r * 0.9} ${ty}, ${b.cx} ${ty}`;
      d += ` C ${b.cx + b.r * 0.9} ${ty}, ${b.cx + w * 0.45} ${y0}, ${b.cx + w} ${y0}`;
    }
    d += ` L ${X1} ${y0}`;
    return d;
  };
  return (
    <svg className="lart" viewBox="0 0 500 430" aria-hidden="true">
      {LINES.map((y) => {
        const node = NODES.find((n) => n.cy === y);
        return node ? (
          /* 过圆心的线：节点前虚线 + 节点后实线,圆缘切点小亮点 */
          <g key={y}>
            <line x1={X0} y1={y} x2={node.cx - node.r} y2={y} stroke="var(--la-soft)" strokeWidth={1} strokeDasharray="1 6" {...NS} />
            <line x1={node.cx + node.r} y1={y} x2={X1} y2={y} stroke="var(--la-line)" strokeWidth={1} {...NS} />
            <circle cx={node.cx - node.r} cy={y} r={2} fill="var(--la-accent)" />
            <circle cx={node.cx + node.r} cy={y} r={2} fill="var(--la-accent)" />
          </g>
        ) : (
          <path key={y} d={linePath(y)} fill="none" stroke="var(--la-line)" strokeWidth={1} {...NS} />
        );
      })}
      {/* 节点圆(空心,线稿) */}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r={n.r} fill="none" stroke="var(--la-line)" strokeWidth={1} {...NS} />
      ))}
      {/* 左起点圆点 + 右终点箭头 */}
      {LINES.map((y) => (
        <g key={`e${y}`}>
          <circle cx={X0} cy={y} r={2.2} fill="var(--la-node)" />
          <Arrow x={X1} y={y} a={0} s={3.2} />
        </g>
      ))}
    </svg>
  );
}

/* ============ A0 词典 · 词条行 + 扇形线束（词条向下展开成细目） ============
   线束语言对齐 MRBLWHN8KQRLB(多线汇入/散开的长弧)：一束线从行底成扇展开,端点圆点 */
export function ArtLexicon() {
  const wires = (x0: number, y0: number, n: number, spread: number, len: number) =>
    Array.from({ length: n }, (_, i) => {
      const dx = (i - (n - 1) / 2) * spread;
      const x1 = x0 + dx * 1.9;
      return (
        <g key={i}>
          <path
            d={`M ${x0 + dx * 0.3} ${y0} C ${x0 + dx * 0.5} ${y0 + len * 0.45}, ${x1} ${y0 + len * 0.5}, ${x1} ${y0 + len}`}
            fill="none"
            stroke="var(--la-soft)"
            strokeWidth={1}
            {...NS}
          />
          <circle cx={x1} cy={y0 + len} r={2.6} fill="var(--la-accent)" />
        </g>
      );
    });
  return (
    <svg className="lart" viewBox="0 0 500 430" aria-hidden="true">
      {/* 虚点网格底 */}
      <g stroke="var(--la-grid)" strokeWidth={1}>
        {[88, 158, 228, 298, 368].map((y) => (
          <line key={y} x1={24} y1={y} x2={476} y2={y} strokeDasharray="1 9" {...NS} />
        ))}
      </g>
      {/* 词条行（左亮→右隐的渐变条） */}
      <defs>
        <linearGradient id="laBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--la-barhi)" />
          <stop offset="1" stopColor="var(--la-barlo)" />
        </linearGradient>
      </defs>
      <rect x={56} y={74} width={300} height={26} fill="url(#laBar)" />
      <rect x={128} y={168} width={316} height={26} fill="url(#laBar)" />
      <rect x={72} y={262} width={252} height={26} fill="url(#laBar)" />
      {/* 行首竖亮刻（词条把手） */}
      {[
        [56, 74], [128, 168], [72, 262],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={2.4} height={26} fill="var(--la-bright)" />
      ))}
      {/* 行下扇形线束 */}
      {wires(206, 100, 5, 11, 56)}
      {wires(300, 194, 7, 10, 62)}
      {wires(170, 288, 4, 12, 50)}
      {/* 一枚方块节点（词条锚,自条2垂线挂下） */}
      <rect x={404} y={300} width={22} height={22} fill="none" stroke="var(--la-line)" strokeWidth={1} {...NS} />
      <path d="M 415 262 v 38" stroke="var(--la-soft)" strokeWidth={1} fill="none" {...NS} />
    </svg>
  );
}

export const LINEAR_ART: Record<string, () => ReturnType<typeof ArtEngineering>> = {
  ch1: ArtEngineering,
  ch2: ArtInteraction,
  ch3: ArtEvolution,
  outro: ArtOutro,
  lex: ArtLexicon,
};
