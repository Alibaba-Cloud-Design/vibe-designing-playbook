import { type DrawFn, gray } from "./kit";

/**
 * solid3d —— 真 3D 线框仪器（提取 poolside agents 动画的精髓，构图原创）：
 *   精髓 = ① 3D 线框体：前棱实线、背棱虚线、面填极低透明度
 *          ② 椭圆轨道携微型卫星体运行
 *          ③ 发丝级线重(1px)、安静缓慢的整体 3D 旋转（精密仪器感）
 *   构图 = 我们自己的语义，不复刻其八面体+双环:
 *          「frame」(设计工程) = 线框立方体(执行契约的约束框) ⊃ 内部八面体(生成物)
 *            + 一条轨道携两枚微型立方卫星(token 注入)。
 * 颜色一律走 kit.gray()（--sig-lo/--sig-hi 主题调色：亮=深墨线，暗=亮白线）。
 */

/* ================= 3D 基础 ================= */

type V3 = [number, number, number];

interface Solid {
  verts: V3[];
  edges: [number, number][];
  faces: number[][];       // 顶点索引环（法线朝外，右手序）
}

/* 立方体（半边长 1） */
const CUBE: Solid = {
  verts: [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ],
  faces: [
    [0, 3, 2, 1], [4, 5, 6, 7],       // 前后(z)
    [0, 1, 5, 4], [2, 3, 7, 6],       // 上下(y)
    [1, 2, 6, 5], [0, 4, 7, 3],       // 左右(x)
  ],
};

/* 八面体（尖轴取 y，上下尖 —— 参考里那种「双锥」体量感） */
const OCTA: Solid = {
  verts: [
    [0, -1.35, 0],                     // 上尖(画布 y 向下,取负为上)
    [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1],
    [0, 1.35, 0],                      // 下尖
  ],
  edges: [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [5, 1], [5, 2], [5, 3], [5, 4],
    [1, 2], [2, 3], [3, 4], [4, 1],
  ],
  faces: [
    [0, 2, 1], [0, 3, 2], [0, 4, 3], [0, 1, 4],
    [5, 1, 2], [5, 2, 3], [5, 3, 4], [5, 4, 1],
  ],
};

/* 旋转：yaw(绕 y) → pitch(绕 x)，右手系 */
function rot(v: V3, yaw: number, pitch: number): V3 {
  const [x, y, z] = v;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
  return [x1, y2, z2];
}

/* 弱透视投影：d = 相机距离(体半径的倍数) */
const PERSP = 5.2;
function proj(v: V3, scale: number, cx: number, cy: number): [number, number] {
  const k = PERSP / (PERSP - v[2]);
  return [cx + v[0] * scale * k, cy + v[1] * scale * k];
}

const faceNormalZ = (vs: V3[], f: number[]) => {
  // 投影前用视线方向(0,0,1)判前后：法线 z 分量（弱透视下近似足够）
  const [a, b, c] = [vs[f[0]], vs[f[1]], vs[f[2]]];
  const u: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const w: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return u[0] * w[1] - u[1] * w[0]; // 屏幕面朝向(z 交叉分量)：>0 背向
};

/**
 * 画一个 3D 线框体：面填极低透明 + 前棱实线 + 背棱虚线。
 * lit = 线亮度(gray b)，lw = 线宽。
 */
function drawSolid(
  ctx: CanvasRenderingContext2D,
  solid: Solid,
  opts: {
    yaw: number; pitch: number; scale: number; cx: number; cy: number;
    lit?: number; lw?: number; faceAlpha?: number; edgeAlpha?: number; backAlpha?: number;
  },
) {
  const { yaw, pitch, scale, cx, cy } = opts;
  const lit = opts.lit ?? 0.55;
  const lw = opts.lw ?? 1;
  const faceAlpha = opts.faceAlpha ?? 0.045;
  const edgeAlpha = opts.edgeAlpha ?? 0.9;
  const backAlpha = opts.backAlpha ?? 0.32;

  const vs = solid.verts.map((v) => rot(v, yaw, pitch));
  const ps = vs.map((v) => proj(v, scale, cx, cy));

  // 面朝向：faceFront[i] —— 用屏幕投影环绕方向判定（弱透视下稳定）
  const front = solid.faces.map((f) => {
    let a2 = 0;
    for (let i = 0; i < f.length; i++) {
      const p = ps[f[i]], q = ps[f[(i + 1) % f.length]];
      a2 += (q[0] - p[0]) * (q[1] + p[1]);
    }
    return a2 > 0; // 顺时针(屏幕) = 朝向观者（faces 以右手外法线定义）
  });
  void faceNormalZ;

  // ① 前向面：极低透明度填充（painter：远→近 = 面均 z 升序）
  const order = solid.faces
    .map((f, i) => ({ i, z: f.reduce((s, vi) => s + vs[vi][2], 0) / f.length }))
    .sort((a, b) => a.z - b.z);
  for (const { i } of order) {
    if (!front[i]) continue;
    const f = solid.faces[i];
    ctx.beginPath();
    ctx.moveTo(ps[f[0]][0], ps[f[0]][1]);
    for (let k = 1; k < f.length; k++) ctx.lineTo(ps[f[k]][0], ps[f[k]][1]);
    ctx.closePath();
    ctx.fillStyle = gray(lit, faceAlpha);
    ctx.fill();
  }

  // 棱的前后：邻接任一前向面 → 前棱
  const edgeFront = solid.edges.map(([a, b]) =>
    solid.faces.some((f, i) => front[i] && f.includes(a) && f.includes(b)),
  );

  ctx.lineWidth = lw;
  // ② 背棱：虚线、更淡
  ctx.strokeStyle = gray(lit, backAlpha);
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  solid.edges.forEach(([a, b], i) => {
    if (edgeFront[i]) return;
    ctx.moveTo(ps[a][0], ps[a][1]);
    ctx.lineTo(ps[b][0], ps[b][1]);
  });
  ctx.stroke();
  ctx.setLineDash([]);
  // ③ 前棱：实线
  ctx.strokeStyle = gray(lit, edgeAlpha);
  ctx.beginPath();
  solid.edges.forEach(([a, b], i) => {
    if (!edgeFront[i]) return;
    ctx.moveTo(ps[a][0], ps[a][1]);
    ctx.lineTo(ps[b][0], ps[b][1]);
  });
  ctx.stroke();
}

/* 轨道（3D 圆按轨道面倾角投影）+ 沿轨微型卫星 */
function orbitPoint(a: number, r: number, tiltX: number, tiltZ: number): V3 {
  // 圆在 xz 面，先绕 z 倾（抬升椭圆长轴），再绕 x 倾（透视扁率）
  const p: V3 = [Math.cos(a) * r, 0, Math.sin(a) * r];
  const cz = Math.cos(tiltZ), sz = Math.sin(tiltZ);
  const p2: V3 = [p[0] * cz - p[1] * sz, p[0] * sz + p[1] * cz, p[2]];
  const cx2 = Math.cos(tiltX), sx2 = Math.sin(tiltX);
  return [p2[0], p2[1] * cx2 - p2[2] * sx2, p2[1] * sx2 + p2[2] * cx2];
}

/* ================= 「frame」· 设计工程 =================
   线框立方体(契约约束框) ⊃ 内部八面体(生成物,反向缓转) + 轨道×1 携 2 枚微型立方卫星(token) */
export const drawFrame3D: DrawFn = (ctx, { t, cx, cy, size, reduce }) => {
  const tt = reduce ? 2.4 : t;
  const S = size * 0.225;                 // 外立方半边长(px)
  const yaw = tt * 0.5;                   // 整体缓转(≈12.6s/圈)
  const pitch = -0.3 + Math.sin(tt * 0.28) * 0.045;  // 俯角 + 极轻章动(呼吸)

  ctx.lineJoin = "round";

  // 轨道(画在体后面：先画轨道线，再画体，最后画轨道前段卫星——简化为整环+卫星恒在前)
  const ORB_R = size * 0.47;
  const tiltX = -0.985;                    // 接近躺平的椭圆(参考的扁轨道感)
  const tiltZ = 0.16;
  ctx.strokeStyle = gray(0.5, 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const p = orbitPoint(a + yaw * 0.35, ORB_R / S, tiltX, tiltZ); // 以 S 为单位
    const q = proj(p, S, cx, cy);
    if (i === 0) ctx.moveTo(q[0], q[1]);
    else ctx.lineTo(q[0], q[1]);
  }
  ctx.stroke();

  // 外立方（约束框）：稍亮、线稍重
  drawSolid(ctx, CUBE, {
    yaw, pitch, scale: S, cx, cy,
    lit: 0.62, lw: 1, faceAlpha: 0.035, edgeAlpha: 0.85, backAlpha: 0.3,
  });

  // 内八面体（生成物）：反向缓转、略暗一档、体量 0.56
  drawSolid(ctx, OCTA, {
    yaw: -yaw * 0.7 + 0.6, pitch: pitch * 0.6, scale: S * 0.56, cx, cy,
    lit: 0.5, lw: 1, faceAlpha: 0.05, edgeAlpha: 0.75, backAlpha: 0.26,
  });

  // 两枚微型立方卫星（token）沿轨对置运行
  for (const off of [0, Math.PI]) {
    const a = tt * 0.62 + off;
    const p = orbitPoint(a + yaw * 0.35, ORB_R / S, tiltX, tiltZ);
    const sp = proj(p, S, cx, cy);
    const satS = size * 0.028;
    drawSolid(ctx, CUBE, {
      yaw: tt * 1.4 + off, pitch: -0.5, scale: satS, cx: sp[0], cy: sp[1],
      lit: 0.66, lw: 1, faceAlpha: 0.06, edgeAlpha: 0.9, backAlpha: 0,
    });
  }
};
