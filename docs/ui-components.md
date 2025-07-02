# ビックリマンシール風画像生成ツール UIコンポーネント仕様書

## 概要
Next.js App RouterとTailwind CSSを使用したUIコンポーネントの設計仕様書です。

## デザインシステム

### カラーパレット
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        holographic: {
          rainbow: 'linear-gradient(45deg, #ff0000, #ff7700, #ffdd00, #00ff00, #0099ff, #6633ff)',
          silver: '#c0c0c0',
          gold: '#ffd700',
        }
      }
    }
  }
}
```

### タイポグラフィ
```css
/* グローバルスタイル */
@font-face {
  font-family: 'BikkurimanFont';
  src: url('/fonts/bikkuriman.woff2') format('woff2');
}

.title-gothic {
  font-family: 'BikkurimanFont', 'Noto Sans JP', sans-serif;
  font-weight: 900;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
```

## コンポーネント設計

### 1. レイアウトコンポーネント

#### app/layout.tsx
```tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

### 2. ヘッダーコンポーネント

#### components/ui/header.tsx
```tsx
'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white text-xl font-bold title-gothic">
              ビックリマンメーカー
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/generate" className="text-white hover:text-yellow-400 transition-colors">
              作成
            </Link>
            <Link href="/history" className="text-white hover:text-yellow-400 transition-colors">
              履歴
            </Link>
            {session ? (
              <div className="flex items-center space-x-4">
                <img
                  src={session.user?.image || '/default-avatar.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white">{session.user?.name}</span>
              </div>
            ) : (
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-shadow">
                ログイン
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
```

### 3. 画像生成フォームコンポーネント

#### components/generator/prompt-input.tsx
```tsx
'use client';

import { useState } from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  const [charCount, setCharCount] = useState(value.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 500) {
      onChange(newValue);
      setCharCount(newValue.length);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-white text-sm font-bold mb-2">
        キャラクター説明
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="例: 炎を纏った勇敢な戦士、赤い鎧を着て、燃える剣を持っている"
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
          rows={4}
        />
        <div className="absolute bottom-2 right-2 text-white/50 text-sm">
          {charCount}/500
        </div>
      </div>
    </div>
  );
}
```

#### components/generator/style-selector.tsx
```tsx
'use client';

interface StyleSelectorProps {
  rarity: string;
  onRarityChange: (rarity: string) => void;
  attribute: string;
  onAttributeChange: (attribute: string) => void;
}

const RARITIES = [
  { value: 'normal', label: 'ノーマル', color: 'from-gray-400 to-gray-600' },
  { value: 'rare', label: 'レア', color: 'from-blue-400 to-blue-600' },
  { value: 'super-rare', label: 'スーパーレア', color: 'from-yellow-400 to-orange-600' },
];

const ATTRIBUTES = [
  { value: '聖', label: '聖', icon: '✨' },
  { value: '魔', label: '魔', icon: '🔥' },
  { value: '天使', label: '天使', icon: '👼' },
  { value: '悪魔', label: '悪魔', icon: '😈' },
  { value: '守護', label: '守護', icon: '🛡️' },
  { value: '破壊', label: '破壊', icon: '⚡' },
];

export function StyleSelector({
  rarity,
  onRarityChange,
  attribute,
  onAttributeChange,
}: StyleSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white text-sm font-bold mb-3">
          レアリティ
        </label>
        <div className="grid grid-cols-3 gap-3">
          {RARITIES.map((r) => (
            <button
              key={r.value}
              onClick={() => onRarityChange(r.value)}
              className={`
                relative overflow-hidden rounded-lg p-4 transition-all
                ${rarity === r.value ? 'ring-2 ring-yellow-400 scale-105' : ''}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-80`} />
              <span className="relative text-white font-bold">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-bold mb-3">
          属性
        </label>
        <div className="grid grid-cols-3 gap-3">
          {ATTRIBUTES.map((attr) => (
            <button
              key={attr.value}
              onClick={() => onAttributeChange(attr.value)}
              className={`
                bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3
                hover:bg-white/20 transition-all
                ${attribute === attr.value ? 'ring-2 ring-yellow-400 bg-white/20' : ''}
              `}
            >
              <div className="text-2xl mb-1">{attr.icon}</div>
              <div className="text-white text-sm">{attr.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### components/generator/effects-panel.tsx
```tsx
'use client';

interface EffectsPanelProps {
  effects: {
    holographic: boolean;
    sparkle: boolean;
    aura: boolean;
  };
  onChange: (effects: any) => void;
}

export function EffectsPanel({ effects, onChange }: EffectsPanelProps) {
  const toggleEffect = (effect: string) => {
    onChange({
      ...effects,
      [effect]: !effects[effect],
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-white text-sm font-bold mb-3">
        特殊効果
      </label>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={effects.holographic}
            onChange={() => toggleEffect('holographic')}
            className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
          />
          <span className="text-white">ホログラフィック効果</span>
          <span className="text-white/50 text-sm">虹色の反射効果</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={effects.sparkle}
            onChange={() => toggleEffect('sparkle')}
            className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
          />
          <span className="text-white">キラキラ効果</span>
          <span className="text-white/50 text-sm">輝く粒子効果</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={effects.aura}
            onChange={() => toggleEffect('aura')}
            className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
          />
          <span className="text-white">オーラ効果</span>
          <span className="text-white/50 text-sm">光るオーラ効果</span>
        </label>
      </div>
    </div>
  );
}
```

### 4. プレビューコンポーネント

#### components/preview/image-preview.tsx
```tsx
'use client';

import { useState } from 'react';
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
        <img
          src={imageUrl}
          alt="Generated Bikkuriman sticker"
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
          <img
            src={imageUrl}
            alt="Generated Bikkuriman sticker"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
}
```

#### components/preview/loading-state.tsx
```tsx
export function LoadingState() {
  return (
    <div className="w-full aspect-square bg-white/5 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping" />
          <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-24 h-24 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">B</span>
          </div>
        </div>
        <p className="text-white mb-2">画像を生成中...</p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
```

### 5. ギャラリーコンポーネント

#### components/gallery/history-grid.tsx
```tsx
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
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </div>
      
      {hasMore && (
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
```

#### components/gallery/image-card.tsx
```tsx
'use client';

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
        <img
          src={imageUrl}
          alt={title}
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
```

### 6. 共通UIコンポーネント

#### components/ui/modal.tsx
```tsx
'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-gray-900 border border-white/20 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {title && (
          <div className="border-b border-white/20 px-6 py-4">
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
        )}
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

## アニメーション定義

### tailwind.config.tsへの追加
```typescript
export default {
  theme: {
    extend: {
      animation: {
        'holographic': 'holographic 3s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        holographic: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
        sparkle: {
          '0%, 100%': {
            opacity: '0',
            transform: 'scale(0)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
    },
  },
}
```

## レスポンシブデザイン

すべてのコンポーネントは以下のブレークポイントに対応：
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## アクセシビリティ

- 適切なARIAラベルの使用
- キーボードナビゲーション対応
- フォーカス状態の明確な表示
- スクリーンリーダー対応