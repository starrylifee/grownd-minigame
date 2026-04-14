import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Landing          from './pages/Landing'
import TeacherLogin     from './pages/TeacherLogin'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentLogin     from './pages/StudentLogin'
import GameLobby        from './pages/GameLobby'
import GameRunner       from './pages/GameRunner'

function TeacherRoute({ children }) {
  const { teacher, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return teacher ? children : <Navigate to="/teacher/login" replace />
}

function StudentRoute({ children }) {
  const { student } = useAuth()
  return student ? children : <Navigate to="/student/login" replace />
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-bounce-slow">🎡</div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"                   element={<Landing />} />
          <Route path="/teacher/login"      element={<TeacherLogin />} />
          <Route path="/teacher/dashboard"  element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/student/login"      element={<StudentLogin />} />
          <Route path="/student/lobby"      element={<StudentRoute><GameLobby /></StudentRoute>} />
          <Route path="/student/game/:gameId" element={<StudentRoute><GameRunner /></StudentRoute>} />
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
