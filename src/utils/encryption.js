// src/utils/encryption.js
import CryptoJS from "crypto-js";

const PASSPHRASE_STORAGE_KEY = "chat_passphrase";

// ─── Passphrase Management ─────────────────────────────────────
export const savePassphrase = (passphrase) => {
  if (!passphrase) throw new Error("Passphrase cannot be empty");
  localStorage.setItem(PASSPHRASE_STORAGE_KEY, passphrase);
};

export const loadPassphrase = () => {
  return localStorage.getItem(PASSPHRASE_STORAGE_KEY);
};

export const clearPassphrase = () => {
  localStorage.removeItem(PASSPHRASE_STORAGE_KEY);
};

// ─── Core Encryption/Decryption ────────────────────────────────
export const encryptMessage = (message, passphrase) => {
  if (!passphrase) throw new Error("No passphrase available");
  try {
    return CryptoJS.AES.encrypt(message, passphrase).toString();
  } catch (err) {
    console.error("Encryption failed:", err);
    throw new Error("Encryption failed");
  }
};

export const decryptMessage = (ciphertext, passphrase) => {
  if (!passphrase) throw new Error("No passphrase available");
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) throw new Error("Decryption failed - wrong passphrase?");
    return plaintext;
  } catch (err) {
    console.error("Decryption failed:", err);
    throw new Error("Decryption failed - wrong passphrase or corrupted data");
  }
};

// ─── Optional: Still keep conversation-derived key as fallback ──
const generateConversationKey = (userId1, userId2) => {
  const sorted = [userId1, userId2].sort().join("-");
  return CryptoJS.SHA256(sorted).toString();
};

// Use this when you want deterministic key (less secure)
export const encryptWithConversationKey = (message, userId1, userId2) => {
  const key = generateConversationKey(userId1, userId2);
  return encryptMessage(message, key);
};

export const decryptWithConversationKey = (ciphertext, userId1, userId2) => {
  const key = generateConversationKey(userId1, userId2);
  return decryptMessage(ciphertext, key);
};

// ─── Clean exports ─────────────────────────────────────────────
export default {
  savePassphrase,
  loadPassphrase,
  clearPassphrase,
  encryptMessage,
  decryptMessage,
  encryptWithConversationKey,
  decryptWithConversationKey,
};