import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect }    from 'react'
import { useAuth }                from '../context/AuthContext'
import { getActivity, getTodayPlayCount, saveGameScore, savePlayRound } from '../lib/firestore'
import { awardPoints }            from '../lib/growndApi'
import { getGame }                from '../config/games'
import ActivityPasswordModal      from '../components/ActivityPasswordModal'
import PointRewardModal           from '../components/PointRewardModal'

export default function GameRunner() {
  const { gameId }  = useParams()
  const navigate    = useNavigate()
  const { student } = useAuth()

  const game = getGame(gameId)

  const [activity, setActivity]           = useState(null)
  const [needPassword, setNeedPassword]   = useState(false)
  const [passwordOk, setPasswordOk]       = useState(false)
  const [result, setResult]               = useState(null)
  const [awarding, setAwarding]           = useState(false)
  const [limitReached, setLimitReached]   = useState(null)   // { count, limit }
  const [isPracticeMode, setIsPracticeMode] = useState(false) // 연습 모드

  useEffect(() => {
    if (!game) { navigate('/student/lobby'); return }
    async function load() {
      const act = await getActivity(student.classCode, gameId)
      if (!act?.enabled) { navigate('/student/lobby'); return }

      const dailyLimit = act.dailyLimit ?? game.defaultDailyLimit ?? 5
      const count      = await getTodayPlayCount(student.classCode, gameId, student.studentCode)

      setActivity(act)

      if (count >= dailyLimit) {
        if (act.practiceMode) {
          // 교사가 연습 모드 허용 → 포인트 없이 플레이 가능
          setIsPracticeMode(true)
        } else {
          // 연습 모드 미허용 → 접속 차단
          setLimitReached({ count, limit: dailyLimit })
          return
        }
      }

      if (act.activityPassword) setNeedPassword(true)
      else setPasswordOk(true)
    }
    load()
  }, [gameId])

  async function handleComplete(gameResult) {
    // 회차 기록 저장 (연습 모드 포함)
    savePlayRound(student.classCode, gameId, student.studentCode, {
      scoreRatio:     gameResult?.scoreRatio ?? 1,
      completionTime: gameResult?.completionTime,
      score:          gameResult?.score,
      isPractice:     isPracticeMode,
    }).catch(() => {})

    // 연습 모드: 포인트 지급 없이 바로 완료
    if (isPracticeMode) {
      setResult({ points: 0, message: '연습 완료! 💪 오늘 도전 횟수를 모두 썼지만 연습은 계속할 수 있어요.' })
      return
    }

    setAwarding(true)
    try {
      const res = await awardPoints(
        student.classCode,
        student.studentCode,
        gameId,
        gameResult?.scoreRatio,
      )
      const finalPoints = res.points ?? activity.pointsPerCompletion
      // 리더보드 저장 (실패해도 무시)
      saveGameScore(
        student.classCode, gameId,
        student.studentCode, student.name,
        gameResult?.scoreRatio ?? 1,
        finalPoints,
        gameResult?.completionTime,
        gameResult?.score,
      ).catch(() => {})
      setResult({
        points:  finalPoints,
        message: res.message ?? '포인트가 지급됐어요!',
      })
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('resource-exhausted')) {
        setResult({ points: 0, message: '오늘 플레이 횟수를 모두 사용했어요! 내일 다시 도전하세요 🌙' })
      } else {
        setResult({ points: activity?.pointsPerCompletion ?? 0, message: '포인트 지급 중 오류가 발생했습니다.' })
      }
    } finally {
      setAwarding(false)
    }
  }

  // 로딩 중
  if (!game || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-4xl animate-bounce-slow">🎡</div>
    )
  }

  // 일일 횟수 초과 + 연습 모드 미허용 → 접속 차단
  if (limitReached) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="card w-full max-w-sm text-center py-10 space-y-4">
          <div className="text-5xl">🌙</div>
          <h2 className="text-xl font-black text-carnival-navy">오늘은 끝!</h2>
          <p className="text-carnival-navy/60 text-sm">
            오늘 <strong>{game.name}</strong>을 이미<br />
            <strong className="text-carnival-coral">{limitReached.count}번</strong> 플레이했어요.
          </p>
          <p className="text-carnival-navy/40 text-xs">
            하루 최대 {limitReached.limit}번까지 포인트를 받을 수 있어요.
          </p>
          <button
            onClick={() => navigate('/student/lobby')}
            className="btn-primary w-full"
          >
            로비로 돌아가기
          </button>
        </div>
      </div>
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

      {/* 연습 모드 배너 */}
      {isPracticeMode && passwordOk && !result && (
        <div className="fixed top-0 inset-x-0 z-30 bg-amber-400 text-amber-900 text-center text-sm font-bold py-2 px-4 shadow">
          ✏️ 연습 모드 — 오늘 도전 횟수를 모두 사용했어요. 이 플레이는 포인트가 지급되지 않아요.
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
