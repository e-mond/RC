// src/components/ui/Card.jsx
import * as React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

/**
 * Main Card – Custom animated card component with dark mode support
 */
export const Card = React.forwardRef(
  (
    {
      className,
      imageSrc,
      imageAlt,
      title,
      description,
      hoverLift = true,
      index = 0,
      variants,
      children,
      ...props
    },
    ref
  ) => {
    const defaultVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: index * 0.12, ease: "easeOut" },
      },
    };

    const motionProps = {
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, margin: "-80px" },
      variants: variants ?? defaultVariants,
    };

    return (
      <motion.div
        ref={ref}
        className={clsx(
          // Base styles + dark mode support
          "bg-white dark:bg-gray-900",
          "text-gray-900 dark:text-gray-100",
          "shadow-sm dark:shadow-none",
          "border border-gray-100 dark:border-gray-800",
          "rounded-2xl overflow-hidden transition-all duration-300",
          hoverLift && "hover:shadow-lg hover:-translate-y-1 hover:shadow-gray-200/50 dark:hover:shadow-black/30",
          "p-5 sm:p-6",
          className
        )}
        whileHover={hoverLift ? { y: -4 } : undefined}
        {...motionProps}
        {...props}
      >
        {imageSrc && (
          <div className="mb-5 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6">
            <img
              src={imageSrc}
              alt={imageAlt ?? title ?? "Card image"}
              className="w-full h-48 object-cover rounded-t-2xl"
              loading="lazy"
            />
          </div>
        )}

        <div className={imageSrc ? "pt-2" : ""}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}

          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          )}

          {children && <div className="mt-4">{children}</div>}
        </div>
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// ────────────────────────────────────────────────
// Shadcn-style sub-components (dark mode ready)
// ────────────────────────────────────────────────

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={clsx(
        "flex flex-col space-y-1.5 p-6",
        "text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={clsx(
        "text-2xl font-semibold leading-none tracking-tight",
        "text-gray-900 dark:text-white",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={clsx(
        "p-6 pt-0",
        "text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  );
}