import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePacket } from "../context/PacketContext.jsx";
import { OPTIONS, costLabel } from "../data/options.js";
import { RESOURCES } from "../data/resources.js";
import { CONTEXTS, WATER_STRESSES, WATER_OUTCOMES, PRIORITIES, labelFor } from "../data/taxonomy.js";

function overlapScore(optionList = [], selected = []) {
  return optionList.filter((tag) => selected.includes(tag)).length;
}

export default function AdaptationPacket() {
  const { answers, hasGenerated } = usePacket();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const recommended = useMemo(() => {
    return [...OPTIONS]
      .map((opt) => ({
        opt,
        score:
          overlapScore(opt.context, answers.context) * 2 +
          overlapScore(opt.waterStress, answers.waterStress) * 2 +
          overlapScore(opt.waterOutcome, answers.waterOutcome) * 2 +
          overlapScore(opt.priorities, answers.priorities),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.opt);
  }, [answers]);

  const selectedResources = useMemo(() => {
    // Show resources that share a tag with any recommended option's tags
    const tagPool = new Set(recommended.flatMap((o) => o.tags.map((t) => t.toLowerCase())));
    const scored = RESOURCES.map((r) => ({
      r,
      score: r.tags.filter((t) => tagPool.has(t.toLowerCase())).length,
    }));
    const withMatches = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
    const pool = withMatches.length > 0 ? withMatches.map((s) => s.r) : RESOURCES;
    return pool.slice(0, 4);
  }, [recommended]);

  const questions = useMemo(() => {
    return recommended.map(
      (opt) => `What are the costs and benefits of ${opt.title.toLowerCase()} for this operation?`
    );
  }, [recommended]);

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    if (!contentRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        ignoreElements: (el) => el.classList?.contains("packet-actions"),
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("adaptation-packet.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Sorry, the PDF couldn't be generated. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Adaptation Packet", url });
      } catch {
        /* user cancelled share — no action needed */
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard.");
    }
  }

  if (!hasGenerated) {
    return (
      <div className="page">
        <div className="page-head">
          <div className="eyebrow">Adaptation Packet</div>
          <h1>No packet generated yet</h1>
          <p>Answer a few questions in the Guided Explorer to assemble a tailored adaptation packet.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/guided-explorer")}>
          Go to Guided Explorer
        </button>
      </div>
    );
  }

  return (
    <div className="page packet-page" ref={contentRef}>
      <div className="page-head packet-head">
        <div>
          <div className="eyebrow">Guided explorer output</div>
          <h1>Your Adaptation Packet</h1>
          <p>Assembled from the Adaptation Options Library and the Tools &amp; Resources Library.</p>
        </div>
        <div className="packet-actions">
          <button className="btn" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? "Generating…" : "⬇ Download PDF"}
          </button>
          <button className="btn" onClick={handlePrint}>🖨 Print</button>
          <button className="btn" onClick={handleShare}>↗ Share</button>
        </div>
      </div>

      <div className="packet-top-grid">
        <div className="packet-panel">
          <h2>Water-stress profile</h2>
          <table className="profile-table">
            <tbody>
              <tr>
                <th>Context</th>
                <td>{answers.context.length ? answers.context.map((k) => labelFor(CONTEXTS, k)).join("; ") : "Not specified"}</td>
              </tr>
              <tr>
                <th>Water stresses</th>
                <td>{answers.waterStress.length ? answers.waterStress.map((k) => labelFor(WATER_STRESSES, k)).join("; ") : "Not specified"}</td>
              </tr>
              <tr>
                <th>Water outcome focus</th>
                <td>{answers.waterOutcome.length ? answers.waterOutcome.map((k) => labelFor(WATER_OUTCOMES, k)).join("; ") : "Not specified"}</td>
              </tr>
              <tr>
                <th>Priorities</th>
                <td>{answers.priorities.length ? answers.priorities.map((k) => labelFor(PRIORITIES, k)).join("; ") : "Not specified"}</td>
              </tr>
              {answers.notes && (
                <tr>
                  <th>Notes</th>
                  <td>{answers.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="packet-panel">
          <h2>Related context pages</h2>
          <ul className="chevron-list">
            {answers.context.slice(0, 3).map((k) => (
              <li key={k}>
                <Link to="/browse-options">📄 {labelFor(CONTEXTS, k)} overview</Link>
              </li>
            ))}
            {answers.context.length === 0 && <li className="no-selection">No context selected yet.</li>}
          </ul>
        </div>
      </div>

      <div className="packet-panel">
        <h2>Recommended adaptation options</h2>
        <div className="card-grid">
          {recommended.map((opt) => (
            <article className="card" key={opt.id}>
              <span className="card-icon">{opt.icon}</span>
              <h3>{opt.title}</h3>
              <p>{opt.description}</p>
              <div className="tag-row">
                <span className="tag cost">{costLabel(opt.cost)}</span>
              </div>
              <Link className="learn-more" to={`/options/${opt.id}`}>Learn more →</Link>
            </article>
          ))}
        </div>
      </div>

      <div className="packet-bottom-grid">
        <div className="packet-panel">
          <h2>Selected case studies and resources</h2>
          <ul className="chevron-list">
            {selectedResources.map((r) => (
              <li key={r.id}>
                <span>{r.icon} {r.title}</span>
                <span className="chevron">›</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="packet-panel">
          <h2>Questions to investigate next</h2>
          <ul className="question-list">
            {questions.map((q, i) => (
              <li key={i}>❓ {q}</li>
            ))}
            {questions.length === 0 && <li className="no-selection">Add more answers to generate questions.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
