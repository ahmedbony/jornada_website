import { useState, useEffect, useRef } from "react";
import { CONTEXTS, WATER_STRESSES, WATER_OUTCOMES, PRIORITIES } from "../data/taxonomy.js";

const TOKEN_KEY = "wawa_admin_token";
const getToken  = () => localStorage.getItem(TOKEN_KEY);
const saveToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const dropToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── API helpers ──────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...opts.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status });
  return data;
}

// ─── Login ────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      saveToken(token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z"
              fill="var(--teal-700)" />
          </svg>
        </div>
        <h1>Admin Login</h1>
        <p>Western Agricultural Water Adaptation Menu</p>
        {error && <div className="admin-banner error" style={{ marginBottom: 16, textAlign: "left" }}>{error}</div>}
        <form onSubmit={submit}>
          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label className="admin-label">Username</label>
            <input className="admin-input" type="text" autoComplete="username"
              value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="admin-field" style={{ marginBottom: 20 }}>
            <label className="admin-label">Password</label>
            <input className="admin-input" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: "100%", padding: 12 }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Reusable field components ────────────────────────────────────────────
function MultiSelect({ label, choices, selected = [], onChange, onAddNew }) {
  const [adding,   setAdding]   = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const toggle = (key) =>
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);

  function submitNew() {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (choices.some((c) => c.key === key)) {
      // Already exists — just select it
      if (!selected.includes(key)) onChange([...selected, key]);
    } else {
      onAddNew({ key, label: trimmed });
      onChange([...selected, key]);
    }
    setNewLabel("");
    setAdding(false);
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div className="choice-grid" style={{ gap: 6 }}>
        {choices.map((c) => (
          <button key={c.key} type="button"
            className={`choice-btn${selected.includes(c.key) ? " selected" : ""}`}
            style={{ fontSize: "0.78rem", padding: "5px 10px" }}
            onClick={() => toggle(c.key)}>
            {c.label}
          </button>
        ))}
      </div>

      {adding ? (
        <div className="add-new-row">
          <input
            className="admin-input"
            placeholder={`New ${label.toLowerCase()} label…`}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitNew(); } if (e.key === "Escape") setAdding(false); }}
            autoFocus
          />
          <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }} onClick={submitNew}>Add</button>
          <button className="btn" style={{ padding: "8px 14px", fontSize: "0.85rem" }} onClick={() => { setAdding(false); setNewLabel(""); }}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="add-new-trigger" onClick={() => setAdding(true)}>
          + Add new {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

function TagsInput({ label, value = [], onChange }) {
  const [raw, setRaw] = useState(value.join(", "));
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRaw(value.join(", ")); }, [value]);
  return (
    <div className="admin-field">
      <label className="admin-label">{label} <span className="admin-hint">(comma-separated)</span></label>
      <input className="admin-input" value={raw} onChange={(e) => {
        setRaw(e.target.value);
        onChange(e.target.value.split(",").map((t) => t.trim()).filter(Boolean));
      }} />
    </div>
  );
}

function TextArea({ label, value = "", onChange, rows = 3, hint }) {
  return (
    <div className="admin-field">
      <label className="admin-label">
        {label}{hint && <span className="admin-hint"> — {hint}</span>}
      </label>
      <textarea className="admin-textarea" rows={rows} value={value}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// ─── Image upload component ───────────────────────────────────────────────
// value shape: { url: string, caption: string } | null
// For backward compat, also accepts a plain string URL.
function imgUrl(val)     { return val && typeof val === "object" ? val.url     : (val || null); }
function imgCaption(val) { return val && typeof val === "object" ? val.caption : ""; }

function ImageUpload({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);
  const inputRef                  = useRef(null);

  const url     = imgUrl(value);
  const caption = imgCaption(value);

  function update(patch) {
    onChange({ url: url || "", caption, ...patch });
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange({ url: data.url, caption });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemove() {
    if (!url) return;
    try {
      const filename = url.split("/").pop();
      await fetch(`/api/upload/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { /* ignore */ }
    onChange(null);
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {url ? (
        <div className="image-upload-preview">
          <img src={url} alt="Uploaded" className="image-preview-img" />
          <div className="image-preview-actions">
            <div className="admin-field" style={{ marginBottom: 8 }}>
              <label className="admin-label">Caption <span className="admin-hint">(optional)</span></label>
              <input
                className="admin-input"
                placeholder="Add a caption or description…"
                value={caption}
                onChange={(e) => update({ caption: e.target.value })}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn" style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                onClick={() => inputRef.current?.click()}>
                Replace image
              </button>
              <button type="button" className="admin-icon-btn danger" onClick={handleRemove}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="image-upload-dropzone" onClick={() => inputRef.current?.click()}>
          <span style={{ fontSize: "1.5rem" }}>🖼</span>
          <span style={{ fontSize: "0.88rem", color: "var(--ink-600)" }}>
            {uploading ? "Uploading…" : "Click to upload image"}
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--ink-400)" }}>
            JPEG, PNG, WebP, GIF or SVG — max 10 MB
          </span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*"
        style={{ display: "none" }} onChange={handleFile} />
      {error && <p style={{ color: "#8B1919", fontSize: "0.82rem", margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

// ─── Page content editor ──────────────────────────────────────────────────
const RESOURCE_TYPE_OPTS = [
  { value: "guides", label: "Guides" },
  { value: "case-studies", label: "Case studies" },
  { value: "tools", label: "Tools / calculators" },
  { value: "funding", label: "Funding programs" },
  { value: "data", label: "Data / dashboards" },
  { value: "extension", label: "Extension / research" },
];

function PageContentEditor({ optionId, details = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const set = (field, val) => onChange({ ...details, [field]: val });

  return (
    <div className="page-content-editor">
      <button type="button" className="page-content-toggle" onClick={() => setOpen(!open)}>
        <span>✏️ Edit detail page content</span>
        <span style={{ fontSize: "0.78rem", color: "var(--ink-400)" }}>
          {open ? "▲ collapse" : `▼ expand — Overview, Water outcomes, Implementation… (/options/${optionId})`}
        </span>
      </button>
      {open && (
        <div className="page-content-body">
          <div className="page-content-section">
            <div className="page-content-section-title">Overview</div>
            <TextArea label="Overview text" rows={5} value={details.overview || ""}
              onChange={(v) => set("overview", v)} />
            <ImageUpload label="Overview image (shown beside the text)"
              value={details.overviewImage || null}
              onChange={(url) => set("overviewImage", url)} />
          </div>
          <div className="page-content-section">
            <div className="page-content-section-title">Water outcomes</div>
            <TextArea label="Water outcomes" rows={6}
              value={typeof details.waterOutcomes === "string" ? details.waterOutcomes : ""}
              onChange={(v) => set("waterOutcomes", v)}
              hint="Describe pathways, scale, evidence, and caveats as free text" />
            <ImageUpload label="Water outcomes image / diagram"
              value={details.waterOutcomesImage || null}
              onChange={(url) => set("waterOutcomesImage", url)} />
          </div>
          <div className="page-content-section">
            <div className="page-content-section-title">Implementation</div>
            <TextArea label="Implementation text" rows={4} value={details.implementation || ""}
              onChange={(v) => set("implementation", v)} />
          </div>
          <div className="page-content-section">
            <div className="page-content-section-title">Where it fits</div>
            <TextArea label="Where it fits" rows={3} value={details.whereItFits || ""}
              onChange={(v) => set("whereItFits", v)} />
          </div>
          <div className="page-content-section">
            <div className="page-content-section-title">Benefits</div>
            <TextArea label="Benefits" rows={3} value={details.benefits || ""}
              onChange={(v) => set("benefits", v)} />
          </div>
          <div className="page-content-section">
            <div className="page-content-section-title">Costs &amp; limitations</div>
            <TextArea label="Costs, limitations, barriers, and tradeoffs" rows={3}
              value={details.costsLimitations || ""} onChange={(v) => set("costsLimitations", v)} />
          </div>
          <div className="page-content-section">
            <div className="page-content-section-title">Case studies</div>
            <TextArea label="Case studies text" rows={2} value={details.caseStudies || ""}
              onChange={(v) => set("caseStudies", v)} />
          </div>
          <div className="page-content-section">
            <div className="page-content-section-title">Resources</div>
            <div className="admin-field">
              <label className="admin-label">Resource types to show</label>
              <div className="choice-grid" style={{ gap: 6 }}>
                {RESOURCE_TYPE_OPTS.map((rt) => {
                  const sel = (details.resourceTypes || []).includes(rt.value);
                  return (
                    <button key={rt.value} type="button"
                      className={`choice-btn${sel ? " selected" : ""}`}
                      style={{ fontSize: "0.78rem", padding: "5px 10px" }}
                      onClick={() => {
                        const cur = details.resourceTypes || [];
                        set("resourceTypes", sel ? cur.filter((v) => v !== rt.value) : [...cur, rt.value]);
                      }}>
                      {rt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Option card ──────────────────────────────────────────────────────────
function OptionCard({ option, details, onChange, onChangeDetails, onDelete, onAddToTaxonomy, taxonomy, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const set = (field, val) => onChange({ ...option, [field]: val });

  const ctx = taxonomy?.contexts    || CONTEXTS;
  const ws  = taxonomy?.waterStresses || WATER_STRESSES;
  const wo  = taxonomy?.waterOutcomes || WATER_OUTCOMES;
  const pri = taxonomy?.priorities   || PRIORITIES;

  return (
    <div className={`admin-card${open ? " open" : ""}`}>
      <div className="admin-card-header" onClick={() => setOpen(!open)}>
        <span>{option.icon} {option.title || <em style={{ color: "var(--ink-400)" }}>New option</em>}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="tag cost" style={{ fontSize: "0.75rem" }}>{option.cost}</span>
          <button type="button" className="admin-icon-btn danger"
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${option.title}"?`)) onDelete(); }}>✕</button>
          <span className="admin-chevron">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div className="admin-card-body">
          <div className="admin-row-2">
            <div className="admin-field">
              <label className="admin-label">Icon (emoji)</label>
              <input className="admin-input" value={option.icon || ""} style={{ width: 80 }}
                onChange={(e) => set("icon", e.target.value)} />
            </div>
            <div className="admin-field" style={{ flex: 1 }}>
              <label className="admin-label">ID <span className="admin-hint">(URL slug)</span></label>
              <input className="admin-input" value={option.id || ""}
                onChange={(e) => set("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))} />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Title</label>
            <input className="admin-input" value={option.title || ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Description <span className="admin-hint">(shown on cards)</span></label>
            <textarea className="admin-textarea" value={option.description || ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="admin-row-2">
            <div className="admin-field">
              <label className="admin-label">Cost</label>
              <select className="admin-select" value={option.cost || "low"} onChange={(e) => set("cost", e.target.value)}>
                <option value="low">Low cost</option>
                <option value="medium">Medium cost</option>
                <option value="high">High cost</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Scale</label>
              <select className="admin-select" value={option.scale || "on-farm"} onChange={(e) => set("scale", e.target.value)}>
                <option value="on-farm">On-farm</option>
                <option value="district">District / regional</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Evidence</label>
              <select className="admin-select" value={option.evidence || "moderate"} onChange={(e) => set("evidence", e.target.value)}>
                <option value="emerging">Emerging</option>
                <option value="moderate">Moderate</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
          <TagsInput label="Display tags" value={option.tags || []} onChange={(v) => set("tags", v)} />
          <MultiSelect label="Context"       choices={ctx} selected={option.context    || []} onChange={(v) => set("context", v)}      onAddNew={(item) => onAddToTaxonomy("contexts", item)} />
          <MultiSelect label="Water stresses" choices={ws} selected={option.waterStress|| []} onChange={(v) => set("waterStress", v)}   onAddNew={(item) => onAddToTaxonomy("waterStresses", item)} />
          <MultiSelect label="Water outcomes" choices={wo} selected={option.waterOutcome|| []} onChange={(v) => set("waterOutcome", v)} onAddNew={(item) => onAddToTaxonomy("waterOutcomes", item)} />
          <MultiSelect label="Priorities"    choices={pri} selected={option.priorities  || []} onChange={(v) => set("priorities", v)}   onAddNew={(item) => onAddToTaxonomy("priorities", item)} />
          <PageContentEditor optionId={option.id} details={details} onChange={onChangeDetails} />
        </div>
      )}
    </div>
  );
}

// ─── Resource card ────────────────────────────────────────────────────────
const RESOURCE_TYPE_LABELS = {
  "guides": "Guides", "case-studies": "Case studies", "tools": "Tools / calculators",
  "funding": "Funding programs", "data": "Data / dashboards", "extension": "Extension / research",
};

function ResourceCard({ resource, onChange, onDelete, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const set = (field, val) => onChange({ ...resource, [field]: val });
  return (
    <div className={`admin-card${open ? " open" : ""}`}>
      <div className="admin-card-header" onClick={() => setOpen(!open)}>
        <span>{resource.icon} {resource.title || <em style={{ color: "var(--ink-400)" }}>New resource</em>}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="tag" style={{ fontSize: "0.75rem" }}>{resource.type}</span>
          <button type="button" className="admin-icon-btn danger"
            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${resource.title}"?`)) onDelete(); }}>✕</button>
          <span className="admin-chevron">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div className="admin-card-body">
          <div className="admin-row-2">
            <div className="admin-field">
              <label className="admin-label">Icon</label>
              <input className="admin-input" value={resource.icon || ""} style={{ width: 80 }}
                onChange={(e) => set("icon", e.target.value)} />
            </div>
            <div className="admin-field" style={{ flex: 1 }}>
              <label className="admin-label">ID</label>
              <input className="admin-input" value={resource.id || ""}
                onChange={(e) => set("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))} />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Title</label>
            <input className="admin-input" value={resource.title || ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Description</label>
            <textarea className="admin-textarea" value={resource.description || ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Type</label>
            <select className="admin-select" value={resource.type || "guides"} onChange={(e) => set("type", e.target.value)}>
              {Object.entries(RESOURCE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <TagsInput label="Display tags" value={resource.tags || []} onChange={(v) => set("tags", v)} />
        </div>
      )}
    </div>
  );
}

// ─── Main Admin ───────────────────────────────────────────────────────────
// ─── Stats panel ──────────────────────────────────────────────────────────
const PAGE_LABELS = {
  "/": "Home",
  "/browse-options": "Browse Options",
  "/tools-resources": "Tools & Resources",
  "/guided-explorer": "Guided Explorer",
  "/packet": "Adaptation Packet",
};

function BarChart({ rows, color = "var(--teal-700)" }) {
  if (!rows.length) return <p className="no-results">No data yet.</p>;
  const max = rows[0].count;
  return (
    <div className="stat-bar-list">
      {rows.map((row) => (
        <div key={row.key} className="stat-bar-row">
          <span className="stat-bar-label">{row.label}</span>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ width: `${(row.count / max) * 100}%`, background: color }} />
          </div>
          <span className="stat-bar-count">{row.count}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="stat-summary-card">
      <div className="stat-summary-value">{value}</div>
      <div className="stat-summary-label">{label}</div>
    </div>
  );
}

function StatsPanel() {
  const [events, setEvents] = useState(null);
  const [range,  setRange]  = useState("7d");
  const [error,  setError]  = useState(null);

  useEffect(() => {
    apiFetch("/api/analytics")
      .then((d) => setEvents(d.events || []))
      .catch((e) => setError(e.message));
  }, []);

  if (error)   return <p style={{ color: "#8B1919", marginTop: 24 }}>Failed to load stats: {error}</p>;
  if (!events) return <p style={{ color: "var(--ink-400)", marginTop: 24 }}>Loading stats…</p>;

  const days   = { "1d": 1, "7d": 7, "30d": 30, "all": 36500 };
  // eslint-disable-next-line react-hooks/purity
  const cutoff = Date.now() - days[range] * 86400000;
  const inRange = events.filter((e) => e.ts >= cutoff);

  const pageviews   = inRange.filter((e) => e.type === "pageview");
  const optionViews = inRange.filter((e) => e.type === "option_view");
  const addPacket   = inRange.filter((e) => e.type === "add_to_packet");
  const pdfs        = inRange.filter((e) => e.type === "generate_pdf");
  const searches    = inRange.filter((e) => e.type === "search");

  function topN(arr, key, n = 8) {
    const counts = {};
    arr.forEach((e) => { const k = e[key] || "unknown"; counts[k] = (counts[k] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]).slice(0, n)
      .map(([k, count]) => ({ key: k, label: PAGE_LABELS[k] || k, count }));
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--ink-400)", fontWeight: 600 }}>Show:</span>
        {[["1d","Today"],["7d","Last 7 days"],["30d","Last 30 days"],["all","All time"]].map(([val, lbl]) => (
          <button key={val} className={`choice-btn${range === val ? " selected" : ""}`}
            style={{ fontSize: "0.82rem", padding: "5px 12px" }}
            onClick={() => setRange(val)}>{lbl}</button>
        ))}
      </div>

      <div className="stat-summary-grid">
        <SummaryCard label="Page views"      value={pageviews.length} />
        <SummaryCard label="Options viewed"  value={optionViews.length} />
        <SummaryCard label="Added to packet" value={addPacket.length} />
        <SummaryCard label="PDFs generated"  value={pdfs.length} />
        <SummaryCard label="Searches"        value={searches.length} />
      </div>

      <div className="stat-charts-grid">
        <div className="packet-panel">
          <h2>Pages visited</h2>
          <BarChart rows={topN(pageviews, "path")} color="var(--teal-700)" />
        </div>
        <div className="packet-panel">
          <h2>Options viewed most</h2>
          <BarChart rows={topN(optionViews, "label")} color="var(--teal-600)" />
        </div>
        <div className="packet-panel">
          <h2>Most added to packet</h2>
          <BarChart rows={topN(addPacket, "label")} color="var(--gold-500)" />
        </div>
        <div className="packet-panel">
          <h2>Top searches</h2>
          <BarChart rows={topN(searches, "label")} color="var(--ink-400)" />
        </div>
      </div>

      {inRange.length === 0 && (
        <p style={{ color: "var(--ink-400)", textAlign: "center", padding: "40px 0" }}>
          No data yet for this period. Stats will appear as people use the site.
        </p>
      )}
    </div>
  );
}

export default function Admin() {
  const [authed,   setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab,      setTab]      = useState("options");
  const [options,       setOptions]       = useState(null);
  const [resources,     setResources]     = useState(null);
  const [optionDetails, setOptionDetails] = useState(null);
  const [taxonomy,      setTaxonomy]      = useState(null);
  const [status,   setStatus]   = useState(null);
  const [saving,   setSaving]   = useState(false);

  // Add a new item to a specific taxonomy dimension
  function addToTaxonomy(dimension, item) {
    setTaxonomy((prev) => ({
      ...prev,
      [dimension]: [...(prev[dimension] || []), item],
    }));
  }

  async function loadContent() {
    const [opts, res, details, tax] = await Promise.all([
      apiFetch("/api/content/options"),
      apiFetch("/api/content/resources"),
      apiFetch("/api/content/option-details"),
      apiFetch("/api/content/taxonomy"),
    ]);
    setOptions(JSON.parse(JSON.stringify(opts)));
    setResources(JSON.parse(JSON.stringify(res)));
    setOptionDetails(JSON.parse(JSON.stringify(details)));
    setTaxonomy(JSON.parse(JSON.stringify(tax)));
  }

  useEffect(() => {
    const token = getToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!token) { setChecking(false); return; }

    // Timeout after 4s so a dead server doesn't leave the page blank
    const timer = setTimeout(() => {
      dropToken();
      setChecking(false);
    }, 4000);

    apiFetch("/api/auth/verify")
      .then(() => { setAuthed(true); return loadContent(); })
      .catch(() => { dropToken(); })
      .finally(() => { clearTimeout(timer); setChecking(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin() {
    setAuthed(true);
    setChecking(true);
    try { await loadContent(); }
    catch (err) { setStatus({ type: "error", msg: "Logged in but failed to load content: " + err.message }); }
    finally { setChecking(false); }
  }

  function handleLogout() {
    dropToken();
    setAuthed(false);
    setOptions(null); setResources(null); setOptionDetails(null); setTaxonomy(null);
    setStatus(null);
  }

  async function handleSave() {
    setSaving(true); setStatus(null);
    try {
      await Promise.all([
        apiFetch("/api/content/options",        { method: "PUT", body: JSON.stringify(options) }),
        apiFetch("/api/content/resources",      { method: "PUT", body: JSON.stringify(resources) }),
        apiFetch("/api/content/option-details", { method: "PUT", body: JSON.stringify(optionDetails) }),
        apiFetch("/api/content/taxonomy",       { method: "PUT", body: JSON.stringify(taxonomy) }),
      ]);
      setStatus({ type: "success", msg: "✓ Saved successfully." });
    } catch (err) {
      if (err.status === 401) { dropToken(); setAuthed(false); }
      setStatus({ type: "error", msg: `Save failed: ${err.message}` });
    } finally { setSaving(false); }
  }

  if (checking) return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2 12 2Z" fill="var(--teal-700)" />
          </svg>
        </div>
        <p style={{ color: "var(--ink-400)", margin: 0 }}>Checking session…</p>
      </div>
    </div>
  );
  if (!authed) return <LoginScreen onLogin={handleLogin} />;
  if (!options || !resources || !optionDetails || !taxonomy)
    return (
      <div className="login-screen">
        <div className="login-card">
          <p style={{ color: "var(--ink-400)", margin: 0 }}>Loading content…</p>
        </div>
      </div>
    );

  return (
    <div className="page admin-page">
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="eyebrow">Content Management</div>
          <h1>Edit Site Content</h1>
          <p>Changes are saved directly to the server.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <button className="btn" onClick={handleLogout}>Sign out</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save changes"}
          </button>
        </div>
      </div>

      {status && (
        <div className={`admin-banner ${status.type}`}>
          {status.msg}
          <button onClick={() => setStatus(null)}>✕</button>
        </div>
      )}

      <div className="tabs" role="tablist">
        <button className={`tab-btn${tab === "options" ? " active" : ""}`} role="tab" onClick={() => setTab("options")}>
          Adaptation Options ({options.length})
        </button>
        <button className={`tab-btn${tab === "resources" ? " active" : ""}`} role="tab" onClick={() => setTab("resources")}>
          Tools &amp; Resources ({resources.length})
        </button>
        <button className={`tab-btn${tab === "stats" ? " active" : ""}`} role="tab" onClick={() => setTab("stats")}>
          📊 Stats
        </button>
      </div>

      {tab === "options" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "14px 0" }}>
            <button className="btn btn-primary" onClick={() => setOptions([...options, {
              id: `option-${Date.now()}`, icon: "🌿", title: "", description: "",
              tags: [], cost: "low", context: [], waterStress: [],
              waterOutcome: [], priorities: [], scale: "on-farm", evidence: "moderate",
            }])}>+ Add option</button>
          </div>
          {options.map((opt, i) => (
            <OptionCard key={opt.id} option={opt}
              details={optionDetails[opt.id] || {}}
              taxonomy={taxonomy}
              defaultOpen={opt.id.startsWith("option-")}
              onChange={(u) => setOptions(options.map((o, j) => j === i ? u : o))}
              onChangeDetails={(d) => setOptionDetails({ ...optionDetails, [opt.id]: d })}
              onAddToTaxonomy={addToTaxonomy}
              onDelete={() => setOptions(options.filter((_, j) => j !== i))} />
          ))}
        </div>
      )}

      {tab === "resources" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "14px 0" }}>
            <button className="btn btn-primary" onClick={() => setResources([...resources, {
              id: `resource-${Date.now()}`, icon: "📁", title: "", description: "", tags: [], type: "guides",
            }])}>+ Add resource</button>
          </div>
          {resources.map((res, i) => (
            <ResourceCard key={res.id} resource={res} defaultOpen={res.id.startsWith("resource-")}
              onChange={(u) => setResources(resources.map((r, j) => j === i ? u : r))}
              onDelete={() => setResources(resources.filter((_, j) => j !== i))} />
          ))}
        </div>
      )}

      {tab === "stats" && <StatsPanel />}
    </div>
  );
}
