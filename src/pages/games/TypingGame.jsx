/**
 * ⌨️ 타자게임
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 * - 이 컴포넌트에서 직접 포인트 지급 코드를 작성하지 마세요.
 */
import { useState, useEffect, useRef } from 'react'

const SENTENCES = [
  '오늘도 열심히 공부하는 내가 자랑스럽다',
  '꾸준한 노력은 반드시 좋은 결과를 만든다',
  '친구를 배려하고 함께 성장하는 우리 반',
  '작은 것에 감사하는 마음을 잊지 말자',
  '포기하지 않으면 반드시 이룰 수 있다',
]

export default function TypingGame({ onComplete, onExit }) {
  const [idx, setIdx]           = useState(0)
  const [input, setInput]       = useState('')
  const [done, setDone]         = useState(0)
  const [correct, setCorrect]   = useState(null)  // null | true | false
  const [startTime]             = useState(Date.now())
  const inputRef                = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [idx])

  const current = SENTENCES[idx]
  const progress = (done / SENTENCES.length) * 100

  function handleChange(e) {
    const val = e.target.value
    setInput(val)
    setCorrect(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed === current) {
      setCorrect(true)
      const next = idx + 1
      const newDone = done + 1
      setDone(newDone)
      setTimeout(() => {
        if (next >= SENTENCES.length) {
          const elapsed = Math.round((Date.now() - startTime) / 1000)
          onComplete({ score: elapsed, passed: true })
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
    ? 'border-carnival-green shadow-carnival-green/20'
    : correct === false
    ? 'border-carnival-coral shadow-carnival-coral/20'
    : 'border-gray-200'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-carnival-navy">⌨️ 타자게임</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도</span>
            <span>{done} / {SENTENCES.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-carnival-sky transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 제시 문장 */}
        <div className="card mb-4 text-center">
          <p className="text-xs text-carnival-navy/40 mb-2 font-medium">아래 문장을 입력하세요</p>
          <p className="text-xl font-bold text-carnival-navy leading-relaxed">
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

        {/* 입력 */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={input}
            onChange={handleChange}
            placeholder="여기에 입력하세요..."
            className={`input-field text-lg mb-3 border-2 transition-all ${borderColor}`}
            disabled={correct === true}
          />
          {correct === true && (
            <p className="text-center text-carnival-green font-bold animate-bounce">✅ 정확해요!</p>
          )}
          {correct === false && (
            <p className="text-center text-carnival-coral font-bold">❌ 다시 시도해봐요!</p>
          )}
          {correct === null && (
            <button type="submit" className="btn-sky w-full">
              확인 →
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
