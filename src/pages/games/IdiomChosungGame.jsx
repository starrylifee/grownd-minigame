/**
 * 🀄 초성힌트 사자성어 퀴즈
 *
 * [게임 방식]
 * - 사자성어의 초성(4글자)을 보고 한글 음을 입력 (8개 출제)
 * - 채점은 띄어쓰기를 무시하고 비교
 * - 힌트 사용 시 감점 (힌트를 봤으니 점수 차감):
 *     0회 오답(힌트 X)    → 1.0
 *     1회 오답(뜻 공개)   → 0.5  (−50%)
 *     2회 오답(한자 공개) → 0.4
 *     3회+ 오답(정답 공개) → 0.3
 */
import { useState, useRef, useEffect } from 'react'
import { IDIOMS } from '../../data/idiomsData'

const TOTAL = 8

// 오답(=힌트 단계)별 획득 점수
const HINT_SCORE = [1.0, 0.5, 0.4, 0.3]
const scoreFor = wrong => HINT_SCORE[Math.min(wrong, HINT_SCORE.length - 1)]

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

function toChosung(text) {
  return text.split('').map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00
    if (code < 0 || code > 11171) return ch
    return CHO[Math.floor(code / 588)]
  }).join('')
}

function pickIdioms() {
  const shuffled = [...IDIOMS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(TOTAL, shuffled.length))
}

function normalize(text) {
  return text.replace(/\s+/g, '')
}

export default function IdiomChosungGame({ activity, onComplete, onExit }) {
  const [items] = useState(() => pickIdioms())

  const [idx, setIdx]               = useState(0)
  const [input, setInput]           = useState('')
  const [feedback, setFeedback]     = useState(null)   // null | 'correct' | 'wrong'
  const [score, setScore]           = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [done, setDone]             = useState(false)

  const inputRef     = useRef(null)
  const startTimeRef = useRef(Date.now())

  useEffect(() => { if (feedback === null) inputRef.current?.focus() }, [idx, feedback])

  const current  = items[idx]
  const progress = (idx / items.length) * 100

  // 글자 단위 초성 칩 (2회 오답부터 각 글자 첫 글자 공개는 없음 — 한자로 힌트)
  const chars = current ? current.reading.split('') : []

  function handleSubmit(e) {
    e.preventDefault()
    if (feedback !== null || !current) return

    if (normalize(input) === normalize(current.reading)) {
      setFeedback('correct')
      const partial  = scoreFor(wrongCount)
      const newScore = score + partial
      setScore(newScore)

      setTimeout(() => {
        const next = idx + 1
        if (next >= items.length) {
          setDone(true)
          const scoreRatio     = newScore / items.length
          const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
          setTimeout(() => onComplete({
            score: Math.round(newScore), scoreRatio, completionTime, passed: true,
          }), 1200)
        } else {
          setIdx(next)
          setInput('')
          setFeedback(null)
          setWrongCount(0)
        }
      }, 900)
    } else {
      setWrongCount(c => c + 1)
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        inputRef.current?.focus()
      }, 700)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">🀄 사자성어 초성 퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 배지 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-bold">
            <span>🔡</span><span>초성 힌트</span>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도 {idx} / {items.length}</span>
            <span>점수 {Math.round(score * 10) / 10}점</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-rose-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 완료 */}
        {done ? (
          <div className="card text-center py-10 space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="font-black text-xl text-carnival-navy">퀴즈 완료!</p>
            <p className="text-carnival-navy/50 text-sm">
              {items.length}개 사자성어 중 {Math.round(score * 10) / 10}점을 얻었어요
            </p>
          </div>
        ) : (
          <>
            {/* 문제 카드 */}
            <div className={`card text-center mb-5 py-8 transition-colors ${
              feedback === 'correct' ? 'bg-green-50 border-green-300' :
              feedback === 'wrong'   ? 'bg-red-50 border-red-300' : ''
            }`}>
              <p className="text-xs text-carnival-navy/40 mb-4 font-medium">
                {idx + 1}번 사자성어 — 초성을 보고 한글로 완성하세요
              </p>

              {/* 초성 칩 (글자 단위) */}
              <div className="flex flex-wrap justify-center gap-2 mb-4 px-2">
                {chars.map((ch, i) => (
                  <span key={i}
                    className="w-14 h-14 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-3xl font-black text-carnival-navy">
                    {toChosung(ch)}
                  </span>
                ))}
              </div>

              {/* 힌트: 뜻 공개 (감점 안내) */}
              {wrongCount >= 1 && (
                <p className="text-sm text-rose-600 font-bold mt-2">
                  💡 뜻: {current.meaning}
                  <span className="block text-xs text-rose-500/80 font-medium mt-0.5">
                    (힌트를 봐서 이 문제는 최대 {Math.round(scoreFor(wrongCount) * 100)}% 점수)
                  </span>
                </p>
              )}

              {/* 힌트: 한자 공개 */}
              {wrongCount >= 2 && (
                <p className="text-2xl text-carnival-navy/70 font-black mt-3 tracking-widest">
                  {current.hanja}
                </p>
              )}

              {/* 힌트: 정답 공개 */}
              {wrongCount >= 3 && feedback === null && (
                <p className="text-sm text-carnival-navy/50 mt-2">
                  정답: <span className="font-bold text-carnival-navy">{current.reading}</span>
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
                  placeholder="사자성어를 한글로 입력하세요"
                  autoComplete="off"
                  spellCheck="false"
                  className="input-field flex-1 text-lg text-center font-bold"
                />
                <button type="submit" className="btn-secondary px-6 text-xl">→</button>
              </form>
            )}

            {/* 예상 포인트 */}
            {feedback === null && idx > 0 && (
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
