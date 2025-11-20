// src/pages/Dashboard/components/TN_MyRentals.jsx
// My Rentals List – Fully stable, beautiful, Ghana-ready
// Updated: November 17, 2025 | 11:15 AM GMT

import { useEffect, useState } from "react";
import { fetchTenantRentals, fetchRentalDetails, payRent } from "@/services/tenantService";
import RentPaymentModal from "@/components/tenant/RentPaymentModal";
import { motion } from "framer-motion";

export default function TN_MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRental, setActiveRental] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load rentals on mount
  useEffect(() => {
    let isMounted = true;

    const loadRentals = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchTenantRentals();
        if (isMounted) setRentals(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load your rentals");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRentals();
    return () => { isMounted = false; };
  }, []);

  const openPayment = (rental) => {
    setActiveRental(rental);
    setPaymentModalOpen(true);
  };

  const handleMakePayment = async (paymentData) => {
    setProcessingPayment(true);
    try {
      await payRent(paymentData.rentalId, paymentData);
      const updated = await fetchTenantRentals();
      setRentals(Array.isArray(updated) ? updated : []);
      setPaymentModalOpen(false);
      setActiveRental(null);
      alert("Payment successful! Thank you.");
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const loadDetails = async (rental) => {
    try {
      const details = await fetchRentalDetails(rental.id || rental.rentalId);
      setActiveRental(details);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <RentalsSkeleton />
      ) : rentals.length === 0 ? (
        <NoRentalsState />
      ) : (
        <motion.div className="grid gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {rentals.map((r) => (
            <RentalCard key={r.id || r.rentalId} rental={r} onPay={openPayment} onView={loadDetails} />
          ))}
        </motion.div>
      )}

      {activeRental && !paymentModalOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-linear-gradient-to-r from-[#0b6e4f] to-[#095c42] text-white rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold">{activeRental.title || "Rental Details"}</h3>
          <p className="text-sm opacity-90 mt-1">{activeRental.address || "Location not specified"}</p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <span>Next Due: ₵{activeRental.nextDueAmount || "0.00"}</span>
            <span>Status: {activeRental.status || "Active"}</span>
          </div>
        </motion.div>
      )}

      <RentPaymentModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setActiveRental(null);
          setError("");
        }}
        rental={activeRental}
        onPay={handleMakePayment}
        loading={processingPayment}
      />
    </div>
  );
}

// Helper Components (Fast Refresh safe)
// eslint-disable-next-line react-refresh/only-export-components
function RentalsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-5 bg-white shadow-sm animate-pulse">
          <div className="flex justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function NoRentalsState() {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full mb-6" />
      <h3 className="text-xl font-semibold text-gray-900">No Rentals Yet</h3>
      <p className="text-gray-600 mt-3 max-w-md mx-auto">
        Your landlord hasn’t added you to any rental agreement.
      </p>
      <p className="text-sm text-gray-500 mt-4">
        Contact your landlord or admin to get started.
      </p>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function RentalCard({ rental, onPay, onView }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-[#0f1724]">
            {rental.title || rental.propertyName || "Unnamed Property"}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {rental.address || rental.location || "No location provided"}
          </p>
          <p className="text-sm mt-3">
            <span className="font-semibold text-[#0b6e4f]">
              ₵{rental.nextDueAmount || rental.amount || "0.00"}
            </span>{" "}
            due on{" "}
            <span className="text-gray-500">
              {rental.nextDueDate || rental.dueDate || "N/A"}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onPay(rental)} className="px-5 py-2.5 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] font-medium transition">
            Pay Rent
          </button>
          <button onClick={() => onView(rental)} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}