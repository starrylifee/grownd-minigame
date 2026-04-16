/**
 * ➗ 사칙연산 퀴즈 (유형별 난이도)
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 *
 * [점수 방식]
 * - 정답: +1점  / 오답 또는 타임오버: 0점
 * - 최종 포인트 = 설정 포인트 × (정답 수 / 10)  → 비례 지급
 *
 * [타이머]
 * - 문제당 5초. 시간 초과 시 자동으로 오답 처리 후 다음 문제
 */
import { useState, useRef, useEffect } from 'react'

const TOTAL     = 10
const TIMER_MAX = 5  // 문제당 제한 시간(초)

const TYPE_INFO = {
  'single-add':       { label: '한 자리 덧셈',               emoji: '➕', color: 'bg-green-100 text-green-700 border-green-300' },
  'double-add':       { label: '두 자리 덧셈 (받아올림 없음)', emoji: '📐', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  'double-add-carry': { label: '두 자리 덧셈 (받아올림 있음)', emoji: '🔢', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  'single-mul':       { label: '한 자리 곱셈',               emoji: '✖️', color: 'bg-purple-100 text-purple-700 border-purple-300' },
}

function generateQuestion(mathType) {
  switch (mathType) {
    case 'single-add': {
      const a = Math.floor(Math.random() * 9) + 1
      const b = Math.floor(Math.random() * 9) + 1
      return { a, b, op: '+', answer: a + b }
    }
    case 'double-add': {
      let a, b
      do {
        a = Math.floor(Math.random() * 40) + 10
        b = Math.floor(Math.random() * 40) + 10
      } while ((a % 10 + b % 10) >= 10)
      return { a, b, op: '+', answer: a + b }
    }
    case 'double-add-carry': {
      let a, b
      do {
        a = Math.floor(Math.random() * 79) + 11
        b = Math.floor(Math.random() * 79) + 11
      } while ((a % 10 + b % 10) < 10 || a + b > 199)
      return { a, b, op: '+', answer: a + b }
    }
    case 'single-mul': {
      const a = Math.floor(Math.random() * 8) + 2
      const b = Math.floor(Math.random() * 8) + 2
      return { a, b, op: '×', answer: a * b }
    }
    default: {
      const a = Math.floor(Math.random() * 9) + 1
      const b = Math.floor(Math.random() * 9) + 1
      return { a, b, op: '+', answer: a + b }
    }
  }
}

function makeQuestions(mathType) {
  return Array.from({ length: TOTAL }, () => generateQuestion(mathType))
}

// SVG 원형 타이머
function TimerRing({ timeLeft }) {
  const radius        = 22
  const circumference = 2 * Math.PI * radius
  const offset        = circumference * (1 - timeLeft / TIMER_MAX)
  const color = timeLeft > 3 ? '#22c55e' : timeLeft > 1 ? '#eab308' : '#ef4444'

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

export default function MathQuiz({ activity, onComplete, onExit }) {
  const mathType = activity?.mathType || 'single-add'
  const info     = TYPE_INFO[mathType] || TYPE_INFO['single-add']

  const [questions]           = useState(() => makeQuestions(mathType))
  const [idx, setIdx]         = useState(0)
  const [input, setInput]     = useState('')
  const [correct, setCorrect] = useState(null)  // null | true | false | 'timeout'
  const [score, setScore]     = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX)
  const inputRef              = useRef(null)
  const startTimeRef          = useRef(Date.now())

  // 최신 idx·score를 타이머 콜백에서 참조하기 위한 ref
  const idxRef   = useRef(idx)
  const scoreRef = useRef(score)
  idxRef.current   = idx
  scoreRef.current = score

  // 새 문제로 넘어갈 때 타이머 리셋
  useEffect(() => {
    setTimeLeft(TIMER_MAX)
    inputRef.current?.focus()
  }, [idx])

  // ① 카운트다운 (정답/오답/타임오버 상태면 중지)
  useEffect(() => {
    if (correct !== null || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, correct])

  // ② 시간 0 감지 → 타임오버 표시
  useEffect(() => {
    if (timeLeft > 0 || correct !== null) return
    setCorrect('timeout')
  }, [timeLeft, correct])

  // ③ 타임오버 후 다음 문제로 이동
  //    correct 변화로 클린업이 취소되지 않도록 별도 effect로 분리
  useEffect(() => {
    if (correct !== 'timeout') return
    const next = idxRef.current + 1
    const s    = scoreRef.current
    const id   = setTimeout(() => {
      if (next >= TOTAL) {
        onComplete({ score: s, scoreRatio: s / TOTAL, completionTime: Math.round((Date.now() - startTimeRef.current) / 1000), passed: true, mathType })
      } else {
        setIdx(next)
        setInput('')
        setCorrect(null)
      }
    }, 1000)
    return () => clearTimeout(id)
  }, [correct])

  const q        = questions[idx]
  const progress = (idx / TOTAL) * 100

  function handleSubmit(e) {
    e.preventDefault()
    if (correct !== null) return  // 타임오버 중 입력 방지

    const num = Number(input)
    const ok  = num === q.answer
    setCorrect(ok ? true : false)
    if (ok) setScore(s => s + 1)

    setTimeout(() => {
      const next      = idx + 1
      const newScore  = ok ? score + 1 : score
      if (next >= TOTAL) {
        onComplete({ score: newScore, scoreRatio: newScore / TOTAL, completionTime: Math.round((Date.now() - startTimeRef.current) / 1000), passed: true, mathType })
      } else {
        setIdx(next)
        setInput('')
        setCorrect(null)
      }
    }, 700)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">➗ 수학퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 유형 배지 */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold mb-4 ${info.color}`}>
          <span>{info.emoji}</span>
          <span>{info.label}</span>
        </div>

        {/* 진행 바 + 점수 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도 {idx} / {TOTAL}</span>
            <span>정답 {score}개</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-carnival-purple transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 문제 + 타이머 */}
        <div className="card text-center mb-5 py-8 relative">
          {/* 타이머 */}
          <div className="absolute top-4 right-4">
            <TimerRing timeLeft={correct !== null ? 0 : timeLeft} />
          </div>

          <p className="text-xs text-carnival-navy/40 mb-3 font-medium">
            {idx + 1}번 문제
          </p>
          <p className="text-5xl font-black text-carnival-navy">
            {q.a} {q.op} {q.b} = ?
          </p>
        </div>

        {/* 피드백 */}
        {correct === true && (
          <div className="text-center text-carnival-green font-black text-2xl mb-4 animate-bounce">
            🎯 정답!
          </div>
        )}
        {correct === false && (
          <div className="text-center mb-4">
            <p className="text-carnival-coral font-black text-2xl">❌ 틀렸어요</p>
            <p className="text-carnival-navy/50 text-sm mt-1">정답은 <strong>{q.answer}</strong> 이에요</p>
          </div>
        )}
        {correct === 'timeout' && (
          <div className="text-center mb-4">
            <p className="text-orange-500 font-black text-2xl">⏰ 시간 초과!</p>
            <p className="text-carnival-navy/50 text-sm mt-1">정답은 <strong>{q.answer}</strong> 이에요</p>
          </div>
        )}

        {/* 입력 */}
        {correct === null && (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onPaste={e => e.preventDefault()}
              type="number"
              placeholder="답 입력"
              className="input-field flex-1 text-2xl text-center font-bold"
            />
            <button type="submit" className="btn-secondary px-6 text-xl">
              →
            </button>
          </form>
        )}

        {/* 점수 예상 안내 */}
        {correct === null && idx > 0 && (
          <p className="text-center text-xs text-carnival-navy/30 mt-3">
            현재 {score}/{idx}정답 → 예상 포인트 {Math.round((activity?.pointsPerCompletion || 10) * score / TOTAL)}P
          </p>
        )}
      </div>
    </div>
  )
}
