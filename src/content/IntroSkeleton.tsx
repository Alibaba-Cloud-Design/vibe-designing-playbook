import "./IntroSkeleton.css";

type Point = [number, number];
type Bounds = [number, number, number, number];
type Layout = "prototype" | "interaction" | "components" | "templates" | "spec";
type Layer = {
  id: string;
  y: number;
  layout: Layout;
  active?: boolean;
};

const CX = 360;
const HW = 112;
const HH = 68;
const ISO = 0.44;
const LAYER_DEPTH = 10;

const LAYERS: Layer[] = [
  { id: "prototype", y: 105, layout: "prototype", active: true },
  { id: "interaction", y: 315, layout: "interaction" },
  { id: "components", y: 485, layout: "components" },
  { id: "templates", y: 655, layout: "templates" },
  { id: "spec", y: 825, layout: "spec" },
];

const DETAILS: Record<Layout, Bounds[]> = {
  prototype: [
    [-0.84, -0.82, 0.84, -0.66],
    [-0.76, -0.52, -0.18, -0.43],
    [-0.76, -0.31, 0.03, -0.20],
    [-0.76, -0.08, -0.34, 0.02],
    [-0.76, 0.20, -0.50, 0.58],
    [-0.36, 0.20, -0.10, 0.58],
    [0.14, -0.48, 0.76, 0.58],
  ],
  interaction: [[-0.80, -0.76, 0.80, 0.76]],
  components: [
    [-0.80, -0.76, -0.55, 0.76],
    [-0.42, -0.70, 0.08, -0.08],
    [0.20, -0.70, 0.76, -0.08],
    [-0.42, 0.08, 0.08, 0.70],
    [0.20, 0.08, 0.76, 0.70],
  ],
  templates: [
    [-0.80, -0.76, -0.55, 0.76],
    [-0.42, -0.70, 0.08, 0.70],
    [0.20, -0.70, 0.76, 0.70],
  ],
  spec: [[-0.72, -0.64, 0.72, 0.64]],
};

const mapUV = (centerY: number, u: number, v: number): Point => [
  CX + u * HW - v * HH,
  centerY + (u * HW + v * HH) * ISO,
];

const pathFromPoints = (points: Point[]) =>
  `M ${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ")} Z`;

function roundedRing(points: Point[], radius: number): Point[] {
  const output: Point[] = [];
  const segments = 6;

  points.forEach((current, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const incoming: Point = [previous[0] - current[0], previous[1] - current[1]];
    const outgoing: Point = [next[0] - current[0], next[1] - current[1]];
    const incomingLength = Math.hypot(incoming[0], incoming[1]);
    const outgoingLength = Math.hypot(outgoing[0], outgoing[1]);
    const cornerRadius = Math.min(radius, incomingLength / 2, outgoingLength / 2);
    const start: Point = [
      current[0] + incoming[0] / incomingLength * cornerRadius,
      current[1] + incoming[1] / incomingLength * cornerRadius,
    ];
    const end: Point = [
      current[0] + outgoing[0] / outgoingLength * cornerRadius,
      current[1] + outgoing[1] / outgoingLength * cornerRadius,
    ];

    for (let segment = 0; segment <= segments; segment += 1) {
      const t = segment / segments;
      const mt = 1 - t;
      output.push([
        mt * mt * start[0] + 2 * mt * t * current[0] + t * t * end[0],
        mt * mt * start[1] + 2 * mt * t * current[1] + t * t * end[1],
      ]);
    }
  });

  return output;
}

function nearestIndex(points: Point[], target: Point) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  points.forEach(([x, y], index) => {
    const distance = (x - target[0]) ** 2 + (y - target[1]) ** 2;
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  });

  return bestIndex;
}

function roundedCornerPoint(centerY: number, u: number, v: number): Point {
  const corners = [
    mapUV(centerY, -1, -1),
    mapUV(centerY, 1, -1),
    mapUV(centerY, 1, 1),
    mapUV(centerY, -1, 1),
  ];
  const target = mapUV(centerY, u, v);
  const ring = roundedRing(corners, 10);
  return ring[nearestIndex(ring, target)];
}

function boxPaths(centerY: number, bounds: Bounds, depth: number, radius: number) {
  const [u0, v0, u1, v1] = bounds;
  const top = mapUV(centerY, u0, v0);
  const right = mapUV(centerY, u1, v0);
  const bottom = mapUV(centerY, u1, v1);
  const left = mapUV(centerY, u0, v1);
  const ring = roundedRing([top, right, bottom, left], radius);
  const rightIndex = nearestIndex(ring, right);
  const bottomIndex = nearestIndex(ring, bottom);
  const leftIndex = nearestIndex(ring, left);
  const front = ring.slice(rightIndex, leftIndex + 1);
  const frontBottomIndex = front.findIndex((point) => point === ring[bottomIndex]);
  const rightEdge = front.slice(0, frontBottomIndex + 1);
  const leftEdge = front.slice(frontBottomIndex);
  const wall = (edge: Point[]) => pathFromPoints([
    ...edge,
    ...edge.map(([x, y]) => [x, y + depth] as Point).reverse(),
  ]);

  return {
    top: pathFromPoints(ring),
    right: wall(rightEdge),
    left: wall(leftEdge),
  };
}

function IsoBox({
  centerY,
  bounds,
  depth,
  element = false,
}: {
  centerY: number;
  bounds: Bounds;
  depth: number;
  element?: boolean;
}) {
  const faces = boxPaths(centerY, bounds, depth, element ? 4 : 10);
  const family = element ? "element" : "layer";

  return (
    <g aria-hidden="true">
      <path className={`intro-skeleton__${family}-side`} d={faces.right} />
      <path className={`intro-skeleton__${family}-side`} d={faces.left} />
      <path className={`intro-skeleton__${family}-top`} d={faces.top} />
    </g>
  );
}

export function IntroSkeleton() {
  const topLayer = LAYERS[0];
  const bottomLayer = LAYERS[LAYERS.length - 1];
  const railCorners: Array<[number, number]> = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

  return (
    <svg
      className="intro-skeleton"
      viewBox="0 0 720 940"
      role="img"
      aria-label="设计能力五层骨架图"
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="intro-skeleton__art" transform="translate(24 0)">
        <g aria-hidden="true">
          {railCorners.map(([u, v]) => {
            const start = roundedCornerPoint(topLayer.y, u, v);
            const end = roundedCornerPoint(bottomLayer.y, u, v);
            return (
              <line
                key={`${u}-${v}`}
                className="intro-skeleton__rail"
                x1={start[0]}
                y1={start[1] + LAYER_DEPTH}
                x2={end[0]}
                y2={end[1] + LAYER_DEPTH}
              />
            );
          })}
        </g>

        {[...LAYERS].reverse().map((layer) => (
          <g
            key={layer.id}
            className={`intro-skeleton__group${layer.active ? " is-active" : ""}`}
          >
            <IsoBox centerY={layer.y} bounds={[-1, -1, 1, 1]} depth={LAYER_DEPTH} />
            {DETAILS[layer.layout].map((bounds, index) => (
              <IsoBox
                key={`${layer.id}-${index}`}
                centerY={layer.y}
                bounds={bounds}
                depth={4}
                element
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
