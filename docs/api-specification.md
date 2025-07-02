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
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filename = `${uuidv4()}-${file.name}`;
    const filepath = join(process.cwd(), 'public', 'images', filename);
    
    await writeFile(filepath, buffer);
    
    return NextResponse.json({
      imageUrl: `/images/${filename}`,
      uploadId: filename
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const [history, total] = await Promise.all([
      prisma.generatedImage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.generatedImage.count()
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
- `404`: リソースが見つからない
- `429`: レート制限超過
- `500`: サーバーエラー


## レート制限
ローカル開発環境ではシンプルなメモリベースのレート制限を実装します。

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// メモリベースのレート制限
 const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分
  const maxRequests = 10;
  
  const requestData = requestCounts.get(ip);
  
  if (!requestData || now > requestData.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
  } else if (requestData.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  } else {
    requestData.count++;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```