'use client';

import Image from 'next/image';

interface ImageCardProps {
  imageUrl: string;
  title: string;
  characterName: string;
  rarity: string;
  createdAt: string;
}

const RARITY_STYLES = {
  normal: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  'super-rare': 'from-yellow-400 to-orange-600',
};

export function ImageCard({ imageUrl, title, characterName, rarity, createdAt }: ImageCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all">
      <div className="aspect-square overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={512}
          height={512}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1 title-gothic">{title}</h3>
          <p className="text-sm opacity-80">{characterName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${RARITY_STYLES[rarity as keyof typeof RARITY_STYLES]}`}>
              {rarity.toUpperCase()}
            </span>
            <span className="text-xs opacity-60">
              {new Date(createdAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}