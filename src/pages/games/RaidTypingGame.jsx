/**
 * 🐉 학급 레이드 타자 게임 — 배틀 씬 리디자인
 */
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { contributeToRaid, subscribeToRaidBoss } from '../../lib/firestore'

// ── 계기교육 날짜별 보스 테마 ────────────────────────────────
function getBossTheme(activityTheme) {
  if (activityTheme?.bossName) return activityTheme
  const now   = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
  const month = now.getMonth() + 1
  const day   = now.getDate()
  if (month === 3 && day === 1)  return { bossName: '제국의 침략자',      bossEmoji: '⚔️',  bossStory: '3·1 독립운동 기념일! 그라운드 드래곤이 독립을 지킵니다!' }
  if (month === 4)               return { bossName: '우주 침략자 로봇',    bossEmoji: '🤖',  bossStory: '과학의 달! 우주에서 온 적을 드래곤과 함께 물리쳐요!' }
  if (month === 5 && day === 5)  return { bossName: '어둠의 마법사',       bossEmoji: '🧙',  bossStory: '어린이날! 드래곤이 어린이들의 꿈을 지킵니다!' }
  if (month === 6 && day === 6)  return { bossName: '나라를 위협하는 악당', bossEmoji: '👹',  bossStory: '현충일! 나라를 지킨 영웅들을 기억하며 싸워요!' }
  if (month === 8 && day === 15) return { bossName: '광복을 막는 어둠',    bossEmoji: '🌑',  bossStory: '광복절! 드래곤이 자유와 평화를 되찾습니다!' }
  if (month === 10 && day === 3) return { bossName: '하늘의 폭풍 괴물',    bossEmoji: '⛈️', bossStory: '개천절! 건국의 기상으로 드래곤이 하늘을 열어요!' }
  if (month === 10 && day === 9) return { bossName: '한글 파괴 외계인',    bossEmoji: '👽',  bossStory: '한글날! 한글을 지켜주세요. 드래곤이 함께합니다!' }
  if (month === 10 && day === 25)return { bossName: '독도 침공 외계인 함대', bossEmoji: '🛸', bossStory: '독도의 날! 그라운드 드래곤이 독도를 지킵니다!' }
  return { bossName: '그림자 몬스터', bossEmoji: '👾', bossStory: '학급의 타자 실력으로 보스를 물리쳐요!' }
}

// ── 문장 풀 ───────────────────────────────────────────────
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

const DAMAGE_BASE         = 50   // 기본 데미지
const DAMAGE_MAX_BONUS    = 50   // 속도 보너스 최대치
const BONUS_TIME_WINDOW   = 15   // 초 이내 입력 시 보너스
const SESSION_SENTENCES   = 6
const DRAGON_COUNT        = 5

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── 배틀 씬 CSS 애니메이션 ────────────────────────────────
const BATTLE_STYLES = `
  @keyframes bossFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-12px) scale(1.03); }
  }
  @keyframes bossHit {
    0%   { transform: translateY(0) rotate(0deg) scale(1);    filter: brightness(1); }
    15%  { transform: translateY(-8px) rotate(-5deg) scale(1.1); filter: brightness(4) saturate(0); }
    35%  { transform: translateY(4px)  rotate(4deg) scale(0.95); filter: brightness(2) hue-rotate(180deg); }
    55%  { transform: translateY(-4px) rotate(-3deg) scale(1.05); filter: brightness(1.5); }
    75%  { transform: translateY(2px)  rotate(2deg); filter: brightness(1.2); }
    100% { transform: translateY(0)   rotate(0deg) scale(1);   filter: brightness(1); }
  }
  @keyframes bossDefeat {
    0%   { transform: scale(1) rotate(0deg);   opacity: 1; }
    30%  { transform: scale(1.4) rotate(15deg); opacity: 0.8; filter: brightness(5); }
    60%  { transform: scale(0.8) rotate(-20deg); opacity: 0.4; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }
  @keyframes bossGlow {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(239,68,68,0.4)); }
    50%       { filter: drop-shadow(0 0 20px rgba(239,68,68,0.9)); }
  }
  @keyframes dragonIdle0 { 0%,100%{transform:translateY(0)   rotate(-6deg) scale(1);}   50%{transform:translateY(-8px)  rotate(4deg) scale(1.05);} }
  @keyframes dragonIdle1 { 0%,100%{transform:translateY(-4px) rotate(3deg) scale(1);}    50%{transform:translateY(5px)   rotate(-5deg) scale(0.97);} }
  @keyframes dragonIdle2 { 0%,100%{transform:translateY(3px)  rotate(5deg) scale(1);}    50%{transform:translateY(-7px)  rotate(-3deg) scale(1.04);} }
  @keyframes dragonIdle3 { 0%,100%{transform:translateY(-2px) rotate(-4deg) scale(1);}   50%{transform:translateY(6px)   rotate(6deg) scale(0.96);} }
  @keyframes dragonIdle4 { 0%,100%{transform:translateY(5px)  rotate(2deg) scale(1);}    50%{transform:translateY(-5px)  rotate(-6deg) scale(1.06);} }
  @keyframes dragonLaunch {
    0%   { transform: translateX(0)    translateY(0)    scale(1)   rotate(0deg);  opacity: 1; }
    20%  { transform: translateX(30px) translateY(-25px) scale(1.3) rotate(-20deg); opacity: 1; }
    65%  { transform: translateX(150px) translateY(-15px) scale(1.1) rotate(-10deg); opacity: 1; }
    100% { transform: translateX(220px) translateY(10px)  scale(0.2) rotate(30deg);  opacity: 0; }
  }
  @keyframes damageFloat {
    0%   { transform: translateY(0)    scale(1.6); opacity: 1; }
    40%  { transform: translateY(-30px) scale(1.2); opacity: 1; }
    100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
  }
  @keyframes shakeArena {
    0%,100%{ transform: translateX(0); }
    20%    { transform: translateX(-4px); }
    40%    { transform: translateX(4px); }
    60%    { transform: translateX(-3px); }
    80%    { transform: translateX(3px); }
  }
  @keyframes hitFlash {
    0%,100%{ opacity: 0; }
    50%    { opacity: 1; }
  }
  @keyframes warningPulse {
    0%,100%{ box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    50%    { box-shadow: 0 0 30px 8px rgba(239,68,68,0.6); }
  }
  .boss-float    { animation: bossFloat 3s ease-in-out infinite; }
  .boss-hit      { animation: bossHit 0.6s ease-out forwards; }
  .boss-defeat   { animation: bossDefeat 1s ease-in forwards; }
  .boss-glow     { animation: bossGlow 2s ease-in-out infinite; }
  .dragon-idle-0 { animation: dragonIdle0 2.3s ease-in-out infinite; }
  .dragon-idle-1 { animation: dragonIdle1 1.9s ease-in-out infinite 0.4s; }
  .dragon-idle-2 { animation: dragonIdle2 2.1s ease-in-out infinite 0.2s; }
  .dragon-idle-3 { animation: dragonIdle3 2.5s ease-in-out infinite 0.7s; }
  .dragon-idle-4 { animation: dragonIdle4 1.8s ease-in-out infinite 0.5s; }
  .dragon-launch { animation: dragonLaunch 0.75s cubic-bezier(.4,0,.2,1) forwards; }
  .arena-shake   { animation: shakeArena 0.35s ease-out; }
  .hit-flash     { animation: hitFlash 0.3s ease-out; }
  .warning-pulse { animation: warningPulse 1.2s ease-in-out infinite; }
`

export default function RaidTypingGame({ activity, onComplete, onExit }) {
  const { student } = useAuth()

  const activityTheme = activity?.bossName
    ? { bossName: activity.bossName, bossEmoji: activity.bossEmoji, bossStory: activity.bossStory }
    : null
  const theme         = getBossTheme(activityTheme)
  const totalHp       = activity?.bossHp || 1000
  const arenaGradient = activity?.bossGradient || 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'

  // 커스텀 문장 파싱 (6개 미만이면 기본 풀로 fallback)
  const customLines = (activity?.customSentences || '')
    .split('\n').map(s => s.trim()).filter(Boolean)
  const sentencePool = customLines.length >= 6 ? customLines : RAID_SENTENCES

  const [boss, setBoss]           = useState(null)
  const [sentences]               = useState(() => shuffled(sentencePool))
  const [idx, setIdx]             = useState(0)
  const [input, setInput]         = useState('')
  const [correct, setCorrect]     = useState(null)  // null | number(dmg) | false
  const [myDamage, setMyDamage]   = useState(0)
  const [done, setDone]           = useState(false)

  // 애니메이션 state
  const [bossAnim, setBossAnim]       = useState('boss-float boss-glow')  // boss CSS classes
  const [arenaShake, setArenaShake]   = useState(false)
  const [launchSlot, setLaunchSlot]   = useState(null)   // 0-4 어느 드래곤이 날아가나
  const [damageNums, setDamageNums]   = useState([])     // [{ id, value }]
  const [hitFlash, setHitFlash]       = useState(false)

  const inputRef         = useRef(null)
  const prevDmgRef       = useRef(0)
  const uidRef           = useRef(0)
  const sentenceStartRef = useRef(Date.now())  // 문장별 타이머

  // 실시간 보스 HP 구독
  useEffect(() => {
    const unsub = subscribeToRaidBoss(student.classCode, data => {
      setBoss(data)
    })
    return unsub
  }, [student.classCode])

  // 다른 학생 공격 감지 → 주변 드래곤 랜덤 발사
  useEffect(() => {
    if (!boss) return
    const dmg = boss.currentDamage || 0
    const delta = dmg - prevDmgRef.current
    if (delta > 0 && delta < (DAMAGE_BASE + DAMAGE_MAX_BONUS) * 1.5) {
      // 내 공격이 아닌 경우만 (내 공격은 handleSubmit에서 처리)
      triggerAttack(Math.floor(Math.random() * DRAGON_COUNT))
    }
    prevDmgRef.current = dmg
  }, [boss?.currentDamage])

  useEffect(() => {
    if (!done) {
      inputRef.current?.focus()
      sentenceStartRef.current = Date.now()
    }
  }, [idx, done])

  function triggerAttack(slot, dmg = DAMAGE_BASE) {
    setLaunchSlot(slot)
    setTimeout(() => setLaunchSlot(null), 800)

    // 보스 히트 효과
    setTimeout(() => {
      setBossAnim('boss-hit')
      setArenaShake(true)
      setHitFlash(true)

      const uid = ++uidRef.current
      setDamageNums(prev => [...prev, { id: uid, value: dmg }])
      setTimeout(() => setDamageNums(prev => prev.filter(d => d.id !== uid)), 1000)
    }, 650)

    setTimeout(() => {
      setBossAnim('boss-float boss-glow')
      setArenaShake(false)
      setHitFlash(false)
    }, 1000)
  }

  const bossHp     = boss?.totalHp || totalHp
  const currentDmg = boss?.currentDamage || 0
  const hpPercent  = Math.max(0, Math.min(100, ((bossHp - currentDmg) / bossHp) * 100))
  const isDefeated = currentDmg >= bossHp
  const isDanger   = hpPercent <= 25 && !isDefeated

  const current = sentences[idx % sentences.length]

  function handleSubmit(e) {
    e.preventDefault()
    if (done) return
    const trimmed = input.trim()
    if (trimmed === current) {
      // 속도 보너스 계산
      const elapsed    = (Date.now() - sentenceStartRef.current) / 1000
      const bonus      = Math.max(0, Math.round(DAMAGE_MAX_BONUS * (1 - elapsed / BONUS_TIME_WINDOW)))
      const dmg        = DAMAGE_BASE + bonus

      setCorrect(dmg)  // 데미지 값을 correct에 저장해 피드백에 활용
      const newMyDamage = myDamage + dmg
      setMyDamage(newMyDamage)
      prevDmgRef.current += dmg  // 내 공격은 중복 감지 방지

      contributeToRaid(student.classCode, student.studentCode, dmg).catch(() => {})

      // 내 드래곤 공격 (idx % DRAGON_COUNT 슬롯)
      triggerAttack(idx % DRAGON_COUNT, dmg)

      setTimeout(() => {
        const next = idx + 1
        if (next >= SESSION_SENTENCES) {
          setDone(true)
          const totalDmg = (boss?.currentDamage || 0) + dmg
          const defeated = totalDmg >= bossHp
          if (defeated) setBossAnim('boss-defeat')
          onComplete({ score: newMyDamage, passed: true, scoreRatio: defeated ? 1.5 : 1 })
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

  const borderColor = typeof correct === 'number' ? 'border-carnival-green'
                    : correct === false            ? 'border-carnival-coral'
                    : 'border-slate-600'

  return (
    <>
      <style>{BATTLE_STYLES}</style>

      <div className="min-h-screen flex flex-col bg-slate-950 text-white">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <h1 className="text-lg font-black tracking-wide">🐉 학급 레이드</h1>
          <button onClick={onExit}
            className="text-sm text-slate-500 hover:text-red-400 transition-colors">
            나가기
          </button>
        </div>

        {/* ── 배틀 아레나 ────────────────────────────── */}
        <div
          className={`relative mx-4 rounded-3xl overflow-hidden mb-4 ${arenaShake ? 'arena-shake' : ''} ${isDanger ? 'warning-pulse' : ''}`}
          style={{
            background: arenaGradient,
            minHeight: 260,
          }}
        >
          {/* 붉은 히트 플래시 오버레이 */}
          {hitFlash && (
            <div
              className="hit-flash absolute inset-0 rounded-3xl pointer-events-none z-10"
              style={{ background: 'rgba(239,68,68,0.25)' }}
            />
          )}

          {/* 위험 경고 — HP 25% 이하 */}
          {isDanger && (
            <div className="absolute top-3 left-0 right-0 flex justify-center z-20">
              <span className="bg-red-500/80 text-white text-xs font-black px-3 py-1 rounded-full animate-bounce">
                ⚠️ 보스 체력 위험!
              </span>
            </div>
          )}

          {/* 드래곤 부대 — 왼쪽 */}
          <div className="absolute left-5 top-0 bottom-0 flex flex-col justify-center gap-3 z-10">
            {Array.from({ length: DRAGON_COUNT }, (_, i) => (
              <div
                key={i}
                className={launchSlot === i ? 'dragon-launch' : `dragon-idle-${i}`}
                style={{ fontSize: '2rem', display: 'inline-block', cursor: 'default' }}
              >
                🐉
              </div>
            ))}
          </div>

          {/* 보스 — 오른쪽 */}
          <div className="absolute right-6 top-0 bottom-0 flex flex-col items-center justify-center">
            {isDefeated ? (
              <div className="text-center">
                <div style={{ fontSize: '5rem' }}>💥</div>
                <p className="font-black text-yellow-300 text-lg mt-1">격파!</p>
              </div>
            ) : (
              <div className={`relative ${bossAnim}`} style={{ fontSize: '6rem', lineHeight: 1 }}>
                {theme.bossEmoji}
                {/* 데미지 숫자 플로팅 */}
                {damageNums.map(d => (
                  <div
                    key={d.id}
                    className="damage-float absolute pointer-events-none font-black text-red-400"
                    style={{
                      top: '-10px', left: '50%', transform: 'translateX(-50%)',
                      fontSize: '1.2rem',
                      animation: 'damageFloat 1s ease-out forwards',
                      textShadow: '0 0 8px rgba(239,68,68,0.8)',
                    }}
                  >
                    -{d.value}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HP 바 + 보스 이름 — 하단 */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-black text-sm text-white">{theme.bossName}</span>
              <span className="text-xs text-slate-400 font-bold">
                {Math.max(0, bossHp - currentDmg).toLocaleString()} / {bossHp.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-700"
                style={{
                  width: `${hpPercent}%`,
                  background: hpPercent > 50 ? '#ef4444'
                            : hpPercent > 25 ? '#f97316'
                            : '#eab308',
                  boxShadow: `0 0 8px ${hpPercent > 50 ? '#ef4444' : hpPercent > 25 ? '#f97316' : '#eab308'}`,
                }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-1.5 text-center">{theme.bossStory}</p>
          </div>
        </div>

        {/* ── 스탯 행 ────────────────────────────────── */}
        <div className="flex gap-2 px-4 mb-4">
          <div className="flex-1 bg-slate-800 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xs text-slate-400 font-bold">내 데미지</p>
            <p className="text-xl font-black text-sky-400">{myDamage}</p>
          </div>
          <div className="flex-1 bg-slate-800 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xs text-slate-400 font-bold">총 데미지</p>
            <p className="text-xl font-black text-green-400">{currentDmg.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-slate-800 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xs text-slate-400 font-bold">진행</p>
            <p className="text-xl font-black text-white">{Math.min(idx, SESSION_SENTENCES)}/{SESSION_SENTENCES}</p>
          </div>
          <div className="flex-1 bg-slate-800 rounded-2xl px-3 py-2.5 text-center">
            <p className="text-xs text-slate-400 font-bold">전사</p>
            <p className="text-xl font-black text-purple-400">
              {Object.keys(boss?.contributions || {}).length}명
            </p>
          </div>
        </div>

        {/* ── 세션 완료 ─────────────────────────────── */}
        {done ? (
          <div className="mx-4 bg-slate-800 rounded-3xl text-center py-10 px-6">
            <div className="text-5xl mb-3">{isDefeated ? '🏆' : '⚔️'}</div>
            <p className="font-black text-2xl text-white">
              {isDefeated ? '보스 격파! 🎉' : '오늘 세션 완료!'}
            </p>
            {isDefeated && (
              <p className="text-yellow-300 font-bold text-sm mt-1">격파 보너스 1.5배 지급!</p>
            )}
            <p className="text-slate-400 text-sm mt-2">내 데미지: <strong className="text-sky-400">{myDamage}</strong></p>
            <p className="text-slate-500 text-xs mt-1">포인트 지급 중이에요...</p>
          </div>
        ) : (
          /* ── 타이핑 영역 ─────────────────────────── */
          <div className="px-4 flex-1">
            {/* 제시 문장 */}
            <div className="bg-slate-800 rounded-2xl p-4 mb-3">
              <p className="text-xs text-slate-500 mb-2 font-medium text-center">아래 문장을 정확히 입력하세요</p>
              <p className="text-base font-bold leading-relaxed text-center">
                {current.split('').map((char, i) => {
                  const typed = input[i]
                  const color = typed == null     ? 'text-white'
                              : typed === char   ? 'text-sky-400'
                              : 'text-red-400 underline'
                  return <span key={i} className={color}>{char}</span>
                })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); setCorrect(null) }}
                onPaste={e => e.preventDefault()}
                placeholder="여기에 입력하세요..."
                className={`w-full px-4 py-3 rounded-2xl bg-slate-800 text-white placeholder-slate-500
                  font-medium text-base border-2 outline-none transition-all ${borderColor}`}
                disabled={typeof correct === 'number'}
              />
              {typeof correct === 'number' && (
                <p className="text-center font-black text-lg animate-bounce">
                  {correct > DAMAGE_BASE
                    ? <span className="text-yellow-300">⚡ +{correct} 스피드 보너스!</span>
                    : <span className="text-green-400">⚔️ +{correct} 데미지!</span>
                  }
                </p>
              )}
              {correct === false && (
                <p className="text-center text-red-400 font-bold">❌ 다시 시도!</p>
              )}
              {correct === null && (
                <button type="submit"
                  className="w-full py-3 rounded-2xl font-black text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 active:scale-95 transition-all shadow-lg">
                  ⚔️ 공격!
                </button>
              )}
            </form>
          </div>
        )}

        <div className="h-6" />
      </div>
    </>
  )
}
