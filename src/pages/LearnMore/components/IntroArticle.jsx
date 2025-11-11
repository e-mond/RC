import { motion } from "framer-motion";
import articleImg from "@/assets/images/community.jpg";

export default function IntroArticle() {
  return (
    <section className="max-w-6xl mx-auto py-20 px-6 md:px-10 grid md:grid-cols-2 gap-10 items-center">
      <motion.img
        src={articleImg}
        alt="Ghanaian community"
        className="rounded-2xl shadow-md object-cover w-full h-96"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      />

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-[#0f1724]">
          A Platform Built for Everyday Ghanaians
        </h2>
        <p className="text-gray-600 mb-4">
          Rental Connects was born from the need to simplify the housing and service industry —
          where communication gaps, scams, and inefficiencies made renting stressful.
        </p>
        <blockquote className="italic text-teal-700 font-medium border-l-4 border-teal-500 pl-4 my-4">
          “We’re not just a rental platform — we’re building a verified network of trust.”
        </blockquote>
        <p className="text-gray-600">
          Our mission is simple: connect people, empower transparency, and create a digital home
          for Ghana’s rental and artisan communities.
        </p>
      </motion.div>
    </section>
  );
}
