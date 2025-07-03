'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LoadingState } from './loading-state';

interface ImagePreviewProps {
  imageUrl?: string;
  isLoading: boolean;
  error?: string;
}

export function ImagePreview({ imageUrl, isLoading, error }: ImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="w-full aspect-square bg-red-500/10 border-2 border-red-500/50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">エラーが発生しました</p>
          <p className="text-white/50 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
        <p className="text-white/50">生成された画像がここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-black/50">
        <Image
          src={imageUrl}
          alt="Generated Bikkuriman sticker"
          width={1024}
          height={1024}
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        />
      </div>
      
      <button
        className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => window.open(imageUrl, '_blank')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>

      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <Image
            src={imageUrl}
            alt="Generated Bikkuriman sticker"
            width={1024}
            height={1024}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
}