/**
 * 🚀 우주 정거장 도킹 대작전
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 *
 * [점수 방식]
 * - 10단계 클리어: scoreRatio = 1/3
 * - 15단계 클리어: scoreRatio = 2/3
 * - 20단계 클리어: scoreRatio = 1.0
 * - 10단계 전 실패: scoreRatio = 0 (포인트 없음)
 */
import { useState, useEffect, useRef } from 'react'

const MAX_LEVELS = 20

// Ship inner SVG HTML strings (10 distinct shapes)
const SHIP_HTML = [
  `<path d="M 20,20 L 60,20 L 80,40 L 80,90 L 40,90 L 40,60 L 20,60 Z" />
   <line x1="40" y1="20" x2="40" y2="60" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="30,35 25,45 35,45" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="56" y="71" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 20,20 L 70,20 L 70,50 L 90,50 L 90,80 L 40,80 L 40,50 L 20,50 Z" />
   <line x1="40" y1="50" x2="70" y2="50" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="45,30 40,40 50,40" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="61" y="61" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 20,20 L 80,20 L 80,50 L 50,50 L 50,70 L 90,70 L 90,90 L 20,90 Z" />
   <line x1="50" y1="20" x2="50" y2="50" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="50,30 45,40 55,40" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="31" y="76" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 20,20 L 60,20 L 90,50 L 90,90 L 50,90 L 20,60 Z" />
   <line x1="20" y1="60" x2="90" y2="60" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="40,35 35,45 45,45" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="66" y="66" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 40,10 L 70,10 L 70,40 L 90,40 L 90,60 L 60,60 L 60,50 L 40,50 Z" />
   <line x1="60" y1="10" x2="60" y2="50" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="55,25 50,35 60,35" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="71" y="56" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 20,10 L 80,10 L 80,30 L 40,30 L 40,50 L 70,50 L 70,70 L 40,70 L 40,90 L 20,90 Z" />
   <line x1="40" y1="30" x2="80" y2="30" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="50,15 45,25 55,25" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="26" y="76" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 30,10 L 80,10 L 60,50 L 90,50 L 40,90 L 50,60 L 20,60 Z" />
   <line x1="50" y1="60" x2="90" y2="50" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="55,25 50,35 60,35" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="41" y="71" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 20,30 L 50,30 L 50,10 L 90,10 L 90,50 L 50,50 L 50,90 L 20,90 Z" />
   <line x1="50" y1="50" x2="90" y2="50" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="35,55 30,65 40,65" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="66" y="26" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 40,10 L 60,10 L 60,40 L 90,40 L 90,60 L 60,60 L 60,90 L 20,90 L 20,60 L 40,60 Z" />
   <line x1="20" y1="60" x2="60" y2="60" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="50,20 45,30 55,30" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="26" y="71" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,

  `<path d="M 20,20 L 50,20 L 70,40 L 90,40 L 90,60 L 70,80 L 20,80 L 20,50 L 40,50 L 40,30 L 20,30 Z" />
   <line x1="20" y1="50" x2="70" y2="50" style="stroke:rgba(186,230,253,0.6);fill:none" />
   <polygon points="30,60 25,70 35,70" style="fill:rgb(250,204,21);stroke:none" />
   <rect x="71" y="46" width="8" height="8" style="fill:rgb(244,114,182);stroke:none" />`,
]

const TARGET_HTML = SHIP_HTML.map(html =>
  html
    .replace(/style="fill:rgb\(\d+,\d+,\d+\);stroke:none"/g,
      'style="fill:none;stroke:rgb(100,116,139);stroke-dasharray:2 2"')
    .replace(/style="stroke:rgba\([^)]+\);fill:none"/g,
      'style="stroke:rgb(100,116,139);fill:none;stroke-dasharray:2 2"')
)

function pad2(n) {
  return n.toString().padStart(2, '0')
}

const MILESTONE_MSGS = {
  10: { icon: '🎉', text: '10단계 돌파!', sub: '1차 포인트 획득' },
  15: { icon: '⭐', text: '15단계 돌파!', sub: '2차 포인트 획득' },
  20: { icon: '🚀', text: '임무 완료!',  sub: '최고 포인트 획득' },
}

export default function SpaceDockingGame({ activity, onComplete, onExit }) {
  const canvasRef    = useRef(null)
  const shipWrapRef  = useRef(null)
  const targetWrapRef = useRef(null)
  const fadeTimerRef = useRef(null)

  const [level, setLevel]           = useState(1)
  const [currentState, setCurrentState] = useState({ x: 1, y: 1 })
  const [targetState, setTargetState]   = useState(null)
  const [currentFlips, setCurrentFlips] = useState(0)
  const [totalFlips, setTotalFlips]     = useState(0)
  const [highestMilestone, setHighestMilestone] = useState(0)
  const [isAnimating, setIsAnimating]   = useState(false)

  // Ship animation
  const [dockOffset, setDockOffset] = useState({ x: 0, y: 0 })
  const [isDocking, setIsDocking]   = useState(false)
  const [shipShake, setShipShake]   = useState(false)
  const [shipGreen, setShipGreen]   = useState(false)
  const [shipOpacity, setShipOpacity] = useState(1)

  // UI overlays
  const [feedback, setFeedback]         = useState(null)  // 'success' | 'fail' | 'waste'
  const [targetVisible, setTargetVisible] = useState(true)
  const [showDiffAlert, setShowDiffAlert] = useState(false)
  const [milestoneMsg, setMilestoneMsg]   = useState(null)
  const [gamePhase, setGamePhase]         = useState('playing') // 'playing' | 'gameover' | 'result'
  const [gameOverInfo, setGameOverInfo]   = useState(null)

  const shapeIdx = (level - 1) % SHIP_HTML.length

  // Starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let stars = [], animId

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      stars = []
      const num = Math.floor((canvas.width * canvas.height) / 2000)
      for (let i = 0; i < num; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5,
          vx: Math.random() * 0.5 - 0.25,
          vy: Math.random() * 0.5 - 0.25,
          a: Math.random(),
          da: Math.random() * 0.02 - 0.01,
        })
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy
        if (s.x < 0) s.x = canvas.width
        if (s.x > canvas.width) s.x = 0
        if (s.y < 0) s.y = canvas.height
        if (s.y > canvas.height) s.y = 0
        s.a += s.da
        if (s.a <= 0 || s.a >= 1) s.da = -s.da
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.abs(s.a)})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    resize()
    animate()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  // Generate level
  useEffect(() => {
    setCurrentState({ x: 1, y: 1 })
    setCurrentFlips(0)
    setTargetVisible(true)
    setShowDiffAlert(false)
    clearTimeout(fadeTimerRef.current)

    let ts
    do {
      if (level <= 5) {
        ts = Math.random() > 0.5 ? { x: -1, y: 1 } : { x: 1, y: -1 }
      } else {
        ts = { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 }
      }
    } while (ts.x === 1 && ts.y === 1)

    setTargetState(ts)

    if (level > 10) {
      setShowDiffAlert(true)
      const delay = level > 15 ? 1500 : 3500
      fadeTimerRef.current = setTimeout(() => {
        setTargetVisible(false)
        setShowDiffAlert(false)
      }, delay)
    }

    return () => clearTimeout(fadeTimerRef.current)
  }, [level])

  function flip(axis) {
    if (isAnimating) return
    setCurrentFlips(f => f + 1)
    setCurrentState(prev =>
      axis === 'X' ? { ...prev, x: prev.x * -1 } : { ...prev, y: prev.y * -1 }
    )
  }

  function showFeedback(type) {
    setFeedback(type)
    setTimeout(() => setFeedback(null), 1500)
  }

  function triggerMilestone(lvl) {
    if (!MILESTONE_MSGS[lvl]) return
    setMilestoneMsg(MILESTONE_MSGS[lvl])
    setTimeout(() => setMilestoneMsg(null), 2800)
  }

  function attemptDock() {
    if (isAnimating || !targetState) return
    setIsAnimating(true)

    clearTimeout(fadeTimerRef.current)
    setTargetVisible(true)
    setShowDiffAlert(false)

    // Animate ship toward target
    const shipRect   = shipWrapRef.current?.getBoundingClientRect()
    const targetRect = targetWrapRef.current?.getBoundingClientRect()
    if (shipRect && targetRect) {
      setDockOffset({ x: targetRect.left - shipRect.left, y: targetRect.top - shipRect.top })
    }
    setIsDocking(true)

    const minFlips = (targetState.x === -1 ? 1 : 0) + (targetState.y === -1 ? 1 : 0)
    const stateMatch = currentState.x === targetState.x && currentState.y === targetState.y

    setTimeout(() => {
      if (stateMatch && currentFlips <= minFlips) {
        // ✅ 도킹 성공
        showFeedback('success')
        setShipGreen(true)

        const completedMilestone = level >= 20 ? 20 : level >= 15 ? 15 : level >= 10 ? 10 : 0
        if (completedMilestone > 0) {
          setHighestMilestone(prev => Math.max(prev, completedMilestone))
          triggerMilestone(completedMilestone)
        }

        setTimeout(() => {
          setTotalFlips(t => t + currentFlips)
          setShipOpacity(0)

          setTimeout(() => {
            setShipGreen(false)
            setIsDocking(false)
            setDockOffset({ x: 0, y: 0 })

            if (level >= MAX_LEVELS) {
              setHighestMilestone(20)
              setGamePhase('result')
              setShipOpacity(1)
              setIsAnimating(false)
            } else {
              setLevel(l => l + 1)
              setTimeout(() => { setShipOpacity(1); setIsAnimating(false) }, 150)
            }
          }, 300)
        }, 2000)

      } else if (stateMatch && currentFlips > minFlips) {
        // ⚡ 에너지 낭비
        showFeedback('waste')
        setShipShake(true)
        setTimeout(() => {
          setShipShake(false)
          setIsDocking(false)
          setDockOffset({ x: 0, y: 0 })
          setTimeout(() => {
            setGamePhase('gameover')
            setGameOverInfo({
              title: '에너지 고갈!',
              desc: '모양은 맞췄지만 불필요한 조작을 너무 많이 했어요.',
              feedback: `단 ${minFlips}번의 조작만으로 도킹할 수 있었어요!`,
            })
            setIsAnimating(false)
          }, 500)
        }, 900)

      } else {
        // ❌ 방향 불일치
        showFeedback('fail')
        setShipShake(true)
        setTimeout(() => {
          setShipShake(false)
          setIsDocking(false)
          setDockOffset({ x: 0, y: 0 })
          setTimeout(() => {
            setGamePhase('gameover')
            setGameOverInfo({
              title: '도킹 실패',
              desc: '우주선 모듈이 파손되었습니다.',
              feedback: '다음에는 더 신중하게 방향을 확인하세요!',
            })
            setIsAnimating(false)
          }, 500)
        }, 900)
      }
    }, 800)
  }

  function handleFinish() {
    const m   = highestMilestone
    const p10 = activity?.milestone10 ?? 5
    const p15 = activity?.milestone15 ?? 5
    const p20 = activity?.milestone20 ?? 5
    const total  = p10 + p15 + p20
    const earned = (m >= 10 ? p10 : 0) + (m >= 15 ? p15 : 0) + (m >= 20 ? p20 : 0)
    const scoreRatio = total > 0 ? earned / total : 0
    const score = m > 0 ? m : Math.max(0, level - 1)
    onComplete({ scoreRatio, score, totalFlips })
  }

  const minFlips = targetState
    ? (targetState.x === -1 ? 1 : 0) + (targetState.y === -1 ? 1 : 0)
    : 0

  // ─── Feedback popup content ───
  const feedbackContent = {
    success: { icon: '✨', text: '도킹 성공!',       color: '#4ade80' },
    waste:   { icon: '🔋', text: '에너지 낭비!',     color: '#f87171' },
    fail:    { icon: '⚠️', text: '각도 재설정 필요!', color: '#f87171' },
  }[feedback] ?? null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbit&family=Share+Tech+Mono&display=swap');
        .space-font { font-family: 'Orbit', sans-serif; }
        .mono-font  { font-family: 'Share Tech Mono', monospace; letter-spacing: 1px; }

        .space-bg {
          background-color: #030408;
          background-image:
            linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .neon-panel {
          background: rgba(10,15,30,0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(14,165,233,0.3);
          box-shadow: 0 0 25px rgba(6,182,212,0.15), inset 0 0 40px rgba(6,182,212,0.08);
        }
        .neon-panel::before {
          content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
          background: repeating-linear-gradient(transparent 0px, transparent 3px, rgba(14,165,233,0.02) 3px, rgba(14,165,233,0.02) 4px);
        }
        .ship-glow { filter: drop-shadow(0 0 14px rgba(56,189,248,0.9)) drop-shadow(0 0 5px rgba(255,255,255,0.5)); }
        .ship-glow-green { filter: drop-shadow(0 0 16px rgba(74,222,128,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.4)); }
        .target-ghost { filter: drop-shadow(0 0 6px rgba(148,163,184,0.5)); animation: ghost-pulse 2.5s ease-in-out infinite alternate; }
        @keyframes ghost-pulse { from { opacity:0.2; } to { opacity:0.55; } }

        .btn-neon {
          background: linear-gradient(180deg,rgba(30,41,59,0.8),rgba(15,23,42,0.9));
          border: 1px solid rgba(14,165,233,0.4);
          border-top: 2px solid rgba(56,189,248,0.7);
          box-shadow: 0 6px 15px rgba(0,0,0,0.5), inset 0 1px 10px rgba(56,189,248,0.15);
          color: #e0f2fe;
          text-shadow: 0 0 5px rgba(56,189,248,0.6);
          transition: all 0.2s;
        }
        .btn-neon:hover { box-shadow: 0 8px 20px rgba(14,165,233,0.4), inset 0 1px 15px rgba(56,189,248,0.3); transform: translateY(-2px); }
        .btn-neon:active { transform: translateY(2px); }

        .btn-dock {
          background: linear-gradient(180deg,rgba(136,19,55,0.8),rgba(67,20,34,0.9));
          border: 1px solid rgba(244,63,94,0.5);
          border-top: 2px solid rgba(251,113,133,0.8);
          box-shadow: 0 6px 15px rgba(0,0,0,0.5);
          color: #ffe4e6;
          text-shadow: 0 0 5px rgba(251,113,133,0.6);
          animation: dock-pulse 2s infinite;
          transition: all 0.2s;
        }
        .btn-dock:hover { box-shadow: 0 8px 25px rgba(244,63,94,0.5); transform: translateY(-2px); }
        .btn-dock:active { transform: translateY(2px); animation: none; }
        @keyframes dock-pulse { 0%,100%{box-shadow:0 6px 15px rgba(0,0,0,0.5),0 0 10px rgba(244,63,94,0.2)} 50%{box-shadow:0 6px 15px rgba(0,0,0,0.5),0 0 25px rgba(244,63,94,0.5)} }

        @keyframes shake {
          10%,90% { transform: translate3d(-5px,0,0); }
          20%,80% { transform: translate3d(5px,0,0); }
          30%,50%,70% { transform: translate3d(-10px,0,0); }
          40%,60% { transform: translate3d(10px,0,0); }
        }
        .ship-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes milestone-in {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.4); }
          70%  { opacity:1; transform:translate(-50%,-50%) scale(1.08); }
          100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }
        .milestone-popup { animation: milestone-in 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }

        @keyframes popup-in {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.5); }
          100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }
        .feedback-popup { animation: popup-in 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
      `}</style>

      <div className="space-font space-bg text-white h-screen w-screen flex flex-col items-center justify-center overflow-hidden relative">
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />

        {/* ── 헤더 ── */}
        {gamePhase === 'playing' && (
          <div className="relative z-10 w-full max-w-5xl px-4 pt-4 pb-2 flex justify-between items-center gap-3 flex-wrap">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest text-cyan-400" style={{ textShadow: '0 0 15px rgba(34,211,238,0.6)' }}>
                우주 정거장 도킹 작전
              </h1>
              {/* 마일스톤 진행 표시 */}
              <div className="flex gap-3 mt-1">
                {[10, 15, 20].map(ms => (
                  <span key={ms} className={`text-xs font-bold px-2 py-0.5 rounded-full border ${highestMilestone >= ms ? 'border-yellow-400 text-yellow-300 bg-yellow-900/40' : 'border-slate-700 text-slate-600'}`}>
                    {ms === 10 ? '1차' : ms === 15 ? '2차' : '완료'} {highestMilestone >= ms ? '✓' : `${ms}단계`}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-slate-900/80 px-4 py-1.5 rounded-xl border border-pink-500/40 text-center backdrop-blur-md" style={{ boxShadow: '0 0 12px rgba(236,72,153,0.15)' }}>
                <div className="text-[10px] text-pink-300 opacity-80">조작 횟수</div>
                <div className="text-xl font-bold mono-font">
                  <span className="text-pink-400" style={{ filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.8))' }}>{pad2(currentFlips)}</span>
                  <span className="text-slate-500 text-xs ml-1">/ 최소 {minFlips}회</span>
                </div>
              </div>
              <div className="bg-slate-900/80 px-4 py-1.5 rounded-xl border border-cyan-500/40 text-center backdrop-blur-md" style={{ boxShadow: '0 0 12px rgba(6,182,212,0.15)' }}>
                <div className="text-[10px] text-cyan-300 opacity-80">STAGE</div>
                <div className="text-xl font-bold mono-font" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.8))' }}>
                  {pad2(level)} <span className="text-slate-500 text-sm">/ {MAX_LEVELS}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 게임 보드 ── */}
        {gamePhase === 'playing' && (
          <>
            <div className="neon-panel relative z-10 w-11/12 max-w-5xl rounded-3xl overflow-visible flex items-center justify-between px-8 md:px-20"
              style={{ flex: '1 1 0', margin: '0 auto 12px', minHeight: 0 }}>

              {/* Ship */}
              <div ref={shipWrapRef}
                style={{
                  transform: `translate(${dockOffset.x}px,${dockOffset.y}px)`,
                  transition: isDocking ? 'transform 0.8s cubic-bezier(0.25,1,0.5,1)' : 'transform 0.5s ease-out',
                  position: 'relative', zIndex: 20, flexShrink: 0,
                }}
                className="w-28 h-28 md:w-44 md:h-44 flex items-center justify-center">
                <div className={shipShake ? 'ship-shake w-full h-full flex items-center justify-center' : 'w-full h-full flex items-center justify-center'}>
                  <div className={shipGreen ? 'ship-glow-green w-full h-full flex items-center justify-center' : 'ship-glow w-full h-full flex items-center justify-center'}
                    style={{
                      transform: `scaleX(${currentState.x}) scaleY(${currentState.y})`,
                      transition: 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)',
                      opacity: shipOpacity,
                    }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full"
                      fill={shipGreen ? 'rgba(74,222,128,0.85)' : 'rgba(103,232,249,0.85)'}
                      stroke={shipGreen ? 'rgb(187,247,208)' : 'rgb(207,250,254)'}
                      strokeWidth="2"
                      dangerouslySetInnerHTML={{ __html: SHIP_HTML[shapeIdx] }} />
                  </div>
                </div>
              </div>

              {/* 피드백 팝업 */}
              {feedback && feedbackContent && (
                <div className="feedback-popup absolute left-1/2 top-1/2 z-30 pointer-events-none
                  bg-slate-900/95 px-8 py-4 rounded-2xl flex flex-col items-center text-center"
                  style={{ border: `1px solid ${feedbackContent.color}`, boxShadow: `0 0 25px ${feedbackContent.color}40` }}>
                  <span className="text-4xl mb-1">{feedbackContent.icon}</span>
                  <span className="text-xl font-bold" style={{ color: feedbackContent.color }}>{feedbackContent.text}</span>
                </div>
              )}

              {/* 마일스톤 팝업 */}
              {milestoneMsg && (
                <div className="milestone-popup absolute left-1/2 top-1/2 z-40 pointer-events-none
                  bg-slate-900/95 px-10 py-5 rounded-2xl flex flex-col items-center text-center"
                  style={{ border: '1px solid rgb(234,179,8)', boxShadow: '0 0 40px rgba(234,179,8,0.4)' }}>
                  <span className="text-5xl mb-2">{milestoneMsg.icon}</span>
                  <span className="text-2xl font-bold text-yellow-300">{milestoneMsg.text}</span>
                  <span className="text-sm text-yellow-400 mt-1">{milestoneMsg.sub}</span>
                </div>
              )}

              {/* Target */}
              <div ref={targetWrapRef}
                style={{ opacity: targetVisible ? 1 : 0, transition: 'opacity 1.5s ease-in-out', flexShrink: 0 }}
                className="w-28 h-28 md:w-44 md:h-44 flex items-center justify-center relative z-10">
                <div className="target-ghost w-full h-full flex items-center justify-center"
                  style={{
                    transform: `scaleX(${targetState?.x ?? 1}) scaleY(${targetState?.y ?? 1})`,
                  }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full"
                    fill="none"
                    stroke="rgb(148,163,184)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    dangerouslySetInnerHTML={{ __html: TARGET_HTML[shapeIdx] }} />
                </div>
              </div>
            </div>

            {/* ── 통신 장애 경고 ── */}
            {showDiffAlert && (
              <div className="relative z-20 text-pink-300 font-bold animate-pulse bg-slate-900/90 px-5 py-2 rounded-full border border-pink-500/50 text-sm tracking-wide mb-2"
                style={{ boxShadow: '0 0 15px rgba(236,72,153,0.4)' }}>
                ⚠️ 통신 장애: 잠시 후 목표 실루엣이 사라집니다!
              </div>
            )}

            {/* ── 조작 버튼 ── */}
            <div className="relative z-10 w-full max-w-5xl px-4 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => flip('Y')} className="btn-neon rounded-xl py-4 flex flex-col items-center gap-0.5">
                <span className="text-base font-bold tracking-wide">위아래 (상하)</span>
                <span className="text-xs text-cyan-300 opacity-80">뒤집기 ↕</span>
              </button>
              <button onClick={() => flip('X')} className="btn-neon rounded-xl py-4 flex flex-col items-center gap-0.5">
                <span className="text-base font-bold tracking-wide">양옆 (좌우)</span>
                <span className="text-xs text-cyan-300 opacity-80">뒤집기 ↔</span>
              </button>
              <button onClick={attemptDock} className="btn-dock rounded-xl py-4 text-xl font-bold tracking-widest col-span-2 flex items-center justify-center gap-2">
                도킹 시도! <span className="text-2xl">⚡</span>
              </button>
            </div>
          </>
        )}

        {/* ── 결과 화면 (20단계 완주) ── */}
        {gamePhase === 'result' && (
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full">
            <h2 className="text-5xl font-bold text-cyan-400 mb-2" style={{ textShadow: '0 0 20px rgba(34,211,238,0.6)' }}>작전 완료!</h2>
            <p className="text-slate-300 mb-6">모든 우주 정거장 모듈을 성공적으로 결합했습니다.</p>
            <div className="bg-slate-900/80 p-7 rounded-3xl border border-cyan-500/50 max-w-sm w-full mb-6 space-y-4"
              style={{ boxShadow: '0 0 40px rgba(6,182,212,0.2)' }}>
              <div className="flex justify-between items-center">
                <span className="text-slate-200">총 조작 횟수</span>
                <span className="text-3xl text-pink-400 font-bold mono-font">{totalFlips}<span className="text-lg text-slate-400 ml-1 font-sans">회</span></span>
              </div>
              <div className="border-t border-slate-700 pt-3 space-y-2">
                {[10, 15, 20].map(ms => (
                  <div key={ms} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{ms === 10 ? '1차' : ms === 15 ? '2차' : '최종'} 포인트 ({ms}단계)</span>
                    <span className="text-yellow-300 font-bold">✓ 획득</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800/80 border border-yellow-500/30 rounded-xl py-3 text-yellow-300 font-bold text-lg">
                🌟 20단계 완주! 진정한 우주 파일럿!
              </div>
            </div>
            <button onClick={handleFinish} className="btn-neon rounded-2xl px-10 py-4 text-xl font-bold flex items-center gap-3">
              포인트 받기 <span className="text-2xl">🚀</span>
            </button>
          </div>
        )}

        {/* ── 게임 오버 화면 ── */}
        {gamePhase === 'gameover' && gameOverInfo && (
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full">
            <h2 className="text-5xl font-bold text-red-400 mb-2" style={{ textShadow: '0 0 20px rgba(239,68,68,0.6)' }}>{gameOverInfo.title}</h2>
            <p className="text-slate-300 mb-6">{gameOverInfo.desc}</p>
            <div className="bg-slate-900/80 p-7 rounded-3xl border border-red-500/40 max-w-sm w-full mb-6 space-y-4"
              style={{ boxShadow: '0 0 30px rgba(239,68,68,0.15)' }}>
              <div className="flex justify-between items-center">
                <span className="text-slate-200">도달 단계</span>
                <span className="text-3xl text-pink-400 font-bold mono-font">{pad2(level)}<span className="text-slate-500 text-xl mx-1">/</span><span className="text-cyan-500">{MAX_LEVELS}</span></span>
              </div>
              {/* 획득한 마일스톤 */}
              <div className="border-t border-slate-700 pt-3 space-y-2">
                {[10, 15, 20].map(ms => (
                  <div key={ms} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{ms === 10 ? '1차' : ms === 15 ? '2차' : '최종'} 포인트 ({ms}단계)</span>
                    <span className={highestMilestone >= ms ? 'text-yellow-300 font-bold' : 'text-slate-600'}>
                      {highestMilestone >= ms ? '✓ 획득' : '미달성'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800/80 border border-yellow-500/30 rounded-xl py-3 text-yellow-300 text-sm px-3">
                {gameOverInfo.feedback}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleFinish}
                className="btn-neon rounded-2xl px-8 py-3 text-lg font-bold"
                style={{ borderColor: 'rgba(239,68,68,0.5)' }}>
                {highestMilestone >= 10 ? '부분 포인트 받기 🏁' : '확인 (포인트 없음) 🏁'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
