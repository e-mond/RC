import Layout from "../components/Layout";
import BlogCard from "../components/BlogCard";
import { blogPosts } from "../data/posts";

export default function Blog() {
  return (
    <Layout title="Ghana Living Blog" backLabel="Home">
      <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-12">
        Insights, updates, and stories from the heart of modern Ghanaian living.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-gray-600 mb-4">Want to stay updated?</p>
        <a
          href="mailto:hello@ghanaliving.com"
          className="inline-block bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-all shadow-md"
        >
          Subscribe via Email
        </a>
      </div>
    </Layout>
  );
}