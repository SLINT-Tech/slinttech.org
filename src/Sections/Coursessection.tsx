import {
  ArrowRight,
  Zap,
  Palette,
  Server,
  Shield,
  Cloud,
  BarChart3,
  Brain,
  Smartphone,
  Pencil,
  Wand2,
  Database,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState } from "react";

interface CareerPath {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  skills: string[];
}

const careerPaths: CareerPath[] = [
  {
    id: "software-engineering",
    title: "Software Engineering",
    category: "Engineering",
    description:
      "Master the complete software development lifecycle from architecture to deployment.",
    icon: <Zap className="w-10 h-10" />,
    duration: "6 Months",
    skills: ["System Design", "Architecture", "SDLC", "Testing"],
  },
  {
    id: "frontend",
    title: "Front-end Development",
    category: "Engineering",
    description:
      "Build stunning, responsive user interfaces with modern frameworks and tools.",
    icon: <Palette className="w-10 h-10" />,
    duration: "4 Months",
    skills: ["React", "TypeScript", "CSS", "UX/UI"],
  },
  {
    id: "backend",
    title: "Back-end Development",
    category: "Engineering",
    description:
      "Design scalable backend systems and manage data with confidence.",
    icon: <Server className="w-10 h-10" />,
    duration: "5 Months",
    skills: ["Node.js", "Databases", "APIs", "Security"],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    category: "Cloud & Security",
    description:
      "Protect systems and data from threats in an increasingly digital world.",
    icon: <Shield className="w-10 h-10" />,
    duration: "6 Months",
    skills: [
      "Penetration Testing",
      "Encryption",
      "Compliance",
      "Incident Response",
    ],
  },
  {
    id: "cloud",
    title: "Cloud Computing",
    category: "Cloud & Security",
    description: "Deploy and manage applications on leading cloud platforms.",
    icon: <Cloud className="w-10 h-10" />,
    duration: "5 Months",
    skills: ["AWS", "Docker", "Kubernetes", "Infrastructure"],
  },
  {
    id: "data-analysis",
    title: "Data Analysis",
    category: "Data & AI",
    description: "Transform raw data into actionable business insights.",
    icon: <BarChart3 className="w-10 h-10" />,
    duration: "4 Months",
    skills: ["Excel", "SQL", "Visualization", "Statistics"],
  },
  {
    id: "data-science",
    title: "Data Science",
    category: "Data & AI",
    description:
      "Extract insights from complex data using statistics, ML, and visualization.",
    icon: <Database className="w-10 h-10" />,
    duration: "6 Months",
    skills: ["Statistical Analysis", "Predictive Modeling", "Big Data", "ETL"],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    category: "Data & AI",
    description:
      "Build intelligent systems that learn from data and make predictions.",
    icon: <Brain className="w-10 h-10" />,
    duration: "6 Months",
    skills: ["Deep Learning", "Neural Networks", "Model Training", "MLOps"],
  },
  {
    id: "mobile-development",
    title: "Mobile Development",
    category: "Engineering",
    description:
      "Create powerful mobile applications for iOS and Android platforms.",
    icon: <Smartphone className="w-10 h-10" />,
    duration: "5 Months",
    skills: ["Native Apps", "Cross-platform", "UI Design", "APIs"],
  },
  {
    id: "graphic-design",
    title: "Graphic Design",
    category: "Design",
    description:
      "Master the art of visual communication and digital design principles.",
    icon: <Pencil className="w-10 h-10" />,
    duration: "4 Months",
    skills: ["Visual Design", "Branding", "Typography", "Layout"],
  },
  {
    id: "ux-ui-design",
    title: "UX/UI Design",
    category: "Design",
    description:
      "Design intuitive user experiences and beautiful interfaces that users love.",
    icon: <Wand2 className="w-10 h-10" />,
    duration: "5 Months",
    skills: ["User Research", "Wireframing", "Prototyping", "Testing"],
  },
  {
    id: "ai-engineering",
    title: "AI Engineering",
    category: "Data & AI",
    description:
      "Deploy and manage AI models in production for real-world applications.",
    icon: <Zap className="w-10 h-10" />,
    duration: "6 Months",
    skills: ["LLMs", "Prompt Engineering", "AI Ethics", "Production Systems"],
  },
];

const CATEGORIES = [
  "All",
  "Engineering",
  "Data & AI",
  "Cloud & Security",
  "Design",
];
const INITIAL_COUNT = 6;

const CoursesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const filteredPaths =
    selectedCategory === "All"
      ? careerPaths
      : careerPaths.filter((path) => path.category === selectedCategory);
  const displayedPaths = showAll
    ? filteredPaths
    : filteredPaths.slice(0, INITIAL_COUNT);

  return (
    <section id="explore" className="home-section courses-section">
      <div className="home-container">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">FIND YOUR DIRECTION</span>
            <h2>
              One spark.
              <br />
              So many ways to <em>grow.</em>
            </h2>
          </div>
          <p>
            There’s more than one way into tech. Find what excites you, then
            turn that curiosity into skills you can use.
          </p>
        </div>
        <div className="course-filters" aria-label="Filter career paths">
          {CATEGORIES.map((category) => (
            <button
              type="button"
              key={category}
              aria-pressed={selectedCategory === category}
              onClick={() => {
                setSelectedCategory(category);
                setShowAll(false);
              }}
            >
              {category === "All" ? "All paths" : category}
              <span>
                {category === "All"
                  ? careerPaths.length
                  : careerPaths.filter((path) => path.category === category)
                      .length}
              </span>
            </button>
          ))}
        </div>
        <p className="sr-only" role="status">
          Showing {displayedPaths.length} of {filteredPaths.length}{" "}
          {selectedCategory === "All" ? "" : selectedCategory} career paths.
        </p>
        <div className="career-grid">
          {displayedPaths.map((path) => (
            <article key={path.id} className="career-card">
              <div
                className={`career-art art-${path.category === "Data & AI" ? "data" : path.category === "Design" ? "design" : path.category === "Cloud & Security" ? "cloud" : "code"}`}
                aria-hidden="true"
              >
                <span className="art-category">{path.category}</span>
                <span className="art-orbit" />
                {path.category === "Data & AI" ? (
                  <div className="art-chart">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <div className="chart-line" />
                  </div>
                ) : path.category === "Design" || path.id === "frontend" ? (
                  <div className="art-window art-design-window">
                    <div className="window-dots">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="design-preview">
                      <span />
                      <div>
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                    <span className="design-cursor">↖</span>
                  </div>
                ) : path.category === "Cloud & Security" ? (
                  <div className="art-cloud-icon">
                    {path.icon}
                    <span />
                    <span />
                  </div>
                ) : (
                  <div className="art-window">
                    <div className="window-dots">
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
                )}
                <span className="art-icon">{path.icon}</span>
              </div>
              <div className="career-card-content">
                <div className="career-meta">
                  <span>{path.category}</span>
                  <span>
                    <Clock size={13} /> {path.duration}
                  </span>
                </div>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <div className="career-skills">
                  {path.skills.slice(0, 3).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <Link
                  to="/signup"
                  className="career-link"
                  aria-label={`Explore ${path.title}`}
                >
                  Explore this path <ArrowRight size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        {filteredPaths.length > INITIAL_COUNT && (
          <div className="courses-more">
            <span>
              {displayedPaths.length} of {filteredPaths.length} paths. Find the
              one that speaks to you.
            </span>
            <button
              type="button"
              className="home-button home-button-outline"
              onClick={() => {
                if (showAll)
                  document
                    .getElementById("explore")
                    ?.scrollIntoView({ behavior: "instant" });
                setShowAll(!showAll);
              }}
            >
              {showAll
                ? "Show fewer paths"
                : `Explore all ${filteredPaths.length} paths`}
              <ArrowRight size={17} />
            </button>
          </div>
        )}
        <div className="path-help">
          <span>
            Not sure where to start?{" "}
            <strong>You don’t have to figure it out alone.</strong>
          </span>
          <Link to="/signup">
            Find your direction with a mentor <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
