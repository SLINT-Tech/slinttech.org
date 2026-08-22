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
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { SkillBadge } from "../Components/SkillBadge";

interface CareerPath {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  color: string;
  duration: string;
  skills: string[];
  learningPlatform: string;
  languages: string[];
  frameworks: string[];
}

const careerPaths: CareerPath[] = [
  {
    id: "software-engineering",
    title: "Software Engineering",
    category: "Engineering",
    description:
      "Master the complete software development lifecycle from architecture to deployment.",
    icon: <Zap className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    color: "from-[#008080] to-[#00a3a3]",
    duration: "6 Months",
    skills: ["System Design", "Architecture", "SDLC", "Testing"],
    learningPlatform: "Coursera",
    languages: ["Python", "Java", "C++", "Go"],
    frameworks: ["Spring", "Django", "ASP.NET", "Express.js"],
  },
  {
    id: "frontend",
    title: "Front-end Development",
    category: "Engineering",
    description:
      "Build stunning, responsive user interfaces with modern frameworks and tools.",
    icon: <Palette className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
    color: "from-[#00a3a3] to-[#008080]",
    duration: "4 Months",
    skills: ["React", "TypeScript", "CSS", "UX/UI"],
    learningPlatform: "Frontend Masters",
    languages: ["JavaScript", "TypeScript", "HTML", "CSS"],
    frameworks: ["React", "Vue.js", "Next.js", "Svelte"],
  },
  {
    id: "backend",
    title: "Back-end Development",
    category: "Engineering",
    description:
      "Design scalable backend systems and manage data with confidence.",
    icon: <Server className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop",
    color: "from-[#008080] to-[#006666]",
    duration: "5 Months",
    skills: ["Node.js", "Databases", "APIs", "Security"],
    learningPlatform: "Codecademy",
    languages: ["Node.js", "Python", "PHP", "Ruby"],
    frameworks: ["Express", "FastAPI", "Django", "Rails"],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    category: "Cloud & Security",
    description:
      "Protect systems and data from threats in an increasingly digital world.",
    icon: <Shield className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
    color: "from-[#006666] to-[#008080]",
    duration: "6 Months",
    skills: [
      "Penetration Testing",
      "Encryption",
      "Compliance",
      "Incident Response",
    ],
    learningPlatform: "Coursera",
    languages: ["Python", "Bash", "PowerShell", "C"],
    frameworks: ["Metasploit", "Burp Suite", "Wireshark", "Nmap"],
  },
  {
    id: "cloud",
    title: "Cloud Computing",
    category: "Cloud & Security",
    description: "Deploy and manage applications on leading cloud platforms.",
    icon: <Cloud className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop",
    color: "from-[#00a3a3] to-[#006666]",
    duration: "5 Months",
    skills: ["AWS", "Docker", "Kubernetes", "Infrastructure"],
    learningPlatform: "Frontend Masters",
    languages: ["YAML", "HCL", "Python", "Bash"],
    frameworks: ["Terraform", "Ansible", "Docker", "Kubernetes"],
  },
  {
    id: "data-analysis",
    title: "Data Analysis",
    category: "Data & AI",
    description: "Transform raw data into actionable business insights.",
    icon: <BarChart3 className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    color: "from-[#008080] to-[#00a3a3]",
    duration: "4 Months",
    skills: ["Excel", "SQL", "Visualization", "Statistics"],
    learningPlatform: "Codecademy",
    languages: ["Python", "R", "SQL", "JavaScript"],
    frameworks: ["Pandas", "NumPy", "Matplotlib", "Tableau"],
  },
  {
    id: "data-science",
    title: "Data Science",
    category: "Data & AI",
    description:
      "Extract insights from complex data using statistics, ML, and visualization.",
    icon: <Database className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop",
    color: "from-[#006666] to-[#008080]",
    duration: "6 Months",
    skills: ["Statistical Analysis", "Predictive Modeling", "Big Data", "ETL"],
    learningPlatform: "Coursera",
    languages: ["Python", "R", "SQL", "Scala"],
    frameworks: ["Pandas", "TensorFlow", "Apache Spark", "Jupyter"],
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    category: "Data & AI",
    description:
      "Build intelligent systems that learn from data and make predictions.",
    icon: <Brain className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
    color: "from-[#00a3a3] to-[#008080]",
    duration: "6 Months",
    skills: ["Deep Learning", "Neural Networks", "Model Training", "MLOps"],
    learningPlatform: "Coursera",
    languages: ["Python", "R", "Julia", "Scala"],
    frameworks: ["TensorFlow", "PyTorch", "Scikit-learn", "Keras"],
  },
  {
    id: "mobile-development",
    title: "Mobile Development",
    category: "Engineering",
    description:
      "Create powerful mobile applications for iOS and Android platforms.",
    icon: <Smartphone className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    color: "from-[#008080] to-[#006666]",
    duration: "5 Months",
    skills: ["Native Apps", "Cross-platform", "UI Design", "APIs"],
    learningPlatform: "Codecademy",
    languages: ["Swift", "Kotlin", "JavaScript", "Dart"],
    frameworks: ["React Native", "Flutter", "Xcode", "Android Studio"],
  },
  {
    id: "graphic-design",
    title: "Graphic Design",
    category: "Design",
    description:
      "Master the art of visual communication and digital design principles.",
    icon: <Pencil className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop",
    color: "from-[#006666] to-[#00a3a3]",
    duration: "4 Months",
    skills: ["Visual Design", "Branding", "Typography", "Layout"],
    learningPlatform: "Frontend Masters",
    languages: ["Design Thinking", "Color Theory", "Composition", "Motion"],
    frameworks: ["Adobe CC", "Figma", "Sketch", "Blender"],
  },
  {
    id: "ux-ui-design",
    title: "UX/UI Design",
    category: "Design",
    description:
      "Design intuitive user experiences and beautiful interfaces that users love.",
    icon: <Wand2 className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=250&fit=crop",
    color: "from-[#00a3a3] to-[#006666]",
    duration: "5 Months",
    skills: ["User Research", "Wireframing", "Prototyping", "Testing"],
    learningPlatform: "Coursera",
    languages: [
      "User Psychology",
      "Information Architecture",
      "Accessibility",
      "A/B Testing",
    ],
    frameworks: ["Figma", "Adobe XD", "Prototype.io", "InVision"],
  },
  {
    id: "ai-engineering",
    title: "AI Engineering",
    category: "Data & AI",
    description:
      "Deploy and manage AI models in production for real-world applications.",
    icon: <Zap className="w-10 h-10" />,
    image:
      "https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=400&h=250&fit=crop",
    color: "from-[#008080] to-[#00a3a3]",
    duration: "6 Months",
    skills: ["LLMs", "Prompt Engineering", "AI Ethics", "Production Systems"],
    learningPlatform: "Frontend Masters",
    languages: ["Python", "JavaScript", "CUDA", "SQL"],
    frameworks: ["OpenAI API", "LangChain", "Hugging Face", "Anthropic"],
  },
];

const CATEGORIES = ["All", "Engineering", "Data & AI", "Cloud & Security", "Design"];
const INITIAL_COUNT = 6;

const CoursesSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const handleJoinCommunity = () => {
    navigate("/signup");
  };

  const filteredPaths =
    selectedCategory === "All"
      ? careerPaths
      : careerPaths.filter((path) => path.category === selectedCategory);

  const displayedPaths = showAll
    ? filteredPaths
    : filteredPaths.slice(0, INITIAL_COUNT);

  const hiddenCount = filteredPaths.length - displayedPaths.length;

  return (
    <section
      id="explore"
      className="bg-white py-24 transition-colors dark:bg-gray-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl">
          <span className="text-xs font-semibold tracking-[0.18em] text-[#008080] uppercase dark:text-teal-400">
            Explore
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Career <span className="text-[#008080] dark:text-teal-400">Paths</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Choose your path and start your journey with expert mentorship and
            hands-on learning. Every track pairs you with a mentor and ends with
            work you can show an employer.
          </p>
        </div>

        {/* Filter */}
        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const count =
              category === "All"
                ? careerPaths.length
                : careerPaths.filter((path) => path.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setShowAll(false);
                }}
                aria-pressed={isActive}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#1E1E1E] text-white dark:bg-teal-500 dark:text-gray-950"
                    : "bg-gray-900/[0.05] text-gray-700 hover:bg-gray-900/10 dark:bg-white/[0.07] dark:text-gray-300 dark:hover:bg-white/12"
                }`}
              >
                {category}
                <span className={isActive ? "ml-2 opacity-70" : "ml-2 opacity-50"}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedPaths.map((path) => {
            const stack = [...path.languages, ...path.frameworks];
            const shown = stack.slice(0, 4);
            const rest = stack.length - shown.length;

            return (
              <article
                key={path.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-900/10 transition hover:ring-[#008080]/40 dark:bg-white/[0.04] dark:ring-white/10 dark:hover:ring-teal-400/40"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={path.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900">
                    <Clock className="h-3.5 w-3.5" />
                    {path.duration}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-400/12 dark:text-teal-400">
                      <span className="[&>svg]:h-5 [&>svg]:w-5">{path.icon}</span>
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg leading-snug font-bold text-gray-900 dark:text-white">
                        {path.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {path.category}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {path.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {shown.map((item) => (
                      <SkillBadge key={item} skill={item} />
                    ))}
                    {rest > 0 && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400">
                        +{rest} more
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinCommunity}
                    className="mt-5 flex cursor-pointer items-center justify-between border-t border-gray-900/10 pt-4 text-sm font-semibold text-gray-900 transition group-hover:text-[#008080] dark:border-white/10 dark:text-white dark:group-hover:text-teal-400"
                  >
                    Start this path
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredPaths.length > INITIAL_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (showAll) {
                  document
                    .getElementById("explore")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                setShowAll(!showAll);
              }}
              className="cursor-pointer rounded-full border border-gray-900/20 px-7 py-3 font-semibold text-gray-900 transition hover:border-[#008080] hover:text-[#008080] dark:border-white/25 dark:text-white dark:hover:border-teal-400 dark:hover:text-teal-400"
            >
              {showAll ? "Show fewer paths" : `Show ${hiddenCount} more paths`}
            </button>
          </div>
        )}

        {/* Closing CTA */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-[#008080]/[0.08] p-8 text-center sm:p-12 dark:bg-teal-400/[0.08]">
          <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
            Not sure which path is yours?
          </h3>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Join and we'll match you with a mentor who works in the field. They
            will help you pick the track that fits where you want to end up.
          </p>
          <button
            type="button"
            onClick={handleJoinCommunity}
            className="mx-auto mt-7 flex cursor-pointer items-center gap-2 rounded-full bg-[linear-gradient(90deg,#333333_0%,#1E1E1E_100%)] px-8 py-3.5 font-semibold text-white transition hover:opacity-90 dark:bg-[linear-gradient(90deg,#008080_0%,#00a3a3_100%)]"
          >
            Join our community
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};


export default CoursesSection;
