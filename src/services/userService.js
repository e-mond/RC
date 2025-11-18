import apiClient from "@/services/apiClient";

/**
 * Fetch all users
 * @returns {Promise<Array>} - List of all users
 */
export const getAllUsers = async () => {
  const { data } = await apiClient.get("/users");
  return data;
};

/**
 * Update a user's role
 * @param {string} id - User ID
 * @param {string} role - New role to assign
 * @returns {Promise<Object>} - Updated user data or status
 */
export const updateUserRole = async (id, role) => {
  const { data } = await apiClient.put(`/users/${id}/role`, { role });
  return data;
};

/**
 * Delete a user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} - Response from server
 */
export const deleteUser = async (id) => {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
};
