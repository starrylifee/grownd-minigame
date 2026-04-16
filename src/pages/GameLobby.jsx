import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllActivities, getTodayLeaderboard, subscribeToRaidBoss } from '../lib/firestore'
import { GAMES } from '../config/games'

const TIMED_GAMES = ['word-typing', 'typing', 'math-quiz', 'vocab']

function formatTime(secs) {
  if (!secs) return ''
  if (secs < 60) return `${secs}초`
  return `${Math.floor(secs / 60)}분 ${secs % 60}초`
}

function formatScore(gameId, scoreRatio, completionTime, score) {
  if (gameId === 'raid-typing') {
    const dmg = score != null ? `${score.toLocaleString()} 데미지` : '⚔️ 참여'
    if (scoreRatio >= 1.5) return `🏆 ${dmg}`
    return dmg
  }
  if (gameId === 'math-quiz') {
    // 사칙연산은 정답 수 / 10 표시 + 시간
    const correct = Math.round(scoreRatio * 10)
    const time    = completionTime ? ` · ${formatTime(completionTime)}` : ''
    return `${correct}/10${time}`
  }
  if (gameId === 'word-typing' || gameId === 'typing') {
    // 낱말/문장 타자는 scoreRatio가 항상 1.0이므로 시간만 표시
    return completionTime ? formatTime(completionTime) : '완료'
  }
  const pct  = `${Math.round(scoreRatio * 100)}%`
  const time = completionTime ? ` · ${formatTime(completionTime)}` : ''
  return pct + time
}

function LeaderboardPanel({ classCode }) {
  const [tab, setTab]         = useState(0)
  const [boards, setBoards]   = useState({})
  const [loading, setLoading] = useState(true)

  const scoredGames = GAMES.filter(g => g.id !== 'raid-typing')
  const allGames    = GAMES  // 레이드 포함 전체

  useEffect(() => {
    async function load() {
      const result = {}
      await Promise.all(
        allGames.map(async g => {
          try {
            result[g.id] = await getTodayLeaderboard(classCode, g.id)
          } catch {
            result[g.id] = []
          }
        })
      )
      setBoards(result)
      setLoading(false)
    }
    load()
  }, [classCode])

  const currentGame = allGames[tab]
  const entries     = boards[currentGame?.id] || []

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-lg text-carnival-navy">🏆 오늘의 순위</h2>
        <span className="text-xs text-carnival-navy/40">TOP3 +1P 자정 지급 🌱</span>
      </div>

      {/* 게임 탭 */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {allGames.map((g, i) => (
          <button key={g.id} onClick={() => setTab(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all
              ${tab === i
                ? 'bg-carnival-navy text-white shadow'
                : 'bg-white text-carnival-navy/50 hover:bg-carnival-navy/10'}`}>
            <span>{g.icon}</span>
            <span>{g.name}</span>
          </button>
        ))}
      </div>

      {/* 순위 리스트 */}
      <div className="card py-3 px-4 space-y-2 min-h-[120px]">
        {loading ? (
          <div className="text-center py-6 text-2xl animate-bounce-slow">🎡</div>
        ) : entries.length === 0 ? (
          <p className="text-center text-carnival-navy/30 py-6 text-sm">아직 오늘 기록이 없어요</p>
        ) : (
          entries.slice(0, 10).map((e, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
            const topScore = entries[0]
            const pct = currentGame.id === 'raid-typing'
              ? Math.min(100, Math.round(((e.score ?? 0) / Math.max(1, topScore?.score ?? 1)) * 100))
              : Math.min(100, Math.round((e.scoreRatio / 1) * 100))
            return (
              <div key={e.studentCode} className="flex items-center gap-3">
                <span className="w-7 text-center text-sm font-black">{medal}</span>
                <span className="flex-1 font-bold text-sm text-carnival-navy truncate">{e.name}</span>
                <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-carnival-sky'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-carnival-navy/60 w-24 text-right">
                  {formatScore(currentGame.id, e.scoreRatio, e.completionTime, e.score)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function GameLobby() {
  const navigate = useNavigate()
  const { student, logoutStudent } = useAuth()
  const [activities, setActivities] = useState({})
  const [loading, setLoading]       = useState(true)
  const [raidBoss, setRaidBoss]     = useState(null)

  useEffect(() => {
    async function load() {
      const data = await getAllActivities(student.classCode)
      setActivities(data)
      setLoading(false)
    }
    load()
  }, [student.classCode])

  // 레이드 보스 HP 실시간 구독
  useEffect(() => {
    const unsub = subscribeToRaidBoss(student.classCode, data => setRaidBoss(data))
    return unsub
  }, [student.classCode])

  function handleSelect(game) {
    const act = activities[game.id]
    if (!act?.enabled) return
    navigate(`/student/game/${game.id}`)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-xl mx-auto">
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

      {/* 레이드 보스 HP 배너 (활성화 + 보스 데이터 있을 때) */}
      {activities['raid-typing']?.enabled && raidBoss && !raidBoss.defeated && (
        <div className="bg-slate-800 rounded-3xl p-4 mb-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{raidBoss.bossEmoji || '👾'}</span>
            <span className="font-black text-white text-sm">{raidBoss.bossName || '보스'}</span>
            <span className="ml-auto text-xs text-slate-400">학급 레이드</span>
          </div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-red-400">보스 HP</span>
            <span className="text-white">
              {Math.max(0, (raidBoss.totalHp || 0) - (raidBoss.currentDamage || 0)).toLocaleString()}
              {' / '}
              {(raidBoss.totalHp || 0).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(0, 100 - ((raidBoss.currentDamage || 0) / (raidBoss.totalHp || 1)) * 100)}%`,
                background: (() => {
                  const pct = 100 - ((raidBoss.currentDamage || 0) / (raidBoss.totalHp || 1)) * 100
                  return pct > 50 ? '#ef4444' : pct > 25 ? '#f97316' : '#eab308'
                })(),
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-right">
            누적 데미지 {(raidBoss.currentDamage || 0).toLocaleString()} · 참여 {Object.keys(raidBoss.contributions || {}).length}명
          </p>
        </div>
      )}
      {activities['raid-typing']?.enabled && raidBoss?.defeated && (
        <div className="bg-carnival-yellow/30 border border-yellow-300 rounded-3xl p-4 mb-5 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-black text-carnival-navy">보스 격파 완료!</p>
          <p className="text-xs text-carnival-navy/50 mt-0.5">선생님이 다음 보스를 준비 중이에요</p>
        </div>
      )}

      <h2 className="font-black text-lg text-carnival-navy mb-4">🎮 미니게임</h2>

      {loading ? (
        <div className="text-center py-12 text-3xl animate-bounce-slow">🎡</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {GAMES.map(game => {
              const act     = activities[game.id]
              const enabled = act?.enabled ?? false
              return (
                <button
                  key={game.id}
                  onClick={() => handleSelect(game)}
                  disabled={!enabled}
                  className={`flex flex-col items-center text-center rounded-3xl p-4 border-2 bg-white shadow-sm transition-all duration-200
                    ${enabled
                      ? 'hover:scale-105 hover:shadow-xl hover:border-carnival-sky cursor-pointer border-transparent'
                      : 'opacity-40 cursor-not-allowed border-transparent'
                    }`}
                >
                  <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center text-3xl shadow-md mb-2`}>
                    {enabled ? game.icon : '🔒'}
                  </div>
                  <span className="font-black text-carnival-navy text-sm leading-tight">{game.name}</span>
                  <span className="text-xs text-carnival-navy/40 mt-0.5">{game.duration}</span>
                  {enabled && act?.pointsPerCompletion ? (
                    <span className="text-xs text-carnival-orange font-bold mt-1">⭐ {act.pointsPerCompletion}P</span>
                  ) : enabled ? null : (
                    <span className="text-xs text-gray-400 mt-1">🔒 비활성</span>
                  )}
                </button>
              )
            })}
          </div>

          <LeaderboardPanel classCode={student.classCode} />
        </>
      )}
    </div>
  )
}
