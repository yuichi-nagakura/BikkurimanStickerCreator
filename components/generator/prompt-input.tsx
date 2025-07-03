'use client';

import { useState } from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  hasSourceImage?: boolean;
}

export function PromptInput({ value, onChange, hasSourceImage }: PromptInputProps) {
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
        キャラクター説明 {!hasSourceImage && <span className="text-red-400">*</span>}
        {hasSourceImage && <span className="text-white/70 text-xs font-normal ml-2">（任意：画像から自動生成されます）</span>}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={hasSourceImage 
            ? "画像から自動的に特徴を抽出します（追加の説明を入力することもできます）" 
            : "例: 炎を纏った勇敢な戦士、赤い鎧を着て、燃える剣を持っている"}
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