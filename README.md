# 超簡易LINE

自分と母親の2人だけで使う、最小構成のリアルタイムチャット。
「秘密URLを知っていること」自体を認証として扱う(ログイン画面・パスワード・RLSなし)。

## 構成

- React (Vite) + react-router-dom
- Supabase (PostgreSQL + Realtime)、anon keyのみ使用
- Vercelにデプロイ

```
src/
  config.js              トークン→ユーザー(self/mother)の対応表
  lib/supabaseClient.js  Supabaseクライアント
  pages/ChatPage.jsx     /chat/:token を受けてトークンを判定
  pages/InvalidLink.jsx  無効なURL用画面
  components/ChatRoom.jsx  チャット本体(送信・履歴・Realtime・既読)
supabase.sql              Supabase側で実行するテーブル定義
```

---

## セットアップ手順

### 1. Supabaseプロジェクトを作成

1. https://supabase.com でプロジェクトを新規作成
2. 「SQL Editor」で `supabase.sql` の中身を実行
   - `messages` テーブル、`read_status` テーブルが作成され、
     `read_status` に `self` / `mother` の初期行が入る
3. 「Project Settings > API」から以下をメモ
   - Project URL
   - anon public key
   - **service_role keyは今回一切使わない・どこにも書かない**
4. 「Project Settings > API > Realtime」または Database > Replication で、
   `messages` と `read_status` がRealtime対象になっていることを確認
   (`supabase.sql` 内の `alter publication` で有効化済みのはず)

### 2. 秘密トークンを2つ生成

ターミナルで以下などを実行し、十分に長いランダム文字列を2つ作る。

```bash
openssl rand -hex 32
```

1つ目を自分用(`VITE_TOKEN_SELF`)、2つ目を母親用(`VITE_TOKEN_MOTHER`)にする。

### 3. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集し、Supabaseの値と生成したトークンを入れる。
(`.env.local` はgit管理外)

### 4. ローカルで起動して動作確認

```bash
npm install
npm run dev
```

- `http://localhost:5173/chat/<VITE_TOKEN_SELF>` を開く → 「自分として利用中」と表示
- 別ブラウザ(またはシークレットウィンドウ)で
  `http://localhost:5173/chat/<VITE_TOKEN_MOTHER>` を開く → 「母として利用中」と表示
- 片方から送信 → もう片方に即座に表示されればRealtime成功
- 表示している間に相手のメッセージを開けば、送信側に「既読」が付くか確認
- トークンが違う適当なURL(例: `/chat/abc`)を開くと「このURLは無効です」と表示される

### 5. Vercelへデプロイ

1. このプロジェクトをGitHubリポジトリにpush
2. Vercelでリポジトリをimport(Framework Presetは Vite のまま)
3. Vercelの Environment Variables に `.env.local` と同じ4つを設定
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TOKEN_SELF`
   - `VITE_TOKEN_MOTHER`
4. デプロイ後、
   `https://<your-app>.vercel.app/chat/<VITE_TOKEN_SELF>` と
   `https://<your-app>.vercel.app/chat/<VITE_TOKEN_MOTHER>` の
   2つのURLをそれぞれ自分と母親に使ってもらう

---

## 設計メモ

- ユーザーテーブルは作らず、トークンとユーザーの対応は環境変数(ビルド時埋め込み)で持たせている。
  URL自体が認証情報という前提と矛盾しないよう、サーバー側の別認証は追加していない。
- RLSは未設定。anon keyだけで読み書きできる状態のため、
  `messages` / `read_status` 以外の重要なデータをこのSupabaseプロジェクトに置かないこと。
- 既読は「ユーザーごとの最後に読んだmessage_id」1件のみを持つ最小構成
  (メッセージ単位のreadレコードは作らない)。
