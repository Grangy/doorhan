// app/blogs/[slug]/page.tsx
import prisma from "../../../prisma";
import { notFound } from "next/navigation";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Breadcrumbs from "../../components/Breadcrumbs";
import Link from "next/link";

// Define the params type as a Promise
type Params = { slug: string };

// Use Next.js PageProps or define explicitly
interface BlogDetailPageProps {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const resolvedParams = await params; // Resolve the Promise
  const post = await prisma.blog.findUnique({
    where: { slug: resolvedParams.slug },
    select: { title: true, excerpt: true },
  });
  if (!post) return { title: "Не найдено" };
  return { title: post.title, description: post.excerpt || undefined };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params; // Resolve the Promise
  const post = await prisma.blog.findUnique({
    where: { slug: resolvedParams.slug },
  });
  if (!post) return notFound();

  // Ищем следующую статью по дате
  const nextPost = await prisma.blog.findFirst({
    where: { publishedAt: { gt: post.publishedAt } },
    orderBy: { publishedAt: "asc" },
    select: { title: true, slug: true },
  });

  return (
    <>
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto p-4 mt-14">
        <article className="prose lg:prose-xl mx-auto">
          <h1>{post.title}</h1>
          <time dateTime={post.publishedAt.toISOString()}>
            {new Date(post.publishedAt).toLocaleDateString("ru-RU")}
          </time>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {nextPost && (
          <div className="mt-12 text-right">
            <Link
              href={`/blogs/${nextPost.slug}`}
              className="text-blue-600 hover:underline"
            >
              Следующая статья: {nextPost.title} →
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}