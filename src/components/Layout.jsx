import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Reusable page layout with back button and title
 */
export default function Layout({ children, title, backTo = "/", backLabel = "Home" }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d6f3f0]/30 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Navigation */}
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-8 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {backLabel}
        </Link>

        {/* Page Title */}
        {title && (
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center md:text-left">
            {title}
          </h1>
        )}

        {/* Content */}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  backTo: PropTypes.string,
  backLabel: PropTypes.string,
};