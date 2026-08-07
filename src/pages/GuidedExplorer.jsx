import { useEffect } from "react";
import { trackPageView } from "../hooks/useAnalytics.js";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePacket } from "../context/PacketContext.jsx";
import { useContent } from "../context/ContentContext.jsx";
import { costLabel } from "../data/options.js";
import { CONTEXTS, WATER_STRESSES, WATER_OUTCOMES, PRIORITIES, labelFor } from "../data/taxonomy.js";

function overlapScore(optionList = [], selected = []) {
  return optionList.filter((tag) => selected.includes(tag)).length;
}

function ChoiceGroup({ choices, selected, onToggle }) {
  return (
    <div className="choice-grid">
      {choices.map((c) => (
        <button key={c.key} type="button"
          className={`choice-btn${selected.includes(c.key) ? " selected" : ""}`}
          onClick={() => onToggle(c.key)} aria-pressed={selected.includes(c.key)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

function SelectionSummary({ title, values, list }) {
  return (
    <div className="selection-card">
      <h3>{title}</h3>
      {values.length === 0
        ? <p className="no-selection">No selection yet</p>
        : <p className="selection-values">{values.map((v) => labelFor(list, v)).join(", ")}</p>}
    </div>
  );
}

function SuggestedCard({ opt }) {
  const { addToPacket, removeFromPacket, isInPacket } = usePacket();
  const inPkt = isInPacket(opt.id);
  return (
    <article className="card">
      <span className="card-icon">{opt.icon}</span>
      <h3>{opt.title}</h3>
      <p>{opt.description}</p>
      <div className="tag-row">
        {opt.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        <span className="tag cost">{costLabel(opt.cost)}</span>
      </div>
      <div className="card-actions">
        <Link className="learn-more" to={`/options/${opt.id}`}>Learn more →</Link>
        <button
          className={`btn-packet-sm${inPkt ? " in-packet" : ""}`}
          onClick={() => inPkt
            ? removeFromPacket(opt.id)
            : addToPacket({ type: "option", id: opt.id, title: opt.title, icon: opt.icon })}
        >
          {inPkt ? "✓ In packet" : "+ Packet"}
        </button>
      </div>
    </article>
  );
}

export default function GuidedExplorer() {
  const { options: OPTIONS } = useContent();
  const { answers, setAnswers, clearAnswers, setHasGenerated, packetItems } = usePacket();
  const navigate = useNavigate();

  useEffect(() => { trackPageView("/guided-explorer"); }, []);

  function toggle(field, key) {
    setAnswers((prev) => {
      const current = prev[field];
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      return { ...prev, [field]: next };
    });
  }

  function handleGenerate() {
    setHasGenerated(true);
    navigate("/packet");
  }

  const hasAnyAnswer =
    answers.context.length ||
    answers.waterStress.length ||
    answers.waterOutcome.length ||
    answers.priorities.length ||
    answers.notes?.trim();

  const suggested = useMemo(() => {
    if (!answers.context.length && !answers.waterStress.length &&
        !answers.waterOutcome.length && !answers.priorities.length) return [];
    return [...OPTIONS]
      .map((opt) => ({
        opt,
        score:
          overlapScore(opt.context, answers.context) * 2 +
          overlapScore(opt.waterStress, answers.waterStress) * 2 +
          overlapScore(opt.waterOutcome, answers.waterOutcome) * 2 +
          overlapScore(opt.priorities, answers.priorities),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((s) => s.opt);
  }, [answers, OPTIONS]);

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Guided Explorer</div>
        <h1>Build an Adaptation Packet</h1>
        <p>
          Answer a few questions to surface relevant adaptation options, then generate
          a tailored packet.
        </p>
      </div>

      <div className="layout-with-sidebar explorer-layout">
        <div>
          {/* ── Questions ── */}
          <section className="explorer-question">
            <h2>1. What kind of agricultural context are you working in?</h2>
            <ChoiceGroup choices={CONTEXTS} selected={answers.context}
              onToggle={(k) => toggle("context", k)} />
          </section>

          <section className="explorer-question">
            <h2>2. What water stresses are relevant?</h2>
            <ChoiceGroup choices={WATER_STRESSES} selected={answers.waterStress}
              onToggle={(k) => toggle("waterStress", k)} />
          </section>

          <section className="explorer-question">
            <h2>3. What water outcome are you looking for?</h2>
            <ChoiceGroup choices={WATER_OUTCOMES} selected={answers.waterOutcome}
              onToggle={(k) => toggle("waterOutcome", k)} />
          </section>

          <section className="explorer-question">
            <h2>4. What constraints or priorities matter?</h2>
            <ChoiceGroup choices={PRIORITIES} selected={answers.priorities}
              onToggle={(k) => toggle("priorities", k)} />
          </section>

          <section className="explorer-question">
            <h2>5. Describe your situation (optional)</h2>
            <textarea
              className="explorer-textarea"
              placeholder="Type your response here..."
              value={answers.notes || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </section>

          <div className="explorer-actions">
            <button className="btn btn-primary" onClick={handleGenerate}>
              Generate Adaptation Packet
            </button>
            <button className="btn" onClick={clearAnswers} disabled={!hasAnyAnswer}>
              Clear responses
            </button>
          </div>

          {/* ── Suggested results appear as you select ── */}
          {suggested.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div className="results-head">
                <h2>{suggested.length} suggested option{suggested.length === 1 ? "" : "s"}</h2>
              </div>
              <div className="card-grid">
                {suggested.map((opt) => <SuggestedCard key={opt.id} opt={opt} />)}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="filter-panel" aria-label="Current selections">
          <h2>Current selections</h2>
          <SelectionSummary title="Context"        values={answers.context}      list={CONTEXTS} />
          <SelectionSummary title="Water stresses" values={answers.waterStress}  list={WATER_STRESSES} />
          <SelectionSummary title="Water outcome"  values={answers.waterOutcome} list={WATER_OUTCOMES} />
          <SelectionSummary title="Priorities"     values={answers.priorities}   list={PRIORITIES} />

          {packetItems.length > 0 && (
            <div className="sidebar-packet-summary">
              <h3>My packet ({packetItems.length})</h3>
              {packetItems.map((item) => (
                <p key={item.id}>{item.icon} {item.title}</p>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
