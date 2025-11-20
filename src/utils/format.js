// src/utils/format.js
/**
 * Ghana-ready formatters
 * - Currency: GH₵1,234.00
 * - Date: Nov 17, 2025 at 12:27 AM
 */

export const formatGHS = (amount) => {
  if (amount == null) return "GH₵—";
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
};

export const formatDateGH = (date) =>
  new Date(date).toLocaleString("en-GH", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });