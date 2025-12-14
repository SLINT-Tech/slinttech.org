import React, { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { CheckCircle2, Award, Verified } from "lucide-react";

interface Verification {
  id: string;
  name: string;
  program: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const verifications: Verification[] = [
  {
    id: "google-nonprofit",
    name: "Google for Nonprofits",
    program: "Program Participant",
    description:
      "Access to Google products that help solve the challenges nonprofits face: finding new donors and volunteers, working more efficiently.",
    color: "from-blue-500 to-blue-600",
    icon: <Award className="w-8 h-8 text-blue-500" />,
  },
  {
    id: "microsoft-nonprofit",
    name: "Microsoft Non-Profit",
    program: "Verified Partner",
    description:
      "Recognized by Microsoft for our mission to democratize tech education and empower underrepresented communities.",
    color: "from-slate-500 to-slate-600",
    icon: <Verified className="w-8 h-8 text-slate-600 dark:text-slate-300" />,
  },
  {
    id: "slack-nonprofit",
    name: "Slack for Non-Profits",
    program: "Program Participant",
    description:
      "Approved as a non-profit organization by Slack to enhance team collaboration and community engagement.",
    color: "from-[#008080] to-[#00a3a3]",
    icon: <CheckCircle2 className="w-8 h-8 text-[#008080]" />,
  },
  {
    id: "techsoup",
    name: "Tech Soup",
    program: "Registered Organization",
    description:
      "Listed on Tech Soup as a trusted non-profit organization connecting us with discounted technology solutions.",
    color: "from-orange-500 to-orange-600",
    icon: <Award className="w-8 h-8 text-orange-500" />,
  },
];

const VerificationCard: React.FC<{ verification: Verification; isDark: boolean }> = ({
  verification,
  isDark,
}) => (
  <div
    className={`relative overflow-hidden rounded-xl backdrop-blur-xl transition-all duration-300 mx-3 w-80 flex-shrink-0 h-full ${
      isDark
        ? "bg-slate-800/60 border border-slate-700/50 hover:border-teal-500/50"
        : "bg-white border border-slate-200 hover:border-[#008080]/30 shadow-sm"
    }`}
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${verification.color} opacity-5`}
    />
    <div className="relative p-5 z-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">{verification.icon}</div>
        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-bold leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {verification.name}
          </h3>
          <p
            className={`text-xs ${
              isDark ? "text-teal-400" : "text-[#008080]"
            }`}
          >
            {verification.program}
          </p>
        </div>
      </div>
      <p
        className={`text-xs leading-relaxed ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {verification.description}
      </p>
    </div>
  </div>
);

const NonprofitVerificationSection: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="certifications"
      className={`py-16 transition-colors duration-300 overflow-hidden ${
        isDark ? "bg-slate-950" : "bg-gradient-to-b from-slate-50 to-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div
              className={`p-3 rounded-full ${
                isDark ? "bg-teal-900/30" : "bg-[#008080]/10"
              }`}
            >
              <CheckCircle2 className="w-8 h-8 text-[#008080]" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-[#008080] to-[#00a3a3] bg-clip-text text-transparent">
            Trusted & Verified
          </h2>
          <p
            className={`text-base max-w-xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            A verified non-profit recognized by leading tech companies,
            committed to transparency and quality education.
          </p>
        </div>
      </div>

      <div className="overflow-x-hidden overflow-y-hidden">
        <Marquee
          gradient={true}
          gradientColor={isDark ? "#020617" : "#f8fafc"}
          gradientWidth={80}
          speed={40}
          pauseOnHover={true}
          className="py-2 [&>div]:items-stretch"
        >
          {verifications.map((verification) => (
            <VerificationCard
              key={verification.id}
              verification={verification}
              isDark={isDark}
            />
          ))}
          {verifications.map((verification) => (
            <VerificationCard
              key={`${verification.id}-duplicate`}
              verification={verification}
              isDark={isDark}
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default NonprofitVerificationSection;
