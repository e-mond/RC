<<<<<<< HEAD
export const Card = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};
=======
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

/**
 * Card – reusable UI component (JSX only)
 * -------------------------------------------------
 * • Responsive padding
 * • Optional top image
 * • Hover lift + shadow
 * • Staggered entry animation
 * • Works with any Tailwind className
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
    // Default stagger animation (override with `variants` prop)
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
          "bg-white rounded-2xl shadow-sm overflow-hidden transition-all",
          hoverLift && "hover:shadow-lg hover:-translate-y-1",
          "p-5 sm:p-6",
          className
        )}
        whileHover={hoverLift ? { y: -4 } : undefined}
        {...motionProps}
        {...props}
      >
        {/* Image */}
        {imageSrc && (
          <div className="mb-5 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6">
            <img
              src={imageSrc}
              alt={imageAlt ?? ""}
              className="w-full h-48 object-cover rounded-t-2xl"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className={imageSrc ? "pt-2" : ""}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </motion.div>
    );
  }
);

Card.displayName = "Card";
>>>>>>> 75124c513b7ca91c6a3a70f4551f537cdfac00d8
