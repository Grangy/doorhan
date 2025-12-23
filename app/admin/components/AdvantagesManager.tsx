"use client";

import { useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Trash2, Loader2, Search, RefreshCw, CheckCircle2, XCircle, AlertCircle, Plus, Edit2, Save } from "lucide-react";
import Image from "next/image";

interface Advantage {
  id: string;
  image: string;
  text: string;
  order: number;
  posts2Ids: string[];
}

interface CreatedAdvantage extends Advantage {
  tempId?: string;
}

interface Posts2 {
  id: string;
  name: string;
}

const generateUniqueId = () => "id-" + Math.random().toString(36).substr(2, 9);

export default function AdvantagesManager() {
  const [mode, setMode] = useState<"select" | "add" | "edit">("select");
  const [addStep, setAddStep] = useState(1);
  const [advantages, setAdvantages] = useState<CreatedAdvantage[]>([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [saving, setSaving] = useState(false);
  const [editAdvantages, setEditAdvantages] = useState<Advantage[]>([]);
  const [posts2, setPosts2] = useState<Posts2[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode === "add" && addStep === 1 && advantages.length === 0) {
      const initialAdvantages = Array.from({ length: 3 }, (_, index) => ({
        tempId: generateUniqueId(),
        id: "",
        image: "",
        text: "",
        order: index,
        posts2Ids: [],
      }));
      setAdvantages(initialAdvantages);
    }
  }, [mode, addStep, advantages.length]);

  useEffect(() => {
    if (mode === "edit") {
      fetchAdvantages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const fetchPosts2 = async () => {
    try {
      const res = await fetch("/api/posts2");
      const data = await res.json();
      setPosts2(data);
    } catch (error) {
      console.error("Error fetching posts2:", error);
      showMessage("Ошибка загрузки постов", "error");
    }
  };

  const fetchAdvantages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/advantages");
      const data: Advantage[] = await res.json();
      const advantagesWithIds = data.map((adv) => ({
        ...adv,
        posts2Ids: adv.posts2Ids || [],
      }));
      setEditAdvantages(advantagesWithIds);
    } catch (error) {
      console.error("Error fetching advantages:", error);
      showMessage("Ошибка загрузки преимуществ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const addAdvantage = () => {
    if (advantages.length < 12) {
      const newAdv = {
        tempId: generateUniqueId(),
        id: "",
        image: "",
        text: "",
        order: advantages.length,
        posts2Ids: [],
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
      showMessage("Преимущество удалено", "success");
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
    const valid = advantages.every((a) => a.text.trim() !== "" && a.image.trim() !== "");
    if (!valid) {
      showMessage("Заполните все поля для каждого преимущества.", "error");
      return;
    }
    setAddStep(2);
  };

  const handleSaveAdvantages = async () => {
    if (!selectedPost) {
      showMessage("Выберите пост для привязки.", "error");
      return;
    }
    const advantagesToSave = advantages.map((a, index) => ({
      ...a,
      posts2Ids: [selectedPost],
      order: index,
    }));
    try {
      setSaving(true);
      const res = await fetch("/api/advantages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advantagesToSave),
      });
      if (!res.ok) throw new Error("Save failed");
      showMessage("Преимущества успешно сохранены!", "success");
      setMode("select");
      setAddStep(1);
      setAdvantages([]);
      setSelectedPost("");
    } catch (error) {
      console.error("Ошибка:", error);
      showMessage("Ошибка при сохранении преимуществ.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateEditAdvantage = (updatedAdv: Advantage) => {
    setEditAdvantages((prev) => prev.map((a) => (a.id === updatedAdv.id ? updatedAdv : a)));
  };

  const deleteEditAdvantage = (id: string) => {
    setEditAdvantages((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredAdvantages = useMemo(() => {
    if (!searchTerm) return editAdvantages;
    return editAdvantages.filter(
      (adv) =>
        adv.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adv.posts2Ids.some((pid) => {
          const post = posts2.find((p) => p.id === pid);
          return post?.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );
  }, [editAdvantages, searchTerm, posts2]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Управление преимуществами</h1>
        <p className="text-gray-600">Создавайте и редактируйте преимущества для постов</p>
      </div>

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

      {mode === "select" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Выберите действие</h2>
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
              <button
                onClick={() => {
                  setMode("add");
                  setAddStep(1);
                  setAdvantages([]);
                }}
                className="px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Добавить новые преимущества
              </button>
              <button
                onClick={() => setMode("edit")}
                className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="h-5 w-5" />
                Редактировать существующие
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "add" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode("select")}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              ← Назад
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">
              {addStep === 1 ? "Шаг 1: Создание преимуществ" : "Шаг 2: Привязка к посту"}
            </h2>
          </div>

          {addStep === 1 && (
            <div className="space-y-6">
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
              <div className="flex gap-4">
                {advantages.length < 12 && (
                  <button
                    onClick={addAdvantage}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить преимущество
                  </button>
                )}
                <button
                  onClick={handleAddNextStep}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-auto"
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Выберите пост:</label>
                <select
                  value={selectedPost}
                  onChange={(e) => setSelectedPost(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите пост</option>
                  {posts2.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advantages.map((adv) => (
                  <div key={adv.id || adv.tempId} className="border rounded-lg p-4">
                    {adv.image && (
                      <Image
                        src={adv.image}
                        alt="Advantage image"
                        width={200}
                        height={150}
                        className="object-cover mb-2 rounded"
                      />
                    )}
                    <p className="text-sm text-gray-700">{adv.text}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveAdvantages}
                disabled={saving}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Сохранить преимущества
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "edit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMode("select")}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                ← Назад
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">Редактирование преимуществ</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchAdvantages}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Обновить
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredAdvantages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Нет сохранённых преимуществ для редактирования.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdvantages.map((adv) => (
                <AdvantageEditItem
                  key={adv.id}
                  advantage={adv}
                  onAdvantageUpdated={updateEditAdvantage}
                  onDelete={deleteEditAdvantage}
                  setNotification={(msg) => showMessage(msg.message, msg.type)}
                  allPosts={posts2}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdvantageItem({
  advantage,
  onUpdate,
  onDelete,
}: {
  advantage: CreatedAdvantage;
  onUpdate: (adv: CreatedAdvantage) => void;
  onDelete: (tempId?: string, id?: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".webp", ".avif"] },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      const file = acceptedFiles[0];
      try {
        const formData = new FormData();
        formData.append("files", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        const uploaded = Array.isArray(data) ? data[0] : data;
        onUpdate({ ...advantage, image: uploaded.url });
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="border rounded-lg p-4 relative">
      <div {...getRootProps()} className="border-dashed border-2 p-4 cursor-pointer text-center">
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        ) : advantage.image ? (
          <Image src={advantage.image} alt="Advantage image" width={200} height={150} className="object-cover mx-auto rounded" />
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
        className="mt-2 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => {
          if (confirm("Удалить преимущество?")) {
            onDelete(advantage.tempId, advantage.id);
          }
        }}
        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
      >
        <Trash2 className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}

function AdvantageEditItem({
  advantage,
  onAdvantageUpdated,
  onDelete,
  setNotification,
  allPosts,
}: {
  advantage: Advantage;
  onAdvantageUpdated: (updatedAdvantage: Advantage) => void;
  onDelete: (id: string) => void;
  setNotification: (msg: { message: string; type: "success" | "error" | "info" }) => void;
  allPosts: Posts2[];
}) {
  const [localAdv, setLocalAdv] = useState<Advantage>(advantage);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".webp", ".avif"] },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      const file = acceptedFiles[0];
      try {
        const formData = new FormData();
        formData.append("files", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        const uploaded = Array.isArray(data) ? data[0] : data;
        setLocalAdv({ ...localAdv, image: uploaded.url });
        setNotification({ message: "Фото успешно загружено. Нажмите 'Сохранить изменения' для обновления.", type: "info" });
      } catch (error) {
        console.error("Upload failed:", error);
        setNotification({ message: "Ошибка загрузки фото", type: "error" });
      } finally {
        setUploading(false);
      }
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/advantages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localAdv),
      });
      if (!res.ok) throw new Error("Save failed");
      const updatedAdv = await res.json();
      onAdvantageUpdated(updatedAdv);
      setNotification({ message: "Изменения сохранены", type: "success" });
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setNotification({ message: "Ошибка при сохранении изменений", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Удалить преимущество?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/advantages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: localAdv.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onDelete(localAdv.id);
      setNotification({ message: "Преимущество успешно удалено", type: "success" });
    } catch (error) {
      console.error("Ошибка удаления:", error);
      setNotification({ message: "Ошибка при удалении преимущества", type: "error" });
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
          <Image src={localAdv.image} alt="Advantage image" width={200} height={150} className="object-cover mx-auto rounded" />
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
        className="mt-2 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-2">
        <label className="block text-sm text-gray-600 mb-1">Привязка к постам:</label>
        <select
          multiple
          value={localAdv.posts2Ids}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (option) => option.value);
            setLocalAdv({ ...localAdv, posts2Ids: selected });
          }}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          size={3}
        >
          {allPosts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col space-y-2 mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          onClick={handleDelete}
          disabled={saving}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {saving ? "Удаление..." : "Удалить"}
        </button>
      </div>
    </div>
  );
}

