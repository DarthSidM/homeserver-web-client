
import { Route, Routes } from 'react-router-dom'
import FavouritePage from './pages/FavouritePage'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import NotFoundPage from './pages/NotFoundPage'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/favourites" element={<FavouritePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/editor/:fileId" element={<EditorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
