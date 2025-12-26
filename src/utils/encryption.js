// src/utils/encryption.js
// Lightweight CryptoJS helpers for chat/message payloads.
// This module is UI‑only: the backend should treat ciphertext as an opaque string.
//
// Strategy
// - We derive a 256‑bit AES key from a user‑provided passphrase using PBKDF2.
// - Ciphertext is encoded as: rc::aes256::<ivBase64>::<cipherBase64>
// - decryptMessage() is defensive: if the input is not in this format,
//   it simply returns the original string so legacy/plain messages still render.
//
// NOTE: Real multi‑device E2E requires key exchange; here we only hide message
// content from the transport/storage layer and document the expectations.

import CryptoJS from "crypto-js";

const STORAGE_KEY = "rc.chat.passphrase";
const PBKDF2_SALT = "rentalconnects.chat.v1";
const PBKDF2_ITERATIONS = 1000;

/**
 * Persist a passphrase in localStorage so the user doesn't have
 * to re‑enter it on every refresh. This is still client‑side only.
 */
export function savePassphrase(passphrase) {
  if (typeof window === "undefined") return;
  if (!passphrase) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, passphrase);
}

export function loadPassphrase() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

/**
 * Derive a CryptoJS key object from a passphrase using PBKDF2.
 */
export function deriveKey(passphrase) {
  if (!passphrase) return null;
  return CryptoJS.PBKDF2(passphrase, PBKDF2_SALT, {
    keySize: 256 / 32,
    iterations: PBKDF2_ITERATIONS,
  });
}

/**
 * Encrypt a message string. If no key can be derived, fall back
 * to returning the original plain text so the call site can decide
 * how to handle transport.
 */
export function encryptMessage(plainText, passphrase) {
  if (!plainText) return "";
  const key = deriveKey(passphrase);
  if (!key) return plainText;

  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv });

  const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
  const cipherBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

  return `rc::aes256::${ivBase64}::${cipherBase64}`;
}

/**
 * Decrypt a message string created by encryptMessage.
 * Non‑RentalConnects payloads are passed through untouched.
 */
export function decryptMessage(payload, passphrase) {
  if (!payload || typeof payload !== "string") return payload;

  // Only handle our own format
  if (!payload.startsWith("rc::aes256::")) {
    return payload;
  }

  const key = deriveKey(passphrase);
  if (!key) return payload;

  try {
    const [, , ivBase64, cipherBase64] = payload.split("::");
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherBase64),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv });
    const text = decrypted.toString(CryptoJS.enc.Utf8);
    return text || payload;
  } catch (err) {
    // On any failure, do NOT break the UI – just show raw payload
    console.warn("decryptMessage failed:", err);
    return payload;
  }
}

export default {
  savePassphrase,
  loadPassphrase,
  deriveKey,
  encryptMessage,
  decryptMessage,
};
