import { useState } from "react";
import { NavLink } from "react-router-dom";

// Add a new page here and it shows up in the nav everywhere — nothing
// else needs to change.
const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Browse Options", to: "/browse-options" },
  { label: "Tools & Resources", to: "/tools-resources" },
  { label: "Guided Explorer", to: "/guided-explorer" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="nav-inner">
          <NavLink className="brand" to="/" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z"
                  fill="#143534"
                />
              </svg>
            </span>
            Western Agricultural Water Adaptation Menu
          </NavLink>

          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            &#9776;
          </button>

          <ul className={`nav-links${open ? " open" : ""}`}>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </header>
      <div className="contour-band" aria-hidden="true" />
    </>
  );
}
