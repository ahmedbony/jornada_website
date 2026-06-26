import { useNavigate } from "react-router-dom";
import { usePacket } from "../context/PacketContext.jsx";
import { CONTEXTS, WATER_STRESSES, WATER_OUTCOMES, PRIORITIES, labelFor } from "../data/taxonomy.js";

function ChoiceGroup({ choices, selected, onToggle }) {
  return (
    <div className="choice-grid">
      {choices.map((c) => (
        <button
          key={c.key}
          type="button"
          className={`choice-btn${selected.includes(c.key) ? " selected" : ""}`}
          onClick={() => onToggle(c.key)}
          aria-pressed={selected.includes(c.key)}
        >
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
      {values.length === 0 ? (
        <p className="no-selection">No selection yet</p>
      ) : (
        <p className="selection-values">{values.map((v) => labelFor(list, v)).join(", ")}</p>
      )}
    </div>
  );
}

export default function GuidedExplorer() {
  const { answers, setAnswers, setHasGenerated, clearAnswers } = usePacket();
  const navigate = useNavigate();

  function toggle(field, key) {
    setAnswers((prev) => {
      const current = prev[field];
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      return { ...prev, [field]: next };
    });
  }

  function generate() {
    setHasGenerated(true);
    navigate("/packet");
  }

  const hasAnyAnswer =
    answers.context.length || answers.waterStress.length || answers.waterOutcome.length || answers.priorities.length || answers.notes.trim();

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Guided Explorer</div>
        <h1>Build an Adaptation Packet</h1>
        <p>Short question flow that assembles an adaptation packet from the option library and the tools &amp; resources library.</p>
      </div>

      <div className="layout-with-sidebar explorer-layout">
        <div>
          <section className="explorer-question">
            <h2>1. What kind of agricultural context are you working in?</h2>
            <ChoiceGroup choices={CONTEXTS} selected={answers.context} onToggle={(k) => toggle("context", k)} />
          </section>

          <section className="explorer-question">
            <h2>2. What water stresses are relevant?</h2>
            <ChoiceGroup choices={WATER_STRESSES} selected={answers.waterStress} onToggle={(k) => toggle("waterStress", k)} />
          </section>

          <section className="explorer-question">
            <h2>3. What water outcome are you looking for?</h2>
            <ChoiceGroup choices={WATER_OUTCOMES} selected={answers.waterOutcome} onToggle={(k) => toggle("waterOutcome", k)} />
          </section>

          <section className="explorer-question">
            <h2>4. What constraints or priorities matter?</h2>
            <ChoiceGroup choices={PRIORITIES} selected={answers.priorities} onToggle={(k) => toggle("priorities", k)} />
          </section>

          <section className="explorer-question">
            <h2>5. Describe your situation (optional)</h2>
            <textarea
              className="explorer-textarea"
              placeholder="Type your response here..."
              value={answers.notes}
              onChange={(e) => setAnswers((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </section>

          <div className="explorer-actions">
            <button className="btn btn-primary" onClick={generate} disabled={!hasAnyAnswer}>
              Generate Adaptation Packet
            </button>
            <button className="btn" onClick={clearAnswers}>Clear responses</button>
          </div>
        </div>

        <aside className="filter-panel" aria-label="Current selections">
          <h2>Current selections</h2>
          <SelectionSummary title="Context" values={answers.context} list={CONTEXTS} />
          <SelectionSummary title="Water stresses" values={answers.waterStress} list={WATER_STRESSES} />
          <SelectionSummary title="Water outcome" values={answers.waterOutcome} list={WATER_OUTCOMES} />
          <SelectionSummary title="Priorities" values={answers.priorities} list={PRIORITIES} />
        </aside>
      </div>
    </div>
  );
}
