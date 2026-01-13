// src/components/common/WalletDisplay.jsx
/**
 * WalletDisplay
 * 
 * Component to display wallet balance and basic wallet information.
 * Used in: Profile page, Dashboards
 * 
 * Props:
 * - wallet: object (wallet data from API)
 * - showSetupButton: boolean (show setup button if wallet not set up)
 * - onSetupClick: function (callback when setup button clicked)
 */

import { Wallet, CreditCard, Smartphone, AlertCircle, Loader2, Plus, Shield } from "lucide-react";
import Button from "@/components/ui/Button";

export default function WalletDisplay({ wallet, showSetupButton = false, onSetupClick, onTopUpClick }) {
  if (!wallet) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Wallet className="w-5 h-5 text-[#0b6e4f]" />
            Wallet
          </h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          Loading wallet information...
        </div>
      </div>
    );
  }

  // Safely check wallet setup status
  const isSetup = wallet?.is_setup === true;
  const balance = wallet?.balance || 0;
  const currency = wallet?.currency || "GHS";

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Wallet className="w-5 h-5 text-[#0b6e4f]" />
          Wallet
        </h2>
      </div>

      {!isSetup ? (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                Wallet Not Setup
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                You need to set up your wallet to receive payments. Add your bank account or mobile money details.
              </p>
            </div>
          </div>

          {showSetupButton && (
            <Button onClick={onSetupClick} className="w-full">
              Setup Wallet
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Balance */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {currency === "GHS" ? "₵" : currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Payment Methods */}
          {(wallet?.bank_account || wallet?.mobile_money) && (
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {wallet.bank_account && (
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {wallet.bank_account.bank_name || "Bank Account"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {wallet.bank_account.account_number
                        ? `•••• ${wallet.bank_account.account_number.slice(-4)}`
                        : "Account number not available"}
                    </p>
                  </div>
                </div>
              )}

              {wallet.mobile_money && (
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {wallet.mobile_money.network || "Mobile Money"} Mobile Money
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {wallet.mobile_money.number || "Number not available"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Provider Info */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <Shield className="w-3 h-3" />
              <span>Secured by Paystack</span>
            </div>
          </div>

          {/* Top Up Button */}
          {onTopUpClick && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={onTopUpClick}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Top Up Wallet
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

