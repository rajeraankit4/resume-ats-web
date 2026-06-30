import { useState } from "react";

const DIRECT_MATCH_ENDPOINT = `${import.meta.env.VITE_API_URL}/resume-analysis`;

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(DIRECT_MATCH_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Safe JSON Parsing for Suggestions
  let suggestions = [];
  if (results?.ai_analysis) {
    try {
      suggestions =
        typeof results.ai_analysis === "string"
          ? JSON.parse(results.ai_analysis).suggestions
          : results.ai_analysis.suggestions;
    } catch (e) {
      console.error("Failed to parse suggestions", e);
    }
  }

  // Safe Reduction to prevent crashes when results array is empty or null
  const bestMatch =
    results?.results && results.results.length > 0
      ? results.results.reduce((a, b) =>
          (a.domain_fit || 0) > (b.domain_fit || 0) ? a : b,
        )
      : null;

  const getColor = (score) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
            AI Resume Analysis
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
            Resume ATS Analyzer
          </h1>

          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your resume to evaluate how well it matches a curated set of job descriptions and receive AI-powered improvement suggestions.
          </p>
          
        </div>

        {/* Upload Card */}
        <div className="rounded-3xl bg-white shadow-xl border border-slate-200 p-8">
          <label
            htmlFor="resume"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 transition hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-slate-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16V4m0 0l-4 4m4-4l4 4M5 20h14"
    />
  </svg>
</div>

            <h3 className="mt-4 text-xl font-semibold">Upload Resume</h3>

            <p className="mt-2 text-slate-500">
              Choose a PDF file from your computer
            </p>

            {file && (
              <div className="mt-5 rounded-lg bg-white px-4 py-2 shadow text-sm font-medium">
                {file.name}
              </div>
            )}

            <input
              id="resume"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>

          <button
            disabled={!file || loading}
            onClick={handleUpload}
            className="mt-8 w-full rounded-xl bg-slate-900 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-12 text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
            <p className="mt-4 text-slate-600">
              Analyzing your resume...
            </p>
          </div>
        )}

        {/* Results Sections */}
        {results?.results && results.results.length > 0 && (
          <>
            {/* Domain Scores */}
            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-slate-900">
      Matched Domains
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Ranked by compatibility with the uploaded job description dataset.
    </p>
  </div>

  <div className="space-y-5">
    {results.results
      .sort((a, b) => b.domain_fit - a.domain_fit)
      .map((item) => (
        <div
          key={item.domain}
          className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {item.domain.replace("_", " ")}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Resume compatibility for this domain
              </p>
            </div>

            <div className="flex items-center gap-3">

              {bestMatch.domain === item.domain && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Best Match
                </span>
              )}

              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {item.domain_fit.toFixed(1)}% Domain Fit
              </span>

            </div>
          </div>

          <div className="mt-2 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Overall Score
              </p>

              <p className="mt-2 text-xl font-extrabold text-slate-900">
                {item.overall_score.toFixed(1)}
              </p>
            </div>

          </div>
        </div>
      ))}
  </div>
</div>

            {/* Integrated Suggestions Panel */}
            {suggestions.length > 0 && (
              <div className="mt-10 rounded-3xl bg-white border border-slate-200 shadow-xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Improvement Suggestions
                  </h2>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                  <ul className="margin-0 list-disc pl-5 text-slate-600 space-y-3 leading-relaxed">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="text-base">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <p className="mt-8 text-center text-sm text-slate-500">
  <strong>Note:</strong> These scores are generated by an experimental resume
  analysis system and may not be fully accurate. The feature is currently under
  testing and active development. Please use the results as guidance only.
  Thank you for your feedback and patience.
</p>
          </>
        )}
      </div>
    </div>
  );
}
