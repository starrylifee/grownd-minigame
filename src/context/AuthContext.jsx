import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext(null)

/**
 * teacher: Firebase Auth 유저 (Google SSO)
 * student: { classCode, studentCode, name, teacherUid } — sessionStorage 기반
 */
export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(undefined) // undefined = 로딩 중
  const [student, setStudent] = useState(() => {
    try {
      const stored = sessionStorage.getItem('grownd_student')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setTeacher(user ?? null))
    return unsub
  }, [])

  function loginStudent(info) {
    sessionStorage.setItem('grownd_student', JSON.stringify(info))
    setStudent(info)
  }

  function logoutStudent() {
    sessionStorage.removeItem('grownd_student')
    setStudent(null)
  }

  const loading = teacher === undefined

  return (
    <AuthContext.Provider value={{ teacher, student, loginStudent, logoutStudent, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
