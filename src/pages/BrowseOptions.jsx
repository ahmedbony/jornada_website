import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LANDSCAPE_PINS, costLabel } from "../data/options.js";
import { useContent } from "../context/ContentContext.jsx";
import { usePacket } from "../context/PacketContext.jsx";
import {
  CONTEXTS, WATER_STRESSES, WATER_OUTCOMES, SCALES, COSTS, EVIDENCE_LEVELS
} from "../data/taxonomy.js";
import { trackPageView, trackAddToPacket, trackSearch } from "../hooks/useAnalytics.js";

// ─── Landscape pins — easy to reconfigure when permanent image arrives ────
// To add/remove/move pins: edit this array only. Each entry needs:
//   context  → filter key applied when clicked
//   label    → screen-reader text (also shown as tooltip)
//   top/left → position as % of image dimensions
//   width/height → hotspot size as % of image dimensions
const CROP_PINS = [
  { context: "canopy", label: "Canopy / protected production", top: "72%", left: "56%", width: "20%", height: "8%" },
  { context: "crop-choice", label: "Crop choice", top: "80%", left: "56%", width: "20%", height: "8%" },
  { context: "soil", label: "Soil management", top: "88%", left: "56%", width: "20%", height: "8%" },
];

// All active pins (landscape + crop detail)
const ALL_PINS = [...LANDSCAPE_PINS, ...CROP_PINS];

// ─── Generic filter checkbox group ───────────────────────────────────────
function FilterGroup({ title, items, activeKeys, onToggle, defaultOpen = false }) {
  return (
    <details className="filter-group" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="opts">
        {items.map((item) => (
          <label key={item.key}>
            <input
              type="checkbox"
              checked={activeKeys.includes(item.key)}
              onChange={() => onToggle(item.key)}
            />
            {item.label}
          </label>
        ))}
      </div>
    </details>
  );
}

// ─── Add-to-packet mini button ────────────────────────────────────────────
function PacketBtn({ option }) {
  const { addToPacket, removeFromPacket, isInPacket } = usePacket();
  const inPkt = isInPacket(option.id);
  return (
    <button
      className={`btn-packet-sm${inPkt ? " in-packet" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        if (inPkt) {
          removeFromPacket(option.id);
        } else {
          addToPacket({ type: "option", id: option.id, title: option.title, icon: option.icon });
          trackAddToPacket(option.id, option.title);
        }
      }}
      title={inPkt ? "Remove from packet" : "Add to my packet"}
    >
      {inPkt ? "✓ In packet" : "+ Packet"}
    </button>
  );
}

export default function BrowseOptions() {
  const { options: OPTIONS } = useContent();
  const [tab, setTab] = useState("list");
  const [search, setSearch] = useState("");

  useEffect(() => { trackPageView("/browse-options"); }, []);

  // Debounced search tracking
  useEffect(() => {
    if (!search.trim()) return;
    const t = setTimeout(() => trackSearch(search), 1000);
    return () => clearTimeout(t);
  }, [search]);

  // All active filters keyed by dimension
  const [filters, setFilters] = useState({
    context: [],
    waterStress: [],
    waterOutcome: [],
    scale: [],
    cost: [],
    evidence: [],
  });

  function toggleFilter(dim, key) {
    setFilters((prev) => {
      const current = prev[dim];
      return {
        ...prev,
        [dim]: current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
      };
    });
  }

  function clearAll() {
    setSearch("");
    setFilters({ context: [], waterStress: [], waterOutcome: [], scale: [], cost: [], evidence: [] });
  }

  const hasActiveFilters =
    search ||
    Object.values(filters).some((arr) => arr.length > 0);

  // Active chips for display
  const activeChips = [
    ...filters.context.map((k) => ({ dim: "context", key: k, label: CONTEXTS.find((c) => c.key === k)?.label ?? k })),
    ...filters.waterStress.map((k) => ({ dim: "waterStress", key: k, label: WATER_STRESSES.find((c) => c.key === k)?.label ?? k })),
    ...filters.waterOutcome.map((k) => ({ dim: "waterOutcome", key: k, label: WATER_OUTCOMES.find((c) => c.key === k)?.label ?? k })),
    ...filters.scale.map((k) => ({ dim: "scale", key: k, label: SCALES.find((c) => c.key === k)?.label ?? k })),
    ...filters.cost.map((k) => ({ dim: "cost", key: k, label: COSTS.find((c) => c.key === k)?.label ?? k })),
    ...filters.evidence.map((k) => ({ dim: "evidence", key: k, label: EVIDENCE_LEVELS.find((c) => c.key === k)?.label ?? k })),
  ];

  // Filter landscape pin click → sets context filter
  function selectPin(pin) {
    const key = pin.context;
    toggleFilter("context", key);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OPTIONS.filter((opt) => {
      if (q && !`${opt.title} ${opt.description} ${opt.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      if (filters.context.length    && !filters.context.some((k) => opt.context?.includes(k)))    return false;
      if (filters.waterStress.length && !filters.waterStress.some((k) => opt.waterStress?.includes(k))) return false;
      if (filters.waterOutcome.length && !filters.waterOutcome.some((k) => opt.waterOutcome?.includes(k))) return false;
      if (filters.scale.length && !filters.scale.includes(opt.scale)) return false;
      if (filters.cost.length  && !filters.cost.includes(opt.cost))   return false;
      if (filters.evidence.length && !filters.evidence.includes(opt.evidence)) return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Option library</div>
        <h1>Browse Options</h1>
        <p>Search the option library, filter results, or browse visually by landscape.</p>
      </div>

      <div className="layout-with-sidebar">
        {/* ── Sidebar: all filters auto-generated from taxonomy ── */}
        <aside className="filter-panel" aria-label="Filter options">
          <h2>Filter Options</h2>
          <FilterGroup title="Context"       items={CONTEXTS}       activeKeys={filters.context}     onToggle={(k) => toggleFilter("context", k)}     defaultOpen />
          <FilterGroup title="Water stress"  items={WATER_STRESSES} activeKeys={filters.waterStress} onToggle={(k) => toggleFilter("waterStress", k)} />
          <FilterGroup title="Water outcome" items={WATER_OUTCOMES}  activeKeys={filters.waterOutcome}onToggle={(k) => toggleFilter("waterOutcome", k)}/>
          <FilterGroup title="Scale"         items={SCALES}         activeKeys={filters.scale}       onToggle={(k) => toggleFilter("scale", k)}        />
          <FilterGroup title="Cost"          items={COSTS}          activeKeys={filters.cost}        onToggle={(k) => toggleFilter("cost", k)}         />
          <FilterGroup title="Evidence"      items={EVIDENCE_LEVELS}activeKeys={filters.evidence}    onToggle={(k) => toggleFilter("evidence", k)}     />
        </aside>

        <div>
          {/* ── Tabs ── */}
          <div className="tabs" role="tablist">
            <button className={`tab-btn${tab === "list" ? " active" : ""}`} role="tab"
              aria-selected={tab === "list"} onClick={() => setTab("list")}>
              List / Filter View
            </button>
            <button className={`tab-btn${tab === "landscape" ? " active" : ""}`} role="tab"
              aria-selected={tab === "landscape"} onClick={() => setTab("landscape")}>
              Landscape View
            </button>
          </div>

          {/* ── Search row (list view only) ── */}
          {tab === "list" && (
            <div className="search-row">
              <div className="search-box">
                <input type="text" placeholder="Search options..." value={search}
                  onChange={(e) => setSearch(e.target.value)} />
              </div>
              {hasActiveFilters && (
                <button className="btn" onClick={clearAll}>Clear all</button>
              )}
            </div>
          )}

          {/* ── Landscape view ── */}
          {tab === "landscape" && (
            <div className="landscape-wrap" style={{ marginBottom: 20 }}>
              <div className="landscape-map">
                {ALL_PINS.map((pin) => (
                  <button
                    key={pin.context}
                    className={`map-pin${filters.context.includes(pin.context) ? " active" : ""}`}
                    style={{ top: pin.top, left: pin.left, width: pin.width, height: pin.height }}
                    onClick={() => selectPin(pin)}
                  >
                    <span className="sr-only">{pin.label}</span>
                  </button>
                ))}
              </div>
              <p className="map-hint">Click a landscape feature to filter results below.</p>
            </div>
          )}

          {/* ── Active filter chips ── */}
          {activeChips.length > 0 && (
            <div className="active-filters">
              {activeChips.map(({ dim, key, label }) => (
                <span className="chip" key={`${dim}-${key}`}>
                  {label}
                  <button aria-label={`Remove ${label} filter`}
                    onClick={() => toggleFilter(dim, key)}>&times;</button>
                </span>
              ))}
            </div>
          )}

          {/* ── Results ── */}
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
                <div className="card-actions">
                  <Link className="learn-more" to={`/options/${opt.id}`}>Learn more →</Link>
                  <PacketBtn option={opt} />
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="no-results">No options match your filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
