import { ArrowUpRight, Loader2 } from "lucide-react";
import type { ChangeEventHandler, FormEventHandler } from "react";
import { Link } from "react-router-dom";
import AppForm from "./AppForm";
import PasswordInput from "./PasswordInput";

interface Props {
  role: "Mentee" | "Mentor" | "Admin";
  formData: { email: string; password: string };
  onChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  error?: string;
}
export default function LoginForm({
  role,
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  error,
}: Props) {
  return (
    <>
      <div className="auth-form-heading">
        <span className="app-eyebrow">
          {role === "Admin"
            ? "ADMIN WORKSPACE"
            : role === "Mentor"
              ? "MENTOR WORKSPACE"
              : "LET’S KEEP GROWING"}
        </span>
        <h1>
          Welcome back<span>.</span>
        </h1>
        <p>
          {role === "Mentor"
            ? "Your next meaningful connection is waiting."
            : role === "Admin"
              ? "Log in to care for your community."
              : "Your next chapter is right where you left it."}
        </p>
      </div>
      {role !== "Admin" && (
        <nav className="auth-role-switch" aria-label="Choose your account type">
          <Link
            to="/login"
            aria-current={role === "Mentee" ? "page" : undefined}
          >
            I’m a learner
          </Link>
          <Link
            to="/mentor/login"
            aria-current={role === "Mentor" ? "page" : undefined}
          >
            I’m a mentor
          </Link>
        </nav>
      )}
      <AppForm
        onSubmit={onSubmit}
        className="auth-form"
        aria-busy={isSubmitting}
      >
        {error && (
          <div className="app-form-error" role="alert">
            {error}
          </div>
        )}
        <div className="app-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={onChange}
            required
          />
        </div>
        <div className="app-field">
          <label htmlFor="login-password">Password</label>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={onChange}
            required
          />
        </div>
        <button
          type="submit"
          className="app-button auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Logging in…
            </>
          ) : (
            <>
              Log in to your {role === "Admin" ? "workspace" : "account"}{" "}
              <ArrowUpRight size={18} />
            </>
          )}
        </button>
      </AppForm>
      <div className="auth-form-bottom">
        {role === "Admin" ? (
          <Link to="/login">Back to member login</Link>
        ) : (
          <>
            New to SlintTech?{" "}
            <Link to="/signup">
              Find your people <ArrowUpRight size={14} />
            </Link>
          </>
        )}
      </div>
      <p className="auth-help">
        Trouble getting in?{" "}
        <a href="mailto:contact@slinttech.org">We’re here to help.</a>
      </p>
    </>
  );
}
