import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { verifyStudent } from '../lib/firestore'

export default function StudentLogin() {
  const navigate = useNavigate()
  const { loginStudent } = useAuth()

  const [classCode, setClassCode] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!classCode || !studentCode || !password) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const student = await verifyStudent(classCode.trim(), studentCode.trim(), password)
      if (!student) {
        setError('학급 코드, 번호 또는 비밀번호가 올바르지 않습니다.')
        return
      }
      loginStudent(student)
      navigate('/student/lobby')
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🧑‍🎓</div>
          <h2 className="text-2xl font-black text-carnival-navy">학생 로그인</h2>
          <p className="text-carnival-navy/50 text-sm mt-1">선생님이 알려준 정보를 입력하세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">
              학급 코드
            </label>
            <input
              value={classCode}
              onChange={e => setClassCode(e.target.value)}
              placeholder="선생님이 알려준 학급 코드"
              className="input-field"
              autoCapitalize="none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">
              학생 번호
            </label>
            <input
              value={studentCode}
              onChange={e => setStudentCode(e.target.value)}
              placeholder="예: 15"
              className="input-field"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-carnival-navy/60 mb-1">
              비밀번호
            </label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="비밀번호 입력"
              className="input-field"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? '확인 중...' : '🎮 게임 하러 가기!'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full text-sm text-carnival-navy/40 hover:text-carnival-navy transition-colors"
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  )
}
