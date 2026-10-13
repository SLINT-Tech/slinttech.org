import { RefreshCw, WifiOff } from "lucide-react";
import Navigation from "./Navigation";

interface Props {
  role: "Mentee" | "Mentor" | "Admin";
  userName: string;
  onLogout: () => void;
  onRetry: () => void;
}

export default function WorkspaceError({
  role,
  userName,
  onLogout,
  onRetry,
}: Props) {
  return (
    <div className="min-h-screen">
      <Navigation role={role} userName={userName} onLogout={onLogout} />
      <main id="workspace-content" tabIndex={-1} className="app-page-content">
        <section className="app-load-error" role="alert">
          <span>
            <WifiOff size={27} />
          </span>
          <p className="app-eyebrow">LET’S TRY THAT AGAIN</p>
          <h1>We couldn’t load this page.</h1>
          <p>
            Your progress is still yours. Check your connection, then try again.
          </p>
          <button type="button" className="app-button" onClick={onRetry}>
            <RefreshCw size={16} />
            Try again
          </button>
        </section>
      </main>
    </div>
  );
}
