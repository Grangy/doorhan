"use client";
import { useState, useEffect, FC } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';

/** Интерфейсы данных */
interface Advantage {
  id: string;
  image: string;
  text: string;
  order: number;
  // Новое поле: массив ID постов (многие ко многим)
  posts2Ids: string[];
}

interface CreatedAdvantage extends Advantage {
  tempId?: string;
}

interface Posts2 {
  id: string;
  name: string;
}

/** Функция генерации уникального идентификатора */
const generateUniqueId = () => 'id-' + Math.random().toString(36).substr(2, 9);

/** Компонент уведомления */
interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}
const Notification: FC<NotificationProps> = ({ message, type, onClose }) => {
  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500';
  return (
    <div className={`p-3 mb-4 text-white ${bgColor} rounded flex justify-between items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold">
        X
      </button>
    </div>
  );
};

/** Хук для уведомлений: автоочистка через 3 секунды */
const useNotification = () => {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  return { notification, setNotification };
};

/** Компонент для создания одного преимущества (режим "add") */
const AdvantageItem: FC<{
  advantage: CreatedAdvantage;
  onUpdate: (adv: CreatedAdvantage) => void;
  onDelete: (tempId?: string, id?: string) => void;
}> = ({ advantage, onUpdate, onDelete }) => {
  const [uploading, setUploading] = useState(false);

  // Унифицированный обработчик загрузки изображения
  const handleImageUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const file = acceptedFiles[0];
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const uploaded = Array.isArray(data) ? data[0] : data;
      onUpdate({ ...advantage, image: uploaded.url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.png', '.webp', '.avif'] },
    onDrop: handleImageUpload,
  });

  return (
    <div className="border rounded-lg p-4 relative">
      <div {...getRootProps()} className="border-dashed border-2 p-4 cursor-pointer text-center">
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        ) : advantage.image ? (
          <Image
            src={advantage.image}
            alt="Advantage image"
            width={200}
            height={150}
            className="object-cover mx-auto"
          />
        ) : isDragActive ? (
          <p className="text-gray-600">Отпустите изображение здесь</p>
        ) : (
          <div className="flex flex-col items-center">
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <p className="text-gray-600">Перетащите изображение или нажмите для загрузки</p>
          </div>
        )}
      </div>
      <input
        type="text"
        value={advantage.text}
        onChange={(e) => onUpdate({ ...advantage, text: e.target.value })}
        placeholder="Введите текст преимущества"
        className="mt-2 w-full p-2 border rounded"
      />
      <button
        onClick={() => {
          if (confirm('Удалить преимущество?')) {
            onDelete(advantage.tempId, advantage.id);
          }
        }}
        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
      >
        <Trash2 className="h-4 w-4 text-white" />
      </button>
    </div>
  );
};

/** Компонент для редактирования преимущества (режим "edit") */
interface AdvantageEditItemProps {
  advantage: Advantage;
  onAdvantageUpdated: (updatedAdvantage: Advantage) => void;
  onDelete: (id: string) => void;
  setNotification: (msg: { message: string; type: 'success' | 'error' | 'info' }) => void;
  allPosts: Posts2[];
}
const AdvantageEditItem: FC<AdvantageEditItemProps> = ({
  advantage,
  onAdvantageUpdated,
  onDelete,
  setNotification,
  allPosts,
}) => {
  const [localAdv, setLocalAdv] = useState<Advantage>(advantage);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalImage] = useState(advantage.image);

  // Унифицированный обработчик загрузки изображения
  const handleImageUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const file = acceptedFiles[0];
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const uploaded = Array.isArray(data) ? data[0] : data;
      setLocalAdv({ ...localAdv, image: uploaded.url });
      setNotification({ message: 'Фото успешно загружено. Нажмите "Сохранить изменения" для обновления.', type: 'info' });
    } catch (error) {
      console.error('Upload failed:', error);
      setNotification({ message: 'Ошибка загрузки фото', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.png', '.webp', '.avif'] },
    onDrop: handleImageUpload,
  });

  // Сохранение изменений (включая изменение привязки к постам)
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/advantages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localAdv),
      });
      const updatedAdv = await res.json();
      onAdvantageUpdated(updatedAdv);
      if (localAdv.image !== originalImage) {
        setNotification({ message: 'Фото успешно заменено', type: 'success' });
      } else {
        setNotification({ message: 'Изменения сохранены', type: 'success' });
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setNotification({ message: 'Ошибка при сохранении изменений', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Отвязка всех постов (при необходимости можно удалить отдельные через мультиселект)
  const handleClearPosts = () => {
    setLocalAdv({ ...localAdv, posts2Ids: [] });
    setNotification({ message: 'Все привязки удалены', type: 'success' });
  };

  // Удаление преимущества
  const handleDelete = async () => {
    if (!confirm('Удалить преимущество?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/advantages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: localAdv.id }),
      });
      if (res.ok) {
        onDelete(localAdv.id);
        setNotification({ message: 'Преимущество успешно удалено', type: 'success' });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setNotification({ message: 'Ошибка при удалении преимущества', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 relative">
      <div {...getRootProps()} className="border-dashed border-2 p-4 cursor-pointer text-center">
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        ) : localAdv.image ? (
          <Image
            src={localAdv.image}
            alt="Advantage image"
            width={200}
            height={150}
            className="object-cover mx-auto"
          />
        ) : isDragActive ? (
          <p className="text-gray-600">Отпустите изображение здесь</p>
        ) : (
          <div className="flex flex-col items-center">
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <p className="text-gray-600">Перетащите изображение или нажмите для загрузки</p>
          </div>
        )}
      </div>
      <input
        type="text"
        value={localAdv.text}
        onChange={(e) => setLocalAdv({ ...localAdv, text: e.target.value })}
        placeholder="Введите текст преимущества"
        className="mt-2 w-full p-2 border rounded"
      />

      {/* Мультиселект для привязки к нескольким постам */}
      <div className="mt-2">
        <label className="block text-sm text-gray-600 mb-1">Привязка к постам:</label>
        <select
          multiple
          value={localAdv.posts2Ids}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setLocalAdv({ ...localAdv, posts2Ids: selected });
          }}
          className="w-full p-2 border rounded"
        >
          {allPosts.map(post => (
            <option key={post.id} value={post.id}>
              {post.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-2 mt-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={saving}
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
        <button
          onClick={handleClearPosts}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          disabled={saving}
        >
          Очистить привязки
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={saving}
        >
          {saving ? 'Удаление...' : 'Удалить'}
        </button>
      </div>
    </div>
  );
};

/** Основной компонент управления преимуществами */
export default function AdvantagesManager() {
  // Режимы: 'select' – главное меню, 'add' – добавление, 'edit' – редактирование
  const [mode, setMode] = useState<'select' | 'add' | 'edit'>('select');

  // Состояния для режима "add"
  const [addStep, setAddStep] = useState(1);
  const [advantages, setAdvantages] = useState<CreatedAdvantage[]>([]);
  const [selectedPost, setSelectedPost] = useState('');
  const [saving, setSaving] = useState(false);

  // Состояния для режима "edit"
  const [editAdvantages, setEditAdvantages] = useState<Advantage[]>([]);
  const [posts2, setPosts2] = useState<Posts2[]>([]);

  const { notification, setNotification } = useNotification();

  // Загрузка списка постов (общий для add и edit)
  useEffect(() => {
    fetch('/api/posts2')
      .then((res) => res.json())
      .then(setPosts2);
  }, []);

  // Инициализация преимуществ для режима "add" (Шаг 1)
  useEffect(() => {
    if (mode === 'add' && addStep === 1 && advantages.length === 0) {
      const initialAdvantages = Array.from({ length: 3 }, (_, index) => ({
        tempId: generateUniqueId(),
        id: '',
        image: '',
        text: '',
        order: index,
        posts2Ids: []  // В режиме добавления можно оставить пустой массив
      }));
      setAdvantages(initialAdvantages);
    }
  }, [mode, addStep, advantages.length]);

  // При входе в режим "edit" – загрузка существующих преимуществ
  useEffect(() => {
    if (mode === 'edit') {
      fetch('/api/advantages')
        .then((res) => res.json())
        .then((data: Advantage[]) => {
          const advantagesWithIds = data.map(adv => ({
            ...adv,
            posts2Ids: adv.posts2Ids || []
          }));
          setEditAdvantages(advantagesWithIds);
        });
    }
  }, [mode]);

  /** Функции для режима "add" */
  const addAdvantage = () => {
    if (advantages.length < 12) {
      const newAdv = {
        tempId: generateUniqueId(),
        id: '',
        image: '',
        text: '',
        order: advantages.length,
        posts2Ids: []
      };
      setAdvantages((prev) => [...prev, newAdv]);
    }
  };

  const deleteAdvantage = (tempId?: string, id?: string) => {
    if (advantages.length > 3) {
      setAdvantages((prev) =>
        prev.filter((a) => {
          if (tempId && a.tempId === tempId) return false;
          if (id && a.id === id) return false;
          return true;
        })
      );
      setNotification({ message: 'Преимущество удалено', type: 'success' });
    }
  };

  const updateAdvantage = (updatedAdv: CreatedAdvantage) => {
    setAdvantages((prev) =>
      prev.map((a) => {
        if (updatedAdv.tempId && a.tempId === updatedAdv.tempId) return updatedAdv;
        if (updatedAdv.id && a.id === updatedAdv.id) return updatedAdv;
        return a;
      })
    );
  };

  const handleAddNextStep = () => {
    const valid = advantages.every((a) => a.text.trim() !== '' && a.image.trim() !== '');
    if (!valid) {
      setNotification({ message: 'Заполните все поля для каждого преимущества.', type: 'error' });
      return;
    }
    setAddStep(2);
  };

  const handleSaveAdvantages = async () => {
    if (!selectedPost) {
      setNotification({ message: 'Выберите пост для привязки.', type: 'error' });
      return;
    }
    const advantagesToSave = advantages.map((a, index) => ({
      ...a,
      posts2Ids: [selectedPost],
      order: index
    }));
    try {
      setSaving(true);
      await fetch('/api/advantages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advantagesToSave),
      });
      setNotification({ message: 'Преимущества успешно сохранены!', type: 'success' });
      // После успешного сохранения сбрасываем форму и возвращаемся в главное меню
      setMode('select');
      setAddStep(1); // Заменено setAddNextStep на setAddStep
      setAdvantages([]);
      setSelectedPost('');
    } catch (error) {
      console.error('Ошибка:', error);
      setNotification({ message: 'Ошибка при сохранении преимуществ.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /** Функция обновления преимущества в режиме "edit" */
  const updateEditAdvantage = (updatedAdv: Advantage) => {
    setEditAdvantages((prev) => prev.map((a) => (a.id === updatedAdv.id ? updatedAdv : a)));
  };

  /** Функция удаления преимущества в режиме "edit" */
  const deleteEditAdvantage = (id: string) => {
    setEditAdvantages((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Главное меню выбора режима */}
      {mode === 'select' && (
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">Выберите действие</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => {
                setMode('add');
                setAddStep(1);
                setAdvantages([]);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Добавить новые преимущества
            </button>
            <button
              onClick={() => setMode('edit')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Редактировать существующие преимущества
            </button>
          </div>
        </div>
      )}

      {/* Режим "add" – добавление новых преимуществ */}
      {mode === 'add' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setMode('select')}
              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Вернуться в главное меню
            </button>
          </div>
          {addStep === 1 && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Шаг 1: Создание преимуществ</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advantages.map((adv) => (
                  <AdvantageItem
                    key={adv.id || adv.tempId}
                    advantage={adv}
                    onUpdate={updateAdvantage}
                    onDelete={deleteAdvantage}
                  />
                ))}
              </div>
              <div className="mt-4">
                {advantages.length < 12 && (
                  <button
                    onClick={addAdvantage}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Добавить преимущество
                  </button>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={handleAddNextStep}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Далее
                </button>
              </div>
            </div>
          )}
          {addStep === 2 && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Шаг 2: Привязка преимуществ к посту</h1>
              <select
                value={selectedPost}
                onChange={(e) => setSelectedPost(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white shadow-sm mb-4"
              >
                <option value="">Выберите пост</option>
                {posts2.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {advantages.map((adv) => (
                  <div key={adv.id || adv.tempId} className="border rounded-lg p-4">
                    {adv.image && (
                      <Image
                        src={adv.image}
                        alt="Advantage image"
                        width={200}
                        height={150}
                        className="object-cover mb-2"
                      />
                    )}
                    <p>{adv.text}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveAdvantages}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить преимущества'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Режим "edit" – редактирование существующих преимуществ */}
      {mode === 'edit' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setMode('select')}
              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Вернуться в главное меню
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-4">Редактирование преимуществ</h1>
          {editAdvantages.length === 0 ? (
            <p>Нет сохранённых преимуществ для редактирования.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editAdvantages.map((adv) => {
                return (
                  <div key={adv.id}>
                    <div className="mb-2 text-sm text-gray-600">
                      {adv.posts2Ids.length > 0
                        ? `Привязан к: ${posts2.filter(p => adv.posts2Ids.includes(p.id)).map(p => p.name).join(', ')}`
                        : 'Не привязан к посту'}
                    </div>
                    <AdvantageEditItem
                      advantage={adv}
                      onAdvantageUpdated={updateEditAdvantage}
                      onDelete={deleteEditAdvantage}
                      setNotification={setNotification}
                      allPosts={posts2}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
