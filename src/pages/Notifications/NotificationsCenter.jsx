import { BellRing, CheckCircle, Clock } from "lucide-react";

const demoNotifications = [
  {
    id: "ntf-1",
    title: "New maintenance request",
    body: "Kwame reported a leaking sink in East Legon property.",
    status: "unread",
    createdAt: "2 min ago",
  },
  {
    id: "ntf-2",
    title: "Booking approved",
    body: "Viewing for Skyline Apartments has been approved.",
    status: "read",
    createdAt: "1 hr ago",
  },
  {
    id: "ntf-3",
    title: "Payment received",
    body: "Rent payment from Ama Boateng (₵3,200).",
    status: "read",
    createdAt: "yesterday",
  },
];

export default function NotificationsCenter() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <BellRing className="h-6 w-6 text-[#0b6e4f]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Stay on top of approvals, bookings, and payments.</p>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {demoNotifications.map((notification) => (
            <article key={notification.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notification.body}</p>
                </div>
                {notification.status === "read" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">{notification.createdAt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

