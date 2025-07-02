# ビックリマンシール風画像生成ツール API仕様書

## 概要
Next.js API Routesを使用したビックリマンシール風画像生成APIの仕様書です。

## エンドポイント一覧

### 1. 画像生成API

#### エンドポイント
```
POST /api/generate
```

#### リクエスト
```typescript
interface GenerateRequest {
  prompt: string;              // キャラクター説明
  sourceImage?: string;        // 元画像のBase64またはURL（オプション）
  title: string;               // シールタイトル（上部に表示）
  characterName: string;       // キャラクター名
  attribute: string;           // 属性（聖/魔/天使など）
  rarity: "normal" | "rare" | "super-rare"; // レアリティ
  backgroundColor: string;     // 背景色
  effects: {
    holographic: boolean;      // ホログラフィック効果
    sparkle: boolean;          // キラキラ効果
    aura: boolean             // オーラ効果
  };
  style: {
    frameType: string;         // 枠のタイプ
    frameColor: string         // 枠の色
  };
  async?: boolean;             // 非同期処理フラグ（デフォルト: false）
}
```

#### レスポンス（同期処理）
```typescript
interface GenerateResponse {
  imageUrl: string;
  generationId: string;
  timestamp: string;
}
```

#### レスポンス（非同期処理）
```typescript
interface GenerateAsyncResponse {
  taskId: string;
  status: "pending";
  message: string;
}
```

#### 実装例（app/api/generate/route.ts）
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateImageAction } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.async) {
      const result = await generateImageAction(body);
      return NextResponse.json({
        taskId: result.taskId,
        status: 'pending',
        message: '画像生成を開始しました'
      });
    }
    
    // 同期処理の実装
    const imageUrl = await generateImage(body);
    return NextResponse.json({
      imageUrl,
      generationId: generateId(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 2. 画像生成状態確認API

#### エンドポイント
```
GET /api/generate/status/[taskId]
```

#### レスポンス
```typescript
interface TaskStatusResponse {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;        // 0-100
  imageUrl?: string;       // 完了時のみ
  error?: string;          // 失敗時のみ
}
```

#### 実装例（app/api/generate/status/[taskId]/route.ts）
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.taskId }
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const result = task.result ? JSON.parse(task.result) : null;
    
    return NextResponse.json({
      taskId: task.id,
      status: task.status,
      progress: task.progress || 0,
      imageUrl: result?.imageUrl,
      error: task.error
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 3. 画像アップロードAPI

#### エンドポイント
```
POST /api/upload
```

#### リクエスト
```
Content-Type: multipart/form-data
FormData: {
  image: File
}
```

#### レスポンス
```typescript
interface UploadResponse {
  imageUrl: string;
  uploadId: string;
}
```

#### 実装例（app/api/upload/route.ts）
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const blob = await put(file.name, file, {
      access: 'public',
    });
    
    return NextResponse.json({
      imageUrl: blob.url,
      uploadId: blob.pathname
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 4. 履歴取得API

#### エンドポイント
```
GET /api/history
```

#### クエリパラメータ
- `userId`: ユーザーID（必須）
- `limit`: 取得件数（デフォルト: 20）
- `offset`: オフセット（デフォルト: 0）

#### レスポンス
```typescript
interface HistoryResponse {
  history: Array<{
    generationId: string;
    imageUrl: string;
    prompt: string;
    timestamp: string;
    title: string;
    characterName: string;
    rarity: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

#### 実装例（app/api/history/route.ts）
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const [history, total] = await Promise.all([
      prisma.generatedImage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.generatedImage.count({
        where: { userId }
      })
    ]);
    
    return NextResponse.json({
      history: history.map(item => ({
        generationId: item.id,
        imageUrl: item.imageUrl,
        prompt: item.prompt,
        timestamp: item.createdAt.toISOString(),
        title: item.title,
        characterName: item.characterName,
        rarity: item.rarity
      })),
      total,
      hasMore: offset + limit < total
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 5. タスクストリーミングAPI（Server-Sent Events）

#### エンドポイント
```
GET /api/tasks/[taskId]/stream
```

#### レスポンス
Server-Sent Events形式でタスクの進行状況をストリーミング

```typescript
// イベントデータ形式
interface TaskEvent {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: {
    imageUrl: string;
  };
}
```

## エラーハンドリング

### エラーレスポンス形式
```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}
```

### HTTPステータスコード
- `200`: 成功
- `400`: 不正なリクエスト
- `401`: 認証エラー
- `404`: リソースが見つからない
- `429`: レート制限超過
- `500`: サーバーエラー

## 認証
NextAuth.jsを使用した認証が必要なエンドポイントには、セッションチェックを実装します。

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 処理を続行
}
```

## レート制限
Vercelのミドルウェアを使用してレート制限を実装します。

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```