# 言い訳ジェネレーター (Excuse Generator)

AI（Gemini）を活用して、角を立てずに誘いや依頼を断るための「言い訳」を自動生成する Web アプリケーションです。

## 特徴

- **多様なテイスト**: 丁寧なビジネス向けから、武士風、ギャル風、意識高い系まで、シチュエーションに合わせて選択可能
- **Gemini AI 搭載**: Google の AI モデル（Gemini 3.5 Flash）が、文脈に応じた最適な言い訳を作成
- **ワンクリックコピー**: 生成された文章をすぐにクリップボードにコピーして利用可能
- **無料ホスティング対応**: [Vercel](https://vercel.com/) の Hobby プラン（無料）でデプロイ可能

## 動作要件

- Node.js（LTS 推奨）
- Google AI Studio（Gemini）API キー

## ローカル開発

1. **依存関係をインストール**

   ```bash
   npm install
   ```

2. **環境変数を設定**

   `.env.example` をコピーして `.env` を作成し、API キーを設定します。

   ```bash
   cp .env.example .env
   ```

   ```env
   GEMINI_API_KEY=あなたのAPIキー
   ```

   API キーは [Google AI Studio](https://aistudio.google.com/) から取得できます。

3. **開発サーバーを起動**

   ```bash
   npm run dev
   ```

   フロントエンドと API が同時に起動します。ブラウザで表示された URL（通常 `http://localhost:3000`）にアクセスしてください。

   > 初回は Vercel CLI のログインを求められる場合があります。

## Vercel へのデプロイ（無料）

1. このリポジトリを GitHub にプッシュします。

2. [Vercel](https://vercel.com/) にログインし、「Add New Project」からリポジトリをインポートします。

3. **Environment Variables** に以下を追加します。

   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | あなたの Gemini API キー |

4. 「Deploy」をクリックします。

デプロイ完了後、`https://your-project.vercel.app` のような URL でアプリにアクセスできます。

### Vercel CLI からデプロイする場合

```bash
npx vercel
```

本番デプロイ:

```bash
npx vercel --prod
```

## 使い方

1. **「断りたいこと」を入力** — 例：金曜日の飲み会、週末の残業
2. **「テイスト」を選択** — 丁寧、武士風、ギャル風 など
3. **「生成する」をクリック**
4. 生成されたメッセージを **「コピー」** して使用

## プロジェクト構造

```text
.
├── api/
│   └── generate-excuse.js   # Vercel サーバーレス API（Gemini 呼び出し）
├── public/
│   └── assets/              # 静的ファイル（アイコンなど）
├── index.html               # UI 構造
├── style.css                # スタイリング
├── script.js                # フロントエンドロジック
├── vite.config.js           # Vite 設定
├── vercel.json              # Vercel デプロイ設定
├── .env.example             # 環境変数のサンプル
└── package.json
```

## セキュリティ

API キーはサーバー側（`api/generate-excuse.js`）でのみ使用され、ブラウザには公開されません。本番環境では Vercel の環境変数に設定してください。
