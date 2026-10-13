import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import Brand from "./Brand";
interface NavigationProps {
  role: "Mentor" | "Mentee" | "Admin";
  userName: string;
  onLogout: () => void;
}
const mentorLinks = [
  { path: "/mentor/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/mentor/courses", label: "My courses", icon: BookOpen },
  { path: "/mentor/mentees", label: "My mentees", icon: Users },
  { path: "/mentor/submissions", label: "Submissions", icon: FileCheck2 },
];
const learnerLinks = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/courses", label: "My courses", icon: BookOpen },
  { path: "/mentors", label: "My mentors", icon: HeartHandshake },
  { path: "/lessons", label: "Lessons", icon: FileCheck2 },
  { path: "/tasks", label: "Tasks & assignments", icon: ClipboardCheck },
];
const adminLinks = [
  { path: "/admin/dashboard", label: "Community", icon: Users },
];
export default function Navigation({
  role,
  userName,
  onLogout,
}: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { dark, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const menuRef = useRef<HTMLButtonElement>(null);
  const userRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const links =
    role === "Mentor"
      ? mentorLinks
      : role === "Mentee"
        ? learnerLinks
        : adminLinks;
  const profilePath = role === "Mentor" ? "/mentor/profile" : "/profile";
  function isActive(path: string) {
    if (pathname === path) return true;
    if (path === "/mentor/courses")
      return pathname.startsWith("/mentor/course/");
    if (path === "/mentor/mentees")
      return pathname.startsWith("/mentor/mentee/");
    if (path === "/mentors")
      return (
        /^\/mentor\/[^/]+$/.test(pathname) ||
        pathname === "/mentor-detail" ||
        pathname === "/mentor-courses"
      );
    if (path === "/courses") return pathname === "/mentor-course-detail";
    return path === "/tasks" && pathname.startsWith("/task/");
  }
  const current =
    links.find((link) => isActive(link.path))?.label ||
    (pathname.includes("profile") ? "My profile" : "Workspace");
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (userOpen) {
          setUserOpen(false);
          userRef.current?.focus();
        } else if (open) {
          setOpen(false);
          menuRef.current?.focus();
        }
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      )
        setUserOpen(false);
    };
    const resize = () => {
      if (window.innerWidth > 1000) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, [open, userOpen]);
  const nav = (
    <nav aria-label={`${role} navigation`} className="workspace-links">
      {links.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          onClick={() => setOpen(false)}
          aria-current={isActive(path) ? "page" : undefined}
        >
          <Icon size={18} />
          <span>{label}</span>
          {isActive(path) && <span className="nav-active-dot" />}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="workspace-navigation">
      <a className="app-skip-link" href="#workspace-content">
        Skip to content
      </a>
      <aside className="workspace-sidebar">
        <Brand />
        <div className="workspace-label">
          {role === "Mentee"
            ? "YOUR LEARNING SPACE"
            : role === "Mentor"
              ? "YOUR MENTOR WORKSPACE"
              : "COMMUNITY WORKSPACE"}
        </div>
        {nav}
        <div className="sidebar-bottom">
          <div className="sidebar-encouragement">
            <span>
              <HeartHandshake size={21} />
            </span>
            <h3>
              {role === "Mentor"
                ? "Small guidance. Big impact."
                : role === "Admin"
                  ? "A community worth caring for."
                  : "Progress starts with a step."}
            </h3>
            <p>
              {role === "Mentee"
                ? "Keep showing up. Your future self will thank you."
                : "The work you do makes room for someone else to grow."}
            </p>
            <a href="mailto:contact@slinttech.org">
              We’re here to help <ArrowUpRight size={14} />
            </a>
          </div>
          {role !== "Admin" && (
            <Link
              to={profilePath}
              className="sidebar-profile"
              aria-current={pathname === profilePath ? "page" : undefined}
            >
              <span className="app-avatar">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{userName}</strong>
                <small>View your profile</small>
              </span>
              <ChevronRight size={15} />
            </Link>
          )}
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <header className="workspace-topbar">
        <div className="workspace-breadcrumb">
          <button
            ref={menuRef}
            type="button"
            className="app-icon-button workspace-menu-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="workspace-mobile-nav"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="workspace-role">
            {role === "Mentee"
              ? "My learning"
              : role === "Mentor"
                ? "Mentor workspace"
                : "Admin workspace"}
          </span>
          <ChevronRight size={13} />
          <strong>{current}</strong>
        </div>
        <div className="workspace-topbar-actions">
          <a href="mailto:contact@slinttech.org" className="workspace-support">
            <Mail size={15} /> Get support
          </a>
          <button
            type="button"
            className="app-icon-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="workspace-user" ref={userMenuRef}>
            <button
              ref={userRef}
              type="button"
              aria-expanded={userOpen}
              aria-controls="workspace-user-menu"
              aria-label="Account menu"
              onClick={() => setUserOpen(!userOpen)}
            >
              <span className="app-avatar">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              <ChevronDown size={14} />
            </button>
            {userOpen && (
              <div id="workspace-user-menu" className="workspace-user-menu">
                <strong>{userName}</strong>
                <small>{role === "Mentee" ? "Learner" : role}</small>
                {role !== "Admin" && (
                  <Link to={profilePath} onClick={() => setUserOpen(false)}>
                    <User size={16} /> My profile
                  </Link>
                )}
                <button type="button" onClick={onLogout}>
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {open && (
        <div id="workspace-mobile-nav" className="workspace-mobile-nav">
          {nav}
          {role !== "Admin" && (
            <Link to={profilePath} onClick={() => setOpen(false)}>
              <User size={18} /> My profile
            </Link>
          )}
          <button type="button" onClick={onLogout}>
            <LogOut size={18} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
