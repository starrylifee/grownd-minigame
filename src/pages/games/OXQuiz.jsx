/**
 * ⭕ OX퀴즈
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 * - 이 컴포넌트에서 직접 포인트 지급 코드를 작성하지 마세요.
 * - 문제 목록은 activity.questions 에서 가져옵니다 (교사가 Firestore에서 설정).
 */
import { useState } from 'react'

const DEFAULT_QUESTIONS = [
  { question: '지구는 태양 주위를 돕니다', answer: true },
  { question: '물은 100°C에서 얼어붙습니다',  answer: false },
  { question: '대한민국의 수도는 서울입니다',  answer: true },
  { question: '1 + 1 = 3 입니다',              answer: false },
  { question: '식물은 광합성을 통해 양분을 만듭니다', answer: true },
  { question: '달은 스스로 빛을 냅니다',       answer: false },
  { question: '한글은 세종대왕이 만들었습니다', answer: true },
  { question: '사람의 심장은 2개입니다',        answer: false },
  { question: '지구에서 가장 큰 대양은 태평양입니다', answer: true },
  { question: '소금은 단맛이 납니다',           answer: false },
]

export default function OXQuiz({ activity, onComplete, onExit }) {
  const questions = (activity?.questions?.length ? activity.questions : DEFAULT_QUESTIONS).slice(0, 10)

  const [idx, setIdx]         = useState(0)
  const [result, setResult]   = useState(null) // null | 'correct' | 'wrong'
  const [score, setScore]     = useState(0)

  const q = questions[idx]
  const progress = (idx / questions.length) * 100

  function handleAnswer(pick) {
    const ok = pick === q.answer
    setResult(ok ? 'correct' : 'wrong')
    if (ok) setScore(s => s + 1)

    setTimeout(() => {
      const next = idx + 1
      if (next >= questions.length) {
        onComplete({ score: ok ? score + 1 : score, passed: true })
      } else {
        setIdx(next)
        setResult(null)
      }
    }, 900)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-carnival-navy">⭕ OX퀴즈</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도</span>
            <span>{idx} / {questions.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-carnival-coral transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="card text-center mb-8 py-10">
          <p className="text-xs text-carnival-navy/40 mb-4 font-medium">
            {idx + 1}번 문제
          </p>
          <p className="text-2xl font-bold text-carnival-navy leading-relaxed px-2">
            {q.question}
          </p>
        </div>

        {/* 피드백 */}
        {result === 'correct' && (
          <p className="text-center text-carnival-green font-black text-3xl mb-4 animate-bounce">
            ⭕ 정답!
          </p>
        )}
        {result === 'wrong' && (
          <p className="text-center text-carnival-coral font-black text-3xl mb-4">
            ❌ 오답!
          </p>
        )}

        {/* O X 버튼 */}
        {result === null && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="py-8 rounded-3xl bg-carnival-sky text-white text-6xl font-black
                         shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-150"
            >
              ⭕
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="py-8 rounded-3xl bg-carnival-coral text-white text-6xl font-black
                         shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-150"
            >
              ❌
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
