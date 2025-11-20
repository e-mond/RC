// src/services/__tests__/landlordService.test.js
import { expect, describe, test, beforeAll } from "vitest";
import {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../landlordService";

// Force mock mode for ALL tests in this file
beforeAll(() => {
  import.meta.env.VITE_USE_MOCK = "true";
});

describe("landlordService (mock mode)", () => {
  let createdId = null;

  test("fetchProperties returns an array", async () => {
    const res = await fetchProperties("owner_demo");
    const data = res.data ?? res; // nullish coalescing for safety
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
    // Optional: verify it's really gone
    const deleted = await fetchPropertyById(createdId).catch(() => null);
    expect(deleted).toBeNull();
  });
});