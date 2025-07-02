# ビックリマンシール風画像生成ツール 技術仕様書

## 1. アーキテクチャ概要

### 1.1 システム構成
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│  OpenAI API     │
│   (React)       │     │   (Node.js)     │     │  (GPT-4o)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐
│   Static Files  │     │   Database      │
│   (CDN)         │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘
```

### 1.2 技術スタック

#### フロントエンド
- **フレームワーク**: React 18.x
- **状態管理**: Redux Toolkit / Zustand
- **スタイリング**: Tailwind CSS / Styled Components
- **ビルドツール**: Vite
- **言語**: TypeScript
- **画像処理**: Canvas API / fabric.js

#### バックエンド
- **実行環境**: Node.js 20.x
- **フレームワーク**: Express.js / Fastify
- **言語**: TypeScript
- **認証**: JWT
- **APIドキュメント**: OpenAPI/Swagger

#### インフラ
- **ホスティング**: Vercel (Frontend) / Railway or Render (Backend)
- **データベース**: PostgreSQL (Supabase)
- **ファイルストレージ**: Cloudinary / AWS S3
- **CDN**: Cloudflare

## 2. API設計

### 2.1 エンドポイント

#### 画像生成API
```typescript
POST /api/generate
{
  "prompt": string,           // キャラクター説明
  "sourceImage"?: string,     // 元画像のBase64またはURL（オプション）
  "title": string,            // シールタイトル（上部に表示）
  "characterName": string,    // キャラクター名
  "attribute": string,        // 属性（聖/魔/天使など）
  "rarity": "normal" | "rare" | "super-rare", // レアリティ
  "backgroundColor": string,  // 背景色
  "effects": {
    "holographic": boolean,   // ホログラフィック効果
    "sparkle": boolean,       // キラキラ効果
    "aura": boolean          // オーラ効果
  },
  "style": {
    "frameType": string,      // 枠のタイプ
    "frameColor": string      // 枠の色
  },
  "async": boolean           // 非同期処理フラグ
}

Response (同期処理):
{
  "imageUrl": string,
  "generationId": string,
  "timestamp": string
}

Response (非同期処理):
{
  "taskId": string,
  "status": "pending",
  "message": "画像生成を開始しました"
}
```

#### 画像生成状態確認API
```typescript
GET /api/generate/status/{taskId}

Response:
{
  "taskId": string,
  "status": "pending" | "processing" | "completed" | "failed",
  "progress": number,        // 0-100
  "imageUrl"?: string,       // 完了時のみ
  "error"?: string          // 失敗時のみ
}
```

#### 画像アップロードAPI
```typescript
POST /api/upload
Content-Type: multipart/form-data

{
  "image": File
}

Response:
{
  "imageUrl": string,
  "uploadId": string
}
```

#### 履歴取得API
```typescript
GET /api/history?userId={userId}&limit={limit}&offset={offset}

Response:
{
  "history": [
    {
      "generationId": string,
      "imageUrl": string,
      "prompt": string,
      "timestamp": string
    }
  ],
  "total": number
}
```

### 2.2 OpenAI API統合

#### プロンプトエンジニアリング
```typescript
const generatePrompt = (userInput: GenerationRequest): string => {
  const basePrompt = userInput.sourceImage 
    ? `Transform the provided image into a Bikkuriman-style holographic sticker`
    : `Create a Bikkuriman-style holographic sticker image`;

  // レアリティに応じた効果の調整
  const rarityEffects = {
    'normal': {
      background: 'Standard holographic effect',
      frame: 'Silver decorative frame',
      effects: 'Basic sparkles and shine'
    },
    'rare': {
      background: 'Enhanced prismatic holographic effect with stronger rainbow reflections',
      frame: 'Golden ornate frame with intricate patterns',
      effects: 'Abundant sparkles, light rays, and medium aura'
    },
    'super-rare': {
      background: 'Extreme holographic effect with intense rainbow prism and cosmic patterns',
      frame: 'Premium golden frame with elaborate decorations and jewels',
      effects: 'Maximum sparkles, intense light beams, powerful aura, and energy effects'
    }
  };

  const rarity = rarityEffects[userInput.rarity] || rarityEffects.normal;

  return `
    ${basePrompt} with the following specifications:
    
    Title (top of sticker): ${userInput.title}
    Character: ${userInput.prompt}
    Name: ${userInput.characterName}
    Attribute: ${userInput.attribute}
    Rarity: ${userInput.rarity.toUpperCase()}
    
    Style requirements:
    - ${rarity.background}
    - ${rarity.frame}
    - Character prominently displayed in the center
    - Gothic or decorative font for the character name and title
    - ${rarity.effects}
    - ${userInput.effects.holographic ? 'Additional holographic overlay' : ''}
    - ${userInput.effects.sparkle ? 'Extra sparkle effects throughout' : ''}
    - ${userInput.effects.aura ? 'Strong glowing aura around character' : ''}
    
    The overall aesthetic should match Japanese Bikkuriman chocolate stickers from the 1980s-1990s.
  `;
};
```

#### API呼び出し実装
```typescript
interface OpenAIService {
  generateImage(prompt: string, sourceImage?: string): Promise<string>;
  generateImageAsync(prompt: string, sourceImage?: string): Promise<string>;
}

class OpenAIServiceImpl implements OpenAIService {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  async generateImage(prompt: string, sourceImage?: string): Promise<string> {
    const params = sourceImage 
      ? {
          model: "dall-e-2",  // Image edits require DALL-E 2
          image: sourceImage,
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        }
      : {
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid"
        };

    const response = sourceImage
      ? await this.client.images.edit(params as any)
      : await this.client.images.generate(params as any);
    
    return response.data[0].url;
  }

  async generateImageAsync(prompt: string, sourceImage?: string): Promise<string> {
    // キューに追加して、タスクIDを返す実装
    const taskId = generateTaskId();
    
    // バックグラウンドジョブとして処理
    this.processQueue.add({
      taskId,
      prompt,
      sourceImage,
      type: 'image-generation'
    });
    
    return taskId;
  }
}
```

## 3. フロントエンド設計

### 3.1 コンポーネント構成
```
src/
├── components/
│   ├── Generator/
│   │   ├── PromptInput.tsx
│   │   ├── StyleSelector.tsx
│   │   ├── EffectsPanel.tsx
│   │   └── GenerateButton.tsx
│   ├── Preview/
│   │   ├── ImagePreview.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorState.tsx
│   ├── Gallery/
│   │   ├── HistoryGrid.tsx
│   │   └── ImageCard.tsx
│   └── Common/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useImageGeneration.ts
│   ├── useHistory.ts
│   └── useLocalStorage.ts
├── services/
│   ├── api.ts
│   └── imageProcessing.ts
└── utils/
    ├── constants.ts
    └── helpers.ts
```

### 3.2 状態管理
```typescript
interface AppState {
  generation: {
    isGenerating: boolean;
    currentImage: string | null;
    error: string | null;
    settings: GenerationSettings;
  };
  history: {
    items: GeneratedImage[];
    isLoading: boolean;
    hasMore: boolean;
  };
  user: {
    id: string;
    preferences: UserPreferences;
  };
}
```

## 4. 画像後処理

### 4.1 Canvas処理でのエフェクト追加
```typescript
class ImagePostProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  addHolographicEffect(image: HTMLImageElement): void {
    // グラデーションオーバーレイ
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
    gradient.addColorStop(0.33, 'rgba(0, 255, 0, 0.3)');
    gradient.addColorStop(0.66, 'rgba(0, 0, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 0, 255, 0.3)');
    
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  addSparkleEffect(): void {
    // パーティクルエフェクトの追加
    const particles = this.generateSparkleParticles();
    particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      this.ctx.fill();
    });
  }
  
  addFrame(frameType: string, color: string): void {
    // 装飾的な枠の追加
    // SVGパスを使用した複雑な枠デザイン
  }
}
```

## 5. セキュリティ対策

### 5.1 APIキー管理
```typescript
// 環境変数での管理
const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分
    max: 10 // 最大10リクエスト
  }
};
```

### 5.2 入力検証
```typescript
const validateGenerationRequest = (req: GenerationRequest): ValidationResult => {
  const errors: string[] = [];
  
  if (req.prompt.length > 500) {
    errors.push('Prompt is too long');
  }
  
  if (!isValidAttribute(req.attribute)) {
    errors.push('Invalid attribute');
  }
  
  // コンテンツフィルタリング
  if (containsInappropriateContent(req.prompt)) {
    errors.push('Inappropriate content detected');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

## 6. パフォーマンス最適化

### 6.1 画像最適化
- WebP形式での配信
- 複数解像度の提供（srcset）
- 遅延読み込み実装

### 6.2 キャッシング戦略
```typescript
// Redisを使用したキャッシング
class CacheService {
  async getCachedImage(prompt: string): Promise<string | null> {
    const key = this.generateCacheKey(prompt);
    return await redis.get(key);
  }
  
  async cacheImage(prompt: string, imageUrl: string): Promise<void> {
    const key = this.generateCacheKey(prompt);
    await redis.setex(key, 3600, imageUrl); // 1時間キャッシュ
  }
}
```

## 7. 非同期処理とタスク管理

### 7.1 タスクキューシステム
```typescript
// Bull Queueを使用した非同期処理
import Queue from 'bull';

const imageGenerationQueue = new Queue('image-generation', {
  redis: {
    port: 6379,
    host: 'localhost'
  }
});

// ワーカー定義
imageGenerationQueue.process(async (job) => {
  const { taskId, prompt, sourceImage, rarity } = job.data;
  
  try {
    // 進捗更新
    await job.progress(10);
    
    // 画像生成
    const imageUrl = await openAIService.generateImage(prompt, sourceImage);
    await job.progress(80);
    
    // 後処理（レアリティエフェクト追加など）
    const processedUrl = await postProcessImage(imageUrl, rarity);
    await job.progress(100);
    
    return { taskId, imageUrl: processedUrl };
  } catch (error) {
    throw new Error(`Generation failed: ${error.message}`);
  }
});
```

### 7.2 WebSocket通知
```typescript
// Socket.ioを使用したリアルタイム通知
io.on('connection', (socket) => {
  socket.on('subscribe-task', (taskId) => {
    socket.join(`task:${taskId}`);
  });
});

// タスク完了時の通知
imageGenerationQueue.on('completed', (job, result) => {
  io.to(`task:${result.taskId}`).emit('generation-complete', {
    taskId: result.taskId,
    imageUrl: result.imageUrl,
    status: 'completed'
  });
});

// 進捗通知
imageGenerationQueue.on('progress', (job, progress) => {
  io.to(`task:${job.data.taskId}`).emit('generation-progress', {
    taskId: job.data.taskId,
    progress: progress,
    status: 'processing'
  });
});
```

## 8. エラーハンドリング

### 8.1 エラー種別
```typescript
enum ErrorType {
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }
}
```

### 8.2 リトライ機構
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 9. プロンプトエンジニアリング最適化

### 9.1 詳細なプロンプト構造
```typescript
interface PromptTemplate {
  character: {
    style: string;
    pose: string;
    expression: string;
    hair: string;
  };
  clothing: {
    hat?: {
      color: string;
      text: string;
    };
    top: {
      type: string;
      design: string;
    };
    inner?: {
      type: string;
      text: string;
    };
    bottom: string;
    shoes: string;
  };
  background: {
    pattern: string;
    text: {
      position: string;
      content: string;
      style: string;
    };
  };
  atmosphere: {
    colors: string;
    themes: string[];
  };
  imageSize: string;
}

// サンプルプロンプト実装
const createDetailedPrompt = (template: PromptTemplate): string => {
  return `
キャラクター:
 スタイル: "${template.character.style}"
 ポーズ: "${template.character.pose}"
 表情: "${template.character.expression}"
 髪型: "${template.character.hair}"
 ${template.clothing.hat ? `帽子:
 色: "${template.clothing.hat.color}"
 テキスト: "${template.clothing.hat.text}"` : ''}
 トップス:
 種類: "${template.clothing.top.type}"
 デザイン: "${template.clothing.top.design}"
 ${template.clothing.inner ? `インナー:
 種類: "${template.clothing.inner.type}"
 テキスト: "${template.clothing.inner.text}"` : ''}
 ボトムス:
 種類: "${template.clothing.bottom}"
 シューズ:
 種類: "${template.clothing.shoes}"
背景:
 パターン: "${template.background.pattern}" 
 テキスト:
 位置: "${template.background.text.position}"
 内容: "${template.background.text.content}"
 スタイル: "${template.background.text.style}"
雰囲気:
 色合い: "${template.atmosphere.colors}"
 テーマ: ${JSON.stringify(template.atmosphere.themes)}
用途:
 - "SNSアイコン"
 - "アバターキャラクター"
 - "グッズ用イラスト"
画像サイズ:
${template.imageSize}
  `.trim();
};
```

### 9.2 レアリティ別プロンプト調整
```typescript
const rarityPromptEnhancements = {
  normal: {
    effects: "シンプルなキラキラ効果",
    frame: "標準的な銀色の枠",
    background: "基本的なホログラム模様"
  },
  rare: {
    effects: "豪華なキラキラ効果、光の筋、中程度のオーラ",
    frame: "金色の装飾的な枠",
    background: "虹色のプリズム効果を持つホログラム背景"
  },
  "super-rare": {
    effects: "最大級のキラキラ、強烈な光線、パワフルなオーラ、エネルギー効果",
    frame: "プレミアムゴールドの精巧な装飾と宝石付きの枠",
    background: "宇宙的なパターンを含む強烈なホログラム効果"
  }
};
```

## 10. テスト戦略

### 10.1 単体テスト
- Jest + React Testing Library
- API エンドポイントのテスト
- コンポーネントのテスト

### 10.2 統合テスト
- Cypress によるE2Eテスト
- API モックの使用

### 10.3 パフォーマンステスト
- Lighthouse CI
- 画像生成時間の計測

## 11. デプロイメント

### 11.1 CI/CD パイプライン
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
```

### 11.2 環境変数
```env
# .env.production
OPENAI_API_KEY=sk-xxx
DATABASE_URL=postgresql://xxx
REDIS_URL=redis://xxx
CLOUDINARY_URL=cloudinary://xxx
```

## 12. モニタリング

### 12.1 ログ収集
- Sentry によるエラートラッキング
- Datadog によるパフォーマンス監視

### 12.2 メトリクス
- API レスポンスタイム
- 画像生成成功率
- ユーザーアクティビティ