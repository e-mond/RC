/* eslint-disable react-refresh/only-export-components */


import { useEffect, useState } from "react";
import { fetchTenantRentals, fetchRentalDetails, payRent } from "@/services/tenantService";
import RentPaymentModal from "@/components/tenant/RentPaymentModal";
import { motion, AnimatePresence } from "framer-motion";

export default function TN_MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRental, setActiveRental] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

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
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <RentalsSkeleton />
      ) : rentals.length === 0 ? (
        <NoRentalsState />
      ) : (
        <motion.div
          className="grid gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {rentals.map((r) => (
            <RentalCard key={r.id || r.rentalId} rental={r} onPay={openPayment} onView={loadDetails} />
          ))}
        </motion.div>
      )}

      {/* Active Rental Highlight */}
      <AnimatePresence>
        {activeRental && !paymentModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 p-6 bg-linear-to-r from-[#0b6e4f] to-[#095c42] text-white rounded-2xl shadow-2xl backdrop-blur-md border border-white/20"
          >
            <h3 className="text-2xl font-bold">{activeRental.title || "Rental Details"}</h3>
            <p className="text-sm opacity-90 mt-1">{activeRental.address || "Location not specified"}</p>
            <div className="mt-5 flex flex-wrap gap-8 text-sm font-medium">
              <span>Next Due: <strong className="text-yellow-300">₵{activeRental.nextDueAmount || "0.00"}</strong></span>
              <span>Status: <span className="capitalize">{activeRental.status || "Active"}</span></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

// Dark Mode Ready Helpers
function RentalsSkeleton() {
  return (
    <div className="space-y-5">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-sm animate-pulse"
        >
          <div className="flex justify-between items-center">
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="flex gap-3">
              <div className="h-11 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-11 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NoRentalsState() {
  return (
    <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="mx-auto w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-full mb-8" />
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No Rentals Yet</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-md mx-auto">
        Your landlord hasn’t added you to any rental agreement.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
        Contact your landlord or admin to get started.
      </p>
    </div>
  );
}

function RentalCard({ rental, onPay, onView }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800/70 backdrop-blur-sm shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white">
            {rental.title || rental.propertyName || "Unnamed Property"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {rental.address || rental.location || "No location provided"}
          </p>
          <p className="text-base font-medium">
            <span className="text-[#0b6e4f] dark:text-[#0b6e4f] font-bold text-xl">
              ₵{rental.nextDueAmount || rental.amount || "0.00"}
            </span>{" "}
            <span className="text-gray-500 dark:text-gray-400">
              due on {rental.nextDueDate || rental.dueDate || "N/A"}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onPay(rental)}
            className="px-6 py-3 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] font-semibold transition shadow-md hover:shadow-lg"
          >
            Pay Rent
          </button>
          <button
            onClick={() => onView(rental)}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}