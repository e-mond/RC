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
  announcements: [
    {
      id: "ann_001",
      title: "Platform Maintenance Scheduled",
      message: "We'll be performing scheduled maintenance on Sunday, January 28th from 2 AM to 4 AM GMT. Services may be temporarily unavailable.",
      notification_type: "announcement",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_read: false,
    },
    {
      id: "ann_002",
      title: "New Feature: Enhanced Property Search",
      message: "We've launched an improved property search with advanced filters. Try it out and let us know what you think!",
      notification_type: "announcement",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_read: false,
    },
  ],
  walletTransactions: [
    {
      id: "txn_001",
      type: "credit",
      amount: 6800,
      description: "Rent payment from Tenant - Ama Boateng",
      status: "completed",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      reference: "RC-TXN-2025-001",
    },
    {
      id: "txn_002",
      type: "credit",
      amount: 2100,
      description: "Rent payment from Tenant - Yaw Owusu",
      status: "pending",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reference: "RC-TXN-2025-002",
    },
    {
      id: "txn_003",
      type: "debit",
      amount: 150,
      description: "Premium subscription fee",
      status: "completed",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      reference: "RC-TXN-2025-003",
    },
    {
      id: "txn_004",
      type: "credit",
      amount: 4500,
      description: "Rent payment from Tenant - Kofi Mensah",
      status: "completed",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      reference: "RC-TXN-2025-004",
    },
  ],
  ads: [
    {
      id: "ad_001",
      title: "Premium Property Listing Boost",
      description: "Get your property featured at the top of search results",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
      type: "banner",
      size: "728x90",
      duration: 7,
      status: "active",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ad_002",
      title: "Artisan Services Promotion",
      description: "Promote your artisan services to property owners",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
      type: "card",
      size: "300x250",
      duration: 14,
      status: "active",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ad_003",
      title: "Find Your Dream Home",
      description: "Browse thousands of properties in Accra",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
      type: "inline",
      size: "468x60",
      duration: 30,
      status: "active",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
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

