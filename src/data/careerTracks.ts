/** Which illustrated cover a track card shows. */
export type CareerCoverVariant =
  | "code"
  | "shield"
  | "cloud"
  | "bars"
  | "trend"
  | "network";

export interface CareerTrack {
  id: string;
  /** kebab-case, stable for URLs and anchors */
  slug: string;
  title: string;
  /** short label shown above the title */
  category: string;
  summary: string;
  /** at most 6 */
  skills: string[];
  duration: string;
  specialisations?: string[];
  cover: CareerCoverVariant;
}

/** The career tracks we offer, in display order. */
export const careerTracks: CareerTrack[] = [
  {
    id: "software-engineering",
    slug: "software-engineering",
    title: "Software Engineering",
    category: "Engineering",
    summary:
      "Master the software development lifecycle from architecture to deployment, specialising in front-end interfaces or back-end systems.",
    skills: ["System Design", "Testing", "React", "TypeScript", "Node.js", "APIs"],
    duration: "6 months",
    specialisations: ["Front-end", "Back-end"],
    cover: "code",
  },
  {
    id: "cybersecurity",
    slug: "cybersecurity",
    title: "Cybersecurity",
    category: "Security",
    summary:
      "Protect systems and data from threats in an increasingly digital world.",
    skills: [
      "Penetration Testing",
      "Encryption",
      "Compliance",
      "Incident Response",
    ],
    duration: "6 months",
    cover: "shield",
  },
  {
    id: "cloud-computing",
    slug: "cloud-computing",
    title: "Cloud Computing",
    category: "Cloud",
    summary: "Deploy and manage applications on leading cloud platforms.",
    skills: ["AWS", "Docker", "Kubernetes", "Infrastructure"],
    duration: "5 months",
    cover: "cloud",
  },
  {
    id: "data-analysis",
    slug: "data-analysis",
    title: "Data Analysis",
    category: "Data",
    summary: "Transform raw data into actionable business insights.",
    skills: ["Excel", "SQL", "Visualization", "Statistics"],
    duration: "4 months",
    cover: "bars",
  },
  {
    id: "data-science",
    slug: "data-science",
    title: "Data Science",
    category: "Data",
    summary:
      "Extract insights from complex data using statistics, machine learning and visualization.",
    skills: ["Statistical Analysis", "Predictive Modeling", "Big Data", "ETL"],
    duration: "6 months",
    cover: "trend",
  },
  {
    id: "ai-machine-learning",
    slug: "ai-machine-learning",
    title: "AI & Machine Learning",
    category: "AI",
    summary:
      "Build intelligent systems that learn from data, then deploy AI models to production for real-world use.",
    skills: [
      "Deep Learning",
      "Neural Networks",
      "Model Training",
      "MLOps",
      "LLMs",
      "Prompt Engineering",
    ],
    duration: "6 months",
    cover: "network",
  },
];
