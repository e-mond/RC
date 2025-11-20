const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

export const mockDataStore = {
  properties: [
    {
      id: "prop_lg_01",
      title: "Executive 4BR Home - East Legon",
      address: "Adjiringanor, East Legon",
      priceGhs: 6800,
      status: "published",
      bedrooms: 4,
      bathrooms: 4,
      area: 280,
      occupancy: 92,
      featured: true,
    },
    {
      id: "prop_osu_02",
      title: "Studio Loft - Osu",
      address: "Oxford Street, Osu",
      priceGhs: 2100,
      status: "pending",
      bedrooms: 1,
      bathrooms: 1,
      area: 65,
      occupancy: 74,
    },
  ],
  artisanJobs: [
    { id: "job_1001", type: "Electrical", property: "prop_lg_01", priority: "high", status: "pending", budget: 450 },
    { id: "job_1002", type: "Plumbing", property: "prop_osu_02", priority: "medium", status: "completed", budget: 280 },
  ],
  bookings: [
    { id: "bk_901", tenant: "Kofi Mensah", property: "prop_lg_01", status: "requested", viewingDate: "2025-01-22" },
    { id: "bk_902", tenant: "Araba Owusu", property: "prop_osu_02", status: "approved", viewingDate: "2025-01-18" },
  ],
  payments: [
    { id: "pay_701", tenant: "Ama Boateng", amount: 3200, method: "Mobile Money", status: "successful", date: "2024-12-01" },
    { id: "pay_702", tenant: "Yaw Owusu", amount: 2100, method: "Card", status: "pending", date: "2024-12-04" },
  ],
  backgroundChecks: [
    { id: "bg_5001", tenant: "Kwesi Appiah", score: 84, risk: "low", completedOn: "2024-11-12" },
    { id: "bg_5002", tenant: "Esi Dede", score: 62, risk: "medium", completedOn: "2024-11-20" },
  ],
  analytics: {
    occupancyTrend: [
      { month: "Jan", occupancy: 88 },
      { month: "Feb", occupancy: 90 },
      { month: "Mar", occupancy: 91 },
      { month: "Apr", occupancy: 93 },
      { month: "May", occupancy: 95 },
    ],
    revenueSeries: [
      { month: "Jan", revenue: 48000 },
      { month: "Feb", revenue: 50500 },
      { month: "Mar", revenue: 52000 },
      { month: "Apr", revenue: 53800 },
      { month: "May", revenue: 56000 },
    ],
  },
};

const clone = (data) => JSON.parse(JSON.stringify(data));

export const getMockData = () => clone(mockDataStore);

export const addMockProperty = (payload) => {
  const property = {
    id: uid("prop"),
    status: "pending",
    featured: false,
    occupancy: 0,
    ...payload,
  };
  mockDataStore.properties.unshift(property);
  return clone(property);
};

export const updateMockPropertyStatus = (id, status) => {
  const property = mockDataStore.properties.find((p) => p.id === id);
  if (!property) return null;
  property.status = status;
  return clone(property);
};

export const addMockBooking = (payload) => {
  const booking = { id: uid("bk"), status: "requested", ...payload };
  mockDataStore.bookings.unshift(booking);
  return clone(booking);
};

export const addMockPayment = (payload) => {
  const payment = { id: uid("pay"), status: "successful", date: new Date().toISOString(), ...payload };
  mockDataStore.payments.unshift(payment);
  return clone(payment);
};

