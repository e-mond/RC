// src/pages/Documentation/DocumentationPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Book, 
  FileText, 
  Shield, 
  CreditCard, 
  MessageSquare, 
  Building2,
  Users,
  Settings,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import DocumentationHeader from "@/components/documentation/DocumentationHeader";
import DocumentationSidebar from "@/components/documentation/DocumentationSidebar";
import DocumentationCategory from "@/components/documentation/DocumentationCategory";
import DocumentationDisclaimer from "@/components/documentation/DocumentationDisclaimer";
import { useFeatureAccess } from "@/context/FeatureAccessContext";

/**
 * Documentation Page
 * Central hub for all platform documentation
 */
export default function DocumentationPage() {
  const { can, role } = useFeatureAccess();
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Book,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      items: [
        {
          title: "Platform Overview",
          description: "Rental Connects is a comprehensive rental management platform designed for Ghana's rental market. Connect tenants, landlords, and artisans in one trusted ecosystem with verified listings, secure payments, and seamless communication.",
          link: "#",
          content: "Rental Connects streamlines the rental process from property discovery to lease signing. Our platform offers verified listings, digital rent collection, maintenance tracking, and comprehensive tenant screening. Built specifically for Ghana's rental market, we understand local needs and regulations."
        },
        {
          title: "Creating Your Account",
          description: "Getting started is simple. Choose your role (Tenant, Landlord, or Artisan), provide basic information, and verify your identity. New landlord and artisan accounts require admin approval before activation.",
          link: "#",
          content: "To create your account: 1) Visit the signup page and select your role, 2) Fill in your personal information (name, email, phone), 3) Upload identification documents (Ghana Card or valid ID), 4) Submit for approval. Landlords and artisans will receive email notification once approved. Tenants can start browsing immediately after signup."
        },
        {
          title: "Role Selection",
          description: "Choose the role that best fits how you'll use the platform. You can add additional roles later in your profile settings. Each role has specific features and permissions.",
          link: "#",
          content: "Tenant: Browse properties, book viewings, pay rent digitally, request maintenance, and manage rental history. Landlord: List properties, manage bookings, collect rent, view analytics (premium), and screen tenants. Artisan: Receive maintenance requests, update task status, track earnings, and build your professional profile."
        },
        {
          title: "First Steps",
          description: "After signing up, complete your profile, verify your identity, and explore the platform. Set up your wallet if you're a landlord or artisan to receive payments.",
          link: "#",
          content: "Complete your profile with accurate information and a profile picture. Verify your identity by uploading required documents. Set up your wallet (landlords/artisans) with bank account or mobile money details. Explore properties or start listing (depending on your role). Enable notifications to stay updated on important activities."
        },
      ],
    },
    {
      id: "properties",
      title: "Properties & Listings",
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      items: [
        {
          title: "Creating a Listing",
          description: "List your property with detailed information, photos, and location. All listings go through admin verification before being published.",
          link: "#",
          content: "To create a listing: 1) Navigate to Properties > New Property, 2) Fill in property details (title, description, address, price, bedrooms, bathrooms), 3) Upload high-quality photos (minimum 3, maximum 10), 4) Set location using the interactive map, 5) Add amenities and property features, 6) Submit for approval. Once approved, your property will be visible to all tenants. Premium landlords can boost listings for better visibility."
        },
        {
          title: "Property Verification",
          description: "All properties undergo verification to ensure accuracy and build trust. Verified properties display a verification badge and appear higher in search results.",
          link: "#",
          content: "Verification process: 1) Admin reviews property details and photos, 2) Confirms property ownership or authorization, 3) Verifies location accuracy, 4) Checks for compliance with platform standards. Verified properties receive a green verification badge and are prioritized in search results. Verification typically takes 24-48 hours."
        },
        {
          title: "Searching Properties",
          description: "Use filters, search terms, and map view to find properties that match your preferences. Save favorites and set up alerts for new listings.",
          link: "#",
          content: "Search features: Filter by price range, bedrooms, bathrooms, property type, and location. Use the search bar to find properties by address or keywords. Sort by price, date added, or relevance. Save properties to your wishlist for later review. Set up alerts to be notified when new properties match your criteria."
        },
        {
          title: "Map-Based Search",
          description: "Explore properties visually on an interactive map. Use GPS location detection, satellite view, and street view to find rentals in your preferred neighborhoods.",
          link: "#",
          content: "Map features: Click the map icon to switch to map view. Use GPS button to detect your current location. Toggle between 2D, satellite, and street views. Click property markers to see details and pricing. Zoom in/out to explore different areas. All properties with valid coordinates are displayed on the map, even in demo mode."
        },
      ],
    },
    {
      id: "payments",
      title: "Payments & Wallets",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      items: [
        { title: "Setting Up Your Wallet", description: "Wallet setup and configuration", link: "#" },
        { title: "Making Payments", description: "How to pay rent and fees", link: "#" },
        { title: "Paystack Integration", description: "Secure payment processing", link: "#" },
        { title: "Transaction History", description: "Viewing your payment history", link: "#" },
      ],
    },
    {
      id: "messaging",
      title: "Messaging & Communication",
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      items: [
        { title: "Starting Conversations", description: "How to message other users", link: "#" },
        { title: "Real-Time Messaging", description: "Understanding WebSocket features", link: "#" },
        { title: "Encryption & Security", description: "End-to-end encryption explained", link: "#" },
        { title: "Messaging Rules", description: "Role-based messaging permissions", link: "#" },
      ],
    },
    {
      id: "security",
      title: "Security & Verification",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      items: [
        { title: "Background Checks", description: "Understanding verification processes", link: "#" },
        { title: "Trust Scores", description: "How trust scores are calculated", link: "#" },
        { title: "Fraud Prevention", description: "Platform security measures", link: "#" },
        { title: "Account Security", description: "Protecting your account", link: "#" },
      ],
    },
      {
        id: "legal",
        title: "Legal & Agreements",
        icon: FileText,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        items: [
          { title: "Lease Agreements", description: "Standard lease templates", link: "/documentation/lease-agreements", requiredRole: null },
          { title: "Terms of Service", description: "Platform terms and conditions", link: "#", requiredRole: null },
          { title: "Privacy Policy", description: "How we protect your data", link: "#", requiredRole: null },
          { title: "Rental Laws in Ghana", description: "Understanding local regulations", link: "#", requiredRole: null },
        ],
      },
      // Admin/Super Admin only category
      ...(role === "admin" || role === "super-admin" ? [{
        id: "admin-docs",
        title: "Admin Documentation",
        icon: Settings,
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        items: [
          { title: "User Management", description: "Managing users and approvals", link: "#", requiredRole: ["admin", "super-admin"] },
          { title: "System Configuration", description: "System settings and preferences", link: "#", requiredRole: ["super-admin"] },
          { title: "Lease Template Management", description: "Edit and manage system lease templates", link: "/admin/leases", requiredRole: ["admin", "super-admin"] },
          { title: "Audit Logs", description: "Viewing system audit logs", link: "#", requiredRole: ["admin", "super-admin"] },
        ],
      }] : []),
  ];

  // Filter categories and items based on role and feature access
  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      // Check role requirement
      if (item.requiredRole) {
        if (Array.isArray(item.requiredRole)) {
          return item.requiredRole.includes(role);
        }
        return item.requiredRole === role;
      }
      // Check feature requirement
      if (item.requiredFeature) {
        return can(item.requiredFeature);
      }
      return true; // No restrictions
    }),
  })).filter(category => category.items.length > 0); // Only show categories with visible items

  const activeCategoryData = filteredCategories.find(c => c.id === activeCategory) || filteredCategories[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Book className="w-10 h-10 text-[#0b6e4f]" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Documentation
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Comprehensive guides and resources to help you get the most out of Rental Connects
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
              Categories
            </h2>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        activeCategory === category.id
                          ? "bg-[#0b6e4f] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{category.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg mb-6 ${activeCategoryData.bgColor}`}>
                <activeCategoryData.icon className={`w-6 h-6 ${activeCategoryData.color}`} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeCategoryData.title}
                </h2>
              </div>

              <DocumentationCategory
                category={activeCategoryData}
                items={activeCategoryData.items}
                onItemClick={(item) => {
                  if (item.link && item.link !== "#") {
                    window.location.href = item.link;
                  }
                }}
              />
            </motion.div>

            {/* Disclaimers */}
            <DocumentationDisclaimer />

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-gradient-to-r from-[#0b6e4f] to-emerald-600 rounded-xl p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="mb-4 text-white/90">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="bg-white text-[#0b6e4f] hover:bg-gray-100">
                  <HelpCircle size={18} className="mr-2" />
                  Contact Support
                </Button>
                <Link to="/documentation/lease-agreements">
                  <Button variant="outline" className="bg-white text-[#0b6e4f] hover:bg-gray-100">
                    <FileText size={18} className="mr-2" />
                    Lease Agreements
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
  );
}
