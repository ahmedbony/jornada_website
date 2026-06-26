import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { RESOURCE_TYPES, RESOURCES } from "../data/resources.js";

export default function ToolsResources() {
  const location = useLocation();
  const presetType = location.state?.presetType;

  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState(presetType ? [presetType] : []);

  function toggleType(key) {
    setActiveTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function clearFilters() {
    setSearch("");
    setActiveTypes([]);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      const matchesSearch =
        q === "" || `${r.title} ${r.description} ${r.tags.join(" ")}`.toLowerCase().includes(q);
      const matchesType = activeTypes.length === 0 || activeTypes.includes(r.type);
      return matchesSearch && matchesType;
    });
  }, [search, activeTypes]);

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Searchable toolbox</div>
        <h1>Tools &amp; Resources</h1>
        <p>Guides, case studies, calculators, funding links, and technical resources.</p>
      </div>

      <div className="layout-with-sidebar">
        <aside className="filter-panel" aria-label="Filter resources">
          <h2>Filter Resources</h2>

          <details className="filter-group" open>
            <summary>Resource type</summary>
            <div className="opts">
              {RESOURCE_TYPES.map((rt) => (
                <label key={rt.key}>
                  <input
                    type="checkbox"
                    checked={activeTypes.includes(rt.key)}
                    onChange={() => toggleType(rt.key)}
                  />
                  {rt.label} ({rt.count})
                </label>
              ))}
            </div>
          </details>

          <details className="filter-group">
            <summary>Topic</summary>
            <div className="opts">
              <label><input type="checkbox" /> Irrigation efficiency</label>
              <label><input type="checkbox" /> Groundwater</label>
              <label><input type="checkbox" /> Drought planning</label>
            </div>
          </details>

          <details className="filter-group">
            <summary>Context</summary>
            <div className="opts">
              <label><input type="checkbox" /> Irrigated fields</label>
              <label><input type="checkbox" /> Rangeland</label>
            </div>
          </details>

          <details className="filter-group">
            <summary>Audience</summary>
            <div className="opts">
              <label><input type="checkbox" /> Producers</label>
              <label><input type="checkbox" /> Districts</label>
            </div>
          </details>

          <details className="filter-group">
            <summary>Geography</summary>
            <div className="opts">
              <label><input type="checkbox" /> California</label>
              <label><input type="checkbox" /> Southwest</label>
            </div>
          </details>
        </aside>

        <div>
          <div className="search-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search resources by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-clear" onClick={clearFilters}>Clear filters</button>
          </div>

          <div className="active-filters">
            {activeTypes.map((key) => {
              const rt = RESOURCE_TYPES.find((r) => r.key === key);
              return (
                <span className="chip" key={key}>
                  Resource type: {rt.label}
                  <button aria-label="Remove filter" onClick={() => toggleType(key)}>&times;</button>
                </span>
              );
            })}
          </div>

          <div className="results-head">
            <h2>{filtered.length} resource{filtered.length === 1 ? "" : "s"} found</h2>
          </div>

          <div className="card-grid">
            {filtered.map((r) => (
              <article className="card" key={r.id}>
                <span className="card-icon">{r.icon}</span>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <div className="tag-row">
                  {r.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="no-results">No resources match your search and filters.</p>
            )}
          </div>

          <p style={{ marginTop: 24, fontSize: "0.85rem", color: "var(--ink-400)" }}>
            ⓘ Resources can be browsed directly and also appear on option pages and in adaptation packets.
          </p>
        </div>
      </div>
    </div>
  );
}
