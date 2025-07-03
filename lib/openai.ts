import OpenAI from 'openai';
import type { GenerateRequest } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIService {
  private async analyzeSourceImage(imageUrl: string): Promise<string> {
    try {
      // Convert relative URL to absolute URL if needed
      let fullImageUrl = imageUrl;
      if (imageUrl.startsWith('/')) {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';
        fullImageUrl = `${baseUrl}${imageUrl}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "この画像の主要な要素（キャラクター、オブジェクト、色、スタイルなど）を詳細に説明してください。ビックリマン風のシールにするための参考情報として使用します。"
              },
              {
                type: "image_url",
                image_url: {
                  url: fullImageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error('Image analysis error:', error);
      return "";
    }
  }

  private async generatePrompt(userInput: GenerateRequest): Promise<string> {
    let characterDescription = userInput.prompt || '';
    
    if (userInput.sourceImage) {
      const imageAnalysis = await this.analyzeSourceImage(userInput.sourceImage);
      if (imageAnalysis) {
        characterDescription = userInput.prompt 
          ? `${userInput.prompt}。元画像の分析: ${imageAnalysis}`
          : `元画像の分析: ${imageAnalysis}`;
      }
    }

    const basePrompt = `ビックリマン風のホログラフィックシール画像を作成してください`;

    // レアリティに応じた効果の調整
    const rarityEffects = {
      'normal': {
        background: '基本的なホログラム模様',
        frame: '標準的な銀色の枠',
        effects: 'シンプルなキラキラ効果'
      },
      'rare': {
        background: '虹色のプリズム効果を持つホログラム背景、強い虹色の反射',
        frame: '金色の装飾的な枠、複雑な模様付き',
        effects: '豪華なキラキラ効果、光の筋、中程度のオーラ'
      },
      'super-rare': {
        background: '宇宙的なパターンを含む強烈なホログラム効果、極度の虹色プリズムと宇宙模様',
        frame: 'プレミアムゴールドの精巧な装飾と宝石付きの枠',
        effects: '最大級のキラキラ、強烈な光線、パワフルなオーラ、エネルギー効果'
      }
    };

    const rarity = rarityEffects[userInput.rarity] || rarityEffects.normal;

    return `
      ${basePrompt}

      以下の仕様で作成してください：
      
      シールタイトル（上部表示）: ${userInput.title}
      キャラクター: ${characterDescription}
      キャラクター名: ${userInput.characterName}
      属性: ${userInput.attribute}
      レアリティ: ${userInput.rarity.toUpperCase()}
      
      スタイル要件:
      - ${rarity.background}
      - ${rarity.frame}
      - キャラクターを中央に大きく配置
      - キャラクター名とタイトルはゴシック体または装飾的なフォント
      - ${rarity.effects}
      - ${userInput.effects.holographic ? '追加のホログラフィック効果を重ねて適用' : ''}
      - ${userInput.effects.sparkle ? '全体に追加のキラキラ効果を散りばめる' : ''}
      - ${userInput.effects.aura ? 'キャラクター周囲に強い光るオーラ効果' : ''}
      
      全体の美学は1980年代-1990年代の日本のビックリマンチョコシールのスタイルに合わせてください。
    `;
  }

  async generateImage(userInput: GenerateRequest): Promise<string> {
    const prompt = await this.generatePrompt(userInput);

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "medium",
      });

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error('No image URL returned from OpenAI');
      }

      return response.data[0].url;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate image');
    }
  }
}

export const openAIService = new OpenAIService();