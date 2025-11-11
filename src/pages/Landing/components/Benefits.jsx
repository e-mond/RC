export default function Benefits() {
  return (
    <section
      id="benefits"
      className=" bg-sectionBg  py-20 px-6 md:px-12 lg:px-24 text-center"
    >
      {/* === HEADER === */}
      <div className="max-w-3xl mx-auto mb-16">
         <h4 className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide">Benefits</h4>
              <h2 className="text-3xl md:text-4xl  font-bold text-[#0f1724] mb-4 leading-snug">
          Designed for tenants, landlords, <br /> and service providers
        </h2>
        <p className="text-gray-600 text-base">
          Empowering every participant in Ghana’s rental ecosystem.
        </p>
      </div>

      {/* === BENEFIT CARDS === */}
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {/* Secure rental search */}
        <div className="bg-[#f5f0f0] rounded-2xl shadow-sm hover:shadow-md transition p-6">
          <img
            src="/images/secure-rental.jpg"
            alt="Secure rental search"
            className="w-full h-48 object-cover rounded-xl mb-6"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Secure rental search
          </h3>
          <p className="text-gray-600 text-sm">
            Find verified properties with comprehensive background checks.
          </p>
        </div>

        {/* Easy payment solutions */}
        <div className="bg-[#f5f0f0] rounded-2xl shadow-sm hover:shadow-md transition p-6">
          <img
            src="/images/easy-payment.jpg"
            alt="Easy payment solutions"
            className="w-full h-48 object-cover rounded-xl mb-6"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Easy payment solutions
          </h3>
          <p className="text-gray-600 text-sm">
            Digital transactions with transparent fee structures.
          </p>
        </div>

        {/* Artisan network */}
        <div className="bg-[#f5f0f0] rounded-2xl shadow-sm hover:shadow-md transition p-6">
          <img
            src="/images/artisan-network.jpg"
            alt="Artisan network"
            className="w-full h-48 object-cover rounded-xl mb-6"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Artisan network
          </h3>
          <p className="text-gray-600 text-sm">
            Access trusted maintenance professionals for property needs.
          </p>
        </div>
      </div>

      {/* === CTA BUTTONS === */}
      <div className="mt-12 flex justify-center gap-4">
        <button className="px-6 py-3 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition">
          Join now
        </button>
        <button className="px-6 py-3 border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition flex items-center gap-2">
          Learn more <span className="text-lg">→</span>
        </button>
      </div>
    </section>
  );
}
