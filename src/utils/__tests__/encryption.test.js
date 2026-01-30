import { describe, it, expect, beforeEach } from "vitest";
import {
  savePassphrase,
  loadPassphrase,
  encryptMessage,
  decryptMessage,
} from "../encryption";

// Simple in-memory localStorage shim for JSDOM if needed
if (typeof window !== "undefined" && !window.localStorage) {
  const store = new Map();
  // @ts-ignore
  window.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

describe("encryption helpers", () => {
  const passphrase = "test-passphrase";

  beforeEach(() => {
    savePassphrase("");
  });

  it("persists and loads passphrase from localStorage", () => {
    savePassphrase(passphrase);
    expect(loadPassphrase()).toBe(passphrase);
  });

  it("encrypts and decrypts round-trip with same passphrase", () => {
    const plain = "Hello, encrypted world!";
    const cipher = encryptMessage(plain, passphrase);

    expect(cipher).not.toBe(plain);
    expect(cipher.startsWith("rc::aes256::")).toBe(true);

    const decrypted = decryptMessage(cipher, passphrase);
    expect(decrypted).toBe(plain);
  });

  it("returns original payload when decrypting with wrong passphrase", () => {
    const plain = "Hello, encrypted world!";
    const cipher = encryptMessage(plain, passphrase);
    const wrong = decryptMessage(cipher, "wrong-passphrase");

    // We don't throw – we just return the ciphertext when decryption fails
    expect(wrong).toBe(cipher);
  });

  it("passes through non-prefixed messages untouched", () => {
    const plain = "Just a normal message";
    expect(decryptMessage(plain, passphrase)).toBe(plain);
  });
});


