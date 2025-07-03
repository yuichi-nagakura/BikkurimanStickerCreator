# ビックリマンシール風画像生成ツール

AIを使用してビックリマンシール風の画像を生成するWebアプリケーションです。

## 機能

- 🎨 キャラクター説明からAIが自動で画像生成
- ✨ 3つのレアリティ（ノーマル、レア、スーパーレア）
- 🌈 ホログラフィック、キラキラ、オーラなどの特殊効果
- 📁 生成履歴の保存と閲覧
- 💾 ローカル環境での動作

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: SQLite (Prisma ORM)
- **AI**: OpenAI DALL-E 3

## セットアップ

### 1. 必要なもの

- Node.js 20.x以上
- OpenAI APIキー

### 2. インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/BikkurimanStickerCreator.git
cd BikkurimanStickerCreator

# 依存関係のインストール
npm install
```

### 3. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な値を設定します。

```bash
cp .env.local.example .env
```

`.env`ファイルを編集：
```env
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_URL=file:./dev.db
```

### 4. データベースのセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev --name init
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 使い方

1. **画像生成ページ** (`/generate`)
   - シールタイトル、キャラクター名、説明を入力
   - レアリティと属性を選択
   - 特殊効果を設定
   - 「画像を生成」ボタンをクリック

2. **履歴ページ** (`/history`)
   - これまでに生成した画像の一覧を表示
   - 画像をクリックで拡大表示

## スクリプト

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# 本番サーバー
npm run start

# リント
npm run lint

# データベース管理
npm run db:migrate    # マイグレーション実行
npm run db:studio     # Prisma Studio起動
```

## ディレクトリ構造

```
├── app/                # Next.js App Router
├── components/         # UIコンポーネント
├── lib/               # ライブラリ・ユーティリティ
├── hooks/             # カスタムフック
├── types/             # TypeScript型定義
├── prisma/            # Prismaスキーマ
├── public/            # 静的ファイル
│   └── images/        # 生成画像保存
└── docs/              # ドキュメント
```

## トラブルシューティング

### 画像が表示されない
- `public/images`ディレクトリが存在することを確認
- ファイルの権限を確認

### データベースエラー
```bash
npx prisma migrate reset
```

### OpenAI APIエラー
- APIキーが正しく設定されているか確認
- APIの利用制限を確認

## ライセンス

MIT