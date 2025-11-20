// src/mocks/adminMock.js
const now = () => new Date().toISOString();

const pendingUsers = [
  { id: "u1", fullName: "Ama Boateng", email: "ama@example.com", role: "landlord", submittedAt: now() },
  { id: "u2", fullName: "Kofi Mensah", email: "kofi@example.com", role: "artisan", submittedAt: now() },
];

const pendingProperties = [
  { id: "p1", title: "2BR apartment - Kotoka", ownerName: "Ama Boateng", submittedAt: now(), price: 1200 },
  { id: "p2", title: "Studio - Osu", ownerName: "John Doe", submittedAt: now(), price: 800 },
];

const reportsSummary = {
  totalUsers: 342,
  pendingApprovals: pendingUsers.length,
  propertiesPending: pendingProperties.length,
  monthlySignups: 42,
};

export default {
  pendingUsers,
  pendingProperties,
  reportsSummary,
};
