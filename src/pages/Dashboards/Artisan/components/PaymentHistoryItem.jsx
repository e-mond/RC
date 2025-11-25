import { Download } from "lucide-react";

export default function PaymentHistoryItem({ earning, onGenerateInvoice }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white truncate">
          {earning.taskTitle || "Completed Task"}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-nowrap">
          {earning.date
            ? new Date(earning.date).toLocaleDateString("en-GH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Date not available"}
        </p>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-3xl font-extrabold text-[#0b6e4f] whitespace-nowrap">
            ₵{earning.amount?.toLocaleString() || "0"}
          </p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mt-1 whitespace-nowrap">
            {earning.status || "Paid"}
          </p>
        </div>
        <button
          onClick={() => onGenerateInvoice(earning.taskId || earning.id)}
          className="px-6 py-3 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
        >
          <Download size={18} />
          Invoice
        </button>
      </div>
    </div>
  );
}