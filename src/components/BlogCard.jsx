// src/components/BlogCard.jsx
import { Newspaper, Radio, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const IconMap = { newspaper: Newspaper, radio: Radio };

export default function BlogCard({ post }) {
  const Icon = IconMap[post.icon];

  return (
    <article className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        <div className="flex items-center gap-2 text-teal-600 mb-3">
          <div className="bg-teal-50 p-2 rounded-full">
            <Icon className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors duration-200">
          <Link to={`/blog/${post.slug}`} className="block">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
        </div>
      </div>

      {/* Read more */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/blog/${post.slug}`}
          className="text-teal-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all duration-200"
        >
          Read more
          <span className="text-base">→</span>
        </Link>
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    readTime: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    icon: PropTypes.oneOf(["newspaper", "radio"]).isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};
