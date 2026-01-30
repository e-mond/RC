/**
 * UserSearchAutocomplete Component
 * 
 * Allows users to search for other users by email or name
 * Shows autocomplete dropdown with user details (name, role, email)
 * Displays selected user information before starting conversation
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, User, Mail, Shield, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/services/apiClient";

export default function UserSearchAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  selectedUser,
  placeholder = "Search by email or name..."
}) {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(searchQuery.trim());
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Try to search users by email or name
      const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
      
      // Check if query is an email
      const emailMatch = query.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      
      if (emailMatch) {
        // Try to get user by email directly
        try {
          const { data } = await apiClient.get(API_ENDPOINTS.USERS.BY_EMAIL(query));
          setSearchResults([data.user || data]);
          setShowDropdown(true);
          return;
        } catch (emailErr) {
          // If by-email endpoint doesn't exist, try search endpoint
          if (emailErr.response?.status === 404) {
            // Fall through to search endpoint
          } else {
            throw emailErr;
          }
        }
      }
      
      // Try search endpoint
      try {
        const { data } = await apiClient.get(API_ENDPOINTS.USERS.SEARCH, {
          params: { q: query, limit: 10 }
        });

        const users = data.results || data.users || data.data || (Array.isArray(data) ? data : []);
        setSearchResults(users);
        setShowDropdown(users.length > 0);
      } catch (searchErr) {
        // If search endpoint doesn't exist, show helpful message
        if (searchErr.response?.status === 404) {
          setError("User search not available. Please enter user ID manually or contact support.");
          setSearchResults([]);
        } else {
          throw searchErr;
        }
      }
    } catch (err) {
      console.error("User search error:", err);
      setError("Unable to search users. Please use user ID instead.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSearchQuery(user.email || user.fullName || user.name || "");
    setShowDropdown(false);
    setSearchResults([]);
    onChange?.(user.email || user.fullName || user.name || "");
    onSelect?.(user);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    onChange?.("");
    onSelect?.(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Search User
      </label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}

      {/* Selected User Info */}
      {selectedUser && !showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0b6e4f] rounded-full flex items-center justify-center text-white font-semibold">
              {(selectedUser.fullName || selectedUser.name || selectedUser.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedUser.fullName || selectedUser.name || "Unknown User"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Mail size={12} className="text-gray-500" />
                <p className="text-xs text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Shield size={12} className="text-gray-500" />
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{selectedUser.role || "user"}</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded"
              aria-label="Remove user"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Dropdown Results */}
      <AnimatePresence>
        {showDropdown && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {searchResults.map((user) => (
              <button
                key={user.id || user._id}
                onClick={() => handleSelectUser(user)}
                className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-left transition"
              >
                <div className="w-10 h-10 bg-[#0b6e4f] rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                  {(user.fullName || user.name || user.email || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {user.fullName || user.name || "Unknown User"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={12} className="text-gray-500 shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <Shield size={12} className="text-gray-500 shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user.role || "user"}</p>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {showDropdown && !isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">No users found</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Try a different search term</p>
        </motion.div>
      )}
    </div>
  );
}
