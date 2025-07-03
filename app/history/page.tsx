"use client";

import { HistoryGrid } from "@/components/gallery/history-grid";
import { useHistory } from "@/hooks/use-history";

export default function HistoryPage() {
  const { images, isLoading, hasMore, error, loadMore, refresh } = useHistory();

  // HistoryGridが期待する形式にデータを変換
  const formattedImages = images.map((image) => ({
    id: image.generationId,
    imageUrl: image.imageUrl,
    title: image.title,
    characterName: image.characterName,
    rarity: image.rarity,
    createdAt: image.timestamp,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white title-gothic">作成履歴</h1>

        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <HistoryGrid
        images={formattedImages}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
      />
    </div>
  );
}
