import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const { teacher, student } = useAuth()

  useEffect(() => {
    if (teacher) navigate('/teacher/dashboard', { replace: true })
    else if (student) navigate('/student/lobby', { replace: true })
  }, [teacher, student])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* 헤더 */}
      <div className="text-center mb-12 animate-float">
        <div className="text-7xl mb-4">🎡</div>
        <h1 className="text-4xl font-black text-carnival-navy mb-2">
          그라운드 미니게임
        </h1>
        <p className="text-carnival-navy/60 font-medium text-lg">
          게임을 완료하고 포인트를 받아요!
        </p>
      </div>

      {/* 역할 선택 카드 */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <button
          onClick={() => navigate('/teacher/login')}
          className="flex-1 card flex flex-col items-center gap-4 py-8 border-2
                     hover:border-carnival-sky hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <span className="text-5xl">👩‍🏫</span>
          <div className="text-center">
            <p className="font-black text-xl text-carnival-navy">교사</p>
            <p className="text-sm text-carnival-navy/50 mt-1">학급 관리 및 설정</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/student/login')}
          className="flex-1 card flex flex-col items-center gap-4 py-8 border-2
                     hover:border-carnival-coral hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <span className="text-5xl">🧑‍🎓</span>
          <div className="text-center">
            <p className="font-black text-xl text-carnival-navy">학생</p>
            <p className="text-sm text-carnival-navy/50 mt-1">게임 하고 포인트 받기</p>
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-carnival-navy/30">Powered by 그라운드카드 🌱</p>
    </div>
  )
}
