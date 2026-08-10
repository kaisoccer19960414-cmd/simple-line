import { createClient } from '@supabase/supabase-js'

// anon key はクライアントに公開して問題ない前提のキー。
// service_role key は絶対にここに書かない・使わない。
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabaseの環境変数が設定されていません。.env.local に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
