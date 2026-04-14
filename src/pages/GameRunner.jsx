import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getActivity } from '../lib/firestore'
import { awardPoints } from '../lib/growndApi'
import { getGame } from '../config/games'
import ActivityPasswordModal from '../components/ActivityPasswordModal'
import PointRewardModal from '../components/PointRewardModal'

export default function GameRunner() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { student } = useAuth()

  const game = getGame(gameId)

  const [activity, setActivity]           = useState(null)
  const [needPassword, setNeedPassword]   = useState(false)
  const [passwordOk, setPasswordOk]       = useState(false)
  const [result, setResult]               = useState(null) // { points, message }
  const [awarding, setAwarding]           = useState(false)

  useEffect(() => {
    if (!game) { navigate('/student/lobby'); return }
    async function load() {
      const act = await getActivity(student.classCode, gameId)
      if (!act?.enabled) { navigate('/student/lobby'); return }
      setActivity(act)
      if (act.activityPassword) setNeedPassword(true)
      else setPasswordOk(true)
    }
    load()
  }, [gameId])

  async function handleComplete(gameResult) {
    setAwarding(true)
    try {
      const res = await awardPoints(student.classCode, student.studentCode, gameId)
      setResult({ points: res.points ?? activity.pointsPerCompletion, message: res.message ?? '포인트가 지급됐어요!' })
    } catch {
      setResult({ points: activity?.pointsPerCompletion ?? 0, message: '포인트 지급 중 오류가 발생했습니다.' })
    } finally {
      setAwarding(false)
    }
  }

  if (!game || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-4xl animate-bounce-slow">🎡</div>
    )
  }

  const GameComponent = game.component

  return (
    <>
      {/* 활동 비밀번호 모달 */}
      {needPassword && !passwordOk && (
        <ActivityPasswordModal
          correctPassword={activity.activityPassword}
          onSuccess={() => setPasswordOk(true)}
          onCancel={() => navigate('/student/lobby')}
        />
      )}

      {/* 포인트 지급 결과 모달 */}
      {result && (
        <PointRewardModal
          points={result.points}
          message={result.message}
          onClose={() => navigate('/student/lobby')}
        />
      )}

      {/* 로딩 (지급 중) */}
      {awarding && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
          <div className="card text-center p-8">
            <div className="text-4xl animate-bounce-slow mb-3">🌱</div>
            <p className="font-bold">포인트 지급 중...</p>
          </div>
        </div>
      )}

      {/* 게임 컴포넌트 */}
      {passwordOk && !result && !awarding && (
        <GameComponent
          activityId={`${student.classCode}_${gameId}`}
          activity={activity}
          onComplete={handleComplete}
          onExit={() => navigate('/student/lobby')}
        />
      )}
    </>
  )
}
