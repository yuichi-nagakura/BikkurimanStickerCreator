'use client';

import { useState } from 'react';
import { PromptInput } from '@/components/generator/prompt-input';
import { StyleSelector } from '@/components/generator/style-selector';
import { EffectsPanel } from '@/components/generator/effects-panel';
import { GenerateButton } from '@/components/generator/generate-button';
import { ImageUpload } from '@/components/generator/image-upload';
import { ImagePreview } from '@/components/preview/image-preview';
import { useImageGeneration } from '@/hooks/use-image-generation';
import type { GenerateRequest } from '@/types';

export default function GeneratePage() {
  const { generateImage, isLoading, error, generatedImage } = useImageGeneration();

  const [formData, setFormData] = useState<GenerateRequest>({
    prompt: '',
    title: '',
    characterName: '',
    attribute: '聖',
    rarity: 'normal',
    backgroundColor: '#000000',
    effects: {
      holographic: true,
      sparkle: false,
      aura: false,
    },
    style: {
      frameType: 'ornate',
      frameColor: '#silver',
    },
    async: true,
  });

  const handleGenerate = async () => {
    if (!formData.title || !formData.characterName) {
      alert('タイトルとキャラクター名は必須です');
      return;
    }
    
    if (!formData.prompt && !formData.sourceImage) {
      alert('キャラクター説明または画像のいずれかを入力してください');
      return;
    }

    await generateImage(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8 text-center title-gothic">
        ビックリマンシール生成
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：入力フォーム */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  シールタイトル <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="例: 炎の戦士"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  キャラクター名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.characterName}
                  onChange={(e) => updateFormData('characterName', e.target.value)}
                  placeholder="例: ファイアーナイト"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <PromptInput
                value={formData.prompt}
                onChange={(value) => updateFormData('prompt', value)}
                hasSourceImage={!!formData.sourceImage}
              />
              
              <ImageUpload
                onImageUpload={(imageUrl) => updateFormData('sourceImage', imageUrl)}
                currentImage={formData.sourceImage}
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <StyleSelector
              rarity={formData.rarity}
              onRarityChange={(value) => updateFormData('rarity', value)}
              attribute={formData.attribute}
              onAttributeChange={(value) => updateFormData('attribute', value)}
            />
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <EffectsPanel
              effects={formData.effects}
              onChange={(value) => updateFormData('effects', value)}
            />
          </div>

          <GenerateButton
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={(!formData.prompt && !formData.sourceImage) || !formData.title || !formData.characterName}
          />
        </div>

        {/* 右側：プレビュー */}
        <div className="lg:sticky lg:top-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">プレビュー</h2>
            <ImagePreview
              imageUrl={generatedImage?.imageUrl}
              isLoading={isLoading}
              error={error || undefined}
            />
            
            {generatedImage && (
              <div className="mt-4 space-y-2">
                <a
                  href={generatedImage.imageUrl}
                  download={`bikkuriman-${generatedImage.generationId}.png`}
                  className="block w-full py-2 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-center font-bold hover:shadow-lg transition-all"
                >
                  画像をダウンロード
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}