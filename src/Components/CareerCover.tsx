import React from "react";
import {
  BarChart3,
  BrainCircuit,
  Cloud,
  Code2,
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

const arts: Record<CareerCoverVariant, React.FC> = {
  code: CodeArt,
  shield: ShieldArt,
  cloud: CloudArt,
  bars: BarsArt,
  trend: TrendArt,
  network: NetworkArt,
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
