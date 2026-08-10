import { useParams } from 'react-router-dom'
import { resolveIdentityFromToken } from '../config'
import InvalidLink from './InvalidLink'
import ChatRoom from '../components/ChatRoom'

export default function ChatPage() {
  const { token } = useParams()
  const identity = resolveIdentityFromToken(token)

  console.log('ChatPage token:', token)
  console.log('ChatPage identity:', identity)

  if (!identity) {
    return <InvalidLink />
  }

  return <ChatRoom key={identity.user} identity={identity} />
}