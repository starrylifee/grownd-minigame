/**
 * 🔤 영어 단어 게임 (Bricks Vocabulary 300)
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 *
 * [게임 방식]
 * - 교사가 설정한 Unit의 단어 중 10개를 무작위 출제
 * - 한글 뜻이 보이면 영어 단어를 타이핑
 * - 대소문자 무시, 앞뒤 공백 무시
 *
 * [점수 방식]
 * - 정답 비례 지급: 최종 포인트 = 설정 포인트 × (정답 수 / 문제 수)
 * - 오타 횟수에 따른 감점: submit 시 틀릴수록 scoreRatio 감소
 */
import { useState, useRef, useEffect } from 'react'
import { VOCAB_UNITS } from '../../data/vocabData'

const TOTAL = 10

function pickWords(unit) {
  const pool = VOCAB_UNITS[unit] || []
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(TOTAL, shuffled.length))
}

export default function VocabGame({ activity, onComplete, onExit }) {
  const unit = activity?.vocabUnit || 'UNIT 01'
  const [words]              = useState(() => pickWords(unit))
  const [idx, setIdx]        = useState(0)
  const [input, setInput]    = useState('')
  const [feedback, setFeedback] = useState(null)  // null | 'correct' | 'wrong'
  const [score, setScore]    = useState(0)
  const [wrongCount, setWrongCount] = useState(0)  // 현재 문제 오타 횟수
  const inputRef             = useRef(null)

  // 새 문제로 넘어갈 때 포커스
  useEffect(() => {
    inputRef.current?.focus()
  }, [idx])

  const w        = words[idx]
  const progress = (idx / TOTAL) * 100

  function handleSubmit(e) {
    e.preventDefault()
    if (feedback !== null) return

    const answer   = w.english.toLowerCase().trim()
    const userAns  = input.toLowerCase().trim()

    if (userAns === answer) {
      // 정답: 오타 횟수에 따라 점수 감산 (0회=1점, 1회=0.8, 2회=0.6, 3+회=0.4)
      const partial = Math.max(0.4, 1 - wrongCount * 0.2)
      setScore(s => s + partial)
      setFeedback('correct')

      setTimeout(() => {
        const next = idx + 1
        if (next >= words.length) {
          const finalScore    = score + partial
          const scoreRatio    = finalScore / words.length
          onComplete({ score: Math.round(finalScore), scoreRatio, passed: true, vocabUnit: unit })
        } else {
          setIdx(next)
          setInput('')
          setFeedback(null)
          setWrongCount(0)
        }
      }, 700)
    } else {
      // 오답: 오타 횟수 증가, 입력 초기화
      setWrongCount(c => c + 1)
      setFeedback('wrong')
      setTimeout(() => {
        setInput('')
        setFeedback(null)
        inputRef.current?.focus()
      }, 700)
    }
  }

  // 단어가 없는 경우 (unit에 단어 없음)
  if (!words.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center space-y-4">
          <p className="text-2xl">😅</p>
          <p className="font-bold text-carnival-navy">선생님이 단어 유닛을 설정하지 않았어요.</p>
          <button onClick={onExit} className="btn-secondary">나가기</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">🔤 영어 단어</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 유닛 배지 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-300 bg-blue-50 text-blue-700 text-sm font-bold mb-4">
          <span>📚</span>
          <span>{unit}</span>
        </div>

        {/* 진행 바 + 점수 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도 {idx} / {words.length}</span>
            <span>정답 {Math.round(score)}점</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-blue-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 문제 카드 */}
        <div className={`card text-center mb-5 py-10 transition-colors ${
          feedback === 'correct' ? 'bg-green-50 border-green-300' :
          feedback === 'wrong'   ? 'bg-red-50 border-red-300' : ''
        }`}>
          <p className="text-xs text-carnival-navy/40 mb-3 font-medium">{idx + 1}번 단어</p>
          <p className="text-4xl font-black text-carnival-navy mb-2">{w.korean}</p>
          {wrongCount > 0 && feedback === null && (
            <p className="text-xs text-amber-500 mt-2">
              힌트: <span className="font-mono tracking-widest">{w.english.split('').map((c, i) => i === 0 ? c : '_').join(' ')}</span>
              {wrongCount >= 2 && <span className="ml-1">({w.english.slice(0, 2)}...)</span>}
            </p>
          )}
        </div>

        {/* 피드백 */}
        {feedback === 'correct' && (
          <div className="text-center text-carnival-green font-black text-2xl mb-4 animate-bounce">
            🎯 정답!
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="text-center mb-4">
            <p className="text-carnival-coral font-black text-xl">❌ 다시 시도!</p>
            <p className="text-carnival-navy/50 text-sm mt-1">스펠링을 확인해보세요</p>
          </div>
        )}

        {/* 입력 */}
        {feedback === null && (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              type="text"
              placeholder="영어 단어를 입력하세요"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              className="input-field flex-1 text-xl text-center font-bold font-mono"
            />
            <button type="submit" className="btn-secondary px-6 text-xl">
              →
            </button>
          </form>
        )}

        {/* 점수 예상 안내 */}
        {feedback === null && idx > 0 && (
          <p className="text-center text-xs text-carnival-navy/30 mt-3">
            현재 {Math.round(score)}/{idx}점 → 예상 포인트 {Math.round((activity?.pointsPerCompletion || 10) * score / words.length)}P
          </p>
        )}
      </div>
    </div>
  )
}
