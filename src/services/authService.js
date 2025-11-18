// import apiClient from "./apiClient";

// /** LOGIN */
// export const loginUser = async (credentials) => {
//   try {
//     const { data } = await apiClient.post("/auth/login", credentials);
//     return data;
//   } catch (err) {
//     console.error("Login API error:", err);
//     throw new Error(err.response?.data?.message || "Login failed");
//   }
// };

// /** SIGNUP */
// export const signupTenant = async (formData) => {
//   try {
//     const { data } = await apiClient.post("/auth/signup/tenant", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   } catch (err) {
//     console.error("Tenant signup error:", err);
//     throw new Error(err.response?.data?.message || "Signup failed");
//   }
// };

// export const signupLandlord = async (formData) => {
//   try {
//     const { data } = await apiClient.post("/auth/signup/landlord", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   } catch (err) {
//     console.error("Landlord signup error:", err);
//     throw new Error(err.response?.data?.message || "Signup failed");
//   }
// };

// export const signupArtisan = async (formData) => {
//   try {
//     const { data } = await apiClient.post("/auth/signup/artisan", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data;
//   } catch (err) {
//     console.error("Artisan signup error:", err);
//     throw new Error(err.response?.data?.message || "Signup failed");
//   }
// };

// /** PROFILE */
// export const getUserProfile = async () => {
//   try {
//     const { data } = await apiClient.get("/auth/profile");
//     return data.user;
//   } catch (err) {
//     console.error("Profile fetch error:", err);
//     throw new Error(err.response?.data?.message || "Unable to load profile");
//   }
// };

// /** PASSWORD RESET */
// export const forgotPassword = async (email) => {
//   try {
//     const { data } = await apiClient.post("/auth/forgot-password", { email });
//     return data;
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     throw new Error(err.response?.data?.message || "Error sending reset link");
//   }
// };

// export const resetPassword = async (token, payload) => {
//   try {
//     const { data } = await apiClient.post(`/auth/reset-password/${token}`, payload);
//     return data;
//   } catch (err) {
//     console.error("Reset password error:", err);
//     throw new Error(err.response?.data?.message || "Password reset failed");
//   }
// };



// src/services/authService.js
import apiClient from "./apiClient.js";

/** LOGIN */
export const loginUser = async (credentials) => {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data; // contains { token, user }
  } catch (err) {
    console.error("Login API error:", err);
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

/** SIGNUP */
export const signupTenant = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/tenant", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Signup failed");
  }
};

export const signupLandlord = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/landlord", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Signup failed");
  }
};

export const signupArtisan = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/artisan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Signup failed");
  }
};

/** PROFILE */
export const getUserProfile = async () => {
  try {
    const { data } = await apiClient.get("/auth/profile");
    return data.user; // consistent: always return user only
  } catch (err) {
    throw new Error(err.response?.data?.message || "Unable to load profile");
  }
};

/** PASSWORD RESET */
export const forgotPassword = async (email) => {
  try {
    const { data } = await apiClient.post("/auth/forgot-password/", { email });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Error sending reset link");
  }
};

export const resetPassword = async (token, payload) => {
  try {
    const { data } = await apiClient.post(`/auth/reset-password/${token}/`, payload);
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Password reset failed");
  }
};
