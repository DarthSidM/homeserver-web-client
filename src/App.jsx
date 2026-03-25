
import { Route, Routes } from 'react-router-dom'
import HomePageWrapper from './pages/HomePageWrapper'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePageWrapper />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
