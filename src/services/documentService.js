import apiClient from "./apiClient";

/**
 * Document Service (Premium Feature)
 * Handles all document-related API calls
 */

/**
 * Get all documents for current user
 * @returns {Promise} List of documents
 */
export const getDocuments = async () => {
  try {
    const { data } = await apiClient.get("/auth/documents/");
    return data;
  } catch (err) {
    console.error("Get documents error:", err);
    throw err.response?.data || { message: "Failed to fetch documents" };
  }
};

/**
 * Get document by ID
 * @param {number} id - Document ID
 * @returns {Promise} Document details
 */
export const getDocument = async (id) => {
  try {
    const { data } = await apiClient.get(`/auth/documents/${id}/`);
    return data;
  } catch (err) {
    console.error("Get document error:", err);
    throw err.response?.data || { message: "Failed to fetch document" };
  }
};

/**
 * Upload a document
 * @param {FormData} formData - Document data (document_type, title, file)
 * @returns {Promise} Created document
 */
export const uploadDocument = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/documents/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    console.error("Upload document error:", err);
    throw err.response?.data || { message: "Failed to upload document" };
  }
};

/**
 * Delete a document
 * @param {number} id - Document ID
 * @returns {Promise}
 */
export const deleteDocument = async (id) => {
  try {
    await apiClient.delete(`/auth/documents/${id}/`);
    return { message: "Document deleted successfully" };
  } catch (err) {
    console.error("Delete document error:", err);
    throw err.response?.data || { message: "Failed to delete document" };
  }
};

