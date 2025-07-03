'use client';

import { ImageCard } from './image-card';

interface HistoryGridProps {
  images: Array<{
    id: string;
    imageUrl: string;
    title: string;
    characterName: string;
    rarity: string;
    createdAt: string;
  }>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function HistoryGrid({ images, onLoadMore, hasMore, isLoading }: HistoryGridProps) {
  if (images.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 text-lg">まだ画像が生成されていません</p>
        <p className="text-white/40 mt-2">最初の画像を作成してみましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            imageUrl={image.imageUrl}
            title={image.title}
            characterName={image.characterName}
            rarity={image.rarity}
            createdAt={image.createdAt}
          />
        ))}
      </div>
      
      {hasMore && onLoadMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}
    </div>
  );
}