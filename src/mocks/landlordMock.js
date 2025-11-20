// src/mocks/landlordMock.js
// Lightweight mock store for landlord properties and bookings with basic CRUD
const now = () => new Date().toISOString();

let mockProperties = [
  {
    id: "prop_1",
    title: "2BR Apartment — Labone",
    address: "Osu-Labone Rd, Accra",
    priceGhs: 1400,
    images: [],
    status: "published",
    createdAt: now(),
    views: 480,
    inquiries: 26,
    description: "Spacious 2 bedroom apartment close to amenities.",
  },
  {
    id: "prop_2",
    title: "Studio — Osu",
    address: "Oxford St, Osu",
    priceGhs: 800,
    images: [],
    status: "pending",
    createdAt: now(),
    views: 180,
    inquiries: 8,
    description: "Cozy studio ideal for single occupant.",
  },
];

let mockBookings = [
  {
    id: "bk_1",
    propertyId: "prop_1",
    applicantName: "Yaa Asantewaa",
    phone: "0240000001",
    dateRequested: now(),
    status: "requested",
  },
];

const withDelay = (payload, ms = 400) =>
  new Promise((res) => setTimeout(() => res(payload), ms));

/* -----------------------------
   CRUD helpers for properties
   ----------------------------- */
const fetchPropertiesMock = () => {
  // return a shallow copy
  return { data: [...mockProperties] };
};

const fetchPropertyByIdMock = (id) => {
  const p = mockProperties.find((x) => x.id === id);
  if (!p) throw new Error("Property not found (mock)");
  return { data: { ...p } };
};

const createPropertyMock = (payload) => {
  const newP = {
    id: "prop_" + Date.now(),
    createdAt: now(),
    views: 0,
    inquiries: 0,
    ...payload,
  };
  mockProperties.unshift(newP);
  return { success: true, property: newP };
};

const updatePropertyMock = (id, payload) => {
  const idx = mockProperties.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Property not found (mock)");
  mockProperties[idx] = { ...mockProperties[idx], ...payload };
  return { success: true, property: mockProperties[idx] };
};

const deletePropertyMock = (id) => {
  const before = mockProperties.length;
  mockProperties = mockProperties.filter((x) => x.id !== id);
  return { success: true, removed: before - mockProperties.length };
};

/* -----------------------------
   Bookings & simple mocks
   ----------------------------- */
const fetchBookingsMock = () => ({ data: [...mockBookings] });
const respondBookingMock = (id, action) => {
  const idx = mockBookings.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error("Booking not found (mock)");
  mockBookings[idx].status = action === "accept" ? "accepted" : "declined";
  return { success: true, booking: mockBookings[idx] };
};

export {
  withDelay,
  mockProperties,
  mockBookings,
  fetchPropertiesMock,
  fetchPropertyByIdMock,
  createPropertyMock,
  updatePropertyMock,
  deletePropertyMock,
  fetchBookingsMock,
  respondBookingMock,
};
