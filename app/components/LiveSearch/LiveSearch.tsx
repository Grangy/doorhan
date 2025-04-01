"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiSearch } from "react-icons/hi";

interface Post2 {
  id: string;
  name: string | null;
  slug?: string | null;
  post?: {
    slug?: string | null;
  };
}

const LiveSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post2[]>([]);
  const [loading, setLoading] = useState(false);

  // Дебаунс для уменьшения количества запросов
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Ошибка получения результатов поиска:", error);
          setLoading(false);
        });
    }, 300); // задержка 300 мс

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
        <input
          type="text"
          placeholder="Поиск..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-white placeholder-white pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
        />
      </div>
      {query && (
        <div className="absolute z-50 w-full mt-2">
          {results.length > 0 ? (
            <div className="relative bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/posts/${item.post?.slug || "default"}/${item.slug || item.id}`}
                  className="flex items-center p-3 border-b last:border-0 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-800">{item.name}</span>
                </Link>
              ))}
              {/* Градиент в нижней части для индикации возможности прокрутки */}
              <div className="pointer-events-none absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-white to-transparent" />
            </div>
          ) : !loading ? (
            <div className="bg-white rounded-lg shadow-lg p-3">
              <span className="text-gray-600">Ничего не найдено</span>
            </div>
          ) : null}
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-3 mt-2">
              <span className="text-gray-600">Загрузка...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveSearch;
