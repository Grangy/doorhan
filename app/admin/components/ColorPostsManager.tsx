"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, RefreshCw, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface Color {
  id: string;
  name: string;
  image?: string;
}

interface ColorWithAttachment extends Color {
  isAttached?: boolean;
}

interface Posts2 {
  id: string;
  name: string;
}

interface ColorPost {
  id: string;
  colorId: string;
  posts2Id: string;
  color?: Color;
  posts2?: Posts2;
}

export default function ColorPostsManager() {
  const [colors, setColors] = useState<Color[]>([]);
  const [posts2, setPosts2] = useState<Posts2[]>([]);
  const [selectedPosts2, setSelectedPosts2] = useState<string>("");
  const [attachedColors, setAttachedColors] = useState<ColorPost[]>([]);
  const [colorFilter, setColorFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<"name" | "status">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Загрузка данных
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPosts2) {
      fetchAttachedColors(selectedPosts2);
    } else {
      setAttachedColors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPosts2]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [colorsRes, posts2Res] = await Promise.all([
        fetch("/api/colors"),
        fetch("/api/posts2"),
      ]);
      const [colorsData, posts2Data] = await Promise.all([
        colorsRes.json(),
        posts2Res.json(),
      ]);
      setColors(colorsData);
      setPosts2(posts2Data);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      showMessage("Ошибка загрузки данных.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttachedColors = async (posts2Id: string) => {
    try {
      const res = await fetch(`/api/colorpost?posts2Id=${posts2Id}`);
      if (!res.ok) throw new Error("Не удалось загрузить привязанные цвета");
      const data = await res.json();
      setAttachedColors(data);
    } catch (error) {
      console.error("Ошибка при загрузке привязанных цветов:", error);
      showMessage("Ошибка при загрузке привязанных цветов.", "error");
    }
  };

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAttach = async (colorId: string) => {
    if (!selectedPosts2) return;
    setActionLoading((prev) => ({ ...prev, [colorId]: true }));
    setMessage(null);
    try {
      const res = await fetch("/api/colorpost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorId, posts2Id: selectedPosts2 }),
      });
      if (!res.ok) throw new Error("Ошибка привязки");
      showMessage("Цвет успешно привязан.", "success");
      await fetchAttachedColors(selectedPosts2);
    } catch (error) {
      console.error("Ошибка при привязке цвета:", error);
      showMessage("Ошибка при привязке цвета.", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [colorId]: false }));
    }
  };

  const handleDetach = async (colorId: string) => {
    if (!selectedPosts2) return;
    setActionLoading((prev) => ({ ...prev, [colorId]: true }));
    setMessage(null);
    try {
      const res = await fetch(`/api/colorpost?colorId=${colorId}&posts2Id=${selectedPosts2}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Ошибка отвязки");
      showMessage("Цвет успешно отвязан.", "success");
      await fetchAttachedColors(selectedPosts2);
    } catch (error) {
      console.error("Ошибка при отвязке цвета:", error);
      showMessage("Ошибка при отвязке цвета.", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [colorId]: false }));
    }
  };

  const handleDetachAll = async () => {
    if (!selectedPosts2) return;
    if (!confirm("Вы уверены, что хотите отвязать все цвета?")) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/colorpost?posts2Id=${selectedPosts2}&detachAll=true`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Ошибка отвязки всех цветов");
      showMessage("Все цвета успешно отвязаны.", "success");
      await fetchAttachedColors(selectedPosts2);
    } catch (error) {
      console.error("Ошибка при отвязке всех цветов:", error);
      showMessage("Ошибка при отвязке всех цветов.", "error");
    }
  };

  // Фильтрация и сортировка
  const filteredColors = useMemo((): ColorWithAttachment[] => {
    let filtered: ColorWithAttachment[] = colors.filter((color) =>
      color.name?.toLowerCase().includes(colorFilter.toLowerCase())
    ).map((color): ColorWithAttachment => ({
      ...color,
      isAttached: false,
    }));

    const attachedColorIds = new Set(attachedColors.map((cp) => cp.colorId));

    filtered = filtered.map((color): ColorWithAttachment => ({
      ...color,
      isAttached: attachedColorIds.has(color.id),
    }));

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        const comparison = (a.name || "").localeCompare(b.name || "");
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const comparison = Number(a.isAttached || false) - Number(b.isAttached || false);
        return sortOrder === "asc" ? comparison : -comparison;
      }
    });

    return filtered;
  }, [colors, colorFilter, attachedColors, sortBy, sortOrder]);

  // Пагинация
  const totalPages = Math.ceil(filteredColors.length / itemsPerPage);
  const paginatedColors = filteredColors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [colorFilter, selectedPosts2]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Управление связями Posts2 и Color</h1>
        <p className="text-gray-600">Связывайте цвета с постами для управления контентом</p>
      </div>

      {/* Уведомления */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : message.type === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
          role="alert"
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : message.type === "error" ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Панель управления */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите Posts2:
            </label>
            <select
              value={selectedPosts2}
              onChange={(e) => setSelectedPosts2(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Выберите Posts2 --</option>
              {posts2.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск по цветам:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                placeholder="Введите для поиска..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сортировка:
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split("-");
                setSortBy(by as "name" | "status");
                setSortOrder(order as "asc" | "desc");
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">Имя (А-Я)</option>
              <option value="name-desc">Имя (Я-А)</option>
              <option value="status-asc">Статус (Привязанные)</option>
              <option value="status-desc">Статус (Непривязанные)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Элементов на странице:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </button>
          {selectedPosts2 && attachedColors.length > 0 && (
            <button
              onClick={handleDetachAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Отвязать все ({attachedColors.length})
            </button>
          )}
        </div>
      </div>

      {/* Таблица */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : selectedPosts2 ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Цвет
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedColors.length > 0 ? (
                    paginatedColors.map((color) => {
                      const isAttached = color.isAttached;
                      return (
                        <tr key={color.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {color.image && (
                                <Image
                                  src={color.image.startsWith('/') ? color.image : `/${color.image}`}
                                  alt={color.name}
                                  width={40}
                                  height={40}
                                  className="rounded object-cover"
                                />
                              )}
                              <span className="text-sm font-medium text-gray-900">{color.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isAttached ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Прикреплен
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Не прикреплен
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isAttached ? (
                              <button
                                onClick={() => handleDetach(color.id)}
                                disabled={actionLoading[color.id]}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[color.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Отвязать"
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAttach(color.id)}
                                disabled={actionLoading[color.id]}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[color.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Добавить"
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        Цвета не найдены.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-700">
                Показано {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredColors.length)} из {filteredColors.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Пожалуйста, выберите Posts2 для управления связями.</p>
        </div>
      )}
    </div>
  );
}

