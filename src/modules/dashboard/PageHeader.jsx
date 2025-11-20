// src/modules/dashboard/PageHeader.jsx
import clsx from "clsx";

export default function PageHeader({ title, subtitle, badge, actions, align = "start" }) {
  return (
    <header
      className={clsx("flex flex-col gap-3 sm:flex-row sm:items-center", {
        "sm:justify-between": align === "between",
        "sm:justify-start": align === "start",
      })}
    >
      <div>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
            {badge}
          </span>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

