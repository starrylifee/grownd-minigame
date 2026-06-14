/**
 * 🔁 영어 동사 변화 (현재 - 과거 - 과거분사)
 *
 * [게임 방식]
 * - 현재형(원형)을 보고 과거형 · 과거분사형을 맞히는 퀴즈 (10문제)
 * - 난이도(교사 설정):
 *     · 'mc'     객관식 — 4개의 '과거 · 과거분사' 보기 중 정답 선택
 *     · 'typing' 타이핑 — 과거형 · 과거분사형을 직접 입력 (둘 다 맞아야 정답)
 * - 정답 1점, 점수 비율로 포인트 지급
 */
import { useState, useRef, useEffect } from 'react'
import { VERB_FORMS, verbAnswers } from '../../data/verbFormsData'

const TOTAL = 10

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

function pickQuestions() {
  return shuffle(VERB_FORMS).slice(0, Math.min(TOTAL, VERB_FORMS.length))
}

// 객관식 보기 4개 생성 (정답 1 + 오답 3)
function buildOptions(answer) {
  const distractors = shuffle(VERB_FORMS.filter(v => v.present !== answer.present)).slice(0, 3)
  return shuffle([answer, ...distractors])
}

export default function VerbFormsGame({ activity, onComplete, onExit }) {
  const mode = activity?.verbMode === 'typing' ? 'typing' : 'mc'
  const [questions] = useState(() => pickQuestions())

  const [idx, setIdx]       = useState(0)
  const [score, setScore]   = useState(0)
  const [done, setDone]     = useState(false)

  // 객관식
  const [options, setOptions] = useState(() => buildOptions(questions[0]))
  const [picked, setPicked]   = useState(null)   // 선택한 보기(객체) | null

  // 타이핑
  const [pastInput, setPastInput] = useState('')
  const [ppInput, setPpInput]     = useState('')
  const [feedback, setFeedback]   = useState(null)  // null | 'correct' | 'wrong'
  const pastRef = useRef(null)

  const startTimeRef = useRef(Date.now())
  const current  = questions[idx]
  const progress = (idx / questions.length) * 100

  useEffect(() => {
    if (mode === 'mc') setOptions(buildOptions(questions[idx]))
    else pastRef.current?.focus()
  }, [idx, mode, questions])

  function advance(gotPoint) {
    const newScore = score + (gotPoint ? 1 : 0)
    setScore(newScore)
    const next = idx + 1
    if (next >= questions.length) {
      setDone(true)
      const scoreRatio     = newScore / questions.length
      const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
      setTimeout(() => onComplete({
        score: newScore, scoreRatio, completionTime, passed: true,
      }), 1200)
    } else {
      setIdx(next)
      setPicked(null)
      setFeedback(null)
      setPastInput('')
      setPpInput('')
    }
  }

  // ── 객관식 ──
  function handlePick(opt) {
    if (picked !== null) return
    setPicked(opt)
  }
  function nextMC() {
    advance(picked?.present === current.present)
  }

  // ── 타이핑 ──
  function handleTypingSubmit(e) {
    e.preventDefault()
    if (feedback !== null) return
    const pastOk = verbAnswers(current.past).includes(pastInput.trim().toLowerCase())
    const ppOk   = verbAnswers(current.pastParticiple).includes(ppInput.trim().toLowerCase())
    const ok = pastOk && ppOk
    setFeedback(ok ? 'correct' : 'wrong')
    setTimeout(() => advance(ok), 1100)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">🔁 동사 변화</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 배지 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 text-sm font-bold">
            <span>{mode === 'typing' ? '⌨️' : '🔘'}</span>
            <span>{mode === 'typing' ? '타이핑 모드' : '객관식 모드'}</span>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도 {idx} / {questions.length}</span>
            <span>점수 {score}점</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-fuchsia-400 transition-all duration-500"
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
              {questions.length}문제 중 {score}문제를 맞혔어요
            </p>
          </div>
        ) : (
          <>
            {/* 문제 카드 — 현재형 제시 */}
            <div className="card text-center mb-5 py-8">
              <p className="text-xs text-carnival-navy/40 mb-2 font-medium">{idx + 1}번 — 현재형(원형)</p>
              <p className="text-4xl font-black text-carnival-navy mb-1">{current?.present}</p>
              <p className="text-xs text-carnival-navy/40 mt-2">
                {mode === 'typing'
                  ? '과거형과 과거분사형을 입력하세요'
                  : '알맞은 과거 · 과거분사형을 고르세요'}
              </p>
            </div>

            {/* ── 객관식 ── */}
            {mode === 'mc' && (
              <>
                <div className="grid grid-cols-1 gap-2.5">
                  {options.map(opt => {
                    const isAnswer = opt.present === current.present
                    const isPicked = picked?.present === opt.present
                    let cls = 'card py-3.5 px-4 text-left transition-colors'
                    if (picked === null) {
                      cls += ' hover:border-fuchsia-400 hover:bg-fuchsia-50'
                    } else if (isAnswer) {
                      cls += ' bg-green-50 border-green-400'
                    } else if (isPicked) {
                      cls += ' bg-red-50 border-red-400'
                    } else {
                      cls += ' opacity-50'
                    }
                    return (
                      <button key={opt.present} onClick={() => handlePick(opt)} className={cls}>
                        <span className="font-black text-lg text-carnival-navy">{opt.past}</span>
                        <span className="text-carnival-navy/30 mx-2">·</span>
                        <span className="font-black text-lg text-carnival-navy">{opt.pastParticiple}</span>
                      </button>
                    )
                  })}
                </div>

                {picked !== null && (
                  <button onClick={nextMC} className="btn-primary w-full text-lg mt-4">
                    {idx + 1 >= questions.length ? '결과 보기' : '다음 문제 →'}
                  </button>
                )}
              </>
            )}

            {/* ── 타이핑 ── */}
            {mode === 'typing' && (
              <>
                {feedback !== null && (
                  <div className={`text-center mb-4 ${feedback === 'correct' ? 'text-carnival-green' : 'text-carnival-coral'}`}>
                    <p className="font-black text-xl">{feedback === 'correct' ? '🎯 정답!' : '❌ 아쉬워요!'}</p>
                    {feedback === 'wrong' && (
                      <p className="text-sm text-carnival-navy/60 mt-1">
                        정답: <strong>{current.past}</strong> · <strong>{current.pastParticiple}</strong>
                      </p>
                    )}
                  </div>
                )}

                {feedback === null && (
                  <form onSubmit={handleTypingSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-carnival-navy/50 mb-1">과거형 (past)</label>
                      <input
                        ref={pastRef}
                        value={pastInput}
                        onChange={e => setPastInput(e.target.value)}
                        onPaste={e => e.preventDefault()}
                        type="text" autoComplete="off" autoCapitalize="off" spellCheck="false"
                        placeholder="과거형 입력"
                        className="input-field w-full text-lg text-center font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-carnival-navy/50 mb-1">과거분사형 (past participle)</label>
                      <input
                        value={ppInput}
                        onChange={e => setPpInput(e.target.value)}
                        onPaste={e => e.preventDefault()}
                        type="text" autoComplete="off" autoCapitalize="off" spellCheck="false"
                        placeholder="과거분사형 입력"
                        className="input-field w-full text-lg text-center font-bold font-mono"
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full text-lg">확인 →</button>
                  </form>
                )}
              </>
            )}

            {/* 예상 포인트 */}
            {idx > 0 && (picked === null && feedback === null) && (
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
