"use client";

import { useState, useEffect } from 'react';

interface Color {
  id: string;
  name: string;
}

interface Posts2 {
  id: string;
  name: string;
}

export default function ManageColorPost() {
  const [colors, setColors] = useState<Color[]>([]);
  const [posts2, setPosts2] = useState<Posts2[]>([]);
  const [selectedPosts2, setSelectedPosts2] = useState<string>('');
  const [attachedColors, setAttachedColors] = useState<string[]>([]);
  const [colorFilter, setColorFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  // Отдельное состояние для загрузки по действиям для каждого цвета
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  // Загружаем данные Colors и Posts2 при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [colorsRes, posts2Res] = await Promise.all([
          fetch('/api/colors'),
          fetch('/api/posts2')
        ]);
        const [colorsData, posts2Data] = await Promise.all([
          colorsRes.json(),
          posts2Res.json()
        ]);
        setColors(colorsData);
        setPosts2(posts2Data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setMessage('Ошибка загрузки данных.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // При смене выбранного Posts2 сбрасываем список привязанных цветов и запрашиваем актуальные данные
  useEffect(() => {
    setAttachedColors([]); // Очистка предыдущего списка
    if (selectedPosts2) {
      fetchAttachedColors(selectedPosts2);
    }
  }, [selectedPosts2]);

  // Функция для загрузки привязанных цветов для выбранного Posts2
  const fetchAttachedColors = async (posts2Id: string) => {
    try {
      const res = await fetch(`/api/colorpost?posts2Id=${posts2Id}`);
      if (!res.ok) throw new Error("Не удалось загрузить привязанные цвета");
      const data = await res.json();
      // Предполагается, что каждый элемент содержит поле colorId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAttachedColors(data.map((cp: any) => cp.colorId));
    } catch (error) {
      console.error('Ошибка при загрузке привязанных цветов:', error);
      setMessage('Ошибка при загрузке привязанных цветов.');
    }
  };

  // Привязка конкретного цвета к выбранному Posts2
  const handleAttach = async (colorId: string) => {
    if (!selectedPosts2) return;
    setActionLoading(prev => ({ ...prev, [colorId]: true }));
    setMessage('');
    try {
      const res = await fetch('/api/colorpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorId, posts2Id: selectedPosts2 }),
      });
      if (!res.ok) throw new Error("Ошибка привязки");
      setMessage(`Цвет успешно привязан.`);
      await fetchAttachedColors(selectedPosts2);
    } catch (error) {
      console.error('Ошибка при привязке цвета:', error);
      setMessage('Ошибка при привязке цвета.');
    } finally {
      setActionLoading(prev => ({ ...prev, [colorId]: false }));
    }
  };

  // Отвязка конкретного цвета от выбранного Posts2
  const handleDetach = async (colorId: string) => {
    if (!selectedPosts2) return;
    setActionLoading(prev => ({ ...prev, [colorId]: true }));
    setMessage('');
    try {
      const res = await fetch(`/api/colorpost?colorId=${colorId}&posts2Id=${selectedPosts2}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Ошибка отвязки");
      setMessage(`Цвет успешно отвязан.`);
      await fetchAttachedColors(selectedPosts2);
    } catch (error) {
      console.error('Ошибка при отвязке цвета:', error);
      setMessage('Ошибка при отвязке цвета.');
    } finally {
      setActionLoading(prev => ({ ...prev, [colorId]: false }));
    }
  };

  // Отвязка всех цветов от выбранного Posts2
  const handleDetachAll = async () => {
    if (!selectedPosts2) return;
    setMessage('');
    try {
      const res = await fetch(`/api/colorpost?posts2Id=${selectedPosts2}&detachAll=true`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Ошибка отвязки всех цветов");
      setMessage(`Все цвета успешно отвязаны.`);
      await fetchAttachedColors(selectedPosts2);
    } catch (error) {
      console.error('Ошибка при отвязке всех цветов:', error);
      setMessage('Ошибка при отвязке всех цветов.');
    }
  };

  // Обновление привязки (например, обновление временной метки)
  const handleUpdate = async (colorId: string) => {
    if (!selectedPosts2) return;
    setActionLoading(prev => ({ ...prev, [colorId]: true }));
    setMessage('');
    try {
      const res = await fetch('/api/colorpost', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorId, posts2Id: selectedPosts2, updatedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Ошибка обновления");
      setMessage(`Связь успешно обновлена.`);
      await fetchAttachedColors(selectedPosts2);
    } catch (error) {
      console.error('Ошибка при обновлении связи:', error);
      setMessage('Ошибка при обновлении связи.');
    } finally {
      setActionLoading(prev => ({ ...prev, [colorId]: false }));
    }
  };

  // Фильтрация списка цветов по введённой строке
  const filteredColors = colors.filter(color =>
    color.name.toLowerCase().includes(colorFilter.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Управление связями Posts2 и Color</h1>

      {message && (
        <div
          className={`text-center mb-4 p-2 rounded transition-colors duration-300 ${
            message.includes('успешно')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
          role="alert"
        >
          {message}
        </div>
      )}

      {/* Селектор Posts2 */}
      <div className="mb-4">
        <label htmlFor="posts2-select" className="block font-medium text-gray-700 mb-2">
          Выберите Posts2:
        </label>
        <select
          id="posts2-select"
          value={selectedPosts2}
          onChange={(e) => setSelectedPosts2(e.target.value)}
          required
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Выберите Posts2"
        >
          <option value="">-- Выберите Posts2 --</option>
          {posts2.map(post => (
            <option key={post.id} value={post.id}>
              {post.name}
            </option>
          ))}
        </select>
      </div>

      {/* Кнопка для отвязки всех цветов */}
      {selectedPosts2 && attachedColors.length > 0 && (
        <div className="mb-4 text-right">
          <button
            onClick={handleDetachAll}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Отвязать все
          </button>
        </div>
      )}

      {/* Фильтр по цветам */}
      <div className="mb-4">
        <label htmlFor="color-filter" className="block font-medium text-gray-700 mb-2">
          Фильтр по цветам:
        </label>
        <input
          id="color-filter"
          type="text"
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          placeholder="Введите для фильтрации..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Фильтр по цветам"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : selectedPosts2 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Цвет</th>
                <th className="px-4 py-2 border-b">Статус</th>
                <th className="px-4 py-2 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredColors.length > 0 ? (
                filteredColors.map(color => {
                  const isAttached = attachedColors.includes(color.id);
                  return (
                    <tr key={color.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{color.name}</td>
                      <td className="px-4 py-2 border-b">
                        {isAttached ? (
                          <span className="text-green-600 font-semibold">Прикреплен</span>
                        ) : (
                          <span className="text-gray-500">Не прикреплен</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {isAttached ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDetach(color.id)}
                              disabled={actionLoading[color.id]}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              {actionLoading[color.id] ? '...' : 'Отвязать'}
                            </button>
                            <button
                              onClick={() => handleUpdate(color.id)}
                              disabled={actionLoading[color.id]}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                            >
                              {actionLoading[color.id] ? '...' : 'Обновить'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAttach(color.id)}
                            disabled={actionLoading[color.id]}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            {actionLoading[color.id] ? '...' : 'Добавить'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-2 text-center" colSpan={3}>
                    Цвета не найдены.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">Пожалуйста, выберите Posts2 для управления связями.</p>
      )}
    </div>
  );
}
