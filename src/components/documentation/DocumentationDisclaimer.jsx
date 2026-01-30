/**
 * DocumentationDisclaimer Component
 * 
 * Displays important disclaimers and legal notices on documentation pages
 */

import { AlertTriangle, Info, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentationDisclaimer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-4"
    >
      {/* Legal Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
              Legal Disclaimer
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-400">
              The information provided in this documentation is for general informational purposes only. 
              While we strive to keep the information accurate and up-to-date, Rental Connects makes no 
              representations or warranties of any kind, express or implied, about the completeness, 
              accuracy, reliability, or suitability of the information contained herein.
            </p>
          </div>
        </div>
      </div>

      {/* Professional Advice Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Professional Advice Recommended
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              For legal, financial, or professional advice specific to your situation, please consult 
              with qualified professionals. Lease agreements and legal documents should be reviewed by 
              a licensed attorney familiar with Ghana's rental laws before execution.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Terms */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-300 mb-2">
              Platform Terms & Conditions
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">
              By using Rental Connects, you agree to our Terms of Service and Privacy Policy. 
              All transactions and interactions on the platform are subject to these terms.
            </p>
            <div className="flex gap-2 mt-3">
              <a
                href="#"
                className="text-sm text-[#0b6e4f] hover:underline font-medium"
              >
                View Terms of Service
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="#"
                className="text-sm text-[#0b6e4f] hover:underline font-medium"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Version */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-300 mb-2">
              Documentation Version
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. 
              Documentation is subject to change as the platform evolves. We recommend checking back 
              periodically for updates.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
