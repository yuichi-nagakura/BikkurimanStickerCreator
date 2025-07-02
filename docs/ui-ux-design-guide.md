# ビックリマンシール風画像生成ツール UI/UXデザインガイドライン

## 1. デザインコンセプト

### 1.1 ビジュアルテーマ
- **キーワード**: ノスタルジック、ポップ、キラキラ、レトロフューチャー
- **インスピレーション**: 80-90年代のビックリマンシール、ホログラムカード、アーケードゲーム

### 1.2 デザイン原則
1. **遊び心**: 楽しさと驚きを提供する
2. **直感的**: 初めてのユーザーでも迷わない
3. **インタラクティブ**: 触って楽しい体験
4. **レスポンシブ**: あらゆるデバイスで快適に

## 2. カラーパレット

### 2.1 プライマリカラー
```css
--primary-gold: #FFD700;      /* ゴールド - メインアクセント */
--primary-purple: #8B00FF;    /* パープル - ミスティック感 */
--primary-cyan: #00CED1;      /* シアン - ホログラフィック感 */
```

### 2.2 セカンダリカラー
```css
--secondary-pink: #FF69B4;    /* ホットピンク - エネルギー */
--secondary-blue: #4169E1;    /* ロイヤルブルー - 信頼感 */
--secondary-green: #32CD32;   /* ライムグリーン - 新鮮さ */
```

### 2.3 ニュートラルカラー
```css
--neutral-black: #1A1A1A;     /* ダークグレー - 背景 */
--neutral-gray: #666666;      /* ミディアムグレー - テキスト */
--neutral-white: #FFFFFF;     /* ホワイト - ハイライト */
```

### 2.4 グラデーション
```css
--gradient-holographic: linear-gradient(
  45deg,
  #FF00FF 0%,
  #00FFFF 25%,
  #FFFF00 50%,
  #FF00FF 75%,
  #00FFFF 100%
);

--gradient-metallic: linear-gradient(
  135deg,
  #FFD700 0%,
  #FFA500 50%,
  #FFD700 100%
);
```

## 3. タイポグラフィ

### 3.1 フォントファミリー
```css
--font-display: 'Bebas Neue', sans-serif;     /* 見出し用 */
--font-body: 'Noto Sans JP', sans-serif;      /* 本文用 */
--font-decorative: 'Bungee', cursive;         /* 装飾用 */
```

### 3.2 フォントサイズ
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## 4. レイアウト構成

### 4.1 デスクトップレイアウト（1200px以上）
```
┌─────────────────────────────────────────────────┐
│                   Header                         │
├─────────────────────────┬───────────────────────┤
│                         │                       │
│   Generation Panel      │   Preview Area        │
│   (40%)                │   (60%)               │
│                         │                       │
│   - Prompt Input        │   - Live Preview      │
│   - Style Options       │   - Loading State     │
│   - Effects Controls    │   - Download Button   │
│                         │                       │
├─────────────────────────┴───────────────────────┤
│              History Gallery                     │
└─────────────────────────────────────────────────┘
```

### 4.2 モバイルレイアウト（768px以下）
```
┌─────────────────┐
│     Header      │
├─────────────────┤
│ Generation Panel│
├─────────────────┤
│  Preview Area   │
├─────────────────┤
│ History Gallery │
└─────────────────┘
```

## 5. コンポーネントデザイン

### 5.1 入力フィールド
```css
.input-field {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--primary-gold);
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.input-field:focus {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  transform: translateY(-2px);
}
```

### 5.2 レアリティセレクター
```css
.rarity-selector {
  display: flex;
  gap: 16px;
  margin: 20px 0;
}

.rarity-option {
  flex: 1;
  padding: 16px;
  border: 2px solid transparent;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.rarity-option.normal {
  background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
  border-color: #808080;
}

.rarity-option.rare {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-color: #FFD700;
}

.rarity-option.super-rare {
  background: var(--gradient-holographic);
  border-color: #FF00FF;
  animation: holographic-shift 3s ease-in-out infinite;
}

.rarity-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.rarity-option.selected {
  border-width: 4px;
  transform: scale(1.05);
}
```

### 5.3 画像アップロードエリア
```css
.upload-area {
  border: 3px dashed var(--primary-cyan);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  background: rgba(0, 206, 209, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.upload-area:hover {
  background: rgba(0, 206, 209, 0.2);
  border-color: var(--primary-gold);
  transform: scale(1.02);
}

.upload-area.dragover {
  background: rgba(255, 215, 0, 0.3);
  border-color: var(--primary-gold);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.upload-preview {
  margin-top: 20px;
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
```

### 5.4 ボタンスタイル

#### プライマリボタン（生成ボタン）
```css
.btn-primary {
  background: var(--gradient-metallic);
  color: var(--neutral-black);
  font-weight: bold;
  padding: 16px 32px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: all 0.5s;
}

.btn-primary:hover::before {
  animation: shine 0.5s ease-in-out;
}
```

### 5.5 カードデザイン
```css
.image-card {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 30px rgba(138, 0, 255, 0.3);
  border-color: var(--primary-purple);
}
```

## 6. アニメーション & インタラクション

### 6.1 ローディングアニメーション
```css
@keyframes holographic-spin {
  0% {
    transform: rotate(0deg);
    filter: hue-rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
    filter: hue-rotate(360deg);
  }
}

.loading-spinner {
  width: 80px;
  height: 80px;
  border: 4px solid transparent;
  border-top-color: var(--primary-gold);
  border-radius: 50%;
  animation: holographic-spin 1s linear infinite;
}
```

### 6.2 ホバーエフェクト
```css
@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
}
```

### 6.3 進捗インジケーター
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-holographic);
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: progress-shine 1s linear infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  text-align: center;
  color: var(--primary-gold);
  font-weight: bold;
  margin-top: 8px;
}
```

### 6.4 通知バッジ
```css
.notification-badge {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  background: rgba(26, 26, 26, 0.95);
  border: 2px solid var(--primary-gold);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateX(400px);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.notification-badge.show {
  transform: translateX(0);
}

.notification-badge.success {
  border-color: var(--secondary-green);
  background: rgba(50, 205, 50, 0.1);
}

.notification-badge.error {
  border-color: #FF4444;
  background: rgba(255, 68, 68, 0.1);
}
```

### 6.5 生成完了アニメーション
```css
@keyframes success-burst {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 0;
  }
}
```

## 7. レスポンシブデザイン

### 7.1 ブレークポイント
```css
--breakpoint-sm: 640px;   /* スマートフォン */
--breakpoint-md: 768px;   /* タブレット */
--breakpoint-lg: 1024px;  /* 小型デスクトップ */
--breakpoint-xl: 1280px;  /* デスクトップ */
--breakpoint-2xl: 1536px; /* 大型デスクトップ */
```

### 7.2 グリッドシステム
```css
.container {
  display: grid;
  gap: 24px;
  padding: 24px;
}

/* モバイル */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
}

/* タブレット */
@media (min-width: 769px) and (max-width: 1024px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* デスクトップ */
@media (min-width: 1025px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 8. アクセシビリティ

### 8.1 カラーコントラスト
- テキストと背景のコントラスト比は最低4.5:1を維持
- 重要なUIエレメントは色だけでなく形やアイコンでも識別可能に

### 8.2 キーボードナビゲーション
```css
.focusable:focus {
  outline: 2px solid var(--primary-cyan);
  outline-offset: 4px;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### 8.3 スクリーンリーダー対応
```html
<button aria-label="画像を生成" aria-busy="false">
  <span aria-hidden="true">✨</span>
  生成する
</button>
```

## 9. マイクロインタラクション

### 9.1 入力フィードバック
- 文字入力時にリアルタイムで文字数表示
- バリデーションエラーはアニメーション付きで表示

### 9.2 ツールチップ
```css
.tooltip {
  background: rgba(26, 26, 26, 0.95);
  color: var(--neutral-white);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: var(--text-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

### 9.3 プログレス表示
```css
.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-holographic);
  transition: width 0.3s ease;
}
```

## 10. エラー状態のデザイン

### 10.1 エラーメッセージ
```css
.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.5);
  color: #FF6B6B;
  padding: 12px 16px;
  border-radius: 8px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### 10.2 空状態
```css
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--neutral-gray);
}

.empty-state-icon {
  font-size: 64px;
  opacity: 0.3;
  margin-bottom: 16px;
}
```

## 11. パフォーマンス最適化

### 11.1 画像の遅延読み込み
```html
<img 
  src="placeholder.jpg" 
  data-src="actual-image.jpg" 
  loading="lazy"
  class="lazy-image"
/>
```

### 11.2 アニメーションの最適化
- `transform`と`opacity`のみを使用してGPUアクセラレーションを活用
- `will-change`プロパティを適切に使用
- 非表示要素のアニメーションは無効化

## 12. ダークモード対応

### 12.1 カラースキーム切り替え
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A1A;
    --text-primary: #FFFFFF;
  }
}

[data-theme="dark"] {
  --bg-primary: #1A1A1A;
  --text-primary: #FFFFFF;
}
```