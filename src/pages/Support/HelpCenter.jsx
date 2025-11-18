import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Search, Mail, MessageCircle, Book, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click on 'Get Started' in the navigation bar, select your role (Tenant, Landlord, or Artisan), and fill out the registration form with your details.",
      },
      {
        q: "What information do I need to sign up?",
        a: "You'll need your email address, full name, phone number, and depending on your role, additional information like preferred location (tenants), business type (landlords), or profession (artisans).",
      },
      {
        q: "How do I verify my account?",
        a: "After signing up, you'll receive a verification email. Click the link in the email to verify your account. For premium features, additional ID verification may be required.",
      },
    ],
  },
  {
    category: "For Tenants",
    questions: [
      {
        q: "How do I search for properties?",
        a: "Use the Properties page to browse available listings. You can filter by location, price range, property type, number of bedrooms, and more.",
      },
      {
        q: "How do I schedule a property viewing?",
        a: "On any property detail page, click the 'Schedule Viewing' button. Select your preferred date and time, and optionally provide an alternative time. The landlord will be notified and can confirm or suggest another time.",
      },
      {
        q: "How do I book a property?",
        a: "After viewing a property, click 'Book This Property' on the property detail page. Fill out the booking form with your rental start date and any additional notes. The landlord will review and approve your request.",
      },
      {
        q: "How do I pay rent?",
        a: "Once your booking is approved, you can make rent payments through the Payments section in your dashboard. We support various payment methods for your convenience.",
      },
    ],
  },
  {
    category: "For Landlords",
    questions: [
      {
        q: "How do I list a property?",
        a: "Go to your dashboard and click 'Add Property'. Fill out the property details including location, price, amenities, and upload photos. Once submitted, your property will be reviewed and published.",
      },
      {
        q: "How do I manage viewing requests?",
        a: "Viewing requests from tenants will appear in your dashboard. You can confirm, reject, or suggest alternative times. Both you and the tenant will receive notifications about the status.",
      },
      {
        q: "How do I handle maintenance requests?",
        a: "Tenants can submit maintenance requests for your properties. You'll receive notifications and can assign artisans to handle the repairs. Track the progress through your dashboard.",
      },
      {
        q: "How do I collect rent?",
        a: "Once a tenant books your property, rent payments are processed through the platform. You'll receive notifications when payments are made and can view your payment history in the dashboard.",
      },
    ],
  },
  {
    category: "For Artisans",
    questions: [
      {
        q: "How do I get service requests?",
        a: "Landlords and tenants can request your services through the platform. You'll receive notifications when someone needs your expertise. Accept or decline requests based on your availability.",
      },
      {
        q: "How do I update my service profile?",
        a: "Go to your profile settings to update your profession, experience, service region, and other details. A complete profile helps you get more service requests.",
      },
      {
        q: "How do I get paid for my services?",
        a: "After completing a service request, payment is processed through the platform. You can track your earnings and payment history in your dashboard.",
      },
    ],
  },
  {
    category: "Payments & Billing",
    questions: [
      {
        q: "What payment methods are accepted?",
        a: "We accept various payment methods including mobile money, bank transfers, and credit/debit cards. Available options may vary by region.",
      },
      {
        q: "Are there any fees?",
        a: "Basic features are free. Premium features like document management and multi-language support require a subscription. Check the Pricing page for details.",
      },
      {
        q: "How do I upgrade to Premium?",
        a: "Go to your profile settings and click 'Upgrade to Premium'. Choose a subscription plan and complete the payment. Premium features will be activated immediately.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Log in' and then 'Forgot Password'. Enter your email address and you'll receive a password reset link. Click the link to set a new password.",
      },
      {
        q: "How do I change my profile information?",
        a: "Go to your Profile page and click 'Edit Profile'. Update your information and save the changes.",
      },
      {
        q: "How do I contact support?",
        a: "Use the contact form below, send us an email at support@rentalconnects.com, or use the chat feature if available. Our support team typically responds within 24 hours.",
      },
    ],
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Implement contact form submission
    setTimeout(() => {
      alert("Thank you for contacting us! We'll get back to you soon.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block p-4 bg-teal-100 rounded-full mb-4"
            >
              <HelpCircle className="w-12 h-12 text-teal-600" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-gray-600 text-lg">
              Find answers to common questions or contact our support team
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"
            >
              <Book className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Knowledge Base</h3>
              <p className="text-sm text-gray-600">Browse our articles and guides</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"
            >
              <MessageCircle className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600">Chat with our support team</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"
            >
              <Mail className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600">support@rentalconnects.com</p>
            </motion.div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-6 mb-12">
            {filteredFAQs.map((category, categoryIdx) => (
              <motion.div
                key={categoryIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIdx * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <button
                  onClick={() =>
                    setOpenCategory(openCategory === categoryIdx ? null : categoryIdx)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.category}
                  </h2>
                  {openCategory === categoryIdx ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {openCategory === categoryIdx && (
                  <div className="px-6 pb-4 space-y-3">
                    {category.questions.map((item, qIdx) => (
                      <div key={qIdx} className="border-t border-gray-100 pt-3">
                        <button
                          onClick={() =>
                            setOpenQuestion(
                              openQuestion === `${categoryIdx}-${qIdx}`
                                ? null
                                : `${categoryIdx}-${qIdx}`
                            )
                          }
                          className="w-full flex items-start justify-between text-left"
                        >
                          <h3 className="font-medium text-gray-900 pr-4">
                            {item.q}
                          </h3>
                          {openQuestion === `${categoryIdx}-${qIdx}` ? (
                            <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          )}
                        </button>
                        {openQuestion === `${categoryIdx}-${qIdx}` && (
                          <p className="mt-2 text-gray-600">{item.a}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

