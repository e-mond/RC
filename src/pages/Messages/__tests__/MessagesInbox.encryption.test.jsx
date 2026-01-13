// src/pages/Messages/__tests__/MessagesInbox.encryption.test.jsx

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import MessagesInbox from "../MessagesInbox";
import { useAuthStore } from "@/stores/authStore";
import * as featureAccess from "@/context/FeatureAccessContext";
import * as messagesService from "@/services/messagesService";
import * as encryption from "@/utils/encryption";
import { renderWithProviders } from "@/testing/renderWithProviders";

// ────────────────────────────────────────────────
// Mocks
// ────────────────────────────────────────────────
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/context/FeatureAccessContext", async () => {
  const actual = await vi.importActual("@/context/FeatureAccessContext");
  return {
    ...actual,
    useFeatureAccess: vi.fn(),
  };
});

vi.mock("@/services/messagesService", () => ({
  getConversations: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  markConversationAsRead: vi.fn(),
}));

vi.mock("@/utils/encryption", async () => {
  const actual = await vi.importActual("@/utils/encryption");
  return {
    ...actual,
    encryptMessage: vi.fn(actual.encryptMessage),
    decryptMessage: vi.fn(actual.decryptMessage),
  };
});

describe("MessagesInbox encryption behavior", () => {
  let promptSpy;
  let confirmSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.prompt and window.confirm
    promptSpy = vi.spyOn(window, "prompt").mockReturnValue("test-passphrase");
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Mock authenticated tenant user
    useAuthStore.mockReturnValue({
      user: { id: 1, full_name: "Test User", role: "tenant" },
    });

    // Premium tenant with messaging access
    vi.spyOn(featureAccess, "useFeatureAccess").mockReturnValue({
      role: "tenant",
      plan: "premium",
      isPremium: true,
      can: () => true,
    });

    // Default successful mocks
    messagesService.getConversations.mockResolvedValue([
      {
        id: 123,
        participantName: "Landlord One",
        lastMessage: "Hi",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      },
    ]);

    messagesService.getMessages.mockResolvedValue({
      messages: [],
    });

    messagesService.sendMessage.mockResolvedValue({
      id: 999,
      message: "Encrypted payload",
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "delivered",
    });
  });

  afterEach(() => {
    promptSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("sends encrypted content when passphrase is set", async () => {
    const spyEncrypt = encryption.encryptMessage;

    renderWithProviders(<MessagesInbox />);

    // Wait until conversation list appears
    await screen.findByText("Landlord One");

    // Open the conversation (button has aria-label "Chat with Landlord One")
    const conversationButton = screen.getByRole("button", { name: /chat with landlord one/i });
    fireEvent.click(conversationButton);

    // Wait for conversation header to appear (indicates conversation is selected)
    await waitFor(() => {
      const header = screen.getByRole("heading", { name: "Landlord One" });
      expect(header).toBeInTheDocument();
    }, { timeout: 3000 });

    // Enable encryption (click the encryption toggle button)
    const encButton = await screen.findByRole("button", { name: /encryption: off/i });
    
    fireEvent.click(encButton);

    // Wait for encryption to be enabled (button text changes)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /encryption: on/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find the message input by placeholder or aria-label
    const input = await screen.findByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "Hello landlord" } });

    // Find and click send button
    const sendButton = await screen.findByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(messagesService.sendMessage).toHaveBeenCalled();
    }, { timeout: 3000 });

    const [, payload] = messagesService.sendMessage.mock.calls[0];

    // Verify the sent payload is NOT plain text
    expect(payload).not.toBe("Hello landlord");

    // Most important: encryption was actually called
    expect(spyEncrypt).toHaveBeenCalledTimes(1);
    expect(spyEncrypt).toHaveBeenCalledWith("Hello landlord", "test-passphrase");
  });
});
