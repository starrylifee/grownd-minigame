/**
 * 🔤 영어 단어 게임 (Bricks Vocabulary 300)
 *
 * [게임 방식]
 * - 10개 출제 → 오타 횟수 비례 감점 → 점수 확정
 * - 오타가 있었던 단어는 복습 라운드에서 다시 출제 (점수에 영향 없음)
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
  const [words]    = useState(() => pickWords(unit))

  // 메인 게임
  const [idx, setIdx]              = useState(0)
  const [input, setInput]          = useState('')
  const [feedback, setFeedback]    = useState(null)   // null | 'correct' | 'wrong'
  const [score, setScore]          = useState(0)
  const [wrongCount, setWrongCount]= useState(0)

  // 복습 라운드
  const [isReview, setIsReview]    = useState(false)
  const [reviewWords, setReviewWords] = useState([])  // 오타 있었던 단어들
  const [reviewIdx, setReviewIdx]  = useState(0)
  const [reviewDone, setReviewDone]= useState(false)

  // 최종 결과 (복습 중 onComplete 지연을 위해 저장)
  const pendingResult = useRef(null)

  const inputRef     = useRef(null)
  const startTimeRef = useRef(Date.now())

  useEffect(() => { inputRef.current?.focus() }, [idx, reviewIdx, isReview])

  const currentWord = isReview ? reviewWords[reviewIdx] : words[idx]
  const progress    = isReview
    ? ((reviewIdx) / reviewWords.length) * 100
    : (idx / words.length) * 100

  function handleSubmit(e) {
    e.preventDefault()
    if (feedback !== null || !currentWord) return

    const answer  = currentWord.english.toLowerCase().trim()
    const userAns = input.toLowerCase().trim()

    if (userAns === answer) {
      setFeedback('correct')

      if (isReview) {
        // 복습 정답
        setTimeout(() => {
          const next = reviewIdx + 1
          if (next >= reviewWords.length) {
            setReviewDone(true)
            setTimeout(() => onComplete(pendingResult.current), 1200)
          } else {
            setReviewIdx(next)
            setInput('')
            setFeedback(null)
          }
        }, 600)
      } else {
        // 메인 정답
        const partial   = Math.max(0.4, 1 - wrongCount * 0.2)
        const newScore  = score + partial
        setScore(newScore)

        // 오타가 있었던 단어 복습 큐에 추가
        if (wrongCount > 0) {
          setReviewWords(prev => [...prev, currentWord])
        }

        setTimeout(() => {
          const next = idx + 1
          if (next >= words.length) {
            // 메인 게임 종료 — 점수 확정
            const scoreRatio     = newScore / words.length
            const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
            pendingResult.current = {
              score: Math.round(newScore), scoreRatio, completionTime, passed: true, vocabUnit: unit,
            }
            // 복습할 단어가 있으면 복습 모드 진입, 없으면 바로 완료
            if (wrongCount > 0) {  // reviewWords에 방금 추가 예정인 단어 포함
              setIsReview(true)
              setReviewIdx(0)
              setInput('')
              setFeedback(null)
              setWrongCount(0)
            } else {
              onComplete(pendingResult.current)
            }
          } else {
            setIdx(next)
            setInput('')
            setFeedback(null)
            setWrongCount(0)
          }
        }, 600)
      }
    } else {
      // 오답
      setWrongCount(c => c + 1)
      setFeedback('wrong')
      setTimeout(() => {
        setInput('')
        setFeedback(null)
        inputRef.current?.focus()
      }, 600)
    }
  }

  // 복습 단어가 없는데 isReview가 됐을 때 방어
  useEffect(() => {
    if (isReview && reviewWords.length === 0 && pendingResult.current) {
      onComplete(pendingResult.current)
    }
  }, [isReview, reviewWords])

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

        {/* 배지 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-300 bg-blue-50 text-blue-700 text-sm font-bold">
            <span>📚</span><span>{unit}</span>
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
              ? <span>복습 {reviewIdx} / {reviewWords.length}</span>
              : <span>진행도 {idx} / {words.length}</span>
            }
            {!isReview && <span>점수 {Math.round(score * 10) / 10}점</span>}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${isReview ? 'bg-amber-400' : 'bg-blue-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 복습 완료 화면 */}
        {reviewDone ? (
          <div className="card text-center py-10 space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="font-black text-xl text-carnival-navy">복습 완료!</p>
            <p className="text-carnival-navy/50 text-sm">틀렸던 단어를 모두 맞혔어요</p>
          </div>
        ) : (
          <>
            {/* 문제 카드 */}
            <div className={`card text-center mb-5 py-10 transition-colors ${
              feedback === 'correct' ? 'bg-green-50 border-green-300' :
              feedback === 'wrong'   ? 'bg-red-50 border-red-300' : ''
            }`}>
              <p className="text-xs text-carnival-navy/40 mb-3 font-medium">
                {isReview ? '복습' : `${idx + 1}번`} 단어
              </p>
              <p className="text-4xl font-black text-carnival-navy mb-2">{currentWord?.korean}</p>
              {/* 힌트: 메인 게임 오타 1회+, 복습 오타 2회+ */}
              {!isReview && wrongCount > 0 && feedback === null && (
                <p className="text-xs text-amber-500 mt-2">
                  힌트: <span className="font-mono tracking-widest">
                    {currentWord.english.split('').map((c, i) => i === 0 ? c : '_').join(' ')}
                  </span>
                  {wrongCount >= 2 && <span className="ml-1">({currentWord.english.slice(0, 2)}...)</span>}
                </p>
              )}
              {isReview && wrongCount >= 2 && feedback === null && (
                <p className="text-xs text-amber-500 mt-2">
                  힌트: <span className="font-mono">({currentWord.english.slice(0, 2)}...)</span>
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
                  onPaste={e => e.preventDefault()}
                  type="text"
                  placeholder="영어 단어를 입력하세요"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="input-field flex-1 text-xl text-center font-bold font-mono"
                />
                <button type="submit" className="btn-secondary px-6 text-xl">→</button>
              </form>
            )}

            {/* 예상 포인트 (메인 게임만) */}
            {!isReview && feedback === null && idx > 0 && (
              <p className="text-center text-xs text-carnival-navy/30 mt-3">
                현재 {Math.round(score * 10) / 10}/{idx}점 → 예상 포인트 {Math.round((activity?.pointsPerCompletion || 10) * score / words.length)}P
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
