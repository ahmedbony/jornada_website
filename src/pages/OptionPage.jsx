import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useContent } from "../context/ContentContext.jsx";
import { costLabel } from "../data/options.js";
import { SECTION_DEFAULT_OPEN } from "../data/optionDetails.js";
import { usePacket } from "../context/PacketContext.jsx";
import { trackOptionView, trackAddToPacket, trackGeneratePDF } from "../hooks/useAnalytics.js";

// ─── Accordion section (no number prefix) ────────────────────────────────
function Section({ title, defaultOpen, children }) {
  return (
    <details className="accordion-section" open={defaultOpen}>
      <summary>
        <span>{title}</span>
      </summary>
      <div className="accordion-body">{children}</div>
    </details>
  );
}

// ─── Inline resource card (used in the Resources section) ────────────────
function ResourceCard({ resource }) {
  return (
    <div className="inline-resource-card">
      <span className="inline-resource-icon">{resource.icon}</span>
      <div>
        <strong>{resource.title}</strong>
        <p>{resource.description}</p>
        <div className="tag-row" style={{ marginTop: 4 }}>
          {resource.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

export default function OptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { options: OPTIONS, resources: RESOURCES, optionDetails: OPTION_DETAILS } = useContent();
  const { addToPacket, removeFromPacket, isInPacket } = usePacket();

  const option = OPTIONS.find((o) => o.id === id);
  const details = OPTION_DETAILS[id];

  // Track option view — must be before any early return (rules of hooks)
  useEffect(() => {
    if (option) trackOptionView(option.id, option.title);
  }, [option]);

  if (!option || !details) {
    return (
      <div className="page">
        <h1>Option not found</h1>
        <p>We couldn't find that adaptation option.</p>
        <button className="btn" onClick={() => navigate("/browse-options")}>
          Back to Browse Options
        </button>
      </div>
    );
  }

  const inPacket = isInPacket(option.id);

  // PDF: capture only the printable-content div, not the whole page shell
  async function handleDownloadPDF() {
    const el = document.getElementById("option-printable");
    if (!el) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: 900,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      let remaining = imgH;
      let yOffset = 0;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, yOffset, pageW, imgH);
      remaining -= pageH;
      while (remaining > 0) {
        yOffset -= pageH;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, yOffset, pageW, imgH);
        remaining -= pageH;
      }
      pdf.save(`${option.id}.pdf`);
      trackGeneratePDF();
    } catch {
      alert("PDF export failed. Please try using your browser's Print → Save as PDF instead.");
    }
  }

  // Resources relevant to this option (matching resourceTypes from details)
  const relevantResources = RESOURCES.filter((r) =>
    details.resourceTypes?.includes(r.type)
  );

  const wo = details.waterOutcomes;

  return (
    <div className="page option-page">
      {/* ── Header (outside printable area — buttons don't go in PDF) ── */}
      <div className="option-head">
        <div>
          <h1>{option.title}</h1>
          <p className="option-subtitle">
            {typeof details.overview === "string"
              ? details.overview.split("\n\n")[0]
              : details.overview}
          </p>
        </div>
        <div className="option-head-actions">
          <button
            className={`btn${inPacket ? " btn-in-packet" : " btn-primary"}`}
            onClick={() =>
              inPacket
                ? removeFromPacket(option.id)
                : (addToPacket({ type: "option", id: option.id, title: option.title, icon: option.icon }), trackAddToPacket(option.id, option.title))
            }
          >
            {inPacket ? "✓ In my packet" : "+ Add to my packet"}
          </button>
          <button className="btn" onClick={handleDownloadPDF}>⬇ Download PDF</button>
        </div>
      </div>

      <div className="tag-row option-tag-row">
        <span className="tag">Option</span>
        {option.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        <span className="tag cost">{costLabel(option.cost)}</span>
      </div>

      {/* ── Printable content ── */}
      <div id="option-printable">
        <Section title="Overview" defaultOpen={SECTION_DEFAULT_OPEN.overview}>
          <div className="accordion-grid">
            <div>
              {(typeof details.overview === "string" ? details.overview : "")
                .split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {details.overviewImage
              ? (
                <div className="option-image-wrap">
                  <img
                    src={typeof details.overviewImage === "object" ? details.overviewImage.url : details.overviewImage}
                    alt={`${option.title} overview`}
                    className="option-section-image"
                  />
                  {details.overviewImage?.caption && (
                    <p className="option-image-caption">{details.overviewImage.caption}</p>
                  )}
                </div>
              )
              : <div className="diagram-placeholder" aria-hidden="true">photo / diagram</div>}
          </div>
        </Section>

        <Section title="Water outcomes" defaultOpen={SECTION_DEFAULT_OPEN.waterOutcomes}>
          <div className={details.waterOutcomesImage ? "accordion-grid" : undefined}>
            <div>
              {typeof wo === "string"
                ? wo.split("\n\n").map((p, i) => <p key={i}>{p}</p>)
                : wo && typeof wo === "object"
                  ? <>
                      {wo.primaryPathway     && <p><strong>Primary water pathway:</strong> {wo.primaryPathway}</p>}
                      {wo.secondaryPathways  && <p><strong>Secondary pathways:</strong> {wo.secondaryPathways}</p>}
                      {wo.scaleOfEffect      && <p><strong>Scale of effect:</strong> {wo.scaleOfEffect}</p>}
                      {wo.evidenceConfidence && <p><strong>Evidence/confidence:</strong> {wo.evidenceConfidence}</p>}
                      {wo.caveats            && <p><strong>Caveats:</strong> {wo.caveats}</p>}
                    </>
                  : null}
            </div>
            {details.waterOutcomesImage && (
              <div className="option-image-wrap">
                <img
                  src={typeof details.waterOutcomesImage === "object" ? details.waterOutcomesImage.url : details.waterOutcomesImage}
                  alt="Water outcomes diagram"
                  className="option-section-image"
                />
                {details.waterOutcomesImage?.caption && (
                  <p className="option-image-caption">{details.waterOutcomesImage.caption}</p>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section title="Implementation" defaultOpen={SECTION_DEFAULT_OPEN.implementation}>
          <p>{details.implementation}</p>
        </Section>

        <Section title="Where it fits" defaultOpen={SECTION_DEFAULT_OPEN.whereItFits}>
          <p>{details.whereItFits}</p>
        </Section>

        <Section title="Benefits" defaultOpen={SECTION_DEFAULT_OPEN.benefits}>
          <p>{details.benefits}</p>
        </Section>

        <Section title="Costs, limitations, barriers, and tradeoffs" defaultOpen={SECTION_DEFAULT_OPEN.costsLimitations}>
          <p>{details.costsLimitations}</p>
        </Section>

        {/* Case studies — inline text, no link out */}
        <Section title="Case studies" defaultOpen={SECTION_DEFAULT_OPEN.caseStudies}>
          <p>{details.caseStudies}</p>
        </Section>

        {/* Resources — inline cards for relevant items */}
        <Section title="Resources" defaultOpen={SECTION_DEFAULT_OPEN.resources}>
          {relevantResources.length > 0 ? (
            <div className="inline-resource-list">
              {relevantResources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <p className="no-results">No resources linked to this option yet.</p>
          )}
        </Section>

        {/* Questions — moved to option page as requested */}
        <Section title="Questions to investigate" defaultOpen={false}>
          <ul className="question-list">
            <li>❓ What are the costs and benefits of {option.title.toLowerCase()} in my area?</li>
            <li>❓ What funding or incentive programs can support this action?</li>
            <li>❓ What data and monitoring are needed to implement this effectively?</li>
            <li>❓ Which local partners or agencies are involved in this type of work?</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
