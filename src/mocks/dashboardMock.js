export const mockLandlordDashboardStats = {
  totalProperties: 12,
  monthlyRevenue: 8500,
  occupancyRate: 86,
  pendingViewRequests: 5,

  revenueChart: [
    { month: "Jan", revenue: 6000 },
    { month: "Feb", revenue: 7200 },
    { month: "Mar", revenue: 8000 },
    { month: "Apr", revenue: 8500 },
    { month: "May", revenue: 9000 },
    { month: "Jun", revenue: 9500 },
  ],

  occupancyTrend: [
    { month: "Jan", rate: 72 },
    { month: "Feb", rate: 75 },
    { month: "Mar", rate: 78 },
    { month: "Apr", rate: 82 },
    { month: "May", rate: 85 },
    { month: "Jun", rate: 86 },
  ],
};

export const mockLandlordActivity = [
  { message: "Tenant John Doe paid rent for Apt 12B", time: "2 hours ago" },
  { message: "New booking request for East Legon Apartment", time: "5 hours ago" },
  { message: "Property 'Adenta Duplex' updated", time: "1 day ago" },
  { message: "Tenant Ama uploaded maintenance request", time: "2 days ago" },
];
