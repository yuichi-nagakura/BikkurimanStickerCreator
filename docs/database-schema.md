# ビックリマンシール風画像生成ツール データベース設計書

## 概要
SQLiteを使用したデータベース設計です。Prisma ORMを使用してスキーマを定義します。

## Prismaスキーマ定義

### prisma/schema.prisma
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}


// 生成画像テーブル
model GeneratedImage {
  id              String   @id @default(cuid())
  imageUrl        String
  prompt          String
  sourceImageUrl  String?
  title           String
  characterName   String
  attribute       String
  rarity          String
  backgroundColor String
  effects         String   // JSON string
  style           String   // JSON string
  createdAt       DateTime @default(now())
  
  @@index([createdAt])
}

// タスクテーブル（非同期処理用）
model Task {
  id        String   @id @default(cuid())
  status    String   // pending, processing, completed, failed
  progress  Int      @default(0)
  data      String   // JSON string (リクエストデータ)
  result    String?  // JSON string (結果データ)
  error     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([status])
  @@index([createdAt])
}

// 画像キャッシュテーブル
model ImageCache {
  id           String   @id @default(cuid())
  promptHash   String   @unique
  imageUrl     String
  metadata     String?  // JSON string
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  @@index([expiresAt])
}

// 利用統計テーブル
model UsageStats {
  id              String   @id @default(cuid())
  date            DateTime
  imageCount      Int      @default(0)
  totalTokens     Int      @default(0)
  successCount    Int      @default(0)
  failureCount    Int      @default(0)
  
  @@unique([date])
  @@index([date])
}
```

## テーブル詳細

### 1. GeneratedImage（生成画像）
生成された画像の情報を保存するテーブル。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | String | 画像ID（CUID） |
| imageUrl | String | 生成画像のURL |
| prompt | String | 生成プロンプト |
| sourceImageUrl | String? | 元画像URL |
| title | String | シールタイトル |
| characterName | String | キャラクター名 |
| attribute | String | 属性 |
| rarity | String | レアリティ |
| backgroundColor | String | 背景色 |
| effects | String | エフェクト設定（JSON） |
| style | String | スタイル設定（JSON） |
| createdAt | DateTime | 作成日時 |

### 2. Task（タスク）
非同期処理のタスク管理テーブル。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | String | タスクID（CUID） |
| status | String | ステータス |
| progress | Int | 進捗（0-100） |
| data | String | リクエストデータ（JSON） |
| result | String? | 結果データ（JSON） |
| error | String? | エラーメッセージ |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### 3. ImageCache（画像キャッシュ）
画像生成結果のキャッシュテーブル。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | String | キャッシュID（CUID） |
| promptHash | String | プロンプトのハッシュ値 |
| imageUrl | String | キャッシュされた画像URL |
| metadata | String? | メタデータ（JSON） |
| expiresAt | DateTime | 有効期限 |
| createdAt | DateTime | 作成日時 |

### 4. UsageStats（利用統計）
日別利用統計。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | String | 統計ID（CUID） |
| date | DateTime | 日付 |
| imageCount | Int | 生成画像数 |
| totalTokens | Int | 使用トークン数 |
| successCount | Int | 成功回数 |
| failureCount | Int | 失敗回数 |

## マイグレーション

### 初期セットアップ
```bash
# Prismaクライアントの生成
npx prisma generate

# データベースの作成とマイグレーション
npx prisma migrate dev --name init

# 本番環境へのデプロイ
npx prisma migrate deploy
```

### データベース接続設定
```env
# .env.local
DATABASE_URL="file:./dev.db"

# .env.production
DATABASE_URL="file:./prod.db"
```

## インデックス設計

### パフォーマンス最適化のためのインデックス
1. **GeneratedImage**
   - `(createdAt)`: 履歴取得を高速化

2. **Task**
   - `(status)`: タスク状態確認を高速化
   - `(createdAt)`: 古いタスクのクリーンアップ用

3. **ImageCache**
   - `(expiresAt)`: 期限切れキャッシュのクリーンアップ用

4. **UsageStats**
   - `(date)`: 日付範囲での集計

## データ操作例

### 画像生成履歴取得
```typescript
const history = await prisma.generatedImage.findMany({
  orderBy: {
    createdAt: 'desc'
  },
  take: 20,
  skip: offset
});
```

### タスクの進捗更新
```typescript
await prisma.task.update({
  where: {
    id: taskId
  },
  data: {
    status: 'processing',
    progress: 50
  }
});
```

### 利用統計の更新
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

await prisma.usageStats.upsert({
  where: {
    date: today
  },
  update: {
    imageCount: {
      increment: 1
    },
    successCount: {
      increment: 1
    }
  },
  create: {
    date: today,
    imageCount: 1,
    successCount: 1
  }
});
```

## バックアップとメンテナンス

### SQLiteバックアップ
```bash
# データベースファイルのバックアップ
cp prisma/prod.db prisma/backup/prod_$(date +%Y%m%d_%H%M%S).db

# 定期的なVACUUM実行
sqlite3 prisma/prod.db "VACUUM;"
```

### データクリーンアップ
```typescript
// 古いタスクの削除
await prisma.task.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7日以前
    },
    status: {
      in: ['completed', 'failed']
    }
  }
});

// 期限切れキャッシュの削除
await prisma.imageCache.deleteMany({
  where: {
    expiresAt: {
      lt: new Date()
    }
  }
});
```