// api.js
export const validateSingleEmail = async (email) => {
  if (!email) throw new Error("Email is required");

  const response = await fetch("http://192.168.1.158:5000/api/email/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error("Single email validation failed");

  const data = await response.json();

  // Transform backend response to match frontend expected structure
  return {
    syntax: data.results.syntax ? "valid" : "invalid",
    domain: data.results.domain ? "valid" : "invalid",
    disposable: data.results.disposable ? "risk" : "valid",
    role: data.results.roleBased ? "risk" : "valid",
    catchall: data.results.catchAll ? "risk" : "valid",
    spamtrap: "valid", // if your backend doesn’t return spamtrap, default to valid
    confidence: data.confidence,
  };
};


// export const validateBulkEmails = async (file) => {
//   if (!file) throw new Error("File is required");

//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await fetch("http://192.168.1.158:5000/api/email/upload", {
//     method: "POST",
//     body: formData,
//   });

//   if (!response.ok) throw new Error("Bulk email validation failed");

//   const data = await response.json();

//   // Merge valid and invalid emails into a single array
//   const allEmails = [...(data.validEmails || []), ...(data.invalidEmails || [])];

//   // Transform each to match frontend expectations
//   return allEmails.map((item) => ({
//     email: item.email,
//     syntax: item.results.syntax ? "valid" : "invalid",
//     domain: item.results.domain ? "valid" : "invalid",
//     disposable: item.results.disposable ? "risk" : "valid",
//     role: item.results.roleBased ? "risk" : "valid",
//     catchall: item.results.catchAll ? "risk" : "valid",
//     spamtrap: "valid", // default if backend doesn't return
//     confidence: item.confidence,
//   }));
// };
export const validateBulkEmails = async (file, downloadHighConfidence = false) => {
  if (!file) throw new Error("File is required");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://192.168.1.158:5000/api/email/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Bulk email validation failed");

  const data = await response.json();

  // Merge valid and invalid emails into a single array
  const allEmails = [...(data.validEmails || []), ...(data.invalidEmails || [])];

  // Transform each to match frontend expectations
  const mappedResults = allEmails.map((item) => ({
    email: item.email,
    syntax: item.results.syntax ? "valid" : "invalid",
    domain: item.results.domain ? "valid" : "invalid",
    disposable: item.results.disposable ? "risk" : "valid",
    role: item.results.roleBased ? "risk" : "valid",
    catchall: item.results.catchAll ? "risk" : "valid",
    spamtrap: "valid", // default if backend doesn't return
    confidence: item.confidence,
  }));

  // If requested, download high-confidence emails
  if (downloadHighConfidence) {
    const highEmails = mappedResults
      .filter((item) => item.confidence === "High")
      .map((item) => item.email);

    if (highEmails.length > 0) {
      const blob = new Blob([highEmails.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "high_confidence_emails.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("No high-confidence emails found");
    }
  }

  return mappedResults;
};
