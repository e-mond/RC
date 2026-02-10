// src/services/walletService.js
/**
 * Wallet Service
 * 
 * Handles all wallet-related API calls for payment processing.
 * Supports wallet setup, balance retrieval, top-up, and transaction history.
 * Used by: Landlord, Artisan, Admin, Super Admin (all roles that receive payments)
 * 
 * Mock Mode:
 * - Supports hybrid mock/real API system
 * - Mock data provided when VITE_USE_MOCK=true
 * - Production uses real API endpoints
 */

import apiClient from "./apiClient";

/**
 * Mock Mode Detection
 * Checks if mock mode is enabled via environment variable
 */
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

/**
 * Simulate Network Delay
 * Helper function to add realistic delays in mock mode
 */
const withDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/**
 * Mock Wallet Data Store
 * In-memory store for mock wallet data
 */
let mockWalletStore = {
  wallet: null,
  transactions: [],
};

/**
 * Create mock transaction for subscriptions, ads, bookings
 * @param {string} type - Transaction type ('subscription', 'ad_promotion', 'booking', 'top_up', 'withdrawal', 'payment_received')
 * @param {number} amount - Transaction amount
 * @param {string} description - Transaction description
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Transaction object
 */
const createMockTransaction = (type, amount, description, metadata = {}) => {
  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount: Math.abs(amount),
    currency: "GHS",
    status: "completed",
    description,
    metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

/**
 * Initialize Mock Wallet
 * Creates a default wallet for mock mode
 */
const initMockWallet = () => {
  if (!mockWalletStore.wallet) {
    mockWalletStore.wallet = {
      id: "wallet_mock_001",
      user_id: "user_mock_001",
      balance: 0,
      currency: "GHS",
      is_setup: false,
      bank_account: null,
      mobile_money: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return mockWalletStore.wallet;
};

/**
 * Extract error message from API error response
 * @param {Error} err - Error object
 * @param {string} fallback - Fallback error message
 * @returns {Error} Normalized error
 */
function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.response?.data?.detail) return new Error(err.response.data.detail);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}

/**
 * Get wallet information for current user
 * @returns {Promise<Object>} Wallet object with balance, currency, status, etc.
 */
export const getWallet = async () => {
  if (USE_MOCK) {
    const wallet = initMockWallet();
    return withDelay(wallet, 300);
  }

  try {
    const { data } = await apiClient.get("/wallet/");
    return data;
  } catch (err) {
    console.error("Get wallet error:", err);
    throw extractError(err, "Failed to fetch wallet");
  }
};

/**
 * Setup wallet (initialize wallet for receiving payments)
 * @param {Object} walletData - Wallet setup data (bank_account, mobile_money_number, etc.)
 * @returns {Promise<Object>} Created wallet
 */
export const setupWallet = async (walletData) => {
  if (USE_MOCK) {
    const wallet = initMockWallet();
    wallet.is_setup = true;
    wallet.bank_account = walletData.bank_account || null;
    wallet.mobile_money = walletData.mobile_money || null;
    wallet.updated_at = new Date().toISOString();
    mockWalletStore.wallet = wallet;
    return withDelay({ ...wallet }, 500);
  }

  try {
    const { data } = await apiClient.post("/wallet/setup/", walletData);
    return data;
  } catch (err) {
    console.error("Setup wallet error:", err);
    throw extractError(err, "Failed to setup wallet");
  }
};

/**
 * Update wallet information
 * @param {Object} walletData - Updated wallet data
 * @returns {Promise<Object>} Updated wallet
 */
export const updateWallet = async (walletData) => {
  try {
    const { data } = await apiClient.patch("/wallet/", walletData);
    return data;
  } catch (err) {
    console.error("Update wallet error:", err);
    throw extractError(err, "Failed to update wallet");
  }
};

/**
 * Get wallet balance
 * @returns {Promise<Object>} Wallet balance { balance, currency }
 */
export const getWalletBalance = async () => {
  if (USE_MOCK) {
    const wallet = initMockWallet();
    return withDelay({ balance: wallet.balance, currency: wallet.currency }, 200);
  }

  try {
    const { data } = await apiClient.get("/wallet/balance/");
    return data;
  } catch (err) {
    console.error("Get wallet balance error:", err);
    throw extractError(err, "Failed to fetch wallet balance");
  }
};

/**
 * Top up wallet
 * @param {Object} topUpData - Top-up data (amount, payment_method, etc.)
 * @returns {Promise<Object>} Top-up transaction details
 */
export const topUpWallet = async (topUpData) => {
  if (USE_MOCK) {
    const wallet = initMockWallet();
    const amount = parseFloat(topUpData.amount) || 0;
    wallet.balance = (wallet.balance || 0) + amount;
    wallet.updated_at = new Date().toISOString();

    const transaction = {
      id: `txn_${Date.now()}`,
      wallet_id: wallet.id,
      type: "top_up",
      amount,
      currency: "GHS",
      status: "completed",
      payment_method: topUpData.payment_method || "paystack",
      reference: topUpData.reference || `ref_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    mockWalletStore.transactions.unshift(transaction);
    mockWalletStore.wallet = wallet;

    return withDelay({ transaction, wallet }, 600);
  }

  try {
    const { data } = await apiClient.post("/wallet/top-up/", topUpData);
    return data;
  } catch (err) {
    console.error("Top up wallet error:", err);
    throw extractError(err, "Failed to top up wallet");
  }
};

/**
 * Get wallet transaction history
 * @param {Object} filters - Filter options (type, status, date_from, date_to, page, page_size)
 * @returns {Promise<Object>} Transaction list with pagination
 */
export const getWalletTransactions = async (filters = {}) => {
  if (USE_MOCK) {
    let transactions = [...mockWalletStore.transactions];

    // Apply filters
    if (filters.type) {
      transactions = transactions.filter((t) => t.type === filters.type);
    }
    if (filters.status) {
      transactions = transactions.filter((t) => t.status === filters.status);
    }

    return withDelay({
      results: transactions,
      count: transactions.length,
      next: null,
      previous: null,
    }, 400);
  }

  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });

    const { data } = await apiClient.get(`/wallet/transactions/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get wallet transactions error:", err);
    throw extractError(err, "Failed to fetch wallet transactions");
  }
};

/**
 * Get wallet transaction by ID
 * @param {number} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export const getWalletTransaction = async (transactionId) => {
  try {
    const { data } = await apiClient.get(`/wallet/transactions/${transactionId}/`);
    return data;
  } catch (err) {
    console.error("Get wallet transaction error:", err);
    throw extractError(err, "Failed to fetch wallet transaction");
  }
};

/**
 * Withdraw from wallet
 * @param {Object} withdrawalData - Withdrawal data (amount, destination, etc.)
 * @returns {Promise<Object>} Withdrawal transaction details
 */
export const withdrawFromWallet = async (withdrawalData) => {
  try {
    const { data } = await apiClient.post("/wallet/withdraw/", withdrawalData);
    return data;
  } catch (err) {
    console.error("Withdraw from wallet error:", err);
    throw extractError(err, "Failed to withdraw from wallet");
  }
};

/**
 * Check if wallet is set up
 * @returns {Promise<boolean>} True if wallet is set up, false otherwise
 */
export const isWalletSetup = async () => {
  try {
    const wallet = await getWallet();
    return wallet && wallet.is_setup === true;
  } catch (err) {
    return false;
  }
};

/**
 * Create mock transaction for subscription payment
 * @param {Object} subscriptionData - { plan: 'premium', period: 'monthly'|'yearly', amount: number }
 * @returns {Promise<Object>} Transaction object
 */
export const createSubscriptionTransaction = async (subscriptionData) => {
  if (USE_MOCK) {
    const transaction = createMockTransaction(
      "subscription",
      -subscriptionData.amount, // Negative for outgoing
      `Premium ${subscriptionData.period} subscription`,
      { plan: subscriptionData.plan, period: subscriptionData.period }
    );

    // Update wallet balance
    if (mockWalletStore.wallet) {
      mockWalletStore.wallet.balance = Math.max(0, (mockWalletStore.wallet.balance || 0) - subscriptionData.amount);
    }

    mockWalletStore.transactions.unshift(transaction);
    return withDelay(transaction, 300);
  }

  try {
    const { data } = await apiClient.post("/wallet/transactions/subscription/", subscriptionData);
    return data;
  } catch (err) {
    console.error("Create subscription transaction error:", err);
    throw extractError(err, "Failed to create subscription transaction");
  }
};

/**
 * Create mock transaction for ad promotion payment
 * @param {Object} adData - { ad_id: string, promotion_type: string, amount: number }
 * @returns {Promise<Object>} Transaction object
 */
export const createAdPromotionTransaction = async (adData) => {
  if (USE_MOCK) {
    const transaction = createMockTransaction(
      "ad_promotion",
      -adData.amount, // Negative for outgoing
      `Ad promotion: ${adData.promotion_type}`,
      { ad_id: adData.ad_id, promotion_type: adData.promotion_type }
    );

    // Update wallet balance
    if (mockWalletStore.wallet) {
      mockWalletStore.wallet.balance = Math.max(0, (mockWalletStore.wallet.balance || 0) - adData.amount);
    }

    mockWalletStore.transactions.unshift(transaction);
    return withDelay(transaction, 300);
  }

  try {
    const { data } = await apiClient.post("/wallet/transactions/ad-promotion/", adData);
    return data;
  } catch (err) {
    console.error("Create ad promotion transaction error:", err);
    throw extractError(err, "Failed to create ad promotion transaction");
  }
};

/**
 * Create mock transaction for booking payment
 * @param {Object} bookingData - { booking_id: string, amount: number, type: 'deposit'|'full_payment'|'payment_received' }
 * @returns {Promise<Object>} Transaction object
 */
export const createBookingTransaction = async (bookingData) => {
  if (USE_MOCK) {
    const transaction = createMockTransaction(
      "booking",
      bookingData.type === "payment_received" ? bookingData.amount : -bookingData.amount,
      `Booking ${bookingData.type === "payment_received" ? "payment received" : bookingData.type}: ${bookingData.booking_id}`,
      { booking_id: bookingData.booking_id, type: bookingData.type }
    );

    // Update wallet balance
    if (mockWalletStore.wallet) {
      if (bookingData.type === "payment_received") {
        mockWalletStore.wallet.balance = (mockWalletStore.wallet.balance || 0) + bookingData.amount;
      } else {
        mockWalletStore.wallet.balance = Math.max(0, (mockWalletStore.wallet.balance || 0) - bookingData.amount);
      }
    }

    mockWalletStore.transactions.unshift(transaction);
    return withDelay(transaction, 300);
  }

  try {
    const { data } = await apiClient.post("/wallet/transactions/booking/", bookingData);
    return data;
  } catch (err) {
    console.error("Create booking transaction error:", err);
    throw extractError(err, "Failed to create booking transaction");
  }
};

/**
 * List all withdrawal requests (Admin only)
 * @param {Object} filters - Filter options (status: 'pending'|'approved'|'rejected', page, page_size)
 * @returns {Promise<Object>} Withdrawal list with pagination
 */
export const listWithdrawals = async (filters = {}) => {
  if (USE_MOCK) {
    const withdrawals = mockWalletStore.transactions
      .filter((t) => t.type === "withdrawal")
      .map((t) => ({
        ...t,
        user_name: "Mock User",
        user_email: "mock@example.com",
        requested_at: t.created_at,
        processed_at: t.status !== "pending" ? t.updated_at : null,
      }));
    return withDelay({ results: withdrawals, count: withdrawals.length }, 400);
  }

  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    const { data } = await apiClient.get(`/wallet/withdrawals/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("List withdrawals error:", err);
    throw extractError(err, "Failed to fetch withdrawal requests");
  }
};

/**
 * Approve or reject a withdrawal request (Admin only)
 * @param {number} withdrawalId - Withdrawal request ID
 * @param {string} action - 'approve' or 'reject'
 * @param {string} reason - Optional reason for rejection
 * @returns {Promise<Object>} Updated withdrawal
 */
export const processWithdrawal = async (withdrawalId, action, reason = "") => {
  if (USE_MOCK) {
    const txn = mockWalletStore.transactions.find(
      (t) => t.id === withdrawalId && t.type === "withdrawal"
    );
    if (txn) {
      txn.status = action === "approve" ? "completed" : "rejected";
      txn.updated_at = new Date().toISOString();
      txn.admin_note = reason;
    }
    return withDelay(txn || { error: "Not found" }, 500);
  }

  try {
    const { data } = await apiClient.post(`/wallet/withdrawals/${withdrawalId}/process/`, {
      action,
      reason,
    });
    return data;
  } catch (err) {
    console.error("Process withdrawal error:", err);
    throw extractError(err, "Failed to process withdrawal");
  }
};

/**
 * Super Admin system wallet withdrawal
 * Requires verification code for security
 * @param {Object} withdrawalData - { amount, destination, verification_code, reason }
 * @returns {Promise<Object>} System withdrawal result
 */
export const systemWithdrawal = async (withdrawalData) => {
  if (USE_MOCK) {
    const transaction = createMockTransaction(
      "system_withdrawal",
      -withdrawalData.amount,
      `System withdrawal: ${withdrawalData.reason || "Admin withdrawal"}`,
      { destination: withdrawalData.destination, verification_code: "verified" }
    );
    mockWalletStore.transactions.unshift(transaction);
    return withDelay({ transaction, success: true }, 800);
  }

  try {
    const { data } = await apiClient.post("/wallet/system-withdraw/", withdrawalData);
    return data;
  } catch (err) {
    console.error("System withdrawal error:", err);
    throw extractError(err, "Failed to process system withdrawal");
  }
};

export default {
  getWallet,
  setupWallet,
  updateWallet,
  getWalletBalance,
  topUpWallet,
  getWalletTransactions,
  getWalletTransaction,
  withdrawFromWallet,
  isWalletSetup,
  listWithdrawals,
  processWithdrawal,
  systemWithdrawal,
};
