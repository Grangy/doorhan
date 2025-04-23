'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Crumb {
  name: string;
  href: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);

  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split('/').filter(Boolean);
    const pathCrumbs: Crumb[] = [{ name: 'Главная', href: '/' }];

    // === Обработка маршрута "/posts" ===
    if (segments[0] === 'posts') {
      pathCrumbs.push({ name: 'Продукция', href: '/posts' });

      if (segments.length === 2) {
        const postSlug = segments[1];
        fetch(`/api/posts?slug=${postSlug}`)
          .then((res) => res.json())
          .then((post) => {
            if (post && post.name) {
              pathCrumbs.push({
                name: post.name,
                href: `/posts/${post.slug || post.id}`,
              });
            }
            setCrumbs(pathCrumbs);
          })
          .catch(() => setCrumbs(pathCrumbs));
      } else if (segments.length === 3) {
        const parentSlug = segments[1];
        const childSlug = segments[2];
        fetch(`/api/posts?slug=${parentSlug}`)
          .then((res) => res.json())
          .then((parentPost) => {
            if (parentPost && parentPost.category) {
              pathCrumbs.push({
                name: parentPost.category,
                href: `/posts/${parentSlug}`,
              });
            } else if (parentPost && parentPost.name) {
              pathCrumbs.push({
                name: parentPost.name,
                href: `/posts/${parentSlug}`,
              });
            }
            fetch(`/api/posts2?slug=${childSlug}`)
              .then((res) => res.json())
              .then((child) => {
                if (child && child.name) {
                  pathCrumbs.push({
                    name: child.name,
                    href: `/posts/${parentSlug}/${child.slug || child.id}`,
                  });
                }
                setCrumbs(pathCrumbs);
              })
              .catch(() => setCrumbs(pathCrumbs));
          })
          .catch(() => setCrumbs(pathCrumbs));
      } else {
        setCrumbs(pathCrumbs);
      }

    // === Обработка маршрута "/blogs" ===
    } else if (segments[0] === 'blogs') {
      pathCrumbs.push({ name: 'Блог', href: '/blogs' });

      if (segments.length === 2) {
        const blogSlug = segments[1];
        fetch(`/api/blogs?slug=${blogSlug}`)
          .then((res) => res.json())
          .then((blog) => {
            if (blog && blog.title) {
              pathCrumbs.push({
                name: blog.title,
                href: `/blogs/${blog.slug || blog.id}`,
              });
            }
            setCrumbs(pathCrumbs);
          })
          .catch(() => setCrumbs(pathCrumbs));
      } else {
        setCrumbs(pathCrumbs);
      }

    // === Общая логика для остальных страниц ===
    } else {
      const dynamicCrumbs = segments.map((seg, i) => ({
        name: seg === 'contact' ? 'Контакты' : seg,
        href: '/' + segments.slice(0, i + 1).join('/'),
      }));
      setCrumbs([{ name: 'Главная', href: '/' }, ...dynamicCrumbs]);
    }
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Хлебные крошки"
      className="bg-gray-100 py-2 px-4 sticky top-[65px] z-40"
    >
      <div className="overflow-x-auto whitespace-nowrap">
        <ol className="flex items-center space-x-2">
          {crumbs.map((crumb, index) => (
            <li key={index} className="inline-flex items-center">
              {index < crumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-gray-500">{crumb.name}</span>
              )}
              {index < crumbs.length - 1 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
