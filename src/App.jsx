import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import LandingPage from "./pages/Landing/LandingPage";
import LearnMore from "@/pages/LearnMore/LearnMore";

import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import RoleSelection from "@/components/onboarding/RoleSelection";
import Signup from "./pages/Auth/Signup";
import Login from "@/pages/Auth/Login";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";

// Dashboard imports
import TenantDashboard from "@/pages/Dashboards/TenantDashboard";
import LandlordDashboard from "@/pages/Dashboards/LandlordDashboard";
import ArtisanDashboard from "@/pages/Dashboards/ArtisanDashboard";
import AdminDashboard from "@/pages/Dashboards/AdminDashboard";
import SuperAdminDashboard from "@/pages/Dashboards/SuperAdminDashboard";

// Property imports
import PropertyList from "@/pages/Properties/PropertyList";
import PropertyDetail from "@/pages/Properties/PropertyDetail";
import AddProperty from "@/pages/Landlord/AddProperty";

// Profile imports
import ProfileView from "@/pages/Profile/ProfileView";
import ProfileEdit from "@/pages/Profile/ProfileEdit";

// Maintenance imports
import MaintenanceRequestList from "@/pages/Maintenance/MaintenanceRequestList";
import MaintenanceRequestForm from "@/pages/Maintenance/MaintenanceRequestForm";

// Booking imports
import BookingList from "@/pages/Bookings/BookingList";
import BookingForm from "@/pages/Bookings/BookingForm";

// Payment imports
import PaymentHistory from "@/pages/Payments/PaymentHistory";

// Chat imports
import ChatInterface from "@/pages/Chat/ChatInterface";

// Notifications imports
import NotificationsPage from "@/pages/Notifications/NotificationsPage";

// Support imports
import HelpCenter from "@/pages/Support/HelpCenter";

// Documents imports
import DocumentsPage from "@/pages/Documents/DocumentsPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard/tenant" element={<TenantDashboard />} />
        <Route path="/dashboard/landlord" element={<LandlordDashboard />} />
        <Route path="/dashboard/artisan" element={<ArtisanDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/super-admin/overview" element={<SuperAdminDashboard />} />
        
        {/* Property Routes */}
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/properties/add" element={<AddProperty />} />
        <Route path="/properties/:id/edit" element={<AddProperty />} />
        
        {/* Profile Routes */}
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/profile/:userId" element={<ProfileView />} />
        
        {/* Maintenance Routes */}
        <Route path="/maintenance" element={<MaintenanceRequestList />} />
        <Route path="/maintenance/new" element={<MaintenanceRequestForm />} />
        <Route path="/maintenance/:id" element={<MaintenanceRequestForm />} />
        
        {/* Booking Routes */}
        <Route path="/bookings" element={<BookingList />} />
        <Route path="/bookings/new" element={<BookingForm />} />
        
        {/* Payment Routes */}
        <Route path="/payments/history" element={<PaymentHistory />} />
        
        {/* Chat Routes */}
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/chat/:conversationId" element={<ChatInterface />} />

        {/* Notifications Routes */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Support Routes */}
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/support" element={<HelpCenter />} />

        {/* Documents Routes (Premium) */}
        <Route path="/documents" element={<DocumentsPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
