import { useNavigate, useParams, Link } from "react-router-dom";
import { OPTIONS, costLabel } from "../data/options.js";
import { OPTION_DETAILS, SECTION_DEFAULT_OPEN } from "../data/optionDetails.js";
import { RESOURCE_TYPES } from "../data/resources.js";

const TYPE_ICON = {
  funding: "🏛",
  extension: "🎓",
  tools: "🛠",
  guides: "📘",
  data: "📊",
  "case-studies": "📄",
};

function SolarShadeDiagram() {
  return (
    <svg viewBox="0 0 220 150" className="option-diagram-svg" role="img" aria-label="Solar shade reducing evaporation from a water surface">
      <g stroke="var(--ink-600)" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <circle cx="34" cy="26" r="11" />
        <line x1="34" y1="6" x2="34" y2="0" />
        <line x1="34" y1="46" x2="34" y2="52" />
        <line x1="14" y1="26" x2="8" y2="26" />
        <line x1="16" y1="12" x2="11" y2="7" />
        <line x1="16" y1="40" x2="11" y2="45" />
        <line x1="52" y1="38" x2="78" y2="58" />
        <line x1="68" y1="34" x2="92" y2="56" />
        <line x1="84" y1="32" x2="106" y2="52" />
      </g>
      <path d="M40 78 Q110 50 180 78 L180 86 Q110 64 40 86 Z" fill="var(--sand-100)" stroke="var(--ink-600)" strokeWidth="1.6" />
      <path d="M50 100 Q110 116 170 100 L170 118 Q110 134 50 118 Z" fill="#DCE8E6" stroke="var(--teal-600)" strokeWidth="1.6" />
      <path d="M50 100 Q110 116 170 100" fill="none" stroke="var(--teal-600)" strokeWidth="1.6" />
    </svg>
  );
}

function GenericDiagram() {
  return (
    <div className="diagram-placeholder" aria-hidden="true">
      photo / diagram
    </div>
  );
}

function AccordionSection({ number, title, defaultOpen, children }) {
  return (
    <details className="accordion-section" open={defaultOpen}>
      <summary>
        <span>{number}. {title}</span>
      </summary>
      <div className="accordion-body">{children}</div>
    </details>
  );
}

export default function OptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const option = OPTIONS.find((o) => o.id === id);
  const details = OPTION_DETAILS[id];

  if (!option || !details) {
    return (
      <div className="page">
        <h1>Option not found</h1>
        <p>We couldn't find that adaptation option.</p>
        <button className="btn" onClick={() => navigate("/browse-options")}>Back to Browse Options</button>
      </div>
    );
  }

  function handlePrint() {
    window.print();
  }

  const wo = details.waterOutcomes;

  return (
    <div className="page option-page">
      <div className="option-head">
        <div>
          <h1>{option.title}</h1>
          <p>{details.overview.split("\n\n")[0]}</p>
        </div>
        <div className="packet-actions">
          <button className="btn" onClick={handlePrint}>⬇ Download PDF</button>
          <button className="btn" onClick={handlePrint}>🖨 Print</button>
        </div>
      </div>

      <div className="tag-row option-tag-row">
        <span className="tag">Option</span>
        {option.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        <span className="tag cost">{costLabel(option.cost)}</span>
      </div>

      <AccordionSection id="overview" number={1} title="Overview" defaultOpen={SECTION_DEFAULT_OPEN.overview}>
        <div className="accordion-grid">
          <div>
            {details.overview.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <GenericDiagram />
        </div>
      </AccordionSection>

      <AccordionSection id="waterOutcomes" number={2} title="Water outcomes" defaultOpen={SECTION_DEFAULT_OPEN.waterOutcomes}>
        <div className="accordion-grid">
          <div>
            <p><strong>Primary water pathway:</strong> {wo.primaryPathway}</p>
            <p><strong>Secondary pathways:</strong> {wo.secondaryPathways}</p>
            <p><strong>Scale of effect:</strong> {wo.scaleOfEffect}</p>
            <p><strong>Evidence/confidence:</strong> {wo.evidenceConfidence}</p>
            <p><strong>Caveats:</strong> {wo.caveats}</p>
          </div>
          {wo.diagram === "solar-shade" ? (
            <div className="diagram-with-caption">
              <SolarShadeDiagram />
              <p className="diagram-caption">Shade reduces solar radiation, lowering evaporation.</p>
            </div>
          ) : (
            <GenericDiagram />
          )}
        </div>
      </AccordionSection>

      <AccordionSection id="implementation" number={3} title="Implementation" defaultOpen={SECTION_DEFAULT_OPEN.implementation}>
        <p>{details.implementation}</p>
      </AccordionSection>

      <AccordionSection id="whereItFits" number={4} title="Where it fits" defaultOpen={SECTION_DEFAULT_OPEN.whereItFits}>
        <p>{details.whereItFits}</p>
      </AccordionSection>

      <AccordionSection id="benefits" number={5} title="Benefits" defaultOpen={SECTION_DEFAULT_OPEN.benefits}>
        <p>{details.benefits}</p>
      </AccordionSection>

      <AccordionSection id="costsLimitations" number={6} title="Costs, limitations, barriers, and tradeoffs" defaultOpen={SECTION_DEFAULT_OPEN.costsLimitations}>
        <p>{details.costsLimitations}</p>
      </AccordionSection>

      <div className="option-bottom-grid">
        <AccordionSection id="caseStudies" number={7} title="Case studies" defaultOpen={SECTION_DEFAULT_OPEN.caseStudies}>
          <div className="case-study-row">
            <div className="diagram-placeholder small" aria-hidden="true">▲</div>
            <div>
              <p>{details.caseStudies}</p>
              <Link
                className="learn-more"
                to="/tools-resources"
                state={{ presetType: "case-studies" }}
              >
                View case studies →
              </Link>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="resources" number={8} title="Resources" defaultOpen={SECTION_DEFAULT_OPEN.resources}>
          <div className="resource-icon-grid">
            {details.resourceTypes.map((typeKey) => {
              const rt = RESOURCE_TYPES.find((r) => r.key === typeKey);
              if (!rt) return null;
              return (
                <Link
                  key={typeKey}
                  className="resource-icon-link"
                  to="/tools-resources"
                  state={{ presetType: typeKey }}
                >
                  <span className="resource-icon">{TYPE_ICON[typeKey] ?? "📁"}</span>
                  <span>{rt.label}</span>
                </Link>
              );
            })}
          </div>
          <Link className="learn-more" to="/tools-resources">View all resources →</Link>
        </AccordionSection>
      </div>
    </div>
  );
}
