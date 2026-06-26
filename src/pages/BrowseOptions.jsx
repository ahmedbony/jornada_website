import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OPTIONS, LANDSCAPE_PINS, costLabel } from "../data/options.js";
import { CONTEXTS } from "../data/taxonomy.js";

export default function BrowseOptions() {
  const [tab, setTab] = useState("list"); // "list" | "landscape"
  const [search, setSearch] = useState("");
  const [contextFilter, setContextFilter] = useState("groundwater");

  const contextLabel = (key) =>
    CONTEXTS.find((c) => c.key === key)?.label ??
    LANDSCAPE_PINS.find((p) => p.context === key)?.label ??
    key;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OPTIONS.filter((opt) => {
      const matchesSearch =
        q === "" ||
        `${opt.title} ${opt.description} ${opt.tags.join(" ")}`.toLowerCase().includes(q);
      const matchesContext = !contextFilter || opt.context.includes(contextFilter);
      return matchesSearch && matchesContext;
    });
  }, [search, contextFilter]);

  function clearFilters() {
    setSearch("");
    setContextFilter(null);
  }

  function selectPin(pin) {
    setContextFilter(contextFilter === pin.context ? null : pin.context);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Option library</div>
        <h1>Browse Options</h1>
        <p>Search the option library, filter results, or browse visually by landscape.</p>
      </div>

      <div className="layout-with-sidebar">
        {/* Sidebar */}
        <aside className="filter-panel" aria-label="Filter options">
          <h2>Filter Options</h2>

          <details className="filter-group" open>
            <summary>Context</summary>
            <div className="opts">
              {CONTEXTS.map((c) => (
                <label key={c.key}>
                  <input
                    type="checkbox"
                    checked={contextFilter === c.key}
                    onChange={() => setContextFilter(contextFilter === c.key ? null : c.key)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </details>

          <details className="filter-group">
            <summary>Water stress</summary>
            <div className="opts">
              <label><input type="checkbox" /> Drought-prone</label>
              <label><input type="checkbox" /> Seasonal shortage</label>
              <label><input type="checkbox" /> Chronic decline</label>
            </div>
          </details>

          <details className="filter-group">
            <summary>Water outcome</summary>
            <div className="opts">
              <label><input type="checkbox" /> Reduce use</label>
              <label><input type="checkbox" /> Increase recharge</label>
              <label><input type="checkbox" /> Improve reliability</label>
            </div>
          </details>

          <details className="filter-group">
            <summary>Scale</summary>
            <div className="opts">
              <label><input type="checkbox" /> On-farm</label>
              <label><input type="checkbox" /> District / regional</label>
            </div>
          </details>

          <details className="filter-group">
            <summary>Cost</summary>
            <div className="opts">
              <label><input type="checkbox" /> Low cost</label>
              <label><input type="checkbox" /> Medium cost</label>
              <label><input type="checkbox" /> High cost</label>
            </div>
          </details>

          <details className="filter-group">
            <summary>Evidence</summary>
            <div className="opts">
              <label><input type="checkbox" /> Peer-reviewed</label>
              <label><input type="checkbox" /> Case study</label>
              <label><input type="checkbox" /> Emerging</label>
            </div>
          </details>
        </aside>

        {/* Main */}
        <div>
          <div className="tabs" role="tablist">
            <button
              className={`tab-btn${tab === "list" ? " active" : ""}`}
              role="tab"
              aria-selected={tab === "list"}
              onClick={() => setTab("list")}
            >
              List / Filter View
            </button>
            <button
              className={`tab-btn${tab === "landscape" ? " active" : ""}`}
              role="tab"
              aria-selected={tab === "landscape"}
              onClick={() => setTab("landscape")}
            >
              Landscape View
            </button>
          </div>

          {/* View-specific content */}
          {tab === "list" && (
            <div role="tabpanel" className="search-row">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search options..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="btn" onClick={clearFilters}>Clear filters</button>
            </div>
          )}

          {tab === "landscape" && (
            <div role="tabpanel" className="landscape-wrap" style={{ marginBottom: 20 }}>
              <div className="landscape-map">
                {LANDSCAPE_PINS.map((pin) => (
                  <button
                    key={pin.context}
                    className={`map-pin${contextFilter === pin.context ? " active" : ""}`}
                    style={{ top: pin.top, left: pin.left, width: pin.width, height: pin.height }}
                    onClick={() => selectPin(pin)}
                  >
                    <span className="sr-only">{pin.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results — shared by both views */}
          <div className="active-filters">
            {contextFilter && (
              <span className="chip">
                Context: {contextLabel(contextFilter)}
                <button aria-label="Remove filter" onClick={() => setContextFilter(null)}>&times;</button>
              </span>
            )}
          </div>

          <div className="results-head">
            <h2>{filtered.length} result{filtered.length === 1 ? "" : "s"}</h2>
            <select className="sort-select" defaultValue="relevance">
              <option value="relevance">Sort by: Relevance</option>
              <option value="cost">Sort by: Cost (low to high)</option>
              <option value="name">Sort by: Name (A–Z)</option>
            </select>
          </div>

          <div className="card-grid">
            {filtered.map((opt) => (
              <article className="card" key={opt.id}>
                <span className="card-icon">{opt.icon}</span>
                <h3>{opt.title}</h3>
                <p>{opt.description}</p>
                <div className="tag-row">
                  {opt.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                  <span className="tag cost">{costLabel(opt.cost)}</span>
                </div>
                <Link className="learn-more" to={`/options/${opt.id}`}>Learn more →</Link>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="no-results">No options match your search and filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
