import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
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
            <FileText className="w-8 h-8 text-[#0b6e4f]" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using Rental Connects ("the Platform"), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services. These terms apply to all users, including tenants, 
              landlords, artisans, administrators, and super administrators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. User Roles and Responsibilities
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.1 Tenants</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Tenants are responsible for providing accurate personal information, maintaining account security, 
                  and complying with rental agreements. Tenants must verify their identity and may be subject to background checks.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.2 Landlords</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Landlords must provide accurate property information, maintain property listings, and comply with local 
                  rental laws. All property listings are subject to admin approval before being published. Landlords are 
                  responsible for property verification and documentation.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.3 Artisans</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Artisans must provide accurate professional information, certifications, and service details. 
                  All artisan accounts require admin approval before services can be offered. Artisans are responsible 
                  for maintaining professional standards and completing services as described.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2.4 Administrators</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Administrators have the authority to approve or reject user accounts, property listings, and manage 
                  platform content. All administrative actions are logged and subject to audit.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Account Approval Workflow
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              All new user accounts (except tenants) require administrative approval before full platform access is granted:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Upon signup, your account enters a "pending approval" state</li>
              <li>You will receive email notifications regarding your approval status</li>
              <li>Login is restricted until your account is approved by an administrator</li>
              <li>Approval decisions are typically made within 24-48 hours</li>
              <li>If rejected, you will receive a reason and may reapply after addressing the issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Property Listings and Moderation
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              All property listings are subject to moderation and approval:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Property listings must be accurate and comply with local laws</li>
              <li>All listings require admin approval before being publicly visible</li>
              <li>Listings may be rejected if they violate platform policies or local regulations</li>
              <li>Property owners are responsible for keeping listing information current</li>
              <li>Rejected properties may be resubmitted after addressing rejection reasons</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Payments and Transactions
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If payment features are enabled on the platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-4">
              <li>All transactions are processed securely through approved payment gateways</li>
              <li>Users are responsible for maintaining accurate payment information</li>
              <li>Refund policies are determined by individual service agreements</li>
              <li>The platform may charge service fees as disclosed at the time of transaction</li>
              <li>Disputes should be reported immediately through the platform's support system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Notifications
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The platform uses both email and in-app notifications to keep you informed:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Email notifications are sent for account approvals, property approvals, booking updates, and important system changes</li>
              <li>In-app notifications appear in your notification center for real-time updates</li>
              <li>You can manage notification preferences in your account settings</li>
              <li>Critical notifications (such as account status changes) cannot be disabled</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Account Suspension and Termination
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">7.1 Suspension</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Accounts may be suspended for violations of these terms, fraudulent activity, or failure to comply 
                  with platform policies. Suspended users will receive email notification with the reason for suspension 
                  and steps to resolve the issue.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">7.2 Termination</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We reserve the right to terminate accounts that repeatedly violate terms, engage in illegal activities, 
                  or pose a risk to other users. Terminated accounts lose access to all platform services and data.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">7.3 User-Initiated Termination</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You may request account deletion at any time through your account settings. Upon deletion, your data 
                  will be handled according to our Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Data Collection and Usage
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We collect and use your data as described in our Privacy Policy. By using the platform, you consent to 
              our data practices, including collection of personal information, usage data, and communication records 
              necessary to provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Prohibited Activities
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Users are prohibited from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Providing false or misleading information</li>
              <li>Engaging in fraudulent transactions or activities</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Violating local, state, or federal laws</li>
              <li>Attempting to circumvent platform security or approval processes</li>
              <li>Using automated systems to access the platform without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Rental Connects acts as a platform connecting users and does not guarantee the accuracy of listings, 
              the quality of services, or the outcome of transactions. Users are responsible for their own interactions 
              and transactions. The platform is not liable for disputes between users or losses arising from platform use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Material changes will be communicated via email 
              and in-app notifications. Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-900 dark:text-white font-medium">Rental Connects Support</p>
              <p className="text-gray-700 dark:text-gray-300">Email: support@rentalconnects.com</p>
              <p className="text-gray-700 dark:text-gray-300">Phone: +233-234-567890</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
