import Link from "next/link";
import prisma from "../../prisma";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Image from "next/image";
import Breadcrumbs from "../components/Breadcrumbs"; // импортируем компонент

export default async function PostsPage() {
  // Получаем все посты из базы данных
  const posts = await prisma.posts.findMany();

  return (
    <>
      {/* Шапка сайта */}
      <Header />
      <Breadcrumbs />

      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Все посты</h1>

        {/* Поле поиска для улучшения UX */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Поиск постов..."
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Если постов нет, выводим сообщение */}
        {posts.length === 0 ? (
          <p className="text-gray-600 text-center">
            Нет постов для отображения.
          </p>
        ) : (
          // Используем 4 колонки на больших экранах
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
                <Link
  key={post.id}
  href={`/posts/${post.slug || post.id}`}
  aria-label={`Перейти к посту ${post.name || "Без названия"}`}
  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600"
>
  {/* Обертка для изображения с адаптивностью */}
  {post.image ? (
    <Link href={`/posts/${post.slug || post.id}`}>
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={post.image || "/default-image.jpg"}
          alt={post.name ?? "Default Post Name"}
          fill
          style={{ objectFit: "contain" }}
          className="rounded-lg mb-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </Link>
  ) : (
    <div className="w-full h-48 bg-gray-200 mb-4 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Нет изображения</span>
    </div>
  )}
  <h2 className="text-xl font-semibold text-blue-800 mb-2">
    {post.name || "Без названия"}
  </h2>
  <p className="text-gray-600 mt-2 line-clamp-3">
    {post.description || "Описание отсутствует"}
  </p>
  <div className="mt-4 text-sm text-blue-500 hover:underline">
    Читать далее →
  </div>
</Link>

            ))}
          </div>
        )}
      </main>

      {/* Подвал сайта */}
      <Footer />
    </>
  );
}
