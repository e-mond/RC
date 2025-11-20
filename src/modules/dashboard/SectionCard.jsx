// src/modules/dashboard/SectionCard.jsx
import clsx from "clsx";

export default function SectionCard({
  title,
  description,
  action,
  children,
  className,
  ...props
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl border p-6 shadow-sm transition-all",
        "bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800",
        "ring-1 ring-gray-900/5 dark:ring-gray-700/50",
        className
      )}
      {...props}
    >
      {(title || description || action) && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}