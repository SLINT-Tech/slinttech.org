import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PublicHeader } from "../Components/AuthLayout";
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div>
      <PublicHeader />
      <main className="app-not-found">
        <div>
          <div className="not-found-art" aria-hidden="true">
            404<span>.</span>
          </div>
          <span className="app-eyebrow">A SMALL DETOUR</span>
          <h1>Let’s find your way back.</h1>
          <p>
            This page doesn’t exist or has moved. Your next chapter is still out
            there.
          </p>
          <div className="not-found-actions">
            <button
              type="button"
              className="app-button app-button-outline"
              onClick={() =>
                window.history.length > 1 ? navigate(-1) : navigate("/")
              }
            >
              <ArrowLeft size={16} /> Go back
            </button>
            <Link to="/" className="app-button">
              Back to SlintTech <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
