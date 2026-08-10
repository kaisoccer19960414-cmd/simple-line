# 超簡易LINE

コーディング前に、設計/技術スタック/通信手段/ホスティング/
セキュリティ/DB/画面/ユースケース(必要な機能を具体的に上げる)/
サーバー、等を考えてから作った。

最初はjava/springで実装を考えたがオーバースペックな為、python/flaskに
変更。その後バックエンドである無料Renderを使うと通信が遅くなる
＆supabaseにリアルタイム通信機能があることを思い出してそれを利用し
node.jsに変更。

dbは最初はテキストのみのやり取りなのでローカルストレージかindexedDBを
使う予定だったが、サーバーにメッセージを保存しないから
相手がオフラインの時(WebSocket中継サーバーがメッセージを保持
してない限り)にメッセージが届けられないので、supabase使用に変更した。




## 概要
2人だけで使用する、最小構成のリアルタイムチャット。

## ユースケース
- ユーザーは2人のみ）
- 秘密URLを知っていることを認証として利用
- ログイン・パスワードなし
- テキストメッセージの送受信
- リアルタイム通信
- 既読表示
- Vercel上で公開
- スマートフォンのブラウザから利用

## 技術スタック
- React
- Vite
- React Router
- Supabase
  - PostgreSQL
  - Realtime
- Vercel
- Git / GitHub

## システム構成
簡単な構成図

Browser
  ↓
Vercel
  ↓
React
  ↓
Supabase
  ├─ PostgreSQL
  └─ Realtime

## 認証方式
秘密URLのトークンによってユーザーを判定。

/chat/<token>

自分用トークン → self
母用トークン → mother

ログイン機能は実装しない。

## データ構成
### messages
- id
- sender
- content
- created_at

### read_status
- user_name
- last_read_message_id

## 主な機能
- メッセージ送信
- メッセージ履歴取得
- Realtimeによる新着メッセージ反映
- 既読位置管理
- 自動スクロール
- 不正なURLの拒否

## セキュリティ上の注意
このアプリは「秘密URLを知っていること」を認証として扱う実験的な構成。
本格的な認証システムではない。