import React, { useEffect, useState } from "react";
import { Eye, Target, Sparkles, Users, Rocket, Heart } from "lucide-react";

const MissionVisionSection: React.FC = () => {
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

  return (
    <section
      className={`py-20 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 transition-colors duration-300`}
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#008080] to-[#00a3a3] bg-clip-text text-transparent">
          Our Mission & Vision
        </h2>
        <p
          className={`text-lg max-w-2xl mx-auto ${
            isDark ? "text-slate-300" : "text-[#9C9C9C]"
          }`}
        >
          Empowering the next generation of tech leaders through education,
          mentorship, and community.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
            isDark ? "bg-slate-900" : "bg-white"
          }`}
        >
          <div className="p-8">
            <div className="mb-6 inline-flex">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#008080] to-[#00a3a3]">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#008080] to-[#00a3a3] bg-clip-text text-transparent">
              Our Vision
            </h3>

            <p
              className={`text-base leading-relaxed mb-6 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              To empower a new generation of selfless, innovative leaders,
              united in their commitment to transform society through
              technology, integrity, and a deep sense of purpose.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#008080] flex-shrink-0 mt-0.5" />
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Break barriers and challenge the status quo
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-[#00a3a3] flex-shrink-0 mt-0.5" />
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Lead with courage and innovation
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-[#008080] flex-shrink-0 mt-0.5" />
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Create a prosperous society that uplifts communities
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
            isDark ? "bg-slate-900" : "bg-white"
          }`}
        >
          <div className="p-8">
            <div className="mb-6 inline-flex">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#00a3a3] to-[#008080]">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00a3a3] to-[#008080] bg-clip-text text-transparent">
              Our Mission
            </h3>

            <p
              className={`text-base leading-relaxed mb-6 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Create a community of young people passionate about learning and
              building together through hands-on education, mentorship, and
              values-driven leadership training.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#00a3a3] flex-shrink-0 mt-0.5" />
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Build a community passionate about learning together
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#008080] flex-shrink-0 mt-0.5" />
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Foster ethical innovation and responsibility
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-[#00a3a3] flex-shrink-0 mt-0.5" />
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Nurture individuals who inspire positive change
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;