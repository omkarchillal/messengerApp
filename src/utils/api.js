// src/utils/api.js
// Helper to read and normalize the API base URL used by the frontend.
export function getApiBase() {
  const raw = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // If the value accidentally contains a port when using https (e.g. https://domain:5000),
  // remove the :5000 so the browser uses the standard TLS port.
  try {
    const url = new URL(raw);
    // If scheme is https and port is 5000, clear the port
    if (url.protocol === "https:" && (url.port === "5000" || url.port === "")) {
      // remove port when it's 5000
      if (url.port === "5000") url.port = "";
    }
    return url.toString().replace(/\/$/, ""); // strip trailing slash
  } catch (e) {
    // If raw isn't a full URL, return it as-is (fallback)
    return raw.replace(/\/$/, "");
  }
}
