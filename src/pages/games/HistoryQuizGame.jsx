/**
 * 🏛️ 역사 퀴즈
 *
 * [게임 방식]
 * - 한국사능력검정시험(기본) 문항을 초등 눈높이로 각색한 4지선다 객관식 (10문제)
 * - 교사가 설정에서 시대(선사고조선·삼국가야·남북국·고려·조선·근현대)를 멀티셀렉트하면
 *   선택한 시대의 문제만 모아 셔플해 출제 (activity.historyEras 배열)
 * - 보기 4개는 매판 셔플 → 정답 위치가 고정되지 않음
 * - 정답 1점, 점수 비율로 포인트 지급. 풀고 나면 한 줄 해설 표시
 */
import { useState, useRef, useEffect } from 'react'
import { HISTORY_QUESTIONS, HISTORY_ERAS } from '../../data/historyData'

const TOTAL = 10
const ALL_ERA_KEYS = HISTORY_ERAS.map(e => e.key)
const ERA_LABEL = Object.fromEntries(HISTORY_ERAS.map(e => [e.key, e.label]))

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

function pickQuestions(eras) {
  const keys = Array.isArray(eras) && eras.length > 0 ? eras : ALL_ERA_KEYS
  let pool = HISTORY_QUESTIONS.filter(q => keys.includes(q.era))
  if (pool.length === 0) pool = HISTORY_QUESTIONS  // 방어: 빈 풀이면 전체
  return shuffle(pool).slice(0, Math.min(TOTAL, pool.length)).map(q => ({
    era:     q.era,
    q:       q.q,
    note:    q.note,
    source:  q.source,                     // 출처 (예: '67회 12번')
    correct: q.choices[q.answer],          // 정답 '값'을 기억 (보기 셔플과 무관)
    options: shuffle(q.choices),           // 매판 보기 순서 셔플
  }))
}

export default function HistoryQuizGame({ activity, onComplete, onExit }) {
  const [questions] = useState(() => pickQuestions(activity?.historyEras))

  const [idx, setIdx]     = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState(null)   // 선택한 보기(문자열) | null
  const [done, setDone]   = useState(false)

  const startTimeRef = useRef(Date.now())
  const current  = questions[idx]
  const progress = (idx / questions.length) * 100

  // 풀(시대) 선택 결과 문제가 하나도 없을 일은 pickQuestions에서 방어하지만, 만약 0개면 즉시 종료
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
          <h1 className="text-2xl font-black text-carnival-navy">🏛️ 역사 퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 배지 — 현재 문제의 시대 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-700 text-sm font-bold">
            <span>📜</span><span>{ERA_LABEL[current.era] || '역사'}</span>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도 {idx} / {questions.length}</span>
            <span>점수 {score}점</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-amber-400 transition-all duration-500"
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-carnival-navy/40 font-medium">{idx + 1}번 문제</p>
                {current.source && (
                  <p className="text-[11px] text-carnival-navy/30">출처 · 한국사능력검정 {current.source}</p>
                )}
              </div>
              <p className="text-lg font-bold text-carnival-navy leading-relaxed">{current.q}</p>
            </div>

            {/* 보기 4개 */}
            <div className="grid grid-cols-1 gap-2.5">
              {current.options.map(opt => {
                const isAnswer = opt === current.correct
                const isPicked = picked === opt
                let cls = 'card py-3.5 px-4 text-left transition-colors'
                if (picked === null) {
                  cls += ' hover:border-amber-400 hover:bg-amber-50'
                } else if (isAnswer) {
                  cls += ' bg-green-50 border-green-400'
                } else if (isPicked) {
                  cls += ' bg-red-50 border-red-400'
                } else {
                  cls += ' opacity-50'
                }
                return (
                  <button key={opt} onClick={() => handlePick(opt)} className={cls}>
                    <span className="font-bold text-base text-carnival-navy">{opt}</span>
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
                {current.note && (
                  <p className="mt-2 text-sm text-carnival-navy/60 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed">
                    💡 {current.note}
                  </p>
                )}
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
