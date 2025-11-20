/**
 * Normalize Axios / fetch errors into { message, code, details }
 * - Ensures every service throws a standard Error with .message
 */
export default function normalizeApiError(err) {
  // Axios error shape
  if (err?.response) {
    const { status, data } = err.response;
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : "Server responded with an error");
    return { message, code: status, details: data };
  }

  // Fetch / network error or thrown Error
  if (err?.message) {
    return { message: err.message, code: null, details: err };
  }

  return { message: "Unknown error", code: null, details: err };
}
