let items = [
  { id: "1", name: "Rosewood Apartment", location: "Accra", rent: 1200, description: "2 bedroom apartment" },
  { id: "2", name: "Sunset Villa", location: "Kumasi", rent: 900, description: "1 bedroom self-contained" },
];

export const mockProperties = {
  getAll: async () => items,
  getById: async (id) => items.find((p) => p.id === id),
  save: async (data, id) => {
    if (id) {
      items = items.map((p) => (p.id === id ? { ...p, ...data } : p));
    } else {
      items.push({ ...data, id: Date.now().toString() });
    }
    return true;
  },
};
