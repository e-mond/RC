import { motion } from "framer-motion";

const news = [
  {
    category: "Housing Tips",
    title: "5 Things to Check Before Renting an Apartment in Accra",
    summary: "Ensure safety, location, and transparency before making any commitment.",
  },
  {
    category: "Tech Update",
    title: "Rental Connects Launches Secure Payment Escrow for Tenants",
    summary: "The platform now guarantees safer transactions between landlords and tenants.",
  },
  {
    category: "Artisan Spotlight",
    title: "Meet Ama, a Plumber Redefining Trust in Maintenance Services",
    summary: "A story of skill, professionalism, and digital opportunity.",
  },
];

export default function NewsFeed() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <h2 className="text-2xl font-bold mb-10 text-center">Rental Connects Insights & Stories</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-sm text-teal-600 font-medium mb-2">{item.category}</p>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.summary}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
