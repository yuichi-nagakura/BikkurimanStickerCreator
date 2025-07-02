# ビックリマンシール風画像生成ツール 技術仕様書

## 1. アーキテクチャ概要

### 1.1 システム構成
```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  OpenAI API     │
│  (Full Stack)   │     │  (DALL-E 3)     │
└─────────────────┘     └─────────────────┘
        │
        ├──────┐
        ▼       ▼
┌─────────────────┐  ┌─────────────────┐
│   Database      │  │  Local Storage  │
│   (SQLite)      │  │  (public/images)│
└─────────────────┘  └─────────────────┘
```

### 1.2 技術スタック

#### フレームワーク
- **フレームワーク**: Next.js 14.x (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: SQLite (Prisma ORM)
- **ファイルストレージ**: ローカルファイルシステム

#### ローカル環境
- **実行環境**: Node.js 20.x
- **データベース**: SQLite (ローカルファイル)
- **画像保存**: public/imagesディレクトリ
- **ポート**: 3000 (デフォルト)

## 2. API設計

### 2.1 エンドポイント

#### 画像生成API
```typescript
POST /api/generate

// Next.js API Route: app/api/generate/route.ts
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
GET /api/generate/status/[taskId]

// Next.js API Route: app/api/generate/status/[taskId]/route.ts

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

// Next.js API Route: app/api/upload/route.ts
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
GET /api/history?limit={limit}&offset={offset}

// Next.js API Route: app/api/history/route.ts

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

### 3.1 Next.js App Router構成
```
app/
├── layout.tsx                 # ルートレイアウト
├── page.tsx                   # ホームページ
├── generate/
│   └── page.tsx              # 画像生成ページ
├── history/
│   └── page.tsx              # 履歴ページ
├── api/
│   ├── generate/
│   │   └── route.ts          # 画像生成API
│   ├── upload/
│   │   └── route.ts          # アップロードAPI
│   └── history/
│       └── route.ts          # 履歴API
├── components/
│   ├── generator/
│   │   ├── prompt-input.tsx
│   │   ├── style-selector.tsx
│   │   ├── effects-panel.tsx
│   │   └── generate-button.tsx
│   ├── preview/
│   │   ├── image-preview.tsx
│   │   ├── loading-state.tsx
│   │   └── error-state.tsx
│   ├── gallery/
│   │   ├── history-grid.tsx
│   │   └── image-card.tsx
│   └── ui/                    # 共通UIコンポーネント
│       ├── header.tsx
│       ├── footer.tsx
│       └── modal.tsx
├── hooks/
│   ├── use-image-generation.ts
│   ├── use-history.ts
│   └── use-local-storage.ts
├── lib/
│   ├── api.ts
│   ├── image-processing.ts
│   ├── db.ts                 # Prismaクライアント
│   └── openai.ts
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

### 4.1 画像保存処理
```typescript
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

class ImageStorageService {
  private storageDir = join(process.cwd(), 'public', 'images');
  
  async saveImage(imageUrl: string): Promise<string> {
    // OpenAI APIから画像をダウンロード
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    // ユニークなファイル名を生成
    const filename = `${uuidv4()}.png`;
    const filepath = join(this.storageDir, filename);
    
    // ファイルを保存
    await writeFile(filepath, Buffer.from(buffer));
    
    // 公開URLを返す
    return `/images/${filename}`;
  }
  
  async deleteImage(filename: string): Promise<void> {
    const filepath = join(this.storageDir, filename);
    await unlink(filepath);
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

### 6.1 ローカルストレージ最適化
- 定期的なクリーンアップ処理
- ファイル名にタイムスタンプを含める
- 適切なディレクトリ構造

### 6.2 キャッシング戦略
```typescript
// Next.jsのキャッシュ機能を使用
import { unstable_cache } from 'next/cache';

const getCachedImage = unstable_cache(
  async (prompt: string) => {
    // SQLiteから既存の画像を検索
    const cachedImage = await prisma.generatedImage.findFirst({
      where: { prompt },
      orderBy: { createdAt: 'desc' }
    });
    return cachedImage?.imageUrl || null;
  },
  ['image-cache'],
  { revalidate: 3600 } // 1時間キャッシュ
);
```

## 7. 非同期処理とタスク管理

### 7.1 タスクキューシステム
```typescript
// Next.js Server Actionsを使用した非同期処理
import { createTask, updateTaskProgress } from '@/lib/tasks';

export async function generateImageAction(data: GenerationRequest) {
  'use server';
  
  // タスクをSQLiteに保存
  const task = await prisma.task.create({
    data: {
      status: 'pending',
      data: JSON.stringify(data)
    }
  });
  
  // バックグラウンドで処理を実行
  processImageGeneration(task.id, data)
    .catch(error => {
      prisma.task.update({
        where: { id: task.id },
        data: { status: 'failed', error: error.message }
      });
    });
  
  return { taskId: task.id };
}

async function processImageGeneration(taskId: string, data: GenerationRequest) {
  // 進捗更新
  await updateTaskProgress(taskId, 10);
  
  // 画像生成
  const imageUrl = await openAIService.generateImage(data.prompt, data.sourceImage);
  await updateTaskProgress(taskId, 80);
  
  // 後処理
  const processedUrl = await postProcessImage(imageUrl, data.rarity);
  await updateTaskProgress(taskId, 100);
  
  // タスクを完了としてマーク
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'completed',
      result: JSON.stringify({ imageUrl: processedUrl })
    }
  });
}
```

### 7.2 WebSocket通知
```typescript
// Server-Sent Events (SSE)を使用したリアルタイム通知
// app/api/tasks/[taskId]/stream/route.ts
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // タスクの状態を定期的にチェック
      const interval = setInterval(async () => {
        const task = await prisma.task.findUnique({
          where: { id: params.taskId }
        });
        
        if (!task) {
          clearInterval(interval);
          controller.close();
          return;
        }
        
        const data = `data: ${JSON.stringify({
          taskId: task.id,
          status: task.status,
          progress: task.progress,
          result: task.result ? JSON.parse(task.result) : null
        })}\n\n`;
        
        controller.enqueue(encoder.encode(data));
        
        if (task.status === 'completed' || task.status === 'failed') {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
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

## 11. ローカル開発環境

### 11.1 セットアップ
```bash
# 依存関係のインストール
npm install

# データベースの初期化
npx prisma generate
npx prisma migrate dev

# 画像保存ディレクトリの作成
mkdir -p public/images

# 開発サーバーの起動
npm run dev
```

### 11.2 環境変数
```env
# .env.local
OPENAI_API_KEY=sk-xxx
DATABASE_URL=file:./dev.db
```

## 12. ローカルデバッグ

### 12.1 デバッグツール
- Next.jsのデバッグ機能
- console.logによるログ出力
- Prisma Studioでのデータベース確認

```bash
# Prisma Studioの起動
npx prisma studio
```

### 12.2 開発用コマンド
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```