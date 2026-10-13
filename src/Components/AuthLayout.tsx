import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  HeartHandshake,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import Brand from "./Brand";

export function PublicHeader({ action }: { action?: ReactNode }) {
  const { dark, toggleTheme } = useTheme();
  return (
    <header className="public-app-header">
      <Brand />
      <div>
        <Link to="/" className="app-back-home">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <button
          type="button"
          className="app-icon-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {action}
      </div>
    </header>
  );
}

export default function AuthLayout({
  children,
  role = "Mentee",
  signup = false,
}: {
  children: ReactNode;
  role?: "Mentee" | "Mentor" | "Admin";
  signup?: boolean;
}) {
  const mentor = role === "Mentor";
  const admin = role === "Admin";
  return (
    <div className={`auth-page ${signup ? "auth-signup" : ""}`}>
      <PublicHeader
        action={
          <Link
            className="app-button app-button-outline public-header-cta"
            to={signup ? "/login" : "/signup"}
          >
            {signup ? "Log in" : "Join the community"}
            <ArrowUpRight size={15} />
          </Link>
        }
      />
      <main className="auth-layout">
        <aside className="auth-story">
          <span className="app-eyebrow">
            {admin
              ? "THE PEOPLE BEHIND THE PROGRESS"
              : mentor
                ? "MAKE ROOM FOR SOMEONE’S POTENTIAL"
                : "YOUR NEXT CHAPTER STARTS HERE"}
          </span>
          <h2>
            {admin ? (
              <>
                A stronger <br />
                community. <br />
                <em>Starts with care.</em>
              </>
            ) : mentor ? (
              <>
                Your experience. <br />
                Their possibility. <br />
                <em>Our future.</em>
              </>
            ) : (
              <>
                Big ambitions. <br />
                Real support. <br />
                <em>Your people.</em>
              </>
            )}
          </h2>
          <p>
            {admin
              ? "Keep the community moving. Support members, connect mentors, and make space for the next generation."
              : mentor
                ? "A little guidance can change someone’s direction. Help the next generation turn curiosity into confidence."
                : "Find your direction, build skills that matter, and grow with people who believe in what you can become."}
          </p>
          <div className="auth-story-features">
            <span>
              <BookOpen size={17} /> Learn with a clear direction
            </span>
            <span>
              <HeartHandshake size={17} /> Real people in your corner
            </span>
            <span>
              <Users size={17} /> A community to grow with
            </span>
          </div>
          <div className="auth-art" aria-hidden="true">
            <div className="auth-art-orbit" />
            <div className="auth-art-orbit orbit-two" />
            <div className="auth-art-card">
              <Code2 size={25} />
              <span>
                One small step.<strong>A whole new possibility.</strong>
              </span>
              <ArrowUpRight size={24} />
            </div>
            <div className="auth-art-note">
              <Check size={15} /> You belong here.
            </div>
          </div>
          <span className="auth-story-footer">LEARN. BUILD. BECOME.</span>
        </aside>
        <div className="auth-form-panel">{children}</div>
      </main>
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} SlintTech</span>
        <a href="mailto:contact@slinttech.org">
          Need a hand? Get in touch <ArrowUpRight size={12} />
        </a>
      </footer>
    </div>
  );
}
