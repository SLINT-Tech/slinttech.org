import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { CareerCover } from "../Components/CareerCover";
import { SkillBadge } from "../Components/SkillBadge";
import { careerTracks } from "../data/careerTracks";

const CoursesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinCommunity = () => {
    navigate("/signup");
  };

  return (
    <section
      id="explore"
      className="bg-white py-24 transition-colors focus:outline-none dark:bg-gray-950"
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

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {careerTracks.map((track) => (
            <article
              key={track.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-900/10 transition hover:ring-[#008080]/40 motion-safe:hover:-translate-y-1 dark:bg-white/[0.04] dark:ring-white/10 dark:hover:ring-teal-400/40"
            >
              <CareerCover variant={track.cover} />

              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="font-semibold tracking-wide text-[#006666] uppercase dark:text-teal-400">
                    {track.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {track.duration}
                  </span>
                </div>

                <h3 className="mt-3 text-xl leading-snug font-bold text-gray-900 dark:text-white">
                  {track.title}
                </h3>

                <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  {track.summary}
                </p>

                {track.specialisations && (
                  <p className="mt-3 text-base text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">Specialisations:</span>{" "}
                    {track.specialisations.join(", ")}
                  </p>
                )}

                <ul role="list" aria-label="Skills" className="mt-4 mb-6 flex flex-wrap gap-1.5">
                  {track.skills.map((skill) => (
                    <li key={skill}>
                      <SkillBadge skill={skill} />
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={handleJoinCommunity}
                  aria-label={`Start this path: ${track.title}`}
                  className="mt-auto flex cursor-pointer items-center justify-between border-t border-gray-900/10 pt-4 text-base font-semibold text-gray-900 transition group-hover:text-[#008080] focus-visible:text-[#008080] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#008080] dark:border-white/10 dark:text-white dark:group-hover:text-teal-400 dark:focus-visible:text-teal-400 dark:focus-visible:outline-teal-400"
                >
                  Start this path
                  <ArrowRight
                    className="h-5 w-5 transition-transform motion-safe:group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </article>
          ))}
        </div>

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
            className="mx-auto mt-7 flex max-w-full cursor-pointer items-center gap-2 rounded-full bg-[#008080] px-8 py-3.5 text-center font-semibold text-white transition-colors hover:bg-[#006666]"
          >
            Join our community
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};


export default CoursesSection;
