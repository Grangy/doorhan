"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../components/AdminLayout";
import {
  Palette,
  Images,
  FileText,
  Star,
  Folder,
  Package,
} from "lucide-react";

interface Stats {
  posts: number;
  posts2: number;
  colors: number;
  advantages: number;
  blogs: number;
}

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    posts2: 0,
    colors: 0,
    advantages: 0,
    blogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, posts2Res, colorsRes, advantagesRes, blogsRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/posts2"),
          fetch("/api/colors"),
          fetch("/api/advantages"),
          fetch("/api/blogs").catch(() => null),
        ]);

        const posts = await postsRes.json();
        const posts2 = await posts2Res.json();
        const colors = await colorsRes.json();
        const advantages = await advantagesRes.json();
        const blogs = blogsRes ? await blogsRes.json() : [];

        setStats({
          posts: Array.isArray(posts) ? posts.length : 0,
          posts2: Array.isArray(posts2) ? posts2.length : 0,
          colors: Array.isArray(colors) ? colors.length : 0,
          advantages: Array.isArray(advantages) ? advantages.length : 0,
          blogs: Array.isArray(blogs) ? blogs.length : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AdminLayout>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Панель управления</h2>
            <p className="text-gray-600">Добро пожаловать в админ панель DOORHAN</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Посты</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.posts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Посты 2</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.posts2}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Цвета</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.colors}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Преимущества</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.advantages}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Блоги</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.blogs}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <Folder className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Категории</span>
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Товары</span>
              </Link>
              <Link
                href="/admin/color-posts"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <Palette className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Цвета и Посты</span>
              </Link>
              <Link
                href="/admin/slider-photos"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <Images className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Слайдер Фото</span>
              </Link>
              <Link
                href="/admin/pdfs"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">PDF Файлы</span>
              </Link>
              <Link
                href="/admin/advantages"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <Star className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Преимущества</span>
              </Link>
            </div>
          </div>
    </AdminLayout>
  );
}

