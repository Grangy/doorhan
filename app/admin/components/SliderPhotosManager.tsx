"use client";

import { useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Trash2, Loader2, Search, RefreshCw, CheckCircle2, XCircle, AlertCircle, ArrowUp, ArrowDown, Grid, List } from "lucide-react";
import Image from "next/image";

interface SliderPhoto {
  id: string;
  image: string;
  name?: string;
  order: number;
  posts2Id: string;
}

interface Posts2 {
  id: string;
  name: string;
}

interface CreatedPhoto extends SliderPhoto {
  tempId?: string;
}

export default function SliderPhotosManager() {
  const [posts2, setPosts2] = useState<Posts2[]>([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [photos, setPhotos] = useState<CreatedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".png", ".webp", ".avif"],
    },
    onDrop: async (acceptedFiles) => {
      if (!selectedPost) {
        showMessage("Сначала выберите пост", "error");
        return;
      }
      await handleUpload(acceptedFiles);
    },
  });

  useEffect(() => {
    fetchPosts2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPost) {
      fetchPhotos();
    } else {
      setPhotos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPost]);

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

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sliderphotos?posts2Id=${selectedPost}`);
      if (!res.ok) throw new Error("Failed to fetch photos");
      const data: SliderPhoto[] = await res.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos:", error);
      showMessage("Ошибка загрузки фото", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpload = async (files: File[]) => {
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const responseData = await uploadResponse.json();
      const uploadedFiles = Array.isArray(responseData) ? responseData : [responseData];

      const photosToCreate: CreatedPhoto[] = uploadedFiles.map((file, index) => ({
        tempId: `temp-${Date.now()}-${index}`,
        image: file.url,
        name: file.name || `photo-${Date.now()}-${index}`,
        posts2Id: selectedPost,
        order: photos.length + index,
        id: "",
      }));

      setPhotos((prev) => [...prev, ...photosToCreate]);

      const saveResponse = await fetch("/api/sliderphotos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photosToCreate),
      });

      if (!saveResponse.ok) throw new Error("Save failed");

      const savedPhotos: SliderPhoto[] = await saveResponse.json();

      setPhotos((prev) => [...prev.filter((p) => !p.tempId), ...savedPhotos]);
      showMessage(`Успешно загружено ${files.length} фото`, "success");
    } catch (error) {
      console.error("Upload failed:", error);
      setPhotos((prev) => prev.filter((p) => !p.tempId));
      showMessage("Ошибка при загрузке фото", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить это фото?")) return;
    try {
      const res = await fetch(`/api/sliderphotos?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
      showMessage("Фото успешно удалено", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showMessage("Ошибка при удалении фото", "error");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const photoIndex = photos.findIndex((p) => p.id === id);
    if (photoIndex === -1) return;

    const newIndex = direction === "up" ? photoIndex - 1 : photoIndex + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;

    const updatedPhotos = [...photos];
    const [removed] = updatedPhotos.splice(photoIndex, 1);
    updatedPhotos.splice(newIndex, 0, removed);

    const reorderedPhotos = updatedPhotos.map((photo, index) => ({
      ...photo,
      order: index,
    }));

    setPhotos(reorderedPhotos);

    try {
      await Promise.all(
        reorderedPhotos.map((photo) =>
          fetch("/api/sliderphotos", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: photo.id, order: photo.order }),
          }).catch(() => {})
        )
      );
    } catch (error) {
      console.error("Reorder failed:", error);
    }
  };

  const filteredPhotos = useMemo(() => {
    if (!searchTerm) return photos;
    return photos.filter(
      (photo) =>
        photo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.image.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [photos, searchTerm]);

  const sortedPhotos = useMemo(() => {
    return [...filteredPhotos].sort((a, b) => a.order - b.order);
  }, [filteredPhotos]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Управление слайдер фото</h1>
        <p className="text-gray-600">Загружайте и управляйте фотографиями для слайдера</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Выберите пост:</label>
            <select
              value={selectedPost}
              onChange={(e) => setSelectedPost(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a Post</option>
              {posts2.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPost && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Поиск:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по названию..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchPhotos}
            disabled={isLoading || !selectedPost}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </button>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedPost && (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                {isDragActive ? "Отпустите файлы здесь" : "Перетащите изображения или нажмите для выбора"}
              </p>
              <p className="text-sm text-gray-500">Поддерживаются: JPEG, PNG, WEBP, AVIF</p>
            </div>
          </div>

          {uploading && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-blue-600">Загрузка...</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : sortedPhotos.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {sortedPhotos.map((photo, index) => (
                <div
                  key={photo.id || photo.tempId}
                  className={`group relative rounded-lg overflow-hidden shadow-md border border-gray-200 ${
                    viewMode === "list" ? "flex gap-4" : ""
                  }`}
                >
                  <div className={`${viewMode === "list" ? "w-48 flex-shrink-0" : "w-full"} relative`}>
                    <Image
                      src={photo.image}
                      alt={photo.name || ""}
                      width={400}
                      height={300}
                      className={`${viewMode === "list" ? "h-32" : "h-48"} w-full object-cover`}
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleReorder(photo.id, "up")}
                          disabled={index === 0}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Вверх"
                        >
                          <ArrowUp className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleReorder(photo.id, "down")}
                          disabled={index === sortedPhotos.length - 1}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Вниз"
                        >
                          <ArrowDown className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => photo.id && handleDelete(photo.id)}
                          disabled={!photo.id}
                          className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {viewMode === "list" && (
                    <div className="flex-1 p-4">
                      <p className="font-medium text-gray-800">{photo.name || "Без названия"}</p>
                      <p className="text-sm text-gray-500 mt-1">Порядок: {photo.order + 1}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <ImagePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Нет загруженных фото. Загрузите первое фото выше.</p>
            </div>
          )}
        </div>
      )}

      {!selectedPost && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Пожалуйста, выберите пост для управления фото.</p>
        </div>
      )}
    </div>
  );
}

