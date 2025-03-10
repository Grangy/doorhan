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
    // Начинаем всегда с "Главная"
    const pathCrumbs: Crumb[] = [{ name: 'Главная', href: '/' }];

    if (segments[0] === 'posts') {
      // Второй уровень — базовая категория "Продукция"
      pathCrumbs.push({ name: 'Продукция', href: '/posts' });

      // Если URL вида /posts/{postSlug} (страница родительского поста)
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
      }
      // Если URL вида /posts/{parentSlug}/posts2/{childSlug}
      else if (segments.length >= 4 && segments[2] === 'posts2') {
        const parentSlug = segments[1];
        const childSlug = segments[3];

        // Сначала запрашиваем родительский пост, чтобы получить его категорию
        fetch(`/api/posts?slug=${parentSlug}`)
          .then((res) => res.json())
          .then((parentPost) => {
            // Если в родительском посте есть категория, добавляем её как отдельную крошку
            if (parentPost && parentPost.category) {
              pathCrumbs.push({
                name: parentPost.category,
                href: `/posts/${parentSlug}`,
              });
            } else if (parentPost && parentPost.name) {
              // Если категории нет — можно добавить название поста как запасной вариант
              pathCrumbs.push({
                name: parentPost.name,
                href: `/posts/${parentSlug}`,
              });
            }
            // Далее запрашиваем данные дочернего поста
            fetch(`/api/posts2?slug=${childSlug}`)
              .then((res) => res.json())
              .then((child) => {
                if (child && child.name) {
                  pathCrumbs.push({
                    name: child.name,
                    href: `/posts/${parentSlug}/posts2/${child.slug || child.id}`,
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
    } else {
      // Общая логика для других страниц
      const dynamicCrumbs = segments.map((seg, i) => ({
        name: seg,
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
