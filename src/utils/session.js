// src/utils/session.js
import { isMockMode } from "@/mocks/mockManager";

const KEY_MAP = {
  token: "token",
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
  setToken: (token) => localStorage.setItem(prefix(KEY_MAP.token), token),
  clearToken: () => localStorage.removeItem(prefix(KEY_MAP.token)),

  getUser: () => safeJSONParse(localStorage.getItem(prefix(KEY_MAP.user))),
  setUser: (user) => localStorage.setItem(prefix(KEY_MAP.user), JSON.stringify(user)),
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
    session.clearUser();
    session.clearRole();
  },
};

export default session;

