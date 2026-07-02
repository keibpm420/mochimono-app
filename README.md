# もちもの管理アプリ

用途別の「持ち物セット」をチェックリスト形式で確認できる、PWA対応の持ち物管理アプリ。

<!-- ここにアプリのスクリーンショット・GIFを貼る -->

## 背景

外出前に何度も持ち物を確認してしまう不安に対して、「出張用」「ジム用」などユースケースごとのチェックリストを用意し、確認したかどうかを一目で把握できるようにするためのアプリ。PC・スマホ間でチェック状態を同期できる。

## 主な機能

- メールアドレス+パスワードでのアカウント登録・ログイン(JWTで自動ログイン維持)
- 用途別「持ち物セット」の作成・名前編集・削除
- セットごとのチェックリスト確認・アイテムの追加削除(複数端末で同期)
- チェック状態の一括リセット
- PWA対応(ホーム画面に追加してアプリのように利用可能)

## 技術スタック

| 領域 | 技術 | 選定理由 |
|---|---|---|
| フロントエンド | React (Vite) | Next.jsなしのシンプルな構成で学習コストを抑えつつSPAを構築 |
| ルーティング | react-router-dom | SPA内の画面遷移(ログイン/一覧/詳細/編集)を管理 |
| スタイリング | Tailwind CSS + shadcn/ui | ユーティリティクラスで素早くスタイリングでき、shadcn/uiでモバイル向けの見た目を整えやすいため |
| フォント | Noto Sans JP (Variable) | 日本語UIの可読性を優先し、self-hostして表示崩れやオフライン時の欠落を防止 |
| PWA | vite-plugin-pwa | manifestとService Workerの生成を自動化し、ホーム画面への追加・オフラインキャッシュに対応 |
| バックエンド | Java / Spring Boot | 学習目的。認証・DB連携を含むAPIサーバーとして採用 |
| DB | PostgreSQL | 実務での採用実績が多く、Spring Data JPAとの相性も良いため |
| 認証 | JWT(長期トークン、jjwt) | 複数端末同期に必要なユーザー特定と、都度ログインを避ける利便性を両立 |
| ローカル環境 | Docker Compose | PostgreSQLをコンテナで起動し、環境構築をシンプルに |

## ディレクトリ構成

```
backend/             Spring Boot API サーバー(Maven)
  src/main/java/com/mochimono/
    auth/             サインアップ・ログイン・JWT発行/検証
    user/             ユーザーエンティティ
    itemset/          持ち物セットのCRUD
    item/             アイテムのCRUD・チェック状態
    config/           Spring Security / CORS 設定
frontend/            React (Vite) フロントエンド
  src/
    pages/            画面コンポーネント(ログイン/一覧/詳細/編集)
    api/              バックエンドAPI呼び出し(fetchラッパー)
    components/ui/    shadcn/ui コンポーネント
docker-compose.yml    ローカルPostgreSQL
```

## セットアップ

```bash
# 1. DB起動(Docker Desktopが起動している必要があります)
docker compose up -d

# 2. バックエンド起動 (http://localhost:8080)
cd backend
./mvnw spring-boot:run

# 3. フロントエンド起動 (http://localhost:5173)
cd frontend
npm install
npm run dev
```

初回アクセス時は `/login` 画面から新規登録(メールアドレス+8文字以上のパスワード)をしてください。

### PWAとして確認する

開発サーバー(`npm run dev`)ではService Workerが動かないため、本番ビルドで確認します。

```bash
cd frontend
npm run build
npm run preview   # http://localhost:4173
```

ブラウザのアドレスバーからインストールし、ホーム画面に追加された状態で動作を確認できます。

## API概要

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/auth/signup` | 新規登録 |
| POST | `/api/auth/login` | ログイン(JWT取得) |
| GET | `/api/sets` | 自分のセット一覧 |
| POST | `/api/sets` | セット作成 |
| GET | `/api/sets/{id}` | セット詳細(アイテム含む) |
| PUT | `/api/sets/{id}` | セット名編集 |
| DELETE | `/api/sets/{id}` | セット削除 |
| POST | `/api/sets/{id}/reset` | セット内の全アイテムを未チェックに戻す |
| POST | `/api/sets/{id}/items` | アイテム追加 |
| PUT | `/api/items/{id}` | アイテム編集(名前・チェック状態) |
| DELETE | `/api/items/{id}` | アイテム削除 |

認証が必要なエンドポイントは `Authorization: Bearer <JWT>` ヘッダーが必須です。自分以外が作成したセット・アイテムへのアクセスは403で拒否されます。

## 注意事項(本番運用する場合)

- `backend/src/main/resources/application.yml` の `app.jwt.secret` はローカル開発用の値です。本番環境では環境変数などで安全な値に差し替えてください。
- CORSの許可オリジンは `SecurityConfig` でローカル開発用のポート(5173, 4173)のみ許可しています。デプロイ時は実際のフロントエンドのURLに変更してください。
