// src/pages/Admin/MockDataEditor.jsx (or wherever it's located)
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
    addMockProperty({ title: form.title, address: form.address, priceGhs: Number(form.priceGhs) });
    setForm({ title: "", address: "", priceGhs: "" });
    refresh();
    setActive("properties");
  };

  const handleAddBooking = () => {
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
              <li key={property.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                <p className="font-semibold text-gray-900 dark:text-white">{property.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{property.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">₵{property.priceGhs?.toLocaleString()}</p>
                <span className="mt-2 inline-flex rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-0.5 text-xs uppercase text-gray-600 dark:text-gray-300">
                  {property.status}
                </span>
              </li>
            ))}
          </ul>
        );
      case "bookings":
        return (
          <ul className="space-y-3">
            {store.bookings.map((booking) => (
              <li key={booking.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                <p className="font-semibold text-gray-900 dark:text-white">{booking.tenant}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Viewing: {booking.viewingDate}</p>
                <span className="text-xs uppercase text-amber-600 dark:text-amber-400">{booking.status}</span>
              </li>
            ))}
          </ul>
        );
      case "payments":
        return (
          <ul className="space-y-3">
            {store.payments.map((payment) => (
              <li key={payment.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                <p className="font-semibold text-gray-900 dark:text-white">₵{payment.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{payment.tenant}</p>
                <span className="text-xs uppercase text-emerald-600 dark:text-emerald-400">{payment.status}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === tab.key
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
            className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Seed Booking
          </button>
          <button
            type="button"
            onClick={handleAddPayment}
            className="rounded-full border border-gray-300 dark:border-gray-600 px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Seed Payment
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {renderList()}
        </div>

        <form onSubmit={handleAddProperty} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-5">
          <p className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Add Demo Property</p>
          
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Title</label>
          <input
            className="mb-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Skyline Apartments"
          />
          
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Address</label>
          <input
            className="mb-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Tema Community 11"
          />
          
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Price (GHS)</label>
          <input
            className="mb-6 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={form.priceGhs}
            onChange={(e) => setForm((prev) => ({ ...prev, priceGhs: e.target.value }))}
            placeholder="4500"
            type="number"
            min="0"
          />
          
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Save Property
          </button>
        </form>
      </div>
    </section>
  );
}