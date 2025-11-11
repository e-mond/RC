export default function AdsShowcase() {
  return (
    <section className="py-20 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto text-center px-6">
        <h2 className="text-2xl font-semibold mb-10">Sponsored Partners & Opportunities</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((ad) => (
            <div
              key={ad}
              className="border border-gray-200 bg-gray-50 p-8 rounded-2xl hover:shadow-md transition"
            >
              <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500 text-sm">
                Ad Slot {ad}
              </div>
              <p className="text-gray-600 text-sm">
                Promote your service or property here. Reach verified users directly within the platform.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
