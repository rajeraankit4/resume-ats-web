import { useState } from "react";

// Vite uses import.meta.env instead of process.env
const DIRECT_MATCH_ENDPOINT = `${import.meta.env.VITE_API_URL}/resume-analysis`;

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Upload a PDF resume to begin analysis.",
  );
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [rawResult, setRawResult] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setStatusMessage("Please choose a PDF file.");
      return;
    }

    setSelectedFile(file);
    setStatusMessage(`Ready to analyze ${file.name}.`);
    setAnalysis(null);
    setRawResult("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatusMessage("Select a PDF resume before submitting.");
      return;
    }

    setIsUploading(true);
    setStatusMessage("Sending resume for analysis...");
    setAnalysis(null);
    setRawResult("");
    setSuggestions([]);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      if (!import.meta.env.VITE_API_URL) {
        throw new Error("Resume analysis endpoint is not configured in .env file.");
      }

      const response = await fetch(DIRECT_MATCH_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText || `Request failed with status ${response.status}`,
        );
      }

      try {
        const parsed = JSON.parse(responseText);

        setAnalysis(parsed);

        if (parsed.ai_analysis) {
          try {
            const aiData = JSON.parse(parsed.ai_analysis);
            setSuggestions(aiData.suggestions || []);
          } catch {
            setSuggestions([]);
          }
        }

        setStatusMessage("Resume uploaded successfully.");
      } catch {
        setRawResult(responseText || "No response body returned.");
        setStatusMessage("Resume uploaded successfully.");
      }
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to upload resume.",
      );
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <main className="resume-analysis-page">
      <style>{`
      /* 1. Add this reset to remove default padding/margins and force full width */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          background-color: #ffffff; 
        }

        .resume-analysis-page {
          width: 100%; /* 2. Ensure it takes up the entire horizontal space */
          min-height: 100vh;
          padding: 48px 20px;
          background: radial-gradient(circle at top, #eff6ff 0%, #f8fafc 45%, #ffffff 100%);
          color: #0f172a;
          font-family: Inter, system-ui, sans-serif;
          box-sizing: border-box;
        }
        .resume-analysis-page {
          min-height: 100vh;
          padding: 48px 20px;
          background: radial-gradient(circle at top, #eff6ff 0%, #f8fafc 45%, #ffffff 100%);
          color: #0f172a;
          font-family: Inter, system-ui, sans-serif;
        }
        .resume-shell {
          max-width: 860px;
          margin: 0 auto;
        }
        .hero-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 28px;
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .hero-top {
          padding: 32px 32px 18px;
          background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #2563eb 100%);
          color: #fff;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .hero-title {
          margin: 18px 0 10px;
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }
        .hero-copy {
          margin: 0;
          max-width: 60ch;
          color: rgba(255, 255, 255, 0.84);
          font-size: 15px;
          line-height: 1.6;
        }
        .hero-body {
          padding: 28px 32px 32px;
        }
        .upload-box {
          border: 1.5px dashed #cbd5e1;
          border-radius: 22px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          padding: 28px;
        }
        .upload-label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
        }
        .upload-input {
          width: 100%;
          display: block;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #334155;
        }
        .meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 14px;
          font-size: 13px;
          color: #475569;
        }
        .meta-chip {
          padding: 8px 12px;
          border-radius: 999px;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 700;
        }
        .actions-row {
          display: flex;
          gap: 12px;
          margin-top: 22px;
          flex-wrap: wrap;
        }
        .submit-btn {
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #2563eb, #0f172a);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .status-card {
          margin-top: 18px;
          padding: 16px 18px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .status-title {
          margin: 0 0 6px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
        }
        .status-text {
          margin: 0;
          color: #0f172a;
          line-height: 1.6;
          word-break: break-word;
        }
        .result-box {
          margin-top: 14px;
          padding: 16px 18px;
          border-radius: 18px;
          background: #0f172a;
          color: #e2e8f0;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 13px;
          line-height: 1.6;
        }
        .results-section {
          margin-top: 18px;
        }
        .results-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }
        .results-title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .results-subtitle {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
        }
        .results-grid {
          display: grid;
          gap: 14px;
        }
        .match-card {
          border-radius: 22px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          font-size:14px;
          textAlign: "left";
        }
        .match-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .match-domain {
          margin: 0;
          font-size: 20px;
          line-height: 1.1;
          font-weight: 800;
          color: #0f172a;
        }
        .match-label {
          margin: 6px 0 0;
          color: #475569;
          font-size: 13px;
          line-height: 1.5;
        }
        .match-badge {
          flex: 0 0 auto;
          padding: 8px 12px;
          border-radius: 999px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }
        .match-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 16px;
        }
        .stat {
          padding: 12px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .stat-label {
          margin: 0 0 4px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .stat-value {
          margin: 0;
          color: #0f172a;
          font-size: 15px;
          font-weight: 800;
        }
        .match-footer {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 10px 16px;
          color: #475569;
          font-size: 13px;
        }
        .disclaimer {
          margin: 12px 12px;
          font-size: 13px;
          color: #white;
          line-height: 1.5;
          text-align: center;
        }
        @media (max-width: 640px) {
          .hero-top, .hero-body { padding-left: 20px; padding-right: 20px; }
          .upload-box { padding: 20px; }
          .match-top { flex-direction: column; }
          .match-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="resume-shell">
        <section className="hero-card">
          <div className="hero-top">
            <span className="eyebrow">Resume Analysis</span>
            <h1 className="hero-title">
              Upload your PDF resume for domain matching.
            </h1>
            <p className="hero-subtitle">
              Rate your resume against college-specific job descriptions.
            </p>
            <p className="disclaimer">
            Your resume will be analyzed and rated against the job descriptions (JDs) that have already been uploaded by the administrator. If you encounter any issues or have any questions, please contact rajeraankit4@gmail.com.
          </p>
          </div>

          <div className="hero-body">
            <form onSubmit={handleSubmit}>
              <div className="upload-box">
                <label className="upload-label" htmlFor="resume-upload">
                  Resume PDF
                </label>
                <input
                  id="resume-upload"
                  className="upload-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                />

                <div className="meta-row">
                  <span className="meta-chip">PDF only</span>
                </div>

                <div className="actions-row">
                  <button
                    className="submit-btn"
                    type="submit"
                    disabled={isUploading || !selectedFile}
                  >
                    {isUploading ? "Uploading..." : "Analyze Resume"}
                  </button>
                </div>
              </div>

              {analysis?.results?.length ? (
                <section className="results-section" aria-live="polite">
                  <div className="results-header">
                    <div>
                      <h2 className="results-title">Matched domains</h2>
                    </div>
                  </div>

                  <div className="results-grid">
                    {analysis.results.map((match) => (
                      <article key={match.domain} className="match-card">
                        <div className="match-top">
                          <div>
                            <h3 className="match-domain">{match.domain}</h3>
                          </div>
                          <div className="match-badge">
                            {match.domain_fit.toFixed(1)}% domain fit
                          </div>
                        </div>

                        <div className="match-stats">
                          <div className="stat">
                            <p className="stat-label">Overall score</p>
                            <p className="stat-value">
                              {match.overall_score.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : rawResult ? (
                <pre className="result-box">{rawResult}</pre>
              ) : null}
              {suggestions.length > 0 && (
              <section className="results-section">
                <div className="results-header">
                  <div>
                    <h2 className="results-title">Improvement Suggestions</h2>
                  </div>
                </div>

                <div className="match-card">
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      color: "#475569",
                      lineHeight: "1.8",
                      fontSize: "13px",
                      textAlign: "left" /* 👈 Forces the text to align to the left */
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
            </form>
          </div>
          <p className="disclaimer">
            Note: These scores are generated by an experimental resume analysis
            system and may not be fully accurate. The feature is currently under
            testing and active development. Please use the results as guidance
            only. Thank you for your feedback and patience.
          </p>
        </section>
      </div>
    </main>
  );
}
