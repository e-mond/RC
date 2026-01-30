/**
 * DocumentationSidebar Component
 * 
 * Reusable sidebar for documentation categories
 */

export default function DocumentationSidebar({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
          Categories
        </h2>
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeCategory === category.id
                    ? "bg-[#0b6e4f] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{category.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
