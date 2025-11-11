export default function ProgressIndicator({ step = 1, label = "Choose your role" }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-3 h-3 bg-[#0b6e4f] rounded-full"></div>
      <p className="text-[#0b6e4f] text-sm font-medium">
        Step {step} of 3 · {label}
      </p>
    </div>
  );
}
