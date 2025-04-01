// app/components/LiveSearch/LiveSearch.tsx
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
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-white pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {query && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white shadow-lg rounded-lg mt-2 max-h-60 overflow-y-auto">
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/posts/${item.post?.slug || "default"}/${item.slug || item.id}`}
              className="flex items-center p-2 hover:bg-gray-100"
            >
              <span className="text-gray-800">{item.name}</span>
            </Link>
          ))}
        </div>
      )}
      {query && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full bg-white shadow-lg rounded-lg mt-2 p-2">
          <span className="text-gray-600">Ничего не найдено</span>
        </div>
      )}
      {loading && (
        <div className="absolute z-50 w-full bg-white shadow-lg rounded-lg mt-2 p-2">
          <span className="text-gray-600">Загрузка...</span>
        </div>
      )}
    </div>
  );
};

export default LiveSearch;
