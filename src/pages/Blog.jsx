import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/data/posts";

export default function Blog() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-8 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Centered Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            RentalConnects Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Insights, updates, and stories from the heart of modern Ghanaian living.
          </p>
        </header>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Want to stay updated?</p>
          <a
            href="mailto:hello@rentalconnects.com"
            className="inline-block bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-all shadow-md"
          >
            Subscribe via Email
          </a>
        </div>
      </div>
    </div>
  );
}
