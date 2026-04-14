import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllActivities } from '../lib/firestore'
import { GAMES } from '../config/games'

export default function GameLobby() {
  const navigate = useNavigate()
  const { student, logoutStudent } = useAuth()
  const [activities, setActivities] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getAllActivities(student.classCode)
      setActivities(data)
      setLoading(false)
    }
    load()
  }, [student.classCode])

  function handleSelect(game) {
    const act = activities[game.id]
    if (!act?.enabled) return
    navigate(`/student/game/${game.id}`)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-carnival-navy/50 text-sm">안녕하세요!</p>
          <h1 className="text-2xl font-black text-carnival-navy">
            {student.name} 학생 👋
          </h1>
        </div>
        <button
          onClick={() => { logoutStudent(); navigate('/') }}
          className="text-xs text-carnival-navy/30 hover:text-carnival-coral transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 포인트 배너 */}
      <div className="bg-gradient-to-r from-carnival-yellow to-carnival-orange rounded-3xl p-5 mb-8 shadow-lg">
        <p className="text-carnival-navy/70 text-sm font-medium">게임을 완료하면</p>
        <p className="text-carnival-navy font-black text-xl">그라운드 포인트를 받아요! 🌱</p>
      </div>

      <h2 className="font-black text-lg text-carnival-navy mb-4">🎮 미니게임</h2>

      {loading ? (
        <div className="text-center py-12 text-3xl animate-bounce-slow">🎡</div>
      ) : (
        <div className="space-y-4">
          {GAMES.map(game => {
            const act = activities[game.id]
            const enabled = act?.enabled ?? false
            return (
              <button
                key={game.id}
                onClick={() => handleSelect(game)}
                disabled={!enabled}
                className={`w-full text-left card border-2 transition-all duration-200
                  ${enabled
                    ? 'hover:scale-[1.02] hover:shadow-2xl hover:border-carnival-sky cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                    {enabled ? game.icon : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-carnival-navy">{game.name}</span>
                      <span className="badge bg-gray-100 text-gray-500 text-xs">{game.duration}</span>
                      {enabled
                        ? <span className="badge bg-carnival-green/30 text-green-700 text-xs">✅ 활성</span>
                        : <span className="badge bg-gray-100 text-gray-400 text-xs">🔒 비활성</span>
                      }
                    </div>
                    <p className="text-sm text-carnival-navy/50 mt-1 leading-snug">{game.description}</p>
                    {enabled && act?.pointsPerCompletion && (
                      <p className="text-xs text-carnival-orange font-bold mt-1">
                        ⭐ 완료 시 {act.pointsPerCompletion}P 지급
                      </p>
                    )}
                  </div>
                  {enabled && <span className="text-carnival-navy/30 text-xl flex-shrink-0">→</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
