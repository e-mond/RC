// src/mocks/propertyMock.js
// Simple mock data for property management (dev)
const now = () => new Date().toISOString();

export const mockAmenities = [
  "Parking",
  "Water",
  "Electricity",
  "Fenced Compound",
  "Internet",
  "Air Conditioning",
  "Kitchen",
  "Washing Machine",
  "Balcony",
];

export const mockProperties = [
  {
    id: "p_mock_1",
    title: "3BR Apartment — East Legon",
    address: "East Legon, Accra",
    price: 3200,
    currency: "GHS",
    status: "active",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    amenities: ["Water", "Electricity", "Parking"],
    images: ["https://placehold.co/600x400?text=3BR+East+Legon"],
    ownerId: "owner_mock_1",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "p_mock_2",
    title: "Studio — Osu",
    address: "Oxford Street, Osu",
    price: 900,
    currency: "GHS",
    status: "pending",
    bedrooms: 0,
    bathrooms: 1,
    area: 30,
    amenities: ["Water", "Internet"],
    images: ["https://placehold.co/600x400?text=Studio+Osu"],
    ownerId: "owner_mock_1",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const withDelay = (result, ms = 600) => new Promise((res) => setTimeout(() => res(result), ms));

export default {
  mockProperties,
  mockAmenities,
  withDelay,
};
