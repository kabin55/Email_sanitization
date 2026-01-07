import { useState } from "react";
import { validateSingleEmail, validateBulkEmails, } from "../service/api";

/* -------------------- Reusable Components -------------------- */
function Badge({ status }) {
  const map = {
    valid: "bg-green-100 text-green-700",
    risk: "bg-amber-100 text-amber-700",
    invalid: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function ConfidenceCard({ level }) {
  const map = {
    High: "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200",
    Medium: "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200",
    Low: "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-200",
  };
  return (
    <div
      className={`border rounded-xl p-6 text-center shadow-md ${map[level]} transition transform hover:scale-105`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">Confidence Score</p>
      <p className="text-3xl font-bold mt-2">{level}</p>
    </div>
  );
}

function KPI({ label, value, color }) {
  const map = {
    green: "bg-gradient-to-br from-green-50 to-green-100 text-green-700",
    amber: "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700",
    red: "bg-gradient-to-br from-red-50 to-red-100 text-red-700",
  };
  return (
    <div
      className={`rounded-xl p-6 text-center shadow-md ${map[color] || "bg-slate-50"} transition transform hover:scale-105`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

/* -------------------- Main Dashboard -------------------- */
export default function EmailSanitizationDashboard() {
  const [activeTab, setActiveTab] = useState("single");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [file, setFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [step, setStep] = useState(1);

  /* -------------------- Actions -------------------- */
  const runSingleValidation = async () => {
    try {
      setLoading(true);
      setResult(null);
      const data = await validateSingleEmail(email);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setStep(1);
  };

  const runBulkValidation = async () => {
    try {
      if (!file) return;
      setBulkLoading(true);
      setStep(2);
      const results = await validateBulkEmails(file);
      setBulkResults(results);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setBulkLoading(false);
    }
  };
   
const downloadHighConfidenceEmails = () => {
  if (!bulkResults || bulkResults.length === 0) {
    alert("No bulk results available yet");
    return;
  }

  // Filter only High confidence emails
  const highEmails = bulkResults
    .filter((item) => item.confidence === "High")
    .map((item) => item.email);

  if (highEmails.length === 0) {
    alert("No high-confidence emails found");
    return;
  }

  // Create a text file and trigger download
  const blob = new Blob([highEmails.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "high_confidence_emails.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};



  const summary = {
    total: bulkResults.length,
    high: bulkResults.filter((r) => r.confidence === "High").length,
    medium: bulkResults.filter((r) => r.confidence === "Medium").length,
    low: bulkResults.filter((r) => r.confidence === "Low").length,
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-slate-800">Email Sanitization Engine</h1>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            Production
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md p-10 transition transform hover:scale-101">
          <h2 className="text-3xl font-bold text-slate-800">
            Enterprise Email Sanitization & Risk Scoring
          </h2>
          <p className="text-slate-500 mt-3 max-w-3xl">
            Multi-layered email validation using syntax, DNS, MX, and behavioral risk detection.
          </p>
          <div className="grid md:grid-cols-4 gap-6 mt-8 text-sm">
            {[
              "Syntax & DNS Validation",
              "Disposable & Role Detection",
              "Spam-Trap Risk Analysis",
              "Confidence-Based Scoring",
            ].map((f) => (
              <div key={f} className="p-4 bg-white rounded-xl shadow-sm border transition hover:shadow-md">
                ✔ {f}
              </div>
            ))}
          </div>
        </section>

        {/* Tabs Section */}
        <section className="bg-white rounded-xl shadow-md">
          {/* Tabs */}
          <div className="border-b flex">
            {["single", "bulk"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 ring-indigo-400 ${
                  activeTab === t
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "single" ? "Single Email Validation" : "Bulk Email Validation"}
              </button>
            ))}
          </div>

          {/* Single Email Validation */}
          {activeTab === "single" && (
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                disabled={!email || loading}
                onClick={runSingleValidation}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-md transition disabled:opacity-50"
              >
                {loading ? "Running Validation…" : "Run Validation"}
              </button>

              {result && (
                <div className="relative grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setResult(null)}
                    className="absolute -top-4 right-0 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear Results ✕
                  </button>

                  {[
                    ["Syntax Validation", result.syntax],
                    ["Domain & MX Records", result.domain],
                    ["Disposable Email", result.disposable],
                    ["Role-Based Address", result.role],
                    ["Catch-All Domain", result.catchall],
                    ["Spam-Trap Risk", result.spamtrap],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="border rounded-lg p-4 flex justify-between shadow-sm transition hover:shadow-md"
                    >
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-slate-500">Evaluated using layered detection logic</p>
                      </div>
                      <Badge status={value} />
                    </div>
                  ))}
                  <ConfidenceCard level={result.confidence} />
                </div>
              )}
            </div>
          )}

          {/* Bulk Email Validation */}
          {activeTab === "bulk" && (
            <div className="p-8 space-y-6">
              <div className="border-2 border-dashed rounded-xl p-10 text-center bg-slate-50">
                <input type="file" accept=".csv,.xls,.xlsx,.txt" onChange={handleBulkUpload} />
                {file && (
                  <p className="mt-3 text-sm text-slate-600">
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="flex gap-4 text-sm">
                {["Upload File", "Analyze Emails", "Review Results"].map((s, i) => (
                  <div
                    key={s}
                    className={`px-4 py-2 rounded-lg ${
                      step >= i + 1 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>

              <button
                disabled={!file || bulkLoading}
                onClick={runBulkValidation}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-md transition disabled:opacity-50"
              >
                {bulkLoading ? "Processing…" : "Start Analysis"}
              </button>

              {bulkResults.length > 0 && (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setBulkResults([])}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear Results ✕
                    </button>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <KPI label="Total" value={summary.total} />
                    <KPI label="High" value={summary.high} color="green" />
                    <KPI label="Medium" value={summary.medium} color="amber" />
                    <KPI label="Low" value={summary.low} color="red" />
                  </div>

                  <button
  onClick={() => downloadHighConfidenceEmails(bulkResults)}
  className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md"
>
  Download High-Confidence Emails
</button>


                  {/* Results Table */}
                  <div className="overflow-auto border rounded-xl max-h-[420px] shadow-md">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          {[
                            "Email",
                            "Syntax",
                            "Domain",
                            "Disposable",
                            "Role",
                            "Catch-All",
                            "Spam-Trap",
                            "Confidence",
                          ].map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResults.map((r, i) => (
                          <tr key={i} className="even:bg-slate-50 transition hover:bg-slate-100">
                            <td className="px-4 py-2">{r.email}</td>
                            <td className="px-4 py-2"><Badge status={r.syntax} /></td>
                            <td className="px-4 py-2"><Badge status={r.domain} /></td>
                            <td className="px-4 py-2"><Badge status={r.disposable} /></td>
                            <td className="px-4 py-2"><Badge status={r.role} /></td>
                            <td className="px-4 py-2"><Badge status={r.catchall} /></td>
                            <td className="px-4 py-2"><Badge status={r.spamtrap} /></td>
                            <td className="px-4 py-2 font-semibold">{r.confidence}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
