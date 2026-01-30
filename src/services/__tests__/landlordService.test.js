// src/services/__tests__/landlordService.test.js
import { expect, describe, test, beforeEach, vi, beforeAll } from "vitest";
import {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../landlordService";
import apiClient from "../apiClient";

// Mock apiClient for all tests
vi.mock("../apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Force mock mode OFF for these tests (we're mocking apiClient directly)
beforeAll(() => {
  import.meta.env.VITE_USE_MOCK = "false";
});

describe("landlordService", () => {
  let createdId = "test_property_123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("fetchProperties returns an array", async () => {
    // fetchProperties uses mock mode, so we need to disable it and use apiClient mock
    apiClient.get.mockResolvedValueOnce({
      data: [
        { id: "1", title: "Property 1", address: "Address 1" },
        { id: "2", title: "Property 2", address: "Address 2" },
      ],
    });

    // Temporarily disable mock mode for this test
    const originalEnv = import.meta.env.VITE_USE_MOCK;
    import.meta.env.VITE_USE_MOCK = "false";

    const res = await fetchProperties("owner_demo");
    const data = res.data ?? res;
    expect(Array.isArray(data)).toBe(true);
    expect(apiClient.get).toHaveBeenCalledWith("/properties/landlord/owner_demo/");

    import.meta.env.VITE_USE_MOCK = originalEnv;
  });

  test("createProperty creates and returns a property", async () => {
    const payload = {
      title: "Test Property",
      address: "123 Test Street, Accra",
      priceGhs: 850,
    };

    const mockResponse = {
      data: {
        id: createdId,
        title: payload.title,
        address: payload.address,
        price: payload.priceGhs,
      },
    };

    apiClient.post.mockResolvedValueOnce(mockResponse);

    const res = await createProperty(payload);
    const prop = res.data ?? res;

    expect(prop).toBeDefined();
    expect(prop.title).toBe(payload.title);
    expect(prop.id).toBe(createdId);
    expect(apiClient.post).toHaveBeenCalledWith(
      "/properties/",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  });

  test("fetchPropertyById returns the property", async () => {
    const mockProperty = {
      id: createdId,
      title: "Test Property",
      address: "123 Test Street, Accra",
    };

    apiClient.get.mockResolvedValueOnce({ data: mockProperty });

    const res = await fetchPropertyById(createdId);
    const prop = res.data ?? res;

    expect(prop.id).toBe(createdId);
    expect(prop.title).toBe("Test Property");
    expect(apiClient.get).toHaveBeenCalledWith(`/properties/${createdId}`);
  });

  test("updateProperty updates the property title", async () => {
    const updates = { title: "Updated Luxury Apartment" };
    const mockResponse = {
      data: {
        id: createdId,
        title: updates.title,
        address: "123 Test Street, Accra",
      },
    };

    apiClient.put.mockResolvedValueOnce(mockResponse);

    const res = await updateProperty(createdId, updates);
    const prop = res.data ?? res;

    expect(prop.title).toBe(updates.title);
    expect(apiClient.put).toHaveBeenCalledWith(
      `/properties/${createdId}/`,
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  });

  test("deleteProperty removes the property successfully", async () => {
    apiClient.delete.mockResolvedValueOnce({ data: { success: true } });
    apiClient.get.mockRejectedValueOnce(new Error("Not found"));

    const res = await deleteProperty(createdId);
    expect(res.data?.success || res.success).toBe(true);
    expect(apiClient.delete).toHaveBeenCalledWith(`/properties/${createdId}/`);

    // Verify it's really gone (should throw error)
    const deleted = await fetchPropertyById(createdId).catch(() => null);
    expect(deleted).toBeNull();
  });
});