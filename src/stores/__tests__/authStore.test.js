import { describe, expect, test, beforeEach, vi } from "vitest";
import { useAuthStore } from "../authStore";
import * as authService from "@/services/authService";
import { session } from "@/utils/session";

vi.mock("@/services/authService", () => ({
  loginUser: vi.fn(),
  getUserProfile: vi.fn(),
}));

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      loading: false,
      authLoading: false,
      error: null,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("normalizes role casing on login", async () => {
    authService.loginUser.mockResolvedValueOnce({
      token: "demo-token",
      user: { id: "1", role: "LandLord" },
    });

    const result = await useAuthStore.getState().login({ email: "landlord@demo.com", password: "test" });
    expect(result.success).toBe(true);
    expect(result.role).toBe("landlord");
    expect(useAuthStore.getState().user.role).toBe("landlord");
  });

  test("logout clears session state", () => {
    useAuthStore.setState({ user: { role: "tenant" }, token: "abc" });
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  test("loadSession hydrates user when token exists", async () => {
    session.setToken("persisted-token");
    authService.getUserProfile.mockResolvedValueOnce({ id: "2", role: "Tenant" });

    await useAuthStore.getState().loadSession();
    expect(authService.getUserProfile).toHaveBeenCalled();
    expect(useAuthStore.getState().user.role).toBe("tenant");
  });
});

