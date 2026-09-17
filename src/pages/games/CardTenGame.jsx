/**
 * 🃏 10 만들기 카드 대결 (컴퓨터와 1:1)
 *
 * [미니게임 인터페이스 규약]
 * props: { activityId, activity, onComplete, onExit }
 * - onComplete(result) 호출 시 플랫폼이 자동으로 포인트를 지급합니다.
 *
 * [출처] 「[교안] 초등 3~4학년 3차시」 10 만들기 전략 게임 (활동북 15~17쪽)
 *
 * [게임 방식]
 * - 나와 컴퓨터가 각각 0~9 숫자 카드 10장을 뒷면으로 자기 앞에 펼친다.
 * - 가위바위보에서 진 사람이 1·3라운드, 이긴 사람이 2·4라운드를 먼저 시작.
 *   5라운드는 4라운드 승자가 먼저. (4라운드 무승부면 다시 가위바위보 → 진 사람)
 * - 선 플레이어부터 "상대편 앞에 놓인 카드" 한 장을 뒤집는다. 뒤집은 카드는 내 카드.
 *   한 장씩 번갈아, 최대 3장까지. 언제든 그만 뽑을 수 있다(최소 1장).
 * - 뽑은 카드 합이 10에 가까운 사람이 라운드 승리.
 *   차가 같으면 카드를 많이 뽑은 쪽 승리. 장수도 같으면 무승부.
 * - 사용한 카드는 다음 라운드에 다시 쓰지 않는다. (남은 숫자를 보고 전략을 세운다)
 * - 5라운드 중 더 많이 이긴 쪽이 최종 승리.
 *
 * [점수 방식] (교사 설정 cardTenReward)
 * - 'win'  : 최종 승리 → scoreRatio 1, 무승부 0.5, 패배 0
 * - 'play' : 5라운드 완주 → scoreRatio 1
 *
 * [컴퓨터 난이도] (교사 설정 cardTenAi)
 * - 'smart': 남은 카드를 보고 기대값으로 판단
 * - 'easy' : 합이 6 이하면 뽑고 아니면 멈춤 (단순)
 */
import { useReducer, useEffect, useRef } from 'react'

const ROUNDS      = 5
const MAX_DRAW    = 3
const TARGET      = 10
const CARD_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const RPS = [
  { key: 'scissors', emoji: '✌️', label: '가위' },
  { key: 'rock',     emoji: '✊', label: '바위' },
  { key: 'paper',    emoji: '✋', label: '보'   },
]
const RPS_BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 카드 상태: down(뒷면) | up(이번 라운드에 뒤집힘) | used(지난 라운드에 사용됨)
const makeRow = () => shuffle(CARD_VALUES).map(v => ({ value: v, state: 'down' }))
const sum  = cards => cards.reduce((a, b) => a + b, 0)
const dist = s => Math.abs(s - TARGET)
const downValues = row => row.filter(c => c.state === 'down').map(c => c.value).sort((a, b) => a - b)
const other = who => (who === 'me' ? 'cpu' : 'me')

// 라운드 승자 판정: 10과의 차 → 카드 장수 → 무승부
function judge(meCards, cpuCards) {
  const dm = dist(sum(meCards)), dc = dist(sum(cpuCards))
  if (dm < dc) return 'me'
  if (dc < dm) return 'cpu'
  if (meCards.length > cpuCards.length) return 'me'
  if (cpuCards.length > meCards.length) return 'cpu'
  return 'draw'
}

// 더 뽑을 수 있는가 (멈추지 않았고, 3장 미만이고, 뒤집을 카드가 남아 있음)
const canDraw = (cards, done, pool) =>
  !done && cards.length < MAX_DRAW && pool.some(c => c.state === 'down')

/** 컴퓨터의 선택 — 학생에게 설명할 수 있도록 이유도 함께 돌려준다 */
function cpuDecide({ cpuCards, pool, meCards, meActive, level, round }) {
  const s = sum(cpuCards), d = dist(s)
  if (cpuCards.length === 0) return { action: 'draw', reason: '첫 카드를 뒤집을게요.' }
  if (d === 0) return { action: 'stop', reason: `합이 딱 ${TARGET}! 여기서 멈출게요.` }
  // 남은 라운드마다 최소 1장은 남겨 둔다 (카드가 바닥나면 그 라운드는 0점)
  if (pool.length - 1 < ROUNDS - round) return { action: 'stop', reason: '다음 라운드에 쓸 카드를 아껴야 해요. 멈출게요.' }

  if (level === 'easy') {
    return s <= 6
      ? { action: 'draw', reason: `합이 ${s}이라 한 장 더 뽑을게요.` }
      : { action: 'stop', reason: `합이 ${s}이니 여기서 멈출게요.` }
  }

  // smart: 남은 카드 숫자를 보고 판단
  if (!meActive) {
    // 상대는 끝났음 → 지금 이기고 있으면 멈춤, 아니면 뽑았을 때 이길 가능성 비교
    const outcome = cards => { const r = judge(meCards, cards); return r === 'cpu' ? 1 : r === 'draw' ? 0.5 : 0 }
    const now = outcome(cpuCards)
    if (now === 1) return { action: 'stop', reason: '지금 이기고 있으니 멈출게요.' }
    const ev = pool.reduce((a, c) => a + outcome([...cpuCards, c]), 0) / pool.length
    return ev > now
      ? { action: 'draw', reason: `합이 ${s}이라 지고 있어요. 한 장 더 뽑아 볼게요.` }
      : { action: 'stop', reason: '남은 카드로는 더 좋아지기 어려워요. 멈출게요.' }
  }
  const avg = pool.reduce((a, c) => a + dist(s + c), 0) / pool.length
  return avg < d
    ? { action: 'draw', reason: `합이 ${s}이고 남은 카드를 보니 더 뽑는 게 유리해요.` }
    : { action: 'stop', reason: `합이 ${s}인데 남은 카드가 커서 뽑으면 ${TARGET}을 넘길 것 같아요. 멈출게요.` }
}

// ────────────────────────── 상태 관리 ──────────────────────────
function initialState() {
  return {
    phase:      'intro',      // intro | rps | play | roundEnd | final
    round:      1,
    wins:       { me: 0, cpu: 0, draw: 0 },
    history:    [],           // { round, starter, me: [], cpu: [], winner }
    rpsWinner:  null,         // 처음 가위바위보 승자 (2·4라운드 선)
    rpsPick:    null,         // { me, cpu, result }
    rpsReason:  'start',      // start | round5
    cpuRow:     makeRow(),    // 컴퓨터 앞 카드 → 내가 뒤집음
    myRow:      makeRow(),    // 내 앞 카드 → 컴퓨터가 뒤집음
    starter:    'me',
    turn:       'me',
    meCards:    [],
    cpuCards:   [],
    meDone:     false,
    cpuDone:    false,
    roundWinner: null,
    msg:        '',
    lastFlip:   null,         // { who, value }
  }
}

function afterAction(s) {
  const meCan  = canDraw(s.meCards,  s.meDone,  s.cpuRow)
  const cpuCan = canDraw(s.cpuCards, s.cpuDone, s.myRow)
  if (!meCan && !cpuCan) return endRound(s)
  const next = other(s.turn)
  const nextCan = next === 'me' ? meCan : cpuCan
  return { ...s, turn: nextCan ? next : s.turn }
}

function endRound(s) {
  const winner = judge(s.meCards, s.cpuCards)
  const wins   = { ...s.wins, [winner]: s.wins[winner] + 1 }
  const settle = row => row.map(c => (c.state === 'up' ? { ...c, state: 'used' } : c))
  return {
    ...s,
    phase: 'roundEnd',
    roundWinner: winner,
    wins,
    history: [...s.history, { round: s.round, starter: s.starter, me: s.meCards, cpu: s.cpuCards, winner }],
    cpuRow: settle(s.cpuRow),
    myRow:  settle(s.myRow),
  }
}

function beginRound(s, starter) {
  const next = {
    ...s,
    phase: 'play',
    starter,
    turn: starter,
    meCards: [], cpuCards: [],
    meDone: false, cpuDone: false,
    roundWinner: null,
    lastFlip: null,
    msg: starter === 'me' ? '내가 먼저! 컴퓨터 앞 카드를 한 장 뒤집어요.' : '컴퓨터가 먼저 뒤집어요.',
  }
  // 카드가 바닥난 쪽은 뽑을 수 없다 → 상대에게 차례를 넘기고, 둘 다 못 뽑으면 바로 판정
  const meCan  = canDraw([], false, next.cpuRow)
  const cpuCan = canDraw([], false, next.myRow)
  if (!meCan && !cpuCan) return endRound(next)
  if (starter === 'me' && !meCan)  return { ...next, turn: 'cpu', msg: '내 카드가 다 떨어졌어요! 컴퓨터만 뽑아요.' }
  if (starter === 'cpu' && !cpuCan) return { ...next, turn: 'me', msg: '컴퓨터 카드가 다 떨어졌어요! 나만 뽑아요.' }
  return next
}

function reducer(s, a) {
  switch (a.type) {
    case 'START':
      return { ...s, phase: 'rps', rpsReason: 'start', rpsPick: null }

    case 'RPS_PICK': {
      const cpu = a.cpu
      const result = a.pick === cpu ? 'draw' : RPS_BEATS[a.pick] === cpu ? 'me' : 'cpu'
      const next = { ...s, rpsPick: { me: a.pick, cpu, result } }
      if (result === 'draw') return next
      if (s.rpsReason === 'start') next.rpsWinner = result
      return next
    }

    case 'BEGIN_ROUND': {
      // 가위바위보에서 진 사람이 먼저 시작
      const loser = other(s.rpsPick.result)
      return beginRound(s, loser)
    }

    case 'FLIP_ME': {
      if (s.phase !== 'play' || s.turn !== 'me') return s
      const card = s.cpuRow[a.idx]
      if (!card || card.state !== 'down' || s.meCards.length >= MAX_DRAW) return s
      const cpuRow = s.cpuRow.map((c, i) => (i === a.idx ? { ...c, state: 'up' } : c))
      const meCards = [...s.meCards, card.value]
      return afterAction({
        ...s, cpuRow, meCards,
        lastFlip: { who: 'me', value: card.value },
        msg: `${card.value}을(를) 뽑았어요. 합 ${sum(meCards)}`,
      })
    }

    case 'STOP_ME': {
      if (s.phase !== 'play' || s.turn !== 'me' || s.meCards.length === 0) return s
      return afterAction({ ...s, meDone: true, msg: `합 ${sum(s.meCards)}에서 멈췄어요.` })
    }

    case 'CPU_ACT': {
      if (s.phase !== 'play' || s.turn !== 'cpu') return s
      if (a.action === 'stop') {
        return afterAction({ ...s, cpuDone: true, msg: `🤖 ${a.reason}` })
      }
      const card = s.myRow[a.idx]
      if (!card || card.state !== 'down') return afterAction({ ...s, cpuDone: true })
      const myRow = s.myRow.map((c, i) => (i === a.idx ? { ...c, state: 'up' } : c))
      const cpuCards = [...s.cpuCards, card.value]
      return afterAction({
        ...s, myRow, cpuCards,
        lastFlip: { who: 'cpu', value: card.value },
        msg: `🤖 ${a.reason} → ${card.value}! 합 ${sum(cpuCards)}`,
      })
    }

    case 'NEXT_ROUND': {
      if (s.round >= ROUNDS) return { ...s, phase: 'final' }
      const round = s.round + 1
      const base  = { ...s, round }
      if (round === 2 || round === 4) return beginRound(base, s.rpsWinner)
      if (round === 3)                return beginRound(base, other(s.rpsWinner))
      // 5라운드: 4라운드 승자가 먼저. 무승부면 가위바위보 → 진 사람
      const r4 = s.history[s.history.length - 1]
      if (r4.winner === 'draw') return { ...base, phase: 'rps', rpsReason: 'round5', rpsPick: null }
      return beginRound(base, r4.winner)
    }

    default:
      return s
  }
}

// ────────────────────────── 카드 UI ──────────────────────────
function Card({ card, mine, clickable, onClick, flash }) {
  const base = 'relative w-12 h-16 sm:w-14 sm:h-20 rounded-xl border-2 flex items-center justify-center font-black text-2xl sm:text-3xl transition-all duration-200 select-none'
  if (card.state === 'down') {
    return (
      <button
        type="button"
        disabled={!clickable}
        onClick={onClick}
        className={`${base} border-blue-800 bg-gradient-to-br from-blue-600 to-indigo-800 text-white/80
          ${clickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:ring-4 hover:ring-carnival-yellow' : 'cursor-default opacity-90'}`}
        aria-label="뒷면 카드"
      >
        <span className="text-lg">✦</span>
      </button>
    )
  }
  if (card.state === 'up') {
    return (
      <div className={`${base} bg-white ${mine ? 'border-carnival-coral text-carnival-coral' : 'border-carnival-sky text-teal-600'} ${flash ? 'animate-pop ring-4 ring-carnival-yellow' : ''}`}>
        {card.value}
        <span className={`absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 rounded-full text-white ${mine ? 'bg-carnival-coral' : 'bg-carnival-sky'}`}>
          {mine ? '나' : '컴'}
        </span>
      </div>
    )
  }
  // used
  return (
    <div className={`${base} border-dashed border-gray-300 bg-gray-50 text-gray-300`}>
      {card.value}
    </div>
  )
}

function HandCards({ cards, color }) {
  if (cards.length === 0) return <span className="text-carnival-navy/30 text-sm">아직 없음</span>
  return (
    <div className="flex gap-1.5">
      {cards.map((v, i) => (
        <span key={i} className={`w-9 h-11 rounded-lg border-2 ${color} bg-white flex items-center justify-center text-xl font-black`}>
          {v}
        </span>
      ))}
    </div>
  )
}

function RemainChips({ row, warn }) {
  const vals = downValues(row)
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {warn && <span className="text-[11px] font-bold text-carnival-orange mr-1">⚠️ 한 장 더 뽑으면 나중 라운드에 카드가 모자라요</span>}
      <span className="text-[11px] text-carnival-navy/40 mr-1">남은 숫자</span>
      {vals.length === 0
        ? <span className="text-[11px] text-carnival-navy/30">없음</span>
        : vals.map(v => (
          <span key={v} className="w-5 h-5 rounded-md bg-carnival-cream text-carnival-navy/70 text-[11px] font-bold flex items-center justify-center">
            {v}
          </span>
        ))}
    </div>
  )
}

const WHO_LABEL = { me: '나', cpu: '컴퓨터', draw: '무승부' }

// ────────────────────────── 메인 컴포넌트 ──────────────────────────
export default function CardTenGame({ activity, onComplete, onExit }) {
  const reward = activity?.cardTenReward ?? 'win'
  const level  = activity?.cardTenAi ?? 'smart'

  const [s, dispatch] = useReducer(reducer, null, initialState)
  const startTimeRef  = useRef(Date.now())
  const completedRef  = useRef(false)
  const sRef = useRef(s); sRef.current = s

  const meActive  = s.phase === 'play' && canDraw(s.meCards,  s.meDone,  s.cpuRow)
  const cpuActive = s.phase === 'play' && canDraw(s.cpuCards, s.cpuDone, s.myRow)

  // 컴퓨터 차례 → 잠시 생각한 뒤 행동
  useEffect(() => {
    if (s.phase !== 'play' || s.turn !== 'cpu') return
    const id = setTimeout(() => {
      const cur = sRef.current
      if (cur.phase !== 'play' || cur.turn !== 'cpu') return
      const pool = downValues(cur.myRow)
      const meStillActive = canDraw(cur.meCards, cur.meDone, cur.cpuRow)
      const { action, reason } = cpuDecide({
        cpuCards: cur.cpuCards, pool, meCards: cur.meCards, meActive: meStillActive, level, round: cur.round,
      })
      let idx = -1
      if (action === 'draw') {
        const downIdx = cur.myRow.map((c, i) => (c.state === 'down' ? i : -1)).filter(i => i >= 0)
        idx = downIdx[Math.floor(Math.random() * downIdx.length)]
      }
      dispatch({ type: 'CPU_ACT', action, idx, reason })
    }, 1100)
    return () => clearTimeout(id)
  }, [s.phase, s.turn, s.meCards.length, s.cpuCards.length, s.meDone, level])

  // 최종 결과 → 플랫폼에 보고
  function finish() {
    if (completedRef.current) return
    completedRef.current = true
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000)
    const won  = s.wins.me > s.wins.cpu
    const tied = s.wins.me === s.wins.cpu
    const scoreRatio = reward === 'play' ? 1 : won ? 1 : tied ? 0.5 : 0
    onComplete({ score: `${s.wins.me}승 ${s.wins.draw}무 ${s.wins.cpu}패`, scoreRatio, completionTime, passed: scoreRatio > 0 })
  }

  // 키보드: Enter = 진행/카드 뒤집기, Space = 그만 뽑기
  useEffect(() => {
    function onKey(e) {
      const cur = sRef.current
      if (e.key === 'Enter') {
        e.preventDefault()
        if (cur.phase === 'intro') dispatch({ type: 'START' })
        else if (cur.phase === 'rps' && cur.rpsPick && cur.rpsPick.result !== 'draw') dispatch({ type: 'BEGIN_ROUND' })
        else if (cur.phase === 'play' && cur.turn === 'me') {
          const downIdx = cur.cpuRow.map((c, i) => (c.state === 'down' ? i : -1)).filter(i => i >= 0)
          if (downIdx.length) dispatch({ type: 'FLIP_ME', idx: downIdx[Math.floor(Math.random() * downIdx.length)] })
        }
        else if (cur.phase === 'roundEnd') dispatch({ type: 'NEXT_ROUND' })
        else if (cur.phase === 'final') finish()
      } else if (e.key === ' ' && cur.phase === 'play' && cur.turn === 'me') {
        e.preventDefault()
        dispatch({ type: 'STOP_ME' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meSum = sum(s.meCards), cpuSum = sum(s.cpuCards)

  // ── 인트로 ──
  if (s.phase === 'intro') {
    return (
      <Shell onExit={onExit}>
        <div className="card text-center space-y-4">
          <div className="text-5xl">🃏</div>
          <h2 className="text-2xl font-black text-carnival-navy">10 만들기 카드 대결</h2>
          <p className="text-carnival-navy/60 text-sm">컴퓨터와 5라운드 승부! 뽑은 카드의 합을 10에 가장 가깝게 만들어요.</p>
          <ul className="text-left text-sm text-carnival-navy/80 space-y-1.5 bg-carnival-cream rounded-2xl p-4">
            <li>1️⃣ 서로 0~9 카드 10장을 뒷면으로 펼쳐요. <strong>상대편 앞 카드</strong>를 뒤집어 내 카드로 가져와요.</li>
            <li>2️⃣ 한 장씩 번갈아 <strong>최대 3장</strong>까지. 언제든 그만 뽑을 수 있어요.</li>
            <li>3️⃣ 합이 <strong>10에 가까운</strong> 사람이 이겨요. 차가 같으면 카드를 많이 뽑은 쪽이 승리!</li>
            <li>4️⃣ 쓴 카드는 다시 안 써요. <strong>남은 숫자</strong>를 보고 뽑을지 말지 생각해요.</li>
          </ul>
          <button onClick={() => dispatch({ type: 'START' })} className="btn-primary w-full text-lg">
            가위바위보로 순서 정하기 (Enter)
          </button>
          <p className="text-xs text-carnival-navy/40">
            {reward === 'win' ? '최종 승리하면 포인트 지급! (무승부는 절반)' : '5라운드를 끝까지 하면 포인트 지급!'}
          </p>
        </div>
      </Shell>
    )
  }

  // ── 가위바위보 ──
  if (s.phase === 'rps') {
    const p = s.rpsPick
    return (
      <Shell onExit={onExit} round={s.round} wins={s.wins}>
        <div className="card text-center space-y-4">
          <h2 className="text-xl font-black text-carnival-navy">
            ✊✌️✋ 가위바위보
            <span className="block text-sm font-medium text-carnival-navy/50 mt-1">
              {s.rpsReason === 'start'
                ? '진 사람이 1·3라운드, 이긴 사람이 2·4라운드를 먼저 시작해요.'
                : '4라운드가 무승부! 가위바위보에서 진 사람이 5라운드를 먼저 시작해요.'}
            </span>
          </h2>
          <div className="flex justify-center gap-3">
            {RPS.map(r => (
              <button key={r.key}
                onClick={() => dispatch({ type: 'RPS_PICK', pick: r.key, cpu: RPS[Math.floor(Math.random() * 3)].key })}
                disabled={p && p.result !== 'draw'}
                className={`w-24 h-24 rounded-2xl border-2 text-4xl flex flex-col items-center justify-center gap-1 transition-all
                  ${p?.me === r.key ? 'border-carnival-coral bg-red-50' : 'border-gray-200 bg-white hover:border-carnival-purple hover:scale-105'}
                  disabled:hover:scale-100`}>
                {r.emoji}<span className="text-xs font-bold text-carnival-navy/60">{r.label}</span>
              </button>
            ))}
          </div>
          {p && (
            <div className="space-y-2">
              <p className="text-lg font-bold">
                나 {RPS.find(r => r.key === p.me).emoji} vs {RPS.find(r => r.key === p.cpu).emoji} 컴퓨터
              </p>
              {p.result === 'draw'
                ? <p className="text-carnival-orange font-black text-xl animate-bounce">비겼어요! 다시!</p>
                : (
                  <>
                    <p className="text-xl font-black text-carnival-navy">
                      {p.result === 'me' ? '내가 이겼어요 → 컴퓨터가 먼저 시작' : '내가 졌어요 → 내가 먼저 시작'}
                    </p>
                    <button onClick={() => dispatch({ type: 'BEGIN_ROUND' })} className="btn-primary w-full text-lg">
                      {s.round}라운드 시작 (Enter)
                    </button>
                  </>
                )}
            </div>
          )}
        </div>
      </Shell>
    )
  }

  // ── 최종 결과 ──
  if (s.phase === 'final') {
    const won = s.wins.me > s.wins.cpu, tied = s.wins.me === s.wins.cpu
    return (
      <Shell onExit={onExit} round={s.round} wins={s.wins}>
        <div className="card text-center space-y-4">
          <div className="text-5xl">{won ? '🏆' : tied ? '🤝' : '🤖'}</div>
          <h2 className="text-2xl font-black text-carnival-navy">
            {won ? '최종 승리!' : tied ? '최종 무승부!' : '아쉽게 졌어요'}
          </h2>
          <p className="text-3xl font-black">
            <span className="text-carnival-coral">{s.wins.me}</span>
            <span className="text-carnival-navy/40 text-xl mx-2">승 · {s.wins.draw}무 ·</span>
            <span className="text-teal-600">{s.wins.cpu}</span>
            <span className="text-carnival-navy/40 text-xl ml-2">패</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-carnival-navy/50">
                  <th className="py-1">라운드</th><th>차례</th><th>내 카드</th><th>컴퓨터 카드</th><th>결과</th>
                </tr>
              </thead>
              <tbody>
                {s.history.map(h => (
                  <tr key={h.round} className="border-t border-gray-100">
                    <td className="py-1.5 font-bold">{h.round}</td>
                    <td>{h.starter === 'me' ? '선' : '후'}</td>
                    <td className="text-carnival-coral font-bold">{h.me.join(' + ')} = {sum(h.me)}</td>
                    <td className="text-teal-600 font-bold">{h.cpu.join(' + ')} = {sum(h.cpu)}</td>
                    <td className="font-black">{h.winner === 'me' ? '승' : h.winner === 'cpu' ? '패' : '무'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={finish} className="btn-primary w-full text-lg">완료 (Enter)</button>
        </div>
      </Shell>
    )
  }

  // ── 플레이 / 라운드 결과 ──
  const myTurn = s.phase === 'play' && s.turn === 'me'
  return (
    <Shell onExit={onExit} round={s.round} wins={s.wins}>
      {/* 컴퓨터 쪽 */}
      <div className={`card py-3 px-4 mb-3 transition-all ${s.turn === 'cpu' && s.phase === 'play' ? 'ring-4 ring-carnival-sky/60' : ''}`}>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-black text-teal-600">🤖 컴퓨터가 뽑은 카드</span>
            <HandCards cards={s.cpuCards} color="border-carnival-sky text-teal-600" />
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-teal-600">합 {cpuSum}</span>
            <span className="text-sm text-carnival-navy/50 ml-2">(10과 차 {dist(cpuSum)})</span>
            {s.phase === 'play' && !cpuActive && s.cpuCards.length > 0 && (
              <span className="ml-2 badge bg-gray-100 text-carnival-navy/60">멈춤</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <span className="text-xs font-bold text-carnival-navy/50">
            컴퓨터 앞에 펼친 카드 — <span className="text-carnival-coral">내가 여기서 뒤집어요</span>
          </span>
          <RemainChips row={s.cpuRow} warn={s.phase === 'play' && downValues(s.cpuRow).length - 1 < ROUNDS - s.round} />
        </div>
        <div className="flex gap-1.5 sm:gap-2 justify-center">
          {s.cpuRow.map((c, i) => (
            <Card key={i} card={c} mine
              clickable={myTurn && c.state === 'down' && s.meCards.length < MAX_DRAW}
              onClick={() => dispatch({ type: 'FLIP_ME', idx: i })}
              flash={s.lastFlip?.who === 'me' && c.state === 'up' && c.value === s.lastFlip.value}
            />
          ))}
        </div>
      </div>

      {/* 메시지 */}
      <div className="text-center min-h-[28px] mb-3">
        <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${s.turn === 'me' ? 'bg-red-50 text-carnival-coral' : 'bg-teal-50 text-teal-700'}`}>
          {s.msg}
        </span>
      </div>

      {/* 내 쪽 */}
      <div className={`card py-3 px-4 transition-all ${myTurn ? 'ring-4 ring-carnival-coral/60' : ''}`}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <span className="text-xs font-bold text-carnival-navy/50">
            내 앞에 펼친 카드 — <span className="text-teal-600">컴퓨터가 여기서 뒤집어요</span>
          </span>
          <RemainChips row={s.myRow} />
        </div>
        <div className="flex gap-1.5 sm:gap-2 justify-center mb-3">
          {s.myRow.map((c, i) => (
            <Card key={i} card={c} mine={false} clickable={false}
              flash={s.lastFlip?.who === 'cpu' && c.state === 'up' && c.value === s.lastFlip.value}
            />
          ))}
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-black text-carnival-coral">🙋 내가 뽑은 카드</span>
            <HandCards cards={s.meCards} color="border-carnival-coral text-carnival-coral" />
            <span className="text-2xl font-black text-carnival-coral">합 {meSum}</span>
            <span className="text-sm text-carnival-navy/50">(10과 차 {dist(meSum)})</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const downIdx = s.cpuRow.map((c, i) => (c.state === 'down' ? i : -1)).filter(i => i >= 0)
                if (downIdx.length) dispatch({ type: 'FLIP_ME', idx: downIdx[Math.floor(Math.random() * downIdx.length)] })
              }}
              disabled={!myTurn || !meActive}
              className="btn-primary py-2 px-4 text-sm disabled:opacity-40 disabled:hover:scale-100">
              🃏 카드 뒤집기 (Enter)
            </button>
            <button
              onClick={() => dispatch({ type: 'STOP_ME' })}
              disabled={!myTurn || s.meCards.length === 0}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-40 disabled:hover:scale-100">
              ✋ 그만 뽑기 (Space)
            </button>
          </div>
        </div>
      </div>

      {/* 라운드 결과 오버레이 */}
      {s.phase === 'roundEnd' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="card w-full max-w-sm text-center space-y-3 animate-pop">
            <p className="text-sm font-bold text-carnival-navy/50">{s.round}라운드 결과</p>
            <div className="text-4xl">{s.roundWinner === 'me' ? '🎉' : s.roundWinner === 'cpu' ? '🤖' : '🤝'}</div>
            <h3 className="text-2xl font-black text-carnival-navy">
              {s.roundWinner === 'me' ? '내가 이겼어요!' : s.roundWinner === 'cpu' ? '컴퓨터가 이겼어요' : '무승부!'}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-red-50 rounded-xl p-2">
                <p className="text-carnival-coral font-bold">나</p>
                <p className="font-black text-xl">{s.meCards.join('+') || '-'} = {meSum}</p>
                <p className="text-carnival-navy/50">10과 차 {dist(meSum)} · {s.meCards.length}장</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-2">
                <p className="text-teal-600 font-bold">컴퓨터</p>
                <p className="font-black text-xl">{s.cpuCards.join('+') || '-'} = {cpuSum}</p>
                <p className="text-carnival-navy/50">10과 차 {dist(cpuSum)} · {s.cpuCards.length}장</p>
              </div>
            </div>
            {dist(meSum) === dist(cpuSum) && s.roundWinner !== 'draw' && (
              <p className="text-xs text-carnival-orange font-bold">10과의 차가 같아서 카드를 많이 뽑은 쪽이 이겼어요!</p>
            )}
            <p className="text-sm font-bold text-carnival-navy/60">현재 {s.wins.me}승 {s.wins.draw}무 {s.wins.cpu}패</p>
            <button onClick={() => dispatch({ type: 'NEXT_ROUND' })} className="btn-primary w-full">
              {s.round >= ROUNDS ? '최종 결과 보기 (Enter)' : `${s.round + 1}라운드로 (Enter)`}
            </button>
          </div>
        </div>
      )}
    </Shell>
  )
}

// 테스트용 내보내기 (시뮬레이션 검증)
export { reducer, initialState, cpuDecide, judge, canDraw, downValues }

function Shell({ children, onExit, round, wins }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-black text-carnival-navy">🃏 10 만들기 카드 대결</h1>
          <div className="flex items-center gap-4">
            {round && (
              <span className="text-sm font-bold text-carnival-navy/60">
                {round} / {ROUNDS} 라운드 ·
                <span className="text-carnival-coral ml-1">나 {wins.me}</span>
                <span className="mx-1">:</span>
                <span className="text-teal-600">{wins.cpu} 컴퓨터</span>
                {wins.draw > 0 && <span className="ml-1 text-carnival-navy/40">(무 {wins.draw})</span>}
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
