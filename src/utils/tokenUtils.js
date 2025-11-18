// src/utils/tokenUtils.js

/**
 * Safely decode a JWT without verifying signature
 * Used for expiration checks only
 */
export const decodeToken = (token) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    return JSON.parse(atob(payload));
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
};
