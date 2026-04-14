/**
 * ➗ 수학퀴즈
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 * - 이 컴포넌트에서 직접 포인트 지급 코드를 작성하지 마세요.
 */
import { useState, useRef, useEffect } from 'react'

const TOTAL = 10

function generateQuestion() {
  const ops = ['+', '-', '×', '÷']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a, b, answer

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 50) + 1
      b = Math.floor(Math.random() * 50) + 1
      answer = a + b
      break
    case '-':
      a = Math.floor(Math.random() * 50) + 10
      b = Math.floor(Math.random() * a)
      answer = a - b
      break
    case '×':
      a = Math.floor(Math.random() * 9) + 2
      b = Math.floor(Math.random() * 9) + 2
      answer = a * b
      break
    case '÷':
      b = Math.floor(Math.random() * 8) + 2
      answer = Math.floor(Math.random() * 10) + 1
      a = b * answer
      break
  }
  return { a, b, op, answer }
}

function makeQuestions() {
  return Array.from({ length: TOTAL }, generateQuestion)
}

export default function MathQuiz({ onComplete, onExit }) {
  const [questions]         = useState(makeQuestions)
  const [idx, setIdx]       = useState(0)
  const [input, setInput]   = useState('')
  const [correct, setCorrect] = useState(null)
  const [score, setScore]   = useState(0)
  const inputRef            = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [idx])

  const q = questions[idx]
  const progress = (idx / TOTAL) * 100

  function handleSubmit(e) {
    e.preventDefault()
    const num = Number(input)
    const ok = num === q.answer
    setCorrect(ok)
    if (ok) setScore(s => s + 1)

    setTimeout(() => {
      const next = idx + 1
      if (next >= TOTAL) {
        onComplete({ score: ok ? score + 1 : score, passed: true })
      } else {
        setIdx(next)
        setInput('')
        setCorrect(null)
        inputRef.current?.focus()
      }
    }, 700)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-carnival-navy">➗ 수학퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도</span>
            <span>{idx} / {TOTAL}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-carnival-purple transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 문제 */}
        <div className="card text-center mb-6 py-10">
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

        {/* 입력 */}
        {correct === null && (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              type="number"
              placeholder="답 입력"
              className="input-field flex-1 text-2xl text-center font-bold"
            />
            <button type="submit" className="btn-secondary px-6 text-xl">
              →
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
