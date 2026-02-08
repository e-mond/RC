/**
 * Lease Service
 * 
 * Handles lease agreement management:
 * - Upload/download custom leases (landlords)
 * - Download system leases (all users)
 * - Sign leases (tenants)
 * - Edit system leases (admin/super admin)
 */

import apiClient from "./apiClient";
import { isMockMode } from "@/mocks/mockManager";

const USE_MOCK = isMockMode();

// Mock delay helper
const withDelay = (data, delay = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

/**
 * Get all system lease templates
 * @returns {Promise<Array>} List of system lease templates
 */
export const getSystemLeases = async () => {
  if (USE_MOCK) {
    return withDelay({
      leases: [
        {
          id: "standard-residential",
          title: "Standard Residential Lease",
          description: "Standard lease agreement for residential properties in Ghana",
          file_url: "/api/leases/system/standard-residential.pdf",
          file_type: "pdf",
          version: "1.0",
          updated_at: "2024-01-15T00:00:00Z",
        },
        {
          id: "short-term",
          title: "Short-Term Rental Agreement",
          description: "For rentals less than 12 months",
          file_url: "/api/leases/system/short-term.pdf",
          file_type: "pdf",
          version: "1.0",
          updated_at: "2024-01-15T00:00:00Z",
        },
        {
          id: "commercial",
          title: "Commercial Lease Agreement",
          description: "For commercial and business properties",
          file_url: "/api/leases/system/commercial.pdf",
          file_type: "pdf",
          version: "1.0",
          updated_at: "2024-01-15T00:00:00Z",
        },
      ],
    });
  }

  try {
    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.LEASES.SYSTEM_LEASES);
    return data;
  } catch (err) {
    console.error("Get system leases error:", err);
    throw err.response?.data || { message: "Failed to fetch system leases" };
  }
};

/**
 * Download system lease template
 * 
 * Endpoint: GET /api/leases/system/{lease_id}/download/?format={format}
 * - Base URL: Configured in apiClient.js (VITE_API_BASE_URL or https://rc-backend-658461237694.europe-west1.run.app/api)
 * - Full URL: {baseURL}/leases/system/{lease_id}/download/?format={format}
 * - No /api duplication: apiClient baseURL already includes /api
 * 
 * @param {string} leaseId - Lease template ID (passed as-is, no transformation)
 * @param {string} format - Format: "pdf", "docx", or "doc"
 * @param {Object} leaseData - Optional lease data object with file_url for fallback
 * @returns {Promise<Blob>} File blob
 */
export const downloadSystemLease = async (leaseId, format = "pdf", leaseData = null) => {
  // Validate leaseId - ensure it's a string and not transformed
  if (!leaseId || typeof leaseId !== "string") {
    throw new Error("Invalid lease ID: must be a non-empty string");
  }

  // Validate format
  const validFormats = ["pdf", "docx", "doc"];
  if (!validFormats.includes(format.toLowerCase())) {
    throw new Error(`Invalid format: must be one of ${validFormats.join(", ")}`);
  }

  const normalizedFormat = format.toLowerCase();
  if (USE_MOCK) {
    // In mock mode, create a proper file blob with correct MIME type
    // For PDF, we'll create a simple text-based content that can be opened
    // For DOCX, we'll create a minimal valid structure

    let mockContent;
    let mimeType;

    if (normalizedFormat === "docx") {
      // Create a minimal DOCX structure (ZIP-based format)
      // For mock, we'll create a simple text file that can be opened
      mockContent = `Lease Agreement: ${leaseId}\n\nThis is a mock lease agreement file.\n\nIn production, this would be a real DOCX file.\n\nGenerated: ${new Date().toISOString()}`;
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (normalizedFormat === "doc") {
      mockContent = `Lease Agreement: ${leaseId}\n\nThis is a mock lease agreement file.\n\nIn production, this would be a real DOC file.\n\nGenerated: ${new Date().toISOString()}`;
      mimeType = "application/msword";
    } else {
      // PDF format - create a simple text representation
      // Note: Real PDFs are binary, but for mock we'll use text
      mockContent = `Lease Agreement: ${leaseId}\n\nThis is a mock lease agreement file.\n\nIn production, this would be a real PDF file.\n\nGenerated: ${new Date().toISOString()}`;
      mimeType = "application/pdf";
    }

    // Create blob with proper MIME type
    const blob = new Blob([mockContent], { type: mimeType });

    // Verify blob is not empty
    if (blob.size === 0) {
      throw new Error("Failed to create lease file - blob is empty");
    }

    return blob;
  }

  // Use unified API endpoint configuration - import before try block so it's available in catch block
  const { API_ENDPOINTS } = await import("@/config/apiEndpoints");

  try {
    // Endpoint: /leases/system/{leaseId}/download/
    // Full URL: {baseURL}/leases/system/{leaseId}/download/?format={format}
    // Note: leaseId is used as-is without any transformation (no numeric casting, no encoding)
    const endpoint = API_ENDPOINTS.LEASES.DOWNLOAD_SYSTEM_LEASE(leaseId);

    const response = await apiClient.get(endpoint, {
      params: { format: normalizedFormat },
      responseType: "blob",
      // Ensure proper headers for file download
      headers: {
        Accept: normalizedFormat === "pdf"
          ? "application/pdf"
          : normalizedFormat === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/msword",
      },
    });

    // Verify response is a valid blob
    if (!response.data || response.data.size === 0) {
      throw new Error("Downloaded file is empty or corrupted");
    }

    // Verify blob type matches expected format
    const blobType = response.data.type || "";
    const expectedTypes = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
    };

    if (expectedTypes[normalizedFormat] && !blobType.includes(normalizedFormat === "pdf" ? "pdf" : normalizedFormat === "docx" ? "wordprocessingml" : "msword")) {
      console.warn(`Blob type mismatch: expected ${expectedTypes[normalizedFormat]}, got ${blobType}`);
    }

    return response.data;
  } catch (err) {
    // If 404, try fallback to file_url if available (only for relative URLs)
    if (err.response?.status === 404 && leaseData?.file_url && !leaseData.file_url.startsWith('http')) {
      console.warn("[downloadSystemLease] Download endpoint not found, trying file_url fallback:", {
        endpoint: API_ENDPOINTS.LEASES.DOWNLOAD_SYSTEM_LEASE(leaseId),
        file_url: leaseData.file_url,
      });

      try {
        // Try to fetch from file_url (relative URL)
        const response = await apiClient.get(leaseData.file_url, {
          responseType: "blob",
        });

        if (response.data && response.data.size > 0) {
          return response.data;
        }
      } catch (fallbackErr) {
        console.error("[downloadSystemLease] Fallback to file_url also failed:", fallbackErr);
      }
    }

    console.error("Download system lease error:", {
      leaseId,
      format: normalizedFormat,
      status: err.response?.status,
      endpoint: API_ENDPOINTS.LEASES.DOWNLOAD_SYSTEM_LEASE(leaseId),
    });

    // Provide a more helpful error message
    let errorMessage = "Failed to download lease";
    if (err.response?.status === 404) {
      errorMessage = "The lease download endpoint is not available. Please ensure the backend endpoint GET /api/leases/system/{lease_id}/download/ is implemented.";
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get landlord's custom leases
 * @param {string} landlordId - Landlord ID (optional, uses current user if not provided)
 * @returns {Promise<Array>} List of custom leases
 */
export const getLandlordLeases = async (landlordId = null) => {
  if (USE_MOCK) {
    return withDelay({
      leases: [
        {
          id: "custom-1",
          title: "Custom Lease Agreement",
          description: "Landlord's custom lease terms",
          file_url: "/api/leases/custom/custom-1.pdf",
          file_type: "pdf",
          property_id: "prop-1",
          property_title: "Luxury Apartment",
          created_at: "2024-01-20T00:00:00Z",
          updated_at: "2024-01-20T00:00:00Z",
        },
      ],
    });
  }

  try {
    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const endpoint = landlordId
      ? `/leases/custom/?landlord_id=${encodeURIComponent(landlordId)}`
      : API_ENDPOINTS.LEASES.CUSTOM_LEASES;

    const { data } = await apiClient.get(endpoint);
    return data;
  } catch (err) {
    console.error("Get landlord leases error:", err);
    throw err.response?.data || { message: "Failed to fetch landlord leases" };
  }
};

/**
 * Upload custom lease (landlord only)
 * @param {File} file - Lease file (PDF, DOCX, or DOC)
 * @param {string} propertyId - Property ID (optional)
 * @param {string} title - Lease title
 * @param {string} description - Lease description
 * @returns {Promise<Object>} Uploaded lease data
 */
export const uploadCustomLease = async (file, propertyId = null, title = "", description = "") => {
  if (USE_MOCK) {
    return withDelay({
      id: `custom-${Date.now()}`,
      title: title || file.name,
      description,
      file_url: URL.createObjectURL(file),
      file_type: file.type,
      property_id: propertyId,
      created_at: new Date().toISOString(),
    });
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    if (propertyId) formData.append("property_id", propertyId);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);

    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.post(API_ENDPOINTS.LEASES.UPLOAD_CUSTOM_LEASE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (err) {
    console.error("Upload custom lease error:", err);
    throw err.response?.data || { message: "Failed to upload lease" };
  }
};

/**
 * Download custom lease
 * @param {string} leaseId - Lease ID
 * @returns {Promise<Blob>} File blob
 */
export const downloadCustomLease = async (leaseId) => {
  if (USE_MOCK) {
    const mockContent = `Custom Lease Agreement: ${leaseId}\n\nThis is a mock custom lease file.`;
    return new Blob([mockContent], { type: "application/pdf" });
  }

  try {
    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const response = await apiClient.get(API_ENDPOINTS.LEASES.DOWNLOAD_CUSTOM_LEASE(leaseId), {
      responseType: "blob",
    });
    return response.data;
  } catch (err) {
    console.error("Download custom lease error:", err);
    throw err.response?.data || { message: "Failed to download lease" };
  }
};

/**
 * Sign lease (tenant)
 * @param {string} leaseId - Lease ID
 * @param {File} signedFile - Signed lease file
 * @param {string} propertyId - Property ID
 * @param {string} landlordId - Landlord ID
 * @returns {Promise<Object>} Signed lease data
 */
export const signLease = async (leaseId, signedFile, propertyId, landlordId) => {
  if (USE_MOCK) {
    return withDelay({
      id: `signed-${Date.now()}`,
      lease_id: leaseId,
      property_id: propertyId,
      landlord_id: landlordId,
      tenant_id: "current-user",
      signed_file_url: URL.createObjectURL(signedFile),
      signed_at: new Date().toISOString(),
      status: "pending_landlord_approval",
    });
  }

  try {
    const formData = new FormData();
    formData.append("signed_file", signedFile);
    formData.append("property_id", propertyId);
    formData.append("landlord_id", landlordId);

    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.post(API_ENDPOINTS.LEASES.SIGN_LEASE(leaseId), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (err) {
    console.error("Sign lease error:", err);
    throw err.response?.data || { message: "Failed to sign lease" };
  }
};

/**
 * Update system lease (admin/super admin only)
 * @param {string} leaseId - Lease template ID
 * @param {File} file - Updated lease file
 * @param {string} title - Updated title
 * @param {string} description - Updated description
 * @returns {Promise<Object>} Updated lease data
 */
export const updateSystemLease = async (leaseId, file, title = null, description = null) => {
  if (USE_MOCK) {
    return withDelay({
      id: leaseId,
      title: title || "Updated Lease",
      description: description || "Updated description",
      file_url: file ? URL.createObjectURL(file) : "/api/leases/system/" + leaseId + ".pdf",
      updated_at: new Date().toISOString(),
      version: "1.1",
    });
  }

  try {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);

    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.LEASES.SYSTEM_LEASE_BY_ID(leaseId), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (err) {
    console.error("Update system lease error:", err);
    throw err.response?.data || { message: "Failed to update system lease" };
  }
};

/**
 * Get signed leases for a property or tenant
 * @param {string|null} propertyId - Property ID (null to get all tenant's signed leases)
 * @returns {Promise<Array>} List of signed leases
 */
export const getSignedLeases = async (propertyId = null) => {
  if (USE_MOCK) {
    return withDelay({
      leases: [],
    });
  }

  try {
    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");

    // If propertyId is null, get all signed leases for current tenant
    if (propertyId === null) {
      const { data } = await apiClient.get(API_ENDPOINTS.LEASES.SIGNED_LEASES_TENANT);
      return data;
    }

    // Otherwise, get signed leases for specific property
    const { data } = await apiClient.get(API_ENDPOINTS.LEASES.SIGNED_LEASES_BY_PROPERTY(propertyId));
    return data;
  } catch (err) {
    console.error("Get signed leases error:", err);
    // Don't throw error if it's a 404 for null property - just return empty array
    if (err.response?.status === 404 && propertyId === null) {
      return { leases: [] };
    }
    throw err.response?.data || { message: "Failed to fetch signed leases" };
  }
};

/**
 * Delete system lease template (Super Admin only)
 * @param {string} leaseId - Lease template ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSystemLease = async (leaseId) => {
  if (USE_MOCK) {
    return withDelay({
      success: true,
      message: "Lease deleted successfully (mock mode)",
    });
  }

  try {
    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.delete(API_ENDPOINTS.LEASES.DELETE_SYSTEM_LEASE(leaseId));
    return data;
  } catch (err) {
    console.error("Delete system lease error:", err);
    throw err.response?.data || { message: "Failed to delete system lease" };
  }
};

export default {
  getSystemLeases,
  downloadSystemLease,
  getLandlordLeases,
  uploadCustomLease,
  downloadCustomLease,
  signLease,
  updateSystemLease,
  getSignedLeases,
  deleteSystemLease,
};
