import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import "../styles/app.css";
const titles: Record<string, string> = {
  "/": "SlintTech",
  "/login": "Log in",
  "/signup": "Join the community",
  "/mentor/login": "Mentor login",
  "/admin/login": "Admin login",
  "/dashboard": "Your learning space",
  "/mentor/dashboard": "Mentor workspace",
  "/admin/dashboard": "Community management",
  "/courses": "Your courses",
  "/mentors": "Your mentors",
  "/lessons": "Your lessons",
  "/tasks": "Your tasks",
  "/profile": "Your profile",
  "/mentor/profile": "Mentor profile",
  "/mentor/courses": "Your courses",
  "/mentor/mentees": "Your mentees",
  "/mentor/submissions": "Submission reviews",
  "/pending-approval": "Application status",
  "/payment-wall": "Membership",
  "/payment": "Membership",
  "/mentor-courses": "Mentor courses",
  "/mentor-course-detail": "Course details",
  "/mentor-detail": "Mentor details",
};
export default function RouteSurface({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const home = pathname === "/";
  const auth = pathname === "/signup" || pathname.endsWith("/login");
  const status = ["/pending-approval", "/payment", "/payment-wall"].includes(
    pathname,
  );
  useEffect(() => {
    const title =
      titles[pathname] ||
      (pathname.startsWith("/task/")
        ? "Task details"
        : pathname.startsWith("/mentor/course/")
          ? "Course workspace"
          : pathname.startsWith("/mentor/mentee/")
            ? "Mentee progress"
            : /^\/mentor\/[^/]+$/.test(pathname)
              ? "Mentor details"
              : "Page not found");
    document.title = home ? title : `${title} — SlintTech`;
  }, [pathname, home]);
  return (
    <div
      className={
        home
          ? "min-h-screen font-bricolage"
          : `slint-app ${auth ? "app-auth" : status ? "app-status" : "app-workspace"}`
      }
      data-route={pathname}
    >
      {children}
    </div>
  );
}
