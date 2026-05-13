/**
 * 🌀 도형 돌리기 퍼즐 (4학년 평면도형의 돌리기)
 *
 * [미니게임 인터페이스 규약]
 * props: { activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 *
 * [게임 방식]
 * 1. 학생이 사진을 업로드
 * 2. 4×4(16조각)로 쪼개지고 각 조각이 90°·180°·270° 중 하나로 랜덤 회전
 * 3. 조각을 클릭하면 90°씩 시계 방향 회전
 * 4. 모든 조각이 바른 방향(0°)이 되면 퍼즐 완성 → 포인트 지급
 *
 * [점수 방식]
 * - 퍼즐 완성 시 scoreRatio: 1 (설정 포인트 전액 지급)
 */
import { useState, useRef, useEffect } from 'react'

const GRID = 4

export default function ShapeRotationGame({ activity, onComplete, onExit }) {
  const [phase, setPhase] = useState('upload') // 'upload' | 'playing' | 'done'
  const [imageUrl, setImageUrl] = useState(null)
  const [rotations, setRotations] = useState([])
  const [clickCount, setClickCount] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [clickedIdx, setClickedIdx] = useState(null)
  const [boardPx, setBoardPx] = useState(380)

  const startTimeRef = useRef(null)
  const clickCountRef = useRef(0)
  const fileInputRef = useRef(null)

  // 반응형 보드 크기
  useEffect(() => {
    const update = () => setBoardPx(Math.min(380, window.innerWidth - 48))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // 이미지 업로드 후 게임 시작
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)

    const initRots = Array.from({ length: GRID * GRID }, () =>
      [90, 180, 270][Math.floor(Math.random() * 3)]
    )
    setRotations(initRots)
    clickCountRef.current = 0
    setClickCount(0)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  // 조각 클릭: 90° 시계 방향 회전
  const rotatePiece = (i) => {
    if (phase !== 'playing') return

    clickCountRef.current += 1
    setClickCount(clickCountRef.current)

    // 클릭 피드백 (100ms 축소 효과)
    setClickedIdx(i)
    setTimeout(() => setClickedIdx(null), 120)

    setRotations(prev => {
      const next = [...prev]
      next[i] = (next[i] + 90) % 360
      return next
    })
  }

  // 완성 감지
  useEffect(() => {
    if (phase !== 'playing' || rotations.length === 0) return
    if (!rotations.every(r => r === 0)) return

    const t = Math.round((Date.now() - startTimeRef.current) / 1000)
    const cc = clickCountRef.current
    setElapsedSec(t)
    setPhase('done')

    setTimeout(() => {
      onComplete({
        scoreRatio: 1,
        score: GRID * GRID,
        completionTime: t,
        passed: true,
        clickCount: cc,
      })
    }, 2000)
  }, [rotations])

  const pieceSize = boardPx / GRID
  const correct = rotations.filter(r => r === 0).length
  const total = GRID * GRID

  // ── 업로드 화면 ──────────────────────────────────────────────────────────
  if (phase === 'upload') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6">
        <div className="text-center">
          <div className="text-6xl mb-3">🌀</div>
          <h1 className="text-3xl font-black text-carnival-navy mb-2">도형 돌리기 퍼즐</h1>
          <p className="text-carnival-navy/60 leading-relaxed text-base">
            사진을 올리면 <strong>16조각</strong>으로 나눠져요.<br />
            각 조각은 <strong>90° · 180° · 270°</strong> 중 하나로 돌려져 있어요.<br />
            클릭해서 모두 <strong>바른 방향</strong>으로 맞춰보세요!
          </p>
        </div>

        {/* 업로드 버튼 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-56 h-56 rounded-2xl border-4 border-dashed border-blue-300 bg-blue-50
                     flex flex-col items-center justify-center gap-3
                     cursor-pointer hover:bg-blue-100 active:scale-95 transition-all select-none"
        >
          <span className="text-5xl">📸</span>
          <span className="font-bold text-blue-500 text-lg">사진 선택하기</span>
          <span className="text-xs text-blue-400">클릭해서 올려주세요</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <button
          onClick={onExit}
          className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors"
        >
          나가기
        </button>
      </div>
    )
  }

  // ── 완성 화면 ──────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-5">
        <div className="text-7xl animate-bounce">🎉</div>
        <h2 className="text-3xl font-black text-carnival-navy">퍼즐 완성!</h2>
        <div className="flex gap-8 text-lg font-bold text-carnival-navy/60">
          <span>🖱️ 클릭 {clickCount}번</span>
          <span>⏱️ {elapsedSec}초</span>
        </div>
        <p className="text-sm text-carnival-navy/40 animate-pulse">포인트를 지급하는 중...</p>
      </div>
    )
  }

  // ── 게임 화면 ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 gap-4">

      {/* 헤더 */}
      <div className="w-full flex items-center justify-between" style={{ maxWidth: boardPx }}>
        <h1 className="text-xl font-black text-carnival-navy">🌀 도형 돌리기</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-carnival-navy/50">🖱️ {clickCount}번</span>
          <button
            onClick={onExit}
            className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors"
          >
            나가기
          </button>
        </div>
      </div>

      {/* 안내 */}
      <p className="text-sm text-carnival-navy/60">
        조각을 클릭하면 <strong>90°</strong>씩 돌아가요. 모두 맞춰보세요!
      </p>

      {/* 퍼즐 보드 */}
      <div
        style={{
          width: boardPx,
          height: boardPx,
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        {/* 조각 레이어 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            width: boardPx,
            height: boardPx,
          }}
        >
          {rotations.map((rot, i) => {
            const row = Math.floor(i / GRID)
            const col = i % GRID
            const isCorrect = rot === 0
            const isClicked = clickedIdx === i

            return (
              <div
                key={i}
                onClick={() => rotatePiece(i)}
                style={{
                  width: pieceSize,
                  height: pieceSize,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${boardPx}px ${boardPx}px`,
                  backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
                  transform: `rotate(${rot}deg) scale(${isClicked ? 0.9 : 1})`,
                  transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  outline: isCorrect ? '2px solid rgba(34, 197, 94, 0.7)' : 'none',
                  outlineOffset: '-2px',
                  zIndex: isClicked ? 10 : 1,
                }}
              />
            )
          })}
        </div>

        {/* 격자 구분선 오버레이 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            gridTemplateRows: `repeat(${GRID}, 1fr)`,
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
          ))}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="flex items-center gap-3" style={{ width: boardPx }}>
        <div className="flex-1 bg-gray-100 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-carnival-green transition-all duration-500"
            style={{ width: `${(correct / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-carnival-navy/50 whitespace-nowrap">
          {correct} / {total}
        </span>
      </div>

      {/* 힌트 */}
      <p className="text-xs text-carnival-navy/30">
        초록 테두리 = 바른 방향 ✅
      </p>
    </div>
  )
}
