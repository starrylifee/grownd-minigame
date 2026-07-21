/**
 * 📖 문해력 빈칸 퀴즈
 *
 * [게임 방식]
 * - 문장 속 빈칸에 알맞은 낱말을 4지선다로 고르는 문맥 추론 퀴즈 (10문제)
 * - 어휘는 국립국어원 「한국어 학습용 어휘 목록」 등급 기반 (clozeData.js 참고)
 * - 교사가 설정에서 수준(3~4학년 / 5~6학년 / 전체 혼합)을 고르면
 *   해당 수준의 문항만 모아 셔플해 출제 (activity.clozeLevel)
 * - 보기 4개는 매판 셔플 → 정답 위치가 고정되지 않음
 * - 정답을 고르면 빈칸이 채워지고 낱말 뜻풀이 카드가 표시됨
 * - 정답 1점, 점수 비율로 포인트 지급
 */
import { useState, useRef, useEffect } from 'react'
import { CLOZE_ITEMS, CLOZE_LEVELS } from '../../data/clozeData'

const TOTAL = 10
const LEVEL_LABEL = Object.fromEntries(CLOZE_LEVELS.map(l => [l.key, l.label]))

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

function pickQuestions(level) {
  let pool = level === 'all' || !LEVEL_LABEL[level]
    ? CLOZE_ITEMS
    : CLOZE_ITEMS.filter(q => q.level === level)
  if (pool.length === 0) pool = CLOZE_ITEMS  // 방어: 빈 풀이면 전체
  return shuffle(pool).slice(0, Math.min(TOTAL, pool.length)).map(q => ({
    level:    q.level,
    word:     q.word,
    sentence: q.sentence,
    meaning:  q.meaning,
    correct:  q.choices[0],            // choices[0]이 정답 (데이터 규칙)
    options:  shuffle(q.choices),      // 매판 보기 순서 셔플
  }))
}

/** 문장의 '____'를 빈칸 박스(정답 후엔 정답 낱말)로 렌더링 */
function ClozeSentence({ sentence, answered, correct }) {
  const [before, after] = sentence.split('____')
  return (
    <p className="text-xl font-bold text-carnival-navy leading-relaxed">
      {before}
      {answered ? (
        <span className="inline-block px-2 mx-0.5 rounded-lg bg-green-100 border-2 border-green-400 text-green-700">
          {correct}
        </span>
      ) : (
        <span className="inline-block w-20 mx-0.5 border-b-4 border-violet-400 align-middle"
          style={{ height: '1.4em' }} />
      )}
      {after}
    </p>
  )
}

export default function ClozeGame({ activity, onComplete, onExit }) {
  const [questions] = useState(() => pickQuestions(activity?.clozeLevel || 'mid'))

  const [idx, setIdx]       = useState(0)
  const [score, setScore]   = useState(0)
  const [picked, setPicked] = useState(null)   // 선택한 보기(문자열) | null
  const [done, setDone]     = useState(false)

  const startTimeRef = useRef(Date.now())
  const current  = questions[idx]
  const progress = (idx / questions.length) * 100

  useEffect(() => {
    if (questions.length === 0) {
      onComplete({ score: 0, scoreRatio: 0, completionTime: 0, passed: true })
    }
  }, [questions, onComplete])

  function handlePick(opt) {
    if (picked !== null) return
    setPicked(opt)
  }

  function next() {
    const gotPoint = picked === current.correct
    const newScore = score + (gotPoint ? 1 : 0)
    setScore(newScore)
    const n = idx + 1
    if (n >= questions.length) {
      setDone(true)
      const scoreRatio     = newScore / questions.length
      const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
      setTimeout(() => onComplete({ score: newScore, scoreRatio, completionTime, passed: true }), 1200)
    } else {
      setIdx(n)
      setPicked(null)
    }
  }

  if (!current) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">📖 문해력 빈칸 퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 배지 — 현재 문제의 수준 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-300 bg-violet-50 text-violet-700 text-sm font-bold">
            <span>✏️</span><span>{LEVEL_LABEL[current.level] || '낱말'} 수준</span>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도 {idx} / {questions.length}</span>
            <span>점수 {score}점</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-violet-400 transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 완료 */}
        {done ? (
          <div className="card text-center py-10 space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="font-black text-xl text-carnival-navy">퀴즈 완료!</p>
            <p className="text-carnival-navy/50 text-sm">
              {questions.length}문제 중 {score}문제를 맞혔어요
            </p>
          </div>
        ) : (
          <>
            {/* 문제 카드 */}
            <div className="card mb-5 py-6 px-5">
              <p className="text-xs text-carnival-navy/40 font-medium mb-3">
                {idx + 1}번 · 빈칸에 알맞은 낱말을 골라 보세요
              </p>
              <ClozeSentence sentence={current.sentence}
                answered={picked !== null} correct={current.correct} />
            </div>

            {/* 보기 4개 */}
            <div className="grid grid-cols-2 gap-2.5">
              {current.options.map(opt => {
                const isAnswer = opt === current.correct
                const isPicked = picked === opt
                let cls = 'card py-3.5 px-4 text-center transition-colors'
                if (picked === null) {
                  cls += ' hover:border-violet-400 hover:bg-violet-50'
                } else if (isAnswer) {
                  cls += ' bg-green-50 border-green-400'
                } else if (isPicked) {
                  cls += ' bg-red-50 border-red-400'
                } else {
                  cls += ' opacity-50'
                }
                return (
                  <button key={opt} onClick={() => handlePick(opt)} className={cls}>
                    <span className="font-bold text-lg text-carnival-navy">{opt}</span>
                  </button>
                )
              })}
            </div>

            {/* 해설 + 다음 */}
            {picked !== null && (
              <>
                <div className={`mt-4 text-center font-black text-xl ${
                  picked === current.correct ? 'text-carnival-green' : 'text-carnival-coral'}`}>
                  {picked === current.correct ? '🎯 정답!' : '❌ 아쉬워요!'}
                </div>
                <p className="mt-2 text-sm text-carnival-navy/60 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 leading-relaxed">
                  📖 <b>{current.word}</b> — {current.meaning}
                </p>
                <button onClick={next} className="btn-primary w-full text-lg mt-4">
                  {idx + 1 >= questions.length ? '결과 보기' : '다음 문제 →'}
                </button>
              </>
            )}

            {/* 예상 포인트 */}
            {idx > 0 && picked === null && (
              <p className="text-center text-xs text-carnival-navy/30 mt-3">
                현재 {score}/{idx}점 → 예상 포인트 {Math.round((activity?.pointsPerCompletion || 10) * score / questions.length)}P
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
