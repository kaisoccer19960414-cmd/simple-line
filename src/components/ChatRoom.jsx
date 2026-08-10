import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ChatRoom({ identity }) {
  const { user, partner, label } = identity
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [partnerLastRead, setPartnerLastRead] = useState(null)
  const bottomRef = useRef(null)

  // 初期データ取得（履歴 + 相手の既読位置）
  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (!cancelled && !msgError) {
        setMessages(msgData ?? [])
      }

      const { data: readData, error: readError } = await supabase
        .from('read_status')
        .select('*')
        .eq('user_name', partner)
        .maybeSingle()

      if (!cancelled && !readError) {
        setPartnerLastRead(readData?.last_read_message_id ?? null)
      }

      if (!cancelled) {
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [partner])

  // Realtime：新規メッセージを即時反映
  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Realtime：相手の既読位置の更新を反映
  useEffect(() => {
    const channel = supabase
      .channel(`read-status-${partner}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'read_status',
          filter: `user_name=eq.${partner}`,
        },
        (payload) => {
          setPartnerLastRead(
            payload.new?.last_read_message_id ?? null
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partner])

  // 画面を開いている = 既読とみなし、自分の既読位置を更新
  useEffect(() => {
    if (messages.length === 0) return

    const latestId = messages[messages.length - 1].id

    supabase
      .from('read_status')
      .update({ last_read_message_id: latestId })
      .eq('user_name', user)
      .then(({ error }) => {
        if (error) {
          console.error('既読更新に失敗しました', error)
        }
      })
  }, [messages, user])

  // 新着で自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()

    const content = text.trim()

    if (!content) return

    setText('')

    const { error } = await supabase
      .from('messages')
      .insert({
        sender: user,
        content,
      })

    if (error) {
      console.error('送信に失敗しました', error)
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        {label}として利用中
      </div>

      <div className="message-list">
        {messages.map((m) => {
          const isMine = m.sender === user

          // 相手の既読位置以前にある自分のメッセージはすべて既読
          const isRead =
            isMine &&
            partnerLastRead != null &&
            partnerLastRead >= m.id

          return (
            <div
              key={m.id}
              className={`message-row ${
                isMine ? 'mine' : 'theirs'
              }`}
            >
              <div className="bubble">
                {m.content}
              </div>

              <div className="meta">
                {isRead && (
                  <span className="read-mark">
                    既読
                  </span>
                )}

                <span className="time">
                  {formatTime(m.created_at)}
                </span>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <form
        className="composer"
        onSubmit={handleSend}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
          autoComplete="off"
        />

        <button type="submit">
          送信
        </button>
      </form>
    </div>
  )
}

function formatTime(isoString) {
  const d = new Date(isoString)

  return d.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}