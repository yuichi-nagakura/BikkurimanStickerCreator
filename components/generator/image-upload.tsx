'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onImageUpload, currentImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onImageUpload(data.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('画像のアップロードに失敗しました');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-white text-sm font-bold mb-2">
        元画像をアップロード（任意）
      </label>
      
      {!preview ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`block w-full p-8 border-2 border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:border-yellow-400 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-white/70">
                {isUploading ? 'アップロード中...' : 'クリックして画像を選択'}
              </p>
              <p className="text-sm text-white/50">
                JPEG, PNG, WebP（最大10MB）
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative aspect-square w-full max-w-xs mx-auto">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-center text-sm text-white/70">
            この画像をビックリマン風に変換します
          </p>
        </div>
      )}
    </div>
  );
}