"use client";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2 } from "lucide-react";

// Интерфейс для PDF-файла; свойство file опционально (для загруженных файлов его может не быть)
interface PdfFile {
  file?: File;
  title: string;
  tempId: string;
  url?: string;
  id?: string;
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

  // Загружаем список Posts2
  useEffect(() => {
    fetch("/api/posts2")
      .then((res) => res.json())
      .then(setPosts2);
  }, []);

  // При изменении выбранного поста получаем привязанные PDF файлы
  useEffect(() => {
    if (selectedPost) {
      fetch(`/api/uploadpdf?posts2Id=${selectedPost}`)
        .then((res) => res.json())
        .then((data: PdfFile[]) => {
          // Используем id как tempId для корректного рендера
          setPdfFiles(data.map((pdf) => ({ ...pdf, tempId: pdf.id || "" })));
        })
        .catch((err) => {
          console.error("Ошибка загрузки PDF файлов:", err);
          setPdfFiles([]);
        });
    } else {
      setPdfFiles([]);
    }
  }, [selectedPost]);

  // Инициализация dropzone для PDF файлов
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => {
      if (!selectedPost) return;
      const newFiles = acceptedFiles.map((file, index) => ({
        file,
        title: "", // Название вводится вручную
        tempId: `temp-${Date.now()}-${index}`,
      }));
      setPdfFiles((prev) => [...prev, ...newFiles]);
    },
  });

  // Обработка изменения названия PDF
  const handleTitleChange = (tempId: string, value: string) => {
    setPdfFiles((prev) =>
      prev.map((pdf) => (pdf.tempId === tempId ? { ...pdf, title: value } : pdf))
    );
  };

  // Загрузка PDF-файлов
  const handleUpload = async () => {
    if (!selectedPost) return;
    setUploading(true);
    const uploadedPdfs: PdfFile[] = [];

    for (const pdf of pdfFiles) {
      if (!pdf.title) {
        alert("Заполните название для каждого PDF файла.");
        setUploading(false);
        return;
      }
      const formData = new FormData();
      if (pdf.file) {
        formData.append("file", pdf.file);
      }
      formData.append("title", pdf.title);
      formData.append("posts2Id", selectedPost);

      try {
        const response = await fetch("/api/uploadpdf", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Загрузка не удалась");
        }
        const data: PdfFile = await response.json();
        uploadedPdfs.push(data);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      }
    }
    // Обновляем список после загрузки
    setPdfFiles(uploadedPdfs);
    setUploading(false);
  };

  // Удаление PDF файла
  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/uploadpdf", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id));
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">PDF Менеджер</h1>
      <select
        value={selectedPost}
        onChange={(e) => setSelectedPost(e.target.value)}
        className="w-full p-3 border rounded-lg bg-white shadow-sm mb-4"
      >
        <option value="">Выберите Post</option>
        {posts2.map((post) => (
          <option key={post.id} value={post.id}>
            {post.name}
          </option>
        ))}
      </select>

      {selectedPost && (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive
                ? "Отпустите файлы здесь"
                : "Перетащите PDF файлы или кликните для выбора"}
            </p>
            <p className="text-sm text-gray-500">Принимаются только PDF файлы</p>
          </div>

          {pdfFiles.length > 0 && (
            <div className="mt-4 space-y-4">
              {pdfFiles.map((pdf) => (
                <div key={pdf.tempId || pdf.id} className="p-4 border rounded-lg flex flex-col">
                  <span className="mb-2">
                    Файл:{" "}
                    {pdf.file
                      ? pdf.file.name
                      : pdf.url
                      ? pdf.url.split("/").pop()
                      : "Неизвестный файл"}
                  </span>
                  <input
                    type="text"
                    placeholder="Введите название PDF файла"
                    value={pdf.title}
                    onChange={(e) => handleTitleChange(pdf.tempId, e.target.value)}
                    className="p-2 border rounded"
                  />
                  {pdf.url && (
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 mt-2"
                    >
                      Посмотреть PDF
                    </a>
                  )}
                  {pdf.id && (
                    <button onClick={() => pdf.id && handleDelete(pdf.id)} className="mt-2 text-red-500">
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : "Загрузить PDF"}
          </button>
        </>
      )}
    </div>
  );
}
