import { notFound } from "next/navigation";
import prisma from "../../../../../prisma";
import Header from "../../../../components/Header/Header";
import Footer from "../../../../components/Footer/Footer";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";


type PageProps = {
  params: Promise<{
    postId: string;
    post2Id: string;
  }>;
};
type Spec = {
  name: string;
  value: string | number;
  unit?: string;
};

function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

type tParams = Promise<{ post2Id: string }>;

export async function generateMetadata({ params }: { params: tParams }) {
  const { post2Id } = await params; // Ожидаем данных из params как промис

  try {
    const whereCondition = isValidObjectId(post2Id)
      ? { id: post2Id }
      : { slug: post2Id };

    const post2 = await prisma.posts2.findFirst({
      where: whereCondition,
    });

    if (!post2) return {};

    return {
      title: post2.name || "Пост без названия",
      description: post2.description || "Описание отсутствует",
      openGraph: {
        images: post2.image ? [{ url: post2.image }] : [],
      },
    };
  } catch (error) {
    console.error("Ошибка при генерации метаданных:", error);
    return {};
  }
}

export default async function Post2DetailPage({ params }: PageProps) {
  // Await params before accessing postId and post2Id
  const { post2Id } = await params;

  // Fetching data with async/await
  const post2 = await prisma.posts2.findUnique({
    where: { id: post2Id },
    include: { post: true },
  });

  // If no post2 is found, return a 404 page
  if (!post2) return notFound();

  return (
    <>
      {/* 1. Шапка сайта */}
      <Header />

      <main className="container mx-auto p-4 pt-16">
        {/* 2. Кнопка «Назад к посту» с иконкой и улучшенными состояниями фокуса */}
        {post2.post && (
          <Link
            href={`/posts/${post2.post.id}`}
            className="inline-flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-300 ease-in-out px-3 py-2 mb-4 md:mb-6 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-sm hover:shadow-md active:scale-95"
            aria-label="Вернуться к посту"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 transform transition-transform duration-300 hover:-translate-x-1"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden md:inline">Назад к посту</span>
          </Link>
        )}

        {/* 3. Основной контент оформленный как карточка */}
        <article className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          {/* 4. Адаптивное изображение с Next.js Image */}
          {post2.image && (
            <div className="relative mb-8 group overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 h-[60vh]">
              <Image
                src={post2.image}
                alt={post2.name || "Изображение поста"}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain hover:object-scale-down transition-all duration-300"
                quality={80}
                priority={false}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          {/* 6. Заголовок поста с улучшенной типографикой */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {post2.name || "Posts2 без названия"}
          </h1>

          {/* 7. Описание с удобочитаемым форматированием */}
          {post2.description && (
  <div
    className="text-gray-700 text-lg leading-relaxed mb-8 prose max-w-none"
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post2.description) }}
  />
)}
          {post2.specs &&
            Array.isArray(post2.specs) &&
            post2.specs.length > 0 && (
              <section className="mt-8 border-t pt-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Технические характеристики
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {post2.specs
                    .filter(
                      (spec): spec is Spec =>
                        typeof spec === "object" &&
                        spec !== null &&
                        "name" in spec &&
                        "value" in spec
                    )
                    .map((spec, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-600 font-medium">
                          {spec.name}
                        </span>
                        <span className="text-gray-800 text-right">
                          {spec.value}
                          {spec.unit && (
                            <span className="text-gray-500 ml-1">
                              ({spec.unit})
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}

          {/* 8. Секция родительского поста */}
          {post2.post && (
            <section className="mt-8 border-t pt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Родительский пост
              </h2>
              <Link
                href={`/posts/${post2.post.id}`}
                className="inline-flex items-center text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-300"
                aria-label={`Перейти к родительскому посту: ${
                  post2.post.name || "Без названия"
                }`}
              >
                {/* 9. Иконка для родительского поста */}
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
                {post2.post.name || "Без названия"}
              </Link>
            </section>
          )}
        </article>
      </main>

      {/* 10. Подвал сайта */}
      <Footer />
    </>
  );
}
