import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, Newspaper, Radio } from "lucide-react";
import { blogPosts } from "../data/posts";
import Layout from "../components/Layout";

const IconMap = { newspaper: Newspaper, radio: Radio };

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <Layout title="Not Found">
        <p className="text-center text-xl text-gray-600">Article not found.</p>
      </Layout>
    );
  }

  const Icon = IconMap[post.icon];

  return (
    <Layout title={post.title} backTo="/blog" backLabel="Blog">
      <article className="max-w-4xl mx-auto">
        {/* Hero Image */}
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-96 object-cover rounded-2xl shadow-lg mb-10"
          loading="lazy"
        />

        {/* Meta */}
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-teal-600" />
            <span className="font-medium">{post.category}</span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-center gap-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(post.title + " – " + window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700"
          >
            Share on WhatsApp
          </a>
        </div>
      </article>
    </Layout>
  );
}