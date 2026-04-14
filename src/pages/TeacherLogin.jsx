import { useNavigate } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { saveTeacher } from '../lib/firestore'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function TeacherLogin() {
  const navigate = useNavigate()
  const { teacher, loading: authLoading } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 이미 로그인된 상태면 대시보드로 이동
  useEffect(() => {
    if (!authLoading && teacher) {
      navigate('/teacher/dashboard', { replace: true })
    }
  }, [teacher, authLoading])

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      await saveTeacher(user.uid, {
        displayName: user.displayName,
        email:       user.email,
        photoURL:    user.photoURL,
      })
      navigate('/teacher/dashboard')
    } catch (e) {
      console.error('Google login error:', e)
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="card w-full max-w-sm text-center">
        <div className="text-5xl mb-4">👩‍🏫</div>
        <h2 className="text-2xl font-black text-carnival-navy mb-2">교사 로그인</h2>
        <p className="text-carnival-navy/50 text-sm mb-8">Google 계정으로 간편하게 로그인하세요</p>

        {error && (
          <div className="bg-red-50 text-red-500 rounded-2xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200
                     rounded-2xl py-3 px-6 font-bold text-carnival-navy
                     hover:border-carnival-sky hover:bg-carnival-sky/5
                     hover:scale-105 transition-all duration-150 disabled:opacity-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {loading ? '로그인 중...' : 'Google로 로그인'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-carnival-navy/40 hover:text-carnival-navy transition-colors"
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  )
}
