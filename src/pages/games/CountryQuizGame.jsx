/**
 * 🌍 나라 수도 퀴즈
 *
 * [게임 방식]
 * - 10개 출제 → 오타 횟수 비례 감점 → 점수 확정
 * - 오답이 있었던 나라는 복습 라운드에서 다시 출제 (점수에 영향 없음)
 * - 힌트: 1회 오답 → 음절 수(___ 형태), 2회 오답 → 첫 글자 + ___
 */
import { useState, useRef, useEffect } from 'react'
import { COUNTRIES } from '../../data/countriesData'

const TOTAL = 10

function pickCountries() {
  const shuffled = [...COUNTRIES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(TOTAL, shuffled.length))
}

function syllableHint(word, revealCount = 0) {
  // revealCount: 앞에서 보여줄 글자 수
  return word
    .split('')
    .map((c, i) => i < revealCount ? c : '_')
    .join(' ')
}

export default function CountryQuizGame({ activity, onComplete, onExit }) {
  const [items]    = useState(() => pickCountries())

  // 메인 게임
  const [idx, setIdx]               = useState(0)
  const [input, setInput]           = useState('')
  const [feedback, setFeedback]     = useState(null)   // null | 'correct' | 'wrong'
  const [score, setScore]           = useState(0)
  const [wrongCount, setWrongCount] = useState(0)

  // 복습 라운드
  const [isReview, setIsReview]       = useState(false)
  const [reviewItems, setReviewItems] = useState([])
  const [reviewIdx, setReviewIdx]     = useState(0)
  const [reviewDone, setReviewDone]   = useState(false)
  const [reviewWrong, setReviewWrong] = useState(0)

  const pendingResult = useRef(null)
  const inputRef      = useRef(null)
  const startTimeRef  = useRef(Date.now())

  useEffect(() => { inputRef.current?.focus() }, [idx, reviewIdx, isReview])

  const current  = isReview ? reviewItems[reviewIdx] : items[idx]
  const progress = isReview
    ? (reviewIdx / reviewItems.length) * 100
    : (idx / items.length) * 100

  const currentWrong = isReview ? reviewWrong : wrongCount

  function handleSubmit(e) {
    e.preventDefault()
    if (feedback !== null || !current) return

    const answer  = current.capital.trim()
    const userAns = input.trim()

    if (userAns === answer) {
      setFeedback('correct')

      if (isReview) {
        setTimeout(() => {
          const next = reviewIdx + 1
          if (next >= reviewItems.length) {
            setReviewDone(true)
            setTimeout(() => onComplete(pendingResult.current), 1200)
          } else {
            setReviewIdx(next)
            setInput('')
            setFeedback(null)
            setReviewWrong(0)
          }
        }, 700)
      } else {
        const partial  = Math.max(0.4, 1 - wrongCount * 0.2)
        const newScore = score + partial
        setScore(newScore)

        if (wrongCount > 0) {
          setReviewItems(prev => [...prev, current])
        }

        setTimeout(() => {
          const next = idx + 1
          if (next >= items.length) {
            const scoreRatio     = newScore / items.length
            const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
            pendingResult.current = { score: Math.round(newScore), scoreRatio, completionTime, passed: true }

            if (reviewItems.length > 0 || wrongCount > 0) {
              setIsReview(true)
              setReviewIdx(0)
              setInput('')
              setFeedback(null)
              setWrongCount(0)
              setReviewWrong(0)
            } else {
              onComplete(pendingResult.current)
            }
          } else {
            setIdx(next)
            setInput('')
            setFeedback(null)
            setWrongCount(0)
          }
        }, 700)
      }
    } else {
      if (isReview) {
        setReviewWrong(c => c + 1)
      } else {
        setWrongCount(c => c + 1)
      }
      setFeedback('wrong')
      setTimeout(() => {
        setInput('')
        setFeedback(null)
        inputRef.current?.focus()
      }, 700)
    }
  }

  // 복습 단어 없는 케이스 방어
  useEffect(() => {
    if (isReview && reviewItems.length === 0 && pendingResult.current) {
      onComplete(pendingResult.current)
    }
  }, [isReview, reviewItems])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">🌍 나라 수도 퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 배지 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-300 bg-green-50 text-green-700 text-sm font-bold">
            <span>🌐</span><span>세계 수도</span>
          </div>
          {isReview && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-700 text-sm font-bold animate-pulse">
              <span>🔁</span><span>복습 라운드</span>
            </div>
          )}
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            {isReview
              ? <span>복습 {reviewIdx} / {reviewItems.length}</span>
              : <span>진행도 {idx} / {items.length}</span>
            }
            {!isReview && <span>점수 {Math.round(score * 10) / 10}점</span>}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${isReview ? 'bg-amber-400' : 'bg-green-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 복습 완료 */}
        {reviewDone ? (
          <div className="card text-center py-10 space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="font-black text-xl text-carnival-navy">복습 완료!</p>
            <p className="text-carnival-navy/50 text-sm">틀렸던 나라를 모두 맞혔어요</p>
          </div>
        ) : (
          <>
            {/* 문제 카드 */}
            <div className={`card text-center mb-5 py-10 transition-colors ${
              feedback === 'correct' ? 'bg-green-50 border-green-300' :
              feedback === 'wrong'   ? 'bg-red-50 border-red-300' : ''
            }`}>
              <p className="text-xs text-carnival-navy/40 mb-2 font-medium">
                {isReview ? '복습' : `${idx + 1}번`} 나라
              </p>
              <div className="text-6xl mb-3">{current?.flag}</div>
              <p className="text-3xl font-black text-carnival-navy mb-1">{current?.country}</p>
              <p className="text-xs text-carnival-navy/30 mb-2">이 나라의 수도는?</p>

              {/* 힌트 */}
              {feedback === null && currentWrong >= 1 && (
                <p className="text-xs text-amber-500 mt-2 font-mono tracking-widest">
                  힌트: {syllableHint(current.capital, currentWrong >= 2 ? 1 : 0)}
                  {currentWrong >= 2 && (
                    <span className="ml-1 text-amber-400">({current.capital.length}글자)</span>
                  )}
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
                {currentWrong >= 2 && (
                  <p className="text-carnival-navy/50 text-sm mt-1">
                    정답: <span className="font-bold text-carnival-navy">{current.capital}</span>
                  </p>
                )}
              </div>
            )}

            {/* 입력 */}
            {feedback === null && (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onPaste={e => e.preventDefault()}
                  type="text"
                  placeholder="수도 이름을 입력하세요"
                  autoComplete="off"
                  spellCheck="false"
                  className="input-field flex-1 text-xl text-center font-bold"
                />
                <button type="submit" className="btn-secondary px-6 text-xl">→</button>
              </form>
            )}

            {/* 예상 포인트 */}
            {!isReview && feedback === null && idx > 0 && (
              <p className="text-center text-xs text-carnival-navy/30 mt-3">
                현재 {Math.round(score * 10) / 10}/{idx}점 → 예상 포인트 {Math.round((activity?.pointsPerCompletion || 10) * score / items.length)}P
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
