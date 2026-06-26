import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="eyebrow">Three ways into the tool</div>
        <h1 style={{ fontSize: "2.6rem" }}>
          Find the right water adaptation for your operation
        </h1>
        <p className="lede">
          Search the option library directly, browse supporting tools and
          guides, or build a tailored packet for your farm or ranch.
        </p>
      </section>

      <section className="entry-grid" aria-label="Main entry points">
        <Link className="entry-card" to="/browse-options">
          <span className="entry-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <h2>Browse Options</h2>
          <p>Search or filter the adaptation options library.</p>
        </Link>

        <Link className="entry-card" to="/tools-resources">
          <span className="entry-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 4.5C3.5 3.5 6 3 8 4v15c-2-1-4.5-.5-6 .5V4.5Z" />
              <path d="M22 4.5C20.5 3.5 18 3 16 4v15c2-1 4.5-.5 6 .5V4.5Z" />
            </svg>
          </span>
          <h2>Tools &amp; Resources</h2>
          <p>Browse guides, case studies, calculators, funding links, and technical resources.</p>
        </Link>

        <Link className="entry-card" to="/guided-explorer">
          <span className="entry-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
              <path d="M14 2v6h6" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
          </span>
          <h2>Build an Adaptation Packet</h2>
          <p>Use the guided explorer to assemble a tailored packet from options and resources.</p>
        </Link>
      </section>
    </div>
  );
}
