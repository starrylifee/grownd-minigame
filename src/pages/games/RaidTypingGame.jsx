/**
 * 🐉 학급 레이드 타자 게임
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 *
 * [게임 방식]
 * - 학급 전체가 함께 보스를 공격합니다.
 * - 문장을 정확히 입력할 때마다 50 데미지가 공유 HP에 누적됩니다.
 * - 6문장(300 데미지)을 완료하면 오늘 세션 종료 → 포인트 지급
 * - 보스 HP는 Firestore 실시간 동기화 (onSnapshot)
 *
 * [계기교육 보스 테마 - 날짜 자동 감지]
 */
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { contributeToRaid, subscribeToRaidBoss } from '../../lib/firestore'

// ── 계기교육 날짜별 보스 테마 ────────────────────────────────
function getBossTheme(activityTheme) {
  // 교사가 직접 설정한 테마 우선
  if (activityTheme?.bossName) return activityTheme

  const now   = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
  const month = now.getMonth() + 1
  const day   = now.getDate()

  if (month === 3 && day === 1)
    return { bossName: '제국의 침략자', bossEmoji: '⚔️', bossStory: '3·1 독립운동 기념일! 그라운드 드래곤이 독립을 지킵니다!' }
  if (month === 4 && day >= 1 && day <= 30)
    return { bossName: '우주 침략자 로봇', bossEmoji: '🤖', bossStory: '과학의 달! 우주에서 온 적을 드래곤과 함께 물리쳐요!' }
  if (month === 5 && day === 5)
    return { bossName: '어둠의 마법사', bossEmoji: '🧙', bossStory: '어린이날! 드래곤이 어린이들의 꿈을 지킵니다!' }
  if (month === 6 && day === 6)
    return { bossName: '나라를 위협하는 악당', bossEmoji: '👹', bossStory: '현충일! 나라를 지킨 영웅들을 기억하며 싸워요!' }
  if (month === 8 && day === 15)
    return { bossName: '광복을 막는 어둠', bossEmoji: '🌑', bossStory: '광복절! 드래곤이 자유와 평화를 되찾습니다!' }
  if (month === 10 && day === 3)
    return { bossName: '하늘의 폭풍 괴물', bossEmoji: '⛈️', bossStory: '개천절! 건국의 기상으로 드래곤이 하늘을 열어요!' }
  if (month === 10 && day === 9)
    return { bossName: '한글 파괴 외계인', bossEmoji: '👽', bossStory: '한글날! 한글을 지켜주세요. 드래곤이 함께합니다!' }
  if (month === 10 && day === 25)
    return { bossName: '독도 침공 외계인 함대', bossEmoji: '🛸', bossStory: '독도의 날! 그라운드 드래곤이 독도를 지킵니다!' }

  // 기본 테마
  return { bossName: '그림자 몬스터', bossEmoji: '👾', bossStory: '학급의 타자 실력으로 보스를 물리쳐요!' }
}

// ── 레이드 문장 풀 ────────────────────────────────────────
const RAID_SENTENCES = [
  '우리 반이 힘을 합치면 무엇이든 이룰 수 있다',
  '포기하지 말고 끝까지 도전하는 용사가 되자',
  '함께하면 더 강해지는 우리들의 힘을 보여줘',
  '드래곤과 함께 악당을 물리쳐 평화를 되찾자',
  '한 글자 한 글자 모여 큰 힘이 됩니다',
  '오늘도 열심히 타자를 쳐서 보스를 무찌르자',
  '우리의 단결이 세상을 바꿀 수 있어요',
  '꾸준한 노력으로 강한 드래곤이 됩니다',
]

const DAMAGE_PER_SENTENCE = 50
const SESSION_SENTENCES   = 6  // 한 세션에 입력할 문장 수

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function RaidTypingGame({ activity, onComplete, onExit }) {
  const { student } = useAuth()

  const activityTheme = activity?.bossName
    ? { bossName: activity.bossName, bossEmoji: activity.bossEmoji, bossStory: activity.bossStory }
    : null
  const theme   = getBossTheme(activityTheme)
  const totalHp = activity?.bossHp || 1000

  const [boss, setBoss]           = useState(null)   // Firestore 실시간 보스 데이터
  const [sentences]               = useState(() => shuffled(RAID_SENTENCES))
  const [idx, setIdx]             = useState(0)
  const [input, setInput]         = useState('')
  const [correct, setCorrect]     = useState(null)
  const [myDamage, setMyDamage]   = useState(0)
  const [done, setDone]           = useState(false)
  const inputRef                  = useRef(null)

  // 실시간 보스 HP 구독
  useEffect(() => {
    const unsub = subscribeToRaidBoss(student.classCode, data => {
      setBoss(data)
    })
    return unsub
  }, [student.classCode])

  useEffect(() => {
    if (!done) inputRef.current?.focus()
  }, [idx, done])

  const current      = sentences[idx % sentences.length]
  const sessionDone  = idx >= SESSION_SENTENCES
  const bossHp       = boss?.totalHp || totalHp
  const currentDmg   = boss?.currentDamage || 0
  const hpPercent    = Math.max(0, Math.min(100, ((bossHp - currentDmg) / bossHp) * 100))
  const isDefeated   = currentDmg >= bossHp

  function handleSubmit(e) {
    e.preventDefault()
    if (done) return
    const trimmed = input.trim()
    if (trimmed === current) {
      setCorrect(true)
      const newMyDamage = myDamage + DAMAGE_PER_SENTENCE
      setMyDamage(newMyDamage)

      // Firestore에 데미지 누적
      contributeToRaid(student.classCode, student.studentCode, DAMAGE_PER_SENTENCE).catch(() => {})

      setTimeout(async () => {
        const next = idx + 1
        if (next >= SESSION_SENTENCES) {
          setDone(true)
          onComplete({ score: newMyDamage, passed: true })
        } else {
          setIdx(next)
          setInput('')
          setCorrect(null)
        }
      }, 600)
    } else {
      setCorrect(false)
      setTimeout(() => {
        setInput('')
        setCorrect(null)
        inputRef.current?.focus()
      }, 700)
    }
  }

  const borderColor = correct === true
    ? 'border-carnival-green'
    : correct === false
    ? 'border-carnival-coral'
    : 'border-gray-200'

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black text-carnival-navy">🐉 학급 레이드</h1>
        <button onClick={onExit}
          className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
          나가기
        </button>
      </div>

      {/* 보스 카드 */}
      <div className={`card mb-4 text-center py-5 ${isDefeated ? 'bg-carnival-yellow/20' : 'bg-gradient-to-b from-slate-800 to-slate-900'}`}>
        {isDefeated ? (
          <>
            <p className="text-4xl mb-1">🎉</p>
            <p className="font-black text-xl text-carnival-navy">보스 격파!</p>
            <p className="text-sm text-carnival-navy/60 mt-1">선생님이 다음 보스를 불러올 거예요</p>
          </>
        ) : (
          <>
            {/* 보스 */}
            <div className="text-5xl mb-1 animate-bounce">{theme.bossEmoji}</div>
            <p className="font-black text-white text-lg mb-0.5">{theme.bossName}</p>
            <p className="text-slate-400 text-xs mb-3">{theme.bossStory}</p>

            {/* 보스 HP 바 */}
            <div className="mb-1">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-red-400">보스 HP</span>
                <span className="text-white">{Math.max(0, bossHp - currentDmg).toLocaleString()} / {bossHp.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-700"
                  style={{
                    width: `${hpPercent}%`,
                    background: hpPercent > 50 ? '#ef4444' : hpPercent > 25 ? '#f97316' : '#eab308',
                  }}
                />
              </div>
            </div>

            {/* 드래곤 아군 */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-slate-300 text-xs font-bold">그라운드 드래곤이 함께 싸우고 있어요!</span>
            </div>
          </>
        )}
      </div>

      {/* 내 기여 현황 */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-carnival-sky/10 rounded-2xl px-3 py-2 text-center">
          <p className="text-xs text-carnival-navy/50 font-bold">내 데미지</p>
          <p className="text-lg font-black text-carnival-sky">{myDamage.toLocaleString()}</p>
        </div>
        <div className="flex-1 bg-carnival-green/10 rounded-2xl px-3 py-2 text-center">
          <p className="text-xs text-carnival-navy/50 font-bold">총 데미지</p>
          <p className="text-lg font-black text-carnival-green">{currentDmg.toLocaleString()}</p>
        </div>
        <div className="flex-1 bg-carnival-yellow/20 rounded-2xl px-3 py-2 text-center">
          <p className="text-xs text-carnival-navy/50 font-bold">진행</p>
          <p className="text-lg font-black text-carnival-navy">{Math.min(idx, SESSION_SENTENCES)}/{SESSION_SENTENCES}</p>
        </div>
      </div>

      {/* 세션 완료 or 타이핑 영역 */}
      {done ? (
        <div className="card text-center py-8">
          <div className="text-4xl mb-2">⚔️</div>
          <p className="font-black text-xl text-carnival-navy">오늘 세션 완료!</p>
          <p className="text-carnival-navy/60 text-sm mt-1">
            내 데미지: <strong className="text-carnival-sky">{myDamage}</strong>
          </p>
          <p className="text-carnival-navy/40 text-xs mt-1">포인트 지급 중이에요...</p>
        </div>
      ) : (
        <>
          {/* 제시 문장 */}
          <div className="card mb-3 text-center">
            <p className="text-xs text-carnival-navy/40 mb-2 font-medium">
              아래 문장을 입력하세요 — 정확할수록 보스에게 더 많은 데미지!
            </p>
            <p className="text-lg font-bold text-carnival-navy leading-relaxed">
              {current.split('').map((char, i) => {
                const typed = input[i]
                const color = typed == null
                  ? 'text-carnival-navy'
                  : typed === char
                  ? 'text-carnival-sky'
                  : 'text-carnival-coral underline'
                return <span key={i} className={color}>{char}</span>
              })}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); setCorrect(null) }}
              placeholder="여기에 입력하세요..."
              className={`input-field text-base mb-2 border-2 transition-all ${borderColor}`}
              disabled={correct === true}
            />
            {correct === true && (
              <p className="text-center text-carnival-green font-bold text-sm animate-bounce">
                ⚔️ +{DAMAGE_PER_SENTENCE} 데미지!
              </p>
            )}
            {correct === false && (
              <p className="text-center text-carnival-coral font-bold text-sm">❌ 다시 시도!</p>
            )}
            {correct === null && (
              <button type="submit" className="btn-sky w-full">
                공격! ⚔️
              </button>
            )}
          </form>
        </>
      )}
    </div>
  )
}
