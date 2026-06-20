/**
 * 🧮 연산 순서 클릭 게임
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 *
 * [게임 방식]
 * - 한 식에서 연산자(+ - × ÷)를 "계산하는 순서"대로 클릭한다.
 *   (괄호 안 → ×·÷ → +·- / 같은 우선순위는 왼쪽부터)
 * - 한 판은 5문제. 5문제를 "모두" 통과해야 포인트를 받는다. (올오어낫싱)
 * - 한 번이라도 잘못 클릭하거나 시간이 초과되면 그 문제는 실패.
 *
 * [점수 방식]
 * - 5문제 전부 정답 → scoreRatio 1 (포인트 지급)
 * - 하나라도 실패 → scoreRatio 0 (포인트 없음)
 *
 * [타이머]
 * - 문제당 제한 시간(난이도별). 초과 시 자동 실패 후 다음 문제.
 */
import { useState, useRef, useEffect } from 'react'
import { OPERATOR_ORDER_PROBLEMS, tokenizeDisplay } from '../../data/operatorOrderData'

const ROUNDS = 5

// 난이도별 문제당 제한 시간(초)
const TIME_BY_LEVEL = { 1: 20, 2: 25, 3: 30 }

const LEVEL_INFO = {
  1: { label: '쉬움', emoji: '🟢' },
  2: { label: '보통', emoji: '🟡' },
  3: { label: '어려움', emoji: '🔴' },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickProblems(level) {
  const pool = level === 'all'
    ? OPERATOR_ORDER_PROBLEMS
    : OPERATOR_ORDER_PROBLEMS.filter(p => p.level === Number(level))
  const source = pool.length >= ROUNDS ? pool : OPERATOR_ORDER_PROBLEMS
  return shuffle(source).slice(0, ROUNDS)
}

// SVG 원형 타이머
function TimerRing({ timeLeft, max }) {
  const radius        = 22
  const circumference = 2 * Math.PI * radius
  const offset        = circumference * (1 - timeLeft / max)
  const ratio = timeLeft / max
  const color = ratio > 0.5 ? '#22c55e' : ratio > 0.2 ? '#eab308' : '#ef4444'

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="text-lg font-black" style={{ color }}>{timeLeft}</span>
    </div>
  )
}

export default function OperatorOrderGame({ activity, onComplete, onExit }) {
  const level = activity?.opOrderLevel ?? 1

  const [problems]  = useState(() => pickProblems(level))
  const [idx, setIdx] = useState(0)

  const problem  = problems[idx]
  const timerMax = TIME_BY_LEVEL[problem.level] || 25

  // 이번 문제에서 지금까지 누른 연산자(opIndex 배열) — 정답 클릭만 누적
  const [picked, setPicked]   = useState([])
  // null | 'success' | 'wrong' | 'timeout'
  const [status, setStatus]   = useState(null)
  const [wrongIdx, setWrongIdx] = useState(null)  // 잘못 누른 연산자 강조용
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timerMax)
  // 세션 전체에 1번 주어지는 라이프 — 첫 오클릭은 실패 없이 봐준다
  const [lifeUsed, setLifeUsed] = useState(false)
  const [flashIdx, setFlashIdx] = useState(null)  // 라이프로 봐준 오클릭 잠깐 강조

  const startTimeRef = useRef(Date.now())
  // 타이머 콜백에서 최신 값 참조용
  const idxRef = useRef(idx); idxRef.current = idx
  const correctRef = useRef(correctCount); correctRef.current = correctCount

  // 새 문제 → 상태 초기화
  useEffect(() => {
    setPicked([])
    setStatus(null)
    setWrongIdx(null)
    setFlashIdx(null)
    setTimeLeft(TIME_BY_LEVEL[problems[idx].level] || 25)
  }, [idx])

  // ① 카운트다운 (판정 중이면 정지)
  useEffect(() => {
    if (status !== null || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, status])

  // ② 시간 0 → 타임오버
  useEffect(() => {
    if (timeLeft > 0 || status !== null) return
    setStatus('timeout')
  }, [timeLeft, status])

  // ③ 판정 후 다음 문제로 이동
  useEffect(() => {
    if (status === null) return
    const delay = status === 'success' ? 900 : 1700
    const id = setTimeout(() => {
      const next = idxRef.current + 1
      const finalCorrect = correctRef.current
      if (next >= ROUNDS) {
        const passed = finalCorrect === ROUNDS
        onComplete({
          score:          finalCorrect,
          scoreRatio:     passed ? 1 : 0,
          completionTime: Math.round((Date.now() - startTimeRef.current) / 1000),
          passed,
        })
      } else {
        setIdx(next)
      }
    }, delay)
    return () => clearTimeout(id)
  }, [status])

  const tokens = tokenizeDisplay(problem.display)
  // 현재 단계(1-based)에서 클릭해야 할 연산자의 표시 인덱스(0-based)
  const step = picked.length + 1
  const expectedOpIndex = problem.clickOrder[step - 1] - 1

  function handleOpClick(opIndex) {
    if (status !== null) return
    if (picked.includes(opIndex)) return  // 이미 누른 연산자

    if (opIndex === expectedOpIndex) {
      const nextPicked = [...picked, opIndex]
      setPicked(nextPicked)
      if (nextPicked.length === problem.ops.length) {
        // 마지막 연산자까지 정답 → 문제 통과
        setStatus('success')
        setCorrectCount(c => c + 1)
      }
    } else if (!lifeUsed) {
      // 첫 오클릭은 라이프로 봐줌 — 실패 없이 같은 문제 계속
      setLifeUsed(true)
      setFlashIdx(opIndex)
      setTimeout(() => setFlashIdx(cur => (cur === opIndex ? null : cur)), 800)
    } else {
      setWrongIdx(opIndex)
      setStatus('wrong')
    }
  }

  // 각 연산자가 몇 번째로 눌렸는지 (1-based) — 배지 표시용
  const pickedStepOf = (opIndex) => {
    const p = picked.indexOf(opIndex)
    return p === -1 ? null : p + 1
  }

  // 실패/타임오버 시 정답 순서 안내 (표시인덱스 → 단계번호)
  const correctStepOf = (opIndex) => problem.clickOrder.indexOf(opIndex + 1) + 1

  const showAnswer = status === 'wrong' || status === 'timeout'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">🧮 연산 순서</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 진행 + 난이도 + 라이프 */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-carnival-navy/60">
            {LEVEL_INFO[problem.level]?.emoji} {LEVEL_INFO[problem.level]?.label}
            <span className="ml-1" title={lifeUsed ? '기회 다 썼어요' : '실수 1번 봐주는 기회'}>
              {lifeUsed ? '🤍' : '❤️'}
            </span>
          </span>
          <span className="text-sm font-bold text-carnival-navy/50">
            {idx + 1} / {ROUNDS}문제 · 통과 {correctCount}개
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div
            className="h-3 rounded-full bg-carnival-purple transition-all duration-500"
            style={{ width: `${(idx / ROUNDS) * 100}%` }}
          />
        </div>

        {/* 안내 */}
        <p className="text-center text-sm text-carnival-navy/60 mb-3 font-medium">
          계산하는 <strong className="text-carnival-purple">순서대로</strong> 연산자를 눌러요!
        </p>

        {/* 식 + 타이머 */}
        <div className="card text-center mb-5 py-8 relative">
          <div className="absolute top-4 right-4">
            <TimerRing timeLeft={status !== null ? 0 : timeLeft} max={timerMax} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3 text-3xl font-black text-carnival-navy px-2 leading-relaxed">
            {tokens.map((t, i) => {
              if (t.type === 'text') {
                return <span key={i} className="whitespace-pre">{t.value}</span>
              }
              const pStep   = pickedStepOf(t.opIndex)
              const isWrong = wrongIdx === t.opIndex
              const isFlash = flashIdx === t.opIndex
              const isNext  = status === null && t.opIndex === expectedOpIndex
              const revealStep = showAnswer ? correctStepOf(t.opIndex) : null

              let cls = 'relative inline-flex items-center justify-center w-12 h-12 rounded-xl border-2 font-black transition-all '
              if (pStep) {
                cls += 'bg-carnival-green text-white border-carnival-green '
              } else if (isFlash) {
                cls += 'bg-amber-400 text-white border-amber-400 animate-bounce '
              } else if (isWrong) {
                cls += 'bg-carnival-coral text-white border-carnival-coral animate-bounce '
              } else if (showAnswer) {
                cls += 'bg-orange-100 text-orange-600 border-orange-300 '
              } else if (isNext) {
                cls += 'bg-white text-carnival-purple border-carnival-purple ring-2 ring-carnival-purple/30 hover:scale-105 '
              } else {
                cls += 'bg-white text-carnival-navy border-gray-200 hover:border-carnival-purple hover:scale-105 '
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOpClick(t.opIndex)}
                  disabled={status !== null}
                  className={cls}
                >
                  {t.value}
                  {/* 내가 누른 순서 배지 */}
                  {pStep && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-carnival-navy text-white text-[11px] flex items-center justify-center">
                      {pStep}
                    </span>
                  )}
                  {/* 정답 순서 안내 배지 */}
                  {!pStep && showAnswer && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] flex items-center justify-center">
                      {revealStep}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 피드백 */}
        {flashIdx !== null && status === null && (
          <div className="text-center text-amber-500 font-black text-xl mb-2 animate-bounce">
            💛 앗! 이번 한 번은 봐줄게요 (기회 1번 사용)
          </div>
        )}
        {status === 'success' && (
          <div className="text-center text-carnival-green font-black text-2xl mb-2 animate-bounce">
            🎯 정답! = {problem.answer}
          </div>
        )}
        {status === 'wrong' && (
          <div className="text-center mb-2">
            <p className="text-carnival-coral font-black text-2xl">❌ 순서가 틀렸어요</p>
            <p className="text-carnival-navy/50 text-sm mt-1">주황색 번호가 올바른 계산 순서예요</p>
          </div>
        )}
        {status === 'timeout' && (
          <div className="text-center mb-2">
            <p className="text-orange-500 font-black text-2xl">⏰ 시간 초과!</p>
            <p className="text-carnival-navy/50 text-sm mt-1">주황색 번호가 올바른 계산 순서예요</p>
          </div>
        )}

        {/* 올오어낫싱 안내 */}
        <p className="text-center text-xs text-carnival-navy/30 mt-3">
          5문제를 <strong>모두</strong> 통과해야 포인트를 받아요! · 실수는 ❤️ 1번만 봐줘요
        </p>
      </div>
    </div>
  )
}
