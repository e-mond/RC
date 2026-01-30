// src/utils/session.js
import { isMockMode } from "@/mocks/mockManager";

const KEY_MAP = {
  token: "token",
  refreshToken: "refreshToken",
  user: "user",
  role: "userRole",
};

const prefix = (key) => (isMockMode() ? `demo.${key}` : key);

const safeJSONParse = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const session = {
  getToken: () => localStorage.getItem(prefix(KEY_MAP.token)),
  setToken: (token) => {
    if (token) {
      localStorage.setItem(prefix(KEY_MAP.token), token);
    }
  },
  clearToken: () => localStorage.removeItem(prefix(KEY_MAP.token)),

  getRefreshToken: () => localStorage.getItem(prefix(KEY_MAP.refreshToken)),
  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(prefix(KEY_MAP.refreshToken), token);
    }
  },
  clearRefreshToken: () => localStorage.removeItem(prefix(KEY_MAP.refreshToken)),

  getUser: () => safeJSONParse(localStorage.getItem(prefix(KEY_MAP.user))),
  setUser: (user) => {
    if (user) {
      localStorage.setItem(prefix(KEY_MAP.user), JSON.stringify(user));
    }
  },
  clearUser: () => localStorage.removeItem(prefix(KEY_MAP.user)),

  getRole: () => localStorage.getItem(prefix(KEY_MAP.role)),
  setRole: (role) => {
    if (typeof role === "string" && role.length > 0) {
      localStorage.setItem(prefix(KEY_MAP.role), role);
    }
  },
  clearRole: () => localStorage.removeItem(prefix(KEY_MAP.role)),

  clearAll: () => {
    session.clearToken();
    session.clearRefreshToken();
    session.clearUser();
    session.clearRole();
  },
};

export default session;

