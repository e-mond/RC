import React from "react";
import clsx from "clsx";

/**
 * Universal Button Component
 * ------------------------------------------------------------
 * - Supports variants: "primary", "outline", "ghost"
 * - Can render as any element (button, link, etc.)
 * - Compatible with Framer Motion or React Router <Link>
 * - Handles disabled and loading states
 * - Fully mobile-responsive (padding, text size, touch targets)
 */

export function Button({
  children,
  variant = "primary",
  as = "button",
  className = "",
  disabled = false,
  loading = false,
  ...props
}) {
  const Component = as;

  const baseStyles = clsx(
    // Core layout & interaction
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-60 disabled:pointer-events-none",

    // Mobile-first responsive sizing
    "px-4 py-2.5",           // Default (mobile)
    "sm:px-5 sm:py-3",       // ≥sm
    "md:px-6 md:py-3.5",     // ≥md
    "text-sm sm:text-base",  // Font scales up on larger screens
    "min-h-[44px]"           // iOS/Android minimum touch target (44px)
  );

  const variantStyles = {
    primary:
      "bg-[#0b6e4f] hover:bg-[#095c42] text-white focus:ring-[#0b6e4f]",
    outline:
      "border border-gray-300 dark:border-gray-600 text-[#0f1724] dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-200 dark:focus:ring-gray-600",
    ghost:
      "text-[#0b6e4f] dark:text-[#0b8d63] bg-transparent hover:bg-[#e6f4ef] dark:hover:bg-gray-800 focus:ring-[#0b6e4f]",
  };

  return (
    <Component
      {...props}
      disabled={disabled || loading}
      className={clsx(baseStyles, variantStyles[variant], className)}
    >
      {/* Loading spinner */}
      {loading && (
        <span
          className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </Component>
  );
}

/**
 * Convenience Wrappers
 */
export const PrimaryButton = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <Button variant="outline" {...props} />
);

export default Button;