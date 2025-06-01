import React, { useEffect, useState } from 'react';

// Helper to fetch random book covers from Open Library Covers API
const getCoverUrl = (coverId) =>
  coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80';

export default function FeaturedNovelsSection() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: Fetch trending books from Open Library API
    fetch('https://openlibrary.org/subjects/fiction.json?limit=8')
      .then((res) => res.json())
      .then((data) => {
        setNovels(data.works || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-yellow-700 font-semibold">Loading featured novels...</span>
      </div>
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto mt-16 mb-8 px-2">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-yellow-900 mb-8">Trending Novels</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {novels.map((novel) => (
          <div key={novel.key} className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:shadow-2xl transition group">
            <img
              src={getCoverUrl(novel.cover_id)}
              alt={novel.title}
              className="w-32 h-44 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
              loading="lazy"
            />
            <h3 className="text-lg font-semibold mb-1 text-center line-clamp-2">{novel.title}</h3>
            <p className="text-sm text-gray-600 mb-2 text-center line-clamp-1">
              {novel.authors && novel.authors[0]?.name}
            </p>
            <a
              href={`https://openlibrary.org${novel.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-700 hover:underline text-xs"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
