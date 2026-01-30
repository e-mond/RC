import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, Newspaper, Radio, ArrowLeft } from "lucide-react";
import { blogPosts } from "@/data/posts";
import { sanitizeBlogContentSync } from "@/utils/sanitize";
import AdPlacement from "@/components/ads/AdPlacement";

const IconMap = { newspaper: Newspaper, radio: Radio };

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-center text-xl text-gray-600">Article not found.</p>
        </div>
      </div>
    );
  }

  const Icon = IconMap[post.icon];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Navigation */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-8 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Centered Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">{post.category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
        </header>

        {/* Hero Illustration */}
        <div className="mb-12">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto max-h-[500px] object-contain rounded-lg"
            loading="lazy"
          />
        </div>

        {/* Ad Placement - Top */}
        <div className="mb-8">
          <AdPlacement placement="banner" limit={1} />
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none text-gray-700 mb-12">
          {/* Note: HTML is sanitized using DOMPurify before rendering to prevent XSS attacks. */}
          <div
            dangerouslySetInnerHTML={{ 
              __html: sanitizeBlogContentSync(post.content || '')
            }}
          />
        </article>

        {/* Ad Placement - Middle */}
        <div className="my-12">
          <AdPlacement placement="card" limit={1} />
        </div>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-4">Share this article</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(post.title + " – " + window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Share on WhatsApp
          </a>
        </div>

        {/* Ad Placement - Bottom */}
        <div className="mt-12">
          <AdPlacement placement="banner" limit={1} />
        </div>
      </div>
    </div>
  );
}