import apiClient from "./apiClient";

/**
 * Logs in a user with email and password.
 */
export const loginUser = async (credentials) => {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
  } catch (err) {
    console.error("Login API error:", err);
    throw err.response?.data || { message: "Login failed" };
  }
};

/**
 * Registers a new artisan account.
 * Accepts FormData (including file uploads like ID).
 */
export const signupArtisan = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/artisan/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (err) {
    console.error("Artisan signup API error:", err);
    throw err.response?.data || { message: "Signup failed" };
  }
};

/**
 * Fetches authenticated user's profile.
 */
export const getUserProfile = async () => {
  try {
    const { data } = await apiClient.get("/auth/profile");
    return data;
  } catch (err) {
    console.error("Profile fetch error:", err);
    throw err.response?.data || { message: "Unable to load profile" };
  }
};

/**
 * Initiates a password reset email.
 * @param {string} email - User email address
 */
export const forgotPassword = async (email) => {
  try {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  } catch (err) {
    console.error("Forgot password API error:", err);
    throw err.response?.data || { message: "Unable to send reset link" };
  }
};

/**
 * Resets password using token.
 * @param {string} token - Reset token from email link
 * @param {object} payload - { password, confirmPassword }
 */
export const resetPassword = async (token, payload) => {
  try {
    const { data } = await apiClient.post(`/auth/reset-password/${token}`, payload);
    return data;
  } catch (err) {
    console.error("Reset password API error:", err);
    throw err.response?.data || { message: "Password reset failed" };
  }
};
