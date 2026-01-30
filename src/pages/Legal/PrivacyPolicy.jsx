import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#0b6e4f] hover:text-[#095c42] mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#0b6e4f]" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 space-y-8"
        >
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Rental Connects ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our platform. 
              By using Rental Connects, you consent to the data practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.1 Personal Information</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  We collect personal information that you provide directly, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Full name, email address, and phone number</li>
                  <li>Identity verification documents (ID cards, passports, driver's licenses)</li>
                  <li>Business registration documents (for landlords)</li>
                  <li>Professional certifications (for artisans)</li>
                  <li>Profile pictures and other uploaded content</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.2 Property and Service Information</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  For landlords and artisans, we collect property listings, service descriptions, pricing information, 
                  location data, and related documentation necessary to provide platform services.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.3 Usage Data</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We automatically collect information about how you interact with the platform, including pages visited, 
                  features used, search queries, device information, IP address, browser type, and access times.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.4 Communication Data</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We collect messages, booking requests, support tickets, and other communications sent through the platform.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Account Management:</strong> Creating and managing user accounts, verifying identities, and processing approvals</li>
              <li><strong>Service Delivery:</strong> Facilitating property listings, bookings, payments, and communication between users</li>
              <li><strong>Notifications:</strong> Sending email and in-app notifications about account status, approvals, bookings, and platform updates</li>
              <li><strong>Security:</strong> Detecting and preventing fraud, unauthorized access, and other security threats</li>
              <li><strong>Platform Improvement:</strong> Analyzing usage patterns to improve user experience and develop new features</li>
              <li><strong>Legal Compliance:</strong> Meeting legal obligations, responding to legal requests, and enforcing our terms</li>
              <li><strong>Support:</strong> Providing customer support and responding to inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">4.1 With Other Users</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your profile information, property listings, and service offerings are visible to other platform users 
                  as necessary to facilitate transactions and connections.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">4.2 With Service Providers</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We share data with trusted third-party service providers who assist with payment processing, email delivery, 
                  cloud storage, analytics, and other platform operations. These providers are contractually obligated to protect your data.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">4.3 Legal Requirements</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may disclose information when required by law, court order, or government request, or to protect 
                  the rights, property, or safety of Rental Connects, our users, or others.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">4.4 Business Transfers</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, user data may be transferred as part of 
                  the transaction, subject to the same privacy protections.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Limited access to personal data on a need-to-know basis</li>
              <li>Secure document storage and processing</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              However, no method of transmission or storage is 100% secure. While we strive to protect your data, 
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide services, comply with legal obligations, 
              resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your 
              personal data, except where retention is required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Manage email and notification preferences</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@rentalconnects.com or through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use cookies, web beacons, and similar technologies to enhance user experience, analyze platform usage, 
              and deliver personalized content. You can control cookie preferences through your browser settings, though 
              disabling cookies may limit some platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Rental Connects is not intended for users under the age of 18. We do not knowingly collect personal 
              information from children. If we become aware that we have collected information from a child, we will 
              take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws. We ensure appropriate safeguards are in place to 
              protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be communicated via email and 
              in-app notifications. The "Last updated" date at the top indicates when changes were last made. Continued 
              use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-900 dark:text-white font-medium">Rental Connects Privacy Team</p>
              <p className="text-gray-700 dark:text-gray-300">Email: privacy@rentalconnects.com</p>
              <p className="text-gray-700 dark:text-gray-300">Support: support@rentalconnects.com</p>
              <p className="text-gray-700 dark:text-gray-300">Phone: +233-234-567890</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
