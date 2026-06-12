/**
 * 📚 동형어·다의어 퀴즈
 *
 * [게임 방식]
 * - 한 낱말이 쓰인 두 문장을 보고 동형어(동음이의어)인지 다의어인지 선택 (10개 출제)
 * - 정답이면 1점, 오답이면 0점 (2지선다라 재도전 없음)
 * - 답을 고르면 해설을 보여주고 "다음 문제" 버튼으로 진행
 */
import { useState, useRef } from 'react'
import { WORD_MEANING_ITEMS } from '../../data/wordMeaningData'

const TOTAL = 10

function pickItems() {
  const shuffled = [...WORD_MEANING_ITEMS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(TOTAL, shuffled.length))
}

// 문장 속 출제 낱말 강조
function Highlight({ sentence, word }) {
  const i = sentence.indexOf(word)
  if (i < 0) return sentence
  return (
    <>
      {sentence.slice(0, i)}
      <span className="text-carnival-coral font-black">{word}</span>
      {sentence.slice(i + word.length)}
    </>
  )
}

export default function WordMeaningGame({ activity, onComplete, onExit }) {
  const [items] = useState(() => pickItems())

  const [idx, setIdx]       = useState(0)
  const [picked, setPicked] = useState(null)   // null | 'homonym' | 'polysemy'
  const [score, setScore]   = useState(0)
  const [done, setDone]     = useState(false)

  const startTimeRef = useRef(Date.now())

  const current   = items[idx]
  const progress  = (idx / items.length) * 100
  const isCorrect = picked !== null && picked === current?.type

  function handlePick(type) {
    if (picked !== null) return
    setPicked(type)
    if (type === current.type) setScore(s => s + 1)
  }

  function handleNext() {
    const next = idx + 1
    if (next >= items.length) {
      setDone(true)
      const finalScore     = score
      const scoreRatio     = finalScore / items.length
      const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
      setTimeout(() => onComplete({
        score: finalScore, scoreRatio, completionTime, passed: true,
      }), 1200)
    } else {
      setIdx(next)
      setPicked(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">📚 동형어·다의어 퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 배지 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-700 text-sm font-bold">
            <span>✏️</span><span>국어 낱말 공부</span>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도 {idx} / {items.length}</span>
            <span>점수 {score}점</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-indigo-400 transition-all duration-500"
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
              {items.length}문제 중 {score}문제를 맞혔어요
            </p>
          </div>
        ) : (
          <>
            {/* 문제 카드 */}
            <div className={`card text-center mb-5 py-8 transition-colors ${
              picked === null ? '' :
              isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              <p className="text-xs text-carnival-navy/40 mb-3 font-medium">
                {idx + 1}번 — 두 문장의 <strong>'{current?.word}'</strong>는 어떤 관계일까요?
              </p>

              {/* 예문 */}
              <div className="space-y-2 mb-4 px-4">
                {current?.examples.map((s, i) => (
                  <p key={i} className="text-xl font-bold text-carnival-navy bg-gray-50 rounded-xl py-3 px-4">
                    <Highlight sentence={s} word={current.word} />
                  </p>
                ))}
              </div>

              {/* 결과 + 해설 */}
              {picked !== null && (
                <div className="px-4">
                  <p className={`font-black text-xl mb-2 ${isCorrect ? 'text-carnival-green' : 'text-carnival-coral'}`}>
                    {isCorrect ? '🎯 정답!' : '❌ 아쉬워요!'}
                  </p>
                  <p className="text-sm font-bold text-carnival-navy mb-1">
                    정답: {current.type === 'homonym' ? '동형어 (동음이의어)' : '다의어'}
                  </p>
                  <p className="text-sm text-carnival-navy/60 leading-relaxed">
                    {current.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* 선택 버튼 / 다음 버튼 */}
            {picked === null ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePick('homonym')}
                  className="card py-5 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <p className="text-xl font-black text-carnival-navy mb-1">동형어</p>
                  <p className="text-xs text-carnival-navy/50">소리만 같은<br />서로 다른 낱말</p>
                </button>
                <button
                  onClick={() => handlePick('polysemy')}
                  className="card py-5 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <p className="text-xl font-black text-carnival-navy mb-1">다의어</p>
                  <p className="text-xs text-carnival-navy/50">여러 가지 뜻을 가진<br />한 낱말</p>
                </button>
              </div>
            ) : (
              <button onClick={handleNext} className="btn-primary w-full text-lg">
                {idx + 1 >= items.length ? '결과 보기' : '다음 문제 →'}
              </button>
            )}

            {/* 예상 포인트 */}
            {picked === null && idx > 0 && (
              <p className="text-center text-xs text-carnival-navy/30 mt-3">
                현재 {score}/{idx}점 → 예상 포인트 {Math.round((activity?.pointsPerCompletion || 10) * score / items.length)}P
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
