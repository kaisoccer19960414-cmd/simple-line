import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import InvalidLink from './pages/InvalidLink'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat/:token" element={<ChatPage />} />
        <Route path="*" element={<InvalidLink />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
