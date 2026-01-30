// src/components/admin/MockDataEditor.jsx (or wherever you keep it)
import { useState } from "react";
import { addMockProperty, addMockBooking, addMockPayment, getMockData } from "@/mocks/mockData";

const tabs = [
  { key: "properties", label: "Properties" },
  { key: "bookings", label: "Bookings" },
  { key: "payments", label: "Payments" },
];

export default function MockDataEditor() {
  const [active, setActive] = useState("properties");
  const [store, setStore] = useState(getMockData());
  const [form, setForm] = useState({
    title: "",
    address: "",
    priceGhs: "",
  });

  const refresh = () => setStore(getMockData());

  const handleAddProperty = (e) => {
    e.preventDefault();
    if (!form.title || !form.address || !form.priceGhs) return;

    addMockProperty({
      title: form.title,
      address: form.address,
      priceGhs: Number(form.priceGhs),
    });

    setForm({ title: "", address: "", priceGhs: "" });
    refresh();
    setActive("properties");
  };

  const handleAddBooking = () => {
    if (store.properties.length === 0) {
      alert("Please add at least one property first!");
      return;
    }

    addMockBooking({
      tenant: "Demo Tenant",
      property: store.properties[0]?.id,
      viewingDate: new Date().toISOString().slice(0, 10),
    });
    refresh();
  };

  const handleAddPayment = () => {
    addMockPayment({
      tenant: "Demo Tenant",
      amount: 1200,
      method: "Card",
    });
    refresh();
  };

  const renderList = () => {
    switch (active) {
      case "properties":
        return (
          <ul className="space-y-3">
            {store.properties.map((property) => (
              <li
                key={property.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900 dark:text-white">{property.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  ₵{property.priceGhs?.toLocaleString()}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-0.5 text-xs uppercase font-medium text-gray-700 dark:text-gray-300">
                  {property.status || "Available"}
                </span>
              </li>
            ))}
          </ul>
        );

      case "bookings":
        return (
          <ul className="space-y-3">
            {store.bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
              >
                <p className="font-semibold text-gray-900 dark:text-white">{booking.tenant}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Viewing: {booking.viewingDate}
                </p>
                <span className="mt-1 inline-flex rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-0.5 text-xs uppercase font-medium text-amber-700 dark:text-amber-300">
                  {booking.status || "Pending"}
                </span>
              </li>
            ))}
          </ul>
        );

      case "payments":
        return (
          <ul className="space-y-3">
            {store.payments.map((payment) => (
              <li
                key={payment.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
              >
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₵{payment.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{payment.tenant}</p>
                <span className="mt-1 inline-flex rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-0.5 text-xs uppercase font-medium text-emerald-700 dark:text-emerald-300">
                  {payment.status || "Completed"}
                </span>
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
      {/* Tabs + Seed buttons */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                active === tab.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleAddBooking}
            className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            + Seed Booking
          </button>
          <button
            type="button"
            onClick={handleAddPayment}
            className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            + Seed Payment
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* List Section */}
        <div className="lg:col-span-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-5 border border-gray-200 dark:border-gray-700">
          {store[active]?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No {active} yet</p>
              <p className="mt-1 text-sm">
                {active === "properties"
                  ? "Add a demo property using the form →"
                  : "Click the seed button above"}
              </p>
            </div>
          ) : (
            renderList()
          )}
        </div>

        {/* Add Property Form */}
        <form
          onSubmit={handleAddProperty}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 shadow-sm"
        >
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-200">
            Add Demo Property
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Title
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Skyline Luxury Apartments"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Address
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Community 11, Tema - Greater Accra"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Price (GHS)
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                value={form.priceGhs}
                onChange={(e) => setForm((prev) => ({ ...prev, priceGhs: e.target.value }))}
                placeholder="4500"
                type="number"
                min="0"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition shadow-sm"
          >
            Save Demo Property
          </button>
        </form>
      </div>
    </section>
  );
}