import { ArrowUpRight, BookOpen, HeartHandshake, Users } from "lucide-react";
import { Link } from "react-router-dom";
export default function PageIntro({
  name,
  role,
}: {
  name: string;
  role: "Mentee" | "Mentor" | "Admin";
}) {
  const learner = role === "Mentee";
  const admin = role === "Admin";
  return (
    <section className="workspace-intro">
      <div>
        <span className="app-eyebrow">
          {learner
            ? "MAKE A LITTLE PROGRESS TODAY"
            : admin
              ? "BUILDING A STRONGER COMMUNITY"
              : "YOUR GUIDANCE MAKES A DIFFERENCE"}
        </span>
        <h1>
          {admin ? (
            "People. Potential. Progress."
          ) : (
            <>
              Welcome back, <em>{name.split(" ")[0]}.</em>
            </>
          )}
        </h1>
        <p>
          {learner
            ? "A new skill, a small win, a step closer to where you want to be."
            : admin
              ? "Welcome members, connect mentors, and keep everyone moving forward."
              : "Help someone take their next step. Your experience is their starting point."}
        </p>
        {!admin && (
          <Link
            className="app-button"
            to={learner ? "/courses" : "/mentor/submissions"}
          >
            {learner ? "Continue your learning" : "Review submissions"}
            <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
      <div className="workspace-intro-art" aria-hidden="true">
        <span className="intro-art-orbit" />
        <span className="intro-art-orbit orbit-two" />
        <div>
          {learner ? (
            <BookOpen size={50} strokeWidth={1.2} />
          ) : admin ? (
            <Users size={50} strokeWidth={1.2} />
          ) : (
            <HeartHandshake size={50} strokeWidth={1.2} />
          )}
        </div>
        <span>
          {learner
            ? "LEARN. BUILD. BECOME."
            : admin
              ? "GROWING, TOGETHER."
              : "GUIDE. INSPIRE. GROW."}
        </span>
      </div>
    </section>
  );
}
