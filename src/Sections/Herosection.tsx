import { ArrowUpRight, GraduationCap, Users } from 'lucide-react';

const HeroSection = () => {
    const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section
            id="home"
            className="relative -mt-20 overflow-hidden bg-[#F8F8F8] pt-20 dark:bg-gray-950"
        >
            {/* Teal wash + spotlight behind the photo */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_18%,rgba(0,128,128,0.16),rgba(0,128,128,0.05)_45%,transparent_72%)] dark:bg-[radial-gradient(120%_90%_at_78%_18%,rgba(45,212,191,0.16),rgba(45,212,191,0.04)_45%,transparent_72%)]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[-6rem] right-[-6rem] hidden h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),transparent_65%)] blur-2xl lg:block dark:bg-[radial-gradient(circle,rgba(0,128,128,0.18),transparent_65%)]"
            />

            {/* Hairline cross, echoing the grid the platform is built on */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-24 right-16 hidden xl:block"
            >
                <div className="relative h-40 w-40">
                    <span className="absolute top-0 left-1/2 h-full w-px bg-[#008080]/25 dark:bg-teal-400/25" />
                    <span className="absolute top-1/2 left-0 h-px w-full bg-[#008080]/25 dark:bg-teal-400/25" />
                    <span className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#008080]/40 dark:bg-teal-400/40" />
                </div>
            </div>

            <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:px-8 lg:pt-24">
                {/* Left column */}
                <div className="lg:pb-20">
                    {/* Social proof: member cluster + count chip, then the claim */}
                    <div className="hero-rise flex items-center gap-3">
                        <div className="flex items-center -space-x-3">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008080]/12 ring-2 ring-white dark:bg-teal-400/15 dark:ring-gray-950"
                                >
                                    <Users className="h-4 w-4 text-[#008080] dark:text-teal-400" />
                                </span>
                            ))}
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E1E1E] text-xs font-bold text-white ring-2 ring-white dark:bg-teal-500 dark:ring-gray-950">
                                100+
                            </span>
                        </div>
                        <div className="rounded-full bg-white px-5 py-2.5 shadow-sm ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                Trusted by 100+ students
                            </span>
                        </div>
                    </div>

                    <h1 className="hero-rise mt-7 text-[2.25rem] leading-[1.02] font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-[3.5rem] dark:text-white" style={{ animationDelay: '80ms' }}>
                        Grow Without <span className="text-[#008080] dark:text-teal-400">Limits.</span>
                        <br />
                        <span className="text-[#008080] dark:text-teal-400">Upskill</span> Beyond Borders.
                    </h1>

                    <p className="hero-rise mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300" style={{ animationDelay: '160ms' }}>
                        Training, mentorship, and the support you need. Pick a career track, work
                        one-on-one with a mentor, and build a portfolio that gets you hired. We're
                        invested in your future.
                    </p>

                    <div className="hero-rise mt-12 grid max-w-lg grid-cols-2 gap-4" style={{ animationDelay: '240ms' }}>
                        <a
                            href="#explore"
                            onClick={(e) => scrollTo(e, 'explore')}
                            className="group rounded-2xl bg-[#008080]/[0.14] p-5 transition hover:bg-[#008080]/20 dark:bg-teal-400/[0.12] dark:hover:bg-teal-400/20"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900">
                                    <GraduationCap className="h-4 w-4 text-[#008080] dark:text-teal-400" />
                                </span>
                                <span className="truncate font-semibold text-gray-900 dark:text-white">
                                    Career tracks
                                </span>
                            </div>
                            <div className="mt-4 border-t border-gray-900/10 pt-4 dark:border-white/10" />
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    12
                                </span>
                                <ArrowUpRight className="h-5 w-5 text-gray-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-teal-400" />
                            </div>
                        </a>

                        <a
                            href="#features"
                            onClick={(e) => scrollTo(e, 'features')}
                            className="group rounded-2xl bg-gray-900/[0.06] p-5 transition hover:bg-gray-900/10 dark:bg-white/[0.07] dark:hover:bg-white/12"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900">
                                    <Users className="h-4 w-4 text-[#008080] dark:text-teal-400" />
                                </span>
                                <span className="truncate font-semibold text-gray-900 dark:text-white">
                                    Mentorship
                                </span>
                            </div>
                            <div className="mt-4 border-t border-gray-900/10 pt-4 dark:border-white/10" />
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    1-on-1
                                </span>
                                <ArrowUpRight className="h-5 w-5 text-gray-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-teal-400" />
                            </div>
                        </a>
                    </div>
                </div>

                {/* Right column: full figure, aligned to the bottom of the section */}
                <div className="hero-rise relative flex items-end justify-center" style={{ animationDelay: '120ms' }}>
                    <img
                        src="/assets/hero-tech-guy-trimmed.png"
                        alt="A SlintTech mentee holding a laptop showing the code they are building"
                        width={900}
                        height={1424}
                        className="w-full max-w-xs sm:max-w-sm lg:-mt-6 lg:h-[38rem] lg:w-auto lg:max-w-none lg:object-contain lg:object-bottom xl:h-[41rem]"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
