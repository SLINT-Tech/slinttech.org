import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { SkillBadge } from "../Components/SkillBadge";
import { careerTracks } from "../data/careerTracks";
import { learningPartners, type PartnerLogo } from "../data/learningPartners";

const trackTitles = new Map(careerTracks.map((track) => [track.id, track.title]));

const PartnerLogoMark: React.FC<{ logo: PartnerLogo }> = ({ logo }) => {
  const size = { width: logo.width, height: logo.height, loading: "lazy", decoding: "async" } as const;

  return (
    <div className="flex min-h-12 flex-wrap items-center gap-3">
      {/* display:none drops the other theme's image from the accessibility tree, so the name is announced once */}
      <img
        src={logo.light}
        alt={logo.alt}
        {...size}
        className={`h-12 w-auto max-w-full object-contain object-left ${logo.dark ? "dark:hidden" : ""}`}
      />
      {logo.dark && (
        <img
          src={logo.dark}
          alt={logo.alt}
          {...size}
          className="hidden h-12 w-auto max-w-full object-contain object-left dark:block"
        />
      )}
      {logo.wordmark && (
        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {logo.wordmark}
        </span>
      )}
    </div>
  );
};

const LearningPartnersSection: React.FC = () => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate("/signup");
  };

  return (
    <section
      id="partners"
      className="bg-[#F8F8F8] py-24 transition-colors focus:outline-none dark:bg-gray-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold tracking-[0.18em] text-[#006666] uppercase dark:text-teal-400">
            Learning partners
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Learn on{" "}
            <span className="text-[#008080] dark:text-teal-400">world-class platforms</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            SLINT Tech learners get access to leading learning platforms through
            our partnerships, so you can build skills with the same tools used by
            professionals worldwide.
          </p>
        </div>

        <ul role="list" className="mt-12 grid gap-6 md:grid-cols-2">
          {learningPartners.map((partner) => {
            const labelId = `partner-${partner.id}-tracks`;
            // a track renamed or removed in careerTracks drops its chip rather than breaking the page
            const tracks = partner.trackIds.flatMap((id) => trackTitles.get(id) ?? []);

            return (
              <li
                key={partner.id}
                className="flex min-w-0 flex-col rounded-2xl bg-white p-6 ring-1 ring-gray-900/10 transition-shadow hover:ring-[#008080]/40 sm:p-8 dark:bg-white/[0.04] dark:ring-white/10 dark:hover:ring-teal-400/40"
              >
                <PartnerLogoMark logo={partner.logo} />

                <h3 className="mt-6 text-xl leading-snug font-bold text-gray-900 dark:text-white">
                  {partner.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  {partner.description}
                </p>

                {tracks.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span id={labelId} className="text-base font-semibold text-gray-700 dark:text-gray-200">
                      Used in
                    </span>
                    <ul role="list" aria-labelledby={labelId} className="flex flex-wrap gap-1.5">
                      {tracks.map((title) => (
                        <li key={title}>
                          <SkillBadge skill={title} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
            Access is arranged through SLINT Tech after you join.
          </p>
          <button
            type="button"
            onClick={handleJoin}
            className="flex max-w-full cursor-pointer items-center gap-2 rounded-full bg-[#008080] px-8 py-3.5 text-center font-semibold text-white transition-colors hover:bg-[#006666] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#008080] dark:focus-visible:outline-teal-400"
          >
            Join SLINT Tech
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LearningPartnersSection;
