"use client";

import { useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Loader2, Search, RefreshCw, CheckCircle2, XCircle, AlertCircle, Trash2, Upload, Download } from "lucide-react";

interface PdfFile {
  file?: File;
  title: string;
  tempId: string;
  url?: string;
  id?: string;
  fileUrl?: string;
}

interface Posts2 {
  id: string;
  name: string;
}

export default function PdfManager() {
  const [posts2, setPosts2] = useState<Posts2[]>([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPost) {
      fetchPdfs();
    } else {
      setPdfFiles([]);
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

  const fetchPdfs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/uploadpdf?posts2Id=${selectedPost}`);
      if (!res.ok) throw new Error("Failed to fetch PDFs");
      const data: PdfFile[] = await res.json();
      setPdfFiles(data.map((pdf) => ({ ...pdf, tempId: pdf.id || `pdf-${Date.now()}` })));
    } catch (error) {
      console.error("Ошибка загрузки PDF файлов:", error);
      showMessage("Ошибка загрузки PDF файлов", "error");
      setPdfFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => {
      if (!selectedPost) {
        showMessage("Сначала выберите пост", "error");
        return;
      }
      const newFiles = acceptedFiles.map((file, index) => ({
        file,
        title: "",
        tempId: `temp-${Date.now()}-${index}`,
      }));
      setPdfFiles((prev) => [...prev, ...newFiles]);
    },
  });

  const handleTitleChange = (tempId: string, value: string) => {
    setPdfFiles((prev) => prev.map((pdf) => (pdf.tempId === tempId ? { ...pdf, title: value } : pdf)));
  };

  const handleUpload = async () => {
    if (!selectedPost) return;

    const filesToUpload = pdfFiles.filter((pdf) => pdf.file && !pdf.id);
    if (filesToUpload.length === 0) {
      showMessage("Нет файлов для загрузки", "info");
      return;
    }

    const invalidFiles = filesToUpload.filter((pdf) => !pdf.title.trim());
    if (invalidFiles.length > 0) {
      showMessage("Заполните название для каждого PDF файла", "error");
      return;
    }

    setUploading(true);
    const uploadedPdfs: PdfFile[] = [];

    for (const pdf of filesToUpload) {
      if (!pdf.file || !pdf.title) continue;

      const formData = new FormData();
      formData.append("file", pdf.file);
      formData.append("title", pdf.title);
      formData.append("posts2Id", selectedPost);

      try {
        const response = await fetch("/api/uploadpdf", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Загрузка не удалась");
        const data: PdfFile = await response.json();
        uploadedPdfs.push(data);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        showMessage(`Ошибка при загрузке ${pdf.title || "файла"}`, "error");
      }
    }

    if (uploadedPdfs.length > 0) {
      showMessage(`Успешно загружено ${uploadedPdfs.length} PDF файлов`, "success");
      await fetchPdfs();
    }

    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот PDF файл?")) return;
    try {
      const res = await fetch("/api/uploadpdf", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id));
      showMessage("PDF файл успешно удален", "success");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      showMessage("Ошибка при удалении PDF файла", "error");
    }
  };

  const handleRemoveFromQueue = (tempId: string) => {
    setPdfFiles((prev) => prev.filter((pdf) => pdf.tempId !== tempId));
  };

  const filteredPdfs = useMemo(() => {
    if (!searchTerm) return pdfFiles;
    return pdfFiles.filter(
      (pdf) =>
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pdf.file && pdf.file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [pdfFiles, searchTerm]);

  const filesToUpload = pdfFiles.filter((pdf) => pdf.file && !pdf.id);
  const uploadedFiles = pdfFiles.filter((pdf) => pdf.id);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Управление PDF файлами</h1>
        <p className="text-gray-600">Загружайте и управляйте PDF документами для постов</p>
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
              <option value="">Выберите Post</option>
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
            onClick={fetchPdfs}
            disabled={isLoading || !selectedPost}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </button>
        </div>
      </div>

      {selectedPost && (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                {isDragActive ? "Отпустите файлы здесь" : "Перетащите PDF файлы или кликните для выбора"}
              </p>
              <p className="text-sm text-gray-500">Принимаются только PDF файлы</p>
            </div>
          </div>

          {filesToUpload.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Файлы в очереди загрузки ({filesToUpload.length})</h3>
              <div className="space-y-4">
                {filesToUpload.map((pdf) => (
                  <div key={pdf.tempId} className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-4">
                      <FileText className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          Файл: {pdf.file ? pdf.file.name : "Неизвестный файл"}
                        </p>
                        <input
                          type="text"
                          placeholder="Введите название PDF файла"
                          value={pdf.title}
                          onChange={(e) => handleTitleChange(pdf.tempId, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFromQueue(pdf.tempId)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="Удалить из очереди"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading || filesToUpload.some((pdf) => !pdf.title.trim())}
                className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Загрузить PDF файлы
                  </>
                )}
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredPdfs.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Загруженные PDF файлы ({uploadedFiles.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredPdfs
                  .filter((pdf) => pdf.id)
                  .map((pdf) => (
                    <div key={pdf.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <FileText className="h-10 w-10 text-red-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{pdf.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {pdf.fileUrl || pdf.url ? (
                                <a
                                  href={pdf.fileUrl || pdf.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                  Открыть PDF
                                </a>
                              ) : (
                                "URL недоступен"
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => pdf.id && handleDelete(pdf.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Нет загруженных PDF файлов. Загрузите первый файл выше.</p>
            </div>
          )}
        </>
      )}

      {!selectedPost && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Пожалуйста, выберите пост для управления PDF файлами.</p>
        </div>
      )}
    </div>
  );
}

