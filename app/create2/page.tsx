"use client";
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';

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

export default function SliderManager() {
  const [posts2, setPosts2] = useState<Posts2[]>([]);
  const [selectedPost, setSelectedPost] = useState('');
  // Используем тип CreatedPhoto[] для поддержки свойства tempId
  const [photos, setPhotos] = useState<CreatedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.webp', '.avif']
    },
    onDrop: async (acceptedFiles) => {
      if (!selectedPost) return;
      await handleUpload(acceptedFiles);
    }
  });

  useEffect(() => {
    fetch('/api/posts2')
      .then(res => res.json())
      .then(setPosts2);
  }, []);

  useEffect(() => {
    if (selectedPost) {
      fetch(`/api/sliderphotos?posts2Id=${selectedPost}`)
        .then(res => res.json())
        .then((data: SliderPhoto[]) => setPhotos(data));
    }
  }, [selectedPost]);

  const handleUpload = async (files: File[]) => {
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const responseData = await uploadResponse.json();
      const uploadedFiles = Array.isArray(responseData) ? responseData : [responseData];

      // Добавляем временные ID для немедленного отображения
      const photosToCreate: CreatedPhoto[] = uploadedFiles.map((file, index) => ({
        tempId: `temp-${Date.now()}-${index}`,
        image: file.url,
        name: file.name || `photo-${Date.now()}-${index}`,
        posts2Id: selectedPost,
        order: photos.length + index,
        id: '' // Заглушка, будет заменена при сохранении
      }));

      // Оптимистичное обновление
      setPhotos(prev => [...prev, ...photosToCreate]);

      // Сохраняем в БД
      const saveResponse = await fetch('/api/sliderphotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photosToCreate),
      });

      const savedPhotos: SliderPhoto[] = await saveResponse.json();

      // Заменяем временные данные на сохраненные из БД
      setPhotos(prev => [
        ...prev.filter(p => !p.tempId),
        ...savedPhotos
      ]);

    } catch (error) {
      console.error('Upload failed:', error);
      // Откатываем изменения при ошибке
      setPhotos(prev => prev.filter(p => !p.tempId));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sliderphotos?id=${id}`, { method: 'DELETE' });
      setPhotos(prev => prev.filter(photo => photo.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Slider Photos Manager</h1>
        <select
          value={selectedPost}
          onChange={(e) => setSelectedPost(e.target.value)}
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
        >
          <option value="">Select a Post</option>
          {posts2.map(post => (
            <option key={post.id} value={post.id}>{post.name}</option>
          ))}
        </select>
      </div>

      {selectedPost && (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                {isDragActive ? 'Drop files here' : 'Drag & drop images or click to select'}
              </p>
              <p className="text-sm text-gray-500">Supports: JPEG, PNG, WEBP, AVIF</p>
            </div>
          </div>

          {uploading && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-blue-600">Uploading...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id || photo.tempId} className="group relative rounded-lg overflow-hidden shadow-md">
                <Image
                  src={photo.image}
                  alt={photo.name || ''}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                  priority={false}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                  <button
                    onClick={() => photo.id && handleDelete(photo.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    disabled={!photo.id}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
