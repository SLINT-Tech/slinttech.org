import React from "react";
import { Award, CheckCircle2, ShieldCheck, Verified } from "lucide-react";

interface Verification {
  id: string;
  name: string;
  program: string;
  description: string;
  icon: React.ReactNode;
}

const verifications: Verification[] = [
  {
    id: "google-nonprofit",
    name: "Google for Nonprofits",
    program: "Program member",
    description:
      "We participate in the Google for Nonprofits program, which provides access to Google tools and resources designed for nonprofit organizations.",
    icon: <Award className="h-5 w-5" />,
  },
  {
    id: "microsoft-nonprofit",
    name: "Microsoft Nonprofits",
    program: "Program member",
    description:
      "We are enrolled in the Microsoft Nonprofits program, enabling access to discounted software and cloud services for our organization.",
    icon: <Verified className="h-5 w-5" />,
  },
  {
    id: "slack-nonprofit",
    name: "Slack for Nonprofits",
    program: "Program member",
    description:
      "We participate in Slack's nonprofit program, which provides collaboration tools to support our team communication.",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    id: "techsoup",
    name: "TechSoup",
    program: "Registered member",
    description:
      "We are registered with TechSoup, a nonprofit that connects organizations like ours with discounted technology products and services.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const NonprofitVerificationSection: React.FC = () => (
  <section
    id="certifications"
    className="bg-[#F8F8F8] py-24 transition-colors dark:bg-gray-950"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold tracking-[0.18em] text-[#008080] uppercase dark:text-teal-400">
          Verified
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
          Nonprofit program{" "}
          <span className="text-[#008080] dark:text-teal-400">memberships</span>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          We are members of nonprofit support programs that provide the tools
          and resources behind the training we deliver.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {verifications.map((verification) => (
          <li
            key={verification.id}
            className="flex flex-col rounded-2xl bg-white p-6 ring-1 ring-gray-900/10 transition hover:ring-[#008080]/40 dark:bg-white/[0.04] dark:ring-white/10 dark:hover:ring-teal-400/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-400/12 dark:text-teal-400">
              {verification.icon}
            </span>

            <h3 className="mt-5 leading-snug font-bold text-gray-900 dark:text-white">
              {verification.name}
            </h3>
            <span className="mt-1.5 inline-flex w-fit rounded-full bg-[#008080]/10 px-2.5 py-1 text-xs font-semibold text-[#008080] dark:bg-teal-400/12 dark:text-teal-400">
              {verification.program}
            </span>

            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {verification.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default NonprofitVerificationSection;
