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
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { SkillBadge } from "../Components/SkillBadge";

interface CareerPath {
  id: string;
  title: string;
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

const CoursesSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );
  const [showAll, setShowAll] = React.useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleJoinCommunity = () => {
    navigate("/signup");
  };

  const categories = [
    "All",
    ...Array.from(new Set(careerPaths.map((path) => path.title))),
  ];

  const filteredPaths =
    selectedCategory && selectedCategory !== "All"
      ? careerPaths.filter((path) => path.title === selectedCategory)
      : careerPaths;

  const displayedPaths =
    !selectedCategory && !showAll ? filteredPaths.slice(0, 6) : filteredPaths;

  const hasMore = !selectedCategory && filteredPaths.length > 6;

  return (
    <section
      id="explore"
      className={`py-20 transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#008080] to-[#00a3a3] bg-clip-text text-transparent">
            Career Paths
          </h2>
          <p
            className={`text-lg max-w-2xl ${
              isDark ? "text-slate-300" : "text-[#9C9C9C]"
            }`}
          >
            Choose your path and start your journey with expert mentorship and
            hands-on learning. Join our community to unlock your potential in
            these high-demand fields.
          </p>

          <div className="flex flex-wrap gap-3 justify-start mt-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category === "All" ? null : category);
                  setShowAll(false);
                }}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                  selectedCategory === category ||
                  (selectedCategory === null && category === "All")
                    ? "bg-gradient-to-r from-[#008080] to-[#00a3a3] text-white"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedPaths.map((path) => (
            <div
              key={path.id}
              className={`group relative overflow-hidden rounded-3xl backdrop-blur-2xl transition-all duration-300 cursor-pointer h-full min-h-[520px] hover:scale-[1.02] ${
                isDark
                  ? "bg-teal-900/30 border border-teal-400/30"
                  : "bg-white/50 border border-slate-200/60"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${path.color} ${
                  isDark ? "opacity-10" : "opacity-0"
                }`}
              />

              <div className="relative p-6 z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[#008080] dark:text-[#00a3a3] flex-shrink-0">
                    {path.icon}
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {path.title}
                  </h3>
                </div>

                <p
                  className={`text-sm mb-4 line-clamp-3 ${
                    isDark ? "text-slate-300" : "text-[#9C9C9C]"
                  }`}
                >
                  {path.description}
                </p>

                <div className="relative h-32 overflow-hidden rounded-2xl mb-4">
                  <img
                    src={path.image}
                    alt={path.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${path.color} opacity-30`}
                  />
                </div>

                <div
                  className={`text-xs mb-4 space-y-2 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {path.duration}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Platform: {path.learningPlatform}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {path.skills.slice(0, 2).map((skill) => (
                    <SkillBadge key={skill} skill={skill} isDark={isDark} />
                  ))}
                </div>

                <div className="flex-1 mb-4">
                  <div className="mb-3">
                    <p
                      className={`text-xs font-semibold mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Languages:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {path.languages.map((lang) => (
                        <SkillBadge key={lang} skill={lang} isDark={isDark} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-xs font-semibold mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Frameworks:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {path.frameworks.map((framework) => (
                        <SkillBadge
                          key={framework}
                          skill={framework}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && !showAll && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowAll(true)}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Load More ({filteredPaths.length - 6} more)
            </button>
          </div>
        )}

        {hasMore && showAll && (
          <div className="text-center mb-12">
            <button
              onClick={() => {
                setShowAll(false);
                document
                  .getElementById("explore")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Show Less
            </button>
          </div>
        )}

        <div
          className={`text-center p-8 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${
            isDark
              ? "bg-white/10 border border-white/20"
              : "bg-white/40 border border-white/60"
          }`}
        >
          <h3
            className={`text-2xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Ready to Start Your Journey?
          </h3>
          <p
            className={`mb-6 max-w-2xl mx-auto ${
              isDark ? "text-slate-300" : "text-[#9C9C9C]"
            }`}
          >
            Join our community of passionate learners and get matched with
            expert mentors who will guide you through your chosen career path.
          </p>
          <button
            onClick={handleJoinCommunity}
            className="bg-gradient-to-r from-[#008080] to-[#00a3a3] hover:from-[#006666] hover:to-[#008080] text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer font-semibold"
          >
            Join Our Community
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
