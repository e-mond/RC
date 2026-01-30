/**
 * Legal Content for Terms & Privacy Modals
 * 
 * This file contains the content for Terms of Service and Privacy Policy
 * displayed in modals during signup.
 */

export const getTermsContent = () => {
  return (
    <div className="space-y-6 text-gray-700">
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
        <p className="leading-relaxed">
          By accessing and using Rental Connects ("the Platform"), you accept and agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our services. These terms apply to all users, including tenants, 
          landlords, artisans, administrators, and super administrators.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">2. User Roles and Responsibilities</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">2.1 Tenants</h4>
            <p className="leading-relaxed text-sm">
              Tenants are responsible for providing accurate personal information, maintaining account security, 
              and complying with rental agreements. Tenants must verify their identity and may be subject to background checks.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">2.2 Landlords</h4>
            <p className="leading-relaxed text-sm">
              Landlords must provide accurate property information, maintain property listings, and comply with local 
              rental laws. All property listings are subject to admin approval before being published. Landlords are 
              responsible for property verification and documentation.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">2.3 Artisans</h4>
            <p className="leading-relaxed text-sm">
              Artisans must provide accurate professional information, certifications, and service details. 
              All artisan accounts require admin approval before services can be offered. Artisans are responsible 
              for maintaining professional standards and completing services as described.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Account Approval Workflow</h3>
        <p className="leading-relaxed mb-3">
          All new user accounts (except tenants) require administrative approval before full platform access is granted:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li>Upon signup, your account enters a "pending approval" state</li>
          <li>You will receive email notifications regarding your approval status</li>
          <li>Login is restricted until your account is approved by an administrator</li>
          <li>Approval decisions are typically made within 24-48 hours</li>
          <li>If rejected, you will receive a reason and may reapply after addressing the issues</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Property Listings and Moderation</h3>
        <p className="leading-relaxed mb-3">
          All property listings are subject to moderation and approval:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li>Property listings must be accurate and comply with local laws</li>
          <li>All listings require admin approval before being publicly visible</li>
          <li>Listings may be rejected if they violate platform policies or local regulations</li>
          <li>Property owners are responsible for keeping listing information current</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Payments and Transactions</h3>
        <p className="leading-relaxed mb-3">
          If payment features are enabled on the platform:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li>All transactions are processed securely through approved payment gateways</li>
          <li>Users are responsible for maintaining accurate payment information</li>
          <li>Refund policies are determined by individual service agreements</li>
          <li>The platform may charge service fees as disclosed at the time of transaction</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Notifications</h3>
        <p className="leading-relaxed mb-3">
          The platform uses both email and in-app notifications to keep you informed:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li>Email notifications are sent for account approvals, property approvals, booking updates, and important system changes</li>
          <li>In-app notifications appear in your notification center for real-time updates</li>
          <li>You can manage notification preferences in your account settings</li>
          <li>Critical notifications (such as account status changes) cannot be disabled</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Account Suspension and Termination</h3>
        <p className="leading-relaxed mb-3">
          Accounts may be suspended for violations of these terms, fraudulent activity, or failure to comply 
          with platform policies. Suspended users will receive email notification with the reason for suspension 
          and steps to resolve the issue.
        </p>
        <p className="leading-relaxed text-sm">
          We reserve the right to terminate accounts that repeatedly violate terms, engage in illegal activities, 
          or pose a risk to other users. Terminated accounts lose access to all platform services and data.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Prohibited Activities</h3>
        <p className="leading-relaxed mb-3">
          Users are prohibited from:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li>Providing false or misleading information</li>
          <li>Engaging in fraudulent transactions or activities</li>
          <li>Harassing, threatening, or abusing other users</li>
          <li>Violating local, state, or federal laws</li>
          <li>Attempting to circumvent platform security or approval processes</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h3>
        <p className="leading-relaxed">
          Rental Connects acts as a platform connecting users and does not guarantee the accuracy of listings, 
          the quality of services, or the outcome of transactions. Users are responsible for their own interactions 
          and transactions. The platform is not liable for disputes between users or losses arising from platform use.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Information</h3>
        <p className="leading-relaxed">
          For questions about these Terms of Service, please contact us at support@rentalconnects.com or call +233-234-567890.
        </p>
      </section>
    </div>
  );
};

export const getPrivacyContent = () => {
  return (
    <div className="space-y-6 text-gray-700">
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h3>
        <p className="leading-relaxed">
          Rental Connects ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
          explains how we collect, use, disclose, and safeguard your information when you use our platform. 
          By using Rental Connects, you consent to the data practices described in this policy.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">2.1 Personal Information</h4>
            <p className="leading-relaxed text-sm">
              We collect personal information that you provide directly, including full name, email address, phone number, 
              identity verification documents, business registration documents (for landlords), professional certifications 
              (for artisans), profile pictures, and payment information (processed securely through third-party providers).
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">2.2 Property and Service Information</h4>
            <p className="leading-relaxed text-sm">
              For landlords and artisans, we collect property listings, service descriptions, pricing information, 
              location data, and related documentation necessary to provide platform services.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">2.3 Usage Data</h4>
            <p className="leading-relaxed text-sm">
              We automatically collect information about how you interact with the platform, including pages visited, 
              features used, search queries, device information, IP address, browser type, and access times.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h3>
        <p className="leading-relaxed mb-3">
          We use collected information for the following purposes:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li><strong>Account Management:</strong> Creating and managing user accounts, verifying identities, and processing approvals</li>
          <li><strong>Service Delivery:</strong> Facilitating property listings, bookings, payments, and communication between users</li>
          <li><strong>Notifications:</strong> Sending email and in-app notifications about account status, approvals, bookings, and platform updates</li>
          <li><strong>Security:</strong> Detecting and preventing fraud, unauthorized access, and other security threats</li>
          <li><strong>Platform Improvement:</strong> Analyzing usage patterns to improve user experience and develop new features</li>
          <li><strong>Legal Compliance:</strong> Meeting legal obligations, responding to legal requests, and enforcing our terms</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing and Disclosure</h3>
        <p className="leading-relaxed mb-3">
          We share data with trusted third-party service providers who assist with payment processing, email delivery, 
          cloud storage, analytics, and other platform operations. These providers are contractually obligated to protect your data.
        </p>
        <p className="leading-relaxed text-sm">
          We may disclose information when required by law, court order, or government request, or to protect 
          the rights, property, or safety of Rental Connects, our users, or others.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h3>
        <p className="leading-relaxed mb-3">
          We implement industry-standard security measures to protect your information:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication and access controls</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Limited access to personal data on a need-to-know basis</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights and Choices</h3>
        <p className="leading-relaxed mb-3">
          You have the following rights regarding your personal information:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li><strong>Access:</strong> Request access to your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
          <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
          <li><strong>Opt-Out:</strong> Manage email and notification preferences</li>
        </ul>
        <p className="leading-relaxed text-sm mt-3">
          To exercise these rights, contact us at privacy@rentalconnects.com or through your account settings.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking Technologies</h3>
        <p className="leading-relaxed">
          We use cookies, web beacons, and similar technologies to enhance user experience, analyze platform usage, 
          and deliver personalized content. You can control cookie preferences through your browser settings, though 
          disabling cookies may limit some platform functionality.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h3>
        <p className="leading-relaxed">
          Rental Connects is not intended for users under the age of 18. We do not knowingly collect personal 
          information from children. If we become aware that we have collected information from a child, we will 
          take steps to delete such information promptly.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Privacy Policy</h3>
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time. Material changes will be communicated via email and 
          in-app notifications. The "Last updated" date indicates when changes were last made. Continued use of the 
          platform after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h3>
        <p className="leading-relaxed">
          For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
        </p>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium text-gray-900">Rental Connects Privacy Team</p>
          <p className="text-gray-700">Email: privacy@rentalconnects.com</p>
          <p className="text-gray-700">Support: support@rentalconnects.com</p>
          <p className="text-gray-700">Phone: +233-234-567890</p>
        </div>
      </section>
    </div>
  );
};
