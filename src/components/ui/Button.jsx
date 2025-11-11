import React from "react";
import clsx from "clsx";

/**
 * Universal Button Component
 * ------------------------------------------------------------
 * - Supports variants: "primary", "outline", "ghost"
 * - Can render as any element (button, link, etc.)
 * - Compatible with Framer Motion or React Router <Link>
 * - Handles disabled and loading states
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
  // Resolve the element type dynamically (e.g., 'button', 'a', Link, etc.)
  const Component = as;

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 " +
    "disabled:opacity-60 disabled:pointer-events-none";

  const variantStyles = {
    primary:
      "bg-[#0b]6e4f hover:bg-[#095c42] text-white focus:ring-[#0b6e4f]",
    outline:
      "border border-gray-300 text-[#0f1724] bg-white hover:bg-gray-50 focus:ring-gray-200",
    ghost:
      "text-[#0b6e4f] bg-transparent hover:bg-[#e6f4ef] focus:ring-[#0b6e4f]",
  };

  return (
    <Component
      {...props}
      disabled={disabled || loading}
      className={clsx(baseStyles, variantStyles[variant], className)}
    >
      {/* Optional loading spinner */}
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
 * ------------------------------------------------------------
 * Maintain backward compatibility with existing codebase.
 */
export const PrimaryButton = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <Button variant="outline" {...props} />
);

export default Button;
