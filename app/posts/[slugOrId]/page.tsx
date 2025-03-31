import { notFound } from "next/navigation";
import prisma from "../../../prisma";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Breadcrumbs from "../../components/Breadcrumbs"; // импортируем


function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

type tParams = Promise<{ slugOrId: string }>;

export async function generateMetadata({ params }: { params: tParams }) {
  const { slugOrId } = await params; // Ожидаем данных из params как промис

  try {
    const whereCondition = isValidObjectId(slugOrId)
      ? { id: slugOrId }
      : { slug: slugOrId };

    const post = await prisma.posts.findFirst({
      where: whereCondition,
    });

    if (!post) return {};

    return {
      title: post.name || "Пост без названия",
      description: post.description || "Описание отсутствует",
      openGraph: {
        images: post.image ? [{ url: post.image }] : [],
      },
    };
  } catch (error) {
    console.error("Ошибка при генерации метаданных:", error);
    return {};
  }
}

// Страница поста
export default async function PostDetailPage({ params }: { params: tParams }) {
  const { slugOrId } = await params; // Ожидаем данные из params как промис

  try {
    const whereCondition = isValidObjectId(slugOrId)
      ? { id: slugOrId }
      : { slug: slugOrId };

    const post = await prisma.posts.findFirst({
      where: whereCondition,
      include: { posts2: true },
    });

    if (!post) return notFound();

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Breadcrumbs />

        <main className="container mx-auto p-4 flex-1 pt-20">
          <article className="max-w-4xl mx-auto">
            {post.image && (
              <div className="relative mb-8 overflow-hidden rounded-2xl shadow-xl transition-shadow duration-300 h-[60vh] cursor-pointer">
                <Image
                  src={`${post.image}?t=${Date.now()}`}
                  alt={post.name || "Изображение поста"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                />
              </div>
            )}

            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-4">
                {post.name || "Без названия"}
              </h1>
            </header>

            {post.description && (
              <section className="prose max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: post.description }} />
              </section>
            )}

            {post.posts2.length > 0 && (
              <section aria-labelledby="related-posts-heading">
                <h2
                  id="related-posts-heading"
                  className="text-2xl font-semibold mb-4"
                >
                  Каталог
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {post.posts2.map((post2) => (
                    <div
                      key={post2.id}
                      className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {post2.image && (
                        <Link
                          href={`/posts/${slugOrId}$/{
                            post2.slug || post2.id
                          }`}
                        >
                          <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                            <Image
                              src={`${post2.image}?t=${Date.now()}`}
                              alt={post2.name || "Изображение связанного поста"}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 30vw"
                            />
                          </div>
                        </Link>
                      )}
                      <Link
                        href={`/posts/${slugOrId}/${
                          post2.slug || post2.id
                        }`}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {post2.name}
                        </h3>
                      </Link>

                      {post2.description && (
                        <div
                          className="text-gray-600 line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: post2.description,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Ошибка загрузки поста:", error);
    return notFound();
  }
}
