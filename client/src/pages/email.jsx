import { useState } from "react";
import { validateSingleEmail, validateBulkEmails } from "../service/api";

/* -------------------- Helpers -------------------- */

const mapResults = (results) => ({
  syntax: results.syntax ? "valid" : "invalid",
  domain: results.domain ? "valid" : "invalid",
  mx: results.mx ? "valid" : "invalid",
  disposable: results.disposable ? "invalid" : "valid",
  roleBased: results.roleBased ? "invalid" : "valid",
});

/* -------------------- UI Components -------------------- */

function Badge({ status }) {
  const map = {
    valid: "bg-green-100 text-green-700",
    invalid: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function KPI({ label, value }) {
  return (
    <div className="rounded-xl p-6 text-center shadow-md bg-slate-100">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ResultsTable({ data }) {
  if (!data || !data.length) return null;

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  const Tag = ({ label, ok }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
        ${ok ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
    >
      ✓ {label}
    </span>
  );

  return (
    <div className="overflow-x-auto border rounded-xl mt-6">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr className="border-b">
            <th className="px-4 py-3">
              <input type="checkbox" />
            </th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Reason</th>
            <th className="px-4 py-3 text-right">Confidence</th>
            <th className="px-4 py-3 text-right">Date</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, i) => (
            <tr
              key={i}
              className="border-b hover:bg-slate-50 transition"
            >
              {/* Checkbox */}
              <td className="px-4 py-3">
                <input type="checkbox" />
               {/* function to download selected emails */  }       



              </td>

              {/* Email */}

              <td className="px-4 py-3 font-bold text-slate-800">
                {r.email}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  valid
                </span>
              </td>

              {/* Reason tags */}
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Tag label="FORMAT" ok={r.syntax === "valid"} />
                  <Tag label="DNS" ok={r.domain === "valid"} />
                  <Tag label="MX" ok={r.mx === "valid"} />
                  <Tag label="SMTP" ok={r.smtp === "valid"} />
                  <Tag label="ROLE-BASED" ok={r.roleBased === "valid"} />
                  
                  <Tag
                    label="DISPOSABLE CHECK"
                    ok={r.disposable === "valid"}
                  />
                  
                </div>
              </td>
              <td className="px-4 py-3 text-right text-slate-500">
<confidence className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                    ★ {r.confidence.toUpperCase()}
                  </confidence>
                  </td>

              {/* Date */}
              <td className="px-4 py-3 text-right text-slate-500">
                {today}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- Main Dashboard -------------------- */

export default function EmailSanitizationDashboard() {
  const [activeTab, setActiveTab] = useState("single");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [bulkData, setBulkData] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------------------- Single Validation -------------------- */

  const runSingleValidation = async () => {
    if (!email) return alert("Please enter an email");

    setLoading(true);
    setResult(null);

    try {
      const data = await validateSingleEmail(email);

      setResult([
        {
          email: data.email,
          ...mapResults(data.results),
          confidence: data.confidence,
        },
      ]);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Bulk Validation -------------------- */

  const runBulkValidation = async () => {
    if (!bulkFile) return alert("Please upload a file");

    setLoading(true);
    setBulkData(null);

    try {
      const data = await validateBulkEmails(bulkFile);

      const merged = [
        ...(data.validEmails || []),
        ...(data.invalidEmails || []),
      ].map((item) => ({
        email: item.email,
        ...mapResults(item.results),
        confidence: item.confidence,
      }));

      setBulkData({
        summary: {
          total: data.total,
          valid: data.validCount,
          invalid: data.invalidCount,
        },
        results: merged,
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Download High Confidence -------------------- */

  const downloadHighConfidence = () => {
    if (!bulkData) return;

    const highEmails = bulkData.results
      .filter((r) => r.confidence === "High")
      .map((r) => r.email)
      .join("\n");

    const blob = new Blob([highEmails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "high_confidence_emails.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* -------------------- UI -------------------- */

  // return (
  //   <div className="min-h-screen bg-slate-100">
  //     <header className="bg-white border-b shadow-sm">
  //       <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
  //         <h1 className="text-lg font-semibold">Email Sanitization Engine</h1>
  //         <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
  //           Production
  //         </span>
  //       </div>
  //     </header>

  //     <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
  //       <div className="bg-white rounded-xl shadow-md">
  //         <div className="border-b flex">
  //           {["single", "bulk"].map((t) => (
  //             <button
  //               key={t}
  //               onClick={() => setActiveTab(t)}
  //               className={`px-6 py-4 font-semibold ${
  //                 activeTab === t
  //                   ? "border-b-2 border-indigo-600 text-indigo-600"
  //                   : "text-slate-500"
  //               }`}
  //             >
  //               {t === "single" ? "Single Validation" : "Bulk Validation"}
  //             </button>
  //           ))}
  //         </div>

  //         {activeTab === "single" && (
  //           <div className="p-6 space-y-6">
  //             <input
  //               value={email}
  //               onChange={(e) => setEmail(e.target.value)}
  //               placeholder="user@example.com"
  //               className="w-full border rounded-lg px-4 py-3"
  //             />

  //             <button
  //               onClick={runSingleValidation}
  //               disabled={loading}
  //               className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
  //             >
  //               {loading ? "Validating..." : "Run Validation"}
  //             </button>

  //             {result && <ResultsTable data={result} />}
  //           </div>
  //         )}

  //         {activeTab === "bulk" && (
  //           <div className="p-6 space-y-6">
  //             <input
  //               type="file"
  //               accept=".txt,.csv"
  //               onChange={(e) => setBulkFile(e.target.files[0])}
  //             />

  //             <button
  //               onClick={runBulkValidation}
  //               disabled={loading}
  //               className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
  //             >
  //               {loading ? "Analyzing..." : "Start Analysis"}
  //             </button>

  //             {bulkData && (
  //               <button
  //                 onClick={downloadHighConfidence}
  //                 className="bg-green-600 text-white px-6 py-3 rounded-lg"
  //               >
  //                 Download High Confidence Emails
  //               </button>
  //             )}

  //             {bulkData && (
  //               <>
  //                 <div className="grid md:grid-cols-3 gap-4">
  //                   <KPI label="Total" value={bulkData.summary.total} />
  //                   <KPI label="Valid" value={bulkData.summary.valid} />
  //                   <KPI label="Invalid" value={bulkData.summary.invalid} />
  //                 </div>

  //                 <ResultsTable data={bulkData.results} />
  //               </>
  //             )}
  //           </div>
  //         )}
  //       </div>
  //     </main>
  //   </div>
  // );

return (
<div className="min-h-screen bg-slate-100 flex flex-col">
  {/* Header */}
  <header className="bg-white/80 backdrop-blur border-b shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
          ✉️
        </div>
        <h1 className="text-lg font-semibold text-slate-800">
          Email Sanitization Engine
        </h1>
      </div>

      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Production
      </span>
    </div>
  </header>

  {/* Main Content */}
  <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-10">
    {/* Hero Section */}
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 text-white shadow-xl p-10">
      
      {/* Decorative Blur */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-40 bg-black/10 blur-2xl"></div>

      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
          Enterprise Email Sanitization <br />
          <span className="text-indigo-200">& Risk Intelligence Platform</span>
        </h2>

        <p className="mt-4 max-w-3xl text-indigo-100 text-base">
          Advanced multi-layered email validation combining syntax analysis,
          DNS & MX verification, disposable detection, and confidence-based
          risk scoring — built for scale and accuracy.
        </p>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10 text-sm">
          {[
            { label: "Syntax Analysis", icon: "🧩" },
            { label: "DNS Validation", icon: "🌐" },
            { label: "MX Record Check", icon: "📮" },
            { label: "Disposable & Role Detection", icon: "🛡️" },
            { label: "Confidence-Based Scoring", icon: "📊" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white/90 text-slate-800 rounded-xl p-5 shadow-md backdrop-blur
                         hover:scale-[1.03] hover:shadow-xl transition-all duration-300
                         flex items-center gap-3"
            >
              <span className="text-xl">{f.icon}</span>
              <span className="font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Main Card */}
      <section className="bg-white rounded-2xl shadow-md overflow-hidden">

        {/* Tabs */}
        <div className="border-b flex">
          {["single", "bulk"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === t
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "single" ? "Single Validation" : "Bulk Validation"}
            </button>
          ))}
        </div>

        {/* Single Validation */}
        {activeTab === "single" && (
          <div className="p-8 space-y-6">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <button
              onClick={runSingleValidation}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "Validating..." : "Run Validation"}
            </button>

            {result && <ResultsTable data={result} />}
          </div>
        )}

        {/* Bulk Validation */}
        {activeTab === "bulk" && (
          <div className="p-8 space-y-6">
            <input
              type="file"
              accept=".txt,.csv"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="block"
            />

            <button
              onClick={runBulkValidation}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Start Analysis"}
            </button>

            {bulkData && (
              <button
                onClick={downloadHighConfidence}
                className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded-lg"
              >
                Download High Confidence Emails
              </button>
            )}

            {bulkData && (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <KPI label="Total" value={bulkData.summary.total} />
                  <KPI label="Valid" value={bulkData.summary.valid} />
                  <KPI label="Invalid" value={bulkData.summary.invalid} />
                </div>

                <ResultsTable data={bulkData.results} />
              </>
            )}
          </div>
        )}
      </section>
    </main>
  </div>
);
}