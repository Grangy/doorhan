// app/blogs/page.tsx
import prisma from "../../prisma";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Breadcrumbs from "../components/Breadcrumbs";

export const revalidate = 60; // ISR: обновлять каждые 60 секунд

type BlogItem = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date; // поменяли string → Date
  };  

export default async function BlogsPage() {
  const posts: BlogItem[] = await prisma.blog.findMany({
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true }
  });

  return (
    <>
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Блог</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <time className="text-sm text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
              </time>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}