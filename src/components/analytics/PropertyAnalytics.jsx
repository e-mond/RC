// src/components/analytics/PropertyAnalytics.jsx
import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/**
 * PropertyAnalytics
 * - Lightweight chart for properties list
 * - Accepts properties array (mock or real)
 * - Derives simple metrics: counts by status, price buckets, simple timeseries by createdAt
 *
 * NOTE: This is intentionally simple — swap data input with real analytics endpoint later.
 */
export default function PropertyAnalytics({ properties = [] }) {
  const summary = useMemo(() => {
    const statusCount = properties.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    const priceAvg = properties.length ? Math.round(properties.reduce((s, p) => s + (Number(p.price) || 0), 0) / properties.length) : 0;

    // timeseries by date (group by day)
    const times = {};
    properties.forEach((p) => {
      const day = p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "unknown";
      times[day] = (times[day] || 0) + 1;
    });

    const timeseries = Object.entries(times)
      .map(([day, count]) => ({ date: day, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { statusCount, priceAvg, timeseries };
  }, [properties]);

  const chartData = summary.timeseries.length
    ? summary.timeseries
    : [{ date: new Date().toISOString().slice(0, 10), count: 0 }];

  return (
    <section className="p-6 bg-white rounded-2xl shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Properties Overview</h3>
        <div className="text-sm text-gray-600">Avg price: ₵{summary.priceAvg.toLocaleString()}</div>
      </header>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b6e4f" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0b6e4f" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0b6e4f" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Status</div>
            <div className="mt-2 flex flex-col gap-1">
              {Object.entries(summary.statusCount).length === 0 ? (
                <div className="text-sm text-gray-600">No properties</div>
              ) : (
                Object.entries(summary.statusCount).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <div className="capitalize text-sm">{k}</div>
                    <div className="text-sm font-medium">{v}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Quick Stats</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <div>Total</div>
                <div className="font-medium">{properties.length}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>Avg Price</div>
                <div className="font-medium">₵{summary.priceAvg.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
