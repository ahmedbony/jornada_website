import { useEffect } from "react";
import { trackPageView, trackGeneratePDF } from "../hooks/useAnalytics.js";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePacket } from "../context/PacketContext.jsx";
import { useContent } from "../context/ContentContext.jsx";
import { CONTEXTS, WATER_STRESSES, WATER_OUTCOMES, PRIORITIES, labelFor } from "../data/taxonomy.js";
import { costLabel } from "../data/options.js";

export default function AdaptationPacket() {
  const { answers, packetItems, removeFromPacket } = usePacket();
  const { options: OPTIONS, resources: RESOURCES } = useContent();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { trackPageView("/packet"); }, []);

  const packetOptions   = packetItems.filter((p) => p.type === "option")
    .map((p) => OPTIONS.find((o) => o.id === p.id)).filter(Boolean);
  const packetResources = packetItems.filter((p) => p.type === "resource")
    .map((p) => RESOURCES.find((r) => r.id === p.id)).filter(Boolean);

  async function handleDownloadPDF() {
    if (!contentRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const el = contentRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: 900,
        ignoreElements: (node) => node.classList?.contains("packet-actions"),
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH  = (canvas.height * pageW) / canvas.width;
      let remaining = imgH;
      let yOffset   = 0;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, yOffset, pageW, imgH);
      remaining -= pageH;
      while (remaining > 0) {
        yOffset -= pageH;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, yOffset, pageW, imgH);
        remaining -= pageH;
      }
      pdf.save("adaptation-packet.pdf");
      trackGeneratePDF();
    } catch {
      alert("PDF export failed. Try browser Print → Save as PDF instead.");
    } finally {
      setDownloading(false);
    }
  }

  const hasContext = answers.context.length || answers.waterStress.length ||
    answers.waterOutcome.length || answers.priorities.length;

  return (
    <div className="page packet-page" ref={contentRef}>
      <div className="page-head packet-head">
        <div>
          <div className="eyebrow">Adaptation Packet</div>
          <h1>Your Adaptation Packet</h1>
          <p>Assembled from the options library based on your guided explorer responses.</p>
        </div>
        <div className="packet-actions">
          <button className="btn" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? "Generating…" : "⬇ Download PDF"}
          </button>
          <button className="btn" onClick={() => navigate("/guided-explorer")}>
            ← Back to Explorer
          </button>
        </div>
      </div>

      {/* Water-stress profile */}
      {hasContext && (
        <div className="packet-panel">
          <h2>Water-stress profile</h2>
          <table className="profile-table">
            <tbody>
              {answers.context.length > 0 && (
                <tr>
                  <th>Context</th>
                  <td>{answers.context.map((k) => labelFor(CONTEXTS, k)).join("; ")}</td>
                </tr>
              )}
              {answers.waterStress.length > 0 && (
                <tr>
                  <th>Water stresses</th>
                  <td>{answers.waterStress.map((k) => labelFor(WATER_STRESSES, k)).join("; ")}</td>
                </tr>
              )}
              {answers.waterOutcome.length > 0 && (
                <tr>
                  <th>Water outcome focus</th>
                  <td>{answers.waterOutcome.map((k) => labelFor(WATER_OUTCOMES, k)).join("; ")}</td>
                </tr>
              )}
              {answers.priorities.length > 0 && (
                <tr>
                  <th>Priorities</th>
                  <td>{answers.priorities.map((k) => labelFor(PRIORITIES, k)).join("; ")}</td>
                </tr>
              )}
              {answers.notes?.trim() && (
                <tr>
                  <th>Notes</th>
                  <td>{answers.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected options */}
      {packetOptions.length > 0 && (
        <div className="packet-panel">
          <h2>Adaptation options ({packetOptions.length})</h2>
          <div className="card-grid">
            {packetOptions.map((opt) => (
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
                  <button className="btn-packet-sm in-packet"
                    onClick={() => removeFromPacket(opt.id)}>✕ Remove</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Selected resources */}
      {packetResources.length > 0 && (
        <div className="packet-panel">
          <h2>Resources ({packetResources.length})</h2>
          <div className="card-grid">
            {packetResources.map((res) => (
              <article className="card" key={res.id}>
                <span className="card-icon">{res.icon}</span>
                <h3>{res.title}</h3>
                <p>{res.description}</p>
                <div className="tag-row">
                  {res.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
                <button className="btn-packet-sm in-packet"
                  onClick={() => removeFromPacket(res.id)}>✕ Remove</button>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {packetOptions.length === 0 && packetResources.length === 0 && (
        <div className="packet-panel" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--ink-400)", marginBottom: 16 }}>
            No items in your packet yet. Use <strong>+ Packet</strong> on any option to add it.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => navigate("/guided-explorer")}>
              Back to Guided Explorer
            </button>
            <button className="btn" onClick={() => navigate("/browse-options")}>
              Browse Options
            </button>
          </div>
        </div>
      )}

      <div className="packet-actions" style={{ marginTop: 24 }}>
        <button className="btn" onClick={() => navigate("/guided-explorer")}>
          ← Back to Explorer
        </button>
        <button className="btn" onClick={() => navigate("/browse-options")}>
          Browse more options
        </button>
      </div>
    </div>
  );
}
