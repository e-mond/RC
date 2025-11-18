// Lightweight mock used as fallback when API is not reachable (dev/test).
const TOTAL = 37;

// generate a simple list of mock properties
const makeProperty = (i, status = "pending") => ({
  id: `prop_${i}`,
  title: `2-bedroom apartment — Block ${i}`,
  price: 1200 + (i % 5) * 150,
  city: ["Accra", "Kumasi", "Takoradi", "Tamale"][i % 4],
  createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
  ownerName: `Owner ${i}`,
  status, // pending | approved | rejected
  summary: `Spacious unit ${i} with good lighting and ventilation.`,
});

const ALL = Array.from({ length: TOTAL }).map((_, i) => makeProperty(i + 1));

export const mockFetchPendingProperties = ({ page = 1, perPage = 10, search = "", statusFilter = "pending" }) => {
  // simple filter by status and text match
  let items = ALL.filter((p) => (statusFilter ? p.status === statusFilter : true));
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => `${p.title} ${p.city} ${p.ownerName}`.toLowerCase().includes(q));
  }
  const total = items.length;
  const start = (page - 1) * perPage;
  const pageItems = items.slice(start, start + perPage);
  return Promise.resolve({ items: pageItems, total });
};

export const mockApproveProperty = (propertyId) => {
  // pretend approval succeeded
  return Promise.resolve({ success: true, id: propertyId, status: "approved" });
};

export const mockRejectProperty = (propertyId, { reason }) => {
  return Promise.resolve({ success: true, id: propertyId, status: "rejected", reason });
};
