import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MessagesInbox from "../MessagesInbox";
import { useAuthStore } from "@/stores/authStore";
import * as featureAccess from "@/context/FeatureAccessContext";
import * as messagesService from "@/services/messagesService";
import * as encryption from "@/utils/encryption";

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/context/FeatureAccessContext", () => {
  return {
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
  const actual = await vi.importActual<typeof import("@/utils/encryption")>(
    "@/utils/encryption"
  );
  return {
    ...actual,
    encryptMessage: vi.fn(actual.encryptMessage),
    decryptMessage: vi.fn(actual.decryptMessage),
  };
});

describe("MessagesInbox encryption behaviour", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Auth: pretend we have a tenant user
    useAuthStore.mockReturnValue({
      user: { id: 1, full_name: "Test User", role: "tenant" },
    });

    // Feature access: premium tenant with direct messaging
    vi.spyOn(featureAccess, "useFeatureAccess").mockReturnValue({
      role: "tenant",
      plan: "premium",
      isPremium: true,
      can: () => true,
    });

    // Base mocks for service
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

  it("sends encrypted content when passphrase is set", async () => {
    const spyEncrypt = encryption.encryptMessage as unknown as vi.Mock;

    render(<MessagesInbox />);

    // Wait for conversations
    await screen.findByText("Landlord One");

    // Open conversation
    fireEvent.click(screen.getByRole("button", { name: /chat with landlord one/i }));

    // Toggle encryption and set a passphrase
    const encButton = await screen.findByRole("button", { name: /encryption: off/i });
    fireEvent.click(encButton);

    // jsdom prompt shim
    const promptSpy = vi.spyOn(window, "prompt").mockReturnValue("test-passphrase");
    // Click again to trigger prompt handler
    fireEvent.click(encButton);
    promptSpy.mockRestore();

    const input = await screen.findByRole("textbox", { name: /type message/i });
    fireEvent.change(input, { target: { value: "Hello landlord" } });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(messagesService.sendMessage).toHaveBeenCalled();
    });

    const [, payload] = messagesService.sendMessage.mock.calls[0];

    // The payload should not equal the plain text when encryption is enabled
    expect(payload).not.toBe("Hello landlord");
    expect(spyEncrypt).toHaveBeenCalled();
  });
});


