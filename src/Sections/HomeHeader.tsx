import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const links = [
  ["Career paths", "explore"],
  ["Why SlintTech", "features"],
  ["Our story", "about"],
  ["Contact", "contact"],
];

export default function HomeHeader() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* Theme still works without storage. */
    }
  }

  return (
    <header className="home-header">
      <div className="home-container header-inner">
        <Link className="home-logo" to="/" aria-label="SlintTech home">
          <img src="/assets/logo.svg" alt="" width="36" height="36" />
          <span>
            SLINT<span>Tech</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="home-icon-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link className="header-login" to="/login">
            Log in
          </Link>
          <Link className="home-button home-button-small" to="/signup">
            Join the community <ArrowUpRight size={16} />
          </Link>
          <button
            ref={menuButton}
            className="home-icon-button mobile-menu-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="home-mobile-menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="home-mobile-menu"
          className="home-mobile-nav"
          aria-label="Mobile navigation"
        >
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={16} />
            </a>
          ))}
          <Link to="/login">Log in</Link>
          <Link to="/signup" className="home-button">
            Join the community <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
