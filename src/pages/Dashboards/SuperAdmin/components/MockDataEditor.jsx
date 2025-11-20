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
              <li key={property.id} className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900">{property.title}</p>
                <p className="text-sm text-gray-500">{property.address}</p>
                <p className="text-sm text-gray-600">₵{property.priceGhs?.toLocaleString()}</p>
                <span className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-0.5 text-xs uppercase text-gray-600">
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
              <li key={booking.id} className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900">{booking.tenant}</p>
                <p className="text-sm text-gray-500">Viewing: {booking.viewingDate}</p>
                <span className="text-xs uppercase text-amber-600">{booking.status}</span>
              </li>
            ))}
          </ul>
        );
      case "payments":
        return (
          <ul className="space-y-3">
            {store.payments.map((payment) => (
              <li key={payment.id} className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900">₵{payment.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{payment.tenant}</p>
                <span className="text-xs uppercase text-emerald-600">{payment.status}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              active === tab.key ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleAddBooking}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
          >
            Seed Booking
          </button>
          <button
            type="button"
            onClick={handleAddPayment}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
          >
            Seed Payment
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">{renderList()}</div>
        <form onSubmit={handleAddProperty} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Add Demo Property</p>
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Title</label>
          <input
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Skyline Apartments"
          />
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Address</label>
          <input
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Tema Community 11"
          />
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Price (GHS)</label>
          <input
            className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.priceGhs}
            onChange={(e) => setForm((prev) => ({ ...prev, priceGhs: e.target.value }))}
            placeholder="4500"
            type="number"
            min="0"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Save Property
          </button>
        </form>
      </div>
    </section>
  );
}

