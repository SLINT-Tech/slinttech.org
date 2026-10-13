import { Link } from "react-router-dom";
export default function Brand() {
  return (
    <Link to="/" className="slint-brand" aria-label="SlintTech home">
      <img src="/assets/logo.svg" alt="" width="36" height="36" />
      <span>
        SLINT<span>Tech</span>
      </span>
    </Link>
  );
}
