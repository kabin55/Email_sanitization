import { BrowserRouter, Routes, Route } from "react-router-dom"
import EmailSanitizer from './pages/email'

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<EmailSanitizer />} />
        </Routes>
      </BrowserRouter>
  )
}
