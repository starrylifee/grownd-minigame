/**
 * 🐞 무당벌레 등 무늬 퀴즈
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 *
 * [점수 방식]
 * - 5개 레벨을 모두 클리어해야만 포인트 지급 (scoreRatio = 1)
 * - 중간 실패 시 처음부터 재시작 (포인트 없음)
 */
import { useState, useEffect, useRef } from 'react'

const LEVELS = [
  {
    id: 1,
    title: '1단계: 기초 연습',
    target: [
      { x: 0, y: 0 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 2,
    title: '2단계: 대칭의 미학',
    target: [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -2 },
    ],
  },
  {
    id: 3,
    title: '3단계: 별빛 무늬',
    target: [
      { x: 0, y: 0 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 2 },
      { x: 1, y: 2 },
    ],
  },
  {
    id: 4,
    title: '4단계: 복잡한 배치',
    target: [
      { x: 0, y: 0 },
      { x: -2, y: 1 },
      { x: -2, y: -1 },
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: 0, y: 2 },
      { x: 0, y: -2 },
    ],
  },
  {
    id: 5,
    title: '5단계: 마스터 무당벌레',
    target: [
      { x: 0, y: 0 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -2, y: 2 },
      { x: 2, y: 2 },
      { x: -2, y: -2 },
      { x: 2, y: -2 },
    ],
  },
]

function ButtonGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${
            value === opt.value
              ? 'bg-red-500 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function AnimatedDot({ dot, isTarget }) {
  const [pos, setPos] = useState(() => {
    if (isTarget || (dot.x === 0 && dot.y === 0)) return { x: dot.x, y: dot.y }
    return { x: 0, y: 0 }
  })

  useEffect(() => {
    if (isTarget) {
      setPos({ x: dot.x, y: dot.y })
      return
    }
    if (dot.x !== 0 || dot.y !== 0) {
      const isYMoving = dot.y !== 0
      const timerY = setTimeout(() => setPos(prev => ({ ...prev, y: dot.y })), 50)
      const timerX = setTimeout(
        () => setPos(prev => ({ ...prev, x: dot.x })),
        isYMoving ? 350 : 50,
      )
      return () => { clearTimeout(timerY); clearTimeout(timerX) }
    }
  }, [dot.x, dot.y, isTarget])

  const leftPos = (pos.x + 2) * 25
  const topPos  = (2 - pos.y) * 25
  const isCenter = dot.x === 0 && dot.y === 0

  return (
    <div
      className={`
        absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg
        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20
        ${isTarget ? 'bg-gray-800' : 'bg-gray-900'}
        ${isCenter ? 'w-5 h-5 md:w-6 md:h-6' : 'w-4 h-4 md:w-5 md:h-5'}
      `}
      style={{ left: `${leftPos}%`, top: `${topPos}%` }}
    />
  )
}

function Ladybug({ dots, isTarget = false }) {
  const lines = []
  for (let i = 0; i < 5; i++) {
    const position = `${i * 25}%`
    const isCenter = i === 2
    lines.push(
      <div
        key={`h-${i}`}
        className={`absolute w-full ${isCenter ? 'h-[3px] bg-gray-900/40' : 'h-[2px] bg-gray-900/15'}`}
        style={{ top: position, transform: 'translateY(-50%)' }}
      />,
      <div
        key={`v-${i}`}
        className={`absolute h-full ${isCenter ? 'w-[3px] bg-gray-900/40' : 'w-[2px] bg-gray-900/15'}`}
        style={{ left: position, transform: 'translateX(-50%)' }}
      />,
    )
  }

  return (
    <div className="relative w-48 h-48 md:w-56 md:h-56 select-none">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-10 bg-gray-900 rounded-t-full z-0">
        <div className="absolute -top-3 left-2 w-1.5 h-4 bg-gray-900 rotate-[30deg] origin-bottom rounded-full" />
        <div className="absolute -top-3 right-2 w-1.5 h-4 bg-gray-900 -rotate-[30deg] origin-bottom rounded-full" />
      </div>
      <div
        className={`
          absolute top-2 left-0 w-full h-[calc(100%-1rem)]
          ${isTarget ? 'bg-red-400' : 'bg-red-500'}
          rounded-t-[45%] rounded-b-[40%] border-[3px] border-gray-900 overflow-hidden shadow-inner z-10
        `}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] aspect-square">
          {lines}
          {dots.map(dot => (
            <AnimatedDot
              key={dot.id || `target-${dot.x}-${dot.y}`}
              dot={dot}
              isTarget={isTarget}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LadybugGame({ activity, onComplete, onExit }) {
  const [level, setLevel]           = useState(0)
  const [playerDots, setPlayerDots] = useState([{ id: 'center', x: 0, y: 0 }])
  const [gameState, setGameState]   = useState('PLAYING') // PLAYING | NEXT_LEVEL | GAMEOVER | CLEAR
  const [vDir, setVDir]             = useState('상')
  const [vDist, setVDist]           = useState(0)
  const [hDir, setHDir]             = useState('좌')
  const [hDist, setHDist]           = useState(0)
  const [message, setMessage]       = useState('')
  const startTimeRef                = useRef(Date.now())

  const currentLevel = LEVELS[level]

  function handleAddDot() {
    setMessage('')
    const x = hDist === 0 ? 0 : (hDir === '좌' ? -hDist : hDist)
    const y = vDist === 0 ? 0 : (vDir === '하' ? -vDist : vDist)

    if (playerDots.some(d => d.x === x && d.y === y)) {
      setMessage('이미 해당 위치에 점이 있습니다.')
      return
    }
    setPlayerDots([...playerDots, { id: Date.now().toString(), x, y }])
  }

  function handleResetDots() {
    setPlayerDots([{ id: 'center', x: 0, y: 0 }])
    setMessage('초기화 되었습니다.')
  }

  function handleCheckAnswer() {
    setMessage('')
    const target = currentLevel.target

    if (target.length !== playerDots.length) { setGameState('GAMEOVER'); return }

    const isMatch = target.every(t => playerDots.some(p => p.x === t.x && p.y === t.y))
    if (isMatch) {
      setGameState(level === LEVELS.length - 1 ? 'CLEAR' : 'NEXT_LEVEL')
    } else {
      setGameState('GAMEOVER')
    }
  }

  function startNextLevel() {
    setLevel(l => l + 1)
    setPlayerDots([{ id: 'center', x: 0, y: 0 }])
    setGameState('PLAYING')
    setMessage('')
    setVDist(0)
    setHDist(0)
  }

  function restartGame() {
    setLevel(0)
    setPlayerDots([{ id: 'center', x: 0, y: 0 }])
    setGameState('PLAYING')
    setMessage('')
    setVDist(0)
    setHDist(0)
    startTimeRef.current = Date.now()
  }

  function handleClear() {
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
    onComplete({ score: LEVELS.length, scoreRatio: 1, completionTime, passed: true })
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-8 px-4">
      <div className="max-w-4xl w-full">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              🐞 무당벌레 등 무늬 퀴즈
            </h1>
            <p className="text-gray-500 text-sm mt-1">중앙 점을 기준으로 좌표를 입력해 목표 무늬를 완성하세요!</p>
          </div>
          <button
            onClick={onExit}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors mt-1 shrink-0"
          >
            나가기
          </button>
        </div>

        {/* 레벨 표시 */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white px-6 py-2 rounded-full shadow-sm font-bold text-red-500 border border-red-100">
            {currentLevel.title} ({level + 1} / {LEVELS.length})
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            ⚠️ 5단계를 모두 클리어해야 포인트를 받을 수 있어요!
          </p>
        </div>

        {/* 무당벌레 영역 */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-8">
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full md:w-auto">
            <h3 className="text-lg font-bold text-gray-500 mb-6">목표 무늬</h3>
            <Ladybug dots={currentLevel.target} isTarget />
          </div>

          <div className="hidden md:block text-gray-300 font-black text-4xl">➡️</div>

          <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-lg border-2 border-red-100 w-full md:w-auto relative">
            <h3 className="text-lg font-black text-red-500 mb-6">내 무당벌레</h3>
            <Ladybug dots={playerDots} />
            <div className="absolute top-4 right-4 bg-gray-100 px-3 py-1 rounded-full text-sm font-bold text-gray-500">
              점: {playerDots.length}개
            </div>
          </div>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-xl mx-auto border border-gray-100">
          <div className="space-y-5">
            {/* 상하 입력 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="font-bold text-gray-700 w-24">↕️ 상하(수직)</span>
              <div className="flex gap-2 sm:gap-4 overflow-x-auto">
                <ButtonGroup
                  options={[{ label: '상', value: '상' }, { label: '하', value: '하' }]}
                  value={vDir}
                  onChange={setVDir}
                />
                <ButtonGroup
                  options={[{ label: '0칸', value: 0 }, { label: '1칸', value: 1 }, { label: '2칸', value: 2 }]}
                  value={vDist}
                  onChange={setVDist}
                />
              </div>
            </div>

            {/* 좌우 입력 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="font-bold text-gray-700 w-24">↔️ 좌우(수평)</span>
              <div className="flex gap-2 sm:gap-4 overflow-x-auto">
                <ButtonGroup
                  options={[{ label: '좌', value: '좌' }, { label: '우', value: '우' }]}
                  value={hDir}
                  onChange={setHDir}
                />
                <ButtonGroup
                  options={[{ label: '0칸', value: 0 }, { label: '1칸', value: 1 }, { label: '2칸', value: 2 }]}
                  value={hDist}
                  onChange={setHDist}
                />
              </div>
            </div>

            {/* 메시지 */}
            {message && (
              <div className="text-center text-sm font-bold text-red-500 bg-red-50 py-2 rounded-lg">
                ⚠️ {message}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-colors shadow-md text-lg"
                onClick={handleAddDot}
              >
                현재 좌표에 점 찍기
              </button>
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
                  onClick={handleResetDots}
                >
                  무늬 초기화
                </button>
                <button
                  className="flex-[2] bg-red-500 text-white font-black py-3 rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/30"
                  onClick={handleCheckAnswer}
                >
                  정답 확인하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 꽝 모달 */}
      {gameState === 'GAMEOVER' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-4xl font-black text-red-600 mb-2">꽝!</h2>
            <p className="text-gray-600 font-medium mb-2">무늬가 일치하지 않습니다.</p>
            <p className="text-gray-400 text-sm mb-8">5단계를 모두 클리어해야 포인트를 받을 수 있어요.<br/>처음부터 다시 도전하세요!</p>
            <button
              onClick={restartGame}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg text-lg"
            >
              처음부터 다시 도전
            </button>
          </div>
        </div>
      )}

      {/* 다음 레벨 모달 */}
      {gameState === 'NEXT_LEVEL' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-black text-green-600 mb-2">정답입니다!</h2>
            <p className="text-gray-600 mb-2 font-medium">아주 정확하게 무늬를 맞췄어요.</p>
            <p className="text-gray-400 text-sm mb-8">
              {LEVELS.length - level - 1}단계 남았어요. 계속 도전하세요!
            </p>
            <button
              onClick={startNextLevel}
              className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition shadow-lg text-lg shadow-green-500/30"
            >
              다음 단계로
            </button>
          </div>
        </div>
      )}

      {/* 최종 클리어 모달 */}
      {gameState === 'CLEAR' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-3xl text-center max-w-md w-full shadow-2xl">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-blue-600 mb-4">게임 클리어!</h2>
            <p className="text-gray-700 mb-8 font-medium text-lg leading-relaxed">
              축하합니다!<br />5단계를 모두 클리어했어요.<br />포인트를 지급할게요!
            </p>
            <button
              onClick={handleClear}
              className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition shadow-lg text-lg shadow-blue-500/30"
            >
              포인트 받기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
