// src/pages/Dashboards/Landlord/Properties/__tests__/PropertyDetailsPage.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import PropertyDetailsPage from "@/pages/Dashboards/Landlord/Properties/PropertyDetailsPage";
import * as propertyService from "@/services/propertyService";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock the service
vi.mock("@/services/propertyService");

const mockProperty = {
  id: "prop_test",
  title: "Mock Home",
  address: "Mock St",
  priceGhs: 900,
  images: ["properties/prop_test/main"],
  description: "Mock description",
  ownerName: "Owner A",
  createdAt: new Date().toISOString(),
};

describe("PropertyDetailsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    propertyService.fetchProperty.mockResolvedValue({ data: mockProperty });
  });

  test("renders property details correctly", async () => {
    render(
      <MemoryRouter initialEntries={[`/properties/${mockProperty.id}`]}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the mocked API call to resolve and content to appear
    await waitFor(() => {
      expect(screen.getByText("Mock Home")).toBeInTheDocument();
    });

    expect(screen.getByText("Mock St")).toBeInTheDocument();
    expect(screen.getByText(/₵900\.00/)).toBeInTheDocument();
    expect(screen.getByText(mockProperty.ownerName)).toBeInTheDocument();
  });

  test("shows loading state initially", () => {
    propertyService.fetchProperty.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={[`/properties/${mockProperty.id}`]}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("handles API error gracefully", async () => {
    propertyService.fetchProperty.mockRejectedValueOnce(new Error("Not found"));

    render(
      <MemoryRouter initialEntries={[`/properties/invalid-id`]}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/not found|error/i)).toBeInTheDocument(); // match your error message
    });
  });
});