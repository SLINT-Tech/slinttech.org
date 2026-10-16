import { ArrowLeft, GraduationCap, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

const highlights = [
  {
    icon: Sparkles,
    title: 'For mentors',
    text: 'Share your expertise and guide the next generation of tech talent.',
  },
  {
    icon: GraduationCap,
    title: 'For mentees',
    text: 'Pick a career track, learn with a mentor, and build work you can show an employer.',
  },
];

const Wordmark = ({ className = '' }: { className?: string }) => (
  <span className={`text-2xl ${className}`}>
    <span className="font-bold">SLINT</span>
    <span className="ml-[1.5px]">Tech</span>
  </span>
);

/** Split-screen frame for the sign-in pages: brand panel on wide screens, form on the right. */
const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="min-h-screen bg-white lg:grid lg:grid-cols-2 dark:bg-gray-950">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-[#008080] focus:px-5 focus:py-2.5 focus:font-semibold focus:text-white"
    >
      Skip to content
    </a>

    <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#003d3d] via-[#006666] to-[#008080] p-12 text-white lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 h-[28rem] w-[28rem] rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full border border-white/10"
      />

      <Link to="/" aria-label="SLINTTech home" className="relative flex w-fit items-center gap-2">
        <img src="/assets/logo.svg" alt="" className="h-9 w-9 rounded-md bg-white/90 p-1" />
        <Wordmark />
      </Link>

      <div className="relative max-w-md">
        <p className="text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
          Your tech career starts here.
        </p>
        <p className="mt-5 text-lg leading-relaxed text-white/85">
          Join a community of mentees, mentors and cell leaders building real skills together
          through SLINT Tech.
        </p>

        <ul className="mt-10 space-y-6">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-white/80">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-white/70">
        © {new Date().getFullYear()} SLINT Tech · Selfless Leadership &amp; Innovation for a New Tomorrow
      </p>
    </aside>

    <div className="flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:min-h-0">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-gray-600 hover:text-[#008080] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008080] dark:text-gray-300 dark:hover:text-teal-400 dark:focus-visible:outline-teal-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
        <Link to="/" aria-label="SLINTTech home" className="flex items-center gap-2 text-[#008080] lg:hidden dark:text-teal-400">
          <img src="/assets/logo.svg" alt="" className="h-8 w-8" />
          <Wordmark className="text-xl" />
        </Link>
      </div>

      <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center py-10 focus:outline-none">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  </div>
);

export default AuthLayout;
