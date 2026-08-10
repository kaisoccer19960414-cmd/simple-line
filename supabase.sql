-- Supabase の SQL Editor で実行してください。
-- RLSはこのアプリの設計上、意図的に使用しません(秘密URLが認証機構)。

-- メッセージ本体
create table if not exists messages (
  id bigint generated always as identity primary key,
  sender text not null check (sender in ('self', 'mother')),
  content text not null,
  created_at timestamptz not null default now()
);

-- 既読状態(ユーザーごとに「最後に読んだmessage_id」を1件だけ持つ)
create table if not exists read_status (
  user_name text primary key check (user_name in ('self', 'mother')),
  last_read_message_id bigint references messages (id)
);

-- 初期データ(2ユーザー固定なので最初に1回だけ入れる)
insert into read_status (user_name, last_read_message_id)
values ('self', null), ('mother', null)
on conflict (user_name) do nothing;

-- Realtimeを有効化(Supabaseのデフォルトでpublicationに入っていることが多いが念のため)
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table read_status;
