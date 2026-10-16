import { ArrowRight, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  roleLabel: string;
  RoleIcon: LucideIcon;
  subtitle: string;
  email: string;
  password: string;
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** where "Create an account" goes; omitted for portals people cannot sign up to */
  signupTo?: string;
  switchLinks?: { to: string; label: string }[];
}

const inputClass =
  'h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 transition-colors placeholder:text-gray-500 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-teal-400 dark:focus:ring-teal-400/20';

const LoginForm = ({
  roleLabel,
  RoleIcon,
  subtitle,
  email,
  password,
  isSubmitting,
  onChange,
  onSubmit,
  signupTo,
  switchLinks = [],
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#008080]/10 px-3 py-1 text-sm font-semibold text-[#006666] dark:bg-teal-400/10 dark:text-teal-300">
        <RoleIcon className="h-4 w-4" aria-hidden="true" />
        {roleLabel}
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{subtitle}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={onChange}
            className={inputClass}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            {/* there is no self-service reset yet (ST-A11), so send people to support rather than a dead link */}
            <a
              href="mailto:support@slinttech.org?subject=Password%20reset"
              className="rounded text-sm font-medium text-[#006666] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008080] dark:text-teal-400 dark:focus-visible:outline-teal-400"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
              className={`${inputClass} pr-12`}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-controls="password"
              className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#008080] dark:text-gray-400 dark:hover:text-gray-300 dark:focus-visible:outline-teal-400"
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#008080] px-6 font-semibold text-white transition-colors hover:bg-[#006666] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008080] disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-teal-400"
        >
          {isSubmitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {signupTo && (
        <>
          <div className="my-8 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            New to SLINT Tech?
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>
          <Link
            to={signupTo}
            className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 font-semibold text-gray-900 transition-colors hover:border-[#008080] hover:text-[#006666] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008080] dark:border-gray-700 dark:text-white dark:hover:border-teal-400 dark:hover:text-teal-300 dark:focus-visible:outline-teal-400"
          >
            Create an account
          </Link>
        </>
      )}

      {switchLinks.length > 0 && (
        <nav aria-label="Other sign-in pages" className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {switchLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-1 rounded font-medium text-gray-600 hover:text-[#006666] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008080] dark:text-gray-300 dark:hover:text-teal-300 dark:focus-visible:outline-teal-400"
            >
              {label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default LoginForm;
