import apiClient from "./apiClient";

/**
 * Registers a new tenant account
 * @param {FormData} formData - contains signup fields
 */
export const registerTenant = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/tenant/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Tenant signup failed. Please try again.";
    throw new Error(message);
  }
};
