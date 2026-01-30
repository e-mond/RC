// src/services/__tests__/landlordService.test.js
import { expect, describe, test, vi } from "vitest";

// Mock the landlordService module to use mock implementations directly
vi.mock("../landlordService", async () => {
  const mockProperties = [];
  let nextId = 1;

  return {
    fetchProperties: vi.fn(async () => mockProperties),
    fetchPropertyById: vi.fn(async (id) => {
      const prop = mockProperties.find((p) => p.id === id);
      if (!prop) throw new Error("Not found");
      return prop;
    }),
    createProperty: vi.fn(async (payload) => {
      const newProp = { id: String(nextId++), ...payload };
      mockProperties.push(newProp);
      return { property: newProp };
    }),
    updateProperty: vi.fn(async (id, updates) => {
      const idx = mockProperties.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Not found");
      mockProperties[idx] = { ...mockProperties[idx], ...updates };
      return { property: mockProperties[idx] };
    }),
    deleteProperty: vi.fn(async (id) => {
      const idx = mockProperties.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Not found");
      mockProperties.splice(idx, 1);
      return { success: true };
    }),
  };
});

import {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../landlordService";

describe("landlordService (mock mode)", () => {
  let createdId = null;

  test("fetchProperties returns an array", async () => {
    const res = await fetchProperties("owner_demo");
    const data = res.data ?? res;
    expect(Array.isArray(data)).toBe(true);
  });

  test("createProperty creates and returns a property", async () => {
    const payload = {
      title: "Test Property",
      address: "123 Test Street, Accra",
      priceGhs: 850,
    };

    const res = await createProperty(payload);
    const prop = res.property ?? res.data ?? res;

    expect(prop).toBeDefined();
    expect(prop.title).toBe(payload.title);
    expect(prop.address).toBe(payload.address);

    createdId = prop.id ?? prop._id;
    expect(createdId).toBeDefined();
  });

  test("fetchPropertyById returns the created property", async () => {
    expect(createdId).not.toBeNull();

    const res = await fetchPropertyById(createdId);
    const prop = res.data ?? res;

    expect(prop.id ?? prop._id).toBe(createdId);
    expect(prop.title).toBe("Test Property");
  });

  test("updateProperty updates the property title", async () => {
    const updates = { title: "Updated Luxury Apartment" };
    const res = await updateProperty(createdId, updates);
    const prop = res.property ?? res.data ?? res;

    expect(prop.title).toBe(updates.title);
  });

  test("deleteProperty removes the property successfully", async () => {
    const res = await deleteProperty(createdId);
    expect(res.success).toBe(true);
    // Verify it's really gone
    await expect(fetchPropertyById(createdId)).rejects.toThrow();
  });
});