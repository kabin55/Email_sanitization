
// api.js
export const validateSingleEmail = async (email) => {
  if (!email) throw new Error("Email is required");

  const response = await fetch("http://localhost:3000/api/email/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error("Single email validation failed");

  return response.json();
};


export const validateBulkEmails = async (file, downloadHighConfidence = false) => {
  if (!file) throw new Error("File is required");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:3000/api/email/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Bulk email validation failed");

   return response.json();

};