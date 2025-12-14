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
    program: "Program Member",
    description:
      "We participate in the Google for Nonprofits program, which provides access to Google tools and resources designed for nonprofit organizations.",
    color: "from-blue-500 to-blue-600",
    icon: <Award className="w-8 h-8 text-blue-500" />,
  },
  {
    id: "microsoft-nonprofit",
    name: "Microsoft Nonprofits",
    program: "Program Member",
    description:
      "We are enrolled in the Microsoft Nonprofits program, enabling access to discounted software and cloud services for our organization.",
    color: "from-slate-500 to-slate-600",
    icon: <Verified className="w-8 h-8 text-slate-600 dark:text-slate-300" />,
  },
  {
    id: "slack-nonprofit",
    name: "Slack for Nonprofits",
    program: "Program Member",
    description:
      "We participate in Slack's nonprofit program, which provides collaboration tools to support our team communication.",
    color: "from-[#008080] to-[#00a3a3]",
    icon: <CheckCircle2 className="w-8 h-8 text-[#008080]" />,
  },
  {
    id: "techsoup",
    name: "TechSoup",
    program: "Registered Member",
    description:
      "We are registered with TechSoup, a nonprofit that connects organizations like ours with discounted technology products and services.",
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
      className={`py-16 transition-colors duration-300 ${
        isDark ? "bg-slate-950" : "bg-gradient-to-b from-slate-50 to-white"
      }`}
      style={{ overflow: 'hidden', maxWidth: '100vw' }}
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
            A registered nonprofit organization with access to programs
            that support our mission of transparency and quality education.
          </p>
        </div>
      </div>

      <div
        className="w-full"
        style={{
          overflow: 'hidden',
          maxWidth: '100vw'
        }}
      >
        <Marquee
          gradient={true}
          gradientColor={isDark ? "#020617" : "#f8fafc"}
          gradientWidth={80}
          speed={40}
          pauseOnHover={true}
          style={{ overflow: 'hidden' }}
        >
          <div className="flex items-stretch py-4">
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
          </div>
        </Marquee>
      </div>
    </section>
  );
};

export default NonprofitVerificationSection;
