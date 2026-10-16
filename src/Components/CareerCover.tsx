import React from "react";
import {
  BarChart3,
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import type { CareerCoverVariant } from "../data/careerTracks";
import "./CareerCover.css";

interface CareerCoverProps {
  variant: CareerCoverVariant;
}

const badgeIcons: Record<CareerCoverVariant, React.ReactNode> = {
  code: <Code2 />,
  shield: <ShieldCheck />,
  cloud: <Cloud />,
  bars: <BarChart3 />,
  trend: <LineChart />,
  network: <BrainCircuit />,
  pipeline: <Database />,
};

const CodeArt = () => (
  <div className="cc-window">
    <div className="cc-window-bar">
      <i />
      <i />
      <i />
      <span>your-next-chapter.ts</span>
    </div>
    <code>
      <span>const</span> future = {"{"}
      <br />
      &nbsp; curiosity: <b>true</b>,<br />
      &nbsp; possibilities: <b>"endless"</b>
      <br />
      {"}"};<br />
      <span>build</span>(future);
    </code>
  </div>
);

const ShieldArt = () => (
  <div className="cc-tile">
    <span className="cc-shield-shape">
      <span className="cc-lock-shackle" />
      <span className="cc-lock-body" />
    </span>
    <span className="cc-ring" />
    <span className="cc-ring cc-ring--small" />
  </div>
);

const CloudArt = () => (
  <div className="cc-tile">
    <Cloud />
    <span className="cc-ring" />
    <span className="cc-ring cc-ring--small" />
  </div>
);

const BarsArt = () => (
  <div className="cc-chart">
    <i />
    <i />
    <i />
    <i />
    <i />
    <i />
    <span />
  </div>
);

const TrendArt = () => (
  <div className="cc-window cc-window--paper">
    <div className="cc-window-bar">
      <i />
      <i />
      <i />
    </div>
    <div className="cc-plot">
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      <span />
    </div>
  </div>
);

type Point = readonly [number, number];

const NETWORK_LAYERS: readonly (readonly Point[])[] = [
  [
    [40, 30],
    [40, 68],
    [40, 106],
  ],
  [
    [115, 18],
    [115, 52],
    [115, 86],
    [115, 120],
  ],
  [
    [190, 48],
    [190, 88],
  ],
];

const HOT_NODES = new Set(["115,52", "190,48"]);

const NetworkArt = () => {
  const edges = NETWORK_LAYERS.slice(1).flatMap((layer, index) =>
    NETWORK_LAYERS[index].flatMap((from) => layer.map((to) => [from, to] as const))
  );

  return (
    <svg className="cc-net" viewBox="0 0 230 136" focusable="false">
      {edges.map(([[x1, y1], [x2, y2]]) => (
        <line key={`${x1},${y1}-${x2},${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
      {NETWORK_LAYERS.flat().map(([cx, cy]) => (
        <circle
          key={`${cx},${cy}`}
          cx={cx}
          cy={cy}
          r={7}
          className={HOT_NODES.has(`${cx},${cy}`) ? "cc-net-hot" : undefined}
        />
      ))}
    </svg>
  );
};

/** Side of a database cylinder: open top edge, body and rounded bottom. */
const cylinderSide = (cx: number, top: number, rx: number, ry: number, height: number) =>
  `M${cx - rx},${top} v${height} a${rx},${ry} 0 0 0 ${rx * 2},0 v${-height}`;

const PIPELINE_SOURCES: readonly Point[] = [
  [34, 22],
  [34, 60],
  [34, 98],
];

const PipelineArt = () => (
  <svg className="cc-pipe" viewBox="0 0 230 136" focusable="false">
    {PIPELINE_SOURCES.map(([cx, top]) => (
      <path key={`flow-${top}`} className="cc-pipe-flow" d={`M${cx + 18},${top + 10} C80,${top + 10} 72,68 98,68`} />
    ))}
    <path className="cc-pipe-flow" d="M140,68 H166" />
    {PIPELINE_SOURCES.map(([cx, top]) => (
      <g key={`source-${top}`}>
        <path d={cylinderSide(cx, top, 16, 5, 16)} />
        <ellipse cx={cx} cy={top} rx={16} ry={5} />
      </g>
    ))}
    <rect x={98} y={50} width={42} height={36} rx={8} />
    <path className="cc-pipe-mark" d="M108,62 h22 M108,68 h16 M108,74 h20" />
    <path d={cylinderSide(194, 40, 24, 7, 48)} />
    <path className="cc-pipe-mark" d="M170,56 a24,7 0 0 0 48,0 M170,72 a24,7 0 0 0 48,0" />
    <ellipse className="cc-pipe-hot" cx={194} cy={40} rx={24} ry={7} />
  </svg>
);

const arts: Record<CareerCoverVariant, React.FC> = {
  code: CodeArt,
  shield: ShieldArt,
  cloud: CloudArt,
  bars: BarsArt,
  trend: TrendArt,
  network: NetworkArt,
  pipeline: PipelineArt,
};

/** Decorative illustrated cover for a career track card. */
export const CareerCover: React.FC<CareerCoverProps> = ({ variant }) => {
  const Art = arts[variant];

  return (
    <div className={`cc-cover cc-${variant}`} aria-hidden="true">
      <span className="cc-orbit" />
      <Art />
      <span className="cc-badge">{badgeIcons[variant]}</span>
    </div>
  );
};
