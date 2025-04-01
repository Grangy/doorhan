import { NextResponse } from 'next/server';
import prisma from '../../prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://doorhan-crimea.com';

  // Статические страницы
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // Получаем все посты из базы данных
  const posts = await prisma.posts.findMany({
    select: { id: true, slug: true },
  });

  // Получаем все posts2 для каждого post
  const posts2 = await prisma.posts2.findMany({
    select: { id: true, slug: true, postId: true }, // Исправлено с postsId на postId
  });

  // Динамические страницы для posts
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug || post.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Динамические страницы для posts2
  const post2Pages = posts2.map((post2) => {
    const parentPost = posts.find((p) => p.id === post2.postId); // Исправлено с postsId на postId
    return {
      url: `${baseUrl}/posts/${parentPost?.slug || parentPost?.id}/${post2.slug || post2.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  // Объединяем все страницы
  const allPages = [...staticPages, ...postPages, ...post2Pages];

  // Генерируем XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map((page) => `
    <url>
      <loc>${page.url}</loc>
      <lastmod>${page.lastModified.toISOString()}</lastmod>
      <changefreq>${page.changeFrequency}</changefreq>
      <priority>${page.priority}</priority>
    </url>`).join('')}
</urlset>`;

  // Возвращаем ответ
  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}