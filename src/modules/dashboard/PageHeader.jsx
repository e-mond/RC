// src/modules/dashboard/PageHeader.jsx
import clsx from "clsx";

export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  align = "start", // "start" | "between" | "center"
}) {
  return (
    <header
      className={clsx(
        "flex flex-col gap-4 sm:flex-row sm:items-start lg:items-center",
        {
          "sm:justify-between": align === "between",
          "sm:justify-start": align === "start",
          "sm:justify-center": align === "center",
        }
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          {badge && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm">
              {badge}
            </span>
          )}
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3 sm:ml-6 sm:mt-0">
          {actions}
        </div>
      )}
    </header>
  );
}