/**
 * 📏 어림 만들기 (눈대중으로 직접 만들기)
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 *
 * [출처] 「수학 양감 어림 게임」(20251110 guessgame) 오마주.
 *   원작은 참고 크기를 보고 '?'의 값을 맞히는 게임. 이 게임은 방향을 거꾸로 해서
 *   "7cm 막대", "60° 각", "24cm² 직사각형"을 학생이 직접 끌어서 만든다.
 *
 * [게임 방식] 10문제
 * - 1~4번 : 참고 크기(1·5·10cm / 45·90·135° / 1·4·10cm²)를 보면서 만든다.
 * - 5~8번 : 참고가 3초 뒤 사라진다. (원작 각도 모드의 "사라짐!" 오마주)
 * - 9~10번: 참고 없이 눈대중만으로.
 * - 화면 배율(1cm = 30)은 게임 내내 같다 → 앞에서 익힌 감각으로 뒤를 푼다.
 * - 답을 내면 정답 모양(점선)과 눈금·격자가 드러나 비교할 수 있다.
 *
 * [점수] 오차에 따라 문제당 별 0~3개 → 별 합계 / 30 = scoreRatio
 *
 * [교사 설정] activity.estimateKinds: ['length', 'angle', 'area'] 중 출제 영역
 */
import { useReducer, useEffect, useRef } from 'react'

const TOTAL       = 10
const PX          = 30            // 1cm = 30 (SVG 좌표). 게임 내내 고정
const W = 700, H = 300, RH = 96   // 작업판, 참고판 크기 (둘 다 가로 700 → 같은 배율)
const REF_SHOW_MS = 3000

export const ESTIMATE_KINDS = [
  { key: 'length', label: '📏 길이 — 막대를 늘여 목표 길이 만들기 (2~18cm 중 무작위)',        short: '길이', unit: 'cm'  },
  { key: 'angle',  label: '📐 각도 — 선을 돌려 목표 각 만들기 (20°~160° 중 무작위)',          short: '각도', unit: '°'   },
  { key: 'area',   label: '⬛ 넓이 — 모서리를 끌어 목표 넓이 만들기 (6~48cm² 중 무작위)', short: '넓이', unit: 'cm²' },
]
const KIND = Object.fromEntries(ESTIMATE_KINDS.map(k => [k.key, k]))

const STAGE_TEXT = {
  1: '1단계 · 참고를 보면서',
  2: '2단계 · 참고가 3초 뒤 사라져요',
  3: '3단계 · 눈대중만으로',
}

// 참고 크기 (1단계에서는 이 값과 같은 목표를 내지 않는다)
const REFS = { length: [1, 5, 10], angle: [45, 90, 135], area: [1, 4, 10] }
const AREA_TARGETS = [6, 8, 9, 12, 14, 15, 16, 18, 20, 21, 24, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48]

// 작업판 기준점
const LX = 40,  LY = 140            // 길이: 막대 시작점
const AX = 350, AY = 275, AR = 230  // 각도: 꼭짓점, 돌아가는 선 길이
const RX = 40,  RY = 20             // 넓이: 직사각형 왼쪽 위

const round1 = n => Math.round(n * 10) / 10
const clamp  = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
const rand   = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickTarget(kind, stage) {
  const avoid = stage === 1 ? REFS[kind] : []
  let t
  do {
    if (kind === 'length') t = rand(2, 18)
    else if (kind === 'angle') t = rand(4, 32) * 5          // 20° ~ 160°
    else t = AREA_TARGETS[rand(0, AREA_TARGETS.length - 1)]
  } while (avoid.includes(t))
  return t
}

function makeProblems(kinds) {
  const seq = []
  while (seq.length < TOTAL) seq.push(...shuffle(kinds))
  const used = new Set()
  return seq.slice(0, TOTAL).map((kind, i) => {
    const stage = i < 4 ? 1 : i < 8 ? 2 : 3
    let target, tries = 0
    do { target = pickTarget(kind, stage); tries++ } while (used.has(kind + target) && tries < 50)
    used.add(kind + target)
    return { kind, stage, target }
  })
}

const initialValue = kind =>
  kind === 'length' ? { len: 0.5 } : kind === 'angle' ? { deg: 0 } : { w: 1, h: 1 }

function measure(kind, v) {
  if (kind === 'length') return round1(v.len)
  if (kind === 'angle')  return Math.round(v.deg)
  return round1(v.w * v.h)
}

/** 오차 → 별 0~3개. 넓이는 2차원이라 기준을 조금 넉넉하게 */
function grade(kind, target, made) {
  const diff = kind === 'angle' ? Math.abs(made - target) : round1(Math.abs(made - target))
  if (kind === 'angle') {
    return { diff, stars: diff <= 4 ? 3 : diff <= 10 ? 2 : diff <= 20 ? 1 : 0 }
  }
  const pct = Math.round((diff / target) * 100)
  const [a, b, c] = kind === 'length' ? [6, 15, 30] : [10, 20, 35]
  const stars = (pct <= a || (kind === 'length' && diff <= 0.2)) ? 3 : pct <= b ? 2 : pct <= c ? 1 : 0
  return { diff, pct, stars }
}

/** 포인터 위치(SVG 좌표) → 값 */
function pointToValue(kind, x, y) {
  if (kind === 'length') return { len: clamp(round1((x - LX) / PX), 0.5, 20.5) }
  if (kind === 'angle') {
    let deg = (Math.atan2(AY - y, x - AX) * 180) / Math.PI
    if (deg < 0) deg = x >= AX ? 0 : 180 // 기준선 아래로 끌면 양 끝에 붙인다
    return { deg: Math.round(deg) }
  }
  return { w: clamp(round1((x - RX) / PX), 0.5, 18), h: clamp(round1((y - RY) / PX), 0.5, 9) }
}

/** 방향키로 미세 조정 (Shift = 크게) */
function nudge(kind, v, key, big) {
  const s = big ? 1 : 0.1
  if (kind === 'length') {
    if (key === 'ArrowRight' || key === 'ArrowUp')   return { len: clamp(round1(v.len + s), 0.5, 20.5) }
    if (key === 'ArrowLeft'  || key === 'ArrowDown') return { len: clamp(round1(v.len - s), 0.5, 20.5) }
  }
  if (kind === 'angle') {
    const d = big ? 10 : 1
    if (key === 'ArrowLeft'  || key === 'ArrowUp')   return { deg: clamp(v.deg + d, 0, 180) }
    if (key === 'ArrowRight' || key === 'ArrowDown') return { deg: clamp(v.deg - d, 0, 180) }
  }
  if (kind === 'area') {
    if (key === 'ArrowRight') return { ...v, w: clamp(round1(v.w + s), 0.5, 18) }
    if (key === 'ArrowLeft')  return { ...v, w: clamp(round1(v.w - s), 0.5, 18) }
    if (key === 'ArrowDown')  return { ...v, h: clamp(round1(v.h + s), 0.5, 9) }
    if (key === 'ArrowUp')    return { ...v, h: clamp(round1(v.h - s), 0.5, 9) }
  }
  return null
}

const MORE = { length: '길게', angle: '크게', area: '넓게' }
const LESS = { length: '짧게', angle: '작게', area: '좁게' }
const PRAISE = ['차이가 커요. 점선 크기를 눈에 담아 두세요.', '조금 차이가 나요.', '가까워요!', '아주 가까워요!']

// ─── 상태 ───────────────────────────────────────────────────────────────────

const initialState = {
  phase: 'intro',      // intro | play | reveal | end
  problems: [],
  idx: 0,
  value: null,
  touched: false,      // 한 번이라도 움직였는가 (실수로 Enter 눌러 제출 방지)
  refsVisible: true,
  results: [],
}

function reducer(s, a) {
  switch (a.type) {
    case 'START':
      return {
        ...initialState, phase: 'play', problems: a.problems,
        value: initialValue(a.problems[0].kind),
      }
    case 'SET':
      if (s.phase !== 'play' || !a.value) return s
      return { ...s, value: a.value, touched: true }
    case 'HIDE_REFS':
      if (s.phase !== 'play' || s.idx !== a.idx) return s
      return { ...s, refsVisible: false }
    case 'SUBMIT': {
      if (s.phase !== 'play' || !s.touched) return s
      const p    = s.problems[s.idx]
      const made = measure(p.kind, s.value)
      const g    = grade(p.kind, p.target, made)
      return {
        ...s, phase: 'reveal', refsVisible: true,
        results: [...s.results, { ...p, made, value: s.value, ...g }],
      }
    }
    case 'NEXT': {
      if (s.phase !== 'reveal') return s
      if (s.idx + 1 >= TOTAL) return { ...s, phase: 'end' }
      const p = s.problems[s.idx + 1]
      return {
        ...s, phase: 'play', idx: s.idx + 1, touched: false,
        value: initialValue(p.kind), refsVisible: p.stage !== 3,
      }
    }
    default:
      return s
  }
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

export default function EstimateMakerGame({ activity, onComplete, onExit }) {
  const picked = (activity?.estimateKinds || []).filter(k => KIND[k])
  const kinds  = picked.length ? picked : ESTIMATE_KINDS.map(k => k.key)

  const [s, dispatch] = useReducer(reducer, initialState)
  const startTimeRef  = useRef(Date.now())
  const completedRef  = useRef(false)
  const sRef = useRef(s); sRef.current = s

  const p      = s.problems[s.idx]
  const last   = s.results[s.results.length - 1]
  const stars  = s.results.reduce((a, r) => a + r.stars, 0)

  function start() {
    startTimeRef.current = Date.now()
    dispatch({ type: 'START', problems: makeProblems(kinds) })
  }

  function finish() {
    if (completedRef.current) return
    completedRef.current = true
    const total = sRef.current.results.reduce((a, r) => a + r.stars, 0)
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
    const scoreRatio = Math.round((total / (TOTAL * 3)) * 100) / 100
    onComplete({ score: `별 ${total}/${TOTAL * 3}`, scoreRatio, completionTime, passed: total > 0 })
  }

  // 2단계: 참고가 3초 뒤 사라진다
  useEffect(() => {
    if (s.phase !== 'play' || p?.stage !== 2) return
    const idx = s.idx
    const id = setTimeout(() => dispatch({ type: 'HIDE_REFS', idx }), REF_SHOW_MS)
    return () => clearTimeout(id)
  }, [s.phase, s.idx, p?.stage])

  // 키보드: Enter = 진행/제출, 방향키 = 미세 조정(Shift는 크게)
  useEffect(() => {
    function onKey(e) {
      const cur = sRef.current
      if (e.key === 'Enter') {
        e.preventDefault()
        if (cur.phase === 'intro') start()
        else if (cur.phase === 'play') dispatch({ type: 'SUBMIT' })
        else if (cur.phase === 'reveal') dispatch({ type: 'NEXT' })
        else if (cur.phase === 'end') finish()
      } else if (e.key.startsWith('Arrow') && cur.phase === 'play') {
        e.preventDefault()
        const kind = cur.problems[cur.idx].kind
        dispatch({ type: 'SET', value: nudge(kind, cur.value, e.key, e.shiftKey) })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 인트로 ──
  if (s.phase === 'intro') {
    return (
      <Shell onExit={onExit}>
        <div className="card text-center space-y-4">
          <div className="text-5xl">📏</div>
          <h2 className="text-2xl font-black text-carnival-navy">어림 만들기</h2>
          <p className="text-carnival-navy/60">말한 크기를 눈대중으로 직접 만들어요. 자 없이 얼마나 가깝게 만들 수 있을까요?</p>
          <ul className="text-left text-base text-carnival-navy/80 space-y-2 bg-carnival-cream rounded-2xl p-4">
            <li>1️⃣ 막대·선·모서리를 <strong>마우스로 끌어서</strong> 목표 크기를 만들어요. (방향키로 조금씩, Shift+방향키로 크게)</li>
            <li>2️⃣ 1~4번은 <strong>참고 크기</strong>를 보면서, 5~8번은 참고가 <strong>3초 뒤 사라지고</strong>, 9~10번은 <strong>눈대중만으로</strong>!</li>
            <li>3️⃣ 화면 속 1cm는 게임 내내 같은 크기예요. 앞 문제에서 감각을 익혀 두세요.</li>
            <li>4️⃣ 목표에 가까울수록 <strong>별 ★★★</strong>. 별을 많이 모을수록 포인트가 커져요.</li>
          </ul>
          <p className="text-sm text-carnival-navy/50">
            출제 영역: {kinds.map(k => KIND[k].short).join(' · ')}
          </p>
          <button onClick={start} className="btn-primary w-full text-lg">시작하기 (Enter)</button>
        </div>
      </Shell>
    )
  }

  // ── 최종 결과 ──
  if (s.phase === 'end') {
    const max = TOTAL * 3
    const gradeText = stars >= 27 ? '완벽해요!' : stars >= 21 ? '우수해요!' : stars >= 15 ? '좋아요!' : '다음엔 더 가깝게!'
    return (
      <Shell onExit={onExit}>
        <div className="card text-center space-y-4">
          <h2 className="text-2xl font-black text-carnival-navy">결과 · {gradeText}</h2>
          <p className="text-4xl font-black text-carnival-coral">
            ★ {stars}<span className="text-xl text-carnival-navy/40"> / {max}</span>
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-left text-sm">
            {s.results.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-carnival-cream rounded-xl px-3 py-1.5">
                <span className="text-carnival-navy/50 w-6">{i + 1}</span>
                <span className="flex-1 font-bold text-carnival-navy">
                  {KIND[r.kind].short} {r.target}{KIND[r.kind].unit}
                  <span className="font-medium text-carnival-navy/50"> → {r.made}{KIND[r.kind].unit}</span>
                </span>
                <Stars n={r.stars} small />
              </div>
            ))}
          </div>
          <button onClick={finish} className="btn-primary w-full text-lg">완료하고 포인트 받기 (Enter)</button>
        </div>
      </Shell>
    )
  }

  // ── 문제 / 정답 공개 ──
  const kind   = p.kind
  const unit   = KIND[kind].unit
  const reveal = s.phase === 'reveal'

  return (
    <Shell onExit={onExit} idx={s.idx} stars={stars} results={s.results}>
      <div className="card py-4 px-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`badge ${p.stage === 1 ? 'bg-teal-50 text-teal-700' : p.stage === 2 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-carnival-coral'}`}>
            {STAGE_TEXT[p.stage]}
          </span>
          <p className="text-2xl font-black text-carnival-navy">
            <span className="text-carnival-coral">{p.target}{unit}</span>
            <span className="text-lg font-bold text-carnival-navy/60">
              {kind === 'length' ? ' 길이의 막대를 만드세요' : kind === 'angle' ? ' 각을 만드세요' : ' 넓이의 직사각형을 만드세요'}
            </span>
          </p>
        </div>

        <RefStrip kind={kind} visible={s.refsVisible} stage={p.stage} />

        <Board
          kind={kind}
          value={reveal ? last.value : s.value}
          target={p.target}
          reveal={reveal}
          onValue={v => dispatch({ type: 'SET', value: v })}
        />

        <div className="flex items-center gap-4 min-h-[64px]">
          {reveal ? (
            <>
              <div className="flex-1">
                <p className="text-lg font-black text-carnival-navy flex items-center gap-2">
                  <Stars n={last.stars} /> {PRAISE[last.stars]}
                </p>
                <p className="text-base text-carnival-navy/70">
                  {kind === 'area' && <>가로 {last.value.w}cm × 세로 {last.value.h}cm = </>}
                  내가 만든 <strong className="text-carnival-coral">{last.made}{unit}</strong>
                  {' · '}목표 <strong className="text-teal-600">{last.target}{unit}</strong>
                  {last.diff === 0
                    ? ' · 딱 맞았어요!'
                    : ` · ${last.diff}${unit} ${last.made > last.target ? MORE[kind] : LESS[kind]} 만들었어요`}
                </p>
              </div>
              <button onClick={() => dispatch({ type: 'NEXT' })} className="btn-sky text-lg whitespace-nowrap">
                {s.idx + 1 >= TOTAL ? '결과 보기' : '다음 문제'} (Enter)
              </button>
            </>
          ) : (
            <>
              <p className="flex-1 text-sm text-carnival-navy/50">
                {kind === 'length' && '막대 끝(동그라미)을 좌우로 끌어요. ←/→ 키로 조금씩 움직일 수 있어요.'}
                {kind === 'angle'  && '빨간 선 끝을 끌어서 돌려요. ←/→ 키로 1°씩 돌릴 수 있어요.'}
                {kind === 'area'   && '오른쪽 아래 모서리를 끌어요. 방향키로 가로·세로를 조금씩 바꿀 수 있어요.'}
              </p>
              <button
                onClick={() => dispatch({ type: 'SUBMIT' })}
                disabled={!s.touched}
                className="btn-primary text-lg whitespace-nowrap disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                다 만들었어요 (Enter)
              </button>
            </>
          )}
        </div>
      </div>
    </Shell>
  )
}

// ─── 작업판 ─────────────────────────────────────────────────────────────────

function Board({ kind, value, target, reveal, onValue }) {
  const svgRef   = useRef(null)
  const dragging = useRef(false)

  function toValue(e) {
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse())
    onValue(pointToValue(kind, x, y))
  }

  const handlers = reveal ? {} : {
    onPointerDown: e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); toValue(e) },
    onPointerMove: e => { if (dragging.current) toValue(e) },
    onPointerUp:   () => { dragging.current = false },
    onPointerCancel: () => { dragging.current = false },
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full rounded-2xl bg-carnival-cream/60 border-2 border-carnival-cream select-none ${reveal ? '' : 'cursor-pointer'}`}
      style={{ touchAction: 'none' }}
      {...handlers}
    >
      {kind === 'length' && <LengthBoard len={value.len} target={target} reveal={reveal} />}
      {kind === 'angle'  && <AngleBoard deg={value.deg} target={target} reveal={reveal} />}
      {kind === 'area'   && <AreaBoard w={value.w} h={value.h} target={target} reveal={reveal} />}
    </svg>
  )
}

const CORAL = '#FF6B6B', TEAL = '#0d9488', NAVY = '#1A1A2E'

function Handle({ x, y }) {
  return <circle cx={x} cy={y} r={14} fill="white" stroke={CORAL} strokeWidth={5} />
}

function LengthBoard({ len, target, reveal }) {
  const end = LX + len * PX
  const rulerTo = Math.min(20, Math.ceil(Math.max(len, target)) + 1)
  return (
    <g>
      <line x1={LX} y1={LY - 40} x2={LX} y2={LY + 40} stroke={NAVY} strokeOpacity={0.4} strokeWidth={3} />
      <rect x={LX} y={LY - 20} width={len * PX} height={40} rx={6} fill={CORAL} fillOpacity={reveal ? 0.75 : 1} />
      {reveal ? (
        <g>
          <rect x={LX} y={LY - 30} width={target * PX} height={60} rx={6}
            fill="none" stroke={TEAL} strokeWidth={3} strokeDasharray="10 6" />
          <text x={LX + target * PX} y={LY - 40} textAnchor="middle" fontSize={18} fontWeight={800} fill={TEAL}>
            목표 {target}cm
          </text>
          {/* 답을 낸 뒤에만 보이는 자 */}
          {Array.from({ length: rulerTo + 1 }, (_, i) => (
            <g key={i}>
              <line x1={LX + i * PX} y1={LY + 48} x2={LX + i * PX} y2={LY + (i % 5 === 0 ? 66 : 58)} stroke={NAVY} strokeOpacity={0.5} strokeWidth={2} />
              {i % 5 === 0 && <text x={LX + i * PX} y={LY + 86} textAnchor="middle" fontSize={15} fill={NAVY} fillOpacity={0.6}>{i}</text>}
            </g>
          ))}
          <line x1={LX} y1={LY + 48} x2={LX + rulerTo * PX} y2={LY + 48} stroke={NAVY} strokeOpacity={0.5} strokeWidth={2} />
        </g>
      ) : (
        <Handle x={end} y={LY} />
      )}
    </g>
  )
}

function arcPath(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return `M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx + r * Math.cos(rad)} ${cy - r * Math.sin(rad)}`
}
const rayEnd = (deg, r) => [AX + r * Math.cos((deg * Math.PI) / 180), AY - r * Math.sin((deg * Math.PI) / 180)]

function AngleBoard({ deg, target, reveal }) {
  const [ex, ey] = rayEnd(deg, AR)
  const [tx, ty] = rayEnd(target, AR + 20)
  const [lx, ly] = rayEnd(target, AR + 40)
  return (
    <g>
      {reveal && Array.from({ length: 19 }, (_, i) => {
        const [x1, y1] = rayEnd(i * 10, AR - 8)
        const [x2, y2] = rayEnd(i * 10, i % 3 === 0 ? AR + 8 : AR)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={NAVY} strokeOpacity={0.35} strokeWidth={2} />
      })}
      <line x1={AX} y1={AY} x2={AX + AR + 40} y2={AY} stroke={NAVY} strokeOpacity={0.45} strokeWidth={6} strokeLinecap="round" />
      {deg > 0 && <path d={arcPath(AX, AY, 44, deg)} fill="none" stroke={CORAL} strokeWidth={3} />}
      <line x1={AX} y1={AY} x2={ex} y2={ey} stroke={CORAL} strokeWidth={8} strokeLinecap="round" strokeOpacity={reveal ? 0.75 : 1} />
      <circle cx={AX} cy={AY} r={7} fill={NAVY} />
      {reveal ? (
        <g>
          <line x1={AX} y1={AY} x2={tx} y2={ty} stroke={TEAL} strokeWidth={4} strokeDasharray="10 6" strokeLinecap="round" />
          <path d={arcPath(AX, AY, 64, target)} fill="none" stroke={TEAL} strokeWidth={3} strokeDasharray="6 4" />
          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={800} fill={TEAL}>
            {target}°
          </text>
        </g>
      ) : (
        <Handle x={ex} y={ey} />
      )}
    </g>
  )
}

function AreaBoard({ w, h, target, reveal }) {
  // 정답 공개용: 내가 만든 것과 같은 모양(가로세로 비율)으로 목표 넓이만큼 키우거나 줄인 직사각형
  let tw = w * Math.sqrt(target / (w * h)), th = h * Math.sqrt(target / (w * h))
  if (tw > 21 || th > 9.3) { tw = Math.sqrt(target); th = Math.sqrt(target) }
  return (
    <g>
      <rect x={RX} y={RY} width={w * PX} height={h * PX} fill={CORAL} fillOpacity={reveal ? 0.55 : 0.9} rx={3} />
      <path d={`M ${RX} ${RY + 40} V ${RY} H ${RX + 40}`} fill="none" stroke={NAVY} strokeOpacity={0.5} strokeWidth={4} />
      {reveal ? (
        <g>
          {/* 1cm² 격자 */}
          {Array.from({ length: Math.ceil(w) - 1 }, (_, i) => (
            <line key={'v' + i} x1={RX + (i + 1) * PX} y1={RY} x2={RX + (i + 1) * PX} y2={RY + h * PX} stroke="white" strokeWidth={1.5} />
          ))}
          {Array.from({ length: Math.ceil(h) - 1 }, (_, i) => (
            <line key={'h' + i} x1={RX} y1={RY + (i + 1) * PX} x2={RX + w * PX} y2={RY + (i + 1) * PX} stroke="white" strokeWidth={1.5} />
          ))}
          <rect x={RX} y={RY} width={tw * PX} height={th * PX} fill="none" stroke={TEAL} strokeWidth={3} strokeDasharray="10 6" />
          <text x={RX + Math.max(w, tw) * PX + 10} y={RY + th * PX} fontSize={18} fontWeight={800} fill={TEAL}>
            목표 {target}cm²
          </text>
        </g>
      ) : (
        <Handle x={RX + w * PX} y={RY + h * PX} />
      )}
    </g>
  )
}

// ─── 참고판 ─────────────────────────────────────────────────────────────────

function RefStrip({ kind, visible, stage }) {
  const message = stage === 3
    ? '참고 없이 눈대중만으로 만들어요'
    : '참고가 사라졌어요 · 기억을 떠올려 만들어요'
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${RH}`} className={`w-full rounded-2xl bg-white border-2 border-dashed border-gray-200 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <text x={16} y={24} fontSize={15} fontWeight={800} fill={NAVY} fillOpacity={0.45}>참고</text>
        {kind === 'length' && REFS.length.map((v, i) => (
          <g key={v}>
            <text x={330} y={26 + i * 28} textAnchor="end" fontSize={15} fontWeight={700} fill={NAVY} fillOpacity={0.7}>{v}cm</text>
            <rect x={340} y={14 + i * 28} width={v * PX} height={16} rx={3} fill="#9ca3af" />
          </g>
        ))}
        {kind === 'angle' && REFS.angle.map((v, i) => {
          const cx = 190 + i * 170, cy = 84, r = 62
          const rad = (v * Math.PI) / 180
          return (
            <g key={v}>
              <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#9ca3af" strokeWidth={4} strokeLinecap="round" />
              <line x1={cx} y1={cy} x2={cx + r * Math.cos(rad)} y2={cy - r * Math.sin(rad)} stroke="#6b7280" strokeWidth={4} strokeLinecap="round" />
              <text x={cx + 30} y={cy - 6} fontSize={15} fontWeight={700} fill={NAVY} fillOpacity={0.7}>{v}°</text>
            </g>
          )
        })}
        {kind === 'area' && (
          <g>
            {[{ v: 1, x: 200, w: 1, h: 1 }, { v: 4, x: 290, w: 2, h: 2 }, { v: 10, x: 420, w: 5, h: 2 }].map(r => (
              <g key={r.v}>
                <rect x={r.x} y={14} width={r.w * PX} height={r.h * PX} fill="#9ca3af" rx={2} />
                <text x={r.x + (r.w * PX) / 2} y={90} textAnchor="middle" fontSize={15} fontWeight={700} fill={NAVY} fillOpacity={0.7}>{r.v}cm²</text>
              </g>
            ))}
          </g>
        )}
      </svg>
      {!visible && (
        <p className="absolute inset-0 flex items-center justify-center text-base font-bold text-carnival-navy/40">
          {message}
        </p>
      )}
    </div>
  )
}

// ─── 공통 ───────────────────────────────────────────────────────────────────

function Stars({ n, small }) {
  return (
    <span className={`${small ? 'text-sm' : 'text-xl'} font-black tracking-tight`}>
      <span className="text-amber-400">{'★'.repeat(n)}</span>
      <span className="text-gray-200">{'★'.repeat(3 - n)}</span>
    </span>
  )
}

function Shell({ children, onExit, idx, stars, results }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-3">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-carnival-navy">📏 어림 만들기</h1>
          <div className="flex items-center gap-4">
            {idx != null && (
              <span className="flex items-center gap-3 text-sm font-bold text-carnival-navy/60">
                <span className="flex gap-1">
                  {Array.from({ length: TOTAL }, (_, i) => (
                    <span key={i} className={`w-2.5 h-2.5 rounded-full ${
                      i < results.length ? (results[i].stars >= 2 ? 'bg-teal-500' : results[i].stars === 1 ? 'bg-amber-400' : 'bg-carnival-coral')
                        : i === idx ? 'bg-carnival-navy' : 'bg-gray-200'}`} />
                  ))}
                </span>
                {idx + 1} / {TOTAL} · <span className="text-amber-500">★ {stars}</span>
              </span>
            )}
            <button onClick={onExit} className="text-sm text-carnival-navy/40 hover:text-carnival-coral transition-colors">
              나가기
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

// 자동 테스트용 (게임 동작에는 영향 없음)
export const __test = { makeProblems, grade, measure, pointToValue, nudge, reducer, initialState, initialValue, PX, LX, LY, AX, AY, AR, RX, RY, REFS }
