import { ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
export default function PendingBanner({ role }: { role: "Mentee" | "Mentor" }) {
  return (
    <div className="app-pending-banner" role="status">
      <Clock size={17} />
      <div>
        <strong>Your application is under review.</strong>
        <span>
          You’re previewing your {role === "Mentee" ? "learning" : "mentor"}{" "}
          workspace.
        </span>
      </div>
      <Link to="/pending-approval">
        View status <ChevronRight size={14} />
      </Link>
    </div>
  );
}
