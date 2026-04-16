/**
 * ⌨️ 한글 타자 미니게임 (레벨 시스템)
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 * - 이 컴포넌트에서 직접 포인트 지급 코드를 작성하지 마세요.
 *
 * [레벨 구성 - 키보드 위치 기반]
 * Level 1 (초급): ㅁㄴㅇㄹ + ㅓㅏㅣ  → 홈 포지션 중심
 * Level 2 (중급): + ㅂㅈㄷㄱ + ㅕㅑㅐㅔ → 윗 행 추가
 * Level 3 (고급): + ㅋㅌㅊ + ㅜㅡ     → 아랫 행 추가
 * Level 4 (최고급): + ㅅㅎ + ㅗㅛㅠ   → 전체 자판
 */
import { useState, useEffect, useRef } from 'react'

const LEVEL_INFO = {
  1: { label: '초급', emoji: '🌱', desc: '홈 포지션 (ㅁㄴㅇㄹ / ㅓㅏㅣ)', color: 'bg-green-100 text-green-700 border-green-300' },
  2: { label: '중급', emoji: '🌿', desc: '윗 행 추가 (ㅂㅈㄷㄱ / ㅕㅑㅐㅔ)', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  3: { label: '고급', emoji: '🌳', desc: '아랫 행 추가 (ㅋㅌㅊ / ㅜㅡ)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  4: { label: '최고급', emoji: '🏆', desc: '전체 자판 (ㅅㅎ / ㅗㅛㅠ)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
}

const SENTENCES_BY_LEVEL = {
  1: [
    '나는 아이를 매우 아낀다',
    '아이들이 나란히 앉아서 놀아요',
    '이마에 나뭇잎이 내려앉았어요',
    '나는 나무 아래서 이야기해요',
    '이렇게나 맑은 날이 없었어요',
  ],
  2: [
    '지금 바로 가서 책을 가져와요',
    '기분 좋은 날에는 노래가 절로 나요',
    '작은 것에도 감사하는 마음을 갖자',
    '오늘 배운 것을 내일도 기억해요',
    '가나다라 자음과 모음을 익혀요',
  ],
  3: [
    '친구들과 함께 운동장에서 뛰어요',
    '추운 겨울에는 따뜻한 코코아를 마셔요',
    '우리 학교 친구들과 크게 웃었어요',
    '꾸준히 노력하면 꿈을 이룰 수 있어요',
    '투명한 유리창 너머로 하늘을 바라봐요',
  ],
  4: [
    '오늘도 열심히 공부하는 내가 자랑스럽다',
    '꾸준한 노력은 반드시 좋은 결과를 만든다',
    '친구를 배려하고 함께 성장하는 우리 반',
    '포기하지 않으면 반드시 이룰 수 있다',
    '소중한 사람들과 행복한 하루를 보내요',
  ],
}

export default function TypingGame({ activity, onComplete, onExit }) {
  const level     = activity?.typingLevel || 1
  const sentences = SENTENCES_BY_LEVEL[level] || SENTENCES_BY_LEVEL[1]
  const info      = LEVEL_INFO[level] || LEVEL_INFO[1]

  const [idx, setIdx]         = useState(0)
  const [input, setInput]     = useState('')
  const [done, setDone]       = useState(0)
  const [correct, setCorrect] = useState(null) // null | true | false
  const [startTime]           = useState(Date.now())
  const inputRef              = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [idx])

  const current  = sentences[idx]
  const progress = (done / sentences.length) * 100

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
        if (next >= sentences.length) {
          const completionTime = Math.round((Date.now() - startTime) / 1000)
          onComplete({ score: newDone, scoreRatio: newDone / sentences.length, completionTime, passed: true, level })
        } else {
          setIdx(next)
          setInput('')
          setCorrect(null)
        }
      }, 600)
    } else {
      setCorrect(false)
      setTimeout(() => {
        setInput('')
        setCorrect(null)
        inputRef.current?.focus()
      }, 700)
    }
  }

  const borderColor = correct === true
    ? 'border-carnival-green shadow-carnival-green/20'
    : correct === false
    ? 'border-carnival-coral shadow-carnival-coral/20'
    : 'border-gray-200'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-carnival-navy">⌨️ 타자게임</h1>
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
            <span>{done} / {sentences.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-carnival-sky transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 제시 문장 */}
        <div className="card mb-4 text-center">
          <p className="text-xs text-carnival-navy/40 mb-2 font-medium">아래 문장을 입력하세요</p>
          <p className="text-xl font-bold text-carnival-navy leading-relaxed">
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
            placeholder="여기에 입력하세요..."
            className={`input-field text-lg mb-3 border-2 transition-all ${borderColor}`}
            disabled={correct === true}
          />
          {correct === true && (
            <p className="text-center text-carnival-green font-bold animate-bounce">✅ 정확해요!</p>
          )}
          {correct === false && (
            <p className="text-center text-carnival-coral font-bold">❌ 다시 시도해봐요!</p>
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
