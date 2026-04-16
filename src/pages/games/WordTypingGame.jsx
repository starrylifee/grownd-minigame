/**
 * 🔤 낱말 타자게임 (레벨 시스템)
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 *
 * [레벨 구성 - 키보드 위치 기반]
 * Level 1 (초급): ㅁㄴㅇㄹ + ㅓㅏㅣ  → 홈 포지션 중심 낱말
 * Level 2 (중급): + ㅂㅈㄷㄱ + ㅕㅑㅐㅔ
 * Level 3 (고급): + ㅋㅌㅊ + ㅜㅡ
 * Level 4 (최고급): + ㅅㅎ + ㅗㅛㅠ → 전체 자판
 */
import { useState, useEffect, useRef } from 'react'

const LEVEL_INFO = {
  1: { label: '초급', emoji: '🌱', desc: '홈 포지션 (ㅁㄴㅇㄹ / ㅓㅏㅣ)', color: 'bg-green-100 text-green-700 border-green-300' },
  2: { label: '중급', emoji: '🌿', desc: '윗 행 추가 (ㅂㅈㄷㄱ / ㅕㅑㅐㅔ)', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  3: { label: '고급', emoji: '🌳', desc: '아랫 행 추가 (ㅋㅌㅊ / ㅜㅡ)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  4: { label: '최고급', emoji: '🏆', desc: '전체 자판 (ㅅㅎ / ㅗㅛㅠ)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
}

const WORDS_BY_LEVEL = {
  1: ['나라', '이름', '머리', '아이', '나무', '이마', '라면', '마음', '어머니', '이리', '나란히', '어린이', '말리', '아리아', '이마'],
  2: ['가방', '기차', '나비', '바다', '지구', '개나리', '노래', '지금', '배움', '가나다', '나비야', '기억', '도서관', '기분', '바지'],
  3: ['우리', '친구', '추억', '크레용', '트럭', '우주', '투명', '초록', '쿠키', '하늘', '구름', '학교', '우정', '추운', '크다'],
  4: ['소망', '행복', '포기', '도전', '성장', '노력', '훌륭', '자랑', '함께', '꿈나무', '하늘색', '소중해', '용기있어', '희망차', '빛나는'],
}

const SESSION_COUNT = 10  // 한 세션당 낱말 수

function pickWords(level) {
  const pool    = [...(WORDS_BY_LEVEL[level] || WORDS_BY_LEVEL[1])]
  const result  = []
  while (result.length < SESSION_COUNT) {
    // 풀이 부족하면 섞어서 재사용
    if (pool.length === 0) pool.push(...(WORDS_BY_LEVEL[level] || WORDS_BY_LEVEL[1]))
    const i = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(i, 1)[0])
  }
  return result
}

export default function WordTypingGame({ activity, onComplete, onExit }) {
  const level   = activity?.typingLevel || 1
  const words   = useState(() => pickWords(level))[0]
  const info    = LEVEL_INFO[level] || LEVEL_INFO[1]

  const [idx, setIdx]         = useState(0)
  const [input, setInput]     = useState('')
  const [done, setDone]       = useState(0)
  const [correct, setCorrect] = useState(null)  // null | true | false
  const inputRef              = useRef(null)
  const startTimeRef          = useRef(Date.now())

  useEffect(() => { inputRef.current?.focus() }, [idx])

  const current  = words[idx]
  const progress = (done / SESSION_COUNT) * 100

  function handleChange(e) {
    setInput(e.target.value)
    setCorrect(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed === current) {
      setCorrect(true)
      const next    = idx + 1
      const newDone = done + 1
      setDone(newDone)
      setTimeout(() => {
        if (next >= SESSION_COUNT) {
          const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
          onComplete({ score: newDone, scoreRatio: newDone / SESSION_COUNT, completionTime, passed: true, level })
        } else {
          setIdx(next)
          setInput('')
          setCorrect(null)
        }
      }, 500)
    } else {
      setCorrect(false)
      setTimeout(() => {
        setInput('')
        setCorrect(null)
        inputRef.current?.focus()
      }, 600)
    }
  }

  const borderColor = correct === true
    ? 'border-carnival-green shadow-carnival-green/20'
    : correct === false
    ? 'border-carnival-coral shadow-carnival-coral/20'
    : 'border-gray-200'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">🔤 낱말 타자</h1>
          <button onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
            나가기
          </button>
        </div>

        {/* 레벨 배지 */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold mb-4 ${info.color}`}>
          <span>{info.emoji}</span>
          <span>{info.label}</span>
          <span className="font-normal opacity-70">— {info.desc}</span>
        </div>

        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-carnival-navy/50 mb-1">
            <span>진행도</span>
            <span>{done} / {SESSION_COUNT}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-carnival-green transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 낱말 카드 */}
        <div className="card mb-6 text-center py-10">
          <p className="text-xs text-carnival-navy/40 mb-3 font-medium">이 낱말을 입력하세요</p>
          <p className="text-5xl font-black text-carnival-navy tracking-widest">
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
            onPaste={e => e.preventDefault()}
            placeholder="여기에 입력..."
            className={`input-field text-xl text-center mb-3 border-2 transition-all ${borderColor}`}
            disabled={correct === true}
          />
          {correct === true && (
            <p className="text-center text-carnival-green font-bold animate-bounce">✅ 정확해요!</p>
          )}
          {correct === false && (
            <p className="text-center text-carnival-coral font-bold">❌ 다시!</p>
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
